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
      return NextResponse.json({
        error: 'Failed to simulate call',
        message: `Backend responded with ${response.status}: ${response.statusText}`
      }, { status: response.status || 503 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error simulating call:', error)
    return NextResponse.json({
      error: 'Failed to connect to IVR backend',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}