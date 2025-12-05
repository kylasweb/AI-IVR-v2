'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleCallDialog } from './ScheduleCallDialog';
import { TimeSlotPicker } from './TimeSlotPicker';
import {
    ScheduledCall,
    TimeSlot,
    CreateScheduledCallRequest,
    formatTimeDisplay,
    getStatusColor,
    getPriorityColor,
    generateTimeSlots
} from '@/types/call-scheduler';
import {
    CalendarDays,
    Clock,
    Phone,
    Plus,
    RefreshCw,
    User,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Filter
} from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

export function CallSchedulerCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);

    // Fetch data when date changes
    useEffect(() => {
        fetchScheduledCalls();
        fetchAvailableSlots();
    }, [selectedDate]);

    const fetchScheduledCalls = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await fetch(`/api/call-scheduler?date=${dateStr}`);
            const data = await response.json();
            if (data.success) {
                setScheduledCalls(data.data.calls);
            }
        } catch (error) {
            console.error('Failed to fetch calls:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await fetch(`/api/call-scheduler/slots?date=${dateStr}`);
            const data = await response.json();
            if (data.success) {
                setAvailableSlots(data.data.slots);
            } else {
                setAvailableSlots(generateTimeSlots(dateStr));
            }
        } catch (error) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            setAvailableSlots(generateTimeSlots(dateStr));
        }
    };

    const handleScheduleCall = async (data: CreateScheduledCallRequest) => {
        try {
            const response = await fetch('/api/call-scheduler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                fetchScheduledCalls();
                fetchAvailableSlots();
            }
        } catch (error) {
            console.error('Failed to schedule call:', error);
        }
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setSelectedDate(newDate);
    };

    const formatDateHeader = () => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return selectedDate.toLocaleDateString('en-IN', options);
    };

    const availableCount = availableSlots.filter(s => s.available).length;
    const bookedCount = scheduledCalls.filter(c => c.status !== 'cancelled').length;

    return (
        <div className="space-y-6">
            {/* Header with navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center min-w-[280px]">
                        <h2 className="text-xl font-semibold">{formatDateHeader()}</h2>
                        <p className="text-sm text-muted-foreground">
                            {availableCount} slots available • {bookedCount} calls scheduled
                        </p>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                        <TabsList>
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="month">Month</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button variant="outline" size="icon" onClick={fetchScheduledCalls}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>

                    <Button onClick={() => setShowScheduleDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Call
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar sidebar */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            className="rounded-md"
                        />
                    </CardContent>
                </Card>

                {/* Time slots and scheduled calls */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Available Time Slots */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time Slots
                            </CardTitle>
                            <CardDescription>
                                Click an available slot to schedule a call
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <TimeSlotPicker
                                    slots={availableSlots}
                                    selectedSlot={null}
                                    onSelectSlot={() => setShowScheduleDialog(true)}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Scheduled Calls */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Scheduled Calls
                            </CardTitle>
                            <CardDescription>
                                {scheduledCalls.length} calls for this day
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {scheduledCalls.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No calls scheduled for this day</p>
                                    <Button
                                        variant="link"
                                        className="mt-2"
                                        onClick={() => setShowScheduleDialog(true)}
                                    >
                                        Schedule a call
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {scheduledCalls.map(call => (
                                        <div
                                            key={call.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary">
                                                    <span className="text-lg font-bold">
                                                        {formatTimeDisplay(call.scheduledTime).split(' ')[0]}
                                                    </span>
                                                    <span className="text-xs">
                                                        {formatTimeDisplay(call.scheduledTime).split(' ')[1]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {call.customer.name || call.customer.phone}
                                                        </span>
                                                        <Badge className={getStatusColor(call.status)} variant="secondary">
                                                            {call.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{call.customer.phone}</span>
                                                        {call.agentName && (
                                                            <>
                                                                <span>•</span>
                                                                <User className="w-3 h-3" />
                                                                <span>{call.agentName}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getPriorityColor(call.priority)} variant="outline">
                                                    {call.priority}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {call.language.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Schedule Dialog */}
            <ScheduleCallDialog
                open={showScheduleDialog}
                onOpenChange={setShowScheduleDialog}
                onSchedule={handleScheduleCall}
                initialDate={selectedDate}
            />
        </div>
    );
}

export default CallSchedulerCalendar;
