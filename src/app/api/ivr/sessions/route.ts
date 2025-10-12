import { NextRequest, NextResponse } from 'next/server'

// Get API URL from environment variables with fallback to local development
const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ||
  process.env.PYTHON_IVR_BACKEND_URL ||
  'http://localhost:8000'

interface CallSession {
  session_id: string;
  phone_number: string;
  language: string;
  status: string;
  start_time: string;
  end_time?: string;
  transcript_count?: number;
  last_activity?: string;
}

interface SessionsResponse {
  sessions: CallSession[];
  total_count: number;
  active_count: number;
  error?: string;
  mock?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    // Build query parameters
    const queryParams = new URLSearchParams({
      limit,
      offset,
      ...(status && { status })
    });

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/sessions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Backend response error:', response.status, response.statusText);

      // Return realistic mock data structure for development
      const mockResponse: SessionsResponse = {
        sessions: [],
        total_count: 0,
        active_count: 0,
        error: 'Backend temporarily unavailable',
        mock: true
      };

      return NextResponse.json(mockResponse);
    }

    const data = await response.json();

    // Ensure response has expected structure
    const sessionResponse: SessionsResponse = {
      sessions: data.sessions || data || [],
      total_count: data.total_count || data.length || 0,
      active_count: data.active_count || 0,
    };

    return NextResponse.json(sessionResponse);
  } catch (error) {
    console.error('Error fetching sessions:', error);

    const errorResponse: SessionsResponse = {
      sessions: [],
      total_count: 0,
      active_count: 0,
      error: 'Failed to connect to IVR backend',
      mock: true
    };

    return NextResponse.json(errorResponse);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.phone_number) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Prepare request payload for Python backend
    const payload = {
      phone_number: body.phone_number,
      language: body.language || 'en',
      ivr_flow_id: body.ivr_flow_id || null,
      // Add any additional call configuration
      config: {
        enable_recording: body.enable_recording !== false,
        enable_transcript: body.enable_transcript !== false,
        timeout_seconds: body.timeout_seconds || 300,
        max_attempts: body.max_attempts || 3,
      }
    };

    console.log('Starting call session:', payload);

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/call/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend response error:', response.status, response.statusText, errorText);

      // Return mock response with error indication
      const mockResponse = {
        session_id: `mock_${Date.now()}`,
        message: "Welcome to our AI IVR system. How can I help you today?",
        audio_data: "",
        status: "ready",
        phone_number: body.phone_number,
        language: body.language || 'en',
        mock: true,
        backend_error: true,
        error_details: `Backend responded with ${response.status}: ${response.statusText}`
      };

      return NextResponse.json(mockResponse);
    }

    const data = await response.json();

    // Ensure response has consistent structure
    const sessionResponse = {
      session_id: data.session_id,
      message: data.message || "Session started successfully",
      audio_data: data.audio_data || "",
      status: data.status || "ready",
      phone_number: body.phone_number,
      language: data.language || body.language || 'en',
      start_time: data.start_time || new Date().toISOString(),
      mock: false
    };

    console.log('Call session started successfully:', sessionResponse.session_id);
    return NextResponse.json(sessionResponse);

  } catch (error) {
    console.error('Error starting session:', error);

    // Return mock response for better UX with error indication
    const mockResponse = {
      session_id: `mock_${Date.now()}`,
      message: "Welcome to our AI IVR system. How can I help you today?",
      audio_data: "",
      status: "ready",
      phone_number: (await request.json()).phone_number || "unknown",
      language: (await request.json()).language || 'en',
      start_time: new Date().toISOString(),
      mock: true,
      connection_error: true,
      error_details: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(mockResponse);
  }
}