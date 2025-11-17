'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Mic,
    Volume2,
    Brain,
    Zap,
    Globe,
    Star,
    TrendingUp,
    Activity,
    Settings,
    Play,
    Pause,
    RotateCcw,
    Download,
    Upload,
    Users,
    Database,
    TestTube,
    Terminal,
    Monitor,
    Speaker,
    Bot,
    Headphones,
    Radio,
    Gauge,
    Timer,
    CheckCircle,
    AlertTriangle,
    Info,
    Layers,
    Cpu,
    HardDrive,
    Network,
    Shield,
    Eye,
    BarChart3
} from 'lucide-react';

interface VoiceSystemStatus {
    speechSynthesis: {
        status: 'operational' | 'degraded' | 'down';
        activeModels: number;
        totalRequests: number;
        avgResponseTime: number;
    };
    voiceCloning: {
        status: 'operational' | 'degraded' | 'down';
        trainingJobs: number;
        completedModels: number;
        avgTrainingTime: number;
    };
    speechRecognition: {
        status: 'operational' | 'degraded' | 'down';
        activeSessions: number;
        accuracy: number;
        languages: string[];
    };
    voiceData: {
        totalSamples: number;
        processedSamples: number;
        storageUsed: number;
        storageLimit: number;
    };
}

interface VoiceCommand {
    id: string;
    command: string;
    description: string;
    category: 'synthesis' | 'recognition' | 'cloning' | 'analysis' | 'management';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: string;
    estimatedCompletion?: string;
}

