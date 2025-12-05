import { NextRequest, NextResponse } from 'next/server';

/**
 * WhatsApp Business API - Send messages, templates, and manage conversations
 */

// Message types
interface WhatsAppTextMessage {
    type: 'text';
    to: string;
    text: { body: string };
}

interface WhatsAppTemplateMessage {
    type: 'template';
    to: string;
    template: {
        name: string;
        language: { code: string };
        components?: Array<{
            type: 'header' | 'body' | 'button';
            parameters: Array<{ type: string; text?: string; image?: { link: string } }>;
        }>;
    };
}

interface WhatsAppInteractiveMessage {
    type: 'interactive';
    to: string;
    interactive: {
        type: 'button' | 'list' | 'product' | 'product_list';
        header?: { type: 'text' | 'image'; text?: string; image?: { link: string } };
        body: { text: string };
        footer?: { text: string };
        action: {
            buttons?: Array<{ type: 'reply'; reply: { id: string; title: string } }>;
            button?: string;
            sections?: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>;
        };
    };
}

interface WhatsAppMediaMessage {
    type: 'image' | 'video' | 'audio' | 'document';
    to: string;
    [key: string]: any;
}

// Mock data for templates
const mockTemplates = [
    {
        id: 'template_1',
        name: 'appointment_reminder',
        language: 'en',
        status: 'approved',
        category: 'UTILITY',
        content: 'Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Reply YES to confirm.',
        variables: ['customer_name', 'date', 'time']
    },
    {
        id: 'template_2',
        name: 'booking_confirmation_ml',
        language: 'ml',
        status: 'approved',
        category: 'UTILITY',
        content: 'നന്ദി {{1}}! നിങ്ങളുടെ ബുക്കിംഗ് സ്ഥിരീകരിച്ചു. ബുക്കിംഗ് ID: {{2}}',
        variables: ['customer_name', 'booking_id']
    },
    {
        id: 'template_3',
        name: 'payment_receipt',
        language: 'en',
        status: 'approved',
        category: 'TRANSACTIONAL',
        content: 'Payment received! Amount: ₹{{1}}. Transaction ID: {{2}}. Thank you for your business.',
        variables: ['amount', 'transaction_id']
    },
    {
        id: 'template_4',
        name: 'otp_verification',
        language: 'en',
        status: 'approved',
        category: 'AUTHENTICATION',
        content: 'Your OTP is {{1}}. Valid for 10 minutes. Do not share with anyone.',
        variables: ['otp_code']
    }
];

// Mock conversation history
const mockConversations: Record<string, any[]> = {};

/**
 * GET /api/whatsapp
 * Get WhatsApp configuration, templates, or conversation history
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const phone = searchParams.get('phone');

        // Get templates
        if (action === 'templates') {
            const category = searchParams.get('category');
            const language = searchParams.get('language');

            let templates = [...mockTemplates];

            if (category) {
                templates = templates.filter(t => t.category === category);
            }
            if (language) {
                templates = templates.filter(t => t.language === language);
            }

            return NextResponse.json({
                success: true,
                templates,
                total: templates.length
            });
        }

        // Get conversation history
        if (action === 'conversation' && phone) {
            const history = mockConversations[phone] || [];
            return NextResponse.json({
                success: true,
                phone,
                messages: history,
                total: history.length
            });
        }

        // Get configuration/status
        if (action === 'config' || action === 'status') {
            return NextResponse.json({
                success: true,
                config: {
                    business_account_id: 'WABA_123456789',
                    phone_number_id: 'PN_987654321',
                    display_phone: '+91 98765 43210',
                    business_name: 'FairGo IVR',
                    status: 'connected',
                    webhook_url: '/api/whatsapp/webhook',
                    features: {
                        templates: true,
                        interactive: true,
                        media: true,
                        catalog: true,
                        broadcast: true
                    },
                    rate_limits: {
                        messages_per_second: 80,
                        messages_per_day: 100000,
                        templates_per_day: 250000
                    }
                },
                health: {
                    api_status: 'healthy',
                    webhook_status: 'active',
                    last_message_sent: new Date().toISOString(),
                    pending_queue: Math.floor(Math.random() * 10)
                }
            });
        }

        // Default: return API info
        return NextResponse.json({
            success: true,
            api: 'WhatsApp Business API',
            version: '1.0.0',
            endpoints: {
                send_message: 'POST /api/whatsapp',
                send_template: 'POST /api/whatsapp?action=template',
                send_interactive: 'POST /api/whatsapp?action=interactive',
                send_media: 'POST /api/whatsapp?action=media',
                broadcast: 'POST /api/whatsapp?action=broadcast',
                get_templates: 'GET /api/whatsapp?action=templates',
                get_conversation: 'GET /api/whatsapp?action=conversation&phone=+91...',
                get_config: 'GET /api/whatsapp?action=config'
            }
        });

    } catch (error) {
        console.error('WhatsApp API GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/whatsapp
 * Send WhatsApp messages, templates, interactive messages, or media
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'message';
        const body = await request.json();

        // Generate message ID
        const messageId = `wamid_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Send text message
        if (action === 'message') {
            const { to, text, preview_url = false } = body;

            if (!to || !text) {
                return NextResponse.json(
                    { success: false, error: 'Missing required fields: to, text' },
                    { status: 400 }
                );
            }

            // Store in conversation history
            if (!mockConversations[to]) mockConversations[to] = [];
            mockConversations[to].push({
                id: messageId,
                type: 'text',
                direction: 'outbound',
                text: { body: text },
                timestamp: new Date().toISOString(),
                status: 'sent'
            });

            return NextResponse.json({
                success: true,
                message_id: messageId,
                to,
                type: 'text',
                status: 'sent',
                timestamp: new Date().toISOString()
            });
        }

        // Send template message
        if (action === 'template') {
            const { to, template_name, language = 'en', components = [] } = body;

            if (!to || !template_name) {
                return NextResponse.json(
                    { success: false, error: 'Missing required fields: to, template_name' },
                    { status: 400 }
                );
            }

            const template = mockTemplates.find(t => t.name === template_name);
            if (!template) {
                return NextResponse.json(
                    { success: false, error: `Template '${template_name}' not found` },
                    { status: 404 }
                );
            }

            // Store in conversation history
            if (!mockConversations[to]) mockConversations[to] = [];
            mockConversations[to].push({
                id: messageId,
                type: 'template',
                direction: 'outbound',
                template: { name: template_name, language },
                timestamp: new Date().toISOString(),
                status: 'sent'
            });

            return NextResponse.json({
                success: true,
                message_id: messageId,
                to,
                type: 'template',
                template: {
                    name: template_name,
                    language,
                    status: template.status
                },
                status: 'sent',
                timestamp: new Date().toISOString()
            });
        }

        // Send interactive message
        if (action === 'interactive') {
            const { to, interactive_type, header, body: messageBody, footer, buttons, sections } = body;

            if (!to || !interactive_type || !messageBody) {
                return NextResponse.json(
                    { success: false, error: 'Missing required fields: to, interactive_type, body' },
                    { status: 400 }
                );
            }

            const interactiveMessage: any = {
                id: messageId,
                type: 'interactive',
                direction: 'outbound',
                interactive: {
                    type: interactive_type,
                    body: { text: messageBody }
                },
                timestamp: new Date().toISOString(),
                status: 'sent'
            };

            if (header) interactiveMessage.interactive.header = header;
            if (footer) interactiveMessage.interactive.footer = { text: footer };

            if (interactive_type === 'button' && buttons) {
                interactiveMessage.interactive.action = {
                    buttons: buttons.map((b: any, i: number) => ({
                        type: 'reply',
                        reply: { id: `btn_${i}`, title: b.title || b }
                    }))
                };
            }

            if (interactive_type === 'list' && sections) {
                interactiveMessage.interactive.action = { sections };
            }

            // Store in conversation history
            if (!mockConversations[to]) mockConversations[to] = [];
            mockConversations[to].push(interactiveMessage);

            return NextResponse.json({
                success: true,
                message_id: messageId,
                to,
                type: 'interactive',
                interactive_type,
                status: 'sent',
                timestamp: new Date().toISOString()
            });
        }

        // Send media message
        if (action === 'media') {
            const { to, media_type, media_url, caption } = body;

            if (!to || !media_type || !media_url) {
                return NextResponse.json(
                    { success: false, error: 'Missing required fields: to, media_type, media_url' },
                    { status: 400 }
                );
            }

            // Store in conversation history
            if (!mockConversations[to]) mockConversations[to] = [];
            mockConversations[to].push({
                id: messageId,
                type: media_type,
                direction: 'outbound',
                [media_type]: { link: media_url, caption },
                timestamp: new Date().toISOString(),
                status: 'sent'
            });

            return NextResponse.json({
                success: true,
                message_id: messageId,
                to,
                type: media_type,
                media_url,
                caption,
                status: 'sent',
                timestamp: new Date().toISOString()
            });
        }

        // Broadcast to multiple recipients
        if (action === 'broadcast') {
            const { recipients, message_type = 'text', content } = body;

            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'Missing or invalid recipients array' },
                    { status: 400 }
                );
            }

            const results = recipients.map((phone: string) => {
                const msgId = `wamid_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                // Store in conversation history
                if (!mockConversations[phone]) mockConversations[phone] = [];
                mockConversations[phone].push({
                    id: msgId,
                    type: message_type,
                    direction: 'outbound',
                    content,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                    broadcast: true
                });

                return {
                    phone,
                    message_id: msgId,
                    status: Math.random() > 0.05 ? 'sent' : 'failed' // 95% success rate
                };
            });

            const successful = results.filter((r: any) => r.status === 'sent').length;
            const failed = results.filter((r: any) => r.status === 'failed').length;

            return NextResponse.json({
                success: true,
                broadcast_id: `bc_${Date.now()}`,
                total_recipients: recipients.length,
                successful,
                failed,
                results,
                timestamp: new Date().toISOString()
            });
        }

        return NextResponse.json(
            { success: false, error: `Unknown action: ${action}` },
            { status: 400 }
        );

    } catch (error) {
        console.error('WhatsApp API POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
