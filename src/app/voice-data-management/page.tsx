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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Upload,
    Download,
    Search,
    Filter,
    Play,
    Pause,
    Mic,
    File,
    FileText as FileAudio,
    Tag,
    Star,
    Trash2,
    Edit,
    Plus,
    Eye,
    Volume2,
    Clock,
    CheckCircle,
    AlertTriangle,
    Settings,
    BarChart3,
    Database,
    Layers,
    Zap,
    Target,
    Activity,
    Waveform,
    Gauge,
    Timer,
    TrendingUp,
    Users,
    Globe,
    Headphones
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceSample {
    id: string;
    name: string;
    description: string;
    duration: number;
    sampleRate: number;
    bitDepth: number;
    channels: number;
    fileSize: number;
    format: string;
    language: string;
    speaker: {
        id: string;
        name: string;
        age: number;
        gender: 'male' | 'female' | 'other';
        accent: string;
        nativeLanguage: string;
    };
    quality: {
        overall: number;
        clarity: number;
        noise: number;
        consistency: number;
    };
    metadata: {
        emotion: string;
        context: string;
        environment: string;
        recordingDevice: string;
        processingHistory: string[];
    };
    tags: string[];
    transcription?: string;
    status: 'processing' | 'ready' | 'rejected' | 'archived';
    uploadedAt: string;
    processedAt?: string;
    url: string;
    waveform?: number[];
}

interface Dataset {
    id: string;
    name: string;
    description: string;
    category: 'training' | 'validation' | 'test' | 'production';
    language: string;
    totalSamples: number;
    totalDuration: number;
    avgQuality: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'archived';
    samples: string[]; // sample IDs
}

interface QualityMetrics {
    totalSamples: number;
    avgQuality: number;
    avgClarity: number;
    avgNoise: number;
    languageDistribution: Record<string, number>;
    speakerDistribution: Record<string, number>;
    durationDistribution: {
        short: number; // < 5s
        medium: number; // 5-30s
        long: number; // > 30s
    };
}

