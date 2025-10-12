'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    Phone,
    PhoneCall,
    PhoneOff,
    Phone as PhoneForwarded,
    Play as Pause,
    Play,
    Mic,
    MicOff,
    Clock,
    Users,
    TrendingUp,
    Activity,
    AlertCircle,
    CheckCircle,
    Clock as Timer,
    Volume2,
    Volume2 as VolumeX,
    Globe,
    MessageSquare,
    BarChart3,
    Activity as Signal,
    CheckCircle as Wifi,
    XCircle as WifiOff,
} from 'lucide-react';

import { callManager, CallSession, CallMetrics, SystemHealth, CallEvent } from '@/services/call-management-service';

interface CallControlProps {
    session: CallSession;
    onTransfer: (sessionId: string) => void;
    onHold: (sessionId: string) => void;
    onResume: (sessionId: string) => void;
    onEnd: (sessionId: string) => void;
}

const CallControl: React.FC<CallControlProps> = ({ session, onTransfer, onHold, onResume, onEnd }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(true);

    const getStatusColor = (status: CallSession['status']) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'on_hold': return 'bg-yellow-500';
            case 'transferring': return 'bg-blue-500';
            case 'incoming': return 'bg-purple-500';
            case 'ended': return 'bg-gray-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status: CallSession['status']) => {
        switch (status) {
            case 'active': return 'Active';
            case 'on_hold': return 'On Hold';
            case 'transferring': return 'Transferring';
            case 'incoming': return 'Incoming';
            case 'ended': return 'Ended';
            case 'failed': return 'Failed';
            default: return 'Unknown';
        }
    };

    const formatDuration = (startTime: Date): string => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)} animate-pulse`} />
                        <div>
                            <CardTitle className="text-lg">{session.phoneNumber}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Badge variant="outline">{getStatusLabel(session.status)}</Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {session.language.toUpperCase()}
                                </Badge>
                                {session.agent && (
                                    <Badge variant={session.agent.type === 'ai' ? 'default' : 'secondary'}>
                                        {session.agent.type === 'ai' ? '🤖' : '👤'} {session.agent.name}
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-mono font-bold">
                            {formatDuration(session.startTime)}
                        </div>
                        <div className="text-sm text-gray-500">
                            Started {session.startTime.toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Call Metrics */}
                {session.callMetrics && (
                    <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="text-sm text-gray-600">Audio Quality</div>
                            <div className="font-bold text-green-600">{(session.callMetrics.audioQuality * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600">Response Time</div>
                            <div className="font-bold">{session.callMetrics.responseTime}ms</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600">Interruptions</div>
                            <div className="font-bold text-orange-600">{session.callMetrics.interruptionCount}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600">Silence</div>
                            <div className="font-bold">{Math.round(session.callMetrics.silenceDuration)}s</div>
                        </div>
                    </div>
                )}

                {/* Voice Analysis */}
                {session.voiceAnalysis && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Voice Analysis</span>
                            <Badge variant={
                                session.voiceAnalysis.sentiment === 'positive' ? 'default' :
                                    session.voiceAnalysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                            }>
                                {session.voiceAnalysis.sentiment}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <span className="text-gray-600">Emotion:</span>
                                <span className="ml-1 font-medium">{session.voiceAnalysis.emotion}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Confidence:</span>
                                <span className="ml-1 font-medium">{(session.voiceAnalysis.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Stress:</span>
                                <span className={`ml-1 font-medium ${session.voiceAnalysis.stressLevel > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                                    {(session.voiceAnalysis.stressLevel * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Call Controls */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                        {session.status === 'on_hold' ? (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => onResume(session.sessionId)}
                                className="flex items-center gap-1"
                            >
                                <Play className="w-4 h-4" />
                                Resume
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onHold(session.sessionId)}
                                className="flex items-center gap-1"
                                disabled={session.status !== 'active'}
                            >
                                <Pause className="w-4 h-4" />
                                Hold
                            </Button>
                        )}

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsMuted(!isMuted)}
                            className="flex items-center gap-1"
                        >
                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            {isMuted ? 'Unmute' : 'Mute'}
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onTransfer(session.sessionId)}
                            className="flex items-center gap-1"
                            disabled={session.status !== 'active'}
                        >
                            <PhoneForwarded className="w-4 h-4" />
                            Transfer
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsRecording(!isRecording)}
                            className={`flex items-center gap-1 ${isRecording ? 'text-red-600' : ''}`}
                        >
                            {isRecording ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            {isRecording ? 'Recording' : 'Record'}
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onEnd(session.sessionId)}
                            className="flex items-center gap-1"
                        >
                            <PhoneOff className="w-4 h-4" />
                            End Call
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const TranscriptPanel: React.FC<{ session: CallSession }> = ({ session }) => {
    if (!session.transcript || session.transcript.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No transcript available yet</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-96">
            <div className="space-y-3 p-4">
                {session.transcript.map((entry, index) => (
                    <div key={entry.id || index} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className={entry.speaker === 'customer' ? 'bg-blue-100' : 'bg-green-100'}>
                                {entry.speaker === 'customer' ? '👤' : '🤖'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium capitalize">{entry.speaker}</span>
                                <span className="text-xs text-gray-500">
                                    {entry.timestamp.toLocaleTimeString()}
                                </span>
                                {entry.confidence && (
                                    <Badge variant="outline" className="text-xs">
                                        {(entry.confidence * 100).toFixed(0)}% confidence
                                    </Badge>
                                )}
                                {entry.intent && (
                                    <Badge variant="secondary" className="text-xs">
                                        {entry.intent}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm bg-gray-50 p-2 rounded">{entry.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};

const SystemHealthPanel: React.FC<{ health: SystemHealth }> = ({ health }) => {
    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getServiceStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'degraded': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            case 'offline': return <AlertCircle className="w-4 h-4 text-red-600" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">System Health</h3>
                <Badge className={getHealthColor(health.status)}>
                    {health.status.toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Services Status */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {health.services.map((service, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getServiceStatusIcon(service.status)}
                                    <span className="text-sm">{service.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">
                                        {service.uptime.toFixed(1)}% uptime
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Resource Usage */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>CPU Usage</span>
                                <span>{health.resources.cpuUsage.toFixed(1)}%</span>
                            </div>
                            <Progress value={health.resources.cpuUsage} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Memory Usage</span>
                                <span>{health.resources.memoryUsage.toFixed(1)}%</span>
                            </div>
                            <Progress value={health.resources.memoryUsage} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Network Latency</span>
                                <span>{health.resources.networkLatency.toFixed(0)}ms</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const MetricsPanel: React.FC<{ metrics: CallMetrics }> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Calls</p>
                            <p className="text-2xl font-bold text-green-600">{metrics.activeCalls}</p>
                        </div>
                        <Activity className="h-6 w-6 text-green-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Today</p>
                            <p className="text-2xl font-bold">{metrics.totalCalls}</p>
                        </div>
                        <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-green-600">{metrics.successRate.toFixed(1)}%</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Duration</p>
                            <p className="text-2xl font-bold">{Math.round(metrics.averageCallDuration / 1000 / 60)}m</p>
                        </div>
                        <Timer className="h-6 w-6 text-purple-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default function LiveCallDashboard() {
    const [activeCalls, setActiveCalls] = useState<CallSession[]>([]);
    const [metrics, setMetrics] = useState<CallMetrics>(callManager.getMetrics());
    const [systemHealth, setSystemHealth] = useState<SystemHealth>(callManager.getSystemHealth());
    const [selectedCall, setSelectedCall] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(callManager.isConnected());
    const [showStartCallDialog, setShowStartCallDialog] = useState(false);
    const [newCallPhone, setNewCallPhone] = useState('');

    // Event handlers
    const handleCallEvent = useCallback((event: CallEvent) => {
        switch (event.type) {
            case 'call_started':
            case 'call_ended':
            case 'status_change':
                setActiveCalls(callManager.getActiveCalls());
                break;
            case 'transcript_update':
                setActiveCalls(callManager.getActiveCalls());
                break;
            case 'metrics_update':
                setMetrics(event.data);
                break;
        }
    }, []);

    useEffect(() => {
        // Setup event listeners
        callManager.addEventListener('call_started', handleCallEvent);
        callManager.addEventListener('call_ended', handleCallEvent);
        callManager.addEventListener('status_change', handleCallEvent);
        callManager.addEventListener('transcript_update', handleCallEvent);
        callManager.addEventListener('metrics_update', handleCallEvent);

        // Initial data load
        setActiveCalls(callManager.getActiveCalls());
        setMetrics(callManager.getMetrics());
        setSystemHealth(callManager.getSystemHealth());

        // Connection status monitoring
        const connectionInterval = setInterval(() => {
            setIsConnected(callManager.isConnected());
        }, 5000);

        // Cleanup
        return () => {
            callManager.removeEventListener('call_started', handleCallEvent);
            callManager.removeEventListener('call_ended', handleCallEvent);
            callManager.removeEventListener('status_change', handleCallEvent);
            callManager.removeEventListener('transcript_update', handleCallEvent);
            callManager.removeEventListener('metrics_update', handleCallEvent);
            clearInterval(connectionInterval);
        };
    }, [handleCallEvent]);

    // Call actions
    const handleStartCall = async () => {
        if (!newCallPhone.trim()) return;

        try {
            await callManager.startCall(newCallPhone);
            setNewCallPhone('');
            setShowStartCallDialog(false);
        } catch (error) {
            console.error('Failed to start call:', error);
        }
    };

    const handleTransferCall = async (sessionId: string) => {
        try {
            await callManager.transferCall({
                sessionId,
                reason: 'User requested transfer',
                priority: 'normal'
            });
        } catch (error) {
            console.error('Failed to transfer call:', error);
        }
    };

    const handleHoldCall = async (sessionId: string) => {
        try {
            await callManager.holdCall(sessionId);
        } catch (error) {
            console.error('Failed to hold call:', error);
        }
    };

    const handleResumeCall = async (sessionId: string) => {
        try {
            await callManager.resumeCall(sessionId);
        } catch (error) {
            console.error('Failed to resume call:', error);
        }
    };

    const handleEndCall = async (sessionId: string) => {
        try {
            await callManager.endCall(sessionId);
            if (selectedCall === sessionId) {
                setSelectedCall(null);
            }
        } catch (error) {
            console.error('Failed to end call:', error);
        }
    };

    const selectedSession = selectedCall ? callManager.getCallById(selectedCall) : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Live Call Management</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        Real-time IVR call monitoring and control
                        {isConnected ? (
                            <Badge className="flex items-center gap-1 bg-green-100 text-green-700">
                                <Wifi className="w-3 h-3" />
                                Connected
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <WifiOff className="w-3 h-3" />
                                Disconnected
                            </Badge>
                        )}
                    </p>
                </div>
                <Button
                    onClick={() => setShowStartCallDialog(true)}
                    className="flex items-center gap-2"
                >
                    <PhoneCall className="w-4 h-4" />
                    Start Call
                </Button>
            </div>

            {/* Connection Warning */}
            {!isConnected && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Connection to IVR backend lost. Attempting to reconnect...
                    </AlertDescription>
                </Alert>
            )}

            {/* Metrics Dashboard */}
            <MetricsPanel metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Calls List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Active Calls ({activeCalls.length})
                            </CardTitle>
                            <CardDescription>
                                Monitor and control live IVR sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeCalls.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No active calls</p>
                                    <p className="text-sm">Start a new call to begin monitoring</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeCalls.map((call) => (
                                        <div
                                            key={call.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedCall === call.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                                }`}
                                            onClick={() => setSelectedCall(call.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full animate-pulse ${call.status === 'active' ? 'bg-green-500' :
                                                        call.status === 'on_hold' ? 'bg-yellow-500' :
                                                            call.status === 'transferring' ? 'bg-blue-500' :
                                                                'bg-gray-500'
                                                        }`} />
                                                    <div>
                                                        <div className="font-medium">{call.phoneNumber}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {call.status}
                                                            </Badge>
                                                            <span>{call.language.toUpperCase()}</span>
                                                            {call.agent && (
                                                                <span>• {call.agent.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono text-sm">
                                                        {Math.floor((Date.now() - call.startTime.getTime()) / 1000 / 60)}:
                                                        {Math.floor(((Date.now() - call.startTime.getTime()) / 1000) % 60).toString().padStart(2, '0')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {call.startTime.toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel */}
                <div className="space-y-4">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="transcript">Transcript</TabsTrigger>
                            <TabsTrigger value="health">Health</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4">
                            {selectedSession ? (
                                <CallControl
                                    session={selectedSession}
                                    onTransfer={handleTransferCall}
                                    onHold={handleHoldCall}
                                    onResume={handleResumeCall}
                                    onEnd={handleEndCall}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center text-gray-500">
                                        <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>Select a call to view details</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="transcript">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Live Transcript</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {selectedSession ? (
                                        <TranscriptPanel session={selectedSession} />
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>Select a call to view transcript</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="health">
                            <Card>
                                <CardContent className="p-4">
                                    <SystemHealthPanel health={systemHealth} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Start Call Dialog */}
            {showStartCallDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle>Start New Call</CardTitle>
                            <CardDescription>Enter phone number to initiate IVR call</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={newCallPhone}
                                onChange={(e) => setNewCallPhone(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleStartCall} className="flex-1">
                                    Start Call
                                </Button>
                                <Button variant="outline" onClick={() => setShowStartCallDialog(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}