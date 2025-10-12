import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ||
    process.env.PYTHON_IVR_BACKEND_URL ||
    'http://localhost:8000';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        console.log(`Holding call session: ${sessionId}`);

        const response = await fetch(`${PYTHON_BACKEND_URL}/api/sessions/${sessionId}/hold`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend response error:', response.status, response.statusText, errorText);

            // Return success for mock sessions
            if (sessionId.startsWith('mock_')) {
                return NextResponse.json({
                    success: true,
                    session_id: sessionId,
                    status: 'on_hold',
                    hold_time: new Date().toISOString(),
                    mock: true,
                    message: 'Mock session put on hold'
                });
            }

            return NextResponse.json(
                {
                    error: 'Failed to hold call session',
                    session_id: sessionId,
                    backend_error: true,
                    details: `Backend responded with ${response.status}`
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log(`Call session ${sessionId} put on hold successfully`);

        return NextResponse.json({
            success: true,
            session_id: sessionId,
            status: 'on_hold',
            hold_time: data.hold_time || new Date().toISOString(),
            hold_music: data.hold_music || 'default',
            estimated_wait: data.estimated_wait || 0,
            ...data
        });

    } catch (error) {
        console.error('Error holding session:', error);

        const { sessionId } = await params;
        if (sessionId?.startsWith('mock_')) {
            return NextResponse.json({
                success: true,
                session_id: sessionId,
                status: 'on_hold',
                hold_time: new Date().toISOString(),
                mock: true,
                message: 'Mock session hold (connection error)'
            });
        }

        return NextResponse.json(
            {
                error: 'Failed to hold call session',
                session_id: sessionId,
                connection_error: true,
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}