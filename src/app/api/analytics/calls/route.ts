import { NextRequest, NextResponse } from 'next/server';

// Call analytics API
export async function GET(request: NextRequest) {
    try {
        const callAnalytics = {
            summary: {
                totalCalls: Math.floor(Math.random() * 10000) + 5000,
                successfulCalls: Math.floor(Math.random() * 8000) + 4000,
                failedCalls: Math.floor(Math.random() * 500) + 100,
                averageDuration: Math.floor(Math.random() * 300) + 120
            },
            breakdown: {
                byLanguage: {
                    malayalam: Math.floor(Math.random() * 4000) + 3000,
                    english: Math.floor(Math.random() * 3000) + 2000,
                    mixed: Math.floor(Math.random() * 1000) + 500
                },
                byTime: {
                    morning: Math.floor(Math.random() * 2000) + 1000,
                    afternoon: Math.floor(Math.random() * 3000) + 2000,
                    evening: Math.floor(Math.random() * 2500) + 1500,
                    night: Math.floor(Math.random() * 500) + 200
                },
                byOutcome: {
                    completed: Math.floor(Math.random() * 6000) + 4000,
                    transferred: Math.floor(Math.random() * 1000) + 500,
                    abandoned: Math.floor(Math.random() * 800) + 300,
                    failed: Math.floor(Math.random() * 200) + 100
                }
            },
            trends: {
                dailyGrowth: Math.random() * 10 + 2, // 2-12%
                weeklyPattern: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
                    day,
                    calls: Math.floor(Math.random() * 1000) + 500
                })),
                monthlyTrend: 'increasing'
            }
        };

        return NextResponse.json({
            success: true,
            data: callAnalytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Call analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch call analytics' },
            { status: 500 }
        );
    }
}