import { NextResponse } from 'next/server'

// Get API URL from environment variables
const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // For now, return mock stats since the Python backend doesn't have a stats endpoint yet
    const mockStats = {
      total_calls: 1247,
      active_calls: 3,
      completed_calls: 1244,
      average_duration: 245,
      success_rate: 89.5
    }
    
    return NextResponse.json(mockStats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { 
        total_calls: 0,
        active_calls: 0,
        completed_calls: 0,
        average_duration: 0,
        success_rate: 0
      },
      { status: 200 } // Return 200 instead of 500 for better UX
    )
  }
}