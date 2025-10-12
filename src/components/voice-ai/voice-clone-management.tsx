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
import {
    Mic,
    MicOff,
    Play,
    Play as Pause,
    XCircle as Square,
    Upload,
    Download,
    Trash2,
    Settings,
    Volume2,
    Volume2 as VolumeX,
    User,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    RotateCcw as Loader2,
    Plus,
    Settings as Edit,
    Save,
    X,
    Globe,
    Activity as Waveform,
    Zap,
    BarChart3,
    Mic as FileAudio,
    Brain,
    Target,
    CheckCircle as Sparkles
} from 'lucide-react';

// Import the voice clone service interfaces
interface VoiceProfile {
    id: string;
    name: string;
    userId: string;
    language: 'ml' | 'en' | 'manglish';
    voiceType: 'male' | 'female' | 'child' | 'elderly';
    speakingRate: number;
    pitch: number;
    audioSamples: Array<{
        id: string;
        audioUrl: string;
        text: string;
        duration: number;
        quality: 'low' | 'medium' | 'high' | 'premium';
    }>;
    modelChecksum: string;
    trainingStatus: 'untrained' | 'training' | 'trained' | 'error';
    createdAt: Date;
    updatedAt: Date;
}

interface VoiceCloneRequest {
    profileId: string;
    text: string;
    language: 'ml' | 'en' | 'manglish';
    emotionTone?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'urgent';
    speakingStyle?: 'casual' | 'formal' | 'friendly' | 'professional' | 'storytelling';
    outputFormat: 'wav' | 'mp3' | 'ogg' | 'webm';
    quality: 'draft' | 'standard' | 'high' | 'premium';
}

interface TrainingProgress {
    profileId: string;
    stage: 'preprocessing' | 'feature_extraction' | 'model_training' | 'validation' | 'optimization';
    progress: number;
    estimatedTimeRemaining: number;
    currentEpoch?: number;
    totalEpochs?: number;
    loss?: number;
    accuracy?: number;
    message: string;
}

