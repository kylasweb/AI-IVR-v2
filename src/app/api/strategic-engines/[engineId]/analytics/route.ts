// Strategic Engine Analytics API Routes
// Analytics and monitoring for strategic engines

import { NextRequest, NextResponse } from 'next/server';
import { strategicEngineOrchestrator } from '@/features/strategic-engines/orchestrator';

// GET /api/strategic-engines/[engineId]/analytics - Get engine analytics
export async function GET(
    request: NextRequest,
    { params }: { params: { engineId: string } }
) {
    try {
        const { engineId } = params;
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const timeRange = searchParams.get('timeRange') || '24h';

        // Calculate date range
        let start: Date;
        let end = new Date();

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            // Use timeRange parameter
            switch (timeRange) {
                case '1h':
                    start = new Date(Date.now() - 60 * 60 * 1000);
                    break;
                case '24h':
                    start = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    start = new Date(Date.now() - 24 * 60 * 60 * 1000);
            }
        }

        // Get analytics data
        const analytics = await strategicEngineOrchestrator.getEngineAnalytics(
            engineId,
            { start, end }
        );

        return NextResponse.json({
            success: true,
            data: analytics,
            timeRange: {
                start: start.toISOString(),
                end: end.toISOString(),
                duration: timeRange
            }
        });
    } catch (error) {
        console.error(`Failed to get analytics for engine ${params.engineId}:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to retrieve analytics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}