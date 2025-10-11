'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    Phone as Video, 
    Mic, 
    MicOff, 
    PhoneCall, 
    PhoneOff, 
    Users, 
    Clock, 
    MessageSquare,
    Volume2,
    Activity as Signal,
    Settings,
    Play,
    CheckCircle as Square,
    X
} from 'lucide-react';

interface ConferenceSession {
    id: string;
    sessionId: string;
    title: string;
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    participantCount: number;
    maxParticipants: number;
    conferenceType: 'audio_only' | 'video' | 'screen_share';
    recordingEnabled: boolean;
    transcriptionEnabled: boolean;
    malayalamSupport: boolean;
    culturalMode: 'standard' | 'formal' | 'casual';
    participants: ConferenceParticipant[];
    culturalMetrics?: {
        malayalamEngagement: number;
        respectLevelDistribution: Record<string, number>;
        formalityBalance: number;
        sentimentAnalysis: Record<string, number>;
    };
}

interface ConferenceParticipant {
    id: string;
    name: string;
    role: 'host' | 'moderator' | 'participant';
    status: 'invited' | 'joined' | 'left' | 'disconnected';
    joinTime?: Date;
    leaveTime?: Date;
    speakingTime: number;
    participationScore: number;
    averageSignal: number;
    networkQuality: number;
    preferredLanguage: string;
}

interface ConferenceMetrics {
    totalSessions: number;
    activeSessions: number;
    malayalamSessions: number;
    avgParticipants: number;
    totalParticipants: number;
    avgSessionDuration: number;
    recordingUptime: number;
    transcriptionAccuracy: number;
}

