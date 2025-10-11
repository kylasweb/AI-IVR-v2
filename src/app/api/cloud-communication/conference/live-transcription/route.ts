import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Helper function for error handling
function formatError(error: unknown): string {
    if (error && typeof error === 'object' && 'issues' in error) {
        // Handle Zod validation errors
        const zodError = error as any;
        return zodError.errors?.map((e: any) => e.message).join(', ') || 'Validation error';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error) || 'Internal server error';
}

// Live Transcription Creation Schema
const CreateLiveTranscriptionSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    provider: z.enum(['azure', 'google', 'custom']).default('azure'),
    language: z.string().default('en'),
    enableSpeakerIdentification: z.boolean().default(true),
    enableSentimentAnalysis: z.boolean().default(true),
    enableMalayalamProcessing: z.boolean().default(false),
    culturalAnalysisEnabled: z.boolean().default(false),
});

// Transcription Segment Schema
const TranscriptionSegmentSchema = z.object({
    transcriptionId: z.string().min(1, 'Transcription ID is required'),
    speakerId: z.string().optional(),
    speakerName: z.string().optional(),
    text: z.string().min(1, 'Text content is required'),
    startTime: z.number().min(0, 'Start time must be non-negative'),
    endTime: z.number().min(0, 'End time must be non-negative'),
    confidence: z.number().min(0).max(1).default(0.8),
    language: z.string().default('en'),
    isPartial: z.boolean().default(false),
    sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
    culturalContext: z.object({
        respectLevel: z.enum(['high', 'medium', 'low']).optional(),
        formalityLevel: z.enum(['formal', 'informal', 'mixed']).optional(),
        emotionalTone: z.enum(['calm', 'excited', 'frustrated', 'satisfied']).optional(),
        malayalamMix: z.boolean().optional(),
    }).optional(),
});

