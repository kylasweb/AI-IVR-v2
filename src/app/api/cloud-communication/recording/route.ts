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
// Cloud Call Recording API
// Phase 1 Implementation  
// ========================

const RecordingRequestSchema = z.object({
    callId: z.string().min(1),
    sessionId: z.string().optional(),
    startTime: z.string().datetime(),
    callType: z.enum(['inbound', 'outbound', 'conference']),
    participantCount: z.number().min(1).default(1),
    primaryLanguage: z.string().default('en'),
    malayalamContent: z.boolean().default(false),
    recordingFormat: z.string().default('wav'),
    retentionPolicy: z.string().default('standard'),
    gdprCompliant: z.boolean().default(true),
    hipaaCompliant: z.boolean().default(false),
});

const RecordingUpdateSchema = z.object({
    endTime: z.string().datetime().optional(),
    duration: z.number().optional(),
    recordingUrl: z.string().url().optional(),
    recordingSize: z.number().optional(),
    audioQuality: z.number().min(1).max(5).optional(),
    noiseLevel: z.number().min(0).max(1).optional(),
    signalStrength: z.number().min(0).max(1).optional(),
    culturalContext: z.any().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = RecordingRequestSchema.parse(body);

        // Create new call recording entry
        const callRecord = await db.callRecord.create({
            data: {
                callId: validatedData.callId,
                sessionId: validatedData.sessionId,
                startTime: new Date(validatedData.startTime),
                callType: validatedData.callType,
                participantCount: validatedData.participantCount,
                recordingFormat: validatedData.recordingFormat,
                primaryLanguage: validatedData.primaryLanguage,
                malayalamContent: validatedData.malayalamContent,
                retentionPolicy: validatedData.retentionPolicy,
                gdprCompliant: validatedData.gdprCompliant,
                hipaaCompliant: validatedData.hipaaCompliant,
                // Calculate retention expiry based on policy
                retentionExpiry: calculateRetentionExpiry(validatedData.retentionPolicy),
            },
        });

        return NextResponse.json({
            success: true,
            data: callRecord,
            message: 'Call recording initialized successfully',
        });
    } catch (error: unknown) {
        console.error('Error initializing call recording:', error);
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
        const { callId, ...updateData } = body;

        if (!callId) {
            return NextResponse.json(
                { success: false, error: 'Call ID is required' },
                { status: 400 }
            );
        }

        const validatedData = RecordingUpdateSchema.parse(updateData);

        // Update existing call recording
        const updatedRecord = await db.callRecord.update({
            where: { callId },
            data: {
                ...validatedData,
                endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
                updatedAt: new Date(),
            },
        });

        // If recording is complete, trigger transcription processing
        if (validatedData.recordingUrl && validatedData.endTime) {
            await triggerTranscriptionProcessing(updatedRecord);
        }

        return NextResponse.json({
            success: true,
            data: updatedRecord,
            message: 'Call recording updated successfully',
        });
    } catch (error: unknown) {
        console.error('Error updating call recording:', error);
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
        const callId = searchParams.get('callId');
        const sessionId = searchParams.get('sessionId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (callId) {
            // Get specific call recording
            const callRecord = await db.callRecord.findUnique({
                where: { callId },
                include: {
                    transcription: true,
                },
            });

            if (!callRecord) {
                return NextResponse.json(
                    { success: false, error: 'Call recording not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: callRecord,
            });
        }

        // Get multiple recordings with filters
        const where: any = {};
        if (sessionId) where.sessionId = sessionId;

        const recordings = await db.callRecord.findMany({
            where,
            include: {
                transcription: true,
            },
            orderBy: { startTime: 'desc' },
            take: limit,
            skip: offset,
        });

        const total = await db.callRecord.count({ where });

        return NextResponse.json({
            success: true,
            data: recordings,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching call recordings:', error);
        return NextResponse.json(
            { success: false, error: formatError(error) },
            { status: 500 }
        );
    }
}

// Helper Functions
function calculateRetentionExpiry(policy: string): Date {
    const now = new Date();

    switch (policy) {
        case 'standard':
            return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
        case 'extended':
            return new Date(now.getTime() + 7 * 365 * 24 * 60 * 60 * 1000); // 7 years
        case 'legal_hold':
            return new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000); // 10 years
        default:
            return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Default 1 year
    }
}

async function triggerTranscriptionProcessing(callRecord: any) {
    try {
        // Initialize transcription processing
        // This would trigger the transcription service
        console.log(`Triggering transcription for call ${callRecord.callId}`);

        // Create transcription record
        await db.callTranscription.create({
            data: {
                callRecordId: callRecord.id,
                provider: 'azure', // Default provider
                language: callRecord.primaryLanguage === 'ml' ? 'ml-IN' : 'en-IN',
                malayalamAccuracy: callRecord.malayalamContent ? 0.0 : undefined,
            },
        });

        // TODO: Integrate with actual transcription service
        // - Azure Speech Service
        // - Google Cloud Speech-to-Text
        // - Custom Malayalam STT engine

    } catch (error) {
        console.error('Error triggering transcription:', error);
    }
}

// Quality scoring algorithm
export function calculateAudioQuality(
    signalStrength: number,
    noiseLevel: number,
    duration: number
): number {
    // MOS calculation (Mean Opinion Score 1-5)
    let score = 5.0;

    // Penalize low signal strength
    if (signalStrength < 0.8) score -= (0.8 - signalStrength) * 2;
    if (signalStrength < 0.6) score -= 0.5;

    // Penalize high noise levels
    if (noiseLevel > 0.3) score -= (noiseLevel - 0.3) * 2;
    if (noiseLevel > 0.5) score -= 0.5;

    // Short calls might have quality issues
    if (duration < 30) score -= 0.3;

    return Math.max(1.0, Math.min(5.0, score));
}