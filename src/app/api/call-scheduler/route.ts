import { NextRequest, NextResponse } from 'next/server';
import {
    ScheduledCall,
    CreateScheduledCallRequest,
    UpdateScheduledCallRequest,
    SchedulerApiResponse,
    ScheduledCallsListResponse,
    generateTimeSlots,
    ScheduledCallStatus
} from '@/types/call-scheduler';

// In-memory store (replace with database in production)
let scheduledCalls: ScheduledCall[] = [];

// Helper to generate unique ID
function generateId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/call-scheduler
 * List scheduled calls with filters
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const status = searchParams.get('status') as ScheduledCallStatus | null;
        const agentId = searchParams.get('agentId');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');

        let filteredCalls = [...scheduledCalls];

        // Apply filters
        if (date) {
            filteredCalls = filteredCalls.filter(c => c.scheduledDate === date);
        }
        if (status) {
            filteredCalls = filteredCalls.filter(c => c.status === status);
        }
        if (agentId) {
            filteredCalls = filteredCalls.filter(c => c.agentId === agentId);
        }

        // Sort by date and time
        filteredCalls.sort((a, b) => {
            const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
            const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
            return dateA.getTime() - dateB.getTime();
        });

        // Paginate
        const startIdx = (page - 1) * pageSize;
        const paginatedCalls = filteredCalls.slice(startIdx, startIdx + pageSize);

        const response: SchedulerApiResponse<ScheduledCallsListResponse> = {
            success: true,
            data: {
                calls: paginatedCalls,
                total: filteredCalls.length,
                page,
                pageSize,
                hasMore: startIdx + pageSize < filteredCalls.length
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('[Call Scheduler] GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch scheduled calls' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/call-scheduler
 * Create a new scheduled call
 */
export async function POST(request: NextRequest) {
    try {
        const body: CreateScheduledCallRequest = await request.json();

        // Validate required fields
        if (!body.customerPhone || !body.scheduledDate || !body.scheduledTime) {
            return NextResponse.json(
                { success: false, error: 'customerPhone, scheduledDate, and scheduledTime are required' },
                { status: 400 }
            );
        }

        // Check for slot conflicts
        const conflictingCall = scheduledCalls.find(c =>
            c.scheduledDate === body.scheduledDate &&
            c.scheduledTime === body.scheduledTime &&
            c.agentId === body.agentId &&
            c.status !== 'cancelled'
        );

        if (conflictingCall) {
            return NextResponse.json(
                { success: false, error: 'Time slot already booked for this agent' },
                { status: 409 }
            );
        }

        const now = new Date().toISOString();
        const newCall: ScheduledCall = {
            id: generateId(),
            customer: {
                phone: body.customerPhone,
                name: body.customerName,
                preferredLanguage: body.language || 'en'
            },
            scheduledDate: body.scheduledDate,
            scheduledTime: body.scheduledTime,
            duration: body.duration || 30,
            agentId: body.agentId,
            campaignId: body.campaignId,
            status: 'pending',
            priority: body.priority || 'medium',
            language: body.language || 'en',
            notes: body.notes,
            recurring: body.recurring,
            createdAt: now,
            updatedAt: now
        };

        scheduledCalls.push(newCall);

        return NextResponse.json({
            success: true,
            data: newCall,
            message: 'Call scheduled successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('[Call Scheduler] POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to schedule call' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/call-scheduler
 * Update scheduled call (requires id in body)
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates }: { id: string } & UpdateScheduledCallRequest = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Call ID is required' },
                { status: 400 }
            );
        }

        const callIndex = scheduledCalls.findIndex(c => c.id === id);
        if (callIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Scheduled call not found' },
                { status: 404 }
            );
        }

        // Check for slot conflicts if rescheduling
        if (updates.scheduledDate || updates.scheduledTime) {
            const newDate = updates.scheduledDate || scheduledCalls[callIndex].scheduledDate;
            const newTime = updates.scheduledTime || scheduledCalls[callIndex].scheduledTime;
            const agentId = updates.agentId || scheduledCalls[callIndex].agentId;

            const conflictingCall = scheduledCalls.find(c =>
                c.id !== id &&
                c.scheduledDate === newDate &&
                c.scheduledTime === newTime &&
                c.agentId === agentId &&
                c.status !== 'cancelled'
            );

            if (conflictingCall) {
                return NextResponse.json(
                    { success: false, error: 'New time slot already booked' },
                    { status: 409 }
                );
            }
        }

        scheduledCalls[callIndex] = {
            ...scheduledCalls[callIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: scheduledCalls[callIndex],
            message: 'Call updated successfully'
        });

    } catch (error) {
        console.error('[Call Scheduler] PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update scheduled call' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/call-scheduler?id=xxx
 * Cancel/delete a scheduled call
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Call ID is required' },
                { status: 400 }
            );
        }

        const callIndex = scheduledCalls.findIndex(c => c.id === id);
        if (callIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Scheduled call not found' },
                { status: 404 }
            );
        }

        // Soft delete - mark as cancelled
        scheduledCalls[callIndex].status = 'cancelled';
        scheduledCalls[callIndex].updatedAt = new Date().toISOString();

        return NextResponse.json({
            success: true,
            message: 'Call cancelled successfully'
        });

    } catch (error) {
        console.error('[Call Scheduler] DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to cancel scheduled call' },
            { status: 500 }
        );
    }
}
