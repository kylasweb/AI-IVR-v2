/**
 * Video IVR Call End API
 * Handles ending active video calls with proper cleanup
 */

import { NextRequest, NextResponse } from 'next/server';

interface EndCallRequest {
    reason?: string;
    outcome?: 'completed' | 'transferred' | 'abandoned' | 'error';
    notes?: string;
    satisfaction_score?: number;
    recording_action?: 'save' | 'delete' | 'archive';
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ callId: string }> }
) {
    try {
        const { callId } = await params;
        const body: EndCallRequest = await request.json().catch(() => ({}));

        if (!callId) {
            return NextResponse.json(
                { success: false, error: 'callId is required' },
                { status: 400 }
            );
        }

        // Simulate ending the call
        const endTime = new Date();
        const callDuration = Math.floor(Math.random() * 600) + 60; // 1-11 minutes

        const result = {
            success: true,
            call_id: callId,
            status: 'ended',
            end_time: endTime.toISOString(),
            duration_seconds: callDuration,
            outcome: body.outcome || 'completed',
            reason: body.reason || 'Call ended by user',
            cleanup: {
                webrtc_disconnected: true,
                session_closed: true,
                resources_released: true
            },
            recording: body.recording_action ? {
                action: body.recording_action,
                status: 'processing',
                estimated_url: body.recording_action === 'save'
                    ? `/api/video-ivr/recordings/${callId}`
                    : null
            } : null,
            analytics: {
                video_enabled_duration: Math.floor(callDuration * 0.8),
                audio_only_duration: Math.floor(callDuration * 0.2),
                ai_interactions: Math.floor(Math.random() * 10) + 1,
                screen_shares: Math.floor(Math.random() * 3),
                resolution_changes: Math.floor(Math.random() * 5)
            },
            satisfaction: body.satisfaction_score ? {
                score: body.satisfaction_score,
                collected: true
            } : {
                score: null,
                collected: false
            }
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error ending video call:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to end video call' },
            { status: 500 }
        );
    }
}

// GET endpoint to check call status
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ callId: string }> }
) {
    try {
        const { callId } = await params;

        if (!callId) {
            return NextResponse.json(
                { success: false, error: 'callId is required' },
                { status: 400 }
            );
        }

        // Return mock call status
        const statuses = ['active', 'ended', 'on_hold', 'transferring'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return NextResponse.json({
            success: true,
            call_id: callId,
            status: randomStatus,
            duration_seconds: Math.floor(Math.random() * 300) + 30,
            participants: {
                caller: {
                    id: `caller_${callId}`,
                    video_enabled: Math.random() > 0.3,
                    audio_enabled: true,
                    connection_quality: 'good'
                },
                agent: {
                    id: `agent_${callId}`,
                    type: Math.random() > 0.5 ? 'ai' : 'human',
                    video_enabled: true,
                    audio_enabled: true,
                    connection_quality: 'excellent'
                }
            },
            workflow: {
                current_step: 'support_interaction',
                steps_completed: Math.floor(Math.random() * 5) + 1,
                ai_handoffs: Math.floor(Math.random() * 2)
            },
            metadata: {
                started_at: new Date(Date.now() - Math.random() * 300000).toISOString(),
                last_activity: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error getting call status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get call status' },
            { status: 500 }
        );
    }
}
