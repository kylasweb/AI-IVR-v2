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
    XCircle as Stop,
    Upload,
    Download,
    Trash2,
    Settings,
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
    AlertTriangle
} from 'lucide-react';

// Import the voice biometrics service interfaces
interface VoiceProfile {
    id: string;
    userId: string;
    voiceprint: string;
    confidence: number;
    createdAt: Date;
    lastUsed: Date;
    verificationCount: number;
    successRate: number;
}

interface VerificationResult {
    success: boolean;
    confidence: number;
    userId?: string;
    reason?: string;
}

interface VoiceBiometricsAnalytics {
    totalProfiles: number;
    averageSuccessRate: number;
    totalVerifications: number;
    enrollmentsToday: number;
    verificationsToday: number;
    recentVerifications: Array<{
        id: string;
        userId: string;
        timestamp: Date;
        success: boolean;
        confidence: number;
        ipAddress: string;
        deviceType: string;
    }>;
    securityAlerts: Array<{
        id: string;
        type: 'suspicious_attempt' | 'low_confidence' | 'multiple_failures' | 'new_device';
        userId: string;
        timestamp: Date;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
}

interface EnrollmentSession {
    id: string;
    userId: string;
    status: 'recording' | 'processing' | 'completed' | 'failed';
    samplesRequired: number;
    samplesRecorded: number;
    currentInstruction: string;
    startedAt: Date;
}

// Voice Profile Card Component
const VoiceProfileCard: React.FC<{
    profile: VoiceProfile;
    onViewDetails: (profile: VoiceProfile) => void;
    onDeleteProfile: (profileId: string) => void;
    onUpdateProfile: (profileId: string) => void;
    onTestVerification: (profileId: string) => void;
}> = ({ profile, onViewDetails, onDeleteProfile, onUpdateProfile, onTestVerification }) => {
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.9) return 'text-green-600';
        if (confidence >= 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 0.95) return 'bg-green-500';
        if (rate >= 0.85) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const isActive = (lastUsed: Date) => {
        const daysSinceUsed = (Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUsed <= 7;
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isActive(profile.lastUsed) ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-4 h-4" />
                                User {profile.userId}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant={isActive(profile.lastUsed) ? 'default' : 'secondary'}>
                                    {isActive(profile.lastUsed) ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    ID: {profile.id.slice(0, 8)}...
                                </Badge>
                            </CardDescription>
                        </div>
                    </div>
                    <div className={`text-sm font-medium ${getConfidenceColor(profile.confidence)}`}>
                        {(profile.confidence * 100).toFixed(1)}%
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Security Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Success Rate</span>
                            <span className="text-sm font-medium">{(profile.successRate * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={profile.successRate * 100} className="h-2" />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Verifications</span>
                            <span className="text-sm font-medium">{profile.verificationCount}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            Last: {formatDate(profile.lastUsed)}
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Enrolled:</span>
                        <span>{formatDate(profile.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className={getConfidenceColor(profile.confidence)}>
                            {(profile.confidence * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTestVerification(profile.id)}
                        className="flex-1 flex items-center gap-1"
                    >
                        <Shield className="w-3 h-3" />
                        Test
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateProfile(profile.id)}
                        className="flex-1 flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Update
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(profile)}
                        className="flex items-center gap-1"
                    >
                        <Eye className="w-3 h-3" />
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteProfile(profile.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// Voice Enrollment Component
const VoiceEnrollmentPanel: React.FC<{
    session: EnrollmentSession | null;
    onStartEnrollment: (userId: string) => void;
    onStopEnrollment: () => void;
    onRecordSample: () => void;
}> = ({ session, onStartEnrollment, onStopEnrollment, onRecordSample }) => {
    const [userId, setUserId] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const enrollmentInstructions = [
        "Please say: 'My voice is my password, verify me.'",
        "Please say: 'Voice authentication is secure and convenient.'",
        "Please say: 'I authorize this voice enrollment for security.'",
        "Please count from one to ten clearly.",
        "Please state your full name and today's date."
    ];

    const getProgressColor = () => {
        if (!session) return 'bg-gray-200';
        const progress = (session.samplesRecorded / session.samplesRequired) * 100;
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 60) return 'bg-blue-500';
        return 'bg-yellow-500';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Voice Enrollment
                </CardTitle>
                <CardDescription>
                    Enroll new users for voice biometric authentication
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {!session ? (
                    // Start Enrollment
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter user ID for enrollment"
                            />
                        </div>

                        <Button
                            onClick={() => onStartEnrollment(userId)}
                            disabled={!userId.trim()}
                            className="w-full flex items-center gap-2"
                        >
                            <User className="w-4 h-4" />
                            Start Voice Enrollment
                        </Button>

                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Voice enrollment requires 5 audio samples to create a secure voiceprint.
                                Each sample should be 3-5 seconds of clear speech.
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : (
                    // Active Enrollment Session
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Enrolling: {session.userId}</span>
                                <Badge variant="secondary">
                                    {session.samplesRecorded}/{session.samplesRequired}
                                </Badge>
                            </div>

                            <Progress
                                value={(session.samplesRecorded / session.samplesRequired) * 100}
                                className="h-3 mb-2"
                            />

                            <p className="text-sm text-gray-600">
                                Sample {session.samplesRecorded + 1} of {session.samplesRequired}
                            </p>
                        </div>

                        {/* Current Instruction */}
                        <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                            <h4 className="font-medium mb-2">Recording Instruction:</h4>
                            <p className="text-blue-800">
                                {session.currentInstruction}
                            </p>
                        </div>

                        {/* Recording Controls */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setIsRecording(!isRecording);
                                    if (!isRecording) onRecordSample();
                                }}
                                variant={isRecording ? "destructive" : "default"}
                                className="flex-1 flex items-center gap-2"
                            >
                                {isRecording ? (
                                    <>
                                        <Stop className="w-4 h-4" />
                                        Stop Recording
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-4 h-4" />
                                        Start Recording
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={onStopEnrollment}
                                className="flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </Button>
                        </div>

                        {/* Status */}
                        <div className="text-sm text-gray-600 text-center space-y-1">
                            {session.status === 'recording' && (
                                <div className="flex items-center justify-center gap-2 text-red-600">
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                    Recording in progress...
                                </div>
                            )}
                            {session.status === 'processing' && (
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                    <RotateCw className="w-4 h-4 animate-spin" />
                                    Processing voice sample...
                                </div>
                            )}
                            {session.status === 'completed' && (
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    Enrollment completed successfully!
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Verification Testing Component
const VerificationTestPanel: React.FC<{
    onTestVerification: (userId?: string) => void;
    lastResult: VerificationResult | null;
}> = ({ onTestVerification, lastResult }) => {
    const [testUserId, setTestUserId] = useState('');
    const [testMode, setTestMode] = useState<'identify' | 'verify'>('identify');
    const [isRecording, setIsRecording] = useState(false);

    const getResultIcon = (result: VerificationResult | null) => {
        if (!result) return null;
        if (result.success) return <CheckCircle className="w-5 h-5 text-green-600" />;
        return <XCircle className="w-5 h-5 text-red-600" />;
    };

    const getResultColor = (result: VerificationResult | null) => {
        if (!result) return 'text-gray-600';
        if (result.success) return 'text-green-600';
        return 'text-red-600';
    };

    const handleTest = () => {
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            onTestVerification(testMode === 'verify' ? testUserId : undefined);
        }, 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Verification Testing
                </CardTitle>
                <CardDescription>
                    Test voice verification and identification
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Test Mode Selection */}
                <div className="space-y-2">
                    <Label>Test Mode</Label>
                    <Select value={testMode} onValueChange={(value: 'identify' | 'verify') => setTestMode(value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="identify">Voice Identification (Who is speaking?)</SelectItem>
                            <SelectItem value="verify">Voice Verification (Confirm specific user)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* User ID Input for Verification Mode */}
                {testMode === 'verify' && (
                    <div className="space-y-2">
                        <Label htmlFor="testUserId">User ID to Verify</Label>
                        <Input
                            id="testUserId"
                            value={testUserId}
                            onChange={(e) => setTestUserId(e.target.value)}
                            placeholder="Enter user ID"
                        />
                    </div>
                )}

                {/* Test Button */}
                <Button
                    onClick={handleTest}
                    disabled={isRecording || (testMode === 'verify' && !testUserId.trim())}
                    className="w-full flex items-center gap-2"
                >
                    {isRecording ? (
                        <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            Recording & Testing...
                        </>
                    ) : (
                        <>
                            <Mic className="w-4 h-4" />
                            Start Voice Test
                        </>
                    )}
                </Button>

                {/* Last Test Result */}
                {lastResult && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            {getResultIcon(lastResult)}
                            Test Result
                        </h4>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${getResultColor(lastResult)}`}>
                                    {lastResult.success ? 'Success' : 'Failed'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Confidence:</span>
                                <span className="font-medium">
                                    {(lastResult.confidence * 100).toFixed(1)}%
                                </span>
                            </div>

                            {lastResult.userId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Identified User:</span>
                                    <span className="font-medium">{lastResult.userId}</span>
                                </div>
                            )}

                            {lastResult.reason && (
                                <div className="mt-2 p-2 bg-red-50 rounded text-red-800 text-xs">
                                    {lastResult.reason}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Test Instructions */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Speak clearly into your microphone for 3-5 seconds when testing.
                        {testMode === 'identify' ?
                            ' The system will try to identify who you are.' :
                            ' The system will verify if you match the specified user.'}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

// Security Analytics Component
const SecurityAnalytics: React.FC<{
    analytics: VoiceBiometricsAnalytics;
}> = ({ analytics }) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <AlertTriangle className="w-4 h-4" />;
            case 'high': return <AlertCircle className="w-4 h-4" />;
            case 'medium': return <Info className="w-4 h-4" />;
            default: return <Shield className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Total Profiles</p>
                                <p className="text-2xl font-bold">{analytics.totalProfiles}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Success Rate</p>
                                <p className="text-2xl font-bold">{(analytics.averageSuccessRate * 100).toFixed(1)}%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Verifications</p>
                                <p className="text-2xl font-bold">{analytics.totalVerifications}</p>
                            </div>
                            <Activity className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">Today</p>
                                <p className="text-2xl font-bold">{analytics.verificationsToday}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Security Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Security Alerts
                    </CardTitle>
                    <CardDescription>
                        Recent security events and suspicious activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                        {analytics.securityAlerts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No security alerts</p>
                                <p className="text-xs">All voice authentication attempts are normal</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {analytics.securityAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {getSeverityIcon(alert.severity)}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm">
                                                        {alert.type.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {alert.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs mt-1">{alert.description}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                                                    <User className="w-3 h-3" />
                                                    <span>{alert.userId}</span>
                                                    <span>•</span>
                                                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Recent Verifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Verifications
                    </CardTitle>
                    <CardDescription>
                        Latest voice authentication attempts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-48">
                        {analytics.recentVerifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No recent verifications</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {analytics.recentVerifications.map((verification) => (
                                    <div key={verification.id} className="flex items-center gap-3 p-2 border rounded">
                                        {verification.success ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600" />
                                        )}

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">User {verification.userId}</span>
                                                <span className="text-xs text-gray-500">
                                                    {(verification.confidence * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(verification.timestamp).toLocaleString()} • {verification.deviceType}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

// Main Voice Biometrics Management Component
export default function VoiceBiometricsManagement() {
    const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
    const [analytics, setAnalytics] = useState<VoiceBiometricsAnalytics | null>(null);
    const [enrollmentSession, setEnrollmentSession] = useState<EnrollmentSession | null>(null);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profiles');

    // Load data on component mount
    useEffect(() => {
        loadProfiles();
        loadAnalytics();
    }, []);

    const loadProfiles = async () => {
        setIsLoading(true);
        try {
            // Mock data - replace with actual API call
            const mockProfiles: VoiceProfile[] = [
                {
                    id: 'voice_profile_1',
                    userId: 'user_001',
                    voiceprint: 'encrypted_voiceprint_data_1',
                    confidence: 0.92,
                    createdAt: new Date('2024-01-15'),
                    lastUsed: new Date('2024-02-10'),
                    verificationCount: 45,
                    successRate: 0.96
                },
                {
                    id: 'voice_profile_2',
                    userId: 'user_002',
                    voiceprint: 'encrypted_voiceprint_data_2',
                    confidence: 0.88,
                    createdAt: new Date('2024-02-01'),
                    lastUsed: new Date('2024-02-09'),
                    verificationCount: 23,
                    successRate: 0.89
                },
                {
                    id: 'voice_profile_3',
                    userId: 'user_003',
                    voiceprint: 'encrypted_voiceprint_data_3',
                    confidence: 0.75,
                    createdAt: new Date('2024-02-05'),
                    lastUsed: new Date('2024-02-08'),
                    verificationCount: 12,
                    successRate: 0.83
                }
            ];

            setProfiles(mockProfiles);
        } catch (error) {
            console.error('Failed to load voice profiles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            // Mock analytics data - replace with actual API call
            const mockAnalytics: VoiceBiometricsAnalytics = {
                totalProfiles: 3,
                averageSuccessRate: 0.89,
                totalVerifications: 80,
                enrollmentsToday: 1,
                verificationsToday: 8,
                recentVerifications: [
                    {
                        id: 'ver_1',
                        userId: 'user_001',
                        timestamp: new Date(),
                        success: true,
                        confidence: 0.94,
                        ipAddress: '192.168.1.100',
                        deviceType: 'Desktop'
                    },
                    {
                        id: 'ver_2',
                        userId: 'user_002',
                        timestamp: new Date(Date.now() - 300000),
                        success: false,
                        confidence: 0.65,
                        ipAddress: '192.168.1.101',
                        deviceType: 'Mobile'
                    }
                ],
                securityAlerts: [
                    {
                        id: 'alert_1',
                        type: 'low_confidence',
                        userId: 'user_002',
                        timestamp: new Date(Date.now() - 600000),
                        description: 'Voice verification attempt with unusually low confidence score',
                        severity: 'medium'
                    },
                    {
                        id: 'alert_2',
                        type: 'multiple_failures',
                        userId: 'user_003',
                        timestamp: new Date(Date.now() - 900000),
                        description: 'Multiple failed verification attempts detected',
                        severity: 'high'
                    }
                ]
            };

            setAnalytics(mockAnalytics);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    };

    const handleStartEnrollment = (userId: string) => {
        const newSession: EnrollmentSession = {
            id: `enrollment_${Date.now()}`,
            userId,
            status: 'recording',
            samplesRequired: 5,
            samplesRecorded: 0,
            currentInstruction: "Please say: 'My voice is my password, verify me.'",
            startedAt: new Date()
        };

        setEnrollmentSession(newSession);
    };

    const handleStopEnrollment = () => {
        setEnrollmentSession(null);
    };

    const handleRecordSample = () => {
        if (!enrollmentSession) return;

        const instructions = [
            "Please say: 'My voice is my password, verify me.'",
            "Please say: 'Voice authentication is secure and convenient.'",
            "Please say: 'I authorize this voice enrollment for security.'",
            "Please count from one to ten clearly.",
            "Please state your full name and today's date."
        ];

        setTimeout(() => {
            if (enrollmentSession) {
                let updatedSession: EnrollmentSession;

                if (enrollmentSession.samplesRecorded + 1 < enrollmentSession.samplesRequired) {
                    updatedSession = {
                        ...enrollmentSession,
                        samplesRecorded: enrollmentSession.samplesRecorded + 1,
                        currentInstruction: instructions[enrollmentSession.samplesRecorded + 1],
                        status: 'recording'
                    };
                } else {
                    updatedSession = {
                        ...enrollmentSession,
                        samplesRecorded: enrollmentSession.samplesRecorded + 1,
                        status: 'completed'
                    };
                    // Complete enrollment
                    setTimeout(() => {
                        setEnrollmentSession(null);
                        loadProfiles(); // Refresh profiles
                    }, 2000);
                } setEnrollmentSession(updatedSession);
            }
        }, 1000);
    };

    const handleTestVerification = (userId?: string) => {
        // Simulate verification test
        setTimeout(() => {
            const mockResult: VerificationResult = {
                success: Math.random() > 0.3,
                confidence: 0.5 + Math.random() * 0.5,
                userId: userId || (Math.random() > 0.5 ? 'user_001' : undefined),
                reason: Math.random() > 0.7 ? undefined : 'Voice does not match stored profile'
            };

            setVerificationResult(mockResult);
        }, 3000);
    };

    const handleViewDetails = (profile: VoiceProfile) => {
        setSelectedProfile(profile);
    };

    const handleDeleteProfile = async (profileId: string) => {
        if (confirm('Are you sure you want to delete this voice profile? This action cannot be undone.')) {
            setProfiles(profiles.filter(p => p.id !== profileId));
            // Call API to delete profile
        }
    };

    const handleUpdateProfile = (profileId: string) => {
        // Start re-enrollment process for existing user
        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            handleStartEnrollment(profile.userId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RotateCw className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading voice biometrics...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Voice Biometrics Management</h1>
                    <p className="text-gray-600">Secure voice authentication and identity verification</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {profiles.length} Active Profiles
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profiles">Voice Profiles</TabsTrigger>
                    <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                    <TabsTrigger value="testing">Testing</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="profiles" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {profiles.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No voice profiles found</p>
                                <p className="text-sm">Start by enrolling users in the Enrollment tab</p>
                            </div>
                        ) : (
                            profiles.map(profile => (
                                <VoiceProfileCard
                                    key={profile.id}
                                    profile={profile}
                                    onViewDetails={handleViewDetails}
                                    onDeleteProfile={handleDeleteProfile}
                                    onUpdateProfile={handleUpdateProfile}
                                    onTestVerification={() => handleTestVerification(profile.userId)}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="enrollment">
                    <VoiceEnrollmentPanel
                        session={enrollmentSession}
                        onStartEnrollment={handleStartEnrollment}
                        onStopEnrollment={handleStopEnrollment}
                        onRecordSample={handleRecordSample}
                    />
                </TabsContent>

                <TabsContent value="testing">
                    <VerificationTestPanel
                        onTestVerification={handleTestVerification}
                        lastResult={verificationResult}
                    />
                </TabsContent>

                <TabsContent value="analytics">
                    {analytics && <SecurityAnalytics analytics={analytics} />}
                </TabsContent>
            </Tabs>

            {/* Profile Details Dialog */}
            {selectedProfile && (
                <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Voice Profile Details</DialogTitle>
                            <DialogDescription>
                                Detailed information for User {selectedProfile.userId}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label>Profile ID</Label>
                                    <p className="font-mono text-xs">{selectedProfile.id}</p>
                                </div>
                                <div>
                                    <Label>User ID</Label>
                                    <p className="font-medium">{selectedProfile.userId}</p>
                                </div>
                                <div>
                                    <Label>Confidence</Label>
                                    <p className="font-medium">{(selectedProfile.confidence * 100).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <Label>Success Rate</Label>
                                    <p className="font-medium">{(selectedProfile.successRate * 100).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <Label>Enrolled</Label>
                                    <p>{selectedProfile.createdAt.toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label>Last Used</Label>
                                    <p>{selectedProfile.lastUsed.toLocaleDateString()}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Label>Verification Statistics</Label>
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span>Total Verifications:</span>
                                        <span className="font-medium">{selectedProfile.verificationCount}</span>
                                    </div>
                                    <Progress
                                        value={selectedProfile.successRate * 100}
                                        className="mt-2 h-2"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Success rate over {selectedProfile.verificationCount} attempts
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}