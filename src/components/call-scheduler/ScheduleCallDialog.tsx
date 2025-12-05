'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import {
    CreateScheduledCallRequest,
    TimeSlot,
    generateTimeSlots,
    CallPriority,
    CallLanguage
} from '@/types/call-scheduler';
import { Phone, User, CalendarDays, Clock, Loader2 } from 'lucide-react';

interface ScheduleCallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSchedule: (data: CreateScheduledCallRequest) => Promise<void>;
    initialDate?: Date;
}

export function ScheduleCallDialog({
    open,
    onOpenChange,
    onSchedule,
    initialDate
}: ScheduleCallDialogProps) {
    const [step, setStep] = useState<'details' | 'datetime'>('details');
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    // Form state
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [priority, setPriority] = useState<CallPriority>('medium');
    const [language, setLanguage] = useState<CallLanguage>('ml');
    const [notes, setNotes] = useState('');

    // Fetch available slots when date changes
    useEffect(() => {
        if (selectedDate && step === 'datetime') {
            fetchSlots(selectedDate);
        }
    }, [selectedDate, step]);

    const fetchSlots = async (date: Date) => {
        setSlotsLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const response = await fetch(`/api/call-scheduler/slots?date=${dateStr}`);
            const data = await response.json();
            if (data.success) {
                setAvailableSlots(data.data.slots);
            }
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            // Generate default slots on error
            const dateStr = date.toISOString().split('T')[0];
            setAvailableSlots(generateTimeSlots(dateStr));
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!customerPhone || !selectedDate || !selectedSlot) return;

        setLoading(true);
        try {
            await onSchedule({
                customerPhone,
                customerName: customerName || undefined,
                scheduledDate: selectedDate.toISOString().split('T')[0],
                scheduledTime: selectedSlot.startTime,
                priority,
                language,
                notes: notes || undefined
            });

            // Reset form
            resetForm();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to schedule call:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep('details');
        setCustomerPhone('');
        setCustomerName('');
        setSelectedDate(new Date());
        setSelectedSlot(null);
        setPriority('medium');
        setLanguage('ml');
        setNotes('');
    };

    const canProceedToDateTime = customerPhone.length >= 10;
    const canSubmit = customerPhone && selectedDate && selectedSlot;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Schedule Call
                    </DialogTitle>
                </DialogHeader>

                {step === 'details' ? (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    Phone Number *
                                </Label>
                                <Input
                                    id="phone"
                                    placeholder="+91 9876543210"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    Customer Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Optional"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={priority} onValueChange={(v) => setPriority(v as CallPriority)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Language</Label>
                                <Select value={language} onValueChange={(v) => setLanguage(v as CallLanguage)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ml">Malayalam</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ta">Tamil</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any additional information about this call..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    Select Date
                                </Label>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    className="rounded-md border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Select Time Slot
                                </Label>
                                {slotsLoading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="max-h-[300px] overflow-y-auto border rounded-md p-3">
                                        <TimeSlotPicker
                                            slots={availableSlots}
                                            selectedSlot={selectedSlot}
                                            onSelectSlot={setSelectedSlot}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex justify-between">
                    {step === 'datetime' && (
                        <Button variant="outline" onClick={() => setStep('details')}>
                            Back
                        </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        {step === 'details' ? (
                            <Button
                                onClick={() => setStep('datetime')}
                                disabled={!canProceedToDateTime}
                            >
                                Next: Select Time
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit || loading}
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Schedule Call
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ScheduleCallDialog;
