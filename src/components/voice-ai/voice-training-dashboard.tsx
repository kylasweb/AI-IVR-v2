'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Play,
    Play as Pause,
    XCircle as Stop,
    Volume2,
    User,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    RotateCcw as RotateCw,
    Plus,
    Settings as Edit2,
    Save,
    X,
    Settings,
    Zap,
    BarChart3,
    Brain,
    Target,
    Shield,
    Eye,
    TrendingUp,
    Activity,
    Search,
    Filter,
    RefreshCw,
    Clock as Calendar,
    ChevronDown,
    Info,
    AlertTriangle,
    Mic as FileAudio,
    Database,
    Upload as CloudUpload,
    Mic,
    Activity as Waveform,
    PieChart,
    BarChart3 as BarChart,
    LineChart,
    Settings as Hash,
    CheckCircle as FileCheck,
    Settings as Folder,
    ArrowRight,
    ArrowLeft,
    MoreHorizontal,
    Settings as Cpu,
    Settings as HardDrive,
    Activity as Gauge,
    Layers,
    Settings as FlaskConical,
    GitBranch,
    CheckCircle as Sparkles,
    Zap as Rocket,
    Settings as Monitor,
    Download,
    Upload,
    Upload as Share2,
    Copy,
    Trash2,
    Clock as History,
    Clock as Timer,
    Maximize2,
    Minimize2,
    Mic as Headphones,
    Activity as Waves,
    CheckCircle as Signal,
    TrendingUp as TrendingDown,
    CheckCircle as Award,
    Star,
    Zap as Flame,
    CheckCircle as Wifi,
    XCircle as WifiOff,
    Settings as Server,
    Globe,
    MapPin,
    Users
} from 'lucide-react';

// Dashboard Interfaces
interface TrainingSession {
    id: string;
    modelName: string;
    modelId: string;
    startTime: Date;
    endTime?: Date;
    status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
    progress: number;
    currentEpoch: number;
    totalEpochs: number;
    currentLoss: number;
    currentAccuracy: number;
    bestAccuracy: number;
    trainingSpeed: number; // samples per second
    estimatedTimeRemaining: number; // in minutes
    resourceUsage: {
        gpuUtilization: number;
        gpuMemoryUsed: number;
        gpuMemoryTotal: number;
        cpuUtilization: number;
        ramUsage: number;
        diskUsage: number;
    };
    metrics: {
        epoch: number[];
        trainingLoss: number[];
        validationLoss: number[];
        trainingAccuracy: number[];
        validationAccuracy: number[];
        learningRate: number[];
    };
}

interface SystemMetrics {
    totalModels: number;
    modelsTraining: number;
    modelsCompleted: number;
    modelsFailed: number;
    totalTrainingTime: number; // in hours
    averageAccuracy: number;
    systemLoad: {
        cpu: number;
        gpu: number;
        memory: number;
        disk: number;
        network: number;
    };
    resourceAllocation: {
        totalGPUs: number;
        availableGPUs: number;
        totalRAM: number;
        availableRAM: number;
        totalStorage: number;
        availableStorage: number;
    };
    performance: {
        averageTrainingSpeed: number;
        queueWaitTime: number;
        successRate: number;
        errorRate: number;
    };
}

interface TrainingHistory {
    date: string;
    completedSessions: number;
    averageAccuracy: number;
    totalTrainingTime: number;
    resourceEfficiency: number;
    modelTypes: {
        malayalam: number;
        english: number;
        manglish: number;
    };
}

