'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
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
    TrendingUp as SortAsc,
    TrendingUp as SortDesc,
    Settings as Cpu,
    Settings as HardDrive,
    Activity as Gauge,
    Layers,
    Settings as FlaskConical,
    GitBranch,
    GitBranch as GitCompare,
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
    Minimize2
} from 'lucide-react';

// Fine-tuning Interfaces
interface VoiceModel {
    id: string;
    name: string;
    version: string;
    baseModel: string;
    language: 'ml' | 'en' | 'manglish';
    voiceType: 'male' | 'female' | 'child' | 'elderly';
    status: 'training' | 'trained' | 'deployed' | 'archived' | 'error';
    accuracy: number;
    loss: number;
    trainingProgress: number;
    createdAt: Date;
    updatedAt: Date;
    trainingConfig: TrainingConfig;
    metrics: ModelMetrics;
    deploymentInfo?: DeploymentInfo;
}

interface TrainingConfig {
    learningRate: number;
    batchSize: number;
    epochs: number;
    validationSplit: number;
    optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
    lossFunction: 'mse' | 'mae' | 'huber' | 'cosine';
    schedulerType: 'step' | 'exponential' | 'cosine' | 'plateau';
    earlyStoppingPatience: number;
    dataAugmentation: {
        noiseInjection: boolean;
        speedPerturbation: boolean;
        pitchShift: boolean;
        timeStretch: boolean;
        volumeNormalization: boolean;
    };
    regularization: {
        dropout: number;
        l1Lambda: number;
        l2Lambda: number;
        gradientClipping: number;
    };
    architecture: {
        hiddenLayers: number;
        hiddenUnits: number;
        activationFunction: 'relu' | 'gelu' | 'swish' | 'tanh';
        attentionHeads: number;
        encoderLayers: number;
        decoderLayers: number;
    };
}

interface ModelMetrics {
    trainingAccuracy: number[];
    validationAccuracy: number[];
    trainingLoss: number[];
    validationLoss: number[];
    spectralDistance: number[];
    melCepstralDistortion: number[];
    perceptualEvaluation: number[];
    voiceSimilarity: number[];
    epochs: number[];
    trainingTime: number; // in minutes
    modelSize: number; // in MB
    parameters: number;
    flops: number; // floating point operations
}

interface DeploymentInfo {
    environment: 'development' | 'staging' | 'production';
    endpoint: string;
    version: string;
    deployedAt: Date;
    status: 'active' | 'inactive' | 'maintenance';
    performance: {
        averageLatency: number;
        throughput: number;
        errorRate: number;
        uptime: number;
    };
}

interface ABTestExperiment {
    id: string;
    name: string;
    description: string;
    modelA: string;
    modelB: string;
    status: 'running' | 'completed' | 'paused' | 'cancelled';
    trafficSplit: number; // percentage for model A
    startDate: Date;
    endDate?: Date;
    metrics: {
        totalRequests: number;
        modelARequests: number;
        modelBRequests: number;
        modelAPerformance: number;
        modelBPerformance: number;
        statisticalSignificance: number;
        preferredModel: 'A' | 'B' | 'inconclusive';
    };
    results?: {
        winner: 'A' | 'B' | 'tie';
        confidence: number;
        improvements: string[];
        recommendations: string[];
    };
}

interface HyperparameterTuning {
    id: string;
    status: 'running' | 'completed' | 'failed';
    searchSpace: {
        learningRate: [number, number];
        batchSize: number[];
        hiddenUnits: [number, number];
        dropout: [number, number];
    };
    method: 'grid' | 'random' | 'bayesian' | 'genetic';
    trials: {
        id: string;
        parameters: Partial<TrainingConfig>;
        score: number;
        status: 'running' | 'completed' | 'failed';
        duration: number;
    }[];
    bestTrial?: {
        parameters: Partial<TrainingConfig>;
        score: number;
        improvement: number;
    };
}

