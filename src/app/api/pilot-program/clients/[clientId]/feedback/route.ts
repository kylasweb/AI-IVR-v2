import { NextRequest, NextResponse } from 'next/server';
import { pilotManager } from '@/features/pilot-program/manager';

// POST /api/pilot-program/clients/[clientId]/feedback - Submit feedback for a client
export async function POST(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const body = await request.json();

        const feedbackId = await pilotManager.collectFeedback(params.clientId, body);

        return NextResponse.json({
            success: true,
            feedbackId,
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}

// GET /api/pilot-program/clients/[clientId]/feedback - Get client feedback history
export async function GET(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const client = pilotManager.getClient(params.clientId);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const type = searchParams.get('type');

        let feedback = client.feedbackHistory;

        if (type) {
            feedback = feedback.filter(f => f.type === type);
        }

        const total = feedback.length;
        const paginatedFeedback = feedback
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(offset, offset + limit);

        return NextResponse.json({
            feedback: paginatedFeedback,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}