'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Phone,
    PhoneForwarded,
    Video,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Bot,
    User,
    Building2,
    Calendar,
    ArrowRight,
    Headphones,
    RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
type TransferType = 'agent' | 'video_ivr' | 'queue' | 'external' | 'callback' | 'ivr_flow';

interface TransferDestination {
    id: string;
    name: string;
    type: TransferType;
    status: 'available' | 'busy' | 'offline';
    department?: string;
    skills?: string[];
    priority?: number;
    videoCapable?: boolean;
    workflowId?: string;
    queueSize?: number;
    avgWaitTime?: number;
    agentType?: 'human' | 'ai';
    currentLoad?: number;
}

interface CallTransferPanelProps {
    sessionId?: string;
    callerInfo?: {
        name?: string;
        phone?: string;
    };
    currentContext?: {
        intent?: string;
        sentiment?: string;
    };
    onTransferComplete?: (result: any) => void;
    onClose?: () => void;
}

const TRANSFER_TYPE_CONFIG = {
    agent: { icon: Headphones, label: 'Agent', color: 'text-blue-600' },
    video_ivr: { icon: Video, label: 'Video IVR', color: 'text-purple-600' },
    queue: { icon: Users, label: 'Queue', color: 'text-orange-600' },
    external: { icon: Phone, label: 'External', color: 'text-green-600' },
    callback: { icon: Calendar, label: 'Callback', color: 'text-teal-600' },
    ivr_flow: { icon: PhoneForwarded, label: 'IVR Flow', color: 'text-gray-600' }
};

