/**
 * Smart Routing API
 * POST /api/v1/ivr/smart-route
 * Logic engine that accepts Intent+Sentiment and returns next_node_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const smartRouteSchema = z.object({
    intent: z.object({
        primary: z.string(),
        confidence: z.number().min(0).max(1),
        category: z.string().optional(),
    }),
    sentiment: z.object({
        score: z.number().min(0).max(1),
        label: z.string(),
        angerLevel: z.number().optional(),
    }),
    context: z.object({
        workflowId: z.string().optional(),
        currentNodeId: z.string().optional(),
        sessionId: z.string().optional(),
        customerTier: z.enum(['standard', 'premium', 'enterprise']).default('standard'),
        attemptCount: z.number().default(0),
        previousIntents: z.array(z.string()).optional(),
    }).optional(),
    overrides: z.object({
        forceHuman: z.boolean().optional(),
        preferredQueue: z.string().optional(),
        skillRequirements: z.array(z.string()).optional(),
    }).optional(),
});

// Routing destinations
const ROUTE_DESTINATIONS = {
    // AI Agents
    AI_BILLING_AGENT: 'ai_billing_agent',
    AI_SUPPORT_AGENT: 'ai_support_agent',
    AI_SALES_AGENT: 'ai_sales_agent',
    AI_GENERAL_AGENT: 'ai_general_agent',

    // Human Queues
    HUMAN_BILLING: 'human_billing_queue',
    HUMAN_SUPPORT: 'human_support_queue',
    HUMAN_RETENTION: 'human_retention_queue',
    HUMAN_PRIORITY: 'human_priority_queue',
    HUMAN_GENERAL: 'human_general_queue',

    // Special Nodes
    AUTHENTICATION: 'auth_node',
    COLLECT_INFO: 'collect_info_node',
    ESCALATION: 'escalation_node',
    END_CALL: 'end_call_node',
    SURVEY: 'csat_survey_node',
};

// Routing rules configuration
const ROUTING_RULES = {
    // Sentiment-based overrides (anger threshold)
    SENTIMENT_THRESHOLDS: {
        IMMEDIATE_HUMAN: 0.2,    // < 20% sentiment = immediate human
        PREFER_HUMAN: 0.35,      // < 35% sentiment = prefer human
        AI_CAPABLE: 0.5,         // >= 50% sentiment = AI can handle
    },

    // Intent to route mapping
    INTENT_ROUTES: {
        billing_inquiry: { ai: 'AI_BILLING_AGENT', human: 'HUMAN_BILLING' },
        payment_status: { ai: 'AI_BILLING_AGENT', human: 'HUMAN_BILLING' },
        refund_request: { ai: 'AI_BILLING_AGENT', human: 'HUMAN_BILLING', preferHuman: true },
        tech_support: { ai: 'AI_SUPPORT_AGENT', human: 'HUMAN_SUPPORT' },
        product_issue: { ai: 'AI_SUPPORT_AGENT', human: 'HUMAN_SUPPORT' },
        cancel_service: { ai: null, human: 'HUMAN_RETENTION', preferHuman: true },
        complaint: { ai: null, human: 'HUMAN_PRIORITY', preferHuman: true },
        transfer_request: { ai: null, human: 'HUMAN_GENERAL', preferHuman: true },
        product_inquiry: { ai: 'AI_SALES_AGENT', human: 'HUMAN_GENERAL' },
        account_info: { ai: 'AI_GENERAL_AGENT', human: 'HUMAN_GENERAL', requiresAuth: true },
        greeting: { ai: 'AI_GENERAL_AGENT', human: null },
        unknown: { ai: 'AI_GENERAL_AGENT', human: 'HUMAN_GENERAL' },
    } as Record<string, { ai: string | null; human: string | null; preferHuman?: boolean; requiresAuth?: boolean }>,
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = smartRouteSchema.parse(body);

        const { intent, sentiment, context, overrides } = validatedData;

        // Get base routing for intent
        const intentRoute = ROUTING_RULES.INTENT_ROUTES[intent.primary] ||
            ROUTING_RULES.INTENT_ROUTES['unknown'];

        // Decision factors
        const factors: string[] = [];
        let destination: string;
        let targetType: 'ai' | 'human';
        let requiresAuth = intentRoute.requiresAuth || false;

        // Force human override
        if (overrides?.forceHuman) {
            destination = intentRoute.human || ROUTE_DESTINATIONS.HUMAN_GENERAL;
            targetType = 'human';
            factors.push('Override: Force human requested');
        }
        // Check sentiment thresholds
        else if (sentiment.score < ROUTING_RULES.SENTIMENT_THRESHOLDS.IMMEDIATE_HUMAN) {
            destination = ROUTE_DESTINATIONS.HUMAN_PRIORITY;
            targetType = 'human';
            factors.push(`Sentiment critically low (${(sentiment.score * 100).toFixed(0)}%)`);
        }
        else if (sentiment.score < ROUTING_RULES.SENTIMENT_THRESHOLDS.PREFER_HUMAN) {
            destination = intentRoute.human || ROUTE_DESTINATIONS.HUMAN_GENERAL;
            targetType = 'human';
            factors.push(`Sentiment below threshold (${(sentiment.score * 100).toFixed(0)}%)`);
        }
        // Intent prefers human
        else if (intentRoute.preferHuman) {
            destination = intentRoute.human || ROUTE_DESTINATIONS.HUMAN_GENERAL;
            targetType = 'human';
            factors.push(`Intent "${intent.primary}" prefers human handling`);
        }
        // Multiple failed attempts
        else if ((context?.attemptCount || 0) > 2) {
            destination = intentRoute.human || ROUTE_DESTINATIONS.HUMAN_GENERAL;
            targetType = 'human';
            factors.push('Multiple attempts detected - escalating to human');
        }
        // AI capable and sentiment good
        else if (intentRoute.ai && sentiment.score >= ROUTING_RULES.SENTIMENT_THRESHOLDS.AI_CAPABLE) {
            destination = intentRoute.ai;
            targetType = 'ai';
            factors.push(`AI agent capable for "${intent.primary}"`);
        }
        // Default to human
        else {
            destination = intentRoute.human || ROUTE_DESTINATIONS.HUMAN_GENERAL;
            targetType = 'human';
            factors.push('Default routing to human agent');
        }

        // Customer tier upgrades
        if (context?.customerTier === 'enterprise' && targetType === 'human') {
            destination = ROUTE_DESTINATIONS.HUMAN_PRIORITY;
            factors.push('Enterprise customer - priority queue');
        } else if (context?.customerTier === 'premium' && targetType === 'human') {
            factors.push('Premium customer - expedited handling');
        }

        // Map destination to node ID
        const nextNodeId = ROUTE_DESTINATIONS[destination as keyof typeof ROUTE_DESTINATIONS] || destination;

        // Estimate wait time
        const estimatedWaitSeconds = targetType === 'ai' ? 0 : getEstimatedWait(destination);

        // Build response
        return NextResponse.json({
            success: true,
            data: {
                routing: {
                    nextNodeId,
                    destination,
                    targetType,
                    queue: targetType === 'human' ? destination : null,
                },
                decision: {
                    factors,
                    confidence: intent.confidence,
                    sentimentImpact: getSentimentImpact(sentiment.score),
                },
                authentication: {
                    required: requiresAuth,
                    method: requiresAuth ? 'otp' : null,
                },
                estimates: {
                    waitTimeSeconds: estimatedWaitSeconds,
                    waitTimeDisplay: formatWaitTime(estimatedWaitSeconds),
                },
                scripts: targetType === 'human' ? {
                    holdMessage: getHoldMessage(destination, estimatedWaitSeconds),
                    transferMessage: getTransferMessage(intent.primary),
                } : null,
                fallback: {
                    nodeId: ROUTE_DESTINATIONS.HUMAN_GENERAL,
                    reason: 'API timeout or failure',
                },
                metadata: {
                    processingTimeMs: 12,
                    rulesVersion: '1.0.0',
                    timestamp: new Date().toISOString(),
                }
            }
        });

    } catch (error) {
        console.error('Error in smart routing:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Validation Error', details: error.errors },
                { status: 400 }
            );
        }

        // Fallback response for graceful degradation
        return NextResponse.json({
            success: false,
            error: 'Routing failed',
            fallback: {
                nextNodeId: ROUTE_DESTINATIONS.HUMAN_GENERAL,
                destination: 'human_general_queue',
                targetType: 'human',
                reason: 'Fallback due to routing error',
            }
        }, { status: 500 });
    }
}

// Helper functions
function getSentimentImpact(score: number): 'positive' | 'neutral' | 'negative' | 'critical' {
    if (score < 0.2) return 'critical';
    if (score < 0.4) return 'negative';
    if (score < 0.6) return 'neutral';
    return 'positive';
}

function getEstimatedWait(destination: string): number {
    const waitTimes: Record<string, number> = {
        [ROUTE_DESTINATIONS.HUMAN_PRIORITY]: 30,
        [ROUTE_DESTINATIONS.HUMAN_RETENTION]: 45,
        [ROUTE_DESTINATIONS.HUMAN_BILLING]: 60,
        [ROUTE_DESTINATIONS.HUMAN_SUPPORT]: 90,
        [ROUTE_DESTINATIONS.HUMAN_GENERAL]: 120,
    };
    return waitTimes[destination] || 60;
}

function formatWaitTime(seconds: number): string {
    if (seconds < 60) return `Less than a minute`;
    if (seconds < 120) return `About 1 minute`;
    return `About ${Math.ceil(seconds / 60)} minutes`;
}

function getHoldMessage(destination: string, waitSeconds: number): string {
    if (destination === ROUTE_DESTINATIONS.HUMAN_PRIORITY) {
        return "Thank you for your patience. A priority support agent will be with you shortly.";
    }
    if (destination === ROUTE_DESTINATIONS.HUMAN_RETENTION) {
        return "We value your business. A specialist will assist you in just a moment.";
    }
    return `Thank you for holding. Expected wait time is ${formatWaitTime(waitSeconds).toLowerCase()}.`;
}

function getTransferMessage(intent: string): string {
    const messages: Record<string, string> = {
        refund_request: "I'll connect you with a specialist who can help with your refund request.",
        cancel_service: "Let me connect you with our customer success team who can help address your concerns.",
        complaint: "I understand you're frustrated. Let me connect you with a senior representative.",
        tech_support: "I'll transfer you to our technical support team for specialized assistance.",
    };
    return messages[intent] || "Let me transfer you to an agent who can better assist you.";
}
