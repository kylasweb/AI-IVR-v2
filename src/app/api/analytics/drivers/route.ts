import { NextRequest, NextResponse } from 'next/server';

// Driver analytics API
export async function GET(request: NextRequest) {
    try {
        const driverAnalytics = {
            summary: {
                totalDrivers: Math.floor(Math.random() * 500) + 200,
                activeDrivers: Math.floor(Math.random() * 200) + 50,
                onlineDrivers: Math.floor(Math.random() * 150) + 30,
                averageRating: Math.random() * 1.5 + 3.5
            },
            performance: {
                topPerformers: Array.from({ length: 5 }, (_, i) => ({
                    id: `driver_${i + 1}`,
                    name: `Driver ${i + 1}`,
                    rating: Math.random() * 0.5 + 4.5,
                    completedRides: Math.floor(Math.random() * 100) + 50,
                    earnings: Math.floor(Math.random() * 50000) + 25000
                })),
                averageResponseTime: Math.random() * 300 + 120,
                completionRate: Math.random() * 0.2 + 0.8
            },
            distribution: {
                byRegion: {
                    kochi: Math.floor(Math.random() * 100) + 50,
                    thiruvananthapuram: Math.floor(Math.random() * 80) + 40,
                    kozhikode: Math.floor(Math.random() * 60) + 30,
                    thrissur: Math.floor(Math.random() * 40) + 20
                },
                byVehicleType: {
                    sedan: Math.floor(Math.random() * 150) + 75,
                    hatchback: Math.floor(Math.random() * 100) + 50,
                    suv: Math.floor(Math.random() * 80) + 40,
                    auto: Math.floor(Math.random() * 60) + 30
                }
            },
            trends: {
                newRegistrations: Math.floor(Math.random() * 50) + 20,
                churnRate: Math.random() * 5 + 2,
                satisfactionScore: Math.random() * 1 + 4
            }
        };

        return NextResponse.json({
            success: true,
            data: driverAnalytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Driver analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch driver analytics' },
            { status: 500 }
        );
    }
}