import { NextRequest, NextResponse } from 'next/server';
import {
    TimeSlot,
    AvailableSlotsResponse,
    generateTimeSlots,
    DEFAULT_OPERATING_HOURS
} from '@/types/call-scheduler';

// Mock agents for demo (replace with database)
const mockAgents = [
    { id: 'agent_1', name: 'Priya Menon', languages: ['ml', 'en'] as const },
    { id: 'agent_2', name: 'Arun Kumar', languages: ['ml', 'en', 'ta'] as const },
    { id: 'agent_3', name: 'Lakshmi Nair', languages: ['ml', 'en'] as const },
];

// Simulated booked slots (replace with database query)
const bookedSlots: Record<string, string[]> = {
    // date -> array of booked times
};

/**
 * GET /api/call-scheduler/slots
 * Get available time slots for a given date
 * Query params: date, agentId?, duration?
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const agentId = searchParams.get('agentId');
        const duration = parseInt(searchParams.get('duration') || '30');

        if (!date) {
            return NextResponse.json(
                { success: false, error: 'Date parameter is required (YYYY-MM-DD)' },
                { status: 400 }
            );
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json(
                { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
                { status: 400 }
            );
        }

        // Check if date is in the past
        const requestedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (requestedDate < today) {
            return NextResponse.json(
                { success: false, error: 'Cannot book slots in the past' },
                { status: 400 }
            );
        }

        // Generate all slots for the day
        const allSlots = generateTimeSlots(
            date,
            parseInt(DEFAULT_OPERATING_HOURS.start.split(':')[0]),
            parseInt(DEFAULT_OPERATING_HOURS.end.split(':')[0]),
            duration
        );

        // Get booked times for this date
        const bookedTimes = bookedSlots[date] || [];

        // Mark booked slots as unavailable
        const slots: TimeSlot[] = allSlots.map(slot => ({
            ...slot,
            available: !bookedTimes.includes(slot.startTime)
        }));

        // If today, mark past slots as unavailable
        if (date === today.toISOString().split('T')[0]) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMin = now.getMinutes();

            slots.forEach(slot => {
                const [hour, min] = slot.startTime.split(':').map(Number);
                if (hour < currentHour || (hour === currentHour && min <= currentMin)) {
                    slot.available = false;
                }
            });
        }

        // Build agent availability
        const agents = agentId
            ? mockAgents.filter(a => a.id === agentId)
            : mockAgents;

        const agentAvailability = agents.map(agent => ({
            agentId: agent.id,
            agentName: agent.name,
            date,
            availableSlots: slots.filter(s => s.available),
            bookedSlots: slots.filter(s => !s.available),
            maxCallsPerDay: 16,
            languages: agent.languages
        }));

        const response: AvailableSlotsResponse = {
            date,
            slots,
            agents: agentAvailability
        };

        return NextResponse.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('[Call Scheduler Slots] GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch available slots' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/call-scheduler/slots
 * Book a specific time slot
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { date, time, agentId } = body;

        if (!date || !time) {
            return NextResponse.json(
                { success: false, error: 'Date and time are required' },
                { status: 400 }
            );
        }

        // Initialize booked slots for date if not exists
        if (!bookedSlots[date]) {
            bookedSlots[date] = [];
        }

        // Check if already booked
        if (bookedSlots[date].includes(time)) {
            return NextResponse.json(
                { success: false, error: 'Slot already booked' },
                { status: 409 }
            );
        }

        // Book the slot
        bookedSlots[date].push(time);

        return NextResponse.json({
            success: true,
            message: 'Slot booked successfully',
            data: { date, time, agentId }
        });

    } catch (error) {
        console.error('[Call Scheduler Slots] POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to book slot' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/call-scheduler/slots
 * Free up a booked slot
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const time = searchParams.get('time');

        if (!date || !time) {
            return NextResponse.json(
                { success: false, error: 'Date and time are required' },
                { status: 400 }
            );
        }

        if (bookedSlots[date]) {
            bookedSlots[date] = bookedSlots[date].filter(t => t !== time);
        }

        return NextResponse.json({
            success: true,
            message: 'Slot freed successfully'
        });

    } catch (error) {
        console.error('[Call Scheduler Slots] DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to free slot' },
            { status: 500 }
        );
    }
}