export default function ConferenceDashboard() {
    const [sessions, setSessions] = useState<ConferenceSession[]>([]);
    const [metrics, setMetrics] = useState<ConferenceMetrics | null>(null);
    const [selectedSession, setSelectedSession] = useState<ConferenceSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch conference data
    useEffect(() => {
        fetchConferenceSessions();
        fetchConferenceMetrics();

        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchConferenceSessions();
                fetchConferenceMetrics();
            }, 5000); // Refresh every 5 seconds

            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const fetchConferenceSessions = async () => {
        try {
            const response = await fetch('/api/cloud-communication/conference?limit=50');
            const data = await response.json();
            
            if (data.success) {
                setSessions(data.data.sessions || []);
            }
        } catch (error) {
            console.error('Error fetching conference sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchConferenceMetrics = async () => {
        try {
            // This would come from a dedicated metrics endpoint
            const mockMetrics: ConferenceMetrics = {
                totalSessions: sessions.length,
                activeSessions: sessions.filter(s => s.status === 'active').length,
                malayalamSessions: sessions.filter(s => s.malayalamSupport).length,
                avgParticipants: sessions.length > 0 ? 
                    sessions.reduce((sum, s) => sum + s.participantCount, 0) / sessions.length : 0,
                totalParticipants: sessions.reduce((sum, s) => sum + s.participantCount, 0),
                avgSessionDuration: 45.3, // minutes
                recordingUptime: 98.5, // percentage
                transcriptionAccuracy: 94.2, // percentage
            };
            setMetrics(mockMetrics);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };

    const handleStartSession = async (sessionId: string) => {
        try {
            const response = await fetch('/api/cloud-communication/conference', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, status: 'active' }),
            });

            if (response.ok) {
                fetchConferenceSessions();
            }
        } catch (error) {
            console.error('Error starting session:', error);
        }
    };

    const handleEndSession = async (sessionId: string) => {
        try {
            const response = await fetch('/api/cloud-communication/conference', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, status: 'completed' }),
            });

            if (response.ok) {
                fetchConferenceSessions();
            }
        } catch (error) {
            console.error('Error ending session:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'scheduled': return 'bg-blue-500';
            case 'completed': return 'bg-gray-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const formatDuration = (startTime: Date, endTime?: Date) => {
        const end = endTime || new Date();
        const duration = Math.floor((end.getTime() - startTime.getTime()) / 60000); // minutes
        if (duration < 60) return `${duration}m`;
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return `${hours}h ${minutes}m`;
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Conference Center</h1>
                    <p className="text-gray-600 mt-1">Phase 2: Audio Conferencing & Live Transcription</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        Auto Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Sessions</p>
                                    <p className="text-2xl font-bold text-green-600">{metrics.activeSessions}</p>
                                </div>
                                <Video className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {metrics.totalSessions} total sessions
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Participants</p>
                                    <p className="text-2xl font-bold text-blue-600">{metrics.totalParticipants}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Avg {metrics.avgParticipants.toFixed(1)} per session
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Malayalam Sessions</p>
                                    <p className="text-2xl font-bold text-orange-600">{metrics.malayalamSessions}</p>
                                </div>
                                <MessageSquare className="w-8 h-8 text-orange-600" />
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Cultural analysis enabled
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Transcription Quality</p>
                                    <p className="text-2xl font-bold text-purple-600">{metrics.transcriptionAccuracy}%</p>
                                </div>
                                <Volume2 className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {metrics.recordingUptime}% recording uptime
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Active Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Conference Sessions
                        <Badge variant="secondary">{sessions.length} total</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sessions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Video className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No conference sessions found</p>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedSession(session)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold">{session.title}</h3>
                                                <Badge className={getStatusColor(session.status)}>
                                                    {session.status}
                                                </Badge>
                                                {session.malayalamSupport && (
                                                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                        Malayalam
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {session.participantCount}/{session.maxParticipants}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDuration(session.startTime, session.endTime)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="w-4 h-4" />
                                                    {session.transcriptionEnabled ? 'Live Transcription' : 'No Transcription'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Signal className="w-4 h-4" />
                                                    Cultural: {session.culturalMode}
                                                </div>
                                            </div>

                                            {/* Cultural Metrics */}
                                            {session.culturalMetrics && session.malayalamSupport && (
                                                <div className="mt-3 p-2 bg-orange-50 rounded">
                                                    <p className="text-xs font-semibold text-orange-800 mb-1">Cultural Analysis</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-orange-700">Malayalam Engagement:</span>
                                                            <span className="ml-1 font-semibold">
                                                                {session.culturalMetrics.malayalamEngagement.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-700">Formality Balance:</span>
                                                            <span className="ml-1 font-semibold">
                                                                {session.culturalMetrics.formalityBalance.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            {session.status === 'scheduled' && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartSession(session.sessionId);
                                                    }}
                                                >
                                                    <PhoneCall className="w-4 h-4 mr-1" />
                                                    Start
                                                </Button>
                                            )}
                                            {session.status === 'active' && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEndSession(session.sessionId);
                                                    }}
                                                >
                                                    <PhoneOff className="w-4 h-4 mr-1" />
                                                    End
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Session Detail Modal */}
            {selectedSession && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Session Details: {selectedSession.title}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSession(null)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Participants */}
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Participants ({selectedSession.participants?.length || 0})
                                </h4>
                                <div className="space-y-2">
                                    {selectedSession.participants?.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center justify-between p-2 border rounded"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    {participant.status === 'joined' ? (
                                                        <Mic className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <MicOff className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <span className="font-medium">{participant.name}</span>
                                                </div>
                                                <Badge variant="outline" size="sm">
                                                    {participant.role}
                                                </Badge>
                                                {participant.preferredLanguage === 'ml' && (
                                                    <Badge variant="outline" size="sm" className="text-orange-600 border-orange-600">
                                                        ML
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {Math.round(participant.speakingTime / 60)}min
                                            </div>
                                        </div>
                                    )) || (
                                        <p className="text-gray-500 text-sm">No participants yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Session Metrics */}
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Signal className="w-4 h-4" />
                                    Session Metrics
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Duration:</span>
                                        <span className="text-sm font-medium">
                                            {formatDuration(selectedSession.startTime, selectedSession.endTime)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Conference Type:</span>
                                        <span className="text-sm font-medium capitalize">
                                            {selectedSession.conferenceType.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Recording:</span>
                                        <Badge variant={selectedSession.recordingEnabled ? "default" : "secondary"}>
                                            {selectedSession.recordingEnabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Live Transcription:</span>
                                        <Badge variant={selectedSession.transcriptionEnabled ? "default" : "secondary"}>
                                            {selectedSession.transcriptionEnabled ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {selectedSession.malayalamSupport && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Cultural Mode:</span>
                                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                {selectedSession.culturalMode}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}