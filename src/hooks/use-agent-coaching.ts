/**
 * Real-Time Agent Coaching Hook
 * Uses Pusher for live coaching events during calls
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import Pusher from 'pusher-js';

// Coaching event types
export interface CoachingEvent {
    id: string;
    type: 'script' | 'warning' | 'cadence' | 'sentiment' | 'compliance';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    displayType: 'notification' | 'modal' | 'badge' | 'flash';
    timestamp: Date;
    dismissed: boolean;
    data?: {
        script?: string;
        scriptCategory?: string;
        triggerWord?: string;
        sentimentScore?: number;
        sentimentTrend?: 'improving' | 'stable' | 'declining';
        cadenceWPM?: number;
        complianceRule?: string;
    };
}

export interface SentimentData {
    score: number;
    label: string;
    trend: 'improving' | 'stable' | 'declining';
    alertLevel: 'normal' | 'warning' | 'critical';
}

export interface AgentCoachingState {
    isConnected: boolean;
    activeCallId: string | null;
    sentiment: SentimentData;
    events: CoachingEvent[];
    cadenceWarning: string | null;
    scriptsShown: number;
    warningsShown: number;
}

interface UseAgentCoachingOptions {
    agentId: string;
    callId?: string;
    onEvent?: (event: CoachingEvent) => void;
    onSentimentChange?: (sentiment: SentimentData) => void;
}

export function useAgentCoaching({
    agentId,
    callId,
    onEvent,
    onSentimentChange
}: UseAgentCoachingOptions) {
    const [state, setState] = useState<AgentCoachingState>({
        isConnected: false,
        activeCallId: callId || null,
        sentiment: {
            score: 0.5,
            label: 'Neutral',
            trend: 'stable',
            alertLevel: 'normal',
        },
        events: [],
        cadenceWarning: null,
        scriptsShown: 0,
        warningsShown: 0,
    });

    const pusherRef = useRef<Pusher | null>(null);
    const channelRef = useRef<any>(null);

    // Initialize Pusher connection
    useEffect(() => {
        const pusher = new Pusher('598aeab4b16c7e656997', {
            cluster: 'ap2',
        });

        pusherRef.current = pusher;

        pusher.connection.bind('connected', () => {
            setState(prev => ({ ...prev, isConnected: true }));
            console.log('[AgentCoaching] Connected to Pusher');
        });

        pusher.connection.bind('disconnected', () => {
            setState(prev => ({ ...prev, isConnected: false }));
            console.log('[AgentCoaching] Disconnected from Pusher');
        });

        pusher.connection.bind('error', (err: any) => {
            console.error('[AgentCoaching] Connection error:', err);
            setState(prev => ({ ...prev, isConnected: false }));
        });

        // Subscribe to agent-specific channel
        const channel = pusher.subscribe(`agent-coaching-${agentId}`);
        channelRef.current = channel;

        // Script suggestion events
        channel.bind('script_suggestion', (data: any) => {
            const event: CoachingEvent = {
                id: `script-${Date.now()}`,
                type: 'script',
                message: data.script || data.message,
                priority: data.priority || 'medium',
                displayType: 'notification',
                timestamp: new Date(),
                dismissed: false,
                data: {
                    script: data.script,
                    scriptCategory: data.category,
                    triggerWord: data.triggerWord,
                },
            };

            addEvent(event);
            onEvent?.(event);
        });

        // Sentiment change events
        channel.bind('sentiment_update', (data: any) => {
            const sentiment: SentimentData = {
                score: data.score,
                label: getSentimentLabel(data.score),
                trend: data.trend || 'stable',
                alertLevel: data.score < 0.3 ? 'critical' : data.score < 0.5 ? 'warning' : 'normal',
            };

            setState(prev => ({ ...prev, sentiment }));
            onSentimentChange?.(sentiment);

            // Create warning event if sentiment is critical
            if (sentiment.alertLevel === 'critical') {
                const event: CoachingEvent = {
                    id: `sentiment-warning-${Date.now()}`,
                    type: 'sentiment',
                    message: 'Customer sentiment critically low. Use empathy statements.',
                    priority: 'urgent',
                    displayType: 'badge',
                    timestamp: new Date(),
                    dismissed: false,
                    data: { sentimentScore: data.score, sentimentTrend: data.trend },
                };
                addEvent(event);
                onEvent?.(event);
            }
        });

        // Cadence warning events
        channel.bind('cadence_warning', (data: any) => {
            setState(prev => ({ ...prev, cadenceWarning: data.message }));

            // Auto-clear cadence warning after 3 seconds
            setTimeout(() => {
                setState(prev => ({ ...prev, cadenceWarning: null }));
            }, 3000);

            const event: CoachingEvent = {
                id: `cadence-${Date.now()}`,
                type: 'cadence',
                message: data.message,
                priority: 'medium',
                displayType: 'flash',
                timestamp: new Date(),
                dismissed: false,
                data: { cadenceWPM: data.wpm },
            };
            addEvent(event);
        });

        // Compliance alerts
        channel.bind('compliance_alert', (data: any) => {
            const event: CoachingEvent = {
                id: `compliance-${Date.now()}`,
                type: 'compliance',
                message: data.message || 'Compliance concern detected',
                priority: 'urgent',
                displayType: 'modal',
                timestamp: new Date(),
                dismissed: false,
                data: { complianceRule: data.rule },
            };
            addEvent(event);
            onEvent?.(event);
        });

        // Generic warning events
        channel.bind('warning', (data: any) => {
            const event: CoachingEvent = {
                id: `warning-${Date.now()}`,
                type: 'warning',
                message: data.message,
                priority: data.priority || 'high',
                displayType: data.displayType || 'notification',
                timestamp: new Date(),
                dismissed: false,
            };
            addEvent(event);
            onEvent?.(event);
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`agent-coaching-${agentId}`);
            pusher.disconnect();
        };
    }, [agentId]);

    // Subscribe to call-specific channel when callId changes
    useEffect(() => {
        if (!callId || !pusherRef.current) return;

        const callChannel = pusherRef.current.subscribe(`call-${callId}`);

        callChannel.bind('transcript_update', (data: any) => {
            // Could update local transcript state
            console.log('[AgentCoaching] Transcript update:', data);
        });

        callChannel.bind('call_ended', () => {
            setState(prev => ({ ...prev, activeCallId: null }));
        });

        setState(prev => ({ ...prev, activeCallId: callId }));

        return () => {
            callChannel.unbind_all();
            pusherRef.current?.unsubscribe(`call-${callId}`);
        };
    }, [callId]);

    // Add event helper
    const addEvent = useCallback((event: CoachingEvent) => {
        setState(prev => ({
            ...prev,
            events: [event, ...prev.events].slice(0, 20), // Keep last 20 events
            scriptsShown: event.type === 'script' ? prev.scriptsShown + 1 : prev.scriptsShown,
            warningsShown: event.type === 'warning' ? prev.warningsShown + 1 : prev.warningsShown,
        }));
    }, []);

    // Dismiss event
    const dismissEvent = useCallback((eventId: string) => {
        setState(prev => ({
            ...prev,
            events: prev.events.map(e =>
                e.id === eventId ? { ...e, dismissed: true } : e
            ),
        }));
    }, []);

    // Dismiss all events
    const dismissAllEvents = useCallback(() => {
        setState(prev => ({
            ...prev,
            events: prev.events.map(e => ({ ...e, dismissed: true })),
        }));
    }, []);

    // Get active (non-dismissed) events
    const activeEvents = state.events.filter(e => !e.dismissed);

    // Trigger a manual coaching webhook (for testing)
    const triggerCoachingEvent = useCallback(async (
        triggerType: string,
        data: Record<string, any>
    ) => {
        try {
            await fetch('/api/v1/agent/coach/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: `session-${Date.now()}`,
                    agentId,
                    callId: state.activeCallId,
                    triggerType,
                    data,
                }),
            });
        } catch (error) {
            console.error('[AgentCoaching] Failed to trigger event:', error);
        }
    }, [agentId, state.activeCallId]);

    return {
        ...state,
        activeEvents,
        dismissEvent,
        dismissAllEvents,
        triggerCoachingEvent,
    };
}

// Helper function
function getSentimentLabel(score: number): string {
    if (score < 0.2) return 'Very Frustrated';
    if (score < 0.35) return 'Frustrated';
    if (score < 0.5) return 'Dissatisfied';
    if (score < 0.65) return 'Neutral';
    if (score < 0.8) return 'Satisfied';
    return 'Very Satisfied';
}

export default useAgentCoaching;