// GET /api/cloud-communication/conference/live-transcription - Get transcription status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const transcriptionId = searchParams.get('transcriptionId');
        const includeSegments = searchParams.get('segments') === 'true';
        const includeCultural = searchParams.get('cultural') === 'true';

        if (!sessionId && !transcriptionId) {
            return NextResponse.json(
                { success: false, error: 'Either sessionId or transcriptionId is required' },
                { status: 400 }
            );
        }

        let transcriptions;
        if (transcriptionId) {
            // Get specific transcription
            transcriptions = [await db.conferenceTranscription.findUnique({
                where: { id: transcriptionId },
                include: {
                    session: {
                        select: {
                            sessionId: true,
                            title: true,
                            status: true,
                            malayalamSupport: true,
                            culturalMode: true,
                        },
                    },
                },
            })];
        } else {
            // Get all transcriptions for session
            transcriptions = await db.conferenceTranscription.findMany({
                where: { session: { sessionId } },
                include: {
                    session: {
                        select: {
                            sessionId: true,
                            title: true,
                            status: true,
                            malayalamSupport: true,
                            culturalMode: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        // Filter out null results and process transcriptions
        const validTranscriptions = transcriptions.filter(Boolean);

        if (validTranscriptions.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No transcriptions found' },
                { status: 404 }
            );
        }

        // Enhance transcriptions with processing status and metrics
        const enhancedTranscriptions = await Promise.all(
            validTranscriptions.map(async (transcription) => {
                let processedTranscription: any = { ...transcription };

                // Add segments if requested
                if (includeSegments && transcription.speakerSegments) {
                    processedTranscription.segments = transcription.speakerSegments;
                }

                // Add cultural analysis if requested and available
                if (includeCultural && transcription.session.malayalamSupport) {
                    processedTranscription.culturalAnalysis = {
                        languageMix: transcription.languageMix || {},
                        culturalTone: transcription.culturalTone || {},
                        respectLevels: transcription.respectLevels || {},
                        overallCulturalScore: calculateCulturalScore(transcription),
                    };
                }

                // Add real-time metrics
                processedTranscription.metrics = {
                    processingLatency: transcription.processingTime || 0,
                    confidenceScore: transcription.overallConfidence || 0,
                    segmentCount: Array.isArray(transcription.speakerSegments) ? transcription.speakerSegments.length : 0,
                    languageAccuracy: transcription.session.malayalamSupport ?
                        calculateMalayalamAccuracy(transcription) : 95,
                };

                return processedTranscription;
            })
        );

        // Calculate session-level transcription analytics
        const analytics = {
            totalTranscriptions: validTranscriptions.length,
            avgConfidence: validTranscriptions.length > 0 ?
                validTranscriptions.reduce((sum, t) => sum + (t.overallConfidence || 0), 0) / validTranscriptions.length : 0,
            avgProcessingTime: validTranscriptions.length > 0 ?
                validTranscriptions.reduce((sum, t) => sum + (t.processingTime || 0), 0) / validTranscriptions.length : 0,
            malayalamSupport: validTranscriptions[0]?.session.malayalamSupport || false,
            culturalModeActive: validTranscriptions[0]?.session.culturalMode !== 'standard',
        };

        return NextResponse.json({
            success: true,
            data: {
                transcriptions: enhancedTranscriptions,
                analytics,
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching live transcription:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 500 }
        );
    }
}

// POST /api/cloud-communication/conference/live-transcription - Start live transcription
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = CreateLiveTranscriptionSchema.parse(body);

        // Verify session exists and supports transcription
        const session = await db.conferenceSession.findUnique({
            where: { sessionId: validatedData.sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Conference session not found' },
                { status: 404 }
            );
        }

        if (!session.transcriptionEnabled) {
            return NextResponse.json(
                { success: false, error: 'Transcription not enabled for this session' },
                { status: 400 }
            );
        }

        // Check if transcription already exists
        const existingTranscription = await db.conferenceTranscription.findFirst({
            where: {
                sessionId: session.id,
                provider: validatedData.provider,
            },
        });

        if (existingTranscription) {
            return NextResponse.json({
                success: true,
                data: existingTranscription,
                message: 'Live transcription already active',
            });
        }

        // Initialize cultural settings for Malayalam support
        const culturalSettings = session.malayalamSupport || validatedData.enableMalayalamProcessing ? {
            respectLevels: {},
            culturalTone: {},
            languageMix: {},
        } : null;

        // Create live transcription
        const transcription = await db.conferenceTranscription.create({
            data: {
                sessionId: session.id,
                provider: validatedData.provider,
                language: session.primaryLanguage || validatedData.language,
                overallConfidence: 0.0,
                processingTime: 0,
                speakerSegments: [],
                actionItems: [],
                decisions: [],
                languageMix: culturalSettings?.languageMix || null,
                culturalTone: culturalSettings?.culturalTone || null,
                respectLevels: culturalSettings?.respectLevels || null,
            },
            include: {
                session: {
                    select: {
                        sessionId: true,
                        title: true,
                        malayalamSupport: true,
                    },
                },
            },
        });

        // Log transcription start for monitoring
        console.log(`Live transcription started for session ${validatedData.sessionId}: ${transcription.id}`);

        return NextResponse.json({
            success: true,
            data: transcription,
            message: 'Live transcription started successfully',
            config: {
                speakerIdentification: validatedData.enableSpeakerIdentification,
                sentimentAnalysis: validatedData.enableSentimentAnalysis,
                malayalamProcessing: validatedData.enableMalayalamProcessing || session.malayalamSupport,
                culturalAnalysis: validatedData.culturalAnalysisEnabled,
            },
        });
    } catch (error: unknown) {
        console.error('Error starting live transcription:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

// PATCH /api/cloud-communication/conference/live-transcription - Add transcription segment
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...segmentData } = body;

        if (action === 'add_segment') {
            const validatedSegment = TranscriptionSegmentSchema.parse(segmentData);

            // Get current transcription
            const transcription = await db.conferenceTranscription.findUnique({
                where: { id: validatedSegment.transcriptionId },
                include: { session: true },
            });

            if (!transcription) {
                return NextResponse.json(
                    { success: false, error: 'Transcription not found' },
                    { status: 404 }
                );
            }

            // Process cultural analysis for Malayalam content
            let culturalAnalysis = null;
            if (transcription.session.malayalamSupport && validatedSegment.culturalContext) {
                culturalAnalysis = processCulturalContext(
                    validatedSegment.text,
                    validatedSegment.culturalContext
                );
            }

            // Add segment to existing segments
            const currentSegments = Array.isArray(transcription.speakerSegments)
                ? transcription.speakerSegments as any[]
                : [];

            const newSegment = {
                ...validatedSegment,
                timestamp: new Date().toISOString(),
                culturalAnalysis,
            };

            const updatedSegments = [...currentSegments, newSegment];

            // Calculate updated confidence
            const segmentConfidences = updatedSegments.map(s => s.confidence || 0.8);
            const avgConfidence = segmentConfidences.reduce((sum, conf) => sum + conf, 0) / segmentConfidences.length;

            // Update transcription with new segment
            const updatedTranscription = await db.conferenceTranscription.update({
                where: { id: validatedSegment.transcriptionId },
                data: {
                    speakerSegments: updatedSegments,
                    overallConfidence: avgConfidence,
                    updatedAt: new Date(),
                },
            });

            return NextResponse.json({
                success: true,
                data: updatedTranscription,
                message: 'Transcription segment added successfully',
                segmentCount: updatedSegments.length,
            });
        }

        if (action === 'finalize') {
            const { transcriptionId, summary, actionItems, decisions } = body;

            if (!transcriptionId) {
                return NextResponse.json(
                    { success: false, error: 'Transcription ID is required' },
                    { status: 400 }
                );
            }

            // Finalize transcription with summary and extracted insights
            const finalizedTranscription = await db.conferenceTranscription.update({
                where: { id: transcriptionId },
                data: {
                    summary: summary || null,
                    actionItems: actionItems || [],
                    decisions: decisions || [],
                    processingTime: Date.now() - new Date().getTime(), // Rough calculation
                    updatedAt: new Date(),
                },
                include: {
                    session: {
                        select: {
                            sessionId: true,
                            title: true,
                        },
                    },
                },
            });

            return NextResponse.json({
                success: true,
                data: finalizedTranscription,
                message: 'Transcription finalized successfully',
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action specified' },
            { status: 400 }
        );
    } catch (error: unknown) {
        console.error('Error updating live transcription:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

// Helper functions
function calculateCulturalScore(transcription: any): number {
    // Calculate cultural alignment score based on various factors
    let score = 80; // Base score

    if (transcription.respectLevels) {
        const respectData = transcription.respectLevels as any;
        if (respectData.highRespect > 0.7) score += 10;
        if (respectData.appropriate > 0.8) score += 5;
    }

    if (transcription.culturalTone) {
        const toneData = transcription.culturalTone as any;
        if (toneData.formal && toneData.respectful) score += 8;
    }

    if (transcription.languageMix) {
        const mixData = transcription.languageMix as any;
        if (mixData.smooth && mixData.contextual) score += 7;
    }

    return Math.min(score, 100);
}

function calculateMalayalamAccuracy(transcription: any): number {
    // Calculate Malayalam-specific transcription accuracy
    const baseAccuracy = (transcription.overallConfidence || 0.8) * 100;

    // Adjust based on cultural context
    if (transcription.languageMix) {
        const mixData = transcription.languageMix as any;
        if (mixData.malayalamPrimary) return Math.min(baseAccuracy + 5, 98);
        if (mixData.codeSwitch) return Math.max(baseAccuracy - 3, 75);
    }

    return baseAccuracy;
}

function processCulturalContext(text: string, context: any): any {
    // Process cultural context for Malayalam content
    return {
        respectMarkers: detectRespectMarkers(text),
        formalityIndicators: detectFormalityLevel(text),
        emotionalCues: detectEmotionalCues(text),
        contextualAppropriate: true, // Simplified - would use NLP in production
    };
}

function detectRespectMarkers(text: string): any {
    // Detect Malayalam respect markers in text
    const respectWords = ['sar', 'madam', 'ji', 'chetta', 'chechi'];
    const foundMarkers = respectWords.filter(word =>
        text.toLowerCase().includes(word)
    );

    return {
        markers: foundMarkers,
        level: foundMarkers.length > 1 ? 'high' : foundMarkers.length > 0 ? 'medium' : 'low',
    };
}

function detectFormalityLevel(text: string): string {
    // Detect formality level in text
    const formalWords = ['please', 'thank you', 'kindly', 'sir', 'madam'];
    const casualWords = ['hey', 'ok', 'cool', 'yeah'];

    const formalCount = formalWords.filter(word =>
        text.toLowerCase().includes(word)
    ).length;

    const casualCount = casualWords.filter(word =>
        text.toLowerCase().includes(word)
    ).length;

    if (formalCount > casualCount) return 'formal';
    if (casualCount > formalCount) return 'informal';
    return 'mixed';
}

function detectEmotionalCues(text: string): string {
    // Detect emotional tone in text
    const positiveWords = ['good', 'great', 'excellent', 'satisfied', 'happy'];
    const negativeWords = ['bad', 'terrible', 'frustrated', 'angry', 'upset'];

    const positiveCount = positiveWords.filter(word =>
        text.toLowerCase().includes(word)
    ).length;

    const negativeCount = negativeWords.filter(word =>
        text.toLowerCase().includes(word)
    ).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}