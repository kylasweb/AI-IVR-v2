'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
    Play as Video,
    Pause as VideoOff,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Camera,
    X as CameraOff,
    Monitor,
    Users,
    Settings,
    Play,
    Pause,
    Circle,
    Download,
    Upload,
    Share2,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeOff,
    RotateCcw,
    Save,
    Plus,
    Eye,
    Edit,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Zap,
    Globe,
    Star,
    TrendingUp,
    Activity,
    FileText as FileVideo,
    Layers,
    Paintbrush as Palette,
    Terminal as Code,
    PanelTop as Layout,
    GitBranch as Workflow,
    Bot,
    MessageSquare,
    User,
    PhoneCall,
    Calendar,
    BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoCall {
    id: string;
    callerName: string;
    callerNumber: string;
    status: 'active' | 'waiting' | 'ended' | 'failed';
    duration: number;
    startTime: string;
    endTime?: string;
    type: 'inbound' | 'outbound';
    recordingEnabled: boolean;
    recordingUrl?: string;
    aiAssistantActive: boolean;
    transcriptAvailable: boolean;
    metadata: {
        device: string;
        resolution: string;
        bitrate: number;
        location: string;
    };
}

interface VideoWorkflow {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'active' | 'paused' | 'archived';
    triggers: string[];
    steps: WorkflowStep[];
    analytics: {
        totalCalls: number;
        avgDuration: number;
        completionRate: number;
        satisfactionScore: number;
    };
    createdAt: string;
    updatedAt: string;
}

interface WorkflowStep {
    id: string;
    type: 'greeting' | 'menu' | 'form' | 'ai_response' | 'transfer' | 'end';
    title: string;
    content: string;
    options?: string[];
    nextStep?: string;
    conditions?: any[];
    aiEnabled: boolean;
}

interface VideoSession {
    id: string;
    workflowId: string;
    callId: string;
    currentStep: string;
    userInputs: Record<string, any>;
    aiResponses: string[];
    status: 'active' | 'completed' | 'abandoned';
    startTime: string;
    endTime?: string;
}

interface VideoStats {
    activeCalls: number;
    totalCalls: number;
    avgDuration: number;
    completionRate: number;
    satisfactionScore: number;
    recordingStorage: number; // in GB
}

