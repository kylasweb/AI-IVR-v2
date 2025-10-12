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
import {
    Upload,
    Download,
    Trash2,
    Settings,
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
    Globe,
    Zap,
    BarChart3,
    Brain,
    Target,
    Shield,
    Eye,
    Users,
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
    Settings as FolderOpen,
    Settings as HardDrive,
    Database,
    Upload as CloudUpload,
    FileText,
    Mic,
    Activity as Waveform,
    PieChart,
    BarChart3 as BarChart,
    LineChart,
    Settings as Hash,
    CheckCircle as FileCheck,
    XCircle as FileX,
    Settings as Folder,
    FileText as File,
    ArrowRight,
    ArrowLeft,
    MoreHorizontal,
    TrendingUp as SortAsc,
    TrendingUp as SortDesc
} from 'lucide-react';

// Training Data Interfaces
interface TrainingDataFile {
    id: string;
    name: string;
    size: number;
    type: 'audio' | 'text' | 'metadata';
    format: string;
    language: 'ml' | 'en' | 'manglish';
    quality: 'low' | 'medium' | 'high' | 'premium';
    duration?: number; // for audio files
    transcript?: string;
    speakerInfo?: {
        age: string;
        gender: string;
        accent: string;
        emotion: string;
    };
    uploadedAt: Date;
    processedAt?: Date;
    status: 'uploading' | 'processing' | 'processed' | 'error' | 'validated' | 'rejected';
    validationResults?: ValidationResult;
    tags: string[];
    metadata: Record<string, any>;
}

interface ValidationResult {
    isValid: boolean;
    score: number;
    issues: Array<{
        type: 'audio_quality' | 'duration' | 'noise_level' | 'transcript_mismatch' | 'format_error';
        severity: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        suggestion?: string;
    }>;
    audioAnalysis?: {
        signalToNoiseRatio: number;
        peakAmplitude: number;
        averageAmplitude: number;
        frequencyRange: [number, number];
        silencePercentage: number;
    };
}

interface DatasetStats {
    totalFiles: number;
    totalSize: number;
    totalDuration: number;
    languageDistribution: Record<string, number>;
    qualityDistribution: Record<string, number>;
    speakerDistribution: Record<string, number>;
    processingStats: {
        processed: number;
        processing: number;
        pending: number;
        errors: number;
    };
}

interface BatchOperation {
    id: string;
    type: 'upload' | 'process' | 'validate' | 'export' | 'delete';
    files: string[];
    status: 'pending' | 'running' | 'completed' | 'error';
    progress: number;
    startedAt: Date;
    completedAt?: Date;
    results?: {
        successful: number;
        failed: number;
        errors: string[];
    };
}

