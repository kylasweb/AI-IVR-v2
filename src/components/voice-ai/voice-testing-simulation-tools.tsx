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
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
    Play,
    Play as Pause,
    XCircle as Stop,
    Volume2,
    Volume2 as VolumeX,
    Download,
    Upload,
    RefreshCw,
    Settings,
    Mic,
    MicOff,
    BarChart3,
    LineChart,
    PieChart,
    Target,
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    Clock,
    User,
    Brain,
    Zap,
    Star,
    CheckCircle as Award,
    TrendingUp,
    TrendingUp as TrendingDown,
    Eye,
    EyeOff,
    Copy,
    Upload as Share2,
    Mic as FileAudio,
    Activity as Waveform,
    Activity,
    Mic as Headphones,
    Volume2 as Volume1,
    RotateCcw,
    Plus,
    Settings as Minus,
    Settings as Edit,
    Save,
    X,
    Filter,
    Search,
    ChevronDown,
    ChevronRight as ChevronUp,
    MoreHorizontal,
    Layers,
    Globe,
    Globe as Languages,
    CheckCircle as Sparkles,
    Zap as Flame,
    Shield,
    Activity as Gauge,
    Settings as Cpu,
    Settings as Monitor,
    Database,
    Settings as Server,
    CheckCircle as Wifi,
    CheckCircle as Signal,
    Clock as Calendar,
    Clock as History,
    Clock as Timer,
    Maximize2,
    Minimize2,
    Settings as Hash,
    Users,
    MessageSquare,
    FileText,
    Settings as Image,
    Settings as Video,
    Settings as Folder,
    Settings as FolderOpen,
    ArrowRight,
    ArrowLeft,
    ArrowRight as ArrowUp,
    ArrowLeft as ArrowDown,
    ArrowLeft as ChevronLeft,
    ChevronRight,
    Play as PlayCircle,
    XCircle as StopCircle,
    ArrowRight as SkipForward,
    ArrowLeft as SkipBack,
    RefreshCw as Repeat,
    RefreshCw as Shuffle,
    Mic as Music,
    Mic as Music2,
    Mic as Radio,
    Mic as Podcast
} from 'lucide-react';

// Voice Testing Interfaces
interface VoiceModel {
    id: string;
    name: string;
    version: string;
    language: string;
    gender: 'male' | 'female' | 'neutral';
    style: string;
    accuracy: number;
    trainingDate: Date;
    status: 'active' | 'training' | 'deprecated' | 'testing';
    sampleRate: number;
    bitDepth: number;
    fileSize: number;
    modelType: 'cloned' | 'synthetic' | 'neural' | 'hybrid';
    characteristics: {
        tone: string;
        pace: string;
        emotion: string;
        clarity: number;
        naturalness: number;
        consistency: number;
    };
}

interface TestScript {
    id: string;
    name: string;
    content: string;
    language: string;
    category: 'greeting' | 'information' | 'support' | 'emergency' | 'custom';
    duration: number;
    complexity: 'simple' | 'medium' | 'complex';
    wordCount: number;
    phonemes: string[];
    emotions: string[];
}

interface VoiceComparison {
    id: string;
    name: string;
    models: string[];
    script: string;
    results: {
        modelId: string;
        audioUrl: string;
        quality: number;
        naturalness: number;
        clarity: number;
        emotionalExpression: number;
        pronunciation: number;
        timing: number;
        overallScore: number;
        generatedAt: Date;
    }[];
    createdAt: Date;
    status: 'running' | 'completed' | 'failed';
}

interface QualityMetrics {
    overall: number;
    clarity: number;
    naturalness: number;
    pronunciation: number;
    emotionalExpression: number;
    consistency: number;
    backgroundNoise: number;
    dynamicRange: number;
    spectralBalance: number;
    timingAccuracy: number;
}

interface BenchmarkResult {
    modelId: string;
    testType: string;
    score: number;
    details: {
        wer: number; // Word Error Rate
        mos: number; // Mean Opinion Score
        latency: number;
        throughput: number;
        memoryUsage: number;
        cpuUsage: number;
    };
    timestamp: Date;
}

