'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import {
    Volume2,
    Play,
    Pause,
    RotateCcw,
    Download,
    Upload,
    Settings,
    Mic,
    Speaker,
    Zap,
    Globe,
    Star,
    Clock,
    CheckCircle,
    AlertTriangle,
    Save,
    FileText,
    Headphones,
    Radio as Waveform,
    Gauge,
    Timer,
    BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceModel {
    id: string;
    name: string;
    language: string;
    gender: 'male' | 'female' | 'neutral';
    provider: string;
    quality: 'basic' | 'standard' | 'premium' | 'ultra';
    sampleRate: number;
    latency: number;
}

interface SynthesisJob {
    id: string;
    text: string;
    voiceModel: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    audioUrl?: string;
    duration?: number;
    createdAt: string;
    parameters: {
        speed: number;
        pitch: number;
        volume: number;
        emotion?: string;
        style?: string;
    };
}

export default function SpeechSynthesizerPage() {
    const [voiceModels] = useState<VoiceModel[]>([
        {
            id: 'azure-ml-female',
            name: 'Azure Malayalam Female',
            language: 'ml',
            gender: 'female',
            provider: 'Azure',
            quality: 'premium',
            sampleRate: 24000,
            latency: 0.8
        },
        {
            id: 'elevenlabs-en-male',
            name: 'ElevenLabs English Male',
            language: 'en',
            gender: 'male',
            provider: 'ElevenLabs',
            quality: 'ultra',
            sampleRate: 22050,
            latency: 1.2
        },
        {
            id: 'google-hi-female',
            name: 'Google Hindi Female',
            language: 'hi',
            gender: 'female',
            provider: 'Google',
            quality: 'standard',
            sampleRate: 24000,
            latency: 0.9
        }
    ]);

    const [synthesisJobs, setSynthesisJobs] = useState<SynthesisJob[]>([]);
    const [currentJob, setCurrentJob] = useState<SynthesisJob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [formData, setFormData] = useState({
        text: '',
        voiceModel: '',
        speed: [1.0],
        pitch: [0],
        volume: [1.0],
        emotion: 'neutral',
        style: 'professional',
        outputFormat: 'mp3',
        language: 'ml'
    });

    const [selectedTab, setSelectedTab] = useState('synthesizer');

    const emotions = [
        { value: 'neutral', label: 'Neutral' },
        { value: 'happy', label: 'Happy' },
        { value: 'sad', label: 'Sad' },
        { value: 'angry', label: 'Angry' },
        { value: 'excited', label: 'Excited' },
        { value: 'calm', label: 'Calm' }
    ];

    const styles = [
        { value: 'professional', label: 'Professional' },
        { value: 'casual', label: 'Casual' },
        { value: 'formal', label: 'Formal' },
        { value: 'friendly', label: 'Friendly' },
        { value: 'authoritative', label: 'Authoritative' }
    ];

    const getAvailableVoices = () => {
        return voiceModels.filter(model => model.language === formData.language);
    };

    const handleSynthesize = async () => {
        if (!formData.text.trim() || !formData.voiceModel) {
            toast({
                title: "Validation Error",
                description: "Please enter text and select a voice model.",
                variant: "destructive"
            });
            return;
        }

        const job: SynthesisJob = {
            id: `synth-${Date.now()}`,
            text: formData.text,
            voiceModel: formData.voiceModel,
            status: 'queued',
            progress: 0,
            createdAt: new Date().toISOString(),
            parameters: {
                speed: formData.speed[0],
                pitch: formData.pitch[0],
                volume: formData.volume[0],
                emotion: formData.emotion,
                style: formData.style
            }
        };

        setSynthesisJobs([job, ...synthesisJobs]);
        setCurrentJob(job);

        // Simulate synthesis process
        setTimeout(() => {
            setSynthesisJobs(jobs =>
                jobs.map(j =>
                    j.id === job.id
                        ? { ...j, status: 'processing' as const, progress: 25 }
                        : j
                )
            );
        }, 1000);

        setTimeout(() => {
            setSynthesisJobs(jobs =>
                jobs.map(j =>
                    j.id === job.id
                        ? {
                            ...j,
                            status: 'completed' as const,
                            progress: 100,
                            audioUrl: `https://example.com/audio/${job.id}.mp3`,
                            duration: Math.ceil(formData.text.length / 150) // Rough estimate
                        }
                        : j
                )
            );
            setCurrentJob(prev => prev ? { ...prev, status: 'completed', progress: 100, audioUrl: `https://example.com/audio/${job.id}.mp3`, duration: Math.ceil(formData.text.length / 150) } : null);

            toast({
                title: "Synthesis Complete",
                description: "Your speech has been generated successfully.",
            });
        }, 3000);
    };

    const handlePlay = (job: SynthesisJob) => {
        if (job.audioUrl && audioRef.current) {
            audioRef.current.src = job.audioUrl;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleDownload = (job: SynthesisJob) => {
        if (job.audioUrl) {
            const link = document.createElement('a');
            link.href = job.audioUrl;
            link.download = `synthesis-${job.id}.${formData.outputFormat}`;
            link.click();

            toast({
                title: "Download Started",
                description: "Your audio file is being downloaded.",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'queued': return 'bg-blue-100 text-blue-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Speaker className="h-8 w-8 text-blue-600" />
                            Speech Synthesizer
                        </h1>
                        <p className="text-muted-foreground">
                            Advanced text-to-speech synthesis with multiple voices and customization options
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                        <Button size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="synthesizer">Synthesizer</TabsTrigger>
                        <TabsTrigger value="batch">Batch Processing</TabsTrigger>
                        <TabsTrigger value="history">Synthesis History</TabsTrigger>
                        <TabsTrigger value="voices">Voice Library</TabsTrigger>
                    </TabsList>

                    <TabsContent value="synthesizer" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Input Panel */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Text Input</CardTitle>
                                        <CardDescription>
                                            Enter the text you want to convert to speech
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Textarea
                                            value={formData.text}
                                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                            placeholder="Enter your text here... Supports multiple languages and special characters."
                                            rows={8}
                                            className="resize-none"
                                        />
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{formData.text.length} characters</span>
                                            <span>Estimated duration: ~{Math.ceil(formData.text.length / 150)}s</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Voice Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Voice Selection</CardTitle>
                                        <CardDescription>
                                            Choose language and voice model
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="language">Language</Label>
                                                <Select
                                                    value={formData.language}
                                                    onValueChange={(value) => setFormData({ ...formData, language: value, voiceModel: '' })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ml">Malayalam</SelectItem>
                                                        <SelectItem value="en">English</SelectItem>
                                                        <SelectItem value="hi">Hindi</SelectItem>
                                                        <SelectItem value="ta">Tamil</SelectItem>
                                                        <SelectItem value="te">Telugu</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="voiceModel">Voice Model</Label>
                                                <Select
                                                    value={formData.voiceModel}
                                                    onValueChange={(value) => setFormData({ ...formData, voiceModel: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select voice" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableVoices().map((voice) => (
                                                            <SelectItem key={voice.id} value={voice.id}>
                                                                {voice.name} ({voice.quality})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Voice Parameters */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Voice Parameters</CardTitle>
                                        <CardDescription>
                                            Fine-tune the speech characteristics
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <Label>Speed: {formData.speed[0].toFixed(1)}x</Label>
                                                <Slider
                                                    value={formData.speed}
                                                    onValueChange={(value) => setFormData({ ...formData, speed: value })}
                                                    min={0.5}
                                                    max={2.0}
                                                    step={0.1}
                                                    className="mt-2"
                                                />
                                            </div>
                                            <div>
                                                <Label>Pitch: {formData.pitch[0] > 0 ? '+' : ''}{formData.pitch[0]}</Label>
                                                <Slider
                                                    value={formData.pitch}
                                                    onValueChange={(value) => setFormData({ ...formData, pitch: value })}
                                                    min={-12}
                                                    max={12}
                                                    step={1}
                                                    className="mt-2"
                                                />
                                            </div>
                                            <div>
                                                <Label>Volume: {Math.round(formData.volume[0] * 100)}%</Label>
                                                <Slider
                                                    value={formData.volume}
                                                    onValueChange={(value) => setFormData({ ...formData, volume: value })}
                                                    min={0.1}
                                                    max={2.0}
                                                    step={0.1}
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="emotion">Emotion</Label>
                                                <Select
                                                    value={formData.emotion}
                                                    onValueChange={(value) => setFormData({ ...formData, emotion: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {emotions.map((emotion) => (
                                                            <SelectItem key={emotion.value} value={emotion.value}>
                                                                {emotion.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="style">Style</Label>
                                                <Select
                                                    value={formData.style}
                                                    onValueChange={(value) => setFormData({ ...formData, style: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {styles.map((style) => (
                                                            <SelectItem key={style.value} value={style.value}>
                                                                {style.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="outputFormat">Output Format</Label>
                                            <Select
                                                value={formData.outputFormat}
                                                onValueChange={(value) => setFormData({ ...formData, outputFormat: value })}
                                            >
                                                <SelectTrigger className="w-48">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mp3">MP3</SelectItem>
                                                    <SelectItem value="wav">WAV</SelectItem>
                                                    <SelectItem value="ogg">OGG</SelectItem>
                                                    <SelectItem value="flac">FLAC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Generate Button */}
                                <div className="flex justify-center">
                                    <Button
                                        size="lg"
                                        onClick={handleSynthesize}
                                        disabled={!formData.text.trim() || !formData.voiceModel || currentJob?.status === 'processing'}
                                        className="px-8"
                                    >
                                        <Zap className="h-5 w-5 mr-2" />
                                        Generate Speech
                                    </Button>
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preview & Playback</CardTitle>
                                        <CardDescription>
                                            Listen to your generated speech
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {currentJob ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Badge className={getStatusColor(currentJob.status)}>
                                                        {currentJob.status}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {currentJob.progress}%
                                                    </span>
                                                </div>

                                                {currentJob.status === 'processing' && (
                                                    <Progress value={currentJob.progress} className="w-full" />
                                                )}

                                                {currentJob.status === 'completed' && currentJob.audioUrl && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handlePlay(currentJob)}
                                                                disabled={isPlaying}
                                                            >
                                                                <Play className="h-4 w-4 mr-1" />
                                                                Play
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handlePause}
                                                                disabled={!isPlaying}
                                                            >
                                                                <Pause className="h-4 w-4 mr-1" />
                                                                Pause
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDownload(currentJob)}
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                Download
                                                            </Button>
                                                        </div>

                                                        {currentJob.duration && (
                                                            <div className="text-sm text-muted-foreground">
                                                                Duration: {currentJob.duration}s
                                                            </div>
                                                        )}

                                                        <audio
                                                            ref={audioRef}
                                                            onEnded={() => setIsPlaying(false)}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Waveform className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">
                                                    Generate speech to preview here
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Voice Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Voice Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {formData.voiceModel && (
                                            <div>
                                                {(() => {
                                                    const voice = voiceModels.find(v => v.id === formData.voiceModel);
                                                    return voice ? (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm">Quality:</span>
                                                                <Badge variant="outline">{voice.quality}</Badge>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm">Latency:</span>
                                                                <span className="text-sm">{voice.latency}s</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm">Sample Rate:</span>
                                                                <span className="text-sm">{voice.sampleRate}Hz</span>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="batch">
                        <Card>
                            <CardHeader>
                                <CardTitle>Batch Processing</CardTitle>
                                <CardDescription>
                                    Process multiple text files for bulk speech synthesis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Batch Processing</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Upload CSV or JSON files for bulk speech synthesis
                                    </p>
                                    <Button>Upload Files</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history">
                        <Card>
                            <CardHeader>
                                <CardTitle>Synthesis History</CardTitle>
                                <CardDescription>
                                    View and manage your previous speech synthesis jobs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {synthesisJobs.map((job) => (
                                        <Card key={job.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-medium truncate max-w-md">
                                                            {job.text.substring(0, 50)}...
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(job.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Badge className={getStatusColor(job.status)}>
                                                        {job.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {job.status === 'completed' && job.audioUrl && (
                                                        <>
                                                            <Button size="sm" onClick={() => handlePlay(job)}>
                                                                <Play className="h-4 w-4 mr-1" />
                                                                Play
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => handleDownload(job)}>
                                                                <Download className="h-4 w-4 mr-1" />
                                                                Download
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button size="sm" variant="outline">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Details
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {synthesisJobs.length === 0 && (
                                        <div className="text-center py-12">
                                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-medium mb-2">No Synthesis History</h3>
                                            <p className="text-muted-foreground">
                                                Your generated speech files will appear here
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="voices">
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Library</CardTitle>
                                <CardDescription>
                                    Browse and manage available voice models
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {voiceModels.map((voice) => (
                                        <Card key={voice.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Headphones className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{voice.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {voice.provider} • {voice.language.toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Quality:</span>
                                                        <Badge variant="outline">{voice.quality}</Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Gender:</span>
                                                        <span className="capitalize">{voice.gender}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Latency:</span>
                                                        <span>{voice.latency}s</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Sample Rate:</span>
                                                        <span>{voice.sampleRate}Hz</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    className="w-full mt-4"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setFormData({ ...formData, voiceModel: voice.id, language: voice.language });
                                                        setSelectedTab('synthesizer');
                                                    }}
                                                >
                                                    Use This Voice
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ManagementLayout>
    );
}