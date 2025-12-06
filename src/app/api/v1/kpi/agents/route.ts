/**
 * KPI Agent Performance API
 * Individual agent metrics and rankings
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface AgentPerformance {
    id: string;
    name: string;
    avatar: string;
    calls: number;
    aht: string;
    acw: string;
    fcr: number;
    csat: number;
    adherence: number;
    utilization: number;
    qaScore: number;
    rank: number;
}

// GET - Get agent performance metrics
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const timeRange = searchParams.get('timeRange') || 'today';
        const clientId = searchParams.get('clientId');
        const sortBy = searchParams.get('sortBy') || 'calls';
        const limit = parseInt(searchParams.get('limit') || '20');

        // Get agents from database
        const agents = await db.user.findMany({
            where: {
                role: { in: ['AGENT', 'SUPERVISOR'] },
                ...(clientId ? { bpoClientId: clientId } : {})
            },
            select: {
                id: true,
                name: true,
                email: true
            },
            take: limit
        });

        // Generate performance metrics for each agent
        const multiplier = timeRange === 'month' ? 30 : timeRange === 'week' ? 7 : 1;

        const performance: AgentPerformance[] = agents.map((agent, index) => {
            const baseCalls = Math.floor(100 + Math.random() * 50);
            const calls = Math.floor(baseCalls * multiplier);

            return {
                id: agent.id,
                name: agent.name || 'Unknown Agent',
                avatar: getInitials(agent.name || 'UA'),
                calls,
                aht: formatTime(Math.floor(200 + Math.random() * 120)),
                acw: formatTime(Math.floor(30 + Math.random() * 30)),
                fcr: Math.floor(60 + Math.random() * 25),
                csat: parseFloat((3.5 + Math.random() * 1.2).toFixed(1)),
                adherence: Math.floor(85 + Math.random() * 15),
                utilization: Math.floor(75 + Math.random() * 20),
                qaScore: Math.floor(75 + Math.random() * 20),
                rank: 0
            };
        });

        // Sort and add rankings
        const sortKey = sortBy as keyof AgentPerformance;
        performance.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return bVal - aVal;
            }
            return 0;
        });

        performance.forEach((agent, index) => {
            agent.rank = index + 1;
        });

        // Calculate team averages
        const teamAvg = {
            avgCalls: Math.round(performance.reduce((sum, a) => sum + a.calls, 0) / performance.length),
            avgFcr: Math.round(performance.reduce((sum, a) => sum + a.fcr, 0) / performance.length),
            avgCsat: parseFloat((performance.reduce((sum, a) => sum + a.csat, 0) / performance.length).toFixed(1)),
            avgAdherence: Math.round(performance.reduce((sum, a) => sum + a.adherence, 0) / performance.length),
            avgUtilization: Math.round(performance.reduce((sum, a) => sum + a.utilization, 0) / performance.length),
            avgQaScore: Math.round(performance.reduce((sum, a) => sum + a.qaScore, 0) / performance.length)
        };

        return NextResponse.json({
            success: true,
            data: {
                timeRange,
                agents: performance,
                teamAverages: teamAvg,
                topPerformer: performance[0],
                needsCoaching: performance.filter(a => a.fcr < 65 || a.csat < 3.8)
            }
        });
    } catch (error) {
        console.error('KPI agent performance error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch agent performance' },
            { status: 500 }
        );
    }
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
