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

// ========================
// Call Transcription API
// Phase 1 Implementation
// ========================

const TranscriptionRequestSchema = z.object({
    callRecordId: z.string().min(1),
    provider: z.enum(['azure', 'google', 'openai', 'custom']).default('azure'),
    language: z.string().default('en-IN'),
    processingPriority: z.enum(['low', 'normal', 'high']).default('normal'),
    culturalAnalysis: z.boolean().default(false),
    realtimeMode: z.boolean().default(false),
});

const TranscriptionUpdateSchema = z.object({
    fullTranscript: z.string().optional(),
    segments: z.any().optional(), // JSON segments with timestamps
    summary: z.string().optional(),
    keyPhrases: z.any().optional(),
    sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
    confidence: z.number().min(0).max(1).optional(),
    processingTime: z.number().optional(),
    culturalTone: z.string().optional(),
    malayalamAccuracy: z.number().min(0).max(1).optional(),
    codeSwiting: z.any().optional(), // Code switching analysis
    wordCount: z.number().optional(),
    speakerCount: z.number().optional(),
    silenceDuration: z.number().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = TranscriptionRequestSchema.parse(body);

        // Verify call record exists
        const callRecord = await db.callRecord.findUnique({
            where: { id: validatedData.callRecordId },
        });

        if (!callRecord) {
            return NextResponse.json(
                { success: false, error: 'Call record not found' },
                { status: 404 }
            );
        }

        // Check if transcription already exists
        const existingTranscription = await db.callTranscription.findUnique({
            where: { callRecordId: validatedData.callRecordId },
        });

        if (existingTranscription) {
            return NextResponse.json(
                { success: false, error: 'Transcription already exists for this call' },
                { status: 409 }
            );
        }

        // Create transcription record
        const transcription = await db.callTranscription.create({
            data: {
                callRecordId: validatedData.callRecordId,
                provider: validatedData.provider,
                language: validatedData.language,
                malayalamAccuracy: callRecord.malayalamContent ? 0.0 : undefined,
            },
        });

        // Trigger actual transcription processing
        if (validatedData.realtimeMode) {
            await initializeRealtimeTranscription(transcription, callRecord);
        } else {
            await queueTranscriptionJob(transcription, callRecord, validatedData.processingPriority);
        }

        return NextResponse.json({
            success: true,
            data: transcription,
            message: 'Transcription initialized successfully',
        });
    } catch (error: unknown) {
        console.error('Error initializing transcription:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { transcriptionId, ...updateData } = body;

        if (!transcriptionId) {
            return NextResponse.json(
                { success: false, error: 'Transcription ID is required' },
                { status: 400 }
            );
        }

        const validatedData = TranscriptionUpdateSchema.parse(updateData);

        // Update transcription with results
        const updatedTranscription = await db.callTranscription.update({
            where: { id: transcriptionId },
            data: {
                ...validatedData,
                updatedAt: new Date(),
            },
            include: {
                callRecord: true,
            },
        });

        // Trigger cultural analysis if Malayalam content detected
        if (updatedTranscription.callRecord.malayalamContent && validatedData.fullTranscript) {
            await analyzeCulturalContext(updatedTranscription, validatedData.fullTranscript);
        }

        // Generate quality metrics
        const qualityMetrics = calculateTranscriptionQuality(updatedTranscription);

        return NextResponse.json({
            success: true,
            data: updatedTranscription,
            qualityMetrics,
            message: 'Transcription updated successfully',
        });
    } catch (error: unknown) {
        console.error('Error updating transcription:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const transcriptionId = searchParams.get('transcriptionId');
        const callRecordId = searchParams.get('callRecordId');
        const language = searchParams.get('language');
        const provider = searchParams.get('provider');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (transcriptionId) {
            // Get specific transcription
            const transcription = await db.callTranscription.findUnique({
                where: { id: transcriptionId },
                include: {
                    callRecord: true,
                },
            });

            if (!transcription) {
                return NextResponse.json(
                    { success: false, error: 'Transcription not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: transcription,
            });
        }

        // Build filters
        const where: any = {};
        if (callRecordId) where.callRecordId = callRecordId;
        if (language) where.language = language;
        if (provider) where.provider = provider;

        const transcriptions = await db.callTranscription.findMany({
            where,
            include: {
                callRecord: {
                    select: {
                        callId: true,
                        startTime: true,
                        duration: true,
                        callType: true,
                        primaryLanguage: true,
                        malayalamContent: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        const total = await db.callTranscription.count({ where });

        return NextResponse.json({
            success: true,
            data: transcriptions,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error('Error fetching transcriptions:', error);
        return NextResponse.json(
            { success: false, error: String(error) || 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper Functions

async function initializeRealtimeTranscription(transcription: any, callRecord: any) {
    try {
        console.log(`Starting realtime transcription for call ${callRecord.callId}`);

        // Initialize WebSocket connection for real-time streaming
        // This would connect to Azure Speech Service or similar
        const realtimeConfig = {
            transcriptionId: transcription.id,
            language: transcription.language,
            enableCulturalAnalysis: callRecord.malayalamContent,
            enableSpeakerDiarization: callRecord.participantCount > 1,
        };

        // TODO: Implement actual real-time transcription service
        // - WebSocket connection to STT service
        // - Stream audio chunks
        // - Process results in real-time
        // - Update transcription segments

        console.log('Realtime transcription configured:', realtimeConfig);
    } catch (error) {
        console.error('Error initializing realtime transcription:', error);
    }
}

async function queueTranscriptionJob(transcription: any, callRecord: any, priority: string) {
    try {
        console.log(`Queuing transcription job for call ${callRecord.callId} with priority ${priority}`);

        // Queue the transcription job based on priority
        const jobConfig = {
            transcriptionId: transcription.id,
            recordingUrl: callRecord.recordingUrl,
            language: transcription.language,
            priority: priority,
            culturalAnalysis: callRecord.malayalamContent,
            estimatedProcessingTime: estimateProcessingTime(callRecord.duration, priority),
        };

        // TODO: Implement job queue system
        // - Redis queue with Bull or similar
        // - Priority-based job processing
        // - Progress tracking
        // - Error handling and retries

        console.log('Transcription job queued:', jobConfig);
    } catch (error) {
        console.error('Error queuing transcription job:', error);
    }
}

async function analyzeCulturalContext(transcription: any, transcript: string) {
    try {
        // Analyze cultural context for Malayalam content
        const culturalAnalysis = {
            respectLevel: analyzeMalayalamRespectLevel(transcript),
            formalityLevel: analyzeFormalityLevel(transcript),
            emotionalTone: analyzeEmotionalTone(transcript),
            regionalDialect: detectRegionalDialect(transcript),
            codeSwithcing: detectCodeSwitching(transcript),
        };

        // Update transcription with cultural analysis
        await db.callTranscription.update({
            where: { id: transcription.id },
            data: {
                culturalTone: culturalAnalysis.respectLevel,
                codeSwiting: culturalAnalysis.codeSwithcing,
            },
        });

        console.log('Cultural analysis completed for transcription:', transcription.id);
    } catch (error) {
        console.error('Error analyzing cultural context:', error);
    }
}

function calculateTranscriptionQuality(transcription: any) {
    const quality = {
        overallScore: 0.0,
        accuracyScore: transcription.confidence || 0.0,
        completenessScore: 0.0,
        culturalScore: 0.0,
        processingEfficiency: 0.0,
    };

    // Calculate completeness based on word count vs expected duration
    if (transcription.wordCount && transcription.callRecord?.duration) {
        const expectedWords = (transcription.callRecord.duration / 60) * 150; // ~150 words per minute
        quality.completenessScore = Math.min(1.0, transcription.wordCount / expectedWords);
    }

    // Cultural accuracy for Malayalam content
    if (transcription.malayalamAccuracy !== null) {
        quality.culturalScore = transcription.malayalamAccuracy;
    }

    // Processing efficiency (faster is better, within reason)
    if (transcription.processingTime && transcription.callRecord?.duration) {
        const efficiency = transcription.callRecord.duration / transcription.processingTime;
        quality.processingEfficiency = Math.min(1.0, efficiency / 2); // Real-time = 0.5 efficiency
    }

    // Overall score
    quality.overallScore = (
        quality.accuracyScore * 0.4 +
        quality.completenessScore * 0.3 +
        quality.culturalScore * 0.2 +
        quality.processingEfficiency * 0.1
    );

    return quality;
}

function estimateProcessingTime(duration: number, priority: string): number {
    if (!duration) return 300; // Default 5 minutes

    const baseTime = duration * 0.3; // 30% of call duration as base processing time

    switch (priority) {
        case 'high':
            return Math.max(30, baseTime * 0.5); // High priority: 50% faster
        case 'normal':
            return baseTime;
        case 'low':
            return baseTime * 2; // Low priority: Take longer but use fewer resources
        default:
            return baseTime;
    }
}

// Malayalam Cultural Analysis Functions
function analyzeMalayalamRespectLevel(transcript: string): string {
    // Analyze respect markers in Malayalam
    const respectMarkers = ['സാർ', 'മാഡം', 'അവർ', 'ഇദ്ദേഹം', 'അങ്ങ്'];
    const casualMarkers = ['നീ', 'ഞാൻ', 'ഇവൻ', 'അവൻ'];

    let respectCount = 0;
    let casualCount = 0;

    respectMarkers.forEach(marker => {
        respectCount += (transcript.match(new RegExp(marker, 'g')) || []).length;
    });

    casualMarkers.forEach(marker => {
        casualCount += (transcript.match(new RegExp(marker, 'g')) || []).length;
    });

    if (respectCount > casualCount * 2) return 'formal';
    if (casualCount > respectCount * 2) return 'casual';
    return 'neutral';
}

function analyzeFormalityLevel(transcript: string): string {
    // Analyze formality in Malayalam speech patterns
    const formalPatterns = ['അനുവാദം', 'സഹായം', 'ദയവായി', 'ക്ഷമിക്കണം'];
    const informalPatterns = ['പോടാ', 'വന്നോ', 'ഇല്ലെ', 'അല്ലേ'];

    const formalScore = formalPatterns.reduce((score, pattern) => {
        return score + (transcript.match(new RegExp(pattern, 'g')) || []).length;
    }, 0);

    const informalScore = informalPatterns.reduce((score, pattern) => {
        return score + (transcript.match(new RegExp(pattern, 'g')) || []).length;
    }, 0);

    if (formalScore > informalScore) return 'formal';
    if (informalScore > formalScore) return 'informal';
    return 'neutral';
}

function analyzeEmotionalTone(transcript: string): string {
    // Basic emotional tone analysis for Malayalam
    const positiveWords = ['നന്നായി', 'സന്തോഷം', 'നല്ലത്', 'മികച്ച'];
    const negativeWords = ['വിഷമം', 'ദുഃഖം', 'പ്രശ്നം', 'ബുദ്ധിമുട്ട്'];

    const positiveCount = positiveWords.reduce((count, word) => {
        return count + (transcript.match(new RegExp(word, 'g')) || []).length;
    }, 0);

    const negativeCount = negativeWords.reduce((count, word) => {
        return count + (transcript.match(new RegExp(word, 'g')) || []).length;
    }, 0);

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

function detectRegionalDialect(transcript: string): string {
    // Detect Malayalam regional dialects (simplified)
    const kochiPatterns = ['ഏട്ടൻ', 'ചേച്ചി', 'അണ്ണൻ'];
    const thiruvananthapuramPatterns = ['അച്ഛൻ', 'അമ്മ', 'അണ്ണാ'];
    const kozhikodePatterns = ['മാഷ്', 'ബായി', 'ഏട്ടാ'];

    const kochiScore = kochiPatterns.reduce((score, pattern) => {
        return score + (transcript.match(new RegExp(pattern, 'g')) || []).length;
    }, 0);

    const tvrScore = thiruvananthapuramPatterns.reduce((score, pattern) => {
        return score + (transcript.match(new RegExp(pattern, 'g')) || []).length;
    }, 0);

    const kozhikodeScore = kozhikodePatterns.reduce((score, pattern) => {
        return score + (transcript.match(new RegExp(pattern, 'g')) || []).length;
    }, 0);

    if (kochiScore > tvrScore && kochiScore > kozhikodeScore) return 'kochi';
    if (tvrScore > kozhikodeScore) return 'thiruvananthapuram';
    if (kozhikodeScore > 0) return 'kozhikode';
    return 'general';
}

function detectCodeSwitching(transcript: string): any {
    // Detect Malayalam-English code switching patterns
    const englishWords = transcript.match(/[a-zA-Z]+/g) || [];
    const malayalamWords = transcript.match(/[\u0D00-\u0D7F]+/g) || [];

    const totalWords = englishWords.length + malayalamWords.length;
    const englishRatio = englishWords.length / totalWords;
    const malayalamRatio = malayalamWords.length / totalWords;

    return {
        hasCodeSwitching: englishRatio > 0.1 && malayalamRatio > 0.1,
        englishRatio,
        malayalamRatio,
        switchingPoints: identifyLanguageSwitches(transcript),
        dominantLanguage: englishRatio > malayalamRatio ? 'english' : 'malayalam',
    };
}

function identifyLanguageSwitches(transcript: string): Array<{ position: number, from: string, to: string }> {
    // Simplified language switch detection
    const switches: Array<{ position: number, from: string, to: string }> = [];
    const words = transcript.split(/\s+/);

    let currentLang = 'unknown';

    words.forEach((word, index) => {
        const isEnglish = /^[a-zA-Z]+$/.test(word);
        const isMalayalam = /[\u0D00-\u0D7F]/.test(word);

        let wordLang = 'unknown';
        if (isEnglish) wordLang = 'english';
        if (isMalayalam) wordLang = 'malayalam';

        if (currentLang !== 'unknown' && currentLang !== wordLang && wordLang !== 'unknown') {
            switches.push({
                position: index,
                from: currentLang,
                to: wordLang,
            });
        }

        if (wordLang !== 'unknown') {
            currentLang = wordLang;
        }
    });

    return switches;
}