// Voice Model Selector Component
const VoiceModelSelector: React.FC<{
    models: VoiceModel[];
    selectedModels: string[];
    onSelectionChange: (modelIds: string[]) => void;
    maxSelection?: number;
}> = ({ models, selectedModels, onSelectionChange, maxSelection = 4 }) => {
    const [filter, setFilter] = useState('');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredModels = models.filter(model => {
        const matchesName = model.name.toLowerCase().includes(filter.toLowerCase());
        const matchesLanguage = languageFilter === 'all' || model.language === languageFilter;
        const matchesStatus = statusFilter === 'all' || model.status === statusFilter;
        return matchesName && matchesLanguage && matchesStatus;
    });

    const languages = [...new Set(models.map(m => m.language))];

    const handleModelToggle = (modelId: string) => {
        if (selectedModels.includes(modelId)) {
            onSelectionChange(selectedModels.filter(id => id !== modelId));
        } else if (selectedModels.length < maxSelection) {
            onSelectionChange([...selectedModels, modelId]);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'training': return 'bg-blue-100 text-blue-800';
            case 'deprecated': return 'bg-gray-100 text-gray-800';
            case 'testing': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Search models..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        {languages.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Selection Counter */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                    {selectedModels.length} / {maxSelection} models selected
                </span>
                {selectedModels.length > 0 && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectionChange([])}
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Models Grid */}
            <ScrollArea className="h-64">
                <div className="grid grid-cols-1 gap-2">
                    {filteredModels.map(model => (
                        <div
                            key={model.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedModels.includes(model.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleModelToggle(model.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">{model.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            v{model.version}
                                        </Badge>
                                        <Badge className={`text-xs ${getStatusColor(model.status)}`}>
                                            {model.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                        <span>{model.language}</span>
                                        <span>{model.gender}</span>
                                        <span>{model.style}</span>
                                        <span>{(model.accuracy * 100).toFixed(1)}% accuracy</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">
                                        {(model.characteristics.naturalness * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-gray-600">naturalness</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

// Script Editor Component
const ScriptEditor: React.FC<{
    scripts: TestScript[];
    selectedScript: string;
    onScriptChange: (scriptId: string) => void;
    onCustomScript: (content: string) => void;
    customScript: string;
}> = ({ scripts, selectedScript, onScriptChange, onCustomScript, customScript }) => {
    const [isCustom, setIsCustom] = useState(false);
    const [editingScript, setEditingScript] = useState('');

    useEffect(() => {
        if (selectedScript === 'custom') {
            setIsCustom(true);
            setEditingScript(customScript);
        } else {
            setIsCustom(false);
            const script = scripts.find(s => s.id === selectedScript);
            setEditingScript(script?.content || '');
        }
    }, [selectedScript, customScript, scripts]);

    const handleScriptSave = () => {
        if (isCustom) {
            onCustomScript(editingScript);
        }
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'simple': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'complex': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const selectedScriptData = scripts.find(s => s.id === selectedScript);

    return (
        <div className="space-y-4">
            {/* Script Selector */}
            <div className="flex gap-2">
                <Select value={selectedScript} onValueChange={onScriptChange}>
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a test script" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="custom">Custom Script</SelectItem>
                        {scripts.map(script => (
                            <SelectItem key={script.id} value={script.id}>
                                {script.name} ({script.category})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isCustom && (
                    <Button onClick={handleScriptSave} size="sm">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                    </Button>
                )}
            </div>

            {/* Script Info */}
            {selectedScriptData && !isCustom && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-600">Category</p>
                        <p className="font-medium capitalize">{selectedScriptData.category}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Complexity</p>
                        <p className={`font-medium capitalize ${getComplexityColor(selectedScriptData.complexity)}`}>
                            {selectedScriptData.complexity}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Word Count</p>
                        <p className="font-medium">{selectedScriptData.wordCount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Est. Duration</p>
                        <p className="font-medium">{selectedScriptData.duration}s</p>
                    </div>
                </div>
            )}

            {/* Script Editor */}
            <div>
                <Label htmlFor="script-content">Script Content</Label>
                <Textarea
                    id="script-content"
                    value={editingScript}
                    onChange={(e) => setEditingScript(e.target.value)}
                    placeholder="Enter your test script here..."
                    className="min-h-32 mt-1"
                    disabled={!isCustom && selectedScript !== 'custom'}
                />
                {editingScript && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span>Words: {editingScript.split(/\s+/).filter(w => w.length > 0).length}</span>
                        <span>Characters: {editingScript.length}</span>
                        <span>Est. Duration: {Math.ceil(editingScript.split(/\s+/).length * 0.6)}s</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Voice Synthesis Player Component
const VoiceSynthesisPlayer: React.FC<{
    audioUrl?: string;
    isLoading: boolean;
    onGenerate: () => void;
    model: VoiceModel | null;
    script: string;
}> = ({ audioUrl, isLoading, onGenerate, model, script }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const handlePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const downloadAudio = () => {
        if (audioUrl) {
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = `${model?.name}_synthesis.wav`;
            a.click();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Headphones className="w-5 h-5" />
                    Voice Synthesis Player
                </CardTitle>
                {model && (
                    <CardDescription>
                        Testing with {model.name} - {model.language} ({model.gender})
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Generate Button */}
                <div className="flex gap-2">
                    <Button
                        onClick={onGenerate}
                        disabled={isLoading || !model || !script.trim()}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <>
                                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Speech
                            </>
                        )}
                    </Button>
                    {audioUrl && (
                        <Button variant="outline" onClick={downloadAudio}>
                            <Download className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Audio Player */}
                {audioUrl && (
                    <>
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={() => setIsPlaying(false)}
                        />

                        <div className="space-y-3">
                            {/* Play Controls */}
                            <div className="flex items-center gap-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handlePlay}
                                    disabled={!audioUrl}
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>

                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-xs text-gray-600 w-10">
                                        {formatTime(currentTime)}
                                    </span>
                                    <Slider
                                        value={[currentTime]}
                                        max={duration || 100}
                                        step={0.1}
                                        onValueChange={handleSeek}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-gray-600 w-10">
                                        {formatTime(duration)}
                                    </span>
                                </div>
                            </div>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsMuted(!isMuted)}
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </Button>
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={(value) => setVolume(value[0])}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Generation Status */}
                {isLoading && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            <span className="font-medium">Generating speech synthesis...</span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                            Processing your script with {model?.name}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Quality Assessment Component
const QualityAssessment: React.FC<{
    metrics: QualityMetrics | null;
    isAnalyzing: boolean;
    onAnalyze: () => void;
}> = ({ metrics, isAnalyzing, onAnalyze }) => {
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 50) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreGrade = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        if (score >= 60) return 'Poor';
        return 'Very Poor';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Quality Assessment
                </CardTitle>
                <CardDescription>
                    Automated analysis of voice synthesis quality
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="w-full"
                >
                    {isAnalyzing ? (
                        <>
                            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analyze Quality
                        </>
                    )}
                </Button>

                {metrics && (
                    <div className="space-y-4">
                        {/* Overall Score */}
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className={`text-3xl font-bold ${getScoreColor(metrics.overall)}`}>
                                {metrics.overall.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">
                                Overall Score - {getScoreGrade(metrics.overall)}
                            </div>
                        </div>

                        {/* Detailed Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(metrics).filter(([key]) => key !== 'overall').map(([key, value]) => (
                                <div key={key} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className={`text-sm font-medium ${getScoreColor(value)}`}>
                                            {value.toFixed(1)}
                                        </span>
                                    </div>
                                    <Progress value={value} className="h-1" />
                                </div>
                            ))}
                        </div>

                        {/* Quality Insights */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Quality Insights</h4>
                            <div className="space-y-1 text-xs">
                                {metrics.clarity >= 85 && (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Excellent clarity and pronunciation</span>
                                    </div>
                                )}
                                {metrics.naturalness >= 80 && (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Natural human-like speech patterns</span>
                                    </div>
                                )}
                                {metrics.backgroundNoise > 20 && (
                                    <div className="flex items-center gap-1 text-yellow-600">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>Some background noise detected</span>
                                    </div>
                                )}
                                {metrics.emotionalExpression < 60 && (
                                    <div className="flex items-center gap-1 text-orange-600">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>Could improve emotional expression</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Voice Comparison Component
const VoiceComparison: React.FC<{
    comparisons: VoiceComparison[];
    models: VoiceModel[];
    onCreateComparison: (modelIds: string[], script: string) => void;
}> = ({ comparisons, models, onCreateComparison }) => {
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [comparisonScript, setComparisonScript] = useState('');
    const [activeComparison, setActiveComparison] = useState<VoiceComparison | null>(null);

    const handleCreateComparison = () => {
        if (selectedModels.length >= 2 && comparisonScript.trim()) {
            onCreateComparison(selectedModels, comparisonScript);
            setSelectedModels([]);
            setComparisonScript('');
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50';
        if (score >= 80) return 'text-blue-600 bg-blue-50';
        if (score >= 70) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="space-y-6">
            {/* Create New Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Create Voice Comparison
                    </CardTitle>
                    <CardDescription>
                        Compare multiple voice models with the same script
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Select Models to Compare (2-4 models)</Label>
                        <VoiceModelSelector
                            models={models}
                            selectedModels={selectedModels}
                            onSelectionChange={setSelectedModels}
                            maxSelection={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="comparison-script">Test Script</Label>
                        <Textarea
                            id="comparison-script"
                            value={comparisonScript}
                            onChange={(e) => setComparisonScript(e.target.value)}
                            placeholder="Enter the script to test with all selected models..."
                            className="min-h-24 mt-1"
                        />
                    </div>

                    <Button
                        onClick={handleCreateComparison}
                        disabled={selectedModels.length < 2 || !comparisonScript.trim()}
                        className="w-full"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Start Comparison Test
                    </Button>
                </CardContent>
            </Card>

            {/* Comparison Results */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Comparison Results</h3>

                {comparisons.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No comparisons created yet</p>
                            <p className="text-sm">Create your first voice comparison above</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {comparisons.map(comparison => (
                            <Card key={comparison.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">{comparison.name}</CardTitle>
                                            <CardDescription>
                                                {comparison.models.length} models • Created {comparison.createdAt.toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={comparison.status === 'completed' ? 'default' : 'secondary'}>
                                            {comparison.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {comparison.status === 'completed' && (
                                        <div className="space-y-4">
                                            {/* Results Grid */}
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                                {comparison.results.map(result => {
                                                    const model = models.find(m => m.id === result.modelId);
                                                    return (
                                                        <div key={result.modelId} className="p-3 border rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium text-sm">{model?.name}</h4>
                                                                <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(result.overallScore)}`}>
                                                                    {result.overallScore.toFixed(1)}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1 text-xs">
                                                                <div className="flex justify-between">
                                                                    <span>Quality:</span>
                                                                    <span>{result.quality.toFixed(1)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Naturalness:</span>
                                                                    <span>{result.naturalness.toFixed(1)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Clarity:</span>
                                                                    <span>{result.clarity.toFixed(1)}</span>
                                                                </div>
                                                            </div>

                                                            <Button size="sm" variant="outline" className="w-full mt-2">
                                                                <Play className="w-3 h-3 mr-1" />
                                                                Play
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Winner */}
                                            {comparison.results.length > 0 && (
                                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center gap-2">
                                                        <Award className="w-4 h-4 text-green-600" />
                                                        <span className="font-medium text-green-800">
                                                            Best Performance: {
                                                                models.find(m => m.id ===
                                                                    comparison.results.reduce((best, current) =>
                                                                        current.overallScore > best.overallScore ? current : best
                                                                    ).modelId
                                                                )?.name
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Performance Benchmarks Component
const PerformanceBenchmarks: React.FC<{
    benchmarks: BenchmarkResult[];
    models: VoiceModel[];
    onRunBenchmark: (modelId: string, testType: string) => void;
}> = ({ benchmarks, models, onRunBenchmark }) => {
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedTest, setSelectedTest] = useState('comprehensive');
    const [isRunning, setIsRunning] = useState(false);

    const testTypes = [
        { id: 'comprehensive', name: 'Comprehensive Test', description: 'Full quality and performance analysis' },
        { id: 'latency', name: 'Latency Test', description: 'Response time measurement' },
        { id: 'throughput', name: 'Throughput Test', description: 'Processing capacity analysis' },
        { id: 'accuracy', name: 'Accuracy Test', description: 'Pronunciation and clarity assessment' },
        { id: 'stress', name: 'Stress Test', description: 'Performance under load' }
    ];

    const handleRunBenchmark = async () => {
        if (selectedModel && selectedTest) {
            setIsRunning(true);
            await onRunBenchmark(selectedModel, selectedTest);
            setIsRunning(false);
        }
    };

    // Group benchmarks by model
    const benchmarksByModel = benchmarks.reduce((acc, benchmark) => {
        if (!acc[benchmark.modelId]) {
            acc[benchmark.modelId] = [];
        }
        acc[benchmark.modelId].push(benchmark);
        return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    const getPerformanceColor = (score: number, type: string) => {
        let threshold;
        switch (type) {
            case 'latency':
                threshold = { excellent: 100, good: 200, fair: 500 }; // ms
                return score <= threshold.excellent ? 'text-green-600' :
                    score <= threshold.good ? 'text-blue-600' :
                        score <= threshold.fair ? 'text-yellow-600' : 'text-red-600';
            case 'wer':
                threshold = { excellent: 2, good: 5, fair: 10 }; // %
                return score <= threshold.excellent ? 'text-green-600' :
                    score <= threshold.good ? 'text-blue-600' :
                        score <= threshold.fair ? 'text-yellow-600' : 'text-red-600';
            default:
                return score >= 90 ? 'text-green-600' :
                    score >= 80 ? 'text-blue-600' :
                        score >= 70 ? 'text-yellow-600' : 'text-red-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Run New Benchmark */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gauge className="w-5 h-5" />
                        Performance Benchmarks
                    </CardTitle>
                    <CardDescription>
                        Comprehensive performance testing and analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <Label>Select Model</Label>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a model to benchmark" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.filter(m => m.status === 'active').map(model => (
                                        <SelectItem key={model.id} value={model.id}>
                                            {model.name} - {model.language}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Test Type</Label>
                            <Select value={selectedTest} onValueChange={setSelectedTest}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {testTypes.map(test => (
                                        <SelectItem key={test.id} value={test.id}>
                                            {test.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                            {testTypes.find(t => t.id === selectedTest)?.description}
                        </p>
                    </div>

                    <Button
                        onClick={handleRunBenchmark}
                        disabled={!selectedModel || !selectedTest || isRunning}
                        className="w-full"
                    >
                        {isRunning ? (
                            <>
                                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                                Running Benchmark...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 mr-2" />
                                Run Benchmark
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Benchmark Results */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Benchmark Results</h3>

                {Object.keys(benchmarksByModel).length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            <Gauge className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No benchmarks run yet</p>
                            <p className="text-sm">Run your first performance benchmark above</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(benchmarksByModel).map(([modelId, modelBenchmarks]) => {
                            const model = models.find(m => m.id === modelId);
                            const latestBenchmark = modelBenchmarks[0]; // Assuming sorted by date

                            return (
                                <Card key={modelId}>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center justify-between">
                                            <span>{model?.name} Performance</span>
                                            <Badge variant="outline">
                                                {modelBenchmarks.length} tests
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getPerformanceColor(latestBenchmark.details.mos, 'score')}`}>
                                                    {latestBenchmark.details.mos.toFixed(1)}
                                                </div>
                                                <div className="text-xs text-gray-600">Mean Opinion Score</div>
                                            </div>

                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getPerformanceColor(latestBenchmark.details.latency, 'latency')}`}>
                                                    {latestBenchmark.details.latency}ms
                                                </div>
                                                <div className="text-xs text-gray-600">Latency</div>
                                            </div>

                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getPerformanceColor(latestBenchmark.details.wer, 'wer')}`}>
                                                    {latestBenchmark.details.wer.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-600">Word Error Rate</div>
                                            </div>

                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getPerformanceColor(latestBenchmark.details.throughput, 'score')}`}>
                                                    {latestBenchmark.details.throughput}
                                                </div>
                                                <div className="text-xs text-gray-600">Throughput (req/s)</div>
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Resource Usage */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Resource Usage</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span>CPU Usage:</span>
                                                    <span className="font-medium">{latestBenchmark.details.cpuUsage}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Memory Usage:</span>
                                                    <span className="font-medium">{latestBenchmark.details.memoryUsage}MB</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Voice Testing & Simulation Tools Component
export default function VoiceTestingSimulationTools() {
    const [models, setModels] = useState<VoiceModel[]>([]);
    const [scripts, setScripts] = useState<TestScript[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedScript, setSelectedScript] = useState<string>('');
    const [customScript, setCustomScript] = useState<string>('');
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [comparisons, setComparisons] = useState<VoiceComparison[]>([]);
    const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([]);
    const [activeTab, setActiveTab] = useState('synthesis');

    useEffect(() => {
        loadTestData();
    }, []);

    const loadTestData = async () => {
        // Mock data - replace with actual API calls
        const mockModels: VoiceModel[] = [
            {
                id: 'model_1',
                name: 'Sarah Professional',
                version: '2.1',
                language: 'English',
                gender: 'female',
                style: 'Professional',
                accuracy: 0.94,
                trainingDate: new Date('2024-01-15'),
                status: 'active',
                sampleRate: 44100,
                bitDepth: 16,
                fileSize: 245,
                modelType: 'neural',
                characteristics: {
                    tone: 'Warm',
                    pace: 'Moderate',
                    emotion: 'Friendly',
                    clarity: 92,
                    naturalness: 89,
                    consistency: 95
                }
            },
            {
                id: 'model_2',
                name: 'Ravi Malayalam',
                version: '1.4',
                language: 'Malayalam',
                gender: 'male',
                style: 'Conversational',
                accuracy: 0.91,
                trainingDate: new Date('2024-02-01'),
                status: 'active',
                sampleRate: 48000,
                bitDepth: 24,
                fileSize: 189,
                modelType: 'cloned',
                characteristics: {
                    tone: 'Authoritative',
                    pace: 'Steady',
                    emotion: 'Neutral',
                    clarity: 87,
                    naturalness: 93,
                    consistency: 88
                }
            },
            {
                id: 'model_3',
                name: 'Emma Customer Service',
                version: '3.0',
                language: 'English',
                gender: 'female',
                style: 'Customer Service',
                accuracy: 0.96,
                trainingDate: new Date('2024-02-10'),
                status: 'active',
                sampleRate: 44100,
                bitDepth: 16,
                fileSize: 312,
                modelType: 'hybrid',
                characteristics: {
                    tone: 'Cheerful',
                    pace: 'Quick',
                    emotion: 'Enthusiastic',
                    clarity: 96,
                    naturalness: 88,
                    consistency: 94
                }
            }
        ];

        const mockScripts: TestScript[] = [
            {
                id: 'script_1',
                name: 'Standard Greeting',
                content: 'Hello! Welcome to our customer service. How may I assist you today?',
                language: 'English',
                category: 'greeting',
                duration: 4,
                complexity: 'simple',
                wordCount: 12,
                phonemes: ['h', 'ɛ', 'l', 'oʊ'],
                emotions: ['friendly', 'welcoming']
            },
            {
                id: 'script_2',
                name: 'Technical Support',
                content: 'Thank you for calling technical support. I understand you are experiencing connectivity issues. Let me help you troubleshoot this problem step by step.',
                language: 'English',
                category: 'support',
                duration: 8,
                complexity: 'medium',
                wordCount: 24,
                phonemes: ['θ', 'æ', 'ŋ', 'k'],
                emotions: ['helpful', 'professional']
            },
            {
                id: 'script_3',
                name: 'Malayalam Welcome',
                content: 'നമസ്കാരം. ഞങ്ങളുടെ സേവനത്തിലേക്ക് സ്വാഗതം. ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാൻ കഴിയും?',
                language: 'Malayalam',
                category: 'greeting',
                duration: 6,
                complexity: 'medium',
                wordCount: 8,
                phonemes: ['n', 'a', 'm', 'a', 's'],
                emotions: ['respectful', 'welcoming']
            }
        ];

        const mockBenchmarks: BenchmarkResult[] = [
            {
                modelId: 'model_1',
                testType: 'comprehensive',
                score: 89.5,
                details: {
                    wer: 2.3,
                    mos: 4.2,
                    latency: 145,
                    throughput: 156,
                    memoryUsage: 342,
                    cpuUsage: 23
                },
                timestamp: new Date()
            }
        ];

        setModels(mockModels);
        setScripts(mockScripts);
        setBenchmarks(mockBenchmarks);
    };

    const handleGenerateSpeech = async () => {
        if (!selectedModel || (!selectedScript && !customScript.trim())) return;

        setIsGenerating(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Mock audio URL - replace with actual generated audio
            setCurrentAudioUrl('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');

            // Mock quality metrics
            setQualityMetrics({
                overall: 87.5,
                clarity: 89.2,
                naturalness: 85.7,
                pronunciation: 91.3,
                emotionalExpression: 83.1,
                consistency: 88.9,
                backgroundNoise: 5.2,
                dynamicRange: 78.4,
                spectralBalance: 82.6,
                timingAccuracy: 90.1
            });
        } catch (error) {
            console.error('Failed to generate speech:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnalyzeQuality = async () => {
        if (!currentAudioUrl) return;

        setIsAnalyzing(true);
        try {
            // Simulate analysis
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update metrics with more detailed analysis
            setQualityMetrics(prev => prev ? {
                ...prev,
                overall: prev.overall + Math.random() * 2 - 1, // Small variation
                clarity: prev.clarity + Math.random() * 2 - 1,
                naturalness: prev.naturalness + Math.random() * 2 - 1
            } : null);
        } catch (error) {
            console.error('Failed to analyze quality:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCreateComparison = async (modelIds: string[], script: string) => {
        const comparison: VoiceComparison = {
            id: `comparison_${Date.now()}`,
            name: `Comparison ${comparisons.length + 1}`,
            models: modelIds,
            script,
            results: modelIds.map(modelId => ({
                modelId,
                audioUrl: `https://example.com/audio_${modelId}.wav`,
                quality: 80 + Math.random() * 20,
                naturalness: 75 + Math.random() * 25,
                clarity: 85 + Math.random() * 15,
                emotionalExpression: 70 + Math.random() * 30,
                pronunciation: 85 + Math.random() * 15,
                timing: 80 + Math.random() * 20,
                overallScore: 80 + Math.random() * 20,
                generatedAt: new Date()
            })),
            createdAt: new Date(),
            status: 'completed'
        };

        setComparisons(prev => [comparison, ...prev]);
    };

    const handleRunBenchmark = async (modelId: string, testType: string) => {
        // Simulate benchmark run
        await new Promise(resolve => setTimeout(resolve, 5000));

        const benchmark: BenchmarkResult = {
            modelId,
            testType,
            score: 80 + Math.random() * 20,
            details: {
                wer: Math.random() * 5,
                mos: 3.5 + Math.random() * 1.5,
                latency: 100 + Math.random() * 200,
                throughput: 100 + Math.random() * 100,
                memoryUsage: 200 + Math.random() * 300,
                cpuUsage: 10 + Math.random() * 40
            },
            timestamp: new Date()
        };

        setBenchmarks(prev => [benchmark, ...prev]);
    };

    const currentModel = models.find(m => m.id === selectedModel) || null;
    const currentScriptContent = selectedScript === 'custom' ? customScript :
        scripts.find(s => s.id === selectedScript)?.content || '';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Voice Testing & Simulation Tools</h1>
                <p className="text-gray-600">
                    Comprehensive testing and quality assessment for voice models
                </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="synthesis">Voice Synthesis</TabsTrigger>
                    <TabsTrigger value="comparison">Voice Comparison</TabsTrigger>
                    <TabsTrigger value="benchmarks">Performance</TabsTrigger>
                    <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="synthesis" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Model & Script Selection */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Voice Model</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <VoiceModelSelector
                                        models={models}
                                        selectedModels={selectedModel ? [selectedModel] : []}
                                        onSelectionChange={(ids) => setSelectedModel(ids[0] || '')}
                                        maxSelection={1}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Test Script</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScriptEditor
                                        scripts={scripts}
                                        selectedScript={selectedScript}
                                        onScriptChange={setSelectedScript}
                                        onCustomScript={setCustomScript}
                                        customScript={customScript}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Voice Player */}
                        <div>
                            <VoiceSynthesisPlayer
                                audioUrl={currentAudioUrl}
                                isLoading={isGenerating}
                                onGenerate={handleGenerateSpeech}
                                model={currentModel}
                                script={currentScriptContent}
                            />
                        </div>

                        {/* Quality Assessment */}
                        <div>
                            <QualityAssessment
                                metrics={qualityMetrics}
                                isAnalyzing={isAnalyzing}
                                onAnalyze={handleAnalyzeQuality}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                    <VoiceComparison
                        comparisons={comparisons}
                        models={models}
                        onCreateComparison={handleCreateComparison}
                    />
                </TabsContent>

                <TabsContent value="benchmarks" className="space-y-4">
                    <PerformanceBenchmarks
                        benchmarks={benchmarks}
                        models={models}
                        onRunBenchmark={handleRunBenchmark}
                    />
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <QualityAssessment
                            metrics={qualityMetrics}
                            isAnalyzing={isAnalyzing}
                            onAnalyze={handleAnalyzeQuality}
                        />
                        <Card>
                            <CardHeader>
                                <CardTitle>Quality History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <div className="text-center text-gray-500">
                                        <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Quality Analysis History</p>
                                        <p className="text-sm">Track quality metrics over time</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}