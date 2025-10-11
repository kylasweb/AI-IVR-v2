import { NextRequest, NextResponse } from 'next/server'

// Get API URL from environment variables
const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fairgo-imos-backend.onrender.com'

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for production
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error('Backend response error:', response.status, response.statusText)
      // Return mock data for better UX during backend issues
      return NextResponse.json({
        sessions: [],
        error: 'Backend temporarily unavailable',
        mock: true
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    // Return empty sessions array instead of error for better UX
    return NextResponse.json(
      {
        sessions: [],
        error: 'Failed to fetch sessions',
        mock: true
      },
      { status: 200 } // Return 200 instead of 500 for better UX
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/call/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    if (!response.ok) {
      console.error('Backend response error:', response.status, response.statusText)
      // Return mock response for better UX
      const mockResponse = {
        session_id: `mock_${Date.now()}`,
        message: "Welcome to our AI IVR system. How can I help you today?",
        audio_data: "",
        status: "ready",
        mock: true
      }
      return NextResponse.json(mockResponse)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error starting session:', error)
    // Return mock response for better UX
    const mockResponse = {
      session_id: `mock_${Date.now()}`,
      message: "Welcome to our AI IVR system. How can I help you today?",
      audio_data: "",
      status: "ready",
      mock: true
    }
    return NextResponse.json(mockResponse)
  }
}