/**
 * WFM Agents API
 * Real-time agent status and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all agents with current status
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const clientId = searchParams.get('clientId');
        const status = searchParams.get('status');

        // In production, this would query agent sessions from the database
        // For now, we simulate real-time status based on activity

        const agents = await db.user.findMany({
            where: {
                role: { in: ['AGENT', 'SUPERVISOR'] },
                ...(clientId ? { bpoClientId: clientId } : {})
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        // Enhance with real-time status (would come from Redis/session store in production)
        const agentStatuses = agents.map(agent => ({
            id: agent.id,
            name: agent.name,
            email: agent.email,
            status: getRandomStatus(),
            scheduledStatus: 'available',
            adherence: Math.floor(Math.random() * 20) + 80, // 80-100%
            callsToday: Math.floor(Math.random() * 30) + 10,
            avgHandleTime: formatTime(Math.floor(Math.random() * 180) + 180), // 3-6 min
            loginTime: formatLoginTime(),
            skill: getRandomSkill(),
            currentCallId: null,
            breakStartTime: null
        }));

        // Filter by status if provided
        const filtered = status
            ? agentStatuses.filter(a => a.status === status)
            : agentStatuses;

        return NextResponse.json({
            success: true,
            data: {
                agents: filtered,
                summary: {
                    total: agentStatuses.length,
                    available: agentStatuses.filter(a => a.status === 'available').length,
                    onCall: agentStatuses.filter(a => a.status === 'on_call').length,
                    onBreak: agentStatuses.filter(a => a.status === 'break').length,
                    offline: agentStatuses.filter(a => a.status === 'offline').length,
                    avgAdherence: Math.round(agentStatuses.reduce((sum, a) => sum + a.adherence, 0) / agentStatuses.length)
                }
            }
        });
    } catch (error) {
        console.error('WFM agents error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch agent status' },
            { status: 500 }
        );
    }
}

// PUT - Update agent status
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, status, reason } = body;

        if (!agentId || !status) {
            return NextResponse.json(
                { success: false, error: 'agentId and status are required' },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ['available', 'on_call', 'break', 'acw', 'offline', 'training'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        // In production, update Redis/session store and log the change
        // For now, return success
        return NextResponse.json({
            success: true,
            data: {
                agentId,
                status,
                reason,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('WFM status update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update agent status' },
            { status: 500 }
        );
    }
}

// Helper functions
function getRandomStatus(): string {
    const statuses = ['available', 'on_call', 'on_call', 'break', 'acw', 'offline'];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomSkill(): string {
    const skills = ['Collections', 'Support', 'Sales', 'Billing'];
    return skills[Math.floor(Math.random() * skills.length)];
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatLoginTime(): string {
    const hour = Math.floor(Math.random() * 3) + 8; // 8-10 AM
    const min = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}