interface AlertNotification {
    id: string;
    type: 'error' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    sessionId?: string;
    acknowledged: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

// Real-time Training Monitor Component
const RealtimeTrainingMonitor: React.FC<{
    sessions: TrainingSession[];
    onPauseSession: (sessionId: string) => void;
    onResumeSession: (sessionId: string) => void;
    onStopSession: (sessionId: string) => void;
}> = ({ sessions, onPauseSession, onResumeSession, onStopSession }) => {
    const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const activeSessions = sessions.filter(s => ['running', 'paused'].includes(s.status));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-green-500 animate-pulse';
            case 'paused': return 'bg-yellow-500';
            case 'completed': return 'bg-blue-500';
            case 'failed': return 'bg-red-500';
            case 'cancelled': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Header with Auto-refresh Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Active Training Sessions</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-sm text-gray-600">
                            {autoRefresh ? 'Live' : 'Paused'}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Sessions Grid */}
            {activeSessions.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No active training sessions</p>
                        <p className="text-sm">Start training a model to see real-time progress</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeSessions.map(session => (
                        <Card
                            key={session.id}
                            className={`transition-all cursor-pointer ${selectedSession?.id === session.id ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'
                                }`}
                            onClick={() => setSelectedSession(session)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                                            {session.modelName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline">
                                                Epoch {session.currentEpoch}/{session.totalEpochs}
                                            </Badge>
                                            <span className="text-xs">
                                                ETA: {formatTime(session.estimatedTimeRemaining)}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{session.progress.toFixed(1)}%</div>
                                        <div className="text-xs text-gray-600">
                                            {session.trainingSpeed.toFixed(0)} samples/s
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Progress Bar */}
                                <div>
                                    <Progress value={session.progress} className="h-2" />
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Current Loss</p>
                                        <p className="font-bold">{session.currentLoss.toFixed(4)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Current Accuracy</p>
                                        <p className="font-bold">{(session.currentAccuracy * 100).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Best Accuracy</p>
                                        <p className="font-bold text-green-600">{(session.bestAccuracy * 100).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Training Speed</p>
                                        <p className="font-bold">{session.trainingSpeed.toFixed(0)} s/s</p>
                                    </div>
                                </div>

                                {/* Resource Usage */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">GPU</span>
                                        <span className="text-xs font-medium">{session.resourceUsage.gpuUtilization}%</span>
                                    </div>
                                    <Progress value={session.resourceUsage.gpuUtilization} className="h-1" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">GPU Memory</span>
                                        <span className="text-xs font-medium">
                                            {formatBytes(session.resourceUsage.gpuMemoryUsed * 1024 * 1024)} /
                                            {formatBytes(session.resourceUsage.gpuMemoryTotal * 1024 * 1024)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={(session.resourceUsage.gpuMemoryUsed / session.resourceUsage.gpuMemoryTotal) * 100}
                                        className="h-1"
                                    />
                                </div>

                                {/* Control Buttons */}
                                <div className="flex gap-2 pt-2 border-t">
                                    {session.status === 'running' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPauseSession(session.id);
                                            }}
                                            className="flex-1"
                                        >
                                            <Pause className="w-3 h-3 mr-1" />
                                            Pause
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onResumeSession(session.id);
                                            }}
                                            className="flex-1"
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            Resume
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStopSession(session.id);
                                        }}
                                        className="flex-1 text-red-600 hover:text-red-700"
                                    >
                                        <Stop className="w-3 h-3 mr-1" />
                                        Stop
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detailed Session View */}
            {selectedSession && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Training Metrics - {selectedSession.modelName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center text-gray-500">
                                <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Real-time Training Metrics Chart</p>
                                <p className="text-sm">Loss and Accuracy over Epochs</p>
                                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>Training Loss</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span>Validation Loss</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Accuracy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// System Overview Component
const SystemOverview: React.FC<{
    metrics: SystemMetrics;
}> = ({ metrics }) => {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 GB';
        const gb = bytes / (1024 * 1024 * 1024);
        return gb.toFixed(1) + ' GB';
    };

    const getResourceColor = (usage: number) => {
        if (usage >= 90) return 'text-red-600';
        if (usage >= 70) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Total Models</p>
                                <p className="text-2xl font-bold">{metrics.totalModels}</p>
                            </div>
                            <Brain className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Training</p>
                                <p className="text-2xl font-bold text-green-600">{metrics.modelsTraining}</p>
                            </div>
                            <RotateCw className="w-8 h-8 text-green-600 animate-spin" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-blue-600">{metrics.modelsCompleted}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{metrics.modelsFailed}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gauge className="w-5 h-5" />
                            System Load
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(metrics.systemLoad).map(([resource, usage]) => (
                            <div key={resource} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm capitalize">{resource}</span>
                                    <span className={`text-sm font-medium ${getResourceColor(usage)}`}>
                                        {usage.toFixed(1)}%
                                    </span>
                                </div>
                                <Progress value={usage} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5" />
                            Resource Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">GPUs</p>
                                <p className="font-bold">
                                    {metrics.resourceAllocation.availableGPUs} / {metrics.resourceAllocation.totalGPUs}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">RAM</p>
                                <p className="font-bold">
                                    {formatBytes(metrics.resourceAllocation.availableRAM)} /
                                    {formatBytes(metrics.resourceAllocation.totalRAM)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Storage</p>
                                <p className="font-bold">
                                    {formatBytes(metrics.resourceAllocation.availableStorage)} /
                                    {formatBytes(metrics.resourceAllocation.totalStorage)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Queue Wait</p>
                                <p className="font-bold">{metrics.performance.queueWaitTime}m</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Success Rate</span>
                                <span className="text-sm font-medium text-green-600">
                                    {(metrics.performance.successRate * 100).toFixed(1)}%
                                </span>
                            </div>
                            <Progress value={metrics.performance.successRate * 100} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Performance Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {metrics.totalTrainingTime.toFixed(1)}h
                            </p>
                            <p className="text-sm text-gray-600">Total Training Time</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {(metrics.averageAccuracy * 100).toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-600">Average Accuracy</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {metrics.performance.averageTrainingSpeed.toFixed(0)}
                            </p>
                            <p className="text-sm text-gray-600">Avg Speed (samples/s)</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                                {(metrics.performance.errorRate * 100).toFixed(2)}%
                            </p>
                            <p className="text-sm text-gray-600">Error Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Training History Component
const TrainingHistoryPanel: React.FC<{
    history: TrainingHistory[];
}> = ({ history }) => {
    const [timeRange, setTimeRange] = useState<string>('7d');

    const totalSessions = history.reduce((sum, day) => sum + day.completedSessions, 0);
    const averageAccuracy = history.reduce((sum, day) => sum + day.averageAccuracy, 0) / history.length;
    const totalTrainingTime = history.reduce((sum, day) => sum + day.totalTrainingTime, 0);

    return (
        <div className="space-y-6">
            {/* Header with Time Range Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Training History</h3>
                    <p className="text-sm text-gray-600">Historical training performance and trends</p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Total Sessions</p>
                                <p className="text-2xl font-bold">{totalSessions}</p>
                            </div>
                            <Activity className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Avg Accuracy</p>
                                <p className="text-2xl font-bold">{(averageAccuracy * 100).toFixed(1)}%</p>
                            </div>
                            <Target className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Training Time</p>
                                <p className="text-2xl font-bold">{totalTrainingTime.toFixed(1)}h</p>
                            </div>
                            <Clock className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LineChart className="w-5 h-5" />
                        Training Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Historical Training Performance Chart</p>
                            <p className="text-sm">Sessions, accuracy, and efficiency over time</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Language Distribution Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Language Training Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {history.length > 0 && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Malayalam</span>
                                    <div className="flex items-center gap-2">
                                        <Progress
                                            value={(history[0].modelTypes.malayalam / totalSessions) * 100}
                                            className="w-20 h-2"
                                        />
                                        <span className="text-xs text-gray-600 w-8">
                                            {history.reduce((sum, day) => sum + day.modelTypes.malayalam, 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">English</span>
                                    <div className="flex items-center gap-2">
                                        <Progress
                                            value={(history[0].modelTypes.english / totalSessions) * 100}
                                            className="w-20 h-2"
                                        />
                                        <span className="text-xs text-gray-600 w-8">
                                            {history.reduce((sum, day) => sum + day.modelTypes.english, 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Manglish</span>
                                    <div className="flex items-center gap-2">
                                        <Progress
                                            value={(history[0].modelTypes.manglish / totalSessions) * 100}
                                            className="w-20 h-2"
                                        />
                                        <span className="text-xs text-gray-600 w-8">
                                            {history.reduce((sum, day) => sum + day.modelTypes.manglish, 0)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Alerts and Notifications Component
const AlertsPanel: React.FC<{
    alerts: AlertNotification[];
    onAcknowledge: (alertId: string) => void;
    onDismiss: (alertId: string) => void;
}> = ({ alerts, onAcknowledge, onDismiss }) => {
    const [filter, setFilter] = useState<string>('all');

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all') return true;
        if (filter === 'unacknowledged') return !alert.acknowledged;
        return alert.type === filter;
    });

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'info': return <Info className="w-4 h-4 text-blue-600" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getAlertColor = (type: string, priority: string) => {
        const base = {
            error: 'border-red-200 bg-red-50',
            warning: 'border-yellow-200 bg-yellow-50',
            info: 'border-blue-200 bg-blue-50',
            success: 'border-green-200 bg-green-50'
        }[type] || 'border-gray-200 bg-gray-50';

        if (priority === 'critical') return base + ' shadow-md';
        return base;
    };

    const criticalAlerts = alerts.filter(a => a.priority === 'critical' && !a.acknowledged);
    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

    return (
        <div className="space-y-4">
            {/* Header with Statistics */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">System Alerts</h3>
                    <div className="flex items-center gap-4 mt-1">
                        <Badge variant="destructive" className="text-xs">
                            {criticalAlerts.length} Critical
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {unacknowledgedCount} Unacknowledged
                        </Badge>
                    </div>
                </div>

                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Alerts</SelectItem>
                        <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                        <SelectItem value="error">Errors</SelectItem>
                        <SelectItem value="warning">Warnings</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Alerts List */}
            <ScrollArea className="h-96">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No alerts found</p>
                        <p className="text-sm">Your system is running smoothly</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredAlerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`p-3 border rounded-lg ${getAlertColor(alert.type, alert.priority)} ${!alert.acknowledged ? 'border-l-4' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {getAlertIcon(alert.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-sm">{alert.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {alert.priority}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {alert.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                        {alert.sessionId && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Session: {alert.sessionId}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {!alert.acknowledged && (
                                    <div className="flex gap-2 mt-3 pt-2 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onAcknowledge(alert.id)}
                                            className="text-xs"
                                        >
                                            Acknowledge
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDismiss(alert.id)}
                                            className="text-xs"
                                        >
                                            Dismiss
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

// Main Voice Training Dashboard Component
export default function VoiceTrainingDashboard() {
    const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
    const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);
    const [alerts, setAlerts] = useState<AlertNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Auto-refresh interval
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadDashboardData();

        if (autoRefresh) {
            refreshInterval.current = setInterval(loadDashboardData, 5000); // Refresh every 5 seconds
        }

        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
        };
    }, [autoRefresh]);

    const loadDashboardData = async () => {
        try {
            await Promise.all([
                loadTrainingSessions(),
                loadSystemMetrics(),
                loadTrainingHistory(),
                loadAlerts()
            ]);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrainingSessions = async () => {
        // Mock data - replace with actual API call
        const mockSessions: TrainingSession[] = [
            {
                id: 'session_1',
                modelName: 'Sarah Professional v2.2',
                modelId: 'model_1',
                startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                status: 'running',
                progress: 67.5,
                currentEpoch: 68,
                totalEpochs: 100,
                currentLoss: 0.0234,
                currentAccuracy: 0.91,
                bestAccuracy: 0.92,
                trainingSpeed: 245.3,
                estimatedTimeRemaining: 45,
                resourceUsage: {
                    gpuUtilization: 89,
                    gpuMemoryUsed: 10240,
                    gpuMemoryTotal: 12288,
                    cpuUtilization: 45,
                    ramUsage: 67,
                    diskUsage: 23
                },
                metrics: {
                    epoch: [1, 2, 3, 4, 5],
                    trainingLoss: [0.45, 0.32, 0.18, 0.08, 0.04],
                    validationLoss: [0.48, 0.35, 0.21, 0.11, 0.06],
                    trainingAccuracy: [0.65, 0.78, 0.85, 0.89, 0.92],
                    validationAccuracy: [0.63, 0.75, 0.82, 0.87, 0.90],
                    learningRate: [0.001, 0.001, 0.0008, 0.0006, 0.0004]
                }
            },
            {
                id: 'session_2',
                modelName: 'Ravi Malayalam v1.4',
                modelId: 'model_2',
                startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                status: 'running',
                progress: 23.1,
                currentEpoch: 23,
                totalEpochs: 100,
                currentLoss: 0.087,
                currentAccuracy: 0.78,
                bestAccuracy: 0.81,
                trainingSpeed: 189.7,
                estimatedTimeRemaining: 95,
                resourceUsage: {
                    gpuUtilization: 76,
                    gpuMemoryUsed: 8192,
                    gpuMemoryTotal: 12288,
                    cpuUtilization: 38,
                    ramUsage: 54,
                    diskUsage: 31
                },
                metrics: {
                    epoch: [1, 2, 3],
                    trainingLoss: [0.52, 0.38, 0.21],
                    validationLoss: [0.55, 0.42, 0.25],
                    trainingAccuracy: [0.58, 0.71, 0.81],
                    validationAccuracy: [0.55, 0.68, 0.78],
                    learningRate: [0.0008, 0.0008, 0.0006]
                }
            }
        ];

        setTrainingSessions(mockSessions);
    };

    const loadSystemMetrics = async () => {
        // Mock data - replace with actual API call
        const mockMetrics: SystemMetrics = {
            totalModels: 47,
            modelsTraining: 2,
            modelsCompleted: 42,
            modelsFailed: 3,
            totalTrainingTime: 234.5,
            averageAccuracy: 0.89,
            systemLoad: {
                cpu: 56,
                gpu: 82,
                memory: 67,
                disk: 34,
                network: 12
            },
            resourceAllocation: {
                totalGPUs: 4,
                availableGPUs: 2,
                totalRAM: 64 * 1024 * 1024 * 1024, // 64GB
                availableRAM: 21 * 1024 * 1024 * 1024, // 21GB
                totalStorage: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
                availableStorage: 800 * 1024 * 1024 * 1024 // 800GB
            },
            performance: {
                averageTrainingSpeed: 217.5,
                queueWaitTime: 15,
                successRate: 0.934,
                errorRate: 0.066
            }
        };

        setSystemMetrics(mockMetrics);
    };

    const loadTrainingHistory = async () => {
        // Mock data - replace with actual API call
        const mockHistory: TrainingHistory[] = [
            {
                date: '2024-02-11',
                completedSessions: 3,
                averageAccuracy: 0.91,
                totalTrainingTime: 8.5,
                resourceEfficiency: 0.87,
                modelTypes: { malayalam: 1, english: 2, manglish: 0 }
            },
            {
                date: '2024-02-10',
                completedSessions: 5,
                averageAccuracy: 0.89,
                totalTrainingTime: 12.3,
                resourceEfficiency: 0.82,
                modelTypes: { malayalam: 2, english: 2, manglish: 1 }
            },
            {
                date: '2024-02-09',
                completedSessions: 2,
                averageAccuracy: 0.88,
                totalTrainingTime: 6.7,
                resourceEfficiency: 0.85,
                modelTypes: { malayalam: 1, english: 1, manglish: 0 }
            }
        ];

        setTrainingHistory(mockHistory);
    };

    const loadAlerts = async () => {
        // Mock data - replace with actual API call
        const mockAlerts: AlertNotification[] = [
            {
                id: 'alert_1',
                type: 'warning',
                title: 'High GPU Memory Usage',
                message: 'GPU memory usage has exceeded 90% threshold during training session.',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                sessionId: 'session_1',
                acknowledged: false,
                priority: 'medium'
            },
            {
                id: 'alert_2',
                type: 'info',
                title: 'Training Completed Successfully',
                message: 'Model "Emma Customer Service v1.2" has completed training with 94.2% accuracy.',
                timestamp: new Date(Date.now() - 45 * 60 * 1000),
                sessionId: 'session_3',
                acknowledged: true,
                priority: 'low'
            },
            {
                id: 'alert_3',
                type: 'error',
                title: 'Training Session Failed',
                message: 'Training session terminated due to CUDA out of memory error.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                sessionId: 'session_4',
                acknowledged: false,
                priority: 'high'
            }
        ];

        setAlerts(mockAlerts);
    };

    const handlePauseSession = (sessionId: string) => {
        setTrainingSessions(prev =>
            prev.map(session =>
                session.id === sessionId
                    ? { ...session, status: 'paused' as const }
                    : session
            )
        );
    };

    const handleResumeSession = (sessionId: string) => {
        setTrainingSessions(prev =>
            prev.map(session =>
                session.id === sessionId
                    ? { ...session, status: 'running' as const }
                    : session
            )
        );
    };

    const handleStopSession = (sessionId: string) => {
        if (confirm('Are you sure you want to stop this training session? Progress will be lost.')) {
            setTrainingSessions(prev =>
                prev.map(session =>
                    session.id === sessionId
                        ? { ...session, status: 'cancelled' as const, endTime: new Date() }
                        : session
                )
            );
        }
    };

    const handleAcknowledgeAlert = (alertId: string) => {
        setAlerts(prev =>
            prev.map(alert =>
                alert.id === alertId
                    ? { ...alert, acknowledged: true }
                    : alert
            )
        );
    };

    const handleDismissAlert = (alertId: string) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RotateCw className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Voice Training Dashboard</h1>
                    <p className="text-gray-600">Real-time monitoring and analytics for voice model training</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-sm text-gray-600">
                            {autoRefresh ? 'Live Updates' : 'Manual Refresh'}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="training">Live Training</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {systemMetrics && <SystemOverview metrics={systemMetrics} />}
                </TabsContent>

                <TabsContent value="training" className="space-y-4">
                    <RealtimeTrainingMonitor
                        sessions={trainingSessions}
                        onPauseSession={handlePauseSession}
                        onResumeSession={handleResumeSession}
                        onStopSession={handleStopSession}
                    />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <TrainingHistoryPanel history={trainingHistory} />
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <AlertsPanel
                        alerts={alerts}
                        onAcknowledge={handleAcknowledgeAlert}
                        onDismiss={handleDismissAlert}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}