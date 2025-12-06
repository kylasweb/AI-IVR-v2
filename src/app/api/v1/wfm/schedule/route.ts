/**
 * WFM Schedule API
 * Agent scheduling and shift management
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Shift {
    id: string;
    agentId: string;
    agentName: string;
    date: string;
    startTime: string;
    endTime: string;
    breaks: Array<{ start: string; end: string; type: string }>;
    skill: string;
    status: 'scheduled' | 'active' | 'completed' | 'absent';
}

// GET - Get schedules
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
        const agentId = searchParams.get('agentId');
        const clientId = searchParams.get('clientId');

        // Get agents
        const agents = await db.user.findMany({
            where: {
                role: { in: ['AGENT', 'SUPERVISOR'] },
                ...(agentId ? { id: agentId } : {}),
                ...(clientId ? { bpoClientId: clientId } : {})
            },
            select: {
                id: true,
                name: true,
                role: true
            }
        });

        // Generate schedules for agents
        const schedules: Shift[] = agents.map((agent, index) => {
            const shiftStart = 8 + (index % 3); // Stagger start times
            const shiftEnd = shiftStart + 8;

            return {
                id: `shift_${agent.id}_${date}`,
                agentId: agent.id,
                agentName: agent.name || 'Unknown',
                date,
                startTime: `${shiftStart.toString().padStart(2, '0')}:00`,
                endTime: `${shiftEnd.toString().padStart(2, '0')}:00`,
                breaks: [
                    { start: `${shiftStart + 2}:00`, end: `${shiftStart + 2}:15`, type: 'short' },
                    { start: `${shiftStart + 4}:00`, end: `${shiftStart + 4}:30`, type: 'lunch' },
                    { start: `${shiftStart + 6}:00`, end: `${shiftStart + 6}:15`, type: 'short' }
                ],
                skill: getSkillForAgent(index),
                status: getShiftStatus(shiftStart, shiftEnd)
            };
        });

        // Calculate coverage
        const coverage = calculateCoverage(schedules);

        return NextResponse.json({
            success: true,
            data: {
                date,
                schedules,
                coverage,
                summary: {
                    totalShifts: schedules.length,
                    activeShifts: schedules.filter(s => s.status === 'active').length,
                    scheduledHours: schedules.length * 8,
                    breakMinutes: schedules.length * 60 // Each agent has 60 min break
                }
            }
        });
    } catch (error) {
        console.error('WFM schedule error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch schedules' },
            { status: 500 }
        );
    }
}

// POST - Create/Update schedule
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, date, startTime, endTime, breaks, skill } = body;

        if (!agentId || !date || !startTime || !endTime) {
            return NextResponse.json(
                { success: false, error: 'agentId, date, startTime, and endTime are required' },
                { status: 400 }
            );
        }

        // Validate agent exists
        const agent = await db.user.findUnique({
            where: { id: agentId },
            select: { id: true, name: true }
        });

        if (!agent) {
            return NextResponse.json(
                { success: false, error: 'Agent not found' },
                { status: 404 }
            );
        }

        const newShift: Shift = {
            id: `shift_${agentId}_${date}_${Date.now()}`,
            agentId,
            agentName: agent.name || 'Unknown',
            date,
            startTime,
            endTime,
            breaks: breaks || [],
            skill: skill || 'General',
            status: 'scheduled'
        };

        // In production, save to database
        return NextResponse.json({
            success: true,
            data: newShift
        });
    } catch (error) {
        console.error('WFM schedule create error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create schedule' },
            { status: 500 }
        );
    }
}

// DELETE - Remove schedule
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const shiftId = searchParams.get('shiftId');

        if (!shiftId) {
            return NextResponse.json(
                { success: false, error: 'shiftId is required' },
                { status: 400 }
            );
        }

        // In production, delete from database
        return NextResponse.json({
            success: true,
            data: { deleted: shiftId }
        });
    } catch (error) {
        console.error('WFM schedule delete error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete schedule' },
            { status: 500 }
        );
    }
}

function getSkillForAgent(index: number): string {
    const skills = ['Collections', 'Support', 'Sales', 'Billing', 'Technical'];
    return skills[index % skills.length];
}

function getShiftStatus(startHour: number, endHour: number): Shift['status'] {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < startHour) return 'scheduled';
    if (currentHour >= endHour) return 'completed';
    return 'active';
}

function calculateCoverage(schedules: Shift[]): Record<string, number> {
    const coverage: Record<string, number> = {};

    for (let hour = 8; hour < 18; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        coverage[time] = schedules.filter(s => {
            const start = parseInt(s.startTime.split(':')[0]);
            const end = parseInt(s.endTime.split(':')[0]);
            return hour >= start && hour < end;
        }).length;
    }

    return coverage;
}