// Voice Profile Management Component
const VoiceProfileCard: React.FC<{
    profile: VoiceProfile;
    onEdit: (profile: VoiceProfile) => void;
    onDelete: (profileId: string) => void;
    onTrain: (profileId: string) => void;
    onTest: (profileId: string) => void;
}> = ({ profile, onEdit, onDelete, onTrain, onTest }) => {
    const getStatusColor = (status: VoiceProfile['trainingStatus']) => {
        switch (status) {
            case 'trained': return 'bg-green-500';
            case 'training': return 'bg-blue-500 animate-pulse';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: VoiceProfile['trainingStatus']) => {
        switch (status) {
            case 'trained': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'training': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const formatDuration = (samples: VoiceProfile['audioSamples']) => {
        const totalDuration = samples.reduce((sum, sample) => sum + sample.duration, 0);
        return `${Math.round(totalDuration / 60)}m ${Math.round(totalDuration % 60)}s`;
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(profile.trainingStatus)}`} />
                        <div>
                            <CardTitle className="text-lg">{profile.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {profile.language.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {profile.voiceType}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <FileAudio className="w-3 h-3" />
                                    {profile.audioSamples.length} samples
                                </Badge>
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {getStatusIcon(profile.trainingStatus)}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Training Status */}
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Training Status</span>
                        <Badge variant={profile.trainingStatus === 'trained' ? 'default' :
                            profile.trainingStatus === 'training' ? 'secondary' :
                                profile.trainingStatus === 'error' ? 'destructive' : 'outline'}>
                            {profile.trainingStatus}
                        </Badge>
                    </div>
                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                        <div>
                            <span className="font-medium">Total Audio:</span>
                            <span className="ml-1">{formatDuration(profile.audioSamples)}</span>
                        </div>
                        <div>
                            <span className="font-medium">Quality:</span>
                            <span className="ml-1 capitalize">
                                {profile.audioSamples.length > 0 ?
                                    profile.audioSamples.reduce((best, sample) =>
                                        ['premium', 'high', 'medium', 'low'].indexOf(sample.quality) <
                                            ['premium', 'high', 'medium', 'low'].indexOf(best) ? sample.quality : best
                                        , 'low') : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Voice Parameters */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-sm">
                        <span className="text-gray-600">Speaking Rate:</span>
                        <div className="font-medium">{profile.speakingRate}x</div>
                        <Progress value={profile.speakingRate * 50} className="h-1 mt-1" />
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-600">Pitch:</span>
                        <div className="font-medium">{profile.pitch}x</div>
                        <Progress value={profile.pitch * 50} className="h-1 mt-1" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTest(profile.id)}
                        disabled={profile.trainingStatus !== 'trained'}
                        className="flex-1 flex items-center gap-1"
                    >
                        <Play className="w-3 h-3" />
                        Test
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTrain(profile.id)}
                        disabled={profile.trainingStatus === 'training'}
                        className="flex-1 flex items-center gap-1"
                    >
                        {profile.trainingStatus === 'training' ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Training
                            </>
                        ) : (
                            <>
                                <Brain className="w-3 h-3" />
                                {profile.trainingStatus === 'trained' ? 'Retrain' : 'Train'}
                            </>
                        )}
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(profile)}
                        className="flex items-center gap-1"
                    >
                        <Edit className="w-3 h-3" />
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(profile.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// Audio Sample Management Component
const AudioSampleManager: React.FC<{
    samples: VoiceProfile['audioSamples'];
    onUpload: (files: FileList, texts: string[]) => void;
    onDelete: (sampleId: string) => void;
    onPlay: (sampleId: string) => void;
}> = ({ samples, onUpload, onDelete, onPlay }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploadTexts, setUploadTexts] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('audio/')
        );

        if (files.length > 0) {
            const texts = new Array(files.length).fill('');
            setUploadTexts(texts);
            onUpload(files as any, texts);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const texts = new Array(e.target.files.length).fill('');
            setUploadTexts(texts);
            onUpload(e.target.files, texts);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium">Upload Audio Samples</p>
                        <p className="text-xs text-gray-500">
                            Drag and drop audio files or{' '}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:underline"
                            >
                                browse
                            </button>
                        </p>
                    </div>
                    <p className="text-xs text-gray-400">
                        Supports WAV, MP3, M4A (Max 10MB per file)
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Sample List */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Audio Samples ({samples.length})</h4>
                    <Badge variant="outline">
                        Total: {Math.round(samples.reduce((sum, sample) => sum + sample.duration, 0) / 60)}m
                    </Badge>
                </div>

                <ScrollArea className="h-64">
                    {samples.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileAudio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No audio samples uploaded</p>
                            <p className="text-xs">Upload at least 5 samples for training</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {samples.map((sample, index) => (
                                <div key={sample.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Sample {index + 1}</span>
                                            <Badge
                                                variant={
                                                    sample.quality === 'premium' ? 'default' :
                                                        sample.quality === 'high' ? 'secondary' :
                                                            sample.quality === 'medium' ? 'outline' : 'destructive'
                                                }
                                                className="text-xs"
                                            >
                                                {sample.quality}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {sample.text || 'No transcript available'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>{Math.round(sample.duration)}s</span>
                                            <span>•</span>
                                            <span>Audio file</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onPlay(sample.id)}
                                            className="w-8 h-8 p-0"
                                        >
                                            <Play className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDelete(sample.id)}
                                            className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

// Training Progress Component
const TrainingProgressPanel: React.FC<{
    progress: TrainingProgress | null;
    onCancel?: () => void;
}> = ({ progress, onCancel }) => {
    if (!progress) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No training in progress</p>
            </div>
        );
    }

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'preprocessing': return <Settings className="w-4 h-4" />;
            case 'feature_extraction': return <Waveform className="w-4 h-4" />;
            case 'model_training': return <Brain className="w-4 h-4" />;
            case 'validation': return <Target className="w-4 h-4" />;
            case 'optimization': return <Sparkles className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Training in Progress
                </CardTitle>
                <CardDescription>
                    Voice model training is currently running
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Stage */}
                <div className="flex items-center gap-3">
                    {getStageIcon(progress.stage)}
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                                {progress.stage.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                                {progress.progress.toFixed(1)}%
                            </span>
                        </div>
                        <Progress value={progress.progress} className="mt-1" />
                    </div>
                </div>

                {/* Training Details */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    {progress.currentEpoch && progress.totalEpochs && (
                        <div className="text-sm">
                            <span className="text-gray-600">Epoch:</span>
                            <div className="font-medium">{progress.currentEpoch}/{progress.totalEpochs}</div>
                        </div>
                    )}
                    <div className="text-sm">
                        <span className="text-gray-600">Time Remaining:</span>
                        <div className="font-medium">{formatTime(progress.estimatedTimeRemaining)}</div>
                    </div>
                    {progress.loss && (
                        <div className="text-sm">
                            <span className="text-gray-600">Loss:</span>
                            <div className="font-medium">{progress.loss.toFixed(4)}</div>
                        </div>
                    )}
                    {progress.accuracy && (
                        <div className="text-sm">
                            <span className="text-gray-600">Accuracy:</span>
                            <div className="font-medium">{(progress.accuracy * 100).toFixed(1)}%</div>
                        </div>
                    )}
                </div>

                {/* Status Message */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{progress.message}</AlertDescription>
                </Alert>

                {/* Cancel Button */}
                {onCancel && (
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="w-full flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel Training
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

// Main Voice Clone Management Component
export default function VoiceCloneManagement() {
    const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null);
    const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingProfile, setEditingProfile] = useState<VoiceProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form states for creating/editing profiles
    const [profileForm, setProfileForm] = useState({
        name: '',
        language: 'en' as 'ml' | 'en' | 'manglish',
        voiceType: 'female' as 'male' | 'female' | 'child' | 'elderly',
        speakingRate: 1.0,
        pitch: 1.0,
    });

    // Load profiles on component mount
    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setIsLoading(true);
        try {
            // Mock data for development - replace with actual API call
            const mockProfiles: VoiceProfile[] = [
                {
                    id: 'profile_1',
                    name: 'Sarah Professional',
                    userId: 'user_1',
                    language: 'en',
                    voiceType: 'female',
                    speakingRate: 1.0,
                    pitch: 1.1,
                    audioSamples: [
                        {
                            id: 'sample_1',
                            audioUrl: '/audio/sample1.wav',
                            text: 'Hello, welcome to our AI IVR system.',
                            duration: 3.2,
                            quality: 'high'
                        },
                        {
                            id: 'sample_2',
                            audioUrl: '/audio/sample2.wav',
                            text: 'How can I assist you today?',
                            duration: 2.8,
                            quality: 'premium'
                        }
                    ],
                    modelChecksum: 'abc123',
                    trainingStatus: 'trained',
                    createdAt: new Date('2024-01-15'),
                    updatedAt: new Date('2024-01-20')
                },
                {
                    id: 'profile_2',
                    name: 'Ravi Malayalam',
                    userId: 'user_1',
                    language: 'ml',
                    voiceType: 'male',
                    speakingRate: 0.9,
                    pitch: 0.8,
                    audioSamples: [
                        {
                            id: 'sample_3',
                            audioUrl: '/audio/sample3.wav',
                            text: 'നമസ്കാരം, എങ്ങനെ സഹായിക്കാൻ കഴിയും?',
                            duration: 4.1,
                            quality: 'high'
                        }
                    ],
                    modelChecksum: 'def456',
                    trainingStatus: 'training',
                    createdAt: new Date('2024-02-01'),
                    updatedAt: new Date('2024-02-05')
                }
            ];

            setProfiles(mockProfiles);

            // Mock training progress for training profile
            const trainingProfile = mockProfiles.find(p => p.trainingStatus === 'training');
            if (trainingProfile) {
                setTrainingProgress({
                    profileId: trainingProfile.id,
                    stage: 'model_training',
                    progress: 67.5,
                    estimatedTimeRemaining: 1800, // 30 minutes
                    currentEpoch: 135,
                    totalEpochs: 200,
                    loss: 0.0234,
                    accuracy: 0.89,
                    message: 'Training voice model with Malayalam phoneme optimization...'
                });
            }
        } catch (error) {
            console.error('Failed to load voice profiles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProfile = async () => {
        try {
            const newProfile: VoiceProfile = {
                id: `profile_${Date.now()}`,
                name: profileForm.name,
                userId: 'current_user',
                language: profileForm.language,
                voiceType: profileForm.voiceType,
                speakingRate: profileForm.speakingRate,
                pitch: profileForm.pitch,
                audioSamples: [],
                modelChecksum: '',
                trainingStatus: 'untrained',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            setProfiles([...profiles, newProfile]);
            setShowCreateDialog(false);
            setProfileForm({
                name: '',
                language: 'en',
                voiceType: 'female',
                speakingRate: 1.0,
                pitch: 1.0,
            });
        } catch (error) {
            console.error('Failed to create profile:', error);
        }
    };

    const handleEditProfile = (profile: VoiceProfile) => {
        setEditingProfile(profile);
        setProfileForm({
            name: profile.name,
            language: profile.language,
            voiceType: profile.voiceType,
            speakingRate: profile.speakingRate,
            pitch: profile.pitch,
        });
        setShowEditDialog(true);
    };

    const handleUpdateProfile = async () => {
        if (!editingProfile) return;

        try {
            const updatedProfile: VoiceProfile = {
                ...editingProfile,
                name: profileForm.name,
                language: profileForm.language,
                voiceType: profileForm.voiceType,
                speakingRate: profileForm.speakingRate,
                pitch: profileForm.pitch,
                updatedAt: new Date()
            };

            setProfiles(profiles.map(p => p.id === editingProfile.id ? updatedProfile : p));
            setShowEditDialog(false);
            setEditingProfile(null);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleDeleteProfile = async (profileId: string) => {
        if (confirm('Are you sure you want to delete this voice profile?')) {
            try {
                setProfiles(profiles.filter(p => p.id !== profileId));
            } catch (error) {
                console.error('Failed to delete profile:', error);
            }
        }
    };

    const handleTrainProfile = async (profileId: string) => {
        try {
            // Update profile status to training
            setProfiles(profiles.map(p =>
                p.id === profileId ? { ...p, trainingStatus: 'training' as const } : p
            ));

            // Start training progress simulation
            setTrainingProgress({
                profileId,
                stage: 'preprocessing',
                progress: 0,
                estimatedTimeRemaining: 3600,
                message: 'Initializing voice model training...'
            });

            console.log('Starting training for profile:', profileId);
        } catch (error) {
            console.error('Failed to start training:', error);
        }
    };

    const handleTestProfile = async (profileId: string) => {
        console.log('Testing profile:', profileId);
        // This would open a voice testing dialog
    };

    const handleUploadSamples = async (profileId: string, files: FileList, texts: string[]) => {
        console.log('Uploading samples for profile:', profileId, files, texts);
        // Handle file uploads
    };

    const handleDeleteSample = async (profileId: string, sampleId: string) => {
        setProfiles(profiles.map(profile =>
            profile.id === profileId
                ? { ...profile, audioSamples: profile.audioSamples.filter(s => s.id !== sampleId) }
                : profile
        ));
    };

    const handlePlaySample = (sampleId: string) => {
        console.log('Playing sample:', sampleId);
    };

    const profileFormDialog = (
        <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
            if (!open) {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setEditingProfile(null);
            }
        }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {showCreateDialog ? 'Create Voice Profile' : 'Edit Voice Profile'}
                    </DialogTitle>
                    <DialogDescription>
                        Configure voice parameters and settings for the new profile.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Profile Name</Label>
                        <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            placeholder="Enter profile name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={profileForm.language}
                                onValueChange={(value: 'ml' | 'en' | 'manglish') =>
                                    setProfileForm({ ...profileForm, language: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ml">Malayalam</SelectItem>
                                    <SelectItem value="manglish">Manglish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="voiceType">Voice Type</Label>
                            <Select
                                value={profileForm.voiceType}
                                onValueChange={(value: 'male' | 'female' | 'child' | 'elderly') =>
                                    setProfileForm({ ...profileForm, voiceType: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="child">Child</SelectItem>
                                    <SelectItem value="elderly">Elderly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="speakingRate">Speaking Rate: {profileForm.speakingRate}x</Label>
                            <input
                                type="range"
                                id="speakingRate"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={profileForm.speakingRate}
                                onChange={(e) => setProfileForm({ ...profileForm, speakingRate: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="pitch">Pitch: {profileForm.pitch}x</Label>
                            <input
                                type="range"
                                id="pitch"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={profileForm.pitch}
                                onChange={(e) => setProfileForm({ ...profileForm, pitch: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            onClick={showCreateDialog ? handleCreateProfile : handleUpdateProfile}
                            className="flex-1"
                        >
                            {showCreateDialog ? 'Create Profile' : 'Update Profile'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCreateDialog(false);
                                setShowEditDialog(false);
                                setEditingProfile(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading voice profiles...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Voice Clone Management</h1>
                    <p className="text-gray-600">Create and manage AI voice cloning profiles</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Voice Profiles ({profiles.length})
                            </CardTitle>
                            <CardDescription>
                                Manage your voice cloning profiles and training data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profiles.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No voice profiles created</p>
                                    <p className="text-sm">Create your first profile to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {profiles.map(profile => (
                                        <VoiceProfileCard
                                            key={profile.id}
                                            profile={profile}
                                            onEdit={handleEditProfile}
                                            onDelete={handleDeleteProfile}
                                            onTrain={handleTrainProfile}
                                            onTest={handleTestProfile}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Audio Sample Management */}
                    {selectedProfile && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileAudio className="w-5 h-5" />
                                    Audio Samples - {selectedProfile.name}
                                </CardTitle>
                                <CardDescription>
                                    Upload and manage training audio samples
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AudioSampleManager
                                    samples={selectedProfile.audioSamples}
                                    onUpload={(files, texts) => handleUploadSamples(selectedProfile.id, files, texts)}
                                    onDelete={(sampleId) => handleDeleteSample(selectedProfile.id, sampleId)}
                                    onPlay={handlePlaySample}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Training Progress Panel */}
                <div className="space-y-4">
                    <TrainingProgressPanel
                        progress={trainingProgress}
                        onCancel={() => setTrainingProgress(null)}
                    />

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Profiles</span>
                                <Badge>{profiles.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Trained Models</span>
                                <Badge>{profiles.filter(p => p.trainingStatus === 'trained').length}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">In Training</span>
                                <Badge variant="secondary">
                                    {profiles.filter(p => p.trainingStatus === 'training').length}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Samples</span>
                                <Badge variant="outline">
                                    {profiles.reduce((sum, p) => sum + p.audioSamples.length, 0)}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Profile Form Dialog */}
            {profileFormDialog}
        </div>
    );
}