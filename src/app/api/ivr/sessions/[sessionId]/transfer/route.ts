import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ||
    process.env.PYTHON_IVR_BACKEND_URL ||
    'http://localhost:8000';

interface TransferRequest {
    target_agent?: {
        id: string;
        type: 'ai' | 'human';
        name?: string;
    };
    target_phone?: string;
    reason: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    department?: string;
    notes?: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const body: TransferRequest = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        if (!body.target_agent && !body.target_phone) {
            return NextResponse.json(
                { error: 'Transfer target (agent or phone) is required' },
                { status: 400 }
            );
        }

        console.log(`Transferring call session: ${sessionId}`, body);

        const response = await fetch(`${PYTHON_BACKEND_URL}/api/sessions/${sessionId}/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend response error:', response.status, response.statusText, errorText);

            // Return success for mock sessions
            if (sessionId.startsWith('mock_')) {
                return NextResponse.json({
                    success: true,
                    session_id: sessionId,
                    status: 'transferring',
                    transfer_id: `transfer_${Date.now()}`,
                    transfer_time: new Date().toISOString(),
                    target: body.target_agent || { type: 'phone', number: body.target_phone },
                    mock: true,
                    message: 'Mock session transfer initiated'
                });
            }

            return NextResponse.json(
                {
                    error: 'Failed to transfer call session',
                    session_id: sessionId,
                    backend_error: true,
                    details: `Backend responded with ${response.status}`
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log(`Call session ${sessionId} transfer initiated successfully`);

        return NextResponse.json({
            success: true,
            session_id: sessionId,
            status: 'transferring',
            transfer_id: data.transfer_id,
            transfer_time: data.transfer_time || new Date().toISOString(),
            target: body.target_agent || { type: 'phone', number: body.target_phone },
            estimated_wait: data.estimated_wait || 0,
            queue_position: data.queue_position,
            reason: body.reason,
            priority: body.priority,
            ...data
        });

    } catch (error) {
        console.error('Error transferring session:', error);

        const { sessionId } = await params;
        if (sessionId?.startsWith('mock_')) {
            return NextResponse.json({
                success: true,
                session_id: sessionId,
                status: 'transferring',
                transfer_id: `transfer_${Date.now()}`,
                transfer_time: new Date().toISOString(),
                mock: true,
                message: 'Mock session transfer (connection error)'
            });
        }

        return NextResponse.json(
            {
                error: 'Failed to transfer call session',
                session_id: sessionId,
                connection_error: true,
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}