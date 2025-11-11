'use client';

import React, { useState, useEffect } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Database,
    Workflow,
    Play,
    Pause,
    RotateCcw,
    Settings,
    BarChart3,
    Activity,
    Zap,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    TrendingUp,
    Download,
    Upload,
    Filter,
    Search,
    Layers,
    Cpu,
    HardDrive,
    Network,
    Server,
    GitBranch,
    Eye,
    Edit,
    Trash2,
    Plus,
    RefreshCw,
    Target,
    Gauge,
    Timer,
    Users,
    Globe,
    Headphones,
    Mic,
    Speaker,
    Volume2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DataPipeline {
    id: string;
    name: string;
    description: string;
    type: 'ingestion' | 'processing' | 'training' | 'deployment';
    status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
    progress: number;
    stages: PipelineStage[];
    createdAt: string;
    updatedAt: string;
    metrics: {
        totalSamples: number;
        processedSamples: number;
        successRate: number;
        avgProcessingTime: number;
    };
}

interface PipelineStage {
    id: string;
    name: string;
    type: 'extract' | 'transform' | 'load' | 'validate' | 'train' | 'deploy';
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    duration?: number;
    error?: string;
    config: Record<string, any>;
}

interface DataSource {
    id: string;
    name: string;
    type: 'file' | 'api' | 'database' | 'stream';
    format: string;
    location: string;
    status: 'active' | 'inactive' | 'error';
    lastSync: string;
    totalRecords: number;
    schema: Record<string, string>;
}

interface ProcessingJob {
    id: string;
    pipelineId: string;
    stageId: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    inputCount: number;
    outputCount: number;
    error?: string;
    logs: string[];
}

interface FoundryMetrics {
    totalPipelines: number;
    activePipelines: number;
    totalSamples: number;
    processedSamples: number;
    avgProcessingTime: number;
    successRate: number;
    storageUsed: number;
    storageCapacity: number;
}