// File Upload Component with Advanced Features
const AdvancedFileUpload: React.FC<{
    onUpload: (files: FileList, metadata: any) => void;
    acceptedFormats: string[];
    maxFileSize: number;
    isUploading: boolean;
}> = ({ onUpload, acceptedFormats, maxFileSize, isUploading }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploadMetadata, setUploadMetadata] = useState({
        language: 'en' as 'ml' | 'en' | 'manglish',
        tags: '',
        speakerAge: '',
        speakerGender: '',
        speakerAccent: '',
        emotion: 'neutral'
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files).filter(file => {
            const extension = file.name.split('.').pop()?.toLowerCase();
            return acceptedFormats.includes(`.${extension}`);
        });

        if (files.length > 0) {
            setSelectedFiles(files);
        }
    }, [acceptedFormats]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            const fileList = selectedFiles as any as FileList;
            onUpload(fileList, uploadMetadata);
            setSelectedFiles([]);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const hasOversizedFiles = selectedFiles.some(file => file.size > maxFileSize);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CloudUpload className="w-5 h-5" />
                    Advanced File Upload
                </CardTitle>
                <CardDescription>
                    Upload training data with automatic validation and metadata extraction
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Drop Zone */}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' :
                        hasOversizedFiles ? 'border-red-300 bg-red-50' :
                            'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center gap-2">
                        <Upload className={`w-8 h-8 ${hasOversizedFiles ? 'text-red-400' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-sm font-medium">
                                {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'Upload Training Data'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Drag and drop files or{' '}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-blue-600 hover:underline"
                                >
                                    browse
                                </button>
                            </p>
                        </div>
                        <p className="text-xs text-gray-400">
                            Supports: {acceptedFormats.join(', ')} (Max {formatFileSize(maxFileSize)} per file)
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedFormats.join(',')}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
                            <Badge variant={hasOversizedFiles ? 'destructive' : 'secondary'}>
                                Total: {formatFileSize(totalSize)}
                            </Badge>
                        </div>

                        <ScrollArea className="h-32 border rounded p-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-2 rounded mb-1 ${file.size > maxFileSize ? 'bg-red-50 text-red-700' : 'bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileAudio className="w-4 h-4" />
                                        <div>
                                            <p className="text-xs font-medium truncate max-w-32">{file.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    {file.size > maxFileSize && (
                                        <Badge variant="destructive" className="text-xs">Too Large</Badge>
                                    )}
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                )}

                {/* Upload Metadata */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={uploadMetadata.language}
                            onValueChange={(value: 'ml' | 'en' | 'manglish') =>
                                setUploadMetadata(prev => ({ ...prev, language: value }))
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
                        <Label htmlFor="emotion">Emotion</Label>
                        <Select
                            value={uploadMetadata.emotion}
                            onValueChange={(value) =>
                                setUploadMetadata(prev => ({ ...prev, emotion: value }))
                            }
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
                        <Label htmlFor="speakerGender">Speaker Gender</Label>
                        <Select
                            value={uploadMetadata.speakerGender}
                            onValueChange={(value) =>
                                setUploadMetadata(prev => ({ ...prev, speakerGender: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="speakerAge">Speaker Age</Label>
                        <Select
                            value={uploadMetadata.speakerAge}
                            onValueChange={(value) =>
                                setUploadMetadata(prev => ({ ...prev, speakerAge: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select age range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="child">Child (0-12)</SelectItem>
                                <SelectItem value="teen">Teen (13-19)</SelectItem>
                                <SelectItem value="young">Young Adult (20-35)</SelectItem>
                                <SelectItem value="middle">Middle Age (36-55)</SelectItem>
                                <SelectItem value="senior">Senior (55+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                        id="tags"
                        value={uploadMetadata.tags}
                        onChange={(e) => setUploadMetadata(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g., formal, customer-service, phone-quality"
                    />
                </div>

                {/* Upload Button */}
                <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || hasOversizedFiles || isUploading}
                    className="w-full flex items-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            Uploading Files...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                        </>
                    )}
                </Button>

                {hasOversizedFiles && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Some files exceed the maximum size limit of {formatFileSize(maxFileSize)}.
                            Please remove or compress these files before uploading.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

// Data File Card Component
const DataFileCard: React.FC<{
    file: TrainingDataFile;
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
    onPlay: (fileId: string) => void;
    onEdit: (fileId: string) => void;
    onDelete: (fileId: string) => void;
    onViewDetails: (file: TrainingDataFile) => void;
}> = ({ file, isSelected, onSelect, onPlay, onEdit, onDelete, onViewDetails }) => {
    const getStatusIcon = (status: TrainingDataFile['status']) => {
        switch (status) {
            case 'processed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'processing': return <RotateCw className="w-4 h-4 text-blue-600 animate-spin" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'validated': return <Shield className="w-4 h-4 text-green-600" />;
            case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: TrainingDataFile['status']) => {
        switch (status) {
            case 'processed': return 'bg-green-50 border-green-200';
            case 'processing': return 'bg-blue-50 border-blue-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'validated': return 'bg-emerald-50 border-emerald-200';
            case 'rejected': return 'bg-orange-50 border-orange-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'premium': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'high': return 'text-green-600 bg-green-50 border-green-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className={`transition-all hover:shadow-md ${getStatusColor(file.status)}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Selection Checkbox */}
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onSelect}
                        className="mt-1"
                    />

                    {/* File Icon */}
                    <div className="flex-shrink-0">
                        {file.type === 'audio' ? (
                            <FileAudio className="w-8 h-8 text-blue-600" />
                        ) : file.type === 'text' ? (
                            <FileText className="w-8 h-8 text-green-600" />
                        ) : (
                            <File className="w-8 h-8 text-gray-600" />
                        )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-medium truncate">{file.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(file.status)}
                                    <span className="text-xs text-gray-600 capitalize">{file.status}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {file.language.toUpperCase()}
                                    </Badge>
                                    <Badge className={`text-xs ${getQualityColor(file.quality)}`}>
                                        {file.quality}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                                {file.type === 'audio' && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onPlay(file.id)}
                                        className="w-7 h-7 p-0"
                                    >
                                        <Play className="w-3 h-3" />
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onViewDetails(file)}
                                    className="w-7 h-7 p-0"
                                >
                                    <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onEdit(file.id)}
                                    className="w-7 h-7 p-0"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onDelete(file.id)}
                                    className="w-7 h-7 p-0 text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        {/* File Details */}
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                            <div>Size: {formatFileSize(file.size)}</div>
                            <div>Duration: {formatDuration(file.duration)}</div>
                            <div>Format: {file.format.toUpperCase()}</div>
                            <div>Uploaded: {file.uploadedAt.toLocaleDateString()}</div>
                        </div>

                        {/* Tags */}
                        {file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {file.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                        {tag}
                                    </Badge>
                                ))}
                                {file.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                        +{file.tags.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Validation Issues */}
                        {file.validationResults && !file.validationResults.isValid && (
                            <Alert className="mt-2 p-2">
                                <AlertTriangle className="h-3 w-3" />
                                <AlertDescription className="text-xs">
                                    {file.validationResults.issues.length} validation issue(s) found
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Dataset Statistics Component
const DatasetStatistics: React.FC<{
    stats: DatasetStats;
}> = ({ stats }) => {
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overview Stats */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Total Files</p>
                            <p className="text-2xl font-bold">{stats.totalFiles}</p>
                        </div>
                        <Database className="w-8 h-8 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Total Size</p>
                            <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                        </div>
                        <HardDrive className="w-8 h-8 text-green-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Total Duration</p>
                            <p className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Processing</p>
                            <p className="text-2xl font-bold">{stats.processingStats.processing}</p>
                        </div>
                        <RotateCw className="w-8 h-8 text-orange-600 animate-spin" />
                    </div>
                </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Language Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {Object.entries(stats.languageDistribution).map(([lang, count]) => (
                        <div key={lang} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{lang === 'ml' ? 'Malayalam' : lang === 'en' ? 'English' : 'Manglish'}</span>
                            <div className="flex items-center gap-2">
                                <Progress
                                    value={(count / stats.totalFiles) * 100}
                                    className="w-20 h-2"
                                />
                                <span className="text-xs text-gray-600 w-8">{count}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Quality Distribution */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quality Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {Object.entries(stats.qualityDistribution).map(([quality, count]) => (
                        <div key={quality} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{quality}</span>
                            <div className="flex items-center gap-2">
                                <Progress
                                    value={(count / stats.totalFiles) * 100}
                                    className="w-20 h-2"
                                />
                                <span className="text-xs text-gray-600 w-8">{count}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

// Main Training Data Management Component
export default function TrainingDataManagement() {
    const [files, setFiles] = useState<TrainingDataFile[]>([]);
    const [stats, setStats] = useState<DatasetStats | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('files');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterLanguage, setFilterLanguage] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('uploadedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedFile, setSelectedFile] = useState<TrainingDataFile | null>(null);
    const [showFileDetails, setShowFileDetails] = useState(false);

    // Load data on component mount
    useEffect(() => {
        loadFiles();
        loadStats();
    }, []);

    const loadFiles = async () => {
        setIsLoading(true);
        try {
            // Mock data - replace with actual API call
            const mockFiles: TrainingDataFile[] = [
                {
                    id: 'file_1',
                    name: 'customer_service_call_001.wav',
                    size: 2450000,
                    type: 'audio',
                    format: 'wav',
                    language: 'en',
                    quality: 'high',
                    duration: 45.2,
                    transcript: 'Thank you for calling customer service. How can I help you today?',
                    speakerInfo: {
                        age: 'young',
                        gender: 'female',
                        accent: 'american',
                        emotion: 'professional'
                    },
                    uploadedAt: new Date('2024-02-10'),
                    processedAt: new Date('2024-02-10'),
                    status: 'validated',
                    validationResults: {
                        isValid: true,
                        score: 0.95,
                        issues: [],
                        audioAnalysis: {
                            signalToNoiseRatio: 25.4,
                            peakAmplitude: 0.8,
                            averageAmplitude: 0.3,
                            frequencyRange: [80, 8000],
                            silencePercentage: 15
                        }
                    },
                    tags: ['customer-service', 'professional', 'phone-quality'],
                    metadata: {}
                },
                {
                    id: 'file_2',
                    name: 'malayalam_conversation_002.mp3',
                    size: 1890000,
                    type: 'audio',
                    format: 'mp3',
                    language: 'ml',
                    quality: 'medium',
                    duration: 32.1,
                    transcript: 'നമസ്കാരം, എങ്ങനെ സഹായിക്കാൻ കഴിയും?',
                    speakerInfo: {
                        age: 'middle',
                        gender: 'male',
                        accent: 'kerala',
                        emotion: 'friendly'
                    },
                    uploadedAt: new Date('2024-02-09'),
                    status: 'processing',
                    tags: ['malayalam', 'conversational', 'friendly'],
                    metadata: {}
                },
                {
                    id: 'file_3',
                    name: 'noisy_sample_003.wav',
                    size: 3200000,
                    type: 'audio',
                    format: 'wav',
                    language: 'en',
                    quality: 'low',
                    duration: 28.7,
                    uploadedAt: new Date('2024-02-08'),
                    status: 'rejected',
                    validationResults: {
                        isValid: false,
                        score: 0.35,
                        issues: [
                            {
                                type: 'noise_level',
                                severity: 'high',
                                message: 'Excessive background noise detected',
                                suggestion: 'Use noise reduction or re-record in a quieter environment'
                            },
                            {
                                type: 'audio_quality',
                                severity: 'medium',
                                message: 'Low signal-to-noise ratio',
                                suggestion: 'Increase microphone gain or move closer to the microphone'
                            }
                        ]
                    },
                    tags: ['low-quality', 'noisy'],
                    metadata: {}
                }
            ];

            setFiles(mockFiles);
        } catch (error) {
            console.error('Failed to load training files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            // Mock stats - replace with actual API call
            const mockStats: DatasetStats = {
                totalFiles: 3,
                totalSize: 7540000,
                totalDuration: 106,
                languageDistribution: {
                    'en': 2,
                    'ml': 1,
                    'manglish': 0
                },
                qualityDistribution: {
                    'high': 1,
                    'medium': 1,
                    'low': 1,
                    'premium': 0
                },
                speakerDistribution: {
                    'male': 1,
                    'female': 1,
                    'child': 0,
                    'other': 1
                },
                processingStats: {
                    processed: 1,
                    processing: 1,
                    pending: 0,
                    errors: 1
                }
            };

            setStats(mockStats);
        } catch (error) {
            console.error('Failed to load dataset statistics:', error);
        }
    };

    const handleUpload = async (fileList: FileList, metadata: any) => {
        setIsUploading(true);
        try {
            // Simulate upload process
            const newFiles: TrainingDataFile[] = Array.from(fileList).map((file, index) => ({
                id: `file_${Date.now()}_${index}`,
                name: file.name,
                size: file.size,
                type: file.type.startsWith('audio/') ? 'audio' : 'text',
                format: file.name.split('.').pop() || '',
                language: metadata.language,
                quality: 'medium',
                duration: file.type.startsWith('audio/') ? Math.random() * 60 + 10 : undefined,
                speakerInfo: {
                    age: metadata.speakerAge,
                    gender: metadata.speakerGender,
                    accent: '',
                    emotion: metadata.emotion
                },
                uploadedAt: new Date(),
                status: 'uploading',
                tags: metadata.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
                metadata: {}
            }));

            // Add files with uploading status
            setFiles(prev => [...prev, ...newFiles]);

            // Simulate processing
            setTimeout(() => {
                setFiles(prev => prev.map(file =>
                    newFiles.some(nf => nf.id === file.id)
                        ? { ...file, status: 'processing' as const }
                        : file
                ));

                // Complete processing
                setTimeout(() => {
                    setFiles(prev => prev.map(file =>
                        newFiles.some(nf => nf.id === file.id)
                            ? { ...file, status: 'processed' as const, processedAt: new Date() }
                            : file
                    ));
                    loadStats(); // Refresh stats
                }, 2000);
            }, 1000);

        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (fileId: string, selected: boolean) => {
        setSelectedFiles(prev =>
            selected
                ? [...prev, fileId]
                : prev.filter(id => id !== fileId)
        );
    };

    const handleSelectAll = () => {
        const filteredFileIds = filteredFiles.map(f => f.id);
        setSelectedFiles(prev =>
            prev.length === filteredFileIds.length
                ? []
                : filteredFileIds
        );
    };

    const handleBatchDelete = () => {
        if (selectedFiles.length === 0) return;

        if (confirm(`Delete ${selectedFiles.length} selected files? This action cannot be undone.`)) {
            setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
            setSelectedFiles([]);
            loadStats();
        }
    };

    const handleFilePlay = (fileId: string) => {
        console.log('Playing file:', fileId);
        // Implement audio playback
    };

    const handleFileEdit = (fileId: string) => {
        console.log('Editing file:', fileId);
        // Open edit dialog
    };

    const handleFileDelete = (fileId: string) => {
        if (confirm('Delete this file? This action cannot be undone.')) {
            setFiles(prev => prev.filter(file => file.id !== fileId));
            loadStats();
        }
    };

    const handleViewDetails = (file: TrainingDataFile) => {
        setSelectedFile(file);
        setShowFileDetails(true);
    };

    // Filter and sort files
    const filteredFiles = files
        .filter(file => {
            if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            if (filterStatus !== 'all' && file.status !== filterStatus) {
                return false;
            }
            if (filterLanguage !== 'all' && file.language !== filterLanguage) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            const aVal = a[sortBy as keyof TrainingDataFile];
            const bVal = b[sortBy as keyof TrainingDataFile];

            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RotateCw className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading training data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Training Data Management</h1>
                    <p className="text-gray-600">Upload, organize, and validate voice training datasets</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    {files.length} Files
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    <TabsTrigger value="batch">Batch Operations</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                    <AdvancedFileUpload
                        onUpload={handleUpload}
                        acceptedFormats={['.wav', '.mp3', '.m4a', '.flac', '.ogg']}
                        maxFileSize={50 * 1024 * 1024} // 50MB
                        isUploading={isUploading}
                    />
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                    {/* Search and Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-64">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search files..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="uploading">Uploading</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="processed">Processed</SelectItem>
                                        <SelectItem value="validated">Validated</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Languages</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ml">Malayalam</SelectItem>
                                        <SelectItem value="manglish">Manglish</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                                    const [field, order] = value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order as 'asc' | 'desc');
                                }}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="uploadedAt-desc">Newest First</SelectItem>
                                        <SelectItem value="uploadedAt-asc">Oldest First</SelectItem>
                                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                                        <SelectItem value="name-desc">Name Z-A</SelectItem>
                                        <SelectItem value="size-desc">Largest First</SelectItem>
                                        <SelectItem value="size-asc">Smallest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Batch Actions */}
                    {selectedFiles.length > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                                    </span>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setSelectedFiles([])}>
                                            Clear Selection
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete Selected
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Files List */}
                    <div className="space-y-4">
                        {filteredFiles.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileAudio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No training files found</p>
                                <p className="text-sm">Upload files in the Upload tab to get started</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">
                                        Files ({filteredFiles.length})
                                    </h3>
                                    <Button size="sm" variant="outline" onClick={handleSelectAll}>
                                        {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>

                                <div className="grid gap-4">
                                    {filteredFiles.map(file => (
                                        <DataFileCard
                                            key={file.id}
                                            file={file}
                                            isSelected={selectedFiles.includes(file.id)}
                                            onSelect={(selected) => handleFileSelect(file.id, selected)}
                                            onPlay={handleFilePlay}
                                            onEdit={handleFileEdit}
                                            onDelete={handleFileDelete}
                                            onViewDetails={handleViewDetails}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="statistics">
                    {stats && <DatasetStatistics stats={stats} />}
                </TabsContent>

                <TabsContent value="batch">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Operations</CardTitle>
                            <CardDescription>
                                Manage large-scale operations on your training data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500">
                                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Batch operations coming soon</p>
                                <p className="text-sm">Process multiple files simultaneously</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* File Details Dialog */}
            {selectedFile && (
                <Dialog open={showFileDetails} onOpenChange={setShowFileDetails}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>File Details</DialogTitle>
                            <DialogDescription>
                                Detailed information and validation results for {selectedFile.name}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label>File Name</Label>
                                    <p className="font-mono text-xs break-all">{selectedFile.name}</p>
                                </div>
                                <div>
                                    <Label>Size</Label>
                                    <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div>
                                    <Label>Duration</Label>
                                    <p>{selectedFile.duration ? `${selectedFile.duration.toFixed(1)}s` : 'N/A'}</p>
                                </div>
                                <div>
                                    <Label>Format</Label>
                                    <p>{selectedFile.format.toUpperCase()}</p>
                                </div>
                                <div>
                                    <Label>Language</Label>
                                    <p className="capitalize">{selectedFile.language}</p>
                                </div>
                                <div>
                                    <Label>Quality</Label>
                                    <p className="capitalize">{selectedFile.quality}</p>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <p className="capitalize">{selectedFile.status}</p>
                                </div>
                                <div>
                                    <Label>Uploaded</Label>
                                    <p>{selectedFile.uploadedAt.toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Speaker Info */}
                            {selectedFile.speakerInfo && (
                                <div>
                                    <Label>Speaker Information</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                                        <div>Age: {selectedFile.speakerInfo.age}</div>
                                        <div>Gender: {selectedFile.speakerInfo.gender}</div>
                                        <div>Accent: {selectedFile.speakerInfo.accent || 'Not specified'}</div>
                                        <div>Emotion: {selectedFile.speakerInfo.emotion}</div>
                                    </div>
                                </div>
                            )}

                            {/* Transcript */}
                            {selectedFile.transcript && (
                                <div>
                                    <Label>Transcript</Label>
                                    <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">{selectedFile.transcript}</p>
                                </div>
                            )}

                            {/* Tags */}
                            {selectedFile.tags.length > 0 && (
                                <div>
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {selectedFile.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Validation Results */}
                            {selectedFile.validationResults && (
                                <div>
                                    <Label>Validation Results</Label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm">Overall Score</span>
                                            <Badge variant={selectedFile.validationResults.isValid ? 'default' : 'destructive'}>
                                                {(selectedFile.validationResults.score * 100).toFixed(1)}%
                                            </Badge>
                                        </div>

                                        {selectedFile.validationResults.issues.length > 0 && (
                                            <div className="space-y-1">
                                                {selectedFile.validationResults.issues.map((issue, index) => (
                                                    <Alert key={index} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertDescription className="text-sm">
                                                            <strong className="capitalize">{issue.type.replace('_', ' ')}:</strong> {issue.message}
                                                            {issue.suggestion && (
                                                                <p className="mt-1 text-xs text-gray-600">💡 {issue.suggestion}</p>
                                                            )}
                                                        </AlertDescription>
                                                    </Alert>
                                                ))}
                                            </div>
                                        )}

                                        {/* Audio Analysis */}
                                        {selectedFile.validationResults.audioAnalysis && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <h4 className="text-sm font-medium mb-2">Audio Analysis</h4>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>SNR: {selectedFile.validationResults.audioAnalysis.signalToNoiseRatio.toFixed(1)} dB</div>
                                                    <div>Peak: {selectedFile.validationResults.audioAnalysis.peakAmplitude.toFixed(2)}</div>
                                                    <div>Avg: {selectedFile.validationResults.audioAnalysis.averageAmplitude.toFixed(2)}</div>
                                                    <div>Silence: {selectedFile.validationResults.audioAnalysis.silencePercentage}%</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}