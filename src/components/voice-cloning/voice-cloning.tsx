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
import { api } from '@/lib/api-client';
import { useMockData } from '@/hooks/use-mock-data';
import { useTTS } from '@/lib/tts/hooks/useTTS';

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

function VoiceCloning() {
    const { isDemoMode } = useMockData();
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
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [generationText, setGenerationText] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Enterprise TTS integration
    const {
        synthesize,
        voices,
        loading: ttsLoading,
        isPlaying,
        audioUrl,
        play,
        stop,
        download,
        error: ttsError,
        providerStatus,
        selectedVoice,
        setSelectedVoice
    } = useTTS();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        loadVoiceModels();
    }, [isDemoMode]);

    const loadVoiceModels = async () => {
        try {
            if (isDemoMode) {
                // Use mock data in demo mode
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
            } else {
                // Use real API calls
                const response = await api.getVoiceProfiles();
                if (response.success && response.data?.profiles) {
                    const profiles = response.data.profiles;
                    setModels(profiles);

                    // Calculate stats from real data
                    const totalModels = profiles.length;
                    const activeModels = profiles.filter((m: any) => m.isActive).length;

                    setStats({
                        totalModels,
                        activeModels,
                        totalGenerations: 0, // Would come from usage data
                        totalDuration: 0,    // Would come from usage data
                        totalCost: 0,        // Would come from billing data
                        avgQuality: 0        // Would come from performance data
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load voice models:', error);
            toast({
                title: "Error",
                description: "Failed to load voice models",
                variant: "destructive",
            });
            // Fallback to mock data on error
            setModels(mockModels);
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

    const playAudio = (url: string) => {
        // Use the TTS hook's play function for better audio management
        play(url);
    };

    const stopAudio = () => {
        // Use the TTS hook's stop function
        stop();
    };

    const generateVoice = async (text: string, modelId: string) => {
        if (!text.trim()) {
            toast({
                title: "Error",
                description: "Please enter text to synthesize",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsTraining(true);

            // Use the enterprise TTS backend
            const result = await synthesize(text, {
                voiceId: selectedVoice?.voice_id || undefined,
                languageCode: selectedModel?.language?.toLowerCase()?.includes('hindi') ? 'hi-IN' : 'en-US',
                speed: selectedModel?.settings?.speed || 1.0,
                pitch: selectedModel?.settings?.pitch || 0,
                emotion: selectedModel?.settings?.emotion || 'neutral'
            });

            if (result) {
                const newGeneration: VoiceGeneration = {
                    id: Date.now().toString(),
                    modelId,
                    text,
                    audioUrl: result.audio_url || '',
                    duration: result.duration || text.length * 0.1,
                    status: 'completed',
                    settings: selectedModel?.settings || {},
                    createdAt: new Date().toISOString(),
                    metadata: {
                        wordCount: text.split(' ').length,
                        charactersCount: text.length,
                        estimatedCost: result.cost || text.length * 0.0001
                    }
                };

                setGenerations(prev => [newGeneration, ...prev]);
                toast({
                    title: "Voice Generated",
                    description: `Speech synthesized using ${result.provider || 'TTS service'}`,
                });
            }
        } catch (error) {
            console.error('Voice generation failed:', error);
            toast({
                title: "Error",
                description: ttsError || "Failed to generate voice. Check if backend is running.",
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

    // return (
    //     <div className="space-y-6">
    //         {/* Header */}
    //         <div className="flex items-center justify-between">
    //             <div>
    //                 <h1 className="text-3xl font-bold">Voice Cloning Studio</h1>
    //                 <p className="text-gray-600 mt-2">
    //                     Create, train, and manage AI-powered voice models for your IVR systems
    //                 </p>
    //             </div>
    //             <div className="flex gap-3">
    //                 <Button variant="outline" onClick={() => loadVoiceModels()}>
    //                     <RotateCcw className="mr-2 h-4 w-4" />
    //                     Refresh
    //                 </Button>
    //                 <Button onClick={() => setIsDialogOpen(true)}>
    //                     <Plus className="mr-2 h-4 w-4" />
    //                     New Voice Model
    //                 </Button>
    //             </div>
    //         </div>
    //     </div>
    // );
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalModels}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.activeModels}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently in use
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Generations</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGenerations.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.floor(stats.totalDuration / 3600)}h {Math.floor((stats.totalDuration % 3600) / 60)}m</div>
                        <p className="text-xs text-muted-foreground">
                            Generated audio
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgQuality.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Accuracy score
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Voice Models Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Voice Models</CardTitle>
                            <CardDescription>
                                Manage your AI voice models and their training status
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="neural">Neural</SelectItem>
                                    <SelectItem value="concatenative">Concatenative</SelectItem>
                                    <SelectItem value="parametric">Parametric</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="training">Training</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Voice Model
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {models
                            .filter(model => filterType === 'all' || model.type === filterType)
                            .filter(model => filterStatus === 'all' || model.status === filterStatus)
                            .map((model) => (
                                <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${model.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                                            }`}>
                                            {model.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{model.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {model.type}
                                                </Badge>
                                                <Badge variant="outline" className={`text-xs ${model.status === 'ready' ? 'text-green-600' :
                                                    model.status === 'training' ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {model.status}
                                                </Badge>
                                                <span className="text-xs text-gray-500">•</span>
                                                <span className="text-xs text-gray-600">{model.language}</span>
                                                <span className="text-xs text-gray-500">•</span>
                                                <span className={`text-xs font-medium ${model.quality === 'ultra' ? 'text-purple-600' :
                                                    model.quality === 'premium' ? 'text-blue-600' : 'text-gray-600'
                                                    }`}>
                                                    {model.quality}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">{model.usage.totalGenerations}</div>
                                            <div className="text-xs text-gray-500">Uses</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedModel(model)}
                                                className="h-8 w-8 p-0"
                                                title="Test Voice"
                                            >
                                                <Play className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedModel(model)}
                                                className="h-8 w-8 p-0"
                                                title="Edit Model"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setModels(models.filter(m => m.id !== model.id));
                                                    toast({
                                                        title: "Model Deleted",
                                                        description: `${model.name} has been removed.`,
                                                    });
                                                }}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                title="Delete Model"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

            {/* Voice Generation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New Voice Model</DialogTitle>
                        <DialogDescription>
                            Create a new AI voice model by uploading sample audio or selecting from templates.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload">Upload Audio</TabsTrigger>
                                <TabsTrigger value="template">Use Template</TabsTrigger>
                            </TabsList>

                            <TabsContent value="upload" className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="model-name">Model Name</Label>
                                        <Input
                                            id="model-name"
                                            placeholder="Enter model name"
                                            value={generationText}
                                            onChange={(e) => setGenerationText(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="model-type">Voice Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select voice type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="neutral">Neutral</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="model-language">Language</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                                <SelectItem value="de">German</SelectItem>
                                                <SelectItem value="it">Italian</SelectItem>
                                                <SelectItem value="pt">Portuguese</SelectItem>
                                                <SelectItem value="ru">Russian</SelectItem>
                                                <SelectItem value="ja">Japanese</SelectItem>
                                                <SelectItem value="ko">Korean</SelectItem>
                                                <SelectItem value="zh">Chinese</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="audio-upload">Sample Audio</Label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <label htmlFor="audio-upload" className="cursor-pointer">
                                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                                        Upload audio file
                                                    </span>
                                                    <span className="mt-1 block text-xs text-gray-500">
                                                        MP3, WAV, FLAC up to 50MB
                                                    </span>
                                                </label>
                                                <input
                                                    id="audio-upload"
                                                    name="audio-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="audio/*"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="template" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: '1', name: 'Professional Male', type: 'male', language: 'English' },
                                        { id: '2', name: 'Friendly Female', type: 'female', language: 'English' },
                                        { id: '3', name: 'Calm Assistant', type: 'neutral', language: 'English' }
                                    ].map((template) => (
                                        <Card
                                            key={template.id}
                                            className={`cursor-pointer transition-all hover:shadow-md`}
                                            onClick={() => setSelectedModel(template as any)}
                                        >
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm">{template.name}</CardTitle>
                                                <CardDescription className="text-xs">{template.language} voice template</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">{template.type}</Badge>
                                                    <Badge variant="outline" className="text-xs">{template.language}</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            setIsDialogOpen(false);
                            toast({
                                title: "Model Created",
                                description: "New voice model has been created successfully.",
                            });
                        }}>
                            Create Model
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default VoiceCloning;