export default function VoiceCommandCenterPage() {
    const [systemStatus, setSystemStatus] = useState<VoiceSystemStatus>({
        speechSynthesis: {
            status: 'operational',
            activeModels: 12,
            totalRequests: 15420,
            avgResponseTime: 0.8
        },
        voiceCloning: {
            status: 'operational',
            trainingJobs: 3,
            completedModels: 45,
            avgTrainingTime: 240
        },
        speechRecognition: {
            status: 'operational',
            activeSessions: 28,
            accuracy: 94.7,
            languages: ['en', 'ml', 'hi', 'ta', 'te']
        },
        voiceData: {
            totalSamples: 125000,
            processedSamples: 118500,
            storageUsed: 2.4,
            storageLimit: 10.0
        }
    });

    const [activeCommands, setActiveCommands] = useState<VoiceCommand[]>([
        {
            id: '1',
            command: 'Train Malayalam Voice Model',
            description: 'Training custom voice model for Malayalam with 5000 samples',
            category: 'cloning',
            status: 'processing',
            priority: 'high',
            createdAt: '2025-11-11T10:30:00Z',
            estimatedCompletion: '2025-11-11T14:30:00Z'
        },
        {
            id: '2',
            command: 'Generate Hindi TTS Dataset',
            description: 'Creating synthetic Hindi speech dataset for model training',
            category: 'synthesis',
            status: 'processing',
            priority: 'medium',
            createdAt: '2025-11-11T09:15:00Z',
            estimatedCompletion: '2025-11-11T16:00:00Z'
        },
        {
            id: '3',
            command: 'Voice Quality Analysis',
            description: 'Analyzing voice quality metrics across all active models',
            category: 'analysis',
            status: 'pending',
            priority: 'low',
            createdAt: '2025-11-11T11:00:00Z'
        }
    ]);

    const [selectedTab, setSelectedTab] = useState('overview');
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational': return 'text-green-600 bg-green-100';
            case 'degraded': return 'text-yellow-600 bg-yellow-100';
            case 'down': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getCommandIcon = (category: string) => {
        switch (category) {
            case 'synthesis': return <Volume2 className="h-4 w-4" />;
            case 'recognition': return <Mic className="h-4 w-4" />;
            case 'cloning': return <Users className="h-4 w-4" />;
            case 'analysis': return <BarChart3 className="h-4 w-4" />;
            case 'management': return <Settings className="h-4 w-4" />;
            default: return <Terminal className="h-4 w-4" />;
        }
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <Mic className="h-10 w-10 text-blue-600" />
                            Voice AI Command Center
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Central hub for voice AI operations, model management, and speech processing
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            System Settings
                        </Button>
                        <Button size="sm">
                            <Monitor className="h-4 w-4 mr-2" />
                            Launch Control Panel
                        </Button>
                    </div>
                </div>

                {/* System Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Speech Synthesis</CardTitle>
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge className={getStatusColor(systemStatus.speechSynthesis.status)}>
                                    {systemStatus.speechSynthesis.status}
                                </Badge>
                                <span className="text-2xl font-bold">{systemStatus.speechSynthesis.activeModels}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {systemStatus.speechSynthesis.totalRequests.toLocaleString()} requests • {systemStatus.speechSynthesis.avgResponseTime}s avg
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Voice Cloning</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge className={getStatusColor(systemStatus.voiceCloning.status)}>
                                    {systemStatus.voiceCloning.status}
                                </Badge>
                                <span className="text-2xl font-bold">{systemStatus.voiceCloning.trainingJobs}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {systemStatus.voiceCloning.completedModels} models • {systemStatus.voiceCloning.avgTrainingTime}min avg
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Speech Recognition</CardTitle>
                            <Mic className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge className={getStatusColor(systemStatus.speechRecognition.status)}>
                                    {systemStatus.speechRecognition.status}
                                </Badge>
                                <span className="text-2xl font-bold">{systemStatus.speechRecognition.activeSessions}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {systemStatus.speechRecognition.accuracy}% accuracy • {systemStatus.speechRecognition.languages.length} languages
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Voice Data</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{systemStatus.voiceData.totalSamples.toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground">samples</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {systemStatus.voiceData.storageUsed}GB / {systemStatus.voiceData.storageLimit}GB used
                            </p>
                            <Progress
                                value={(systemStatus.voiceData.storageUsed / systemStatus.voiceData.storageLimit) * 100}
                                className="mt-2"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Main Control Interface */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="models">Model Management</TabsTrigger>
                        <TabsTrigger value="synthesis">Speech Synthesis</TabsTrigger>
                        <TabsTrigger value="cloning">Voice Cloning</TabsTrigger>
                        <TabsTrigger value="data">Data Management</TabsTrigger>
                        <TabsTrigger value="processing">Data Processing</TabsTrigger>
                        <TabsTrigger value="testing">Testing Suite</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Active Commands */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Terminal className="h-5 w-5" />
                                        Active Commands
                                    </CardTitle>
                                    <CardDescription>
                                        Currently running voice AI operations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {activeCommands.map((cmd) => (
                                        <div key={cmd.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {getCommandIcon(cmd.category)}
                                                <div>
                                                    <p className="font-medium">{cmd.command}</p>
                                                    <p className="text-sm text-muted-foreground">{cmd.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getPriorityColor(cmd.priority)}>
                                                    {cmd.priority}
                                                </Badge>
                                                <Badge variant={cmd.status === 'processing' ? 'default' : 'secondary'}>
                                                    {cmd.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription>
                                        Common voice AI operations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3">
                                    <Button className="h-20 flex-col gap-2" onClick={() => router.push('/speech-synthesizer')}>
                                        <Mic className="h-6 w-6" />
                                        <span className="text-sm">Start Recording</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/speech-synthesizer')}>
                                        <Volume2 className="h-6 w-6" />
                                        <span className="text-sm">Generate Speech</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/voice-cloning')}>
                                        <Users className="h-6 w-6" />
                                        <span className="text-sm">Clone Voice</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/voice-testing-suite')}>
                                        <TestTube className="h-6 w-6" />
                                        <span className="text-sm">Run Tests</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/voice-data-management')}>
                                        <Database className="h-6 w-6" />
                                        <span className="text-sm">Manage Data</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/analytics')}>
                                        <Monitor className="h-6 w-6" />
                                        <span className="text-sm">View Analytics</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Alerts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    System Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Voice Cloning Queue</AlertTitle>
                                    <AlertDescription>
                                        3 voice cloning jobs are currently processing. Estimated completion in 2 hours.
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>Storage Capacity</AlertTitle>
                                    <AlertDescription>
                                        Voice data storage is at 24% capacity. 7.6GB remaining.
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <TrendingUp className="h-4 w-4" />
                                    <AlertTitle>Performance Improvement</AlertTitle>
                                    <AlertDescription>
                                        Speech recognition accuracy improved by 2.1% this week.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="models">
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Model Management</CardTitle>
                                <CardDescription>
                                    Manage voice models, training jobs, and performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Model Management Interface</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Comprehensive voice model management system
                                    </p>
                                    <Button onClick={() => router.push('/voice-model-management')}>
                                        Access Model Manager
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="synthesis">
                        <Card>
                            <CardHeader>
                                <CardTitle>Speech Synthesis Control</CardTitle>
                                <CardDescription>
                                    Generate high-quality speech from text with advanced voice customization
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Speaker className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Speech Synthesis Engine</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Advanced text-to-speech synthesis with multiple voices and languages
                                    </p>
                                    <Button onClick={() => router.push('/speech-synthesizer')}>
                                        Launch Synthesizer
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cloning">
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Cloning Studio</CardTitle>
                                <CardDescription>
                                    Create custom voice models from audio samples
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Voice Cloning System</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Professional voice cloning with quality analysis and model training
                                    </p>
                                    <Button onClick={() => router.push('/voice-cloning')}>
                                        Access Voice Cloning
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="data">
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Data Foundry</CardTitle>
                                <CardDescription>
                                    Manage voice datasets, annotations, and data processing pipelines
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Data Foundry Management</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Comprehensive voice data management and processing platform
                                    </p>
                                    <Button onClick={() => router.push('/voice-data-management')}>
                                        Enter Data Foundry
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="processing">
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Data Processing Pipeline</CardTitle>
                                <CardDescription>
                                    ETL pipelines for voice data preprocessing, feature extraction, and augmentation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Data Processing Pipeline</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Advanced ETL pipelines for comprehensive voice data processing and transformation
                                    </p>
                                    <Button onClick={() => window.open('/voice-data-processing-pipeline', '_blank')}>
                                        Launch Pipeline Manager
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="testing">
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Testing Suite</CardTitle>
                                <CardDescription>
                                    Automated testing and quality assurance for voice AI systems
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Testing Suite</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Comprehensive testing tools for voice quality, accuracy, and performance
                                    </p>
                                    <Button onClick={() => router.push('/voice-testing-suite')}>
                                        Run Test Suite
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ManagementLayout>
    );
}