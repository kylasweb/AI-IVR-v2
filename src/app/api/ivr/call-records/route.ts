/**
 * IVR Call Records CRUD API
 * Complete management of call recordings, transcriptions, and metadata
 * Supports Malayalam transcription and cultural analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CreateCallRecordRequest {
    call_id: string;
    session_id?: string;
    start_time?: string;
    call_type?: 'inbound' | 'outbound' | 'conference';
    primary_language?: string;
    malayalam_content?: boolean;
    cultural_context?: Record<string, any>;
    recording_url?: string;
    recording_format?: string;
    encryption_enabled?: boolean;
}

interface UpdateCallRecordRequest {
    end_time?: string;
    duration?: number;
    recording_url?: string;
    recording_size?: number;
    audio_quality?: number;
    noise_level?: number;
    signal_strength?: number;
    cultural_context?: Record<string, any>;
    retention_policy?: string;
    gdpr_compliant?: boolean;
    hipaa_compliant?: boolean;
}

interface CreateTranscriptionRequest {
    call_record_id: string;
    provider?: string;
    language?: string;
    full_transcript?: string;
    segments?: any;
    summary?: string;
    key_phrases?: any;
    sentiment?: string;
    cultural_tone?: string;
    malayalam_accuracy?: number;
    code_switching?: any;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get('record_id');
        const callId = searchParams.get('call_id');
        const action = searchParams.get('action') || 'records';

        switch (action) {
            case 'records':
                if (recordId || callId) {
                    return await getCallRecord(recordId, callId);
                }
                return await listCallRecords(searchParams);

            case 'transcriptions':
                return await getTranscriptions(searchParams);

            case 'analytics':
                return await getCallAnalytics(searchParams);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in call records GET:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'record';
        const body = await request.json();

        switch (action) {
            case 'record':
                return await createCallRecord(body);

            case 'transcription':
                return await createTranscription(body);

            case 'bulk_import':
                return await bulkImportRecords(body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in call records POST:', error);
        return NextResponse.json(
            { error: 'Failed to create record' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get('record_id');
        const action = searchParams.get('action') || 'update';

        if (!recordId) {
            return NextResponse.json(
                { error: 'record_id is required' },
                { status: 400 }
            );
        }

        const body = await request.json();

        switch (action) {
            case 'update':
                return await updateCallRecord(recordId, body);

            case 'transcription':
                return await updateTranscription(recordId, body);

            case 'quality':
                return await updateQualityMetrics(recordId, body);

            case 'cultural_analysis':
                return await updateCulturalAnalysis(recordId, body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in call records PUT:', error);
        return NextResponse.json(
            { error: 'Failed to update record' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get('record_id');
        const action = searchParams.get('action') || 'delete';
        const permanent = searchParams.get('permanent') === 'true';

        if (!recordId) {
            return NextResponse.json(
                { error: 'record_id is required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'delete':
                return await deleteCallRecord(recordId, permanent);

            case 'transcription':
                return await deleteTranscription(recordId);

            case 'bulk_cleanup':
                return await bulkCleanupRecords(searchParams);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in call records DELETE:', error);
        return NextResponse.json(
            { error: 'Failed to delete record' },
            { status: 500 }
        );
    }
}

// Implementation functions

async function createCallRecord(data: CreateCallRecordRequest) {
    const callRecord = await db.callRecord.create({
        data: {
            callId: data.call_id,
            sessionId: data.session_id,
            startTime: data.start_time ? new Date(data.start_time) : new Date(),
            callType: data.call_type || 'inbound',
            primaryLanguage: data.primary_language || 'ml',
            malayalamContent: data.malayalam_content ?? true,
            culturalContext: data.cultural_context || {},
            recordingUrl: data.recording_url,
            recordingFormat: data.recording_format || 'wav',
            encryptionKey: data.encryption_enabled ? `enc_${Date.now()}` : null,
            gdprCompliant: true,
            hipaaCompliant: false,
            retentionPolicy: 'standard'
        }
    });

    return NextResponse.json({
        success: true,
        call_record: {
            id: callRecord.id,
            call_id: callRecord.callId,
            session_id: callRecord.sessionId,
            start_time: callRecord.startTime.toISOString(),
            status: 'created',
            malayalam_content: callRecord.malayalamContent,
            primary_language: callRecord.primaryLanguage
        }
    }, { status: 201 });
}

async function getCallRecord(recordId?: string | null, callId?: string | null) {
    const whereClause = recordId
        ? { id: recordId }
        : callId
            ? { callId: callId }
            : null;

    if (!whereClause) {
        return NextResponse.json(
            { error: 'record_id or call_id is required' },
            { status: 400 }
        );
    }

    const callRecord = await db.callRecord.findFirst({
        where: whereClause,
        include: {
            transcription: true,
            SpeakerDiarization: true,
            CallHandoff: {
                include: {
                    toOperator: {
                        select: {
                            displayName: true,
                            operatorId: true
                        }
                    }
                }
            }
        }
    });

    if (!callRecord) {
        return NextResponse.json(
            { error: 'Call record not found' },
            { status: 404 }
        );
    }

    // Calculate duration and metrics
    const duration = callRecord.endTime
        ? Math.floor((callRecord.endTime.getTime() - callRecord.startTime.getTime()) / 1000)
        : null;

    const recordData = {
        id: callRecord.id,
        call_id: callRecord.callId,
        session_id: callRecord.sessionId,
        call_type: callRecord.callType,
        start_time: callRecord.startTime.toISOString(),
        end_time: callRecord.endTime?.toISOString(),
        duration_seconds: duration,
        primary_language: callRecord.primaryLanguage,
        malayalam_content: callRecord.malayalamContent,
        cultural_context: callRecord.culturalContext,

        // Recording details
        recording_url: callRecord.recordingUrl,
        recording_size: callRecord.recordingSize?.toString(),
        recording_format: callRecord.recordingFormat,
        encrypted: !!callRecord.encryptionKey,

        // Quality metrics
        audio_quality: callRecord.audioQuality,
        noise_level: callRecord.noiseLevel,
        signal_strength: callRecord.signalStrength,

        // Compliance
        gdpr_compliant: callRecord.gdprCompliant,
        hipaa_compliant: callRecord.hipaaCompliant,
        retention_policy: callRecord.retentionPolicy,
        retention_expiry: callRecord.retentionExpiry?.toISOString(),

        // Related data
        transcription: callRecord.transcription ? {
            id: callRecord.transcription.id,
            provider: callRecord.transcription.provider,
            language: callRecord.transcription.language,
            confidence: callRecord.transcription.confidence,
            full_transcript: callRecord.transcription.fullTranscript,
            summary: callRecord.transcription.summary,
            sentiment: callRecord.transcription.sentiment,
            cultural_tone: callRecord.transcription.culturalTone,
            malayalam_accuracy: callRecord.transcription.malayalamAccuracy,
            word_count: callRecord.transcription.wordCount,
            speaker_count: callRecord.transcription.speakerCount
        } : null,

        speaker_analysis: callRecord.SpeakerDiarization ? {
            speaker_count: callRecord.SpeakerDiarization.speakerCount,
            malayalam_speakers: callRecord.SpeakerDiarization.malayalamSpeakers,
            confidence: callRecord.SpeakerDiarization.confidence,
            code_switching: callRecord.SpeakerDiarization.codeSwithcing
        } : null,

        handoffs: callRecord.CallHandoff.map(h => ({
            id: h.id,
            type: h.handoffType,
            status: h.status,
            operator: h.toOperator?.displayName,
            requested_at: h.requestedAt.toISOString()
        }))
    };

    return NextResponse.json({
        success: true,
        call_record: recordData
    });
}

async function listCallRecords(searchParams: URLSearchParams) {
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const language = searchParams.get('language');
    const call_type = searchParams.get('call_type');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const has_transcript = searchParams.get('has_transcript');
    const malayalam_only = searchParams.get('malayalam_only') === 'true';

    const whereClause: any = {};

    if (language) {
        whereClause.primaryLanguage = language;
    }

    if (call_type) {
        whereClause.callType = call_type;
    }

    if (malayalam_only) {
        whereClause.malayalamContent = true;
    }

    if (has_transcript === 'true') {
        whereClause.transcription = { isNot: null };
    } else if (has_transcript === 'false') {
        whereClause.transcription = null;
    }

    if (date_from || date_to) {
        whereClause.startTime = {};
        if (date_from) {
            whereClause.startTime.gte = new Date(date_from);
        }
        if (date_to) {
            whereClause.startTime.lte = new Date(date_to);
        }
    }

    const [records, totalCount] = await Promise.all([
        db.callRecord.findMany({
            where: whereClause,
            include: {
                transcription: {
                    select: {
                        id: true,
                        confidence: true,
                        sentiment: true,
                        malayalamAccuracy: true
                    }
                },
                CallHandoff: {
                    select: {
                        id: true,
                        handoffType: true,
                        status: true
                    }
                }
            },
            orderBy: { startTime: 'desc' },
            take: limit,
            skip: offset
        }),
        db.callRecord.count({ where: whereClause })
    ]);

    const formattedRecords = records.map(record => {
        const duration = record.endTime
            ? Math.floor((record.endTime.getTime() - record.startTime.getTime()) / 1000)
            : null;

        return {
            id: record.id,
            call_id: record.callId,
            session_id: record.sessionId,
            call_type: record.callType,
            start_time: record.startTime.toISOString(),
            end_time: record.endTime?.toISOString(),
            duration_seconds: duration,
            primary_language: record.primaryLanguage,
            malayalam_content: record.malayalamContent,
            audio_quality: record.audioQuality,
            has_recording: !!record.recordingUrl,
            has_transcript: !!record.transcription,
            transcript_confidence: record.transcription?.confidence,
            malayalam_accuracy: record.transcription?.malayalamAccuracy,
            sentiment: record.transcription?.sentiment,
            handoff_count: record.CallHandoff.length
        };
    });

    return NextResponse.json({
        success: true,
        call_records: formattedRecords,
        pagination: {
            total_count: totalCount,
            limit,
            offset,
            has_more: offset + limit < totalCount
        }
    });
}

async function updateCallRecord(recordId: string, updates: UpdateCallRecordRequest) {
    const updateData: any = {
        updatedAt: new Date()
    };

    if (updates.end_time) {
        updateData.endTime = new Date(updates.end_time);
    }

    if (updates.duration) {
        updateData.duration = updates.duration;
    }

    if (updates.recording_url) {
        updateData.recordingUrl = updates.recording_url;
    }

    if (updates.recording_size) {
        updateData.recordingSize = BigInt(updates.recording_size);
    }

    if (updates.audio_quality !== undefined) {
        updateData.audioQuality = updates.audio_quality;
    }

    if (updates.noise_level !== undefined) {
        updateData.noiseLevel = updates.noise_level;
    }

    if (updates.signal_strength !== undefined) {
        updateData.signalStrength = updates.signal_strength;
    }

    if (updates.cultural_context) {
        // Merge with existing cultural context
        const existingRecord = await db.callRecord.findUnique({
            where: { id: recordId },
            select: { culturalContext: true }
        });

        updateData.culturalContext = {
            ...existingRecord?.culturalContext as any,
            ...updates.cultural_context,
            updated_at: new Date().toISOString()
        };
    }

    if (updates.retention_policy) {
        updateData.retentionPolicy = updates.retention_policy;
    }

    if (updates.gdpr_compliant !== undefined) {
        updateData.gdprCompliant = updates.gdpr_compliant;
    }

    if (updates.hipaa_compliant !== undefined) {
        updateData.hipaaCompliant = updates.hipaa_compliant;
    }

    const updatedRecord = await db.callRecord.update({
        where: { id: recordId },
        data: updateData
    });

    return NextResponse.json({
        success: true,
        call_record: {
            id: updatedRecord.id,
            call_id: updatedRecord.callId,
            updated_at: updatedRecord.updatedAt.toISOString(),
            end_time: updatedRecord.endTime?.toISOString(),
            duration: updatedRecord.duration
        }
    });
}

async function createTranscription(data: CreateTranscriptionRequest) {
    const transcription = await db.callTranscription.create({
        data: {
            callRecordId: data.call_record_id,
            provider: data.provider || 'custom',
            language: data.language || 'ml',
            confidence: 0.85, // Default confidence
            fullTranscript: data.full_transcript,
            segments: data.segments,
            summary: data.summary,
            keyPhrases: data.key_phrases,
            sentiment: data.sentiment || 'neutral',
            culturalTone: data.cultural_tone,
            malayalamAccuracy: data.malayalam_accuracy,
            codeSwiting: data.code_switching,
            wordCount: data.full_transcript?.split(' ').length || 0,
            speakerCount: 1,
            processingTime: 1000
        }
    });

    return NextResponse.json({
        success: true,
        transcription: {
            id: transcription.id,
            call_record_id: transcription.callRecordId,
            provider: transcription.provider,
            language: transcription.language,
            confidence: transcription.confidence,
            malayalam_accuracy: transcription.malayalamAccuracy,
            word_count: transcription.wordCount,
            created_at: transcription.createdAt.toISOString()
        }
    }, { status: 201 });
}

async function deleteCallRecord(recordId: string, permanent: boolean = false) {
    const callRecord = await db.callRecord.findUnique({
        where: { id: recordId },
        include: {
            transcription: true,
            SpeakerDiarization: true,
            CallHandoff: true
        }
    });

    if (!callRecord) {
        return NextResponse.json(
            { error: 'Call record not found' },
            { status: 404 }
        );
    }

    if (permanent) {
        // Permanent deletion
        await db.callRecord.delete({
            where: { id: recordId }
        });

        return NextResponse.json({
            success: true,
            message: 'Call record permanently deleted'
        });
    } else {
        // Soft delete - update retention expiry
        const retentionExpiry = new Date();
        retentionExpiry.setDate(retentionExpiry.getDate() + 30); // 30 days retention

        await db.callRecord.update({
            where: { id: recordId },
            data: {
                retentionExpiry,
                culturalContext: {
                    ...callRecord.culturalContext as any,
                    deleted_at: new Date().toISOString(),
                    deletion_reason: 'Manual deletion'
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Call record marked for deletion',
            retention_expiry: retentionExpiry.toISOString()
        });
    }
}

async function getTranscriptions(searchParams: URLSearchParams) {
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const language = searchParams.get('language');
    const min_confidence = parseFloat(searchParams.get('min_confidence') || '0');

    const whereClause: any = {};

    if (language) {
        whereClause.language = language;
    }

    if (min_confidence > 0) {
        whereClause.confidence = { gte: min_confidence };
    }

    const transcriptions = await db.callTranscription.findMany({
        where: whereClause,
        include: {
            callRecord: {
                select: {
                    callId: true,
                    sessionId: true,
                    startTime: true,
                    primaryLanguage: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    });

    return NextResponse.json({
        success: true,
        transcriptions: transcriptions.map(t => ({
            id: t.id,
            call_id: t.callRecord.callId,
            session_id: t.callRecord.sessionId,
            language: t.language,
            confidence: t.confidence,
            malayalam_accuracy: t.malayalamAccuracy,
            sentiment: t.sentiment,
            cultural_tone: t.culturalTone,
            word_count: t.wordCount,
            speaker_count: t.speakerCount,
            summary: t.summary,
            created_at: t.createdAt.toISOString()
        }))
    });
}

async function getCallAnalytics(searchParams: URLSearchParams) {
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    const dateFilter: any = {};
    if (date_from || date_to) {
        const startTime: any = {};
        if (date_from) startTime.gte = new Date(date_from);
        if (date_to) startTime.lte = new Date(date_to);
        dateFilter.startTime = startTime;
    }

    // Get aggregated analytics
    const [
        totalCalls,
        malayalamCalls,
        avgDuration,
        callsByLanguage,
        transcriptionStats
    ] = await Promise.all([
        db.callRecord.count({ where: dateFilter }),
        db.callRecord.count({ where: { ...dateFilter, malayalamContent: true } }),
        db.callRecord.aggregate({
            where: { ...dateFilter, endTime: { not: null } },
            _avg: { duration: true }
        }),
        db.callRecord.groupBy({
            by: ['primaryLanguage'],
            where: dateFilter,
            _count: { id: true }
        }),
        db.callTranscription.aggregate({
            where: { callRecord: dateFilter },
            _avg: { confidence: true, malayalamAccuracy: true }
        })
    ]);

    return NextResponse.json({
        success: true,
        analytics: {
            total_calls: totalCalls,
            malayalam_calls: malayalamCalls,
            malayalam_percentage: totalCalls > 0 ? (malayalamCalls / totalCalls * 100) : 0,
            average_duration_seconds: avgDuration._avg.duration || 0,
            calls_by_language: callsByLanguage.map(item => ({
                language: item.primaryLanguage,
                count: item._count.id
            })),
            transcription_quality: {
                average_confidence: transcriptionStats._avg.confidence || 0,
                average_malayalam_accuracy: transcriptionStats._avg.malayalamAccuracy || 0
            }
        }
    });
}

async function bulkCleanupRecords(searchParams: URLSearchParams) {
    const days_old = parseInt(searchParams.get('days_old') || '30');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days_old);

    const deletedCount = await db.callRecord.deleteMany({
        where: {
            retentionExpiry: {
                lte: cutoffDate
            }
        }
    });

    return NextResponse.json({
        success: true,
        message: `Cleaned up ${deletedCount.count} expired call records`
    });
}

// Additional missing functions

async function bulkImportRecords(data: { records: any[] }) {
    const imported: any[] = [];
    const failed: any[] = [];

    for (const recordData of data.records) {
        try {
            const record = await createCallRecord(recordData);
            imported.push(record);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            failed.push({ record: recordData, error: errorMessage });
        }
    }

    return NextResponse.json({
        success: true,
        imported: imported.length,
        failed: failed.length,
        details: { imported, failed }
    });
}

async function updateTranscription(recordId: string, data: any) {
    // Find the call record
    const callRecord = await db.callRecord.findUnique({
        where: { id: recordId }
    });

    if (!callRecord) {
        return NextResponse.json(
            { error: 'Call record not found' },
            { status: 404 }
        );
    }

    // Update transcription
    const updatedTranscription = await db.callTranscription.updateMany({
        where: { callRecordId: recordId },
        data: {
            transcriptText: data.transcript_text,
            confidence: data.confidence,
            languageDetected: data.language_detected,
            updatedAt: new Date()
        }
    });

    return NextResponse.json({
        success: true,
        updated: updatedTranscription.count
    });
}

async function updateQualityMetrics(recordId: string, data: any) {
    // Update quality metrics for the call record
    const updated = await db.callRecord.update({
        where: { id: recordId },
        data: {
            metadata: {
                ...data.current_metadata,
                quality_metrics: {
                    audio_quality: data.audio_quality,
                    transcription_accuracy: data.transcription_accuracy,
                    cultural_accuracy: data.cultural_accuracy,
                    user_satisfaction: data.user_satisfaction
                }
            },
            updatedAt: new Date()
        }
    });

    return NextResponse.json({
        success: true,
        record_id: recordId,
        updated_at: updated.updatedAt.toISOString()
    });
}

async function updateCulturalAnalysis(recordId: string, data: any) {
    // Update cultural analysis data
    const updated = await db.callRecord.update({
        where: { id: recordId },
        data: {
            metadata: {
                ...data.current_metadata,
                cultural_analysis: {
                    dialect_detected: data.dialect_detected,
                    cultural_accuracy: data.cultural_accuracy,
                    respect_level: data.respect_level,
                    code_switching: data.code_switching,
                    cultural_context: data.cultural_context
                }
            },
            updatedAt: new Date()
        }
    });

    return NextResponse.json({
        success: true,
        record_id: recordId,
        cultural_analysis_updated: true
    });
}

async function deleteTranscription(recordId: string, transcriptionId?: string) {
    if (transcriptionId) {
        // Delete specific transcription
        await db.callTranscription.delete({
            where: { id: transcriptionId }
        });
    } else {
        // Delete all transcriptions for the record
        await db.callTranscription.deleteMany({
            where: { callRecordId: recordId }
        });
    }

    return NextResponse.json({
        success: true,
        message: 'Transcription(s) deleted successfully'
    });
}