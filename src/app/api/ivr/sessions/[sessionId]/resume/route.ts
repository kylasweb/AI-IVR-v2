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

        console.log(`Resuming call session: ${sessionId}`);

        const response = await fetch(`${PYTHON_BACKEND_URL}/api/sessions/${sessionId}/resume`, {
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
                    status: 'active',
                    resume_time: new Date().toISOString(),
                    mock: true,
                    message: 'Mock session resumed'
                });
            }

            return NextResponse.json(
                {
                    error: 'Failed to resume call session',
                    session_id: sessionId,
                    backend_error: true,
                    details: `Backend responded with ${response.status}`
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log(`Call session ${sessionId} resumed successfully`);

        return NextResponse.json({
            success: true,
            session_id: sessionId,
            status: 'active',
            resume_time: data.resume_time || new Date().toISOString(),
            hold_duration: data.hold_duration || 0,
            ...data
        });

    } catch (error) {
        console.error('Error resuming session:', error);

        const { sessionId } = await params;
        if (sessionId?.startsWith('mock_')) {
            return NextResponse.json({
                success: true,
                session_id: sessionId,
                status: 'active',
                resume_time: new Date().toISOString(),
                mock: true,
                message: 'Mock session resume (connection error)'
            });
        }

        return NextResponse.json(
            {
                error: 'Failed to resume call session',
                session_id: sessionId,
                connection_error: true,
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}