import { NextRequest, NextResponse } from 'next/server';
import { pilotManager } from '@/features/pilot-program/manager';

// GET /api/pilot-program/clients/[clientId]/metrics - Get client performance metrics
export async function GET(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const client = pilotManager.getClient(params.clientId);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const includeBaseline = searchParams.get('includeBaseline') === 'true';
        const includeRecommendations = searchParams.get('includeRecommendations') === 'true';

        let response: any = {
            clientId: params.clientId,
            clientName: client.name,
            currentMetrics: client.performanceData.currentMetrics,
            successMetrics: client.successMetrics,
            lastUpdated: client.performanceData.currentMetrics.timestamp
        };

        if (includeBaseline) {
            response.baselineMetrics = client.baselineMetrics;
        }

        if (includeRecommendations) {
            response.recommendations = client.performanceData.recommendations;
        }

        // Calculate progress towards goals
        response.progress = {
            satisfactionProgress: {
                current: client.performanceData.currentMetrics.customerSatisfaction?.current || 0,
                target: 85, // 30% increase from 65 baseline
                baseline: client.baselineMetrics.customerSatisfaction,
                progressPercentage: Math.min(
                    ((client.performanceData.currentMetrics.customerSatisfaction?.current || 0) - client.baselineMetrics.customerSatisfaction) /
                    (30) * 100, 100
                )
            },
            waitTimeProgress: {
                current: client.performanceData.currentMetrics.waitTimeReduction?.current || 0,
                target: 25,
                baseline: 0,
                progressPercentage: Math.min((client.performanceData.currentMetrics.waitTimeReduction?.current || 0) / 25 * 100, 100)
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching client metrics:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}