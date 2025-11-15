'use client';

import React, { useState, useEffect } from 'react';
import * as anime from 'animejs';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Progress, Slider, Switch, Alert, AlertDescription, AlertTitle, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
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
    Volume2,
    Radio as Waveform,
    Radio,
    FileText as FileAudio,
    ArrowRight,
    GitBranch as Split,
    GitBranch as Merge,
    Settings as Scissors,
    Settings as Wand2,
    Star as Sparkles,
    Settings as Cog,
    ArrowRight as ArrowDown,
    CheckCircle as CheckCircle2,
    Activity as Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient as api } from '@/lib/api-client';
import { useMockData } from '@/hooks/use-mock-data';

interface ProcessingPipeline {
    id: string;
    name: string;
    description: string;
    type: 'audio_preprocessing' | 'feature_extraction' | 'data_augmentation' | 'quality_assessment' | 'custom';
    status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
    progress: number;
    stages: ProcessingStage[];
    inputDatasets: string[];
    outputDatasets: string[];
    createdAt: string;
    updatedAt: string;
    metrics: {
        totalSamples: number;
        processedSamples: number;
        successRate: number;
        avgProcessingTime: number;
        dataQuality: number;
    };
}

interface ProcessingStage {
    id: string;
    name: string;
    type: 'extract' | 'transform' | 'validate' | 'augment' | 'feature_extract' | 'normalize' | 'filter' | 'segment';
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    duration?: number;
    error?: string;
    config: Record<string, any>;
    inputCount?: number;
    outputCount?: number;
}

