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

// Conference Session Creation Schema
const CreateConferenceSessionSchema = z.object({
    title: z.string().min(1, 'Conference title is required'),
    description: z.string().optional(),
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format').optional(),
    maxParticipants: z.number().int().min(1).max(500).default(50),
    conferenceType: z.enum(['audio_only', 'video', 'screen_share']).default('audio_only'),
    quality: z.enum(['sd', 'hd', 'fhd']).default('hd'),
    recordingEnabled: z.boolean().default(true),
    transcriptionEnabled: z.boolean().default(true),
    purpose: z.string().optional(),
    department: z.string().optional(),
    ticketId: z.string().optional(),
    primaryLanguage: z.string().default('en'),
    culturalMode: z.enum(['standard', 'formal', 'casual']).default('standard'),
    malayalamSupport: z.boolean().default(false),
});

// Conference Session Update Schema
const UpdateConferenceSessionSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    endTime: z.string().datetime().optional(),
    status: z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
    participantCount: z.number().int().min(0).optional(),
    totalSpeakingTime: z.number().int().min(0).optional(),
});

// GET /api/cloud-communication/conference - List conference sessions
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
        const status = searchParams.get('status');
        const purpose = searchParams.get('purpose');
        const department = searchParams.get('department');
        const malayalamOnly = searchParams.get('malayalam') === 'true';
        const skip = (page - 1) * limit;

        // Build filter conditions
        const whereClause: any = {};
        if (status) whereClause.status = status;
        if (purpose) whereClause.purpose = purpose;
        if (department) whereClause.department = department;
        if (malayalamOnly) whereClause.malayalamSupport = true;

        // Get conference sessions with pagination
        const [sessions, totalCount] = await Promise.all([
            db.conferenceSession.findMany({
                where: whereClause,
                include: {
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                            status: true,
                            joinTime: true,
                            leaveTime: true,
                            speakingTime: true,
                        },
                    },
                    recordings: {
                        select: {
                            id: true,
                            recordingUrl: true,
                            duration: true,
                            processingStatus: true,
                        },
                    },
                    transcriptions: {
                        select: {
                            id: true,
                            provider: true,
                            language: true,
                            overallConfidence: true,
                            summary: true,
                        },
                    },
                    _count: {
                        select: {
                            participants: true,
                            recordings: true,
                            transcriptions: true,
                        },
                    },
                },
                orderBy: { startTime: 'desc' },
                skip,
                take: limit,
            }),
            db.conferenceSession.count({ where: whereClause }),
        ]);

        // Calculate cultural engagement metrics
        const sessionsWithMetrics = sessions.map(session => {
            const activeSpeakers = session.participants.filter(p => p.speakingTime > 0).length;
            const avgParticipation = session.participants.length > 0
                ? session.participants.reduce((sum, p) => sum + (p.speakingTime || 0), 0) / session.participants.length
                : 0;

            const culturalMetrics = {
                malayalamEngagement: session.malayalamSupport ?
                    (session.participants.filter(p => p.speakingTime > avgParticipation).length / Math.max(session.participants.length, 1)) * 100 : 0,
                speakerDistribution: activeSpeakers,
                avgParticipationTime: Math.round(avgParticipation),
                culturalBalance: session.culturalMode === 'formal' ? 85 : session.culturalMode === 'casual' ? 75 : 80,
            };

            return {
                ...session,
                culturalMetrics,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                sessions: sessionsWithMetrics,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    hasNext: page * limit < totalCount,
                    hasPrev: page > 1,
                },
                summary: {
                    totalSessions: totalCount,
                    activeSessions: sessions.filter(s => s.status === 'active').length,
                    malayalamSessions: sessions.filter(s => s.malayalamSupport).length,
                    avgParticipants: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.participantCount, 0) / sessions.length : 0,
                },
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching conference sessions:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 500 }
        );
    }
}

// POST /api/cloud-communication/conference - Create new conference session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = CreateConferenceSessionSchema.parse(body);

        // Generate unique session ID
        const sessionId = `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create conference session
        const conferenceSession = await db.conferenceSession.create({
            data: {
                sessionId,
                ...validatedData,
                startTime: new Date(validatedData.startTime),
                endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
            },
            include: {
                participants: true,
                recordings: true,
                transcriptions: true,
            },
        });

        // Log successful creation for monitoring
        console.log(`Conference session created: ${sessionId} - "${conferenceSession.title}"`);

        return NextResponse.json({
            success: true,
            data: conferenceSession,
            message: 'Conference session created successfully',
            sessionId: sessionId,
        });
    } catch (error: unknown) {
        console.error('Error creating conference session:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

// PATCH /api/cloud-communication/conference - Update conference session
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, ...updateData } = body;

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const validatedData = UpdateConferenceSessionSchema.parse(updateData);

        // Update conference session
        const updatedSession = await db.conferenceSession.update({
            where: { sessionId },
            data: {
                ...validatedData,
                endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
                updatedAt: new Date(),
            },
            include: {
                participants: true,
                recordings: true,
                transcriptions: true,
                _count: {
                    select: {
                        participants: true,
                        recordings: true,
                        transcriptions: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedSession,
            message: 'Conference session updated successfully',
        });
    } catch (error: unknown) {
        console.error('Error updating conference session:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

// DELETE /api/cloud-communication/conference - Delete conference session
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Check if session exists and can be deleted
        const session = await db.conferenceSession.findUnique({
            where: { sessionId },
            include: { participants: true },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Conference session not found' },
                { status: 404 }
            );
        }

        // Prevent deletion of active sessions with participants
        if (session.status === 'active' && session.participants.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Cannot delete active session with participants. End the session first.'
                },
                { status: 400 }
            );
        }

        // Delete conference session (cascade will handle related records)
        await db.conferenceSession.delete({
            where: { sessionId },
        });

        return NextResponse.json({
            success: true,
            message: 'Conference session deleted successfully',
            sessionId,
        });
    } catch (error: unknown) {
        console.error('Error deleting conference session:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 500 }
        );
    }
}