// Training Configuration Component
const TrainingConfigPanel: React.FC<{
    config: TrainingConfig;
    onChange: (config: TrainingConfig) => void;
    isReadOnly?: boolean;
}> = ({ config, onChange, isReadOnly = false }) => {
    const updateConfig = (updates: Partial<TrainingConfig>) => {
        onChange({ ...config, ...updates });
    };

    const updateNestedConfig = (key: keyof TrainingConfig, updates: any) => {
        const currentValue = config[key];
        onChange({
            ...config,
            [key]: { ...currentValue as any, ...updates }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Training Configuration
                </CardTitle>
                <CardDescription>
                    Configure model training parameters and optimization settings
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Basic Training Parameters */}
                <div className="space-y-4">
                    <h4 className="font-medium">Basic Parameters</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="learningRate">Learning Rate</Label>
                            <div className="space-y-2">
                                <Slider
                                    id="learningRate"
                                    min={0.0001}
                                    max={0.1}
                                    step={0.0001}
                                    value={[config.learningRate]}
                                    onValueChange={([value]) => updateConfig({ learningRate: value })}
                                    disabled={isReadOnly}
                                />
                                <div className="text-xs text-gray-600 text-center">
                                    {config.learningRate.toFixed(4)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="batchSize">Batch Size</Label>
                            <Select
                                value={config.batchSize.toString()}
                                onValueChange={(value) => updateConfig({ batchSize: parseInt(value) })}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="8">8</SelectItem>
                                    <SelectItem value="16">16</SelectItem>
                                    <SelectItem value="32">32</SelectItem>
                                    <SelectItem value="64">64</SelectItem>
                                    <SelectItem value="128">128</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="epochs">Epochs</Label>
                            <Input
                                id="epochs"
                                type="number"
                                value={config.epochs}
                                onChange={(e) => updateConfig({ epochs: parseInt(e.target.value) || 100 })}
                                disabled={isReadOnly}
                            />
                        </div>

                        <div>
                            <Label htmlFor="validationSplit">Validation Split</Label>
                            <div className="space-y-2">
                                <Slider
                                    id="validationSplit"
                                    min={0.1}
                                    max={0.4}
                                    step={0.05}
                                    value={[config.validationSplit]}
                                    onValueChange={([value]) => updateConfig({ validationSplit: value })}
                                    disabled={isReadOnly}
                                />
                                <div className="text-xs text-gray-600 text-center">
                                    {(config.validationSplit * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="optimizer">Optimizer</Label>
                            <Select
                                value={config.optimizer}
                                onValueChange={(value: any) => updateConfig({ optimizer: value })}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="adam">Adam</SelectItem>
                                    <SelectItem value="sgd">SGD</SelectItem>
                                    <SelectItem value="rmsprop">RMSprop</SelectItem>
                                    <SelectItem value="adagrad">Adagrad</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="lossFunction">Loss Function</Label>
                            <Select
                                value={config.lossFunction}
                                onValueChange={(value: any) => updateConfig({ lossFunction: value })}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mse">Mean Squared Error</SelectItem>
                                    <SelectItem value="mae">Mean Absolute Error</SelectItem>
                                    <SelectItem value="huber">Huber Loss</SelectItem>
                                    <SelectItem value="cosine">Cosine Similarity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Architecture Parameters */}
                <div className="space-y-4">
                    <h4 className="font-medium">Architecture</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="hiddenLayers">Hidden Layers</Label>
                            <Input
                                id="hiddenLayers"
                                type="number"
                                value={config.architecture.hiddenLayers}
                                onChange={(e) => updateNestedConfig('architecture', { hiddenLayers: parseInt(e.target.value) || 6 })}
                                disabled={isReadOnly}
                            />
                        </div>

                        <div>
                            <Label htmlFor="hiddenUnits">Hidden Units</Label>
                            <Input
                                id="hiddenUnits"
                                type="number"
                                value={config.architecture.hiddenUnits}
                                onChange={(e) => updateNestedConfig('architecture', { hiddenUnits: parseInt(e.target.value) || 512 })}
                                disabled={isReadOnly}
                            />
                        </div>

                        <div>
                            <Label htmlFor="attentionHeads">Attention Heads</Label>
                            <Select
                                value={config.architecture.attentionHeads.toString()}
                                onValueChange={(value) => updateNestedConfig('architecture', { attentionHeads: parseInt(value) })}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="8">8</SelectItem>
                                    <SelectItem value="12">12</SelectItem>
                                    <SelectItem value="16">16</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="activationFunction">Activation Function</Label>
                            <Select
                                value={config.architecture.activationFunction}
                                onValueChange={(value: any) => updateNestedConfig('architecture', { activationFunction: value })}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relu">ReLU</SelectItem>
                                    <SelectItem value="gelu">GELU</SelectItem>
                                    <SelectItem value="swish">Swish</SelectItem>
                                    <SelectItem value="tanh">Tanh</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Regularization */}
                <div className="space-y-4">
                    <h4 className="font-medium">Regularization</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="dropout">Dropout Rate</Label>
                            <div className="space-y-2">
                                <Slider
                                    id="dropout"
                                    min={0}
                                    max={0.8}
                                    step={0.05}
                                    value={[config.regularization.dropout]}
                                    onValueChange={([value]) => updateNestedConfig('regularization', { dropout: value })}
                                    disabled={isReadOnly}
                                />
                                <div className="text-xs text-gray-600 text-center">
                                    {(config.regularization.dropout * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="gradientClipping">Gradient Clipping</Label>
                            <div className="space-y-2">
                                <Slider
                                    id="gradientClipping"
                                    min={0.1}
                                    max={5.0}
                                    step={0.1}
                                    value={[config.regularization.gradientClipping]}
                                    onValueChange={([value]) => updateNestedConfig('regularization', { gradientClipping: value })}
                                    disabled={isReadOnly}
                                />
                                <div className="text-xs text-gray-600 text-center">
                                    {config.regularization.gradientClipping.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Data Augmentation */}
                <div className="space-y-4">
                    <h4 className="font-medium">Data Augmentation</h4>

                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(config.dataAugmentation).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={value}
                                    onCheckedChange={(checked) =>
                                        updateNestedConfig('dataAugmentation', { [key]: checked })
                                    }
                                    disabled={isReadOnly}
                                />
                                <Label htmlFor={key} className="text-sm capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Model Performance Metrics Component
const ModelMetricsPanel: React.FC<{
    metrics: ModelMetrics;
    isTraining: boolean;
}> = ({ metrics, isTraining }) => {
    const [selectedMetric, setSelectedMetric] = useState<string>('accuracy');

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
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatNumber = (num: number) => {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Training Time</p>
                                <p className="text-2xl font-bold">{formatTime(metrics.trainingTime)}</p>
                            </div>
                            <Timer className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Model Size</p>
                                <p className="text-2xl font-bold">{formatBytes(metrics.modelSize * 1024 * 1024)}</p>
                            </div>
                            <HardDrive className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Parameters</p>
                                <p className="text-2xl font-bold">{formatNumber(metrics.parameters)}</p>
                            </div>
                            <Layers className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">FLOPs</p>
                                <p className="text-2xl font-bold">{formatNumber(metrics.flops)}</p>
                            </div>
                            <Cpu className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Training Progress Charts */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Training Metrics
                        </CardTitle>
                        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="accuracy">Accuracy</SelectItem>
                                <SelectItem value="loss">Loss</SelectItem>
                                <SelectItem value="spectralDistance">Spectral Distance</SelectItem>
                                <SelectItem value="melCepstralDistortion">Mel-Cepstral Distortion</SelectItem>
                                <SelectItem value="perceptualEvaluation">Perceptual Evaluation</SelectItem>
                                <SelectItem value="voiceSimilarity">Voice Similarity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center text-gray-500">
                            <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Training Metrics Chart</p>
                            <p className="text-sm">Real-time visualization of {selectedMetric}</p>
                            {isTraining && (
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <RotateCw className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Training in progress...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Values */}
                    {metrics.epochs.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">Current Training {selectedMetric}</p>
                                <p className="text-lg font-bold">
                                    {selectedMetric === 'accuracy' ?
                                        (metrics.trainingAccuracy[metrics.trainingAccuracy.length - 1] * 100).toFixed(2) + '%' :
                                        selectedMetric === 'loss' ?
                                            metrics.trainingLoss[metrics.trainingLoss.length - 1]?.toFixed(4) :
                                            'N/A'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Current Validation {selectedMetric}</p>
                                <p className="text-lg font-bold">
                                    {selectedMetric === 'accuracy' ?
                                        (metrics.validationAccuracy[metrics.validationAccuracy.length - 1] * 100).toFixed(2) + '%' :
                                        selectedMetric === 'loss' ?
                                            metrics.validationLoss[metrics.validationLoss.length - 1]?.toFixed(4) :
                                            'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// A/B Testing Component
const ABTestingPanel: React.FC<{
    experiments: ABTestExperiment[];
    models: VoiceModel[];
    onCreateExperiment: (experiment: Partial<ABTestExperiment>) => void;
    onStopExperiment: (experimentId: string) => void;
}> = ({ experiments, models, onCreateExperiment, onStopExperiment }) => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newExperiment, setNewExperiment] = useState({
        name: '',
        description: '',
        modelA: '',
        modelB: '',
        trafficSplit: 50
    });

    const trainedModels = models.filter(m => m.status === 'trained');

    const getExperimentStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-green-50 border-green-200 text-green-800';
            case 'completed': return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'paused': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'cancelled': return 'bg-red-50 border-red-200 text-red-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const handleCreateExperiment = () => {
        onCreateExperiment({
            ...newExperiment,
            id: `exp_${Date.now()}`,
            status: 'running',
            startDate: new Date(),
            metrics: {
                totalRequests: 0,
                modelARequests: 0,
                modelBRequests: 0,
                modelAPerformance: 0,
                modelBPerformance: 0,
                statisticalSignificance: 0,
                preferredModel: 'inconclusive'
            }
        });

        setNewExperiment({
            name: '',
            description: '',
            modelA: '',
            modelB: '',
            trafficSplit: 50
        });
        setShowCreateDialog(false);
    };

    return (
        <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">A/B Testing Experiments</h3>
                <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Create Experiment
                </Button>
            </div>

            {/* Experiments List */}
            {experiments.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                        <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No experiments running</p>
                        <p className="text-sm">Create A/B tests to compare model performance</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {experiments.map(experiment => (
                        <Card key={experiment.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base">{experiment.name}</CardTitle>
                                        <CardDescription>{experiment.description}</CardDescription>
                                    </div>
                                    <Badge className={getExperimentStatusColor(experiment.status)}>
                                        {experiment.status}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Model Comparison */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-800">Model A</h4>
                                        <p className="text-sm text-blue-600">
                                            {models.find(m => m.id === experiment.modelA)?.name || experiment.modelA}
                                        </p>
                                        <div className="mt-2 text-xs text-blue-600">
                                            {experiment.metrics.modelARequests} requests ({(100 - experiment.trafficSplit)}%)
                                        </div>
                                    </div>

                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <h4 className="font-medium text-green-800">Model B</h4>
                                        <p className="text-sm text-green-600">
                                            {models.find(m => m.id === experiment.modelB)?.name || experiment.modelB}
                                        </p>
                                        <div className="mt-2 text-xs text-green-600">
                                            {experiment.metrics.modelBRequests} requests ({experiment.trafficSplit}%)
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Total Requests</p>
                                        <p className="font-bold">{experiment.metrics.totalRequests}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Statistical Significance</p>
                                        <p className="font-bold">{(experiment.metrics.statisticalSignificance * 100).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Preferred Model</p>
                                        <p className="font-bold capitalize">{experiment.metrics.preferredModel}</p>
                                    </div>
                                </div>

                                {/* Results */}
                                {experiment.results && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium mb-2">Results</h4>
                                        <div className="text-sm space-y-1">
                                            <p><strong>Winner:</strong> Model {experiment.results.winner.toUpperCase()}</p>
                                            <p><strong>Confidence:</strong> {(experiment.results.confidence * 100).toFixed(1)}%</p>
                                            {experiment.results.improvements.length > 0 && (
                                                <p><strong>Improvements:</strong> {experiment.results.improvements.join(', ')}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                    {experiment.status === 'running' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onStopExperiment(experiment.id)}
                                        >
                                            Stop Experiment
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline">
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Experiment Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create A/B Test Experiment</DialogTitle>
                        <DialogDescription>
                            Compare two models to determine which performs better
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="experimentName">Experiment Name</Label>
                            <Input
                                id="experimentName"
                                value={newExperiment.name}
                                onChange={(e) => setNewExperiment(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Voice Quality Comparison"
                            />
                        </div>

                        <div>
                            <Label htmlFor="experimentDescription">Description</Label>
                            <Textarea
                                id="experimentDescription"
                                value={newExperiment.description}
                                onChange={(e) => setNewExperiment(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what you're testing..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="modelA">Model A</Label>
                                <Select
                                    value={newExperiment.modelA}
                                    onValueChange={(value) => setNewExperiment(prev => ({ ...prev, modelA: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {trainedModels.map(model => (
                                            <SelectItem key={model.id} value={model.id}>
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="modelB">Model B</Label>
                                <Select
                                    value={newExperiment.modelB}
                                    onValueChange={(value) => setNewExperiment(prev => ({ ...prev, modelB: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {trainedModels.map(model => (
                                            <SelectItem key={model.id} value={model.id}>
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="trafficSplit">Traffic Split for Model B (%)</Label>
                            <div className="space-y-2">
                                <Slider
                                    id="trafficSplit"
                                    min={10}
                                    max={90}
                                    step={5}
                                    value={[newExperiment.trafficSplit]}
                                    onValueChange={([value]) => setNewExperiment(prev => ({ ...prev, trafficSplit: value }))}
                                />
                                <div className="text-xs text-gray-600 text-center">
                                    Model A: {100 - newExperiment.trafficSplit}% | Model B: {newExperiment.trafficSplit}%
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                onClick={handleCreateExperiment}
                                disabled={!newExperiment.name || !newExperiment.modelA || !newExperiment.modelB}
                                className="flex-1"
                            >
                                Create Experiment
                            </Button>
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Main Voice Model Fine-tuning Component
export default function VoiceModelFineTuning() {
    const [models, setModels] = useState<VoiceModel[]>([]);
    const [experiments, setExperiments] = useState<ABTestExperiment[]>([]);
    const [selectedModel, setSelectedModel] = useState<VoiceModel | null>(null);
    const [isTraining, setIsTraining] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('models');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newModelConfig, setNewModelConfig] = useState<Partial<TrainingConfig>>({});

    // Default training configuration
    const defaultTrainingConfig: TrainingConfig = {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        validationSplit: 0.2,
        optimizer: 'adam',
        lossFunction: 'mse',
        schedulerType: 'step',
        earlyStoppingPatience: 10,
        dataAugmentation: {
            noiseInjection: true,
            speedPerturbation: true,
            pitchShift: false,
            timeStretch: true,
            volumeNormalization: true
        },
        regularization: {
            dropout: 0.1,
            l1Lambda: 0.0001,
            l2Lambda: 0.0001,
            gradientClipping: 1.0
        },
        architecture: {
            hiddenLayers: 6,
            hiddenUnits: 512,
            activationFunction: 'relu',
            attentionHeads: 8,
            encoderLayers: 6,
            decoderLayers: 6
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadModels();
        loadExperiments();
    }, []);

    const loadModels = async () => {
        setIsLoading(true);
        try {
            // Mock data - replace with actual API call
            const mockModels: VoiceModel[] = [
                {
                    id: 'model_1',
                    name: 'Sarah Professional v2.1',
                    version: '2.1.0',
                    baseModel: 'tacotron2-en',
                    language: 'en',
                    voiceType: 'female',
                    status: 'trained',
                    accuracy: 0.94,
                    loss: 0.023,
                    trainingProgress: 100,
                    createdAt: new Date('2024-02-08'),
                    updatedAt: new Date('2024-02-10'),
                    trainingConfig: defaultTrainingConfig,
                    metrics: {
                        trainingAccuracy: [0.65, 0.78, 0.85, 0.89, 0.92, 0.94],
                        validationAccuracy: [0.63, 0.75, 0.82, 0.87, 0.90, 0.93],
                        trainingLoss: [0.45, 0.32, 0.18, 0.08, 0.04, 0.023],
                        validationLoss: [0.48, 0.35, 0.21, 0.11, 0.06, 0.031],
                        spectralDistance: [2.1, 1.8, 1.5, 1.2, 1.0, 0.9],
                        melCepstralDistortion: [3.2, 2.8, 2.3, 1.9, 1.6, 1.4],
                        perceptualEvaluation: [3.8, 4.1, 4.3, 4.5, 4.7, 4.8],
                        voiceSimilarity: [0.72, 0.78, 0.84, 0.88, 0.91, 0.93],
                        epochs: [1, 2, 3, 4, 5, 6],
                        trainingTime: 45,
                        modelSize: 127.5,
                        parameters: 28500000,
                        flops: 2400000000
                    },
                    deploymentInfo: {
                        environment: 'production',
                        endpoint: 'https://api.voiceai.com/v2/sarah-professional',
                        version: '2.1.0',
                        deployedAt: new Date('2024-02-10'),
                        status: 'active',
                        performance: {
                            averageLatency: 120,
                            throughput: 450,
                            errorRate: 0.002,
                            uptime: 99.8
                        }
                    }
                },
                {
                    id: 'model_2',
                    name: 'Ravi Malayalam v1.3',
                    version: '1.3.0',
                    baseModel: 'tacotron2-ml',
                    language: 'ml',
                    voiceType: 'male',
                    status: 'training',
                    accuracy: 0.87,
                    loss: 0.045,
                    trainingProgress: 67,
                    createdAt: new Date('2024-02-09'),
                    updatedAt: new Date('2024-02-11'),
                    trainingConfig: {
                        ...defaultTrainingConfig,
                        learningRate: 0.0008,
                        batchSize: 16,
                        epochs: 150
                    },
                    metrics: {
                        trainingAccuracy: [0.58, 0.71, 0.81, 0.87],
                        validationAccuracy: [0.55, 0.68, 0.78, 0.84],
                        trainingLoss: [0.52, 0.38, 0.21, 0.045],
                        validationLoss: [0.55, 0.42, 0.25, 0.058],
                        spectralDistance: [2.8, 2.2, 1.7, 1.3],
                        melCepstralDistortion: [4.1, 3.5, 2.9, 2.1],
                        perceptualEvaluation: [3.2, 3.8, 4.2, 4.4],
                        voiceSimilarity: [0.65, 0.73, 0.81, 0.87],
                        epochs: [1, 2, 3, 4],
                        trainingTime: 32,
                        modelSize: 95.2,
                        parameters: 21200000,
                        flops: 1800000000
                    }
                }
            ];

            setModels(mockModels);
            if (mockModels.length > 0) {
                setSelectedModel(mockModels[0]);
            }
        } catch (error) {
            console.error('Failed to load models:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadExperiments = async () => {
        try {
            // Mock experiments data
            const mockExperiments: ABTestExperiment[] = [
                {
                    id: 'exp_1',
                    name: 'Voice Quality Comparison',
                    description: 'Testing improved model against baseline for customer service scenarios',
                    modelA: 'model_1',
                    modelB: 'model_2',
                    status: 'running',
                    trafficSplit: 30,
                    startDate: new Date('2024-02-09'),
                    metrics: {
                        totalRequests: 1247,
                        modelARequests: 873,
                        modelBRequests: 374,
                        modelAPerformance: 4.2,
                        modelBPerformance: 4.7,
                        statisticalSignificance: 0.85,
                        preferredModel: 'B'
                    }
                }
            ];

            setExperiments(mockExperiments);
        } catch (error) {
            console.error('Failed to load experiments:', error);
        }
    };

    const handleStartTraining = (config: TrainingConfig) => {
        setIsTraining(true);
        console.log('Starting training with config:', config);

        // Simulate training progress
        setTimeout(() => {
            setIsTraining(false);
            loadModels(); // Refresh models
        }, 5000);
    };

    const handleCreateExperiment = (experiment: Partial<ABTestExperiment>) => {
        const newExperiment: ABTestExperiment = {
            ...experiment,
            id: experiment.id || `exp_${Date.now()}`,
            status: 'running',
            startDate: new Date(),
            metrics: {
                totalRequests: 0,
                modelARequests: 0,
                modelBRequests: 0,
                modelAPerformance: 0,
                modelBPerformance: 0,
                statisticalSignificance: 0,
                preferredModel: 'inconclusive'
            }
        } as ABTestExperiment;

        setExperiments(prev => [...prev, newExperiment]);
    };

    const handleStopExperiment = (experimentId: string) => {
        setExperiments(prev =>
            prev.map(exp =>
                exp.id === experimentId
                    ? { ...exp, status: 'completed' as const, endDate: new Date() }
                    : exp
            )
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RotateCw className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading voice models...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Voice Model Fine-tuning</h1>
                    <p className="text-gray-600">Advanced model training, optimization, and A/B testing</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {models.length} Models
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="models">Models</TabsTrigger>
                    <TabsTrigger value="training">Training</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="abtest">A/B Testing</TabsTrigger>
                </TabsList>

                <TabsContent value="models" className="space-y-4">
                    {/* Models List */}
                    <div className="grid gap-4">
                        {models.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-gray-500">
                                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">No models available</p>
                                    <p className="text-sm">Start training your first voice model</p>
                                </CardContent>
                            </Card>
                        ) : (
                            models.map(model => (
                                <Card
                                    key={model.id}
                                    className={`cursor-pointer transition-colors ${selectedModel?.id === model.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => setSelectedModel(model)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-medium">{model.name}</h3>
                                                    <Badge variant="outline">v{model.version}</Badge>
                                                    <Badge
                                                        variant={
                                                            model.status === 'trained' ? 'default' :
                                                                model.status === 'training' ? 'secondary' :
                                                                    model.status === 'deployed' ? 'default' :
                                                                        model.status === 'error' ? 'destructive' : 'outline'
                                                        }
                                                    >
                                                        {model.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Language</p>
                                                        <p className="font-medium capitalize">{model.language}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Voice Type</p>
                                                        <p className="font-medium capitalize">{model.voiceType}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Accuracy</p>
                                                        <p className="font-medium">{(model.accuracy * 100).toFixed(1)}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Loss</p>
                                                        <p className="font-medium">{model.loss.toFixed(4)}</p>
                                                    </div>
                                                </div>

                                                {model.status === 'training' && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs text-gray-600">Training Progress</span>
                                                            <span className="text-xs font-medium">{model.trainingProgress}%</span>
                                                        </div>
                                                        <Progress value={model.trainingProgress} className="h-2" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {model.deploymentInfo && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {model.deploymentInfo.environment}
                                                    </Badge>
                                                )}
                                                <Button size="sm" variant="ghost">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="training" className="space-y-4">
                    {selectedModel ? (
                        <TrainingConfigPanel
                            config={selectedModel.trainingConfig}
                            onChange={(config) => {
                                setSelectedModel(prev => prev ? { ...prev, trainingConfig: config } : null);
                            }}
                            isReadOnly={selectedModel.status === 'training'}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Select a model to configure training</p>
                                <p className="text-sm">Choose a model from the Models tab</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                    {selectedModel ? (
                        <ModelMetricsPanel
                            metrics={selectedModel.metrics}
                            isTraining={selectedModel.status === 'training'}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Select a model to view metrics</p>
                                <p className="text-sm">Choose a model from the Models tab</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="abtest" className="space-y-4">
                    <ABTestingPanel
                        experiments={experiments}
                        models={models}
                        onCreateExperiment={handleCreateExperiment}
                        onStopExperiment={handleStopExperiment}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}