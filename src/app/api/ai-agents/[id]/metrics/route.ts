import { NextRequest, NextResponse } from 'next/server';
import type { AIAgent, AgentMetrics } from '@/types/ai-agent';

// Mock database - replace with actual database operations
let agents: AIAgent[] = [];

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const agentId = params.id;
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || '7d'; // 1d, 7d, 30d, 90d
        const includeDetails = searchParams.get('includeDetails') === 'true';

        const agent = agents.find(a => a.id === agentId);
        if (!agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        // Calculate time-based metrics (mock implementation)
        const metrics = calculateTimeBasedMetrics(agent, timeRange);
        const performanceData = generatePerformanceData(agent, timeRange);

        const response = {
            agentId: agent.id,
            agentName: agent.name,
            timeRange,
            metrics: {
                ...metrics,
                currentStatus: agent.status,
                version: agent.version,
                lastUpdated: agent.updatedAt
            },
            performance: performanceData,
            ...(includeDetails && {
                details: {
                    topQueries: agent.metrics.popularQueries,
                    recentExecutions: generateRecentExecutions(agent),
                    userFeedback: generateUserFeedback(agent),
                    errorAnalysis: generateErrorAnalysis(agent)
                }
            })
        };

        return NextResponse.json(response);
    } catch (error: unknown) {
        console.error('Error fetching agent metrics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agent metrics' },
            { status: 500 }
        );
    }
}

function calculateTimeBasedMetrics(agent: AIAgent, timeRange: string): AgentMetrics & {
    trendsData: any;
    revenueGrowth: number;
    userGrowth: number;
    performanceScore: number;
} {
    const baseMetrics = agent.metrics;

    // Mock trends calculation
    const trendMultiplier = getTrendMultiplier(timeRange);

    return {
        ...baseMetrics,
        trendsData: {
            executions: Array.from({ length: getDaysInRange(timeRange) }, (_, i) => ({
                date: new Date(Date.now() - (getDaysInRange(timeRange) - i) * 24 * 60 * 60 * 1000),
                value: Math.floor(Math.random() * 50) + 10
            })),
            revenue: Array.from({ length: getDaysInRange(timeRange) }, (_, i) => ({
                date: new Date(Date.now() - (getDaysInRange(timeRange) - i) * 24 * 60 * 60 * 1000),
                value: Math.floor(Math.random() * 500) + 100
            })),
            users: Array.from({ length: getDaysInRange(timeRange) }, (_, i) => ({
                date: new Date(Date.now() - (getDaysInRange(timeRange) - i) * 24 * 60 * 60 * 1000),
                value: Math.floor(Math.random() * 20) + 5
            }))
        },
        revenueGrowth: (Math.random() - 0.5) * 40, // -20% to +20%
        userGrowth: (Math.random() - 0.3) * 50, // -15% to +35%
        performanceScore: Math.min(100, baseMetrics.successRate + (baseMetrics.userRating * 10))
    };
}

function generatePerformanceData(agent: AIAgent, timeRange: string) {
    return {
        responseTimeDistribution: {
            fast: Math.floor(Math.random() * 40) + 30, // 30-70%
            medium: Math.floor(Math.random() * 30) + 20, // 20-50%
            slow: Math.floor(Math.random() * 20) + 5 // 5-25%
        },
        errorTypes: [
            { type: 'Timeout', count: Math.floor(Math.random() * 10), percentage: Math.random() * 30 },
            { type: 'Invalid Input', count: Math.floor(Math.random() * 15), percentage: Math.random() * 25 },
            { type: 'Model Error', count: Math.floor(Math.random() * 5), percentage: Math.random() * 15 },
            { type: 'Rate Limit', count: Math.floor(Math.random() * 3), percentage: Math.random() * 10 }
        ],
        userSatisfaction: {
            ratings: {
                5: Math.floor(Math.random() * 40) + 40,
                4: Math.floor(Math.random() * 30) + 25,
                3: Math.floor(Math.random() * 15) + 10,
                2: Math.floor(Math.random() * 10) + 5,
                1: Math.floor(Math.random() * 5) + 2
            },
            averageRating: agent.metrics.userRating,
            totalRatings: Math.floor(agent.metrics.totalExecutions * 0.3) // 30% of users rate
        },
        geographicDistribution: [
            { region: 'Kerala', percentage: 45, users: Math.floor(agent.metrics.activeUsers * 0.45) },
            { region: 'Karnataka', percentage: 25, users: Math.floor(agent.metrics.activeUsers * 0.25) },
            { region: 'Tamil Nadu', percentage: 15, users: Math.floor(agent.metrics.activeUsers * 0.15) },
            { region: 'Mumbai', percentage: 10, users: Math.floor(agent.metrics.activeUsers * 0.10) },
            { region: 'Other', percentage: 5, users: Math.floor(agent.metrics.activeUsers * 0.05) }
        ]
    };
}

function generateRecentExecutions(agent: AIAgent) {
    return Array.from({ length: 10 }, (_, i) => ({
        id: `exec_${Date.now() - i * 60000}`,
        timestamp: new Date(Date.now() - i * 60000),
        prompt: `Sample query ${i + 1}`,
        response: `Generated response for query ${i + 1}`,
        executionTime: Math.random() * 3000 + 500,
        success: Math.random() > 0.1,
        tokensUsed: Math.floor(Math.random() * 500) + 100,
        cost: Math.random() * 10 + 2
    }));
}

function generateUserFeedback(agent: AIAgent) {
    const feedback = [
        "Excellent Malayalam support, very helpful!",
        "Quick responses and accurate information",
        "Could improve on complex queries",
        "Great for Kerala tourism information",
        "Very culturally aware and contextual"
    ];

    return Array.from({ length: 5 }, (_, i) => ({
        id: `feedback_${i}`,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: feedback[i],
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        helpful: Math.floor(Math.random() * 10) + 1
    }));
}

function generateErrorAnalysis(agent: AIAgent) {
    return {
        commonErrors: [
            {
                error: "Malayalam script rendering issues",
                frequency: 12,
                impact: "medium",
                suggestion: "Update Malayalam font rendering system"
            },
            {
                error: "Context understanding for regional dialects",
                frequency: 8,
                impact: "high",
                suggestion: "Enhance dialect-specific training data"
            },
            {
                error: "API timeout during peak hours",
                frequency: 15,
                impact: "medium",
                suggestion: "Implement better load balancing"
            }
        ],
        errorTrends: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
            errorCount: Math.floor(Math.random() * 10) + 1,
            totalRequests: Math.floor(Math.random() * 100) + 50
        }))
    };
}

function getTrendMultiplier(timeRange: string): number {
    switch (timeRange) {
        case '1d': return 0.1;
        case '7d': return 1;
        case '30d': return 4;
        case '90d': return 12;
        default: return 1;
    }
}

function getDaysInRange(timeRange: string): number {
    switch (timeRange) {
        case '1d': return 24; // Hours
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        default: return 7;
    }
}