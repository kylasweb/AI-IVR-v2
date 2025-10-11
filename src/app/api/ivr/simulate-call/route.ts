import { NextRequest, NextResponse } from 'next/server'

// Get API URL from environment variables
const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/call/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
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
    console.error('Error simulating call:', error)
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