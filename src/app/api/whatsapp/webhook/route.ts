import { NextRequest, NextResponse } from 'next/server';

/**
 * WhatsApp Webhook Handler
 * Receives incoming messages and status updates from WhatsApp Business API
 */

// Webhook verification token (should be in env)
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'fairgo_whatsapp_webhook_token';

// Event handler callback type
type EventCallback = (event: Record<string, unknown>) => Promise<void> | void;

// Event handlers storage (in production, use Redis/database)
const eventSubscribers: Map<string, EventCallback[]> = new Map();

/**
 * GET /api/whatsapp/webhook
 * Webhook verification endpoint for WhatsApp Business API
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('hub.mode');
        const token = searchParams.get('hub.verify_token');
        const challenge = searchParams.get('hub.challenge');

        // Verify webhook
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WhatsApp webhook verified');
            return new Response(challenge, { status: 200 });
        }

        return NextResponse.json(
            { success: false, error: 'Webhook verification failed' },
            { status: 403 }
        );

    } catch (error) {
        console.error('WhatsApp webhook verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/whatsapp/webhook
 * Receive incoming messages and status updates
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Extract entry data
        const entry = body.entry?.[0];
        if (!entry) {
            return NextResponse.json({ success: true }); // ACK empty webhook
        }

        const changes = entry.changes?.[0];
        const value = changes?.value;

        if (!value) {
            return NextResponse.json({ success: true });
        }

        const events: any[] = [];

        // Process incoming messages
        if (value.messages) {
            for (const message of value.messages) {
                const event = {
                    type: 'whatsapp_message_received',
                    timestamp: new Date().toISOString(),
                    data: {
                        message_id: message.id,
                        from: message.from,
                        message_type: message.type,
                        timestamp: message.timestamp,
                        text: message.text?.body,
                        // Handle different message types
                        ...(message.type === 'text' && { text: message.text?.body }),
                        ...(message.type === 'image' && { media: message.image }),
                        ...(message.type === 'video' && { media: message.video }),
                        ...(message.type === 'audio' && { media: message.audio }),
                        ...(message.type === 'document' && { media: message.document }),
                        ...(message.type === 'location' && { location: message.location }),
                        ...(message.type === 'interactive' && {
                            interactive_type: message.interactive?.type,
                            button_reply: message.interactive?.button_reply,
                            list_reply: message.interactive?.list_reply
                        }),
                        ...(message.type === 'button' && { button: message.button }),
                        contact_name: value.contacts?.[0]?.profile?.name
                    }
                };
                events.push(event);

                // Trigger task automations based on message type
                await triggerAutomations(event);
            }
        }

        // Process status updates
        if (value.statuses) {
            for (const status of value.statuses) {
                const event = {
                    type: 'whatsapp_status_update',
                    timestamp: new Date().toISOString(),
                    data: {
                        message_id: status.id,
                        recipient: status.recipient_id,
                        status: status.status, // sent, delivered, read, failed
                        timestamp: status.timestamp,
                        conversation: status.conversation,
                        pricing: status.pricing,
                        errors: status.errors
                    }
                };
                events.push(event);

                // Trigger status-based automations
                await triggerAutomations(event);
            }
        }

        // Log events (in production, store to database)
        if (events.length > 0) {
            console.log('WhatsApp webhook events:', JSON.stringify(events, null, 2));
        }

        return NextResponse.json({
            success: true,
            events_processed: events.length
        });

    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        // Always return 200 to prevent webhook retry storms
        return NextResponse.json({
            success: false,
            error: 'Failed to process webhook'
        });
    }
}

/**
 * Trigger task automations based on WhatsApp events
 */
async function triggerAutomations(event: any) {
    try {
        // Map event types to automation triggers
        const triggerMappings: Record<string, string[]> = {
            'whatsapp_message_received': ['whatsapp_message', 'whatsapp_text'],
            'whatsapp_status_update': ['whatsapp_status'],
            'whatsapp_button_click': ['whatsapp_button_click'],
            'whatsapp_list_selection': ['whatsapp_list_selection'],
            'whatsapp_media_received': ['whatsapp_media_received']
        };

        // Handle interactive responses
        if (event.data?.interactive_type === 'button_reply') {
            event.type = 'whatsapp_button_click';
        } else if (event.data?.interactive_type === 'list_reply') {
            event.type = 'whatsapp_list_selection';
        } else if (['image', 'video', 'audio', 'document'].includes(event.data?.message_type)) {
            event.type = 'whatsapp_media_received';
        }

        const triggers = triggerMappings[event.type] || [];

        // In production, this would query the database for active tasks with matching triggers
        // and execute them via a task execution engine
        console.log(`WhatsApp automation triggers: ${triggers.join(', ')} for event: ${event.type}`);

        // Emit to any registered subscribers
        for (const trigger of triggers) {
            const subscribers = eventSubscribers.get(trigger) || [];
            for (const callback of subscribers) {
                try {
                    await callback(event);
                } catch (err) {
                    console.error(`Error in automation callback for ${trigger}:`, err);
                }
            }
        }

    } catch (error) {
        console.error('Error triggering automations:', error);
    }
}

// Helper to subscribe to events (for SSE/WebSocket connections)
export function subscribeToEvent(eventType: string, callback: EventCallback) {
    const subscribers = eventSubscribers.get(eventType) || [];
    subscribers.push(callback);
    eventSubscribers.set(eventType, subscribers);

    return () => {
        const idx = subscribers.indexOf(callback);
        if (idx > -1) subscribers.splice(idx, 1);
    };
}
