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

// Participant Creation Schema
const CreateParticipantSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    userId: z.string().optional(),
    name: z.string().min(1, 'Participant name is required'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.enum(['host', 'moderator', 'participant']).default('participant'),
    preferredLanguage: z.string().default('en'),
    culturalContext: z.any().optional(),
});

// Participant Update Schema
const UpdateParticipantSchema = z.object({
    name: z.string().min(1).optional(),
    role: z.enum(['host', 'moderator', 'participant']).optional(),
    joinTime: z.string().datetime().optional(),
    leaveTime: z.string().datetime().optional(),
    speakingTime: z.number().int().min(0).optional(),
    participationScore: z.number().min(0).max(1).optional(),
    averageSignal: z.number().min(0).max(1).optional(),
    networkQuality: z.number().min(0).max(1).optional(),
    audioIssues: z.any().optional(),
    status: z.enum(['invited', 'joined', 'left', 'disconnected']).optional(),
});

// GET /api/cloud-communication/conference/participants - List participants
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const role = searchParams.get('role');
        const status = searchParams.get('status');
        const includeMetrics = searchParams.get('metrics') === 'true';

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Build filter conditions
        const whereClause: any = { sessionId };
        if (role) whereClause.role = role;
        if (status) whereClause.status = status;

        // Get participants
        const participants = await db.conferenceParticipant.findMany({
            where: whereClause,
            include: {
                session: {
                    select: {
                        title: true,
                        status: true,
                        startTime: true,
                        malayalamSupport: true,
                        culturalMode: true,
                    },
                },
            },
            orderBy: [
                { role: 'asc' }, // hosts/moderators first
                { joinTime: 'desc' }, // then by join order
            ],
        });

        // Calculate enhanced metrics if requested
        let participantsWithMetrics = participants;
        if (includeMetrics) {
            const sessionData = await db.conferenceSession.findUnique({
                where: { sessionId },
                select: { totalSpeakingTime: true, startTime: true },
            });

            participantsWithMetrics = participants.map(participant => {
                const sessionDuration = sessionData?.startTime
                    ? (participant.leaveTime?.getTime() || Date.now()) - (participant.joinTime?.getTime() || sessionData.startTime.getTime())
                    : 0;

                const engagementMetrics = {
                    speakingRatio: sessionData?.totalSpeakingTime ?
                        ((participant.speakingTime || 0) / sessionData.totalSpeakingTime) * 100 : 0,
                    sessionDuration: Math.max(sessionDuration / 1000, 0), // Convert to seconds
                    participationEfficiency: sessionDuration > 0 ?
                        ((participant.speakingTime || 0) / (sessionDuration / 1000)) * 100 : 0,
                    culturalAlignment: participant.session.malayalamSupport ?
                        (participant.preferredLanguage === 'ml' ? 95 : 75) : 80,
                };

                return {
                    ...participant,
                    engagementMetrics,
                };
            });
        }

        // Calculate session-level participant analytics
        const analytics = {
            totalParticipants: participants.length,
            activeParticipants: participants.filter(p => p.status === 'joined').length,
            hostCount: participants.filter(p => p.role === 'host').length,
            moderatorCount: participants.filter(p => p.role === 'moderator').length,
            malayalamSpeakers: participants.filter(p => p.preferredLanguage === 'ml').length,
            avgParticipationScore: participants.length > 0 ?
                participants.reduce((sum, p) => sum + (p.participationScore || 0), 0) / participants.length : 0,
            totalSpeakingTime: participants.reduce((sum, p) => sum + (p.speakingTime || 0), 0),
        };

        return NextResponse.json({
            success: true,
            data: {
                participants: participantsWithMetrics,
                analytics,
                session: participants[0]?.session || null,
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching conference participants:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 500 }
        );
    }
}