export default function DataFoundryManagementPage() {
    const [pipelines, setPipelines] = useState<DataPipeline[]>([]);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
    const [selectedPipeline, setSelectedPipeline] = useState<DataPipeline | null>(null);
    const [showCreatePipelineDialog, setShowCreatePipelineDialog] = useState(false);
    const [showPipelineDetails, setShowPipelineDetails] = useState(false);

    const [pipelineForm, setPipelineForm] = useState({
        name: '',
        description: '',
        type: 'processing' as 'ingestion' | 'processing' | 'training' | 'deployment'
    });

    const [selectedTab, setSelectedTab] = useState('pipelines');

    // Mock data
    useEffect(() => {
        const mockPipelines: DataPipeline[] = [
            {
                id: 'pipeline-1',
                name: 'Voice Data Ingestion Pipeline',
                description: 'Automated ingestion and preprocessing of voice samples',
                type: 'ingestion',
                status: 'running',
                progress: 65,
                stages: [
                    {
                        id: 'stage-1',
                        name: 'Data Extraction',
                        type: 'extract',
                        status: 'completed',
                        progress: 100,
                        duration: 45,
                        config: { source: 'file_system', format: 'wav' }
                    },
                    {
                        id: 'stage-2',
                        name: 'Audio Preprocessing',
                        type: 'transform',
                        status: 'running',
                        progress: 75,
                        config: { normalization: true, noise_reduction: true }
                    },
                    {
                        id: 'stage-3',
                        name: 'Quality Validation',
                        type: 'validate',
                        status: 'pending',
                        progress: 0,
                        config: { min_quality: 80, max_noise: 10 }
                    }
                ],
                createdAt: '2024-11-01T09:00:00Z',
                updatedAt: '2024-11-08T14:30:00Z',
                metrics: {
                    totalSamples: 1250,
                    processedSamples: 812,
                    successRate: 94.2,
                    avgProcessingTime: 2.3
                }
            },
            {
                id: 'pipeline-2',
                name: 'Voice Model Training Pipeline',
                description: 'End-to-end voice model training and validation',
                type: 'training',
                status: 'idle',
                progress: 0,
                stages: [
                    {
                        id: 'stage-4',
                        name: 'Data Preparation',
                        type: 'transform',
                        status: 'pending',
                        progress: 0,
                        config: { batch_size: 32, shuffle: true }
                    },
                    {
                        id: 'stage-5',
                        name: 'Model Training',
                        type: 'train',
                        status: 'pending',
                        progress: 0,
                        config: { epochs: 100, learning_rate: 0.001 }
                    },
                    {
                        id: 'stage-6',
                        name: 'Model Validation',
                        type: 'validate',
                        status: 'pending',
                        progress: 0,
                        config: { test_split: 0.2 }
                    }
                ],
                createdAt: '2024-11-02T11:15:00Z',
                updatedAt: '2024-11-08T16:45:00Z',
                metrics: {
                    totalSamples: 0,
                    processedSamples: 0,
                    successRate: 0,
                    avgProcessingTime: 0
                }
            }
        ];

        const mockDataSources: DataSource[] = [
            {
                id: 'source-1',
                name: 'Voice Samples S3 Bucket',
                type: 'file',
                format: 'wav,flac',
                location: 's3://voice-data-bucket/samples/',
                status: 'active',
                lastSync: '2024-11-08T15:30:00Z',
                totalRecords: 5420,
                schema: {
                    filename: 'string',
                    duration: 'float',
                    sample_rate: 'integer',
                    language: 'string'
                }
            },
            {
                id: 'source-2',
                name: 'Voice API Endpoint',
                type: 'api',
                format: 'json',
                location: 'https://api.voice-data.com/samples',
                status: 'active',
                lastSync: '2024-11-08T14:00:00Z',
                totalRecords: 1250,
                schema: {
                    id: 'string',
                    audio_url: 'string',
                    transcription: 'string',
                    metadata: 'object'
                }
            }
        ];

        setPipelines(mockPipelines);
        setDataSources(mockDataSources);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'idle': return 'bg-gray-100 text-gray-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-slate-100 text-slate-800';
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'error': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStageIcon = (type: string) => {
        switch (type) {
            case 'extract': return Database;
            case 'transform': return Settings;
            case 'load': return Download;
            case 'validate': return CheckCircle;
            case 'train': return Cpu;
            case 'deploy': return Server;
            default: return Activity;
        }
    };

    const handleCreatePipeline = () => {
        if (!pipelineForm.name) {
            toast({
                title: "Validation Error",
                description: "Pipeline name is required.",
                variant: "destructive"
            });
            return;
        }

        const newPipeline: DataPipeline = {
            id: `pipeline-${Date.now()}`,
            name: pipelineForm.name,
            description: pipelineForm.description,
            type: pipelineForm.type,
            status: 'idle',
            progress: 0,
            stages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metrics: {
                totalSamples: 0,
                processedSamples: 0,
                successRate: 0,
                avgProcessingTime: 0
            }
        };

        setPipelines([...pipelines, newPipeline]);
        setPipelineForm({
            name: '',
            description: '',
            type: 'processing'
        });
        setShowCreatePipelineDialog(false);

        toast({
            title: "Pipeline Created",
            description: `Pipeline "${newPipeline.name}" has been created.`,
        });
    };

    const handleRunPipeline = (pipeline: DataPipeline) => {
        setPipelines(pipelines.map(p =>
            p.id === pipeline.id
                ? { ...p, status: 'running' as const, updatedAt: new Date().toISOString() }
                : p
        ));

        // Simulate pipeline execution
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setPipelines(pipelines.map(p =>
                    p.id === pipeline.id
                        ? {
                            ...p,
                            status: 'completed' as const,
                            progress: 100,
                            updatedAt: new Date().toISOString(),
                            metrics: {
                                ...p.metrics,
                                processedSamples: p.metrics.totalSamples,
                                successRate: 96.5
                            }
                        }
                        : p
                ));
            } else {
                setPipelines(pipelines.map(p =>
                    p.id === pipeline.id
                        ? { ...p, progress: Math.round(progress) }
                        : p
                ));
            }
        }, 1000);

        toast({
            title: "Pipeline Started",
            description: `Pipeline "${pipeline.name}" is now running.`,
        });
    };

    const handlePausePipeline = (pipeline: DataPipeline) => {
        setPipelines(pipelines.map(p =>
            p.id === pipeline.id
                ? { ...p, status: 'paused' as const, updatedAt: new Date().toISOString() }
                : p
        ));

        toast({
            title: "Pipeline Paused",
            description: `Pipeline "${pipeline.name}" has been paused.`,
        });
    };

    const calculateFoundryMetrics = (): FoundryMetrics => {
        const totalPipelines = pipelines.length;
        const activePipelines = pipelines.filter(p => p.status === 'running').length;
        const totalSamples = pipelines.reduce((sum, p) => sum + p.metrics.totalSamples, 0);
        const processedSamples = pipelines.reduce((sum, p) => sum + p.metrics.processedSamples, 0);
        const avgProcessingTime = pipelines.length > 0
            ? pipelines.reduce((sum, p) => sum + p.metrics.avgProcessingTime, 0) / pipelines.length
            : 0;
        const successRate = pipelines.length > 0
            ? pipelines.reduce((sum, p) => sum + p.metrics.successRate, 0) / pipelines.length
            : 0;

        return {
            totalPipelines,
            activePipelines,
            totalSamples,
            processedSamples,
            avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
            successRate: Math.round(successRate * 10) / 10,
            storageUsed: 245.6, // GB
            storageCapacity: 1000 // GB
        };
    };

    const foundryMetrics = calculateFoundryMetrics();

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Database className="h-8 w-8 text-purple-600" />
                            Data Foundry Management
                        </h1>
                        <p className="text-muted-foreground">
                            Orchestrate voice data pipelines, processing workflows, and model operations
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                        <Button size="sm" onClick={() => setShowCreatePipelineDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Pipeline
                        </Button>
                    </div>
                </div>

                {/* Foundry Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Pipelines</p>
                                    <p className="text-2xl font-bold">{foundryMetrics.activePipelines}/{foundryMetrics.totalPipelines}</p>
                                </div>
                                <Workflow className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Processed Samples</p>
                                    <p className="text-2xl font-bold">{foundryMetrics.processedSamples.toLocaleString()}</p>
                                </div>
                                <Headphones className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                                    <p className="text-2xl font-bold">{foundryMetrics.successRate}%</p>
                                </div>
                                <Target className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                                    <p className="text-2xl font-bold">{foundryMetrics.storageUsed}GB</p>
                                    <p className="text-xs text-muted-foreground">
                                        of {foundryMetrics.storageCapacity}GB
                                    </p>
                                </div>
                                <HardDrive className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
                        <TabsTrigger value="sources">Data Sources</TabsTrigger>
                        <TabsTrigger value="jobs">Processing Jobs</TabsTrigger>
                        <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pipelines" className="space-y-6">
                        {/* Pipeline Controls */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search pipelines..."
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="ingestion">Ingestion</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="training">Training</SelectItem>
                                            <SelectItem value="deployment">Deployment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="running">Running</SelectItem>
                                            <SelectItem value="idle">Idle</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pipelines List */}
                        <div className="grid grid-cols-1 gap-4">
                            {pipelines.map((pipeline) => (
                                <Card key={pipeline.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Workflow className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{pipeline.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{pipeline.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={getStatusColor(pipeline.type)}>
                                                    {pipeline.type}
                                                </Badge>
                                                <Badge className={getStatusColor(pipeline.status)}>
                                                    {pipeline.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">Progress</span>
                                                <span className="text-sm text-muted-foreground">{pipeline.progress}%</span>
                                            </div>
                                            <Progress value={pipeline.progress} className="w-full" />
                                        </div>

                                        {/* Pipeline Stages */}
                                        <div className="mb-4">
                                            <h4 className="font-medium mb-3">Pipeline Stages</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {pipeline.stages.map((stage) => {
                                                    const StageIcon = getStageIcon(stage.type);
                                                    return (
                                                        <div key={stage.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                                            <div className={`p-1 rounded ${stage.status === 'completed' ? 'bg-green-100' : stage.status === 'running' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                                <StageIcon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{stage.name}</p>
                                                                <p className="text-xs text-muted-foreground">{stage.progress}%</p>
                                                            </div>
                                                            <Badge className={getStatusColor(stage.status)} variant="outline">
                                                                {stage.status}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">{pipeline.metrics.totalSamples}</div>
                                                <div className="text-xs text-muted-foreground">Total Samples</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">{pipeline.metrics.processedSamples}</div>
                                                <div className="text-xs text-muted-foreground">Processed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">{pipeline.metrics.successRate}%</div>
                                                <div className="text-xs text-muted-foreground">Success Rate</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">{pipeline.metrics.avgProcessingTime}s</div>
                                                <div className="text-xs text-muted-foreground">Avg Time</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                Updated {new Date(pipeline.updatedAt).toLocaleString()}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedPipeline(pipeline);
                                                        setShowPipelineDetails(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Details
                                                </Button>
                                                {pipeline.status === 'idle' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleRunPipeline(pipeline)}
                                                    >
                                                        <Play className="h-4 w-4 mr-1" />
                                                        Run
                                                    </Button>
                                                )}
                                                {pipeline.status === 'running' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handlePausePipeline(pipeline)}
                                                    >
                                                        <Pause className="h-4 w-4 mr-1" />
                                                        Pause
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline">
                                                    <Settings className="h-4 w-4 mr-1" />
                                                    Configure
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="sources">
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Sources</CardTitle>
                                <CardDescription>
                                    Manage data sources for voice pipelines
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dataSources.map((source) => (
                                        <Card key={source.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Database className="h-6 w-6 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{source.name}</h4>
                                                            <p className="text-sm text-muted-foreground">{source.location}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={getStatusColor(source.status)}>
                                                        {source.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm font-medium">Type</p>
                                                        <p className="text-sm text-muted-foreground capitalize">{source.type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Format</p>
                                                        <p className="text-sm text-muted-foreground">{source.format}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Records</p>
                                                        <p className="text-sm text-muted-foreground">{source.totalRecords.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-muted-foreground">
                                                        Last sync: {new Date(source.lastSync).toLocaleString()}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline">
                                                            <RefreshCw className="h-4 w-4 mr-1" />
                                                            Sync
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Schema
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Settings className="h-4 w-4 mr-1" />
                                                            Configure
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="jobs">
                        <Card>
                            <CardHeader>
                                <CardTitle>Processing Jobs</CardTitle>
                                <CardDescription>
                                    Monitor active and completed processing jobs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Processing Jobs</h3>
                                    <p className="text-muted-foreground">
                                        Real-time job monitoring will appear here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="monitoring">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Performance</CardTitle>
                                    <CardDescription>
                                        Real-time system metrics and performance indicators
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>CPU Usage</span>
                                            <span className="font-medium">45%</span>
                                        </div>
                                        <Progress value={45} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Memory Usage</span>
                                            <span className="font-medium">67%</span>
                                        </div>
                                        <Progress value={67} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Storage Usage</span>
                                            <span className="font-medium">25%</span>
                                        </div>
                                        <Progress value={25} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Network I/O</span>
                                            <span className="font-medium">12 MB/s</span>
                                        </div>
                                        <Progress value={60} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Pipeline Throughput</CardTitle>
                                    <CardDescription>
                                        Processing throughput over time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">1,247</div>
                                            <div className="text-sm text-muted-foreground">Samples/hour</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-xl font-semibold">98.5%</div>
                                                <div className="text-xs text-muted-foreground">Uptime</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-semibold">2.3s</div>
                                                <div className="text-xs text-muted-foreground">Avg Latency</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Create Pipeline Dialog */}
                <Dialog open={showCreatePipelineDialog} onOpenChange={setShowCreatePipelineDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Pipeline</DialogTitle>
                            <DialogDescription>
                                Set up a new data processing pipeline for voice AI operations
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="pipelineName">Pipeline Name</Label>
                                <Input
                                    id="pipelineName"
                                    value={pipelineForm.name}
                                    onChange={(e) => setPipelineForm({ ...pipelineForm, name: e.target.value })}
                                    placeholder="e.g., Voice Data Processing Pipeline"
                                />
                            </div>

                            <div>
                                <Label htmlFor="pipelineDescription">Description</Label>
                                <Textarea
                                    id="pipelineDescription"
                                    value={pipelineForm.description}
                                    onChange={(e) => setPipelineForm({ ...pipelineForm, description: e.target.value })}
                                    placeholder="Describe the pipeline's purpose and operations"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="pipelineType">Pipeline Type</Label>
                                <Select
                                    value={pipelineForm.type}
                                    onValueChange={(value: 'ingestion' | 'processing' | 'training' | 'deployment') =>
                                        setPipelineForm({ ...pipelineForm, type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ingestion">Data Ingestion</SelectItem>
                                        <SelectItem value="processing">Data Processing</SelectItem>
                                        <SelectItem value="training">Model Training</SelectItem>
                                        <SelectItem value="deployment">Model Deployment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreatePipelineDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreatePipeline}>
                                Create Pipeline
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Pipeline Details Dialog */}
                <Dialog open={showPipelineDetails} onOpenChange={setShowPipelineDetails}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Pipeline Details</DialogTitle>
                            <DialogDescription>
                                Detailed view of pipeline configuration and execution
                            </DialogDescription>
                        </DialogHeader>

                        {selectedPipeline && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Pipeline Name</Label>
                                        <p className="text-sm">{selectedPipeline.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Type</Label>
                                        <Badge className={getStatusColor(selectedPipeline.type)}>
                                            {selectedPipeline.type}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <Badge className={getStatusColor(selectedPipeline.status)}>
                                            {selectedPipeline.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Progress</Label>
                                        <p className="text-sm">{selectedPipeline.progress}%</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Description</Label>
                                    <p className="text-sm text-muted-foreground">{selectedPipeline.description}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Pipeline Stages</Label>
                                    <div className="space-y-3">
                                        {selectedPipeline.stages.map((stage, index) => {
                                            const StageIcon = getStageIcon(stage.type);
                                            return (
                                                <div key={stage.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <StageIcon className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{stage.name}</h4>
                                                            <p className="text-sm text-muted-foreground capitalize">{stage.type}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm">Progress</span>
                                                            <span className="text-sm">{stage.progress}%</span>
                                                        </div>
                                                        <Progress value={stage.progress} className="w-full" />
                                                    </div>

                                                    <Badge className={getStatusColor(stage.status)}>
                                                        {stage.status}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-sm font-medium mb-3 block">Metrics</Label>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Total Samples:</span>
                                                <span className="text-sm font-medium">{selectedPipeline.metrics.totalSamples}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Processed Samples:</span>
                                                <span className="text-sm font-medium">{selectedPipeline.metrics.processedSamples}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Success Rate:</span>
                                                <span className="text-sm font-medium">{selectedPipeline.metrics.successRate}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Avg Processing Time:</span>
                                                <span className="text-sm font-medium">{selectedPipeline.metrics.avgProcessingTime}s</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium mb-3 block">Timestamps</Label>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Created:</span>
                                                <span className="text-sm font-medium">
                                                    {new Date(selectedPipeline.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Updated:</span>
                                                <span className="text-sm font-medium">
                                                    {new Date(selectedPipeline.updatedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowPipelineDetails(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ManagementLayout>
    );
}