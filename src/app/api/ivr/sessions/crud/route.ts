/**
 * IVR Call Sessions CRUD API
 * Complete Create, Read, Update, Delete operations for IVR call sessions
 * Supports Malayalam-first IVR with cultural intelligence
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Session status types
type SessionStatus = 'initialized' | 'active' | 'on_hold' | 'transferred' | 'completed' | 'failed' | 'abandoned';

interface CreateSessionRequest {
    phone_number: string;
    language?: string;
    dialect?: string;
    ivr_flow_id?: string;
    caller_id?: string;
    campaign_id?: string;
    metadata?: Record<string, any>;
}

interface UpdateSessionRequest {
    status?: SessionStatus;
    notes?: string;
    metadata?: Record<string, any>;
    operator_id?: string;
    satisfaction_score?: number;
    resolution_status?: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');
        const status = searchParams.get('status');
        const phone_number = searchParams.get('phone_number');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const include_transcript = searchParams.get('include_transcript') === 'true';
        const date_from = searchParams.get('date_from');
        const date_to = searchParams.get('date_to');

        // Get specific session
        if (sessionId) {
            return await getSession(sessionId, include_transcript);
        }

        // List sessions with filters
        return await listSessions({
            status: status as SessionStatus || undefined,
            phone_number: phone_number || undefined,
            limit,
            offset,
            include_transcript,
            date_from: date_from || undefined,
            date_to: date_to || undefined
        });

    } catch (error) {
        console.error('Error in IVR sessions GET:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateSessionRequest = await request.json();

        if (!body.phone_number) {
            return NextResponse.json(
                { error: 'phone_number is required' },
                { status: 400 }
            );
        }

        return await createSession(body);

    } catch (error) {
        console.error('Error creating IVR session:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'session_id is required' },
                { status: 400 }
            );
        }

        const body: UpdateSessionRequest = await request.json();
        return await updateSession(sessionId, body);

    } catch (error) {
        console.error('Error updating IVR session:', error);
        return NextResponse.json(
            { error: 'Failed to update session' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');
        const permanent = searchParams.get('permanent') === 'true';

        if (!sessionId) {
            return NextResponse.json(
                { error: 'session_id is required' },
                { status: 400 }
            );
        }

        return await deleteSession(sessionId, permanent);

    } catch (error) {
        console.error('Error deleting IVR session:', error);
        return NextResponse.json(
            { error: 'Failed to delete session' },
            { status: 500 }
        );
    }
}

// Implementation functions

async function createSession(data: CreateSessionRequest) {
    const sessionId = `ivr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create call record in database
    const callRecord = await db.callRecord.create({
        data: {
            callId: sessionId,
            sessionId: sessionId,
            startTime: new Date(),
            callType: 'inbound',
            primaryLanguage: data.language || 'ml',
            malayalamContent: (data.language || 'ml').startsWith('ml'),
            culturalContext: {
                dialect: data.dialect || 'central_kerala',
                campaign_id: data.campaign_id,
                caller_context: data.metadata || {}
            }
        }
    });

    // Start external IVR session (Python backend)
    const pythonBackendUrl = process.env.PYTHON_IVR_BACKEND_URL || 'http://localhost:8000';

    try {
        const response = await fetch(`${pythonBackendUrl}/api/call/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone_number: data.phone_number,
                language: data.language || 'ml',
                dialect: data.dialect,
                ivr_flow_id: data.ivr_flow_id,
                session_id: sessionId
            }),
            signal: AbortSignal.timeout(10000)
        });

        const sessionData = response.ok ? await response.json() : null;

        return NextResponse.json({
            success: true,
            session: {
                session_id: sessionId,
                call_record_id: callRecord.id,
                phone_number: data.phone_number,
                language: data.language || 'ml',
                dialect: data.dialect || 'central_kerala',
                status: 'initialized',
                start_time: callRecord.startTime.toISOString(),
                external_session: sessionData,
                metadata: data.metadata || {}
            }
        }, { status: 201 });

    } catch (error) {
        // External service failed, but we have local record
        return NextResponse.json({
            success: true,
            session: {
                session_id: sessionId,
                call_record_id: callRecord.id,
                phone_number: data.phone_number,
                language: data.language || 'ml',
                dialect: data.dialect || 'central_kerala',
                status: 'initialized',
                start_time: callRecord.startTime.toISOString(),
                external_session: null,
                metadata: data.metadata || {},
                warning: 'External IVR service unavailable - session created locally'
            }
        }, { status: 201 });
    }
}

async function getSession(sessionId: string, includeTranscript: boolean = false) {
    const callRecord = await db.callRecord.findFirst({
        where: {
            OR: [
                { callId: sessionId },
                { sessionId: sessionId }
            ]
        },
        include: {
            transcription: includeTranscript,
            CallHandoff: {
                include: {
                    toOperator: {
                        select: {
                            displayName: true,
                            operatorId: true,
                            currentStatus: true
                        }
                    }
                }
            },
            SpeakerDiarization: includeTranscript
        }
    });

    if (!callRecord) {
        return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
        );
    }

    // Calculate metrics
    const duration = callRecord.endTime
        ? Math.floor((callRecord.endTime.getTime() - callRecord.startTime.getTime()) / 1000)
        : Math.floor((new Date().getTime() - callRecord.startTime.getTime()) / 1000);

    const session = {
        session_id: callRecord.sessionId || callRecord.callId,
        call_record_id: callRecord.id,
        phone_number: callRecord.culturalContext?.caller_phone || 'unknown',
        language: callRecord.primaryLanguage,
        dialect: callRecord.culturalContext?.dialect,
        status: getSessionStatus(callRecord),
        start_time: callRecord.startTime.toISOString(),
        end_time: callRecord.endTime?.toISOString(),
        duration_seconds: duration,
        audio_quality: callRecord.audioQuality,
        malayalam_content: callRecord.malayalamContent,
        cultural_context: callRecord.culturalContext,
        handoffs: callRecord.CallHandoff.map(h => ({
            id: h.id,
            type: h.handoffType,
            status: h.status,
            operator: h.toOperator?.displayName,
            requested_at: h.requestedAt.toISOString(),
            accepted_at: h.acceptedAt?.toISOString()
        })),
        transcript: includeTranscript ? callRecord.transcription : undefined,
        speaker_analysis: includeTranscript ? callRecord.SpeakerDiarization : undefined
    };

    return NextResponse.json({
        success: true,
        session
    });
}

async function listSessions(filters: {
    status?: SessionStatus;
    phone_number?: string;
    limit: number;
    offset: number;
    include_transcript?: boolean;
    date_from?: string;
    date_to?: string;
}) {
    const whereClause: any = {};

    // Status filter
    if (filters.status) {
        // Map session status to database fields
        switch (filters.status) {
            case 'completed':
                whereClause.endTime = { not: null };
                break;
            case 'active':
                whereClause.endTime = null;
                break;
        }
    }

    // Phone number filter
    if (filters.phone_number) {
        whereClause.culturalContext = {
            path: ['caller_phone'],
            equals: filters.phone_number
        };
    }

    // Date range filter
    if (filters.date_from || filters.date_to) {
        whereClause.startTime = {};
        if (filters.date_from) {
            whereClause.startTime.gte = new Date(filters.date_from);
        }
        if (filters.date_to) {
            whereClause.startTime.lte = new Date(filters.date_to);
        }
    }

    const [sessions, totalCount] = await Promise.all([
        db.callRecord.findMany({
            where: whereClause,
            include: {
                transcription: filters.include_transcript,
                CallHandoff: {
                    select: {
                        id: true,
                        handoffType: true,
                        status: true,
                        requestedAt: true
                    }
                }
            },
            orderBy: { startTime: 'desc' },
            take: filters.limit,
            skip: filters.offset
        }),
        db.callRecord.count({ where: whereClause })
    ]);

    const formattedSessions = sessions.map(record => {
        const duration = record.endTime
            ? Math.floor((record.endTime.getTime() - record.startTime.getTime()) / 1000)
            : Math.floor((new Date().getTime() - record.startTime.getTime()) / 1000);

        return {
            session_id: record.sessionId || record.callId,
            call_record_id: record.id,
            phone_number: record.culturalContext?.caller_phone || 'unknown',
            language: record.primaryLanguage,
            status: getSessionStatus(record),
            start_time: record.startTime.toISOString(),
            end_time: record.endTime?.toISOString(),
            duration_seconds: duration,
            malayalam_content: record.malayalamContent,
            handoff_count: record.CallHandoff.length,
            transcript_available: !!record.transcription
        };
    });

    return NextResponse.json({
        success: true,
        sessions: formattedSessions,
        pagination: {
            total_count: totalCount,
            limit: filters.limit,
            offset: filters.offset,
            has_more: filters.offset + filters.limit < totalCount
        }
    });
}

async function updateSession(sessionId: string, updates: UpdateSessionRequest) {
    const callRecord = await db.callRecord.findFirst({
        where: {
            OR: [
                { callId: sessionId },
                { sessionId: sessionId }
            ]
        }
    });

    if (!callRecord) {
        return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
        );
    }

    // Prepare update data
    const updateData: any = {
        updatedAt: new Date()
    };

    // Update cultural context with new metadata
    if (updates.metadata) {
        updateData.culturalContext = {
            ...callRecord.culturalContext as any,
            ...updates.metadata,
            updated_at: new Date().toISOString()
        };
    }

    // Handle status updates
    if (updates.status === 'completed' && !callRecord.endTime) {
        updateData.endTime = new Date();
    }

    // Update the record
    const updatedRecord = await db.callRecord.update({
        where: { id: callRecord.id },
        data: updateData
    });

    // Handle operator assignment
    if (updates.operator_id) {
        await db.callHandoff.create({
            data: {
                callRecordId: callRecord.id,
                sessionId: sessionId,
                toOperatorId: updates.operator_id,
                handoffType: 'transfer',
                reason: 'Manual operator assignment',
                status: 'accepted',
                acceptedAt: new Date()
            }
        });
    }

    // Notify external IVR system if needed
    if (updates.status) {
        try {
            const pythonBackendUrl = process.env.PYTHON_IVR_BACKEND_URL || 'http://localhost:8000';
            await fetch(`${pythonBackendUrl}/api/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: updates.status }),
                signal: AbortSignal.timeout(5000)
            });
        } catch (error) {
            console.warn('Failed to update external IVR system:', error);
        }
    }

    return NextResponse.json({
        success: true,
        session: {
            session_id: sessionId,
            call_record_id: updatedRecord.id,
            status: updates.status || getSessionStatus(updatedRecord),
            updated_at: updatedRecord.updatedAt.toISOString()
        }
    });
}

async function deleteSession(sessionId: string, permanent: boolean = false) {
    const callRecord = await db.callRecord.findFirst({
        where: {
            OR: [
                { callId: sessionId },
                { sessionId: sessionId }
            ]
        }
    });

    if (!callRecord) {
        return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
        );
    }

    if (permanent) {
        // Permanent deletion - remove all related data
        await db.callRecord.delete({
            where: { id: callRecord.id }
        });

        // Notify external IVR system
        try {
            const pythonBackendUrl = process.env.PYTHON_IVR_BACKEND_URL || 'http://localhost:8000';
            await fetch(`${pythonBackendUrl}/api/sessions/${sessionId}`, {
                method: 'DELETE',
                signal: AbortSignal.timeout(5000)
            });
        } catch (error) {
            console.warn('Failed to delete from external IVR system:', error);
        }

        return NextResponse.json({
            success: true,
            message: 'Session permanently deleted'
        });
    } else {
        // Soft delete - mark as ended
        const updatedRecord = await db.callRecord.update({
            where: { id: callRecord.id },
            data: {
                endTime: new Date(),
                culturalContext: {
                    ...callRecord.culturalContext as any,
                    deleted_at: new Date().toISOString(),
                    deletion_reason: 'Manual termination'
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Session terminated',
            session: {
                session_id: sessionId,
                status: 'completed',
                end_time: updatedRecord.endTime?.toISOString()
            }
        });
    }
}

function getSessionStatus(callRecord: any): SessionStatus {
    if (callRecord.endTime) {
        return 'completed';
    }

    // Check for active handoffs
    if (callRecord.CallHandoff?.some((h: any) => h.status === 'pending')) {
        return 'transferred';
    }

    return 'active';
}