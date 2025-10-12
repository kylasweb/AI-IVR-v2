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

    console.log(`Ending call session: ${sessionId}`);

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/sessions/${sessionId}/end`, {
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
          status: 'ended',
          end_time: new Date().toISOString(),
          mock: true,
          message: 'Mock session ended successfully'
        });
      }

      // Return error for real sessions that fail
      return NextResponse.json(
        {
          error: 'Failed to end call session',
          session_id: sessionId,
          backend_error: true,
          details: `Backend responded with ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`Call session ${sessionId} ended successfully`);

    // Return structured response
    const endResponse = {
      success: true,
      session_id: sessionId,
      status: 'ended',
      end_time: data.end_time || new Date().toISOString(),
      duration: data.duration,
      final_status: data.final_status || 'completed',
      transcript_count: data.transcript_count || 0,
      call_summary: data.call_summary,
      ...data
    };

    return NextResponse.json(endResponse);

  } catch (error) {
    console.error('Error ending session:', error);

    // Handle mock sessions gracefully
    const { sessionId } = await params;
    if (sessionId?.startsWith('mock_')) {
      return NextResponse.json({
        success: true,
        session_id: sessionId,
        status: 'ended',
        end_time: new Date().toISOString(),
        mock: true,
        message: 'Mock session ended due to connection error'
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to end call session',
        session_id: sessionId,
        connection_error: true,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}