import { NextResponse } from 'next/server'

// Get API URL from environment variables
const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Generate realistic stats with some time-based variation
    const now = new Date();
    const hourOfDay = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Business hours multiplier (higher activity 9am-6pm on weekdays)
    const isBusinessHours = hourOfDay >= 9 && hourOfDay <= 18 && dayOfWeek >= 1 && dayOfWeek <= 5;
    const activityMultiplier = isBusinessHours ? 1.5 : 0.7;

    const baseCalls = 1200;
    const totalCalls = Math.floor(baseCalls + (Math.random() * 200) - 100);
    const activeCalls = Math.floor((3 + Math.random() * 7) * activityMultiplier);
    const completedCalls = totalCalls - activeCalls;

    const mockStats = {
      total_calls: totalCalls,
      active_calls: activeCalls,
      completed_calls: completedCalls,
      average_duration: 220 + Math.floor(Math.random() * 60), // 220-280 seconds
      success_rate: 87.5 + (Math.random() * 5) // 87.5-92.5%
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