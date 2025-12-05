'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TimeSlot, formatTimeDisplay } from '@/types/call-scheduler';
import { Clock, User, CheckCircle } from 'lucide-react';

interface TimeSlotPickerProps {
    slots: TimeSlot[];
    selectedSlot: TimeSlot | null;
    onSelectSlot: (slot: TimeSlot) => void;
    disabled?: boolean;
}

export function TimeSlotPicker({
    slots,
    selectedSlot,
    onSelectSlot,
    disabled = false
}: TimeSlotPickerProps) {
    // Group slots by hour for better visual organization
    const slotsByHour: Record<string, TimeSlot[]> = {};
    slots.forEach(slot => {
        const hour = slot.startTime.split(':')[0];
        if (!slotsByHour[hour]) {
            slotsByHour[hour] = [];
        }
        slotsByHour[hour].push(slot);
    });

    const hours = Object.keys(slotsByHour).sort((a, b) => parseInt(a) - parseInt(b));

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-primary border border-primary"></div>
                    <span>Selected</span>
                </div>
            </div>

            <div className="grid gap-3">
                {hours.map(hour => (
                    <div key={hour} className="flex items-start gap-3">
                        <div className="w-16 text-sm font-medium text-muted-foreground pt-2">
                            {formatTimeDisplay(`${hour}:00`)}
                        </div>
                        <div className="flex flex-wrap gap-2 flex-1">
                            {slotsByHour[hour].map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => slot.available && onSelectSlot(slot)}
                                    disabled={disabled || !slot.available}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-all",
                                        "border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                                        slot.available && selectedSlot?.id !== slot.id && [
                                            "bg-green-50 border-green-200 text-green-700",
                                            "hover:bg-green-100 hover:border-green-300"
                                        ],
                                        !slot.available && [
                                            "bg-gray-50 border-gray-200 text-gray-400",
                                            "cursor-not-allowed"
                                        ],
                                        selectedSlot?.id === slot.id && [
                                            "bg-primary border-primary text-primary-foreground",
                                            "ring-2 ring-primary ring-offset-1"
                                        ]
                                    )}
                                >
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatTimeDisplay(slot.startTime)}</span>
                                        {selectedSlot?.id === slot.id && (
                                            <CheckCircle className="w-3 h-3 ml-1" />
                                        )}
                                    </div>
                                    {slot.agentName && (
                                        <div className="flex items-center gap-1 text-xs opacity-70 mt-0.5">
                                            <User className="w-2.5 h-2.5" />
                                            <span>{slot.agentName}</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {slots.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No time slots available for this date</p>
                </div>
            )}
        </div>
    );
}

export default TimeSlotPicker;