const VideoIVR: React.FC = () => {
    const [calls, setCalls] = useState<VideoCall[]>([]);
    const [workflows, setWorkflows] = useState<VideoWorkflow[]>([]);
    const [sessions, setSessions] = useState<VideoSession[]>([]);
    const [stats, setStats] = useState<VideoStats>({
        activeCalls: 0,
        totalCalls: 0,
        avgDuration: 0,
        completionRate: 0,
        satisfactionScore: 0,
        recordingStorage: 0
    });

    const [selectedCall, setSelectedCall] = useState<VideoCall | null>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState<VideoWorkflow | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'workflow' | 'call'>('workflow');

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Mock data
    const mockCalls: VideoCall[] = [
        {
            id: '1',
            callerName: 'John Smith',
            callerNumber: '+1-555-123-4567',
            status: 'active',
            duration: 245,
            startTime: '2024-11-08T10:30:00Z',
            type: 'inbound',
            recordingEnabled: true,
            aiAssistantActive: true,
            transcriptAvailable: true,
            metadata: {
                device: 'iPhone 15 Pro',
                resolution: '1920x1080',
                bitrate: 2000,
                location: 'New York, USA'
            }
        },
        {
            id: '2',
            callerName: 'Sarah Johnson',
            callerNumber: '+1-555-987-6543',
            status: 'waiting',
            duration: 0,
            startTime: '2024-11-08T10:45:00Z',
            type: 'inbound',
            recordingEnabled: false,
            aiAssistantActive: true,
            transcriptAvailable: false,
            metadata: {
                device: 'Samsung Galaxy S24',
                resolution: '1280x720',
                bitrate: 1500,
                location: 'Los Angeles, USA'
            }
        }
    ];

    const mockWorkflows: VideoWorkflow[] = [
        {
            id: '1',
            name: 'Customer Support Video IVR',
            description: 'Comprehensive video-based customer support with AI assistance',
            status: 'active',
            triggers: ['support', 'help', 'technical'],
            steps: [
                {
                    id: '1',
                    type: 'greeting',
                    title: 'Welcome Message',
                    content: 'Welcome to our Video Support! How can we assist you today?',
                    aiEnabled: true
                },
                {
                    id: '2',
                    type: 'menu',
                    title: 'Main Menu',
                    content: 'Please select from the following options:',
                    options: ['Technical Support', 'Billing Inquiry', 'General Information'],
                    aiEnabled: true
                }
            ],
            analytics: {
                totalCalls: 1250,
                avgDuration: 320,
                completionRate: 87.5,
                satisfactionScore: 4.2
            },
            createdAt: '2024-10-15',
            updatedAt: '2024-11-08'
        },
        {
            id: '2',
            name: 'Product Demo Video Flow',
            description: 'Interactive product demonstration with real-time guidance',
            status: 'active',
            triggers: ['demo', 'product', 'showcase'],
            steps: [
                {
                    id: '1',
                    type: 'greeting',
                    title: 'Demo Introduction',
                    content: 'Welcome to our interactive product demo! Let me guide you through our features.',
                    aiEnabled: true
                }
            ],
            analytics: {
                totalCalls: 890,
                avgDuration: 480,
                completionRate: 92.1,
                satisfactionScore: 4.6
            },
            createdAt: '2024-10-20',
            updatedAt: '2024-11-07'
        }
    ];

    useEffect(() => {
        loadData();
        setupWebRTC();
    }, []);

    const loadData = async () => {
        try {
            // Simulate API calls
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCalls(mockCalls);
            setWorkflows(mockWorkflows);

            // Calculate stats
            const activeCalls = mockCalls.filter(c => c.status === 'active').length;
            const totalCalls = mockCalls.length;
            const avgDuration = mockCalls.reduce((sum, c) => sum + c.duration, 0) / totalCalls;
            const totalWorkflows = mockWorkflows.reduce((sum, w) => sum + w.analytics.totalCalls, 0);
            const avgCompletion = mockWorkflows.reduce((sum, w) => sum + w.analytics.completionRate, 0) / mockWorkflows.length;
            const avgSatisfaction = mockWorkflows.reduce((sum, w) => sum + w.analytics.satisfactionScore, 0) / mockWorkflows.length;

            setStats({
                activeCalls,
                totalCalls: totalWorkflows,
                avgDuration,
                completionRate: avgCompletion,
                satisfactionScore: avgSatisfaction,
                recordingStorage: 15.7 // Mock value in GB
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load video IVR data",
                variant: "destructive",
            });
        }
    };

    const setupWebRTC = async () => {
        try {
            // Initialize WebRTC for video calling capabilities
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.log('WebRTC setup failed:', error);
            // Handle gracefully for demo purposes
        }
    };

    const startCall = async (workflowId?: string) => {
        try {
            setIsCallActive(true);
            toast({
                title: "Call Started",
                description: "Video IVR session initiated successfully",
            });

            // Simulate call setup
            const newCall: VideoCall = {
                id: Date.now().toString(),
                callerName: 'Demo Caller',
                callerNumber: '+1-555-000-0000',
                status: 'active',
                duration: 0,
                startTime: new Date().toISOString(),
                type: 'inbound',
                recordingEnabled: isRecording,
                aiAssistantActive: true,
                transcriptAvailable: false,
                metadata: {
                    device: 'Web Browser',
                    resolution: '1280x720',
                    bitrate: 1500,
                    location: 'Demo Location'
                }
            };

            setCalls(prev => [newCall, ...prev]);
            setSelectedCall(newCall);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start video call",
                variant: "destructive",
            });
        }
    };

    const endCall = () => {
        setIsCallActive(false);
        if (selectedCall) {
            const updatedCall = {
                ...selectedCall,
                status: 'ended' as const,
                endTime: new Date().toISOString()
            };
            setCalls(prev => prev.map(c => c.id === selectedCall.id ? updatedCall : c));
        }
        setSelectedCall(null);

        toast({
            title: "Call Ended",
            description: "Video IVR session ended successfully",
        });
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        toast({
            title: isMuted ? "Microphone Enabled" : "Microphone Muted",
            description: isMuted ? "You can now speak" : "Your microphone is muted",
        });
    };

    const toggleVideo = () => {
        setIsVideoEnabled(!isVideoEnabled);
        toast({
            title: isVideoEnabled ? "Camera Disabled" : "Camera Enabled",
            description: isVideoEnabled ? "Your video is now off" : "Your video is now on",
        });
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        toast({
            title: isRecording ? "Recording Stopped" : "Recording Started",
            description: isRecording ? "Call recording has been stopped" : "Call recording has started",
        });
    };

    const createWorkflow = () => {
        setDialogType('workflow');
        setIsDialogOpen(true);
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        return `${minutes}m ${secs}s`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Video className="h-4 w-4 text-green-500" />;
            case 'waiting': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'ended': return <PhoneOff className="h-4 w-4 text-gray-500" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getWorkflowStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Video IVR Management</h1>
                    <p className="text-gray-600 mt-2">
                        Manage video-based interactive voice response systems with AI assistance
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => loadData()}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button onClick={() => startCall()}>
                        <Video className="mr-2 h-4 w-4" />
                        Test Call
                    </Button>
                    <Button onClick={createWorkflow}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Workflow
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
                        <Video className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.activeCalls}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                        <PhoneCall className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCalls}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.satisfactionScore.toFixed(1)}/5</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                        <FileVideo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recordingStorage.toFixed(1)}GB</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
                    <TabsTrigger value="workflows">Workflows</TabsTrigger>
                    <TabsTrigger value="calls">Call History</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Live Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Video Preview */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5" />
                                    Video Preview
                                    {isCallActive && (
                                        <Badge variant="default" className="bg-red-500">
                                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                                            LIVE
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    {!isVideoEnabled && (
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                            <CameraOff className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Video Controls Overlay */}
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                                        <Button
                                            size="sm"
                                            variant={isMuted ? "destructive" : "secondary"}
                                            onClick={toggleMute}
                                        >
                                            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant={!isVideoEnabled ? "destructive" : "secondary"}
                                            onClick={toggleVideo}
                                        >
                                            {isVideoEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant={isRecording ? "destructive" : "secondary"}
                                            onClick={toggleRecording}
                                        >
                                            <Circle className="h-4 w-4" />
                                        </Button>

                                        {isCallActive ? (
                                            <Button size="sm" variant="destructive" onClick={endCall}>
                                                <PhoneOff className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="default" onClick={() => startCall()}>
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Call Information */}
                                {selectedCall && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Caller</p>
                                                <p className="font-medium">{selectedCall.callerName}</p>
                                                <p className="text-sm text-gray-600">{selectedCall.callerNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Duration</p>
                                                <p className="font-medium">{formatDuration(selectedCall.duration)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Resolution</p>
                                                <p className="font-medium">{selectedCall.metadata.resolution}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Device</p>
                                                <p className="font-medium">{selectedCall.metadata.device}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active Calls */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Active Calls
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-80">
                                    <div className="space-y-3">
                                        {calls.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <PhoneOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>No active calls</p>
                                            </div>
                                        ) : (
                                            calls.map((call) => (
                                                <div
                                                    key={call.id}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedCall?.id === call.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setSelectedCall(call)}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(call.status)}
                                                            <Badge className={call.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                                {call.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDuration(call.duration)}
                                                        </p>
                                                    </div>

                                                    <p className="font-medium">{call.callerName}</p>
                                                    <p className="text-sm text-gray-600">{call.callerNumber}</p>

                                                    <div className="flex items-center gap-2 mt-2">
                                                        {call.recordingEnabled && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Circle className="h-3 w-3 mr-1" />
                                                                Recording
                                                            </Badge>
                                                        )}
                                                        {call.aiAssistantActive && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Bot className="h-3 w-3 mr-1" />
                                                                AI Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Assistant Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                AI Assistant
                                <Badge variant="outline" className="text-green-600">
                                    Active
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert>
                                    <MessageSquare className="h-4 w-4" />
                                    <AlertTitle>Real-time Assistance</AlertTitle>
                                    <AlertDescription>
                                        AI is actively listening and ready to provide suggestions for call handling,
                                        customer information, and workflow navigation.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Suggested Actions</h4>
                                        <ul className="text-sm space-y-1 text-gray-600">
                                            <li>• Offer screen sharing</li>
                                            <li>• Schedule follow-up</li>
                                            <li>• Transfer to specialist</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Customer Insights</h4>
                                        <ul className="text-sm space-y-1 text-gray-600">
                                            <li>• Premium customer</li>
                                            <li>• Previous contact: 2 days ago</li>
                                            <li>• Satisfaction score: 4.8/5</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Quick Responses</h4>
                                        <div className="space-y-1">
                                            <Button size="sm" variant="outline" className="w-full text-xs">
                                                "Let me check that for you"
                                            </Button>
                                            <Button size="sm" variant="outline" className="w-full text-xs">
                                                "I'll escalate this issue"
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Workflows Tab */}
                <TabsContent value="workflows" className="space-y-4">
                    <div className="grid gap-6">
                        {workflows.map((workflow) => (
                            <Card key={workflow.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
                                                <Workflow className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                                                    <Badge className={getWorkflowStatusColor(workflow.status)}>
                                                        {workflow.status}
                                                    </Badge>
                                                </div>

                                                <p className="text-gray-600 mb-4">{workflow.description}</p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Calls</p>
                                                        <p className="font-medium">{workflow.analytics.totalCalls.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Avg Duration</p>
                                                        <p className="font-medium">{formatDuration(workflow.analytics.avgDuration)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Completion Rate</p>
                                                        <p className="font-medium">{workflow.analytics.completionRate}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Satisfaction</p>
                                                        <p className="font-medium">{workflow.analytics.satisfactionScore}/5</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {workflow.triggers.map((trigger, index) => (
                                                        <Badge key={index} variant="secondary">{trigger}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => startCall(workflow.id)}>
                                                <Play className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <BarChart3 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Call History Tab */}
                <TabsContent value="calls" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Video Calls</CardTitle>
                            <CardDescription>Complete history of video IVR sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {calls.map((call) => (
                                    <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            {getStatusIcon(call.status)}
                                            <div>
                                                <p className="font-medium">{call.callerName}</p>
                                                <p className="text-sm text-gray-600">{call.callerNumber}</p>
                                                <p className="text-xs text-gray-500">{new Date(call.startTime).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-medium">{formatDuration(call.duration)}</p>
                                            <div className="flex gap-1 mt-1">
                                                {call.recordingEnabled && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <FileVideo className="h-3 w-3 mr-1" />
                                                        Recorded
                                                    </Badge>
                                                )}
                                                {call.transcriptAvailable && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <MessageSquare className="h-3 w-3 mr-1" />
                                                        Transcript
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" disabled={!call.recordingUrl}>
                                                <Play className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" disabled={!call.recordingUrl}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Call Completion Rate</span>
                                            <span className="text-sm text-gray-600">{stats.completionRate.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={stats.completionRate} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">Customer Satisfaction</span>
                                            <span className="text-sm text-gray-600">{stats.satisfactionScore.toFixed(1)}/5</span>
                                        </div>
                                        <Progress value={(stats.satisfactionScore / 5) * 100} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium">AI Accuracy</span>
                                            <span className="text-sm text-gray-600">94.2%</span>
                                        </div>
                                        <Progress value={94.2} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Peak Hours</span>
                                        <span className="text-sm text-gray-600">9AM - 11AM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Avg Resolution Time</span>
                                        <span className="text-sm text-gray-600">4.2 minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">First Call Resolution</span>
                                        <span className="text-sm text-gray-600">78.5%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Transfer Rate</span>
                                        <span className="text-sm text-gray-600">12.8%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Create Workflow Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === 'workflow' ? 'Create Video Workflow' : 'Start Video Call'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogType === 'workflow'
                                ? 'Configure a new interactive video workflow for your IVR system'
                                : 'Initiate a new video call session with AI assistance'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {dialogType === 'workflow' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="workflow-name">Workflow Name</Label>
                                    <Input id="workflow-name" placeholder="Enter workflow name" />
                                </div>
                                <div>
                                    <Label htmlFor="workflow-type">Workflow Type</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="support">Customer Support</SelectItem>
                                            <SelectItem value="sales">Sales Demo</SelectItem>
                                            <SelectItem value="onboarding">User Onboarding</SelectItem>
                                            <SelectItem value="training">Training Session</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="workflow-description">Description</Label>
                                <Textarea
                                    id="workflow-description"
                                    placeholder="Describe the workflow's purpose and target audience..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>AI Features</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="ai-assistant" defaultChecked />
                                        <Label htmlFor="ai-assistant">AI Assistant</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="transcription" defaultChecked />
                                        <Label htmlFor="transcription">Live Transcription</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="recording" />
                                        <Label htmlFor="recording">Auto Recording</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="sentiment" defaultChecked />
                                        <Label htmlFor="sentiment">Sentiment Analysis</Label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="triggers">Trigger Keywords</Label>
                                <Input
                                    id="triggers"
                                    placeholder="support, help, assistance, technical..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Comma-separated keywords that activate this workflow
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setIsDialogOpen(false)}>
                            {dialogType === 'workflow' ? (
                                <>
                                    <Workflow className="mr-2 h-4 w-4" />
                                    Create Workflow
                                </>
                            ) : (
                                <>
                                    <Video className="mr-2 h-4 w-4" />
                                    Start Call
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VideoIVR;
