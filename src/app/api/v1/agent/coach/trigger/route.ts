/**
 * Agent Coach Trigger API
 * POST /api/v1/agent/coach/trigger
 * Webhook receiver for real-time analysis to push script suggestions via WebSocket
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const coachTriggerSchema = z.object({
    sessionId: z.string(),
    agentId: z.string(),
    callId: z.string(),
    triggerType: z.enum([
        'keyword_detected',
        'sentiment_change',
        'cadence_warning',
        'silence_detected',
        'customer_interrupt',
        'script_suggestion',
        'compliance_alert',
    ]),
    data: z.object({
        // For keyword detection
        keyword: z.string().optional(),
        keywordContext: z.string().optional(),

        // For sentiment
        currentSentiment: z.number().optional(),
        previousSentiment: z.number().optional(),
        sentimentTrend: z.enum(['improving', 'stable', 'declining']).optional(),

        // For cadence
        wordsPerMinute: z.number().optional(),
        recommendedWPM: z.number().optional(),

        // For silence
        silenceDurationMs: z.number().optional(),

        // For script suggestion
        suggestedScript: z.string().optional(),
        scriptCategory: z.string().optional(),

        // For compliance
        complianceRule: z.string().optional(),
        violationType: z.string().optional(),
    }).optional(),
    timestamp: z.string().optional(),
});

// Keyword-based script suggestions
const KEYWORD_SCRIPTS: Record<string, { script: string; category: string; priority: string }> = {
    'cancel': {
        script: "I understand you're considering cancellation. Before we proceed, may I ask what's prompting this decision? Perhaps there's something we can do to improve your experience.",
        category: 'retention',
        priority: 'high',
    },
    'refund': {
        script: "I'd be happy to review your refund request. Let me pull up your account details to see what options are available.",
        category: 'billing',
        priority: 'medium',
    },
    'frustrated': {
        script: "I hear that you're frustrated, and I completely understand. Let me personally ensure we get this resolved for you today.",
        category: 'empathy',
        priority: 'high',
    },
    'manager': {
        script: "I'd be glad to involve a manager if needed. First, let me see if I can resolve this directly - I have the authority to help with most situations.",
        category: 'escalation',
        priority: 'high',
    },
    'competitor': {
        script: "I appreciate you mentioning that. We'd love the opportunity to show you why customers choose to stay with us. What features are most important to you?",
        category: 'retention',
        priority: 'high',
    },
    'lawsuit': {
        script: "I want to make sure we address your concerns thoroughly. Would you mind holding while I connect you with our customer relations team who can properly assist you?",
        category: 'compliance',
        priority: 'urgent',
    },
    'terrible': {
        script: "I'm truly sorry to hear about your experience. That's not the level of service we strive for. Let me see how I can make this right.",
        category: 'empathy',
        priority: 'high',
    },
};

// Cadence thresholds
const CADENCE_THRESHOLDS = {
    TOO_FAST: 180, // WPM
    TOO_SLOW: 100,
    OPTIMAL_MIN: 120,
    OPTIMAL_MAX: 160,
};

// Store WebSocket connections (in production, use Redis or similar)
const agentConnections = new Map<string, any>();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = coachTriggerSchema.parse(body);

        const { sessionId, agentId, callId, triggerType, data } = validatedData;

        let coachingResponse: any = {
            sessionId,
            agentId,
            callId,
            triggerType,
            timestamp: new Date().toISOString(),
        };

        switch (triggerType) {
            case 'keyword_detected':
                if (data?.keyword) {
                    const lowerKeyword = data.keyword.toLowerCase();
                    for (const [key, value] of Object.entries(KEYWORD_SCRIPTS)) {
                        if (lowerKeyword.includes(key)) {
                            coachingResponse = {
                                ...coachingResponse,
                                action: 'show_script',
                                scriptData: {
                                    text: value.script,
                                    category: value.category,
                                    priority: value.priority,
                                    triggerWord: key,
                                    context: data.keywordContext,
                                },
                                displayType: value.priority === 'urgent' ? 'modal' : 'notification',
                                duration: value.priority === 'urgent' ? null : 15000, // 15 seconds
                            };
                            break;
                        }
                    }
                }
                break;

            case 'sentiment_change':
                if (data?.currentSentiment !== undefined) {
                    const sentiment = data.currentSentiment;
                    if (sentiment < 0.3) {
                        coachingResponse = {
                            ...coachingResponse,
                            action: 'show_warning',
                            warningData: {
                                type: 'sentiment_critical',
                                message: 'Customer sentiment critically low',
                                suggestion: 'Use empathy statements. Slow down and listen actively.',
                                currentScore: sentiment,
                                trend: data.sentimentTrend,
                            },
                            displayType: 'badge',
                            cssClass: 'sentiment-critical',
                        };
                    } else if (sentiment < 0.5 && data.sentimentTrend === 'declining') {
                        coachingResponse = {
                            ...coachingResponse,
                            action: 'show_warning',
                            warningData: {
                                type: 'sentiment_declining',
                                message: 'Sentiment declining',
                                suggestion: 'Consider acknowledging customer frustration.',
                            },
                            displayType: 'notification',
                        };
                    }
                }
                break;

            case 'cadence_warning':
                if (data?.wordsPerMinute !== undefined) {
                    const wpm = data.wordsPerMinute;
                    let cadenceMessage = '';
                    let cadenceType = '';

                    if (wpm > CADENCE_THRESHOLDS.TOO_FAST) {
                        cadenceMessage = 'SLOW DOWN';
                        cadenceType = 'too_fast';
                    } else if (wpm < CADENCE_THRESHOLDS.TOO_SLOW) {
                        cadenceMessage = 'SPEAK UP';
                        cadenceType = 'too_slow';
                    }

                    if (cadenceMessage) {
                        coachingResponse = {
                            ...coachingResponse,
                            action: 'show_cadence_warning',
                            cadenceData: {
                                message: cadenceMessage,
                                type: cadenceType,
                                currentWPM: wpm,
                                recommendedWPM: `${CADENCE_THRESHOLDS.OPTIMAL_MIN}-${CADENCE_THRESHOLDS.OPTIMAL_MAX}`,
                            },
                            displayType: 'flash', // Brief visual flash
                            duration: 3000,
                        };
                    }
                }
                break;

            case 'silence_detected':
                if (data?.silenceDurationMs && data.silenceDurationMs > 5000) {
                    coachingResponse = {
                        ...coachingResponse,
                        action: 'show_prompt',
                        promptData: {
                            message: 'Silence detected',
                            suggestion: 'Consider checking in with the customer or asking a clarifying question.',
                            silenceDuration: Math.round(data.silenceDurationMs / 1000),
                        },
                        displayType: 'subtle',
                    };
                }
                break;

            case 'compliance_alert':
                coachingResponse = {
                    ...coachingResponse,
                    action: 'show_compliance_alert',
                    complianceData: {
                        rule: data?.complianceRule,
                        violation: data?.violationType,
                        message: 'Compliance concern detected. Please review guidelines.',
                    },
                    displayType: 'modal',
                    requiresAcknowledge: true,
                };
                break;

            case 'script_suggestion':
                if (data?.suggestedScript) {
                    coachingResponse = {
                        ...coachingResponse,
                        action: 'show_script',
                        scriptData: {
                            text: data.suggestedScript,
                            category: data.scriptCategory || 'general',
                            priority: 'medium',
                        },
                        displayType: 'notification',
                    };
                }
                break;

            default:
                coachingResponse = {
                    ...coachingResponse,
                    action: 'none',
                    message: 'Unknown trigger type',
                };
        }

        // In production, push via WebSocket
        // io.to(`agent:${agentId}`).emit('coaching_event', coachingResponse);

        // Log the coaching event for analytics
        // await logCoachingEvent(coachingResponse);

        return NextResponse.json({
            success: true,
            data: coachingResponse,
            websocketPush: {
                target: `agent:${agentId}`,
                eventType: 'coaching_event',
                sent: true, // Would be actual status
            }
        });

    } catch (error) {
        console.error('Error processing coach trigger:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Validation Error', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to process coaching trigger' },
            { status: 500 }
        );
    }
}
