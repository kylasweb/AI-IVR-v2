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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Brain,
    Plus,
    Settings,
    Trash2,
    Play,
    Pause,
    RotateCcw,
    Download,
    Upload,
    Edit,
    Eye,
    Activity,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Zap,
    Globe,
    Star,
    BarChart3,
    Cpu,
    HardDrive,
    Network,
    Shield,
    Layers,
    TestTube,
    Save,
    RefreshCw,
    Volume2,
    Mic,
    Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceModel {
    id: string;
    name: string;
    type: 'synthesis' | 'recognition' | 'cloning';
    provider: string;
    language: string;
    status: 'active' | 'training' | 'inactive' | 'failed';
    version: string;
    accuracy?: number;
    latency?: number;
    trainingProgress?: number;
    lastTrained?: string;
    usageCount: number;
    size: number; // MB
    createdAt: string;
    description: string;
    parameters: {
        [key: string]: any;
    };
}

interface TrainingJob {
    id: string;
    modelId: string;
    modelName: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    progress: number;
    startTime: string;
    estimatedCompletion?: string;
    currentEpoch?: number;
    totalEpochs?: number;
    loss?: number;
    accuracy?: number;
    error?: string;
}

export default function VoiceModelManagementPage() {
    const [models, setModels] = useState<VoiceModel[]>([
        {
            id: 'tts-ml-001',
            name: 'Malayalam Professional Female',
            type: 'synthesis',
            provider: 'Azure Neural',
            language: 'ml',
            status: 'active',
            version: '2.1.0',
            accuracy: 97.2,
            latency: 0.8,
            usageCount: 15420,
            size: 245,
            createdAt: '2025-10-15T08:00:00Z',
            description: 'High-quality Malayalam TTS voice for professional applications',
            parameters: {
                pitch: 0,
                speed: 1.0,
                volume: 1.0,
                emotion: 'neutral'
            }
        },
        {
            id: 'stt-ml-002',
            name: 'Malayalam Speech Recognition',
            type: 'recognition',
            provider: 'Google Cloud',
            language: 'ml',
            status: 'active',
            version: '1.8.3',
            accuracy: 94.7,
            latency: 0.12,
            usageCount: 12500,
            size: 180,
            createdAt: '2025-09-20T10:30:00Z',
            description: 'Advanced Malayalam speech-to-text with noise cancellation',
            parameters: {
                noiseReduction: true,
                punctuation: true,
                speakerDiarization: false
            }
        },
        {
            id: 'clone-custom-003',
            name: 'Custom Malayalam Voice',
            type: 'cloning',
            provider: 'Custom',
            language: 'ml',
            status: 'training',
            version: '0.1.0',
            trainingProgress: 65,
            usageCount: 0,
            size: 320,
            createdAt: '2025-11-10T08:00:00Z',
            description: 'Custom voice model trained on 5000 Malayalam samples',
            parameters: {
                trainingSamples: 5000,
                epochs: 100,
                learningRate: 0.001
            }
        }
    ]);

    const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([
        {
            id: 'train-001',
            modelId: 'clone-custom-003',
            modelName: 'Custom Malayalam Voice',
            status: 'running',
            progress: 65,
            startTime: '2025-11-10T08:00:00Z',
            estimatedCompletion: '2025-11-11T14:30:00Z',
            currentEpoch: 65,
            totalEpochs: 100,
            loss: 0.0234,
            accuracy: 87.3
        }
    ]);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('models');
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        provider: '',
        language: '',
        description: '',
        parameters: {}
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'training': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'synthesis': return <Volume2 className="h-4 w-4" />;
            case 'recognition': return <Mic className="h-4 w-4" />;
            case 'cloning': return <Users className="h-4 w-4" />;
            default: return <Brain className="h-4 w-4" />;
        }
    };

    const handleCreateModel = () => {
        const newModel: VoiceModel = {
            id: `model-${Date.now()}`,
            name: formData.name,
            type: formData.type as VoiceModel['type'],
            provider: formData.provider,
            language: formData.language,
            status: 'inactive',
            version: '0.1.0',
            usageCount: 0,
            size: 0,
            createdAt: new Date().toISOString(),
            description: formData.description,
            parameters: formData.parameters
        };

        setModels([...models, newModel]);
        setIsCreateDialogOpen(false);
        setFormData({
            name: '',
            type: '',
            provider: '',
            language: '',
            description: '',
            parameters: {}
        });

        toast({
            title: "Model Created",
            description: `Voice model "${formData.name}" has been created successfully.`,
        });
    };

    const handleStartTraining = (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        if (!model) return;

        const trainingJob: TrainingJob = {
            id: `train-${Date.now()}`,
            modelId,
            modelName: model.name,
            status: 'queued',
            progress: 0,
            startTime: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        };

        setTrainingJobs([...trainingJobs, trainingJob]);

        // Update model status
        setModels(models.map(m =>
            m.id === modelId
                ? { ...m, status: 'training' as const, trainingProgress: 0 }
                : m
        ));

        toast({
            title: "Training Started",
            description: `Training job for "${model.name}" has been queued.`,
        });
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Brain className="h-8 w-8 text-blue-600" />
                            Voice Model Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage voice models, training jobs, and performance monitoring
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Model
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Voice Model</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Model Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Malayalam Professional Voice"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="type">Model Type</Label>
                                            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="synthesis">Speech Synthesis</SelectItem>
                                                    <SelectItem value="recognition">Speech Recognition</SelectItem>
                                                    <SelectItem value="cloning">Voice Cloning</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="provider">Provider</Label>
                                            <Select value={formData.provider} onValueChange={(value) => setFormData({ ...formData, provider: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Azure">Azure Cognitive Services</SelectItem>
                                                    <SelectItem value="Google">Google Cloud</SelectItem>
                                                    <SelectItem value="ElevenLabs">ElevenLabs</SelectItem>
                                                    <SelectItem value="Custom">Custom Training</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="language">Language</Label>
                                            <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="ml">Malayalam</SelectItem>
                                                    <SelectItem value="hi">Hindi</SelectItem>
                                                    <SelectItem value="ta">Tamil</SelectItem>
                                                    <SelectItem value="te">Telugu</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the voice model and its intended use..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateModel}>
                                        Create Model
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                            <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{models.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {models.filter(m => m.status === 'active').length} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{trainingJobs.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {trainingJobs.filter(j => j.status === 'running').length} running
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round(models.filter(m => m.accuracy).reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.filter(m => m.accuracy).length)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all models
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {models.reduce((sum, m) => sum + m.size, 0)}MB
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total model size
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="models">Voice Models</TabsTrigger>
                        <TabsTrigger value="training">Training Jobs</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="models" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Models</CardTitle>
                                <CardDescription>
                                    Manage and monitor all voice AI models
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Language</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Accuracy</TableHead>
                                            <TableHead>Usage</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {models.map((model) => (
                                            <TableRow key={model.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{model.name}</div>
                                                        <div className="text-sm text-muted-foreground">v{model.version}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(model.type)}
                                                        <span className="capitalize">{model.type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{model.provider}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{model.language.toUpperCase()}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(model.status)}>
                                                        {model.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {model.accuracy ? `${model.accuracy}%` : 'N/A'}
                                                </TableCell>
                                                <TableCell>{model.usageCount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {model.status !== 'training' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleStartTraining(model.id)}
                                                            >
                                                                <Play className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="training" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Training Jobs</CardTitle>
                                <CardDescription>
                                    Monitor ongoing model training and fine-tuning jobs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {trainingJobs.map((job) => (
                                        <Card key={job.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-medium">{job.modelName}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Started {new Date(job.startTime).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Badge className={getStatusColor(job.status)}>
                                                        {job.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Progress</span>
                                                        <span>{job.progress}%</span>
                                                    </div>
                                                    <Progress value={job.progress} className="w-full" />
                                                </div>

                                                {job.currentEpoch && job.totalEpochs && (
                                                    <div className="mt-2 text-sm text-muted-foreground">
                                                        Epoch {job.currentEpoch} of {job.totalEpochs}
                                                    </div>
                                                )}

                                                {job.loss && (
                                                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                                        <div>Loss: {job.loss.toFixed(4)}</div>
                                                        <div>Accuracy: {job.accuracy}%</div>
                                                    </div>
                                                )}

                                                {job.estimatedCompletion && (
                                                    <div className="mt-2 text-sm text-muted-foreground">
                                                        Estimated completion: {new Date(job.estimatedCompletion).toLocaleString()}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {trainingJobs.length === 0 && (
                                        <div className="text-center py-12">
                                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-medium mb-2">No Training Jobs</h3>
                                            <p className="text-muted-foreground">
                                                No models are currently being trained.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Model Performance</CardTitle>
                                    <CardDescription>
                                        Accuracy and latency metrics across all models
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {models.filter(m => m.accuracy).map((model) => (
                                            <div key={model.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getTypeIcon(model.type)}
                                                    <div>
                                                        <div className="font-medium">{model.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {model.accuracy}% accuracy
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{model.latency}s</div>
                                                    <div className="text-sm text-muted-foreground">latency</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage Statistics</CardTitle>
                                    <CardDescription>
                                        Model usage patterns and trends
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {models.map((model) => (
                                            <div key={model.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getTypeIcon(model.type)}
                                                    <div>
                                                        <div className="font-medium">{model.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {model.usageCount.toLocaleString()} requests
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{model.size}MB</div>
                                                    <div className="text-sm text-muted-foreground">size</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ManagementLayout>
    );
}