export default function VoiceDataManagementPage() {
    const [voiceSamples, setVoiceSamples] = useState<VoiceSample[]>([]);
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLanguage, setFilterLanguage] = useState('all');
    const [filterQuality, setFilterQuality] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showCreateDatasetDialog, setShowCreateDatasetDialog] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadForm, setUploadForm] = useState({
        files: [] as File[],
        language: 'ml',
        speakerName: '',
        speakerAge: '',
        speakerGender: 'male' as 'male' | 'female' | 'other',
        speakerAccent: '',
        emotion: 'neutral',
        context: '',
        environment: 'studio',
        recordingDevice: '',
        tags: ''
    });

    const [datasetForm, setDatasetForm] = useState({
        name: '',
        description: '',
        category: 'training' as 'training' | 'validation' | 'test' | 'production',
        language: 'ml',
        tags: ''
    });

    const [selectedTab, setSelectedTab] = useState('samples');

    // Mock data for demonstration
    useEffect(() => {
        const mockSamples: VoiceSample[] = [
            {
                id: 'sample-1',
                name: 'Malayalam Greeting',
                description: 'Professional greeting in Malayalam',
                duration: 3.2,
                sampleRate: 44100,
                bitDepth: 16,
                channels: 1,
                fileSize: 141120,
                format: 'wav',
                language: 'ml',
                speaker: {
                    id: 'speaker-1',
                    name: 'Arun Kumar',
                    age: 35,
                    gender: 'male',
                    accent: 'Kerala',
                    nativeLanguage: 'ml'
                },
                quality: {
                    overall: 95,
                    clarity: 98,
                    noise: 2,
                    consistency: 96
                },
                metadata: {
                    emotion: 'neutral',
                    context: 'business greeting',
                    environment: 'studio',
                    recordingDevice: 'AKG C414',
                    processingHistory: ['noise reduction', 'normalization']
                },
                tags: ['greeting', 'professional', 'male'],
                transcription: 'Namaste, എങ്ങനെ സഹായിക്കാം?',
                status: 'ready',
                uploadedAt: '2024-11-01T10:00:00Z',
                processedAt: '2024-11-01T10:05:00Z',
                url: '/audio/sample-1.wav',
                waveform: [0.1, 0.3, 0.2, 0.8, 0.5, 0.9, 0.4, 0.6]
            },
            {
                id: 'sample-2',
                name: 'English Customer Query',
                description: 'Customer service inquiry in English',
                duration: 8.5,
                sampleRate: 48000,
                bitDepth: 24,
                channels: 2,
                fileSize: 408960,
                format: 'flac',
                language: 'en',
                speaker: {
                    id: 'speaker-2',
                    name: 'Priya Sharma',
                    age: 28,
                    gender: 'female',
                    accent: 'Indian English',
                    nativeLanguage: 'hi'
                },
                quality: {
                    overall: 92,
                    clarity: 94,
                    noise: 5,
                    consistency: 91
                },
                metadata: {
                    emotion: 'concerned',
                    context: 'customer support',
                    environment: 'office',
                    recordingDevice: 'Shure SM7B',
                    processingHistory: ['noise gate', 'compression']
                },
                tags: ['customer-service', 'inquiry', 'female'],
                transcription: 'Hello, I would like to know the status of my order number 12345.',
                status: 'ready',
                uploadedAt: '2024-11-02T14:30:00Z',
                processedAt: '2024-11-02T14:35:00Z',
                url: '/audio/sample-2.flac',
                waveform: [0.2, 0.4, 0.1, 0.7, 0.3, 0.8, 0.6, 0.9, 0.5, 0.7]
            }
        ];

        const mockDatasets: Dataset[] = [
            {
                id: 'dataset-1',
                name: 'Malayalam Professional Voice Dataset',
                description: 'High-quality Malayalam voice samples for professional contexts',
                category: 'training',
                language: 'ml',
                totalSamples: 1250,
                totalDuration: 36000,
                avgQuality: 94.2,
                tags: ['professional', 'malayalam', 'business'],
                createdAt: '2024-10-15T09:00:00Z',
                updatedAt: '2024-11-08T16:00:00Z',
                status: 'active',
                samples: ['sample-1']
            }
        ];

        setVoiceSamples(mockSamples);
        setDatasets(mockDatasets);
    }, []);

    const filteredSamples = voiceSamples.filter(sample => {
        const matchesSearch = sample.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sample.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sample.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLanguage = filterLanguage === 'all' || sample.language === filterLanguage;
        const matchesQuality = filterQuality === 'all' ||
            (filterQuality === 'high' && sample.quality.overall >= 90) ||
            (filterQuality === 'medium' && sample.quality.overall >= 70 && sample.quality.overall < 90) ||
            (filterQuality === 'low' && sample.quality.overall < 70);
        const matchesStatus = filterStatus === 'all' || sample.status === filterStatus;

        return matchesSearch && matchesLanguage && matchesQuality && matchesStatus;
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const audioFiles = Array.from(files).filter(file =>
            file.type.startsWith('audio/') ||
            file.name.endsWith('.wav') ||
            file.name.endsWith('.flac') ||
            file.name.endsWith('.mp3')
        );

        setUploadForm({ ...uploadForm, files: audioFiles });
    };

    const handleUploadSubmit = async () => {
        if (uploadForm.files.length === 0) {
            toast({
                title: "No Files Selected",
                description: "Please select audio files to upload.",
                variant: "destructive"
            });
            return;
        }

        // Simulate upload process
        for (const file of uploadForm.files) {
            const newSample: VoiceSample = {
                id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                description: `Uploaded ${file.name}`,
                duration: 0, // Would be calculated from file
                sampleRate: 44100,
                bitDepth: 16,
                channels: 1,
                fileSize: file.size,
                format: file.name.split('.').pop() || 'wav',
                language: uploadForm.language,
                speaker: {
                    id: `speaker-${Date.now()}`,
                    name: uploadForm.speakerName || 'Unknown',
                    age: parseInt(uploadForm.speakerAge) || 30,
                    gender: uploadForm.speakerGender,
                    accent: uploadForm.speakerAccent || 'neutral',
                    nativeLanguage: uploadForm.language
                },
                quality: {
                    overall: 0,
                    clarity: 0,
                    noise: 0,
                    consistency: 0
                },
                metadata: {
                    emotion: uploadForm.emotion,
                    context: uploadForm.context,
                    environment: uploadForm.environment,
                    recordingDevice: uploadForm.recordingDevice,
                    processingHistory: []
                },
                tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                status: 'processing',
                uploadedAt: new Date().toISOString(),
                url: URL.createObjectURL(file)
            };

            setVoiceSamples(prev => [...prev, newSample]);
        }

        // Reset form
        setUploadForm({
            files: [],
            language: 'ml',
            speakerName: '',
            speakerAge: '',
            speakerGender: 'male',
            speakerAccent: '',
            emotion: 'neutral',
            context: '',
            environment: 'studio',
            recordingDevice: '',
            tags: ''
        });

        setShowUploadDialog(false);

        toast({
            title: "Upload Started",
            description: `${uploadForm.files.length} files uploaded for processing.`,
        });
    };

    const handleCreateDataset = () => {
        if (!datasetForm.name || selectedSamples.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please provide a dataset name and select samples.",
                variant: "destructive"
            });
            return;
        }

        const newDataset: Dataset = {
            id: `dataset-${Date.now()}`,
            name: datasetForm.name,
            description: datasetForm.description,
            category: datasetForm.category,
            language: datasetForm.language,
            totalSamples: selectedSamples.length,
            totalDuration: voiceSamples
                .filter(s => selectedSamples.includes(s.id))
                .reduce((sum, s) => sum + s.duration, 0),
            avgQuality: voiceSamples
                .filter(s => selectedSamples.includes(s.id))
                .reduce((sum, s) => sum + s.quality.overall, 0) / selectedSamples.length,
            tags: datasetForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            samples: selectedSamples
        };

        setDatasets(prev => [...prev, newDataset]);
        setSelectedSamples([]);
        setDatasetForm({
            name: '',
            description: '',
            category: 'training',
            language: 'ml',
            tags: ''
        });
        setShowCreateDatasetDialog(false);

        toast({
            title: "Dataset Created",
            description: `Dataset "${newDataset.name}" created with ${newDataset.totalSamples} samples.`,
        });
    };

    const handlePlaySample = (sample: VoiceSample) => {
        if (isPlaying === sample.id) {
            audioRef.current?.pause();
            setIsPlaying(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = sample.url;
                audioRef.current.play();
                setIsPlaying(sample.id);
            }
        }
    };

    const getQualityBadgeColor = (quality: number) => {
        if (quality >= 90) return 'bg-green-100 text-green-800';
        if (quality >= 70) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ready': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const calculateQualityMetrics = (): QualityMetrics => {
        const totalSamples = voiceSamples.length;
        const avgQuality = voiceSamples.reduce((sum, s) => sum + s.quality.overall, 0) / totalSamples;
        const avgClarity = voiceSamples.reduce((sum, s) => sum + s.quality.clarity, 0) / totalSamples;
        const avgNoise = voiceSamples.reduce((sum, s) => sum + s.quality.noise, 0) / totalSamples;

        const languageDistribution: Record<string, number> = {};
        const speakerDistribution: Record<string, number> = {};
        const durationDistribution = { short: 0, medium: 0, long: 0 };

        voiceSamples.forEach(sample => {
            languageDistribution[sample.language] = (languageDistribution[sample.language] || 0) + 1;
            speakerDistribution[sample.speaker.id] = (speakerDistribution[sample.speaker.id] || 0) + 1;

            if (sample.duration < 5) durationDistribution.short++;
            else if (sample.duration <= 30) durationDistribution.medium++;
            else durationDistribution.long++;
        });

        return {
            totalSamples,
            avgQuality: Math.round(avgQuality * 10) / 10,
            avgClarity: Math.round(avgClarity * 10) / 10,
            avgNoise: Math.round(avgNoise * 10) / 10,
            languageDistribution,
            speakerDistribution,
            durationDistribution
        };
    };

    const qualityMetrics = calculateQualityMetrics();

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Database className="h-8 w-8 text-orange-600" />
                            Voice Data Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage voice samples, datasets, and quality metrics for AI training
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                        <Button size="sm" onClick={() => setShowUploadDialog(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Samples
                        </Button>
                    </div>
                </div>

                {/* Quality Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Samples</p>
                                    <p className="text-2xl font-bold">{qualityMetrics.totalSamples}</p>
                                </div>
                                <FileAudio className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Quality</p>
                                    <p className="text-2xl font-bold">{qualityMetrics.avgQuality}%</p>
                                </div>
                                <Gauge className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Languages</p>
                                    <p className="text-2xl font-bold">{Object.keys(qualityMetrics.languageDistribution).length}</p>
                                </div>
                                <Globe className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Speakers</p>
                                    <p className="text-2xl font-bold">{Object.keys(qualityMetrics.speakerDistribution).length}</p>
                                </div>
                                <Users className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="samples">Voice Samples</TabsTrigger>
                        <TabsTrigger value="datasets">Datasets</TabsTrigger>
                        <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
                        <TabsTrigger value="processing">Processing Queue</TabsTrigger>
                    </TabsList>

                    <TabsContent value="samples" className="space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-64">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search samples..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Languages</SelectItem>
                                            <SelectItem value="ml">Malayalam</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="hi">Hindi</SelectItem>
                                            <SelectItem value="ta">Tamil</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterQuality} onValueChange={setFilterQuality}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Quality" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Quality</SelectItem>
                                            <SelectItem value="high">High (90%+)</SelectItem>
                                            <SelectItem value="medium">Medium (70-89%)</SelectItem>
                                            <SelectItem value="low">Low (&lt;70%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="ready">Ready</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selectedSamples.length > 0 && (
                                        <Button onClick={() => setShowCreateDatasetDialog(true)}>
                                            Create Dataset ({selectedSamples.length})
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Samples Table */}
                        <Card>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectedSamples.length === filteredSamples.length && filteredSamples.length > 0}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedSamples(filteredSamples.map(s => s.id));
                                                        } else {
                                                            setSelectedSamples([]);
                                                        }
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Language</TableHead>
                                            <TableHead>Speaker</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Quality</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSamples.map((sample) => (
                                            <TableRow key={sample.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedSamples.includes(sample.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedSamples([...selectedSamples, sample.id]);
                                                            } else {
                                                                setSelectedSamples(selectedSamples.filter(id => id !== sample.id));
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{sample.name}</p>
                                                        <p className="text-sm text-muted-foreground">{sample.description}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{sample.language.toUpperCase()}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{sample.speaker.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {sample.speaker.age}y, {sample.speaker.gender}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{sample.duration.toFixed(1)}s</TableCell>
                                                <TableCell>
                                                    <Badge className={getQualityBadgeColor(sample.quality.overall)}>
                                                        {sample.quality.overall}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadgeColor(sample.status)}>
                                                        {sample.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handlePlaySample(sample)}
                                                        >
                                                            {isPlaying === sample.id ? (
                                                                <Pause className="h-4 w-4" />
                                                            ) : (
                                                                <Play className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {filteredSamples.length === 0 && (
                                    <div className="text-center py-12">
                                        <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No Voice Samples Found</h3>
                                        <p className="text-muted-foreground mb-4">
                                            {searchQuery || filterLanguage !== 'all' || filterQuality !== 'all' || filterStatus !== 'all'
                                                ? 'Try adjusting your filters or search query.'
                                                : 'Upload some voice samples to get started.'
                                            }
                                        </p>
                                        <Button onClick={() => setShowUploadDialog(true)}>
                                            Upload Samples
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="datasets">
                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Datasets</CardTitle>
                                <CardDescription>
                                    Organize voice samples into datasets for training and evaluation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {datasets.map((dataset) => (
                                        <Card key={dataset.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-medium">{dataset.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{dataset.description}</p>
                                                    </div>
                                                    <Badge variant="outline">{dataset.category}</Badge>
                                                </div>

                                                <div className="space-y-2 text-sm mb-4">
                                                    <div className="flex justify-between">
                                                        <span>Samples:</span>
                                                        <span className="font-medium">{dataset.totalSamples}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Duration:</span>
                                                        <span className="font-medium">{Math.round(dataset.totalDuration / 60)}min</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Avg Quality:</span>
                                                        <span className="font-medium">{dataset.avgQuality.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Language:</span>
                                                        <Badge variant="outline">{dataset.language.toUpperCase()}</Badge>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button size="sm" className="flex-1">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="flex-1">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Export
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    <Card className="border-dashed border-2">
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="font-medium mb-2">Create New Dataset</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Organize your voice samples into datasets
                                                </p>
                                                <Button onClick={() => setShowCreateDatasetDialog(true)}>
                                                    Create Dataset
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="quality">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quality Distribution</CardTitle>
                                    <CardDescription>
                                        Breakdown of sample quality scores
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>High Quality (90%+)</span>
                                            <span className="font-medium">
                                                {voiceSamples.filter(s => s.quality.overall >= 90).length}
                                            </span>
                                        </div>
                                        <Progress
                                            value={(voiceSamples.filter(s => s.quality.overall >= 90).length / voiceSamples.length) * 100}
                                            className="h-2"
                                        />

                                        <div className="flex justify-between items-center">
                                            <span>Medium Quality (70-89%)</span>
                                            <span className="font-medium">
                                                {voiceSamples.filter(s => s.quality.overall >= 70 && s.quality.overall < 90).length}
                                            </span>
                                        </div>
                                        <Progress
                                            value={(voiceSamples.filter(s => s.quality.overall >= 70 && s.quality.overall < 90).length / voiceSamples.length) * 100}
                                            className="h-2"
                                        />

                                        <div className="flex justify-between items-center">
                                            <span>Low Quality (&lt;70%)</span>
                                            <span className="font-medium">
                                                {voiceSamples.filter(s => s.quality.overall < 70).length}
                                            </span>
                                        </div>
                                        <Progress
                                            value={(voiceSamples.filter(s => s.quality.overall < 70).length / voiceSamples.length) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Language Distribution</CardTitle>
                                    <CardDescription>
                                        Samples by language
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(qualityMetrics.languageDistribution).map(([lang, count]) => (
                                            <div key={lang} className="flex justify-between items-center">
                                                <span className="capitalize">{lang}</span>
                                                <div className="flex items-center gap-2">
                                                    <Progress
                                                        value={(count / voiceSamples.length) * 100}
                                                        className="h-2 w-20"
                                                    />
                                                    <span className="font-medium text-sm">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="processing">
                        <Card>
                            <CardHeader>
                                <CardTitle>Processing Queue</CardTitle>
                                <CardDescription>
                                    Monitor voice sample processing and quality analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Processing Queue</h3>
                                    <p className="text-muted-foreground">
                                        Real-time processing status will appear here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Upload Dialog */}
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Upload Voice Samples</DialogTitle>
                            <DialogDescription>
                                Upload audio files and provide metadata for voice sample processing
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="files">Audio Files</Label>
                                <Input
                                    id="files"
                                    type="file"
                                    accept="audio/*"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                {uploadForm.files.length > 0 && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {uploadForm.files.length} files selected
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="language">Language</Label>
                                    <Select
                                        value={uploadForm.language}
                                        onValueChange={(value) => setUploadForm({ ...uploadForm, language: value })}
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
                                    <Label htmlFor="speakerName">Speaker Name</Label>
                                    <Input
                                        id="speakerName"
                                        value={uploadForm.speakerName}
                                        onChange={(e) => setUploadForm({ ...uploadForm, speakerName: e.target.value })}
                                        placeholder="e.g., John Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="speakerAge">Age</Label>
                                    <Input
                                        id="speakerAge"
                                        type="number"
                                        value={uploadForm.speakerAge}
                                        onChange={(e) => setUploadForm({ ...uploadForm, speakerAge: e.target.value })}
                                        placeholder="30"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="speakerGender">Gender</Label>
                                    <Select
                                        value={uploadForm.speakerGender}
                                        onValueChange={(value: 'male' | 'female' | 'other') => setUploadForm({ ...uploadForm, speakerGender: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="speakerAccent">Accent</Label>
                                    <Input
                                        id="speakerAccent"
                                        value={uploadForm.speakerAccent}
                                        onChange={(e) => setUploadForm({ ...uploadForm, speakerAccent: e.target.value })}
                                        placeholder="e.g., American"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="emotion">Emotion</Label>
                                    <Select
                                        value={uploadForm.emotion}
                                        onValueChange={(value) => setUploadForm({ ...uploadForm, emotion: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="neutral">Neutral</SelectItem>
                                            <SelectItem value="happy">Happy</SelectItem>
                                            <SelectItem value="sad">Sad</SelectItem>
                                            <SelectItem value="angry">Angry</SelectItem>
                                            <SelectItem value="excited">Excited</SelectItem>
                                            <SelectItem value="calm">Calm</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="environment">Environment</Label>
                                    <Select
                                        value={uploadForm.environment}
                                        onValueChange={(value) => setUploadForm({ ...uploadForm, environment: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="studio">Studio</SelectItem>
                                            <SelectItem value="office">Office</SelectItem>
                                            <SelectItem value="home">Home</SelectItem>
                                            <SelectItem value="outdoor">Outdoor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="context">Context</Label>
                                <Input
                                    id="context"
                                    value={uploadForm.context}
                                    onChange={(e) => setUploadForm({ ...uploadForm, context: e.target.value })}
                                    placeholder="e.g., customer service call, presentation"
                                />
                            </div>

                            <div>
                                <Label htmlFor="recordingDevice">Recording Device</Label>
                                <Input
                                    id="recordingDevice"
                                    value={uploadForm.recordingDevice}
                                    onChange={(e) => setUploadForm({ ...uploadForm, recordingDevice: e.target.value })}
                                    placeholder="e.g., Shure SM7B, iPhone microphone"
                                />
                            </div>

                            <div>
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    value={uploadForm.tags}
                                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                                    placeholder="e.g., professional, greeting, male"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUploadSubmit}>
                                Upload Samples
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Dataset Dialog */}
                <Dialog open={showCreateDatasetDialog} onOpenChange={setShowCreateDatasetDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Dataset</DialogTitle>
                            <DialogDescription>
                                Create a new dataset from selected voice samples
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="datasetName">Dataset Name</Label>
                                <Input
                                    id="datasetName"
                                    value={datasetForm.name}
                                    onChange={(e) => setDatasetForm({ ...datasetForm, name: e.target.value })}
                                    placeholder="e.g., Malayalam Professional Voices"
                                />
                            </div>

                            <div>
                                <Label htmlFor="datasetDescription">Description</Label>
                                <Textarea
                                    id="datasetDescription"
                                    value={datasetForm.description}
                                    onChange={(e) => setDatasetForm({ ...datasetForm, description: e.target.value })}
                                    placeholder="Describe the purpose and content of this dataset"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="datasetCategory">Category</Label>
                                    <Select
                                        value={datasetForm.category}
                                        onValueChange={(value: 'training' | 'validation' | 'test' | 'production') => setDatasetForm({ ...datasetForm, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="training">Training</SelectItem>
                                            <SelectItem value="validation">Validation</SelectItem>
                                            <SelectItem value="test">Test</SelectItem>
                                            <SelectItem value="production">Production</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="datasetLanguage">Language</Label>
                                    <Select
                                        value={datasetForm.language}
                                        onValueChange={(value) => setDatasetForm({ ...datasetForm, language: value })}
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
                            </div>

                            <div>
                                <Label htmlFor="datasetTags">Tags (comma-separated)</Label>
                                <Input
                                    id="datasetTags"
                                    value={datasetForm.tags}
                                    onChange={(e) => setDatasetForm({ ...datasetForm, tags: e.target.value })}
                                    placeholder="e.g., professional, malayalam, business"
                                />
                            </div>

                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Dataset Summary</h4>
                                <div className="text-sm space-y-1">
                                    <p>Samples: {selectedSamples.length}</p>
                                    <p>Total Duration: {voiceSamples.filter(s => selectedSamples.includes(s.id)).reduce((sum, s) => sum + s.duration, 0).toFixed(1)}s</p>
                                    <p>Average Quality: {selectedSamples.length > 0 ? (voiceSamples.filter(s => selectedSamples.includes(s.id)).reduce((sum, s) => sum + s.quality.overall, 0) / selectedSamples.length).toFixed(1) : 0}%</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateDatasetDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateDataset}>
                                Create Dataset
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Hidden audio element for playback */}
                <audio
                    ref={audioRef}
                    onEnded={() => setIsPlaying(null)}
                    className="hidden"
                />
            </div>
        </ManagementLayout>
    );
}