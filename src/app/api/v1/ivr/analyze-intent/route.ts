/**
 * Intent Analysis API
 * POST /api/v1/ivr/analyze-intent
 * Input audio/text, returns Intent Class and Sentiment Score
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const analyzeIntentSchema = z.object({
    inputType: z.enum(['text', 'audio']),
    text: z.string().optional(),
    audioBase64: z.string().optional(),
    audioFormat: z.enum(['wav', 'mp3', 'webm', 'ogg']).optional(),
    language: z.enum(['en', 'ml', 'hi', 'manglish']).default('en'),
    context: z.object({
        previousIntent: z.string().optional(),
        customerHistory: z.array(z.string()).optional(),
        sessionId: z.string().optional(),
    }).optional(),
});

// Intent categories for BPO use cases
const INTENT_CATEGORIES = {
    // Billing & Payments
    BILLING_INQUIRY: 'billing_inquiry',
    PAYMENT_STATUS: 'payment_status',
    REFUND_REQUEST: 'refund_request',

    // Technical Support
    TECH_SUPPORT: 'tech_support',
    PRODUCT_ISSUE: 'product_issue',
    SERVICE_OUTAGE: 'service_outage',

    // Account Management
    ACCOUNT_INFO: 'account_info',
    PASSWORD_RESET: 'password_reset',
    CANCEL_SERVICE: 'cancel_service',
    UPGRADE_SERVICE: 'upgrade_service',

    // Sales & Leads
    PRODUCT_INQUIRY: 'product_inquiry',
    PRICING_INQUIRY: 'pricing_inquiry',
    PURCHASE_INTENT: 'purchase_intent',

    // General
    GREETING: 'greeting',
    GOODBYE: 'goodbye',
    TRANSFER_REQUEST: 'transfer_request',
    COMPLAINT: 'complaint',
    FEEDBACK: 'feedback',
    UNKNOWN: 'unknown',
};

// Sentiment levels
const SENTIMENT_LABELS = {
    VERY_NEGATIVE: { label: 'very_negative', range: [0, 0.2] },
    NEGATIVE: { label: 'negative', range: [0.2, 0.4] },
    NEUTRAL: { label: 'neutral', range: [0.4, 0.6] },
    POSITIVE: { label: 'positive', range: [0.6, 0.8] },
    VERY_POSITIVE: { label: 'very_positive', range: [0.8, 1.0] },
};

// Keyword-based intent detection (simplified - real impl would use NLU model)
function detectIntent(text: string): { intent: string; confidence: number } {
    const lowerText = text.toLowerCase();

    // Billing keywords
    if (/bill|invoice|charge|payment|due|balance/.test(lowerText)) {
        return { intent: INTENT_CATEGORIES.BILLING_INQUIRY, confidence: 0.85 };
    }

    // Refund keywords
    if (/refund|money back|return|reimburse/.test(lowerText)) {
        return { intent: INTENT_CATEGORIES.REFUND_REQUEST, confidence: 0.9 };
    }

    // Tech support keywords
    if (/not working|broken|error|issue|problem|help|fix/.test(lowerText)) {
        return { intent: INTENT_CATEGORIES.TECH_SUPPORT, confidence: 0.8 };
    }

    // Cancel keywords
    if (/cancel|stop|terminate|end|quit/.test(lowerText)) {
        return { intent: INTENT_CATEGORIES.CANCEL_SERVICE, confidence: 0.88 };
    }

    // Transfer keywords
    if (/speak|talk|transfer|agent|human|person|representative/.test(lowerText)) {
        return { intent: INTENT_CATEGORIES.TRANSFER_REQUEST, confidence: 0.92 };
    }

    // Complaint keywords
    if (/angry|upset|frustrated|terrible|worst|horrible|complain/.test(lowerText)) {
        return { intent: INTENT_CATEGORIES.COMPLAINT, confidence: 0.85 };
    }

    // Account keywords
    if (/account|profile|details|information|update/.test(lowerText)) {
        return { intent: INTENT_CATEGORIES.ACCOUNT_INFO, confidence: 0.75 };
    }

    // Greeting
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowerText)) {
        return { intent: INTENT_CATEGORIES.GREETING, confidence: 0.95 };
    }

    return { intent: INTENT_CATEGORIES.UNKNOWN, confidence: 0.3 };
}

// Simplified sentiment analysis (real impl would use ML model)
function analyzeSentiment(text: string): { score: number; label: string; indicators: string[] } {
    const lowerText = text.toLowerCase();
    const indicators: string[] = [];

    // Negative indicators
    const negativeWords = ['angry', 'upset', 'frustrated', 'terrible', 'worst', 'horrible', 'hate', 'never', 'awful', 'disappointed', 'unacceptable', 'ridiculous'];
    const positiveWords = ['thank', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'pleased', 'love', 'appreciate', 'helpful'];

    let score = 0.5; // Start neutral

    for (const word of negativeWords) {
        if (lowerText.includes(word)) {
            score -= 0.1;
            indicators.push(`negative: ${word}`);
        }
    }

    for (const word of positiveWords) {
        if (lowerText.includes(word)) {
            score += 0.1;
            indicators.push(`positive: ${word}`);
        }
    }

    // Clamp score
    score = Math.max(0, Math.min(1, score));

    // Determine label
    let label = 'neutral';
    for (const [key, value] of Object.entries(SENTIMENT_LABELS)) {
        if (score >= value.range[0] && score < value.range[1]) {
            label = value.label;
            break;
        }
    }

    return { score, label, indicators };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = analyzeIntentSchema.parse(body);

        let textToAnalyze = validatedData.text || '';

        // If audio input, would process through STT here
        if (validatedData.inputType === 'audio' && validatedData.audioBase64) {
            // In production, send to STT service (Azure, Google, etc.)
            // For now, return error if no text provided
            if (!validatedData.text) {
                return NextResponse.json({
                    success: false,
                    message: 'Audio processing not yet implemented. Please provide text.',
                }, { status: 400 });
            }
        }

        if (!textToAnalyze) {
            return NextResponse.json({
                success: false,
                message: 'No text provided for analysis',
            }, { status: 400 });
        }

        // Analyze intent
        const intentResult = detectIntent(textToAnalyze);

        // Analyze sentiment
        const sentimentResult = analyzeSentiment(textToAnalyze);

        // Determine if escalation is needed
        const needsEscalation =
            sentimentResult.score < 0.3 || // Very negative sentiment
            intentResult.intent === INTENT_CATEGORIES.COMPLAINT ||
            intentResult.intent === INTENT_CATEGORIES.TRANSFER_REQUEST ||
            intentResult.intent === INTENT_CATEGORIES.CANCEL_SERVICE;

        // Suggested routing
        let suggestedRouting = 'ai_agent';
        if (needsEscalation) {
            suggestedRouting = sentimentResult.score < 0.2 ? 'priority_human' : 'human_agent';
        }

        return NextResponse.json({
            success: true,
            data: {
                input: {
                    text: textToAnalyze,
                    language: validatedData.language,
                    inputType: validatedData.inputType,
                },
                intent: {
                    primary: intentResult.intent,
                    confidence: intentResult.confidence,
                    category: getCategoryFromIntent(intentResult.intent),
                },
                sentiment: {
                    score: sentimentResult.score,
                    label: sentimentResult.label,
                    indicators: sentimentResult.indicators,
                    angerLevel: sentimentResult.score < 0.3 ? Math.round((1 - sentimentResult.score) * 100) : null,
                },
                routing: {
                    suggestedTarget: suggestedRouting,
                    needsEscalation,
                    escalationReason: needsEscalation ? getEscalationReason(intentResult.intent, sentimentResult.score) : null,
                    priority: getPriority(intentResult.intent, sentimentResult.score),
                },
                metadata: {
                    processingTimeMs: 45, // Would be actual processing time
                    modelVersion: '1.0.0',
                    timestamp: new Date().toISOString(),
                }
            }
        });

    } catch (error) {
        console.error('Error analyzing intent:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Validation Error', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to analyze intent' },
            { status: 500 }
        );
    }
}

// Helper functions
function getCategoryFromIntent(intent: string): string {
    if (['billing_inquiry', 'payment_status', 'refund_request'].includes(intent)) {
        return 'billing';
    }
    if (['tech_support', 'product_issue', 'service_outage'].includes(intent)) {
        return 'support';
    }
    if (['account_info', 'password_reset', 'cancel_service', 'upgrade_service'].includes(intent)) {
        return 'account';
    }
    if (['product_inquiry', 'pricing_inquiry', 'purchase_intent'].includes(intent)) {
        return 'sales';
    }
    return 'general';
}

function getEscalationReason(intent: string, sentimentScore: number): string {
    if (sentimentScore < 0.2) return 'Customer expressing high frustration';
    if (intent === INTENT_CATEGORIES.COMPLAINT) return 'Customer complaint detected';
    if (intent === INTENT_CATEGORIES.TRANSFER_REQUEST) return 'Customer requested human agent';
    if (intent === INTENT_CATEGORIES.CANCEL_SERVICE) return 'Potential churn - retention opportunity';
    return 'Escalation recommended';
}

function getPriority(intent: string, sentimentScore: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (sentimentScore < 0.2) return 'urgent';
    if (intent === INTENT_CATEGORIES.COMPLAINT) return 'high';
    if (intent === INTENT_CATEGORIES.CANCEL_SERVICE) return 'high';
    if (sentimentScore < 0.4) return 'medium';
    return 'low';
}
