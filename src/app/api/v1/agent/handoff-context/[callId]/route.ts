/**
 * Agent Handoff Context API
 * GET /api/v1/agent/handoff-context/[callId]
 * Fetches intent, sentiment, and transcript buffer for human agent screen
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redactPII } from '@/lib/security/pii-redaction';

type RouteContext = {
    params: Promise<{ callId: string }>;
};

/**
 * GET /api/v1/agent/handoff-context/[callId]
 * Returns warm handoff context for human agents
 */
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { callId } = await context.params;

        // Fetch call record with related data
        const callRecord = await prisma.callRecord.findFirst({
            where: {
                OR: [
                    { id: callId },
                    { callId: callId }
                ]
            },
            include: {
                transcription: true,
                CallHandoff: {
                    orderBy: { requestedAt: 'desc' },
                    take: 1,
                },
                AgentAssistSession: {
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                },
            }
        });

        if (!callRecord) {
            return NextResponse.json(
                { success: false, error: 'Call not found' },
                { status: 404 }
            );
        }

        // Get latest agent assist session for additional context
        const latestSession = callRecord.AgentAssistSession?.[0];
        const latestHandoff = callRecord.CallHandoff?.[0];

        // Build handoff context
        const handoffContext = {
            // Call Information
            call: {
                id: callRecord.id,
                callId: callRecord.callId,
                type: callRecord.callType,
                startTime: callRecord.startTime,
                duration: callRecord.duration,
                language: callRecord.primaryLanguage,
            },

            // Intent Information
            intent: {
                label: callRecord.finalIntentLabel || latestSession?.handoffIntent || 'Unknown',
                category: getIntentCategory(callRecord.finalIntentLabel),
                confidence: 0.85, // Would come from actual analysis
                keywords: extractKeywords(callRecord.transcriptionSnippet),
            },

            // Sentiment Analysis
            sentiment: {
                score: callRecord.finalSentimentScore || latestSession?.handoffSentiment || 0.5,
                label: getSentimentLabel(callRecord.finalSentimentScore || 0.5),
                percentage: Math.round((callRecord.finalSentimentScore || 0.5) * 100),
                trend: 'stable', // Would track sentiment over time
                alerts: getSentimentAlerts(callRecord.finalSentimentScore || 0.5),
            },

            // Transcript (last 2 minutes, PII redacted)
            transcript: {
                snippet: redactPII(callRecord.transcriptionSnippet || latestSession?.handoffTranscript || ''),
                wordCount: countWords(callRecord.transcriptionSnippet || ''),
                segmentCount: 1, // Would be actual segment count
                lastUpdated: new Date().toISOString(),
            },

            // Handoff Details
            handoff: {
                status: callRecord.handoffStatus,
                type: latestHandoff?.handoffType || 'warm_transfer',
                reason: latestHandoff?.reason || getHandoffReason(callRecord.finalIntentLabel, callRecord.finalSentimentScore),
                requestedAt: latestHandoff?.requestedAt,
                priority: getPriority(callRecord.finalIntentLabel, callRecord.finalSentimentScore),
            },

            // Customer Context (would come from CRM integration)
            customer: {
                previousCalls: 0, // Would fetch from history
                tier: 'standard',
                notes: null,
            },

            // Suggested Actions for Agent
            suggestions: {
                scripts: getSuggestedScripts(callRecord.finalIntentLabel, callRecord.finalSentimentScore),
                doNotSay: getDoNotSay(callRecord.finalSentimentScore),
                resolutionOptions: getResolutionOptions(callRecord.finalIntentLabel),
            },

            // Coaching Events from AI session
            coachingHistory: latestSession?.triggerEvents || [],

            // Metadata
            metadata: {
                fetchedAt: new Date().toISOString(),
                version: '1.0',
            }
        };

        return NextResponse.json({
            success: true,
            data: handoffContext,
        });

    } catch (error) {
        console.error('Error fetching handoff context:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch handoff context' },
            { status: 500 }
        );
    }
}

