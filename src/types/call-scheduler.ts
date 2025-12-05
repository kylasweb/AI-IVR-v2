/**
 * Call Scheduler Types
 * 
 * Type definitions for the call scheduling/assignment calendar system.
 */

// Scheduled call status
export type ScheduledCallStatus =
    | 'pending'      // Waiting to be executed
    | 'confirmed'    // Customer confirmed
    | 'in_progress'  // Call is happening
    | 'completed'    // Call finished
    | 'cancelled'    // Cancelled by user
    | 'no_answer'    // No response
    | 'rescheduled'; // Moved to another slot

// Call priority
export type CallPriority = 'low' | 'medium' | 'high' | 'urgent';

// Supported languages
export type CallLanguage = 'ml' | 'en' | 'ta' | 'hi';

// Recurring pattern
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'custom';

/**
 * Recurring schedule configuration
 */
export interface RecurringSchedule {
    pattern: RecurringPattern;
    interval: number; // Every N days/weeks/months
    daysOfWeek?: number[]; // 0-6 for weekly
    endDate?: Date;
    maxOccurrences?: number;
}

/**
 * Time slot representation
 */
export interface TimeSlot {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM (24h)
    endTime: string; // HH:MM (24h)
    available: boolean;
    agentId?: string;
    agentName?: string;
    bookedCallId?: string;
}

/**
 * Agent availability
 */
export interface AgentAvailability {
    agentId: string;
    agentName: string;
    date: string;
    availableSlots: TimeSlot[];
    bookedSlots: TimeSlot[];
    maxCallsPerDay: number;
    languages: CallLanguage[];
}

/**
 * Customer information for scheduled call
 */
export interface ScheduledCallCustomer {
    phone: string;
    name?: string;
    email?: string;
    preferredLanguage?: CallLanguage;
    notes?: string;
}

/**
 * Main scheduled call entity
 */
export interface ScheduledCall {
    id: string;
    customer: ScheduledCallCustomer;
    scheduledDate: string; // YYYY-MM-DD
    scheduledTime: string; // HH:MM
    duration: number; // minutes (default 30)
    agentId?: string;
    agentName?: string;
    campaignId?: string;
    campaignName?: string;
    status: ScheduledCallStatus;
    priority: CallPriority;
    language: CallLanguage;
    notes?: string;
    recurring?: RecurringSchedule;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    outcome?: CallOutcome;
}

/**
 * Call outcome after completion
 */
export interface CallOutcome {
    result: 'success' | 'callback_requested' | 'not_interested' | 'wrong_number' | 'voicemail';
    duration: number; // actual call duration in seconds
    notes?: string;
    followUpRequired: boolean;
    followUpDate?: string;
}

/**
 * Create scheduled call request
 */
export interface CreateScheduledCallRequest {
    customerPhone: string;
    customerName?: string;
    scheduledDate: string;
    scheduledTime: string;
    duration?: number;
    agentId?: string;
    campaignId?: string;
    priority?: CallPriority;
    language?: CallLanguage;
    notes?: string;
    recurring?: RecurringSchedule;
}

/**
 * Update scheduled call request
 */
export interface UpdateScheduledCallRequest {
    scheduledDate?: string;
    scheduledTime?: string;
    duration?: number;
    agentId?: string;
    status?: ScheduledCallStatus;
    priority?: CallPriority;
    notes?: string;
}

/**
 * Slot availability query params
 */
export interface SlotAvailabilityQuery {
    date: string;
    agentId?: string;
    duration?: number; // in minutes
}

/**
 * Calendar view data for a day
 */
export interface DayScheduleView {
    date: string;
    slots: TimeSlot[];
    calls: ScheduledCall[];
    totalBooked: number;
    totalAvailable: number;
}

/**
 * Weekly schedule overview
 */
export interface WeeklyScheduleView {
    weekStart: string;
    weekEnd: string;
    days: DayScheduleView[];
    totalCalls: number;
    completionRate: number;
}

/**
 * API Response types
 */
export interface SchedulerApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ScheduledCallsListResponse {
    calls: ScheduledCall[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface AvailableSlotsResponse {
    date: string;
    slots: TimeSlot[];
    agents: AgentAvailability[];
}

/**
 * Default operating hours (IST)
 */
export const DEFAULT_OPERATING_HOURS = {
    start: '09:00',
    end: '18:00',
    slotDuration: 30, // minutes
    timezone: 'Asia/Kolkata'
};

/**
 * Generate time slots for a day
 */
export function generateTimeSlots(
    date: string,
    startHour: number = 9,
    endHour: number = 18,
    slotMinutes: number = 30
): TimeSlot[] {
    const slots: TimeSlot[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += slotMinutes) {
            const startTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            const endMin = min + slotMinutes;
            const endHr = endMin >= 60 ? hour + 1 : hour;
            const endM = endMin % 60;
            const endTime = `${endHr.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

            slots.push({
                id: `${date}-${startTime}`,
                date,
                startTime,
                endTime,
                available: true
            });
        }
    }

    return slots;
}

/**
 * Format time for display
 */
export function formatTimeDisplay(time: string): string {
    const [hour, min] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: ScheduledCallStatus): string {
    const colors: Record<ScheduledCallStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-gray-100 text-gray-800',
        no_answer: 'bg-red-100 text-red-800',
        rescheduled: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get priority color for UI
 */
export function getPriorityColor(priority: CallPriority): string {
    const colors: Record<CallPriority, string> = {
        low: 'bg-slate-100 text-slate-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
}
