import { NextResponse } from 'next/server'

// Get API URL from environment variables
const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Call the Python backend for real stats
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/ivr/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const stats = await response.json();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching IVR stats from backend:', error);
    // Return error response instead of mock data
    return NextResponse.json(
      {
        error: 'Failed to fetch IVR stats',
        message: 'Backend service unavailable',
        total_calls: 0,
        active_calls: 0,
        completed_calls: 0,
        average_duration: 0,
        success_rate: 0
      },
      { status: 503 }
    )
  }
}