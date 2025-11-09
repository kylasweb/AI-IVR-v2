'use client';

import React, { useState, useRef, useEffect } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
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
import { Slider } from '@/components/ui/slider';
import {
    Mic,
    Play,
    Pause,
    RotateCcw,
    Download,
    Upload,
    Trash2,
    Settings,
    User,
    Activity,
    Volume2,
    VolumeOff,
    Save,
    Plus,
    Eye,
    Edit,
    Pencil as Edit2,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Zap,
    Brain,
    Globe,
    Star,
    TrendingUp,
    FileText as FileAudio,
    Layers,
    Paintbrush as Palette
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceModel {
    id: string;
    name: string;
    description: string;
    type: 'neural' | 'concatenative' | 'parametric';
    language: string;
    accent: string;
    gender: 'male' | 'female' | 'neutral';
    age: 'child' | 'young' | 'adult' | 'elderly';
    quality: 'basic' | 'standard' | 'premium' | 'ultra';
    status: 'training' | 'ready' | 'failed' | 'archived';
    trainingProgress: number;
    audioSamples: number;
    trainingDuration: string;
    accuracy: number;
    size: number; // in MB
    createdAt: string;
    updatedAt: string;
    usage: {
        totalGenerations: number;
        totalDuration: number; // in seconds
        lastUsed: string;
    };
    settings: {
        pitch: number;
        speed: number;
        emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'calm';
        emphasis: number;
    };
}

interface VoiceGeneration {
    id: string;
    modelId: string;
    text: string;
    audioUrl: string;
    duration: number;
    status: 'generating' | 'completed' | 'failed';
    settings: any;
    createdAt: string;
    metadata: {
        wordCount: number;
        charactersCount: number;
        estimatedCost: number;
    };
}

interface VoiceStats {
    totalModels: number;
    activeModels: number;
    totalGenerations: number;
    totalDuration: number;
    totalCost: number;
    avgQuality: number;
}

// Mock data - moved before component to fix hoisting issue
const mockModels: VoiceModel[] = [
    {
        id: '1',
        name: 'Professional Male Voice',
        description: 'Clear, professional male voice suitable for business communications',
        type: 'neural',
        language: 'English',
        accent: 'American',
        gender: 'male',
        age: 'adult',
        quality: 'ultra',
        status: 'ready',
        trainingProgress: 100,
        audioSamples: 2500,
        trainingDuration: '4h 32m',
        accuracy: 97.8,
        size: 45.6,
        createdAt: '2024-10-15',
        updatedAt: '2024-11-08',
        usage: {
            totalGenerations: 1250,
            totalDuration: 3600,
            lastUsed: '2024-11-08'
        },
        settings: {
            pitch: 0,
            speed: 1.0,
            emotion: 'neutral',
            emphasis: 50
        }
    },
    {
        id: '2',
        name: 'Friendly Female Assistant',
        description: 'Warm, friendly female voice perfect for customer service interactions',
        type: 'neural',
        language: 'English',
        accent: 'British',
        gender: 'female',
        age: 'young',
        quality: 'premium',
        status: 'ready',
        trainingProgress: 100,
        audioSamples: 1800,
        trainingDuration: '3h 15m',
        accuracy: 95.2,
        size: 38.2,
        createdAt: '2024-10-20',
        updatedAt: '2024-11-07',
        usage: {
            totalGenerations: 890,
            totalDuration: 2400,
            lastUsed: '2024-11-07'
        },
        settings: {
            pitch: 5,
            speed: 1.1,
            emotion: 'happy',
            emphasis: 60
        }
    },
    {
        id: '3',
        name: 'Multilingual Indian Voice',
        description: 'Versatile voice supporting Hindi and English with Indian accent',
        type: 'neural',
        language: 'Hindi/English',
        accent: 'Indian',
        gender: 'female',
        age: 'adult',
        quality: 'premium',
        status: 'training',
        trainingProgress: 75,
        audioSamples: 1200,
        trainingDuration: '2h 45m',
        accuracy: 92.1,
        size: 31.8,
        createdAt: '2024-11-01',
        updatedAt: '2024-11-08',
        usage: {
            totalGenerations: 156,
            totalDuration: 480,
            lastUsed: '2024-11-05'
        },
        settings: {
            pitch: -2,
            speed: 0.9,
            emotion: 'calm',
            emphasis: 45
        }
    }
];

const VoiceCloning: React.FC = () => {
    const [models, setModels] = useState<VoiceModel[]>(mockModels);
    const [generations, setGenerations] = useState<VoiceGeneration[]>([]);
    const [stats, setStats] = useState<VoiceStats>({
        totalModels: 0,
        activeModels: 0,
        totalGenerations: 0,
        totalDuration: 0,
        totalCost: 0,
        avgQuality: 0
    });

    const [selectedModel, setSelectedModel] = useState<VoiceModel | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [generationText, setGenerationText] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        loadVoiceModels();
    }, []);

    const loadVoiceModels = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setModels(mockModels);

            // Calculate stats
            const totalModels = mockModels.length;
            const activeModels = mockModels.filter(m => m.status === 'ready').length;
            const totalGenerations = mockModels.reduce((sum, m) => sum + m.usage.totalGenerations, 0);
            const totalDuration = mockModels.reduce((sum, m) => sum + m.usage.totalDuration, 0);
            const avgQuality = mockModels.reduce((sum, m) => sum + m.accuracy, 0) / totalModels;

            setStats({
                totalModels,
                activeModels,
                totalGenerations,
                totalDuration,
                totalCost: totalGenerations * 0.02, // Estimate $0.02 per generation
                avgQuality
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load voice models",
                variant: "destructive",
            });
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                // Handle the recorded audio blob
                toast({
                    title: "Recording Complete",
                    description: "Voice sample recorded successfully",
                });
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start recording. Please check microphone permissions.",
                variant: "destructive",
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);

            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const playAudio = (audioUrl: string) => {
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
            setIsPlaying(false);
        }

        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        setIsPlaying(true);

        audio.onended = () => {
            setIsPlaying(false);
            setCurrentAudio(null);
        };

        audio.play();
    };

    const stopAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
            setIsPlaying(false);
        }
    };

    const generateVoice = async (text: string, modelId: string) => {
        try {
            setIsTraining(true);
            // Simulate voice generation
            await new Promise(resolve => setTimeout(resolve, 3000));

            const newGeneration: VoiceGeneration = {
                id: Date.now().toString(),
                modelId,
                text,
                audioUrl: '/api/placeholder-audio', // This would be a real audio URL
                duration: text.length * 0.1, // Rough estimate
                status: 'completed',
                settings: selectedModel?.settings || {},
                createdAt: new Date().toISOString(),
                metadata: {
                    wordCount: text.split(' ').length,
                    charactersCount: text.length,
                    estimatedCost: text.length * 0.0001
                }
            };

            setGenerations(prev => [newGeneration, ...prev]);
            toast({
                title: "Voice Generated",
                description: "Voice synthesis completed successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate voice",
                variant: "destructive",
            });
        } finally {
            setIsTraining(false);
        }
    };

    const handleTrainModel = async () => {
        try {
            setIsTraining(true);
            // Simulate model training
            await new Promise(resolve => setTimeout(resolve, 5000));

            toast({
                title: "Training Started",
                description: "Model training has been initiated. This may take several hours.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start model training",
                variant: "destructive",
            });
        } finally {
            setIsTraining(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'training': return <Activity className="h-4 w-4 text-yellow-500 animate-spin" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'archived': return <Layers className="h-4 w-4 text-gray-500" />;
            default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'ultra': return 'text-purple-600';
            case 'premium': return 'text-blue-600';
            case 'standard': return 'text-green-600';
            case 'basic': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const filteredModels = models.filter(model => {
        const matchesType = filterType === 'all' || model.type === filterType;
        const matchesStatus = filterStatus === 'all' || model.status === filterStatus;
        return matchesType && matchesStatus;
    });

    return (
        <ManagementLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Voice Cloning Studio</h1>
                        <p className="text-gray-600 mt-2">
                            Create, train, and manage AI-powered voice models for your IVR systems
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => loadVoiceModels()}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Voice Model
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                            <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalModels}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.activeModels}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Generations</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalGenerations.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgQuality.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="models" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="models">Voice Models</TabsTrigger>
                        <TabsTrigger value="generate">Generate Voice</TabsTrigger>
                        <TabsTrigger value="studio">Recording Studio</TabsTrigger>
                    </TabsList>

                    {/* Voice Models Tab */}
                    <TabsContent value="models" className="space-y-4">
                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Filters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="neural">Neural</SelectItem>
                                            <SelectItem value="concatenative">Concatenative</SelectItem>
                                            <SelectItem value="parametric">Parametric</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="ready">Ready</SelectItem>
                                            <SelectItem value="training">Training</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Models Grid */}
                        <div className="grid gap-4">
                            {filteredModels.map((model) => (
                                <Card key={model.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold">{model.name}</h3>
                                                        <Badge variant="outline">
                                                            {getStatusIcon(model.status)}
                                                            <span className="ml-1 capitalize">{model.status}</span>
                                                        </Badge>
                                                        <Badge variant="secondary" className={getQualityColor(model.quality)}>
                                                            {model.quality.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-gray-600 mb-4">{model.description}</p>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Language</p>
                                                            <p className="font-medium">{model.language}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Accuracy</p>
                                                            <p className="font-medium">{model.accuracy}%</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Samples</p>
                                                            <p className="font-medium">{model.audioSamples}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Size</p>
                                                            <p className="font-medium">{model.size}MB</p>
                                                        </div>
                                                    </div>

                                                    {model.status === 'training' && (
                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span>Training Progress</span>
                                                                <span>{model.trainingProgress}%</span>
                                                            </div>
                                                            <Progress value={model.trainingProgress} className="w-full" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedModel(model)}
                                                    disabled={model.status !== 'ready'}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={model.status !== 'ready'}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={model.status !== 'ready'}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Generate Voice Tab */}
                    <TabsContent value="generate" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Text to Speech Generation</CardTitle>
                                    <CardDescription>
                                        Convert text to natural-sounding speech using your trained voice models
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="voice-model">Select Voice Model</Label>
                                        <Select onValueChange={(value) => setSelectedModel(models.find(m => m.id === value) || null)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a voice model" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {models.filter(m => m.status === 'ready').map((model) => (
                                                    <SelectItem key={model.id} value={model.id}>
                                                        {model.name} ({model.language})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="generation-text">Text to Generate</Label>
                                        <Textarea
                                            id="generation-text"
                                            placeholder="Enter the text you want to convert to speech..."
                                            value={generationText}
                                            onChange={(e) => setGenerationText(e.target.value)}
                                            rows={6}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {generationText.length} characters, {generationText.split(' ').length} words
                                        </p>
                                    </div>

                                    {selectedModel && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                                            <h4 className="font-medium">Voice Settings</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Pitch: {selectedModel.settings.pitch}</Label>
                                                    <Slider
                                                        value={[selectedModel.settings.pitch]}
                                                        min={-10}
                                                        max={10}
                                                        step={1}
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Speed: {selectedModel.settings.speed}x</Label>
                                                    <Slider
                                                        value={[selectedModel.settings.speed]}
                                                        min={0.5}
                                                        max={2.0}
                                                        step={0.1}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full"
                                        onClick={() => generateVoice(generationText, selectedModel?.id || '')}
                                        disabled={!selectedModel || !generationText.trim() || isTraining}
                                    >
                                        {isTraining ? (
                                            <>
                                                <Activity className="mr-2 h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Activity className="mr-2 h-4 w-4" />
                                                Generate Voice
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Generations</CardTitle>
                                    <CardDescription>
                                        Your recently generated voice samples
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-80">
                                        <div className="space-y-4">
                                            {generations.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    <p>No generations yet</p>
                                                    <p className="text-sm">Generate your first voice sample to get started</p>
                                                </div>
                                            ) : (
                                                generations.map((generation) => (
                                                    <div key={generation.id} className="p-4 border rounded-lg space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium truncate flex-1 mr-2">
                                                                {generation.text.substring(0, 50)}...
                                                            </p>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => playAudio(generation.audioUrl)}
                                                                >
                                                                    <Play className="h-3 w-3" />
                                                                </Button>
                                                                <Button size="sm" variant="outline">
                                                                    <Download className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-gray-500">
                                                            <span>{generation.metadata.wordCount} words</span>
                                                            <span>{generation.duration.toFixed(1)}s</span>
                                                            <span>${generation.metadata.estimatedCost.toFixed(4)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Recording Studio Tab */}
                    <TabsContent value="studio" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Voice Recording Studio</CardTitle>
                                    <CardDescription>
                                        Record voice samples to train new models or improve existing ones
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Recording Controls */}
                                    <div className="text-center space-y-4">
                                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                                            <Mic className={`h-12 w-12 text-white ${isRecording ? 'animate-pulse' : ''}`} />
                                        </div>

                                        <div>
                                            {isRecording ? (
                                                <div className="space-y-2">
                                                    <p className="text-lg font-medium text-red-600">Recording...</p>
                                                    <p className="text-2xl font-bold">{Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</p>
                                                </div>
                                            ) : (
                                                <p className="text-lg font-medium">Ready to record</p>
                                            )}
                                        </div>

                                        <div className="flex gap-4 justify-center">
                                            {!isRecording ? (
                                                <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600">
                                                    <Mic className="mr-2 h-4 w-4" />
                                                    Start Recording
                                                </Button>
                                            ) : (
                                                <Button onClick={stopRecording} variant="outline">
                                                    <Pause className="mr-2 h-4 w-4" />
                                                    Stop Recording
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recording Guidelines */}
                                    <Alert>
                                        <Volume2 className="h-4 w-4" />
                                        <AlertTitle>Recording Tips</AlertTitle>
                                        <AlertDescription className="mt-2 space-y-2">
                                            <p>• Use a quiet environment with minimal background noise</p>
                                            <p>• Speak clearly and at a consistent pace</p>
                                            <p>• Record at least 10 minutes of varied content</p>
                                            <p>• Include different emotions and tones</p>
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Training Data Management</CardTitle>
                                    <CardDescription>
                                        Upload and manage voice samples for model training
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium mb-2">Upload Audio Files</p>
                                        <p className="text-gray-500 mb-4">
                                            Drag and drop audio files or click to browse
                                        </p>
                                        <Button variant="outline">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Choose Files
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Supported formats</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {['MP3', 'WAV', 'FLAC', 'M4A'].map((format) => (
                                                <Badge key={format} variant="secondary">{format}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleTrainModel}
                                        disabled={isTraining}
                                    >
                                        {isTraining ? (
                                            <>
                                                <Activity className="mr-2 h-4 w-4 animate-spin" />
                                                Training Model...
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="mr-2 h-4 w-4" />
                                                Start Training New Model
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* New Model Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Voice Model</DialogTitle>
                            <DialogDescription>
                                Configure and train a new AI voice model for your applications
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="model-name">Model Name</Label>
                                    <Input id="model-name" placeholder="Enter model name" />
                                </div>
                                <div>
                                    <Label htmlFor="model-type">Model Type</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="neural">Neural (Recommended)</SelectItem>
                                            <SelectItem value="concatenative">Concatenative</SelectItem>
                                            <SelectItem value="parametric">Parametric</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="language">Language</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="hindi">Hindi</SelectItem>
                                            <SelectItem value="spanish">Spanish</SelectItem>
                                            <SelectItem value="french">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="accent">Accent</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select accent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="american">American</SelectItem>
                                            <SelectItem value="british">British</SelectItem>
                                            <SelectItem value="indian">Indian</SelectItem>
                                            <SelectItem value="australian">Australian</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Describe the voice characteristics and intended use..." />
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsDialogOpen(false)}>
                                <Brain className="mr-2 h-4 w-4" />
                                Create Model
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ManagementLayout>
    );
};

export default VoiceCloning;