// POST /api/cloud-communication/conference/participants - Add participant
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = CreateParticipantSchema.parse(body);

        // Verify session exists and is not at capacity
        const session = await db.conferenceSession.findUnique({
            where: { sessionId: validatedData.sessionId },
            include: { _count: { select: { participants: true } } },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Conference session not found' },
                { status: 404 }
            );
        }

        if (session._count.participants >= session.maxParticipants) {
            return NextResponse.json(
                { success: false, error: 'Conference session is at maximum capacity' },
                { status: 400 }
            );
        }

        // Check for duplicate participants
        const existingParticipant = await db.conferenceParticipant.findFirst({
            where: {
                sessionId: validatedData.sessionId,
                OR: [
                    { email: validatedData.email },
                    { phone: validatedData.phone },
                    { userId: validatedData.userId },
                ].filter(condition => Object.values(condition)[0] != null),
            },
        });

        if (existingParticipant) {
            return NextResponse.json(
                { success: false, error: 'Participant already exists in this session' },
                { status: 400 }
            );
        }

        // Create participant
        const participant = await db.conferenceParticipant.create({
            data: {
                ...validatedData,
                culturalContext: validatedData.culturalContext || {},
            },
            include: {
                session: {
                    select: {
                        title: true,
                        startTime: true,
                        malayalamSupport: true,
                    },
                },
            },
        });

        // Update session participant count
        await db.conferenceSession.update({
            where: { sessionId: validatedData.sessionId },
            data: {
                participantCount: { increment: 1 },
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            data: participant,
            message: 'Participant added successfully',
        });
    } catch (error: unknown) {
        console.error('Error adding participant:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

// PATCH /api/cloud-communication/conference/participants - Update participant
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { participantId, ...updateData } = body;

        if (!participantId) {
            return NextResponse.json(
                { success: false, error: 'Participant ID is required' },
                { status: 400 }
            );
        }

        const validatedData = UpdateParticipantSchema.parse(updateData);

        // Handle datetime conversions
        const processedData: any = { ...validatedData };
        if (validatedData.joinTime) {
            processedData.joinTime = new Date(validatedData.joinTime);
        }
        if (validatedData.leaveTime) {
            processedData.leaveTime = new Date(validatedData.leaveTime);
        }

        // Update participant
        const updatedParticipant = await db.conferenceParticipant.update({
            where: { id: participantId },
            data: {
                ...processedData,
                updatedAt: new Date(),
            },
            include: {
                session: {
                    select: {
                        sessionId: true,
                        title: true,
                        malayalamSupport: true,
                        totalSpeakingTime: true,
                    },
                },
            },
        });

        // Update session speaking time if participant speaking time changed
        if (validatedData.speakingTime !== undefined) {
            const allParticipants = await db.conferenceParticipant.findMany({
                where: { sessionId: updatedParticipant.session.sessionId },
                select: { speakingTime: true },
            });

            const totalSpeakingTime = allParticipants.reduce(
                (sum, p) => sum + (p.speakingTime || 0), 0
            );

            await db.conferenceSession.update({
                where: { sessionId: updatedParticipant.session.sessionId },
                data: { totalSpeakingTime },
            });
        }

        return NextResponse.json({
            success: true,
            data: updatedParticipant,
            message: 'Participant updated successfully',
        });
    } catch (error: unknown) {
        console.error('Error updating participant:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

// DELETE /api/cloud-communication/conference/participants - Remove participant
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const participantId = searchParams.get('participantId');

        if (!participantId) {
            return NextResponse.json(
                { success: false, error: 'Participant ID is required' },
                { status: 400 }
            );
        }

        // Get participant info before deletion
        const participant = await db.conferenceParticipant.findUnique({
            where: { id: participantId },
            include: { session: { select: { sessionId: true } } },
        });

        if (!participant) {
            return NextResponse.json(
                { success: false, error: 'Participant not found' },
                { status: 404 }
            );
        }

        // Delete participant
        await db.conferenceParticipant.delete({
            where: { id: participantId },
        });

        // Update session participant count
        await db.conferenceSession.update({
            where: { sessionId: participant.session.sessionId },
            data: {
                participantCount: { decrement: 1 },
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Participant removed successfully',
            participantId,
        });
    } catch (error: unknown) {
        console.error('Error removing participant:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 500 }
        );
    }
}