export function CallTransferPanel({
    sessionId,
    callerInfo,
    currentContext,
    onTransferComplete,
    onClose
}: CallTransferPanelProps) {
    const [destinations, setDestinations] = useState<TransferDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [transferring, setTransferring] = useState(false);
    const [selectedType, setSelectedType] = useState<TransferType | 'all'>('all');
    const [selectedDestination, setSelectedDestination] = useState<TransferDestination | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [transferReason, setTransferReason] = useState('');
    const [transferNotes, setTransferNotes] = useState('');
    const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

    // Load destinations
    useEffect(() => {
        loadDestinations();
    }, [selectedType]);

    const loadDestinations = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedType !== 'all') {
                params.set('type', selectedType);
            }
            params.set('available', 'true');

            const response = await fetch(`/api/call-transfer?${params}`);
            const result = await response.json();

            if (result.success) {
                setDestinations(result.data.destinations);
            }
        } catch (error) {
            console.error('Error loading destinations:', error);
            toast({
                title: 'Error',
                description: 'Failed to load transfer destinations',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedDestination || !sessionId) return;

        try {
            setTransferring(true);

            const response = await fetch('/api/call-transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    transfer_type: selectedDestination.type,
                    destination_id: selectedDestination.id,
                    reason: transferReason || 'User requested transfer',
                    priority,
                    notes: transferNotes,
                    caller_info: callerInfo,
                    session_context: currentContext
                })
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: 'Transfer Initiated',
                    description: `Call is being transferred to ${selectedDestination.name}`
                });

                // If Video IVR, redirect to video session
                if (selectedDestination.type === 'video_ivr' && result.data.video_session_url) {
                    window.location.href = result.data.video_session_url;
                }

                onTransferComplete?.(result.data);
                setShowConfirmDialog(false);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Transfer failed:', error);
            toast({
                title: 'Transfer Failed',
                description: error instanceof Error ? error.message : 'Failed to transfer call',
                variant: 'destructive'
            });
        } finally {
            setTransferring(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return <Badge className="bg-green-100 text-green-800">Available</Badge>;
            case 'busy':
                return <Badge className="bg-yellow-100 text-yellow-800">Busy</Badge>;
            case 'offline':
                return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
            default:
                return null;
        }
    };

    const getTypeIcon = (type: TransferType) => {
        const config = TRANSFER_TYPE_CONFIG[type];
        const Icon = config.icon;
        return <Icon className={`h-5 w-5 ${config.color}`} />;
    };

    const formatWaitTime = (seconds?: number) => {
        if (!seconds) return 'Instant';
        if (seconds < 60) return `${seconds}s`;
        return `${Math.ceil(seconds / 60)}m`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <PhoneForwarded className="h-6 w-6 text-primary" />
                        Call Transfer
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Transfer current call to an agent, queue, or Video IVR
                    </p>
                </div>
                <Button variant="outline" onClick={loadDestinations}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Current Session Info */}
            {sessionId && (
                <Alert>
                    <Phone className="h-4 w-4" />
                    <AlertTitle>Active Session</AlertTitle>
                    <AlertDescription>
                        Session: {sessionId}
                        {callerInfo?.name && ` • Caller: ${callerInfo.name}`}
                        {callerInfo?.phone && ` • ${callerInfo.phone}`}
                    </AlertDescription>
                </Alert>
            )}

            {/* Transfer Type Filter */}
            <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as TransferType | 'all')}>
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="video_ivr">
                        <Video className="h-4 w-4 mr-1" />
                        Video
                    </TabsTrigger>
                    <TabsTrigger value="agent">Agent</TabsTrigger>
                    <TabsTrigger value="queue">Queue</TabsTrigger>
                    <TabsTrigger value="external">External</TabsTrigger>
                    <TabsTrigger value="callback">Callback</TabsTrigger>
                    <TabsTrigger value="ivr_flow">IVR</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Destinations Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {destinations.map((destination) => (
                        <Card
                            key={destination.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedDestination?.id === destination.id
                                    ? 'ring-2 ring-primary border-primary'
                                    : ''
                                } ${destination.status !== 'available' ? 'opacity-60' : ''}`}
                            onClick={() => {
                                if (destination.status === 'available') {
                                    setSelectedDestination(destination);
                                    setShowConfirmDialog(true);
                                }
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gray-100">
                                            {getTypeIcon(destination.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{destination.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {TRANSFER_TYPE_CONFIG[destination.type].label}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(destination.status)}
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {destination.department && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            {destination.department}
                                        </div>
                                    )}
                                    {destination.queueSize !== undefined && (
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {destination.queueSize} in queue
                                        </div>
                                    )}
                                    {destination.avgWaitTime !== undefined && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            ~{formatWaitTime(destination.avgWaitTime)} wait
                                        </div>
                                    )}
                                    {destination.agentType && (
                                        <div className="flex items-center gap-2">
                                            {destination.agentType === 'ai' ? (
                                                <Bot className="h-4 w-4" />
                                            ) : (
                                                <User className="h-4 w-4" />
                                            )}
                                            {destination.agentType === 'ai' ? 'AI Agent' : 'Human Agent'}
                                        </div>
                                    )}
                                    {destination.videoCapable && (
                                        <Badge variant="outline" className="text-purple-600">
                                            <Video className="h-3 w-3 mr-1" />
                                            Video Capable
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {destinations.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No transfer destinations available</p>
                        </div>
                    )}
                </div>
            )}

            {/* Transfer Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PhoneForwarded className="h-5 w-5" />
                            Confirm Transfer
                        </DialogTitle>
                        <DialogDescription>
                            Transfer call to {selectedDestination?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Destination Summary */}
                        {selectedDestination && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {getTypeIcon(selectedDestination.type)}
                                    <div>
                                        <p className="font-medium">{selectedDestination.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedDestination.department || TRANSFER_TYPE_CONFIG[selectedDestination.type].label}
                                        </p>
                                    </div>
                                </div>
                                {selectedDestination.type === 'video_ivr' && (
                                    <Alert className="mt-3">
                                        <Video className="h-4 w-4" />
                                        <AlertDescription>
                                            Caller will be upgraded to a video session
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* Transfer Reason */}
                        <div className="space-y-2">
                            <Label>Transfer Reason</Label>
                            <Select value={transferReason} onValueChange={setTransferReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select reason..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer_request">Customer Request</SelectItem>
                                    <SelectItem value="escalation">Escalation Required</SelectItem>
                                    <SelectItem value="specialized_support">Specialized Support Needed</SelectItem>
                                    <SelectItem value="video_verification">Video Verification</SelectItem>
                                    <SelectItem value="sales_inquiry">Sales Inquiry</SelectItem>
                                    <SelectItem value="technical_issue">Technical Issue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea
                                placeholder="Add any notes for the receiving agent..."
                                value={transferNotes}
                                onChange={(e) => setTransferNotes(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleTransfer} disabled={transferring}>
                            {transferring ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Transferring...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Transfer Now
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CallTransferPanel;