// Helper functions
function getIntentCategory(intent: string | null): string {
    if (!intent) return 'general';
    if (['billing_inquiry', 'payment_status', 'refund_request'].includes(intent)) return 'billing';
    if (['tech_support', 'product_issue'].includes(intent)) return 'support';
    if (['cancel_service', 'complaint'].includes(intent)) return 'retention';
    return 'general';
}

function getSentimentLabel(score: number): string {
    if (score < 0.2) return 'Very Frustrated';
    if (score < 0.35) return 'Frustrated';
    if (score < 0.5) return 'Dissatisfied';
    if (score < 0.65) return 'Neutral';
    if (score < 0.8) return 'Satisfied';
    return 'Very Satisfied';
}

function getSentimentAlerts(score: number): string[] {
    const alerts: string[] = [];
    if (score < 0.3) {
        alerts.push('⚠️ Customer highly frustrated - approach with empathy');
    }
    if (score < 0.4) {
        alerts.push('Use calming language and active listening');
    }
    return alerts;
}

function extractKeywords(transcript: string | null): string[] {
    if (!transcript) return [];
    const keywords: string[] = [];
    const lowerTranscript = transcript.toLowerCase();

    if (/refund|money back/.test(lowerTranscript)) keywords.push('refund');
    if (/cancel/.test(lowerTranscript)) keywords.push('cancellation');
    if (/frustrated|angry|upset/.test(lowerTranscript)) keywords.push('frustrated');
    if (/waiting|long time/.test(lowerTranscript)) keywords.push('wait time');
    if (/manager|supervisor/.test(lowerTranscript)) keywords.push('escalation');

    return keywords;
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function getHandoffReason(intent: string | null, sentiment: number | null): string {
    if (sentiment && sentiment < 0.3) return 'Customer frustration requires human empathy';
    if (intent === 'cancel_service') return 'Retention opportunity - customer considering cancellation';
    if (intent === 'complaint') return 'Customer complaint requires personal attention';
    if (intent === 'refund_request') return 'Refund authorization may be required';
    return 'Customer requested human assistance';
}

function getPriority(intent: string | null, sentiment: number | null): 'low' | 'medium' | 'high' | 'urgent' {
    if (sentiment && sentiment < 0.2) return 'urgent';
    if (intent === 'cancel_service') return 'high';
    if (sentiment && sentiment < 0.4) return 'high';
    if (intent === 'complaint') return 'medium';
    return 'medium';
}

function getSuggestedScripts(intent: string | null, sentiment: number | null): string[] {
    const scripts: string[] = [];

    if (sentiment && sentiment < 0.4) {
        scripts.push("I understand how frustrating this must be, and I'm here to help resolve this for you.");
        scripts.push("Thank you for your patience. Let me personally ensure this gets sorted out.");
    }

    if (intent === 'refund_request') {
        scripts.push("I'd be happy to review your refund request and see what options are available.");
    }

    if (intent === 'cancel_service') {
        scripts.push("Before we proceed, I'd like to understand what's prompting this decision. Perhaps there's something we can do differently?");
        scripts.push("We truly value your business. Let me see what I can offer to improve your experience.");
    }

    if (scripts.length === 0) {
        scripts.push("Thank you for reaching out. How can I assist you today?");
    }

    return scripts;
}

function getDoNotSay(sentiment: number | null): string[] {
    if (sentiment && sentiment < 0.4) {
        return [
            "Don't use phrases like 'calm down' or 'there's nothing I can do'",
            "Avoid reading from scripts in a robotic manner",
            "Don't interrupt the customer while they're explaining",
        ];
    }
    return [];
}

function getResolutionOptions(intent: string | null): string[] {
    const options: string[] = [];

    if (intent === 'refund_request') {
        options.push('Full refund', 'Partial refund', 'Store credit', 'Service credit');
    }
    if (intent === 'cancel_service') {
        options.push('Offer discount', 'Downgrade plan', 'Pause subscription', 'Process cancellation');
    }
    if (intent === 'tech_support') {
        options.push('Remote troubleshooting', 'Schedule callback', 'Create support ticket', 'Dispatch technician');
    }

    return options;
}
