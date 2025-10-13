import { NextRequest, NextResponse } from 'next/server';

// Analytics dashboard API
export async function GET(request: NextRequest) {
    try {
        // Generate realistic analytics data with some persistence (using time-based seeds for consistency)
        const now = new Date();
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const hourOfDay = now.getHours();
        const minuteOfHour = now.getMinutes();

        // Create some consistency while still showing variation
        const seed1 = dayOfYear % 7; // Weekly variation
        const seed2 = hourOfDay % 24; // Daily variation
        const seed3 = Math.floor(minuteOfHour / 10); // 10-minute buckets for some real-time feel

        const baseCallVolume = 8500 + (seed1 * 500) + (seed2 * 50);
        const activeCallsMultiplier = Math.max(0.1, Math.sin((hourOfDay - 6) * Math.PI / 12)); // Peak during business hours

        const analytics = {
            totalCalls: baseCallVolume + Math.floor(Math.random() * 200) - 100, // ±100 variation
            activeWorkflows: 15 + seed1 + Math.floor(Math.random() * 5),
            driverMetrics: {
                totalDrivers: 350 + (seed1 * 20),
                activeDrivers: Math.floor((150 + seed2 * 5) * activeCallsMultiplier) + 20,
                averageRating: 4.2 + (Math.random() * 0.6), // 4.2-4.8
                completionRate: 0.85 + (Math.random() * 0.12) // 85-97%
            },
            callMetrics: {
                successfulCalls: Math.floor(baseCallVolume * (0.88 + Math.random() * 0.08)), // 88-96% success rate
                failedCalls: Math.floor(baseCallVolume * (0.04 + Math.random() * 0.08)), // 4-12% failure rate
                averageDuration: 180 + Math.floor(Math.random() * 120), // 3-5 minutes
                peakHours: ['9-10 AM', '1-2 PM', '6-7 PM']
            },
            culturalIntelligence: {
                malayalamInteractions: Math.floor(baseCallVolume * 0.45), // 45% Malayalam
                englishInteractions: Math.floor(baseCallVolume * 0.35), // 35% English
                manglishInteractions: Math.floor(baseCallVolume * 0.20), // 20% Manglish
                culturalAdaptationScore: 0.82 + (Math.random() * 0.15) // 82-97%
            },
            amdDetection: {
                totalDetections: Math.floor(baseCallVolume * 0.12), // 12% of calls hit AMD
                accuracyRate: 0.91 + (Math.random() * 0.08), // 91-99%
                falsePositives: Math.floor(baseCallVolume * 0.012), // 1.2% false positives
                averageDetectionTime: 1200 + Math.floor(Math.random() * 800) // 1.2-2.0 seconds
            },
            realTimeStats: {
                currentActiveCalls: Math.floor(25 * activeCallsMultiplier) + 3 + seed3,
                queuedCalls: Math.max(0, Math.floor(10 * activeCallsMultiplier) - 5 + seed3),
                systemLoad: Math.floor(35 + (25 * activeCallsMultiplier) + (Math.random() * 10)), // 35-70%
                responseTime: 180 + Math.floor(Math.random() * 200) + (seed3 * 20) // 180-400ms
            }
        };

        return NextResponse.json({
            success: true,
            analytics,
            timestamp: new Date().toISOString(),
            generatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });
    } catch (error) {
        console.error('Analytics dashboard error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}