interface DataTransformation {
    id: string;
    name: string;
    type: 'audio_normalization' | 'noise_reduction' | 'silence_removal' | 'format_conversion' | 'resampling' | 'feature_extraction' | 'data_augmentation';
    description: string;
    parameters: Record<string, any>;
    enabled: boolean;
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

export default function VoiceDataProcessingPipelinePage() {
    const { isDemoMode } = useMockData();
    const [pipelines, setPipelines] = useState<ProcessingPipeline[]>([]);
    const [selectedPipeline, setSelectedPipeline] = useState<ProcessingPipeline | null>(null);
    const [showCreatePipelineDialog, setShowCreatePipelineDialog] = useState(false);
    const [showPipelineDetails, setShowPipelineDetails] = useState(false);
    const [showConfigureStageDialog, setShowConfigureStageDialog] = useState(false);
    const [selectedStage, setSelectedStage] = useState<ProcessingStage | null>(null);
    const [loading, setLoading] = useState(true);

    const [pipelineForm, setPipelineForm] = useState({
        name: '',
        description: '',
        type: 'audio_preprocessing' as 'audio_preprocessing' | 'feature_extraction' | 'data_augmentation' | 'quality_assessment' | 'custom'
    });

    const [selectedTab, setSelectedTab] = useState('pipelines');

    // Load data
    useEffect(() => {
        loadPipelines();
    }, [isDemoMode]);

    const loadPipelines = async () => {
        try {
            setLoading(true);

            if (isDemoMode) {
                // Mock data for demonstration
                const mockPipelines: ProcessingPipeline[] = [
                    {
                        id: 'pipeline-1',
                        name: 'Audio Preprocessing Pipeline',
                        description: 'Complete audio preprocessing workflow for voice data',
                        type: 'audio_preprocessing',
                        status: 'running',
                        progress: 65,
                        stages: [
                            {
                                id: 'stage-1',
                                name: 'Audio Format Conversion',
                                type: 'transform',
                                status: 'completed',
                                progress: 100,
                                duration: 45,
                                config: { targetFormat: 'wav', sampleRate: 16000 },
                                inputCount: 1250,
                                outputCount: 1250
                            },
                            {
                                id: 'stage-2',
                                name: 'Noise Reduction',
                                type: 'filter',
                                status: 'running',
                                progress: 75,
                                config: { algorithm: 'spectral_subtraction', strength: 0.8 },
                                inputCount: 1250,
                                outputCount: 0
                            },
                            {
                                id: 'stage-3',
                                name: 'Silence Removal',
                                type: 'segment',
                                status: 'pending',
                                progress: 0,
                                config: { threshold: -40, minDuration: 0.5 },
                                inputCount: 0,
                                outputCount: 0
                            },
                            {
                                id: 'stage-4',
                                name: 'Audio Normalization',
                                type: 'normalize',
                                status: 'pending',
                                progress: 0,
                                config: { targetLevel: -20, algorithm: 'peak' },
                                inputCount: 0,
                                outputCount: 0
                            }
                        ],
                        inputDatasets: ['voice-samples-raw'],
                        outputDatasets: ['voice-samples-processed'],
                        createdAt: '2024-11-01T09:00:00Z',
                        updatedAt: '2024-11-08T14:30:00Z',
                        metrics: {
                            totalSamples: 1250,
                            processedSamples: 812,
                            successRate: 94.2,
                            avgProcessingTime: 2.3,
                            dataQuality: 87.5
                        }
                    },
                    {
                        id: 'pipeline-2',
                        name: 'Feature Extraction Pipeline',
                        description: 'Extract acoustic features for voice model training',
                        type: 'feature_extraction',
                        status: 'idle',
                        progress: 0,
                        stages: [
                            {
                                id: 'stage-5',
                                name: 'MFCC Extraction',
                                type: 'feature_extract',
                                status: 'pending',
                                progress: 0,
                                config: { nMfcc: 13, hopLength: 512, nFft: 2048 },
                                inputCount: 0,
                                outputCount: 0
                            },
                            {
                                id: 'stage-6',
                                name: 'Pitch Analysis',
                                type: 'feature_extract',
                                status: 'pending',
                                progress: 0,
                                config: { algorithm: 'pyin', fmin: 75, fmax: 600 },
                                inputCount: 0,
                                outputCount: 0
                            },
                            {
                                id: 'stage-7',
                                name: 'Voice Activity Detection',
                                type: 'validate',
                                status: 'pending',
                                progress: 0,
                                config: { threshold: 0.5, minDuration: 0.1 },
                                inputCount: 0,
                                outputCount: 0
                            }
                        ],
                        inputDatasets: ['voice-samples-processed'],
                        outputDatasets: ['voice-features-extracted'],
                        createdAt: '2024-11-02T11:15:00Z',
                        updatedAt: '2024-11-08T16:45:00Z',
                        metrics: {
                            totalSamples: 0,
                            processedSamples: 0,
                            successRate: 0,
                            avgProcessingTime: 0,
                            dataQuality: 0
                        }
                    },
                    {
                        id: 'pipeline-3',
                        name: 'Data Augmentation Pipeline',
                        description: 'Generate synthetic voice data for model training',
                        type: 'data_augmentation',
                        status: 'completed',
                        progress: 100,
                        stages: [
                            {
                                id: 'stage-8',
                                name: 'Speed Perturbation',
                                type: 'augment',
                                status: 'completed',
                                progress: 100,
                                duration: 120,
                                config: { speedFactors: [0.9, 1.0, 1.1], probability: 0.3 },
                                inputCount: 1000,
                                outputCount: 3000
                            },
                            {
                                id: 'stage-9',
                                name: 'Pitch Shifting',
                                type: 'augment',
                                status: 'completed',
                                progress: 100,
                                duration: 95,
                                config: { pitchSteps: [-2, -1, 1, 2], probability: 0.4 },
                                inputCount: 1000,
                                outputCount: 4000
                            },
                            {
                                id: 'stage-10',
                                name: 'Background Noise Addition',
                                type: 'augment',
                                status: 'completed',
                                progress: 100,
                                duration: 85,
                                config: { noiseTypes: ['office', 'traffic', 'restaurant'], snrRange: [5, 15] },
                                inputCount: 1000,
                                outputCount: 2500
                            }
                        ],
                        inputDatasets: ['voice-samples-clean'],
                        outputDatasets: ['voice-samples-augmented'],
                        createdAt: '2024-11-03T08:30:00Z',
                        updatedAt: '2024-11-08T12:15:00Z',
                        metrics: {
                            totalSamples: 1000,
                            processedSamples: 1000,
                            successRate: 98.7,
                            avgProcessingTime: 1.8,
                            dataQuality: 92.3
                        }
                    }
                ];

                setPipelines(mockPipelines);
            } else {
                // Real API call
                const response = await api.getVoiceDataProcessingPipelines();
                setPipelines(response.data);
            }
        } catch (error) {
            console.error('Error loading voice data processing pipelines:', error);
            toast({
                title: 'Error',
                description: 'Failed to load voice data processing pipelines',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }; const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'idle': return 'bg-gray-100 text-gray-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-slate-100 text-slate-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStageIcon = (type: string) => {
        switch (type) {
            case 'extract': return Database;
            case 'transform': return ArrowRight;
            case 'validate': return CheckCircle;
            case 'augment': return Sparkles;
            case 'feature_extract': return Cpu;
            case 'normalize': return Gauge;
            case 'filter': return Filter;
            case 'segment': return Scissors;
            default: return Activity;
        }
    };

    const getPipelineTypeIcon = (type: string) => {
        switch (type) {
            case 'audio_preprocessing': return Waveform;
            case 'feature_extraction': return Cpu;
            case 'data_augmentation': return Sparkles;
            case 'quality_assessment': return Target;
            case 'custom': return Cog;
            default: return Workflow;
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

        const newPipeline: ProcessingPipeline = {
            id: `pipeline-${Date.now()}`,
            name: pipelineForm.name,
            description: pipelineForm.description,
            type: pipelineForm.type,
            status: 'idle',
            progress: 0,
            stages: [],
            inputDatasets: [],
            outputDatasets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metrics: {
                totalSamples: 0,
                processedSamples: 0,
                successRate: 0,
                avgProcessingTime: 0,
                dataQuality: 0
            }
        };

        setPipelines([...pipelines, newPipeline]);
        setPipelineForm({
            name: '',
            description: '',
            type: 'audio_preprocessing'
        });
        setShowCreatePipelineDialog(false);

        toast({
            title: "Pipeline Created",
            description: `Pipeline "${newPipeline.name}" has been created.`,
        });
    };

    const handleRunPipeline = (pipeline: ProcessingPipeline) => {
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
                                successRate: 96.5,
                                dataQuality: 89.2
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

    const handlePausePipeline = (pipeline: ProcessingPipeline) => {
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

    const calculatePipelineMetrics = () => {
        const totalPipelines = pipelines.length;
        const runningPipelines = pipelines.filter(p => p.status === 'running').length;
        const completedPipelines = pipelines.filter(p => p.status === 'completed').length;
        const avgSuccessRate = pipelines.length > 0
            ? pipelines.reduce((sum, p) => sum + p.metrics.successRate, 0) / pipelines.length
            : 0;
        const avgDataQuality = pipelines.length > 0
            ? pipelines.reduce((sum, p) => sum + p.metrics.dataQuality, 0) / pipelines.length
            : 0;
        const totalSamples = pipelines.reduce((sum, p) => sum + p.metrics.totalSamples, 0);
        const processedSamples = pipelines.reduce((sum, p) => sum + p.metrics.processedSamples, 0);

        return {
            totalPipelines,
            runningPipelines,
            completedPipelines,
            avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
            avgDataQuality: Math.round(avgDataQuality * 10) / 10,
            totalSamples,
            processedSamples,
            processingEfficiency: totalSamples > 0 ? Math.round((processedSamples / totalSamples) * 1000) / 10 : 0
        };
    };

    const pipelineMetrics = calculatePipelineMetrics();

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Workflow className="h-8 w-8 text-purple-600" />
                            Voice Data Processing Pipeline
                        </h1>
                        <p className="text-muted-foreground">
                            ETL pipelines for voice data preprocessing, feature extraction, and augmentation
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

                {/* Pipeline Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Pipelines</p>
                                    <p className="text-2xl font-bold">{pipelineMetrics.runningPipelines}/{pipelineMetrics.totalPipelines}</p>
                                </div>
                                <Workflow className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Processing Efficiency</p>
                                    <p className="text-2xl font-bold">{pipelineMetrics.processingEfficiency}%</p>
                                </div>
                                <Target className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                                    <p className="text-2xl font-bold">{pipelineMetrics.avgSuccessRate}%</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Data Quality Score</p>
                                    <p className="text-2xl font-bold">{pipelineMetrics.avgDataQuality}%</p>
                                </div>
                                <Gauge className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="pipelines">Processing Pipelines</TabsTrigger>
                        <TabsTrigger value="transformations">Transformations</TabsTrigger>
                        <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
                        <TabsTrigger value="templates">Pipeline Templates</TabsTrigger>
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
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="audio_preprocessing">Audio Preprocessing</SelectItem>
                                            <SelectItem value="feature_extraction">Feature Extraction</SelectItem>
                                            <SelectItem value="data_augmentation">Data Augmentation</SelectItem>
                                            <SelectItem value="quality_assessment">Quality Assessment</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
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
                            {pipelines.map((pipeline) => {
                                const PipelineIcon = getPipelineTypeIcon(pipeline.type);
                                return (
                                    <Card key={pipeline.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        <PipelineIcon className="h-6 w-6 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{pipeline.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{pipeline.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getStatusColor(pipeline.type)}>
                                                        {pipeline.type.replace('_', ' ')}
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
                                                <h4 className="font-medium mb-3">Processing Stages</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                    {pipeline.stages.map((stage, index) => {
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

                                            {/* Data Flow */}
                                            <div className="mb-4">
                                                <h4 className="font-medium mb-3">Data Flow</h4>
                                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Database className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm">{pipeline.inputDatasets.join(', ')}</span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    <div className="flex items-center gap-2">
                                                        <Cog className="h-4 w-4 text-purple-600" />
                                                        <span className="text-sm">Processing Pipeline</span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    <div className="flex items-center gap-2">
                                                        <Database className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm">{pipeline.outputDatasets.join(', ')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metrics */}
                                            <div className="grid grid-cols-5 gap-4 mb-4">
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
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold">{pipeline.metrics.dataQuality}%</div>
                                                    <div className="text-xs text-muted-foreground">Quality</div>
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
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="transformations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Transformations</CardTitle>
                                <CardDescription>
                                    Configure and manage data transformation operations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        {
                                            name: 'Audio Normalization',
                                            type: 'audio_normalization',
                                            description: 'Normalize audio levels to consistent target levels',
                                            icon: Gauge,
                                            enabled: true
                                        },
                                        {
                                            name: 'Noise Reduction',
                                            type: 'noise_reduction',
                                            description: 'Remove background noise using spectral subtraction',
                                            icon: Filter,
                                            enabled: true
                                        },
                                        {
                                            name: 'Silence Removal',
                                            type: 'silence_removal',
                                            description: 'Remove silent segments from audio files',
                                            icon: Scissors,
                                            enabled: false
                                        },
                                        {
                                            name: 'Format Conversion',
                                            type: 'format_conversion',
                                            description: 'Convert audio files to standardized formats',
                                            icon: ArrowRight,
                                            enabled: true
                                        },
                                        {
                                            name: 'Feature Extraction',
                                            type: 'feature_extraction',
                                            description: 'Extract acoustic features (MFCC, pitch, etc.)',
                                            icon: Cpu,
                                            enabled: false
                                        },
                                        {
                                            name: 'Data Augmentation',
                                            type: 'data_augmentation',
                                            description: 'Generate synthetic data variations',
                                            icon: Sparkles,
                                            enabled: false
                                        }
                                    ].map((transformation) => {
                                        const Icon = transformation.icon;
                                        return (
                                            <Card key={transformation.type}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${transformation.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                                <Icon className={`h-6 w-6 ${transformation.enabled ? 'text-green-600' : 'text-gray-600'}`} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium">{transformation.name}</h4>
                                                                <p className="text-sm text-muted-foreground">{transformation.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant={transformation.enabled ? "default" : "secondary"}>
                                                                {transformation.enabled ? "Enabled" : "Disabled"}
                                                            </Badge>
                                                            <Switch checked={transformation.enabled} />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="monitoring">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Real-time Processing Status</CardTitle>
                                    <CardDescription>
                                        Live monitoring of data processing operations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Active Jobs</span>
                                            <span className="font-medium">{pipelineMetrics.runningPipelines}</span>
                                        </div>
                                        <Progress value={(pipelineMetrics.runningPipelines / pipelineMetrics.totalPipelines) * 100} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Processing Throughput</span>
                                            <span className="font-medium">1,247 samples/min</span>
                                        </div>
                                        <Progress value={75} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Memory Usage</span>
                                            <span className="font-medium">68%</span>
                                        </div>
                                        <Progress value={68} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Queue Length</span>
                                            <span className="font-medium">23 jobs</span>
                                        </div>
                                        <Progress value={45} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Processing Performance</CardTitle>
                                    <CardDescription>
                                        Performance metrics and optimization insights
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">2.3s</div>
                                            <div className="text-sm text-muted-foreground">Avg Processing Time</div>
                                            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mt-2" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-xl font-semibold">94.2%</div>
                                                <div className="text-xs text-muted-foreground">Success Rate</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-semibold">87.5%</div>
                                                <div className="text-xs text-muted-foreground">Data Quality</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>CPU Efficiency</span>
                                                <span>92%</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Memory Efficiency</span>
                                                <span>85%</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>I/O Throughput</span>
                                                <span>1.2 GB/s</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="templates">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pipeline Templates</CardTitle>
                                <CardDescription>
                                    Pre-configured pipeline templates for common use cases
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        {
                                            name: 'Basic Audio Preprocessing',
                                            description: 'Format conversion, normalization, and noise reduction',
                                            stages: ['Format Conversion', 'Noise Reduction', 'Normalization'],
                                            icon: Waveform
                                        },
                                        {
                                            name: 'Feature Extraction Pipeline',
                                            description: 'Extract MFCC, pitch, and spectral features',
                                            stages: ['MFCC Extraction', 'Pitch Analysis', 'Spectral Features'],
                                            icon: Cpu
                                        },
                                        {
                                            name: 'Data Augmentation Suite',
                                            description: 'Generate variations with speed, pitch, and noise',
                                            stages: ['Speed Perturbation', 'Pitch Shifting', 'Noise Addition'],
                                            icon: Sparkles
                                        },
                                        {
                                            name: 'Quality Assessment',
                                            description: 'Comprehensive audio quality evaluation',
                                            stages: ['SNR Analysis', 'Clarity Check', 'Artifact Detection'],
                                            icon: Target
                                        }
                                    ].map((template) => {
                                        const Icon = template.icon;
                                        return (
                                            <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Icon className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <h4 className="font-medium">{template.name}</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                                                    <div className="space-y-1">
                                                        {template.stages.map((stage, index) => (
                                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                <span>{stage}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button className="w-full mt-4" size="sm">
                                                        Use Template
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Create Pipeline Dialog */}
                <Dialog open={showCreatePipelineDialog} onOpenChange={setShowCreatePipelineDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Processing Pipeline</DialogTitle>
                            <DialogDescription>
                                Set up a new data processing pipeline for voice data operations
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="pipelineName">Pipeline Name</Label>
                                <Input
                                    id="pipelineName"
                                    value={pipelineForm.name}
                                    onChange={(e) => setPipelineForm({ ...pipelineForm, name: e.target.value })}
                                    placeholder="e.g., Audio Preprocessing Pipeline"
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
                                    onValueChange={(value: 'audio_preprocessing' | 'feature_extraction' | 'data_augmentation' | 'quality_assessment' | 'custom') =>
                                        setPipelineForm({ ...pipelineForm, type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="audio_preprocessing">Audio Preprocessing</SelectItem>
                                        <SelectItem value="feature_extraction">Feature Extraction</SelectItem>
                                        <SelectItem value="data_augmentation">Data Augmentation</SelectItem>
                                        <SelectItem value="quality_assessment">Quality Assessment</SelectItem>
                                        <SelectItem value="custom">Custom Pipeline</SelectItem>
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
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Pipeline Details</DialogTitle>
                            <DialogDescription>
                                Detailed view of processing pipeline configuration and execution
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
                                            {selectedPipeline.type.replace('_', ' ')}
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

                                {/* Data Flow Visualization */}
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Data Flow</Label>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Database className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium">Input Datasets</p>
                                                <p className="text-xs text-muted-foreground">{selectedPipeline.inputDatasets.join(', ')}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                        <div className="flex items-center gap-2">
                                            <Cog className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-medium">Processing Pipeline</p>
                                                <p className="text-xs text-muted-foreground">{selectedPipeline.stages.length} stages</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                        <div className="flex items-center gap-2">
                                            <Database className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium">Output Datasets</p>
                                                <p className="text-xs text-muted-foreground">{selectedPipeline.outputDatasets.join(', ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Processing Stages */}
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Processing Stages</Label>
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
                                                            <p className="text-sm text-muted-foreground capitalize">{stage.type.replace('_', ' ')}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm">Progress</span>
                                                            <span className="text-sm">{stage.progress}%</span>
                                                        </div>
                                                        <Progress value={stage.progress} className="w-full" />

                                                        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                                            <span>Input: {stage.inputCount || 0}</span>
                                                            <span>Output: {stage.outputCount || 0}</span>
                                                            {stage.duration && <span>Duration: {stage.duration}s</span>}
                                                        </div>
                                                    </div>

                                                    <Badge className={getStatusColor(stage.status)}>
                                                        {stage.status}
                                                    </Badge>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedStage(stage);
                                                            setShowConfigureStageDialog(true);
                                                        }}
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
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
                                            <div className="flex justify-between">
                                                <span className="text-sm">Data Quality:</span>
                                                <span className="text-sm font-medium">{selectedPipeline.metrics.dataQuality}%</span>
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

                {/* Configure Stage Dialog */}
                <Dialog open={showConfigureStageDialog} onOpenChange={setShowConfigureStageDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Configure Processing Stage</DialogTitle>
                            <DialogDescription>
                                Adjust parameters and settings for this processing stage
                            </DialogDescription>
                        </DialogHeader>

                        {selectedStage && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Stage Name</Label>
                                    <p className="text-sm">{selectedStage.name}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Stage Type</Label>
                                    <p className="text-sm capitalize">{selectedStage.type.replace('_', ' ')}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium mb-2 block">Configuration Parameters</Label>
                                    <div className="space-y-3">
                                        {Object.entries(selectedStage.config).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-3">
                                                <Label className="text-sm w-32">{key.replace('_', ' ')}:</Label>
                                                {typeof value === 'boolean' ? (
                                                    <Switch checked={value} />
                                                ) : typeof value === 'number' ? (
                                                    <Input
                                                        type="number"
                                                        value={value}
                                                        className="w-24"
                                                    />
                                                ) : (
                                                    <Input
                                                        value={String(value)}
                                                        className="flex-1"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfigureStageDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setShowConfigureStageDialog(false)}>
                                Save Configuration
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ManagementLayout>
    );
}