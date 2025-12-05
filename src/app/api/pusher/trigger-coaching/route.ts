/**
 * Pusher Server-Side Trigger for Agent Coaching
 * POST /api/pusher/trigger-coaching
 * Triggers coaching events to agent's Pusher channel
 */

import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';

// Initialize Pusher server instance
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID || '1234567',
    key: process.env.PUSHER_KEY || '598aeab4b16c7e656997',
    secret: process.env.PUSHER_SECRET || 'your-pusher-secret',
    cluster: process.env.PUSHER_CLUSTER || 'ap2',
    useTLS: true,
});

interface CoachingTriggerRequest {
    agentId: string;
    callId?: string;
    eventType: 'script_suggestion' | 'sentiment_update' | 'cadence_warning' | 'compliance_alert' | 'warning';
    data: Record<string, any>;
}

export async function POST(request: NextRequest) {
    try {
        const body: CoachingTriggerRequest = await request.json();
        const { agentId, callId, eventType, data } = body;

        if (!agentId || !eventType) {
            return NextResponse.json(
                { success: false, error: 'agentId and eventType required' },
                { status: 400 }
            );
        }

        // Trigger event on agent's coaching channel
        const channelName = `agent-coaching-${agentId}`;

        await pusher.trigger(channelName, eventType, {
            ...data,
            callId,
            timestamp: new Date().toISOString(),
        });

        // Also trigger on call-specific channel if callId provided
        if (callId) {
            await pusher.trigger(`call-${callId}`, 'coaching_event', {
                eventType,
                ...data,
                timestamp: new Date().toISOString(),
            });
        }

        console.log(`[Pusher] Triggered ${eventType} on ${channelName}:`, data);

        return NextResponse.json({
            success: true,
            message: 'Coaching event triggered',
            data: {
                channel: channelName,
                eventType,
                timestamp: new Date().toISOString(),
            },
        });

    } catch (error) {
        console.error('[Pusher] Trigger error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to trigger coaching event' },
            { status: 500 }
        );
    }
}

// Batch trigger multiple events
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { events } = body as { events: CoachingTriggerRequest[] };

        if (!events || !Array.isArray(events)) {
            return NextResponse.json(
                { success: false, error: 'events array required' },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            events.map(async (event) => {
                const channelName = `agent-coaching-${event.agentId}`;
                try {
                    await pusher.trigger(channelName, event.eventType, {
                        ...event.data,
                        callId: event.callId,
                        timestamp: new Date().toISOString(),
                    });
                    return { agentId: event.agentId, success: true };
                } catch (err) {
                    return { agentId: event.agentId, success: false, error: String(err) };
                }
            })
        );

        return NextResponse.json({
            success: true,
            results,
        });

    } catch (error) {
        console.error('[Pusher] Batch trigger error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to trigger batch events' },
            { status: 500 }
        );
    }
}
