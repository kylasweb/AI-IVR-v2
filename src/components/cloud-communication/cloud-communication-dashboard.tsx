'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mic, 
  FileText, 
  Users, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  MessageSquare,
  BarChart3,
  Globe,
  Shield
} from 'lucide-react';

/**
 * Cloud Communication Monitoring Dashboard
 * Real-time monitoring for all cloud communication features
 */

interface RecordingSession {
  id: string;
  callId: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  duration?: number;
  participants: number;
  audioQuality: number;
  language: string;
  culturalAlignment?: number;
}

interface TranscriptionJob {
  id: string;
  recordingId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  language: string;
  culturalAnalysis: boolean;
  confidence?: number;
}

interface SystemHealth {
  recording: { status: string; activeSessions: number };
  transcription: { status: string; queueLength: number };
  storage: { status: string; usage: number };
  cultural: { status: string; accuracy: number };
}

export function CloudCommunicationDashboard() {
  const [activeSessions, setActiveSessions] = useState<RecordingSession[]>([]);
  const [transcriptionJobs, setTranscriptionJobs] = useState<TranscriptionJob[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>('overview');

  useEffect(() => {
    // Load initial data
    fetchDashboardData();
    
    // Setup real-time updates
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch active recording sessions
      const recordingResponse = await fetch('/api/cloud-communication/recording');
      const recordingData = await recordingResponse.json();
      
      if (recordingData.success) {
        setActiveSessions(recordingData.data || []);
      }

      // Fetch system health
      const healthResponse = await fetch('/api/cloud-communication/health');
      const healthData = await healthResponse.json();
      
      if (healthData.success) {
        setSystemHealth(healthData.metrics);
      }

      // Mock transcription jobs for now
      setTranscriptionJobs([
        {
          id: 'trans_1',
          recordingId: 'rec_1',
          status: 'processing',
          progress: 65,
          language: 'ml-IN',
          culturalAnalysis: true,
          confidence: 0.89
        },
        {
          id: 'trans_2', 
          recordingId: 'rec_2',
          status: 'completed',
          progress: 100,
          language: 'en-IN',
          culturalAnalysis: false,
          confidence: 0.94
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'queued': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cloud Communication Center
              </h1>
              <p className="text-gray-600">
                Real-time monitoring for Phase 1-4 cloud communication features
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={selectedPhase === 'overview' ? 'default' : 'outline'}
                onClick={() => setSelectedPhase('overview')}
              >
                Overview
              </Button>
              <Button 
                variant={selectedPhase === 'recording' ? 'default' : 'outline'}
                onClick={() => setSelectedPhase('recording')}
              >
                Phase 1: Recording
              </Button>
              <Button 
                variant={selectedPhase === 'conferencing' ? 'default' : 'outline'}
                onClick={() => setSelectedPhase('conferencing')}
              >
                Phase 2: Conferencing
              </Button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recording Service</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth?.recording.activeSessions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active Sessions
              </p>
              <Badge 
                variant="outline" 
                className={`mt-2 ${getHealthStatusColor(systemHealth?.recording.status || 'unknown')}`}
              >
                {systemHealth?.recording.status || 'Unknown'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transcription Queue</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth?.transcription.queueLength || 0}</div>
              <p className="text-xs text-muted-foreground">
                Jobs in Queue
              </p>
              <Badge 
                variant="outline" 
                className={`mt-2 ${getHealthStatusColor(systemHealth?.transcription.status || 'unknown')}`}
              >
                {systemHealth?.transcription.status || 'Unknown'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth?.storage.usage || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Cloud Storage
              </p>
              <Progress value={systemHealth?.storage.usage || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cultural Accuracy</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{((systemHealth?.cultural.accuracy || 0) * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Malayalam Context
              </p>
              <Badge 
                variant="outline" 
                className={`mt-2 ${getHealthStatusColor(systemHealth?.cultural.status || 'unknown')}`}
              >
                {systemHealth?.cultural.status || 'Unknown'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {selectedPhase === 'overview' && (
          <>
            {/* Phase Implementation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Implementation Roadmap Progress
                </CardTitle>
                <CardDescription>
                  Strategic rollout across 4 phases with cultural integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Phase 1: Cloud Recording & Transcription</h3>
                        <p className="text-sm text-gray-600">Foundation - Security & Quality Focus</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={75} className="w-32" />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">75% Complete</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Phase 2: Audio Conferencing & Live Transcription</h3>
                        <p className="text-sm text-gray-600">B2B Enhancement - Customer Support Boost</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={20} className="w-32" />
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Planned</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Phase 3: Answering Machine Detection (AMD)</h3>
                        <p className="text-sm text-gray-600">Outbound Marketing - Campaign Optimization</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={10} className="w-32" />
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">Research</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Globe className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Phase 4: Live Translation (R&D Partnership)</h3>
                        <p className="text-sm text-gray-600">Strategic Innovation - Academic Collaboration</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={5} className="w-32" />
                      <Badge variant="outline" className="bg-red-50 text-red-700">Planning</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {selectedPhase === 'recording' && (
          <>
            {/* Active Recording Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mic className="w-5 h-5 mr-2" />
                    Active Recording Sessions
                  </CardTitle>
                  <CardDescription>
                    Real-time call recording with cultural context analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeSessions.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No active recording sessions</p>
                    ) : (
                      activeSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                            <div>
                              <p className="font-medium">Call {session.callId}</p>
                              <p className="text-sm text-gray-600">
                                {session.participants} participant{session.participants !== 1 ? 's' : ''} • {session.language}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{session.status}</Badge>
                            {session.audioQuality > 0 && (
                              <p className="text-xs text-gray-600 mt-1">
                                Quality: {session.audioQuality.toFixed(1)}/5.0
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transcription Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Transcription Processing
                  </CardTitle>
                  <CardDescription>
                    Malayalam & English transcription with cultural analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transcriptionJobs.map((job) => (
                      <div key={job.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`} />
                            <span className="font-medium">Job {job.id}</span>
                            <Badge variant="outline" className="text-xs">
                              {job.language}
                            </Badge>
                          </div>
                          <Badge variant="outline">{job.status}</Badge>
                        </div>
                        
                        <Progress value={job.progress} className="mb-2" />
                        
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{job.progress}% complete</span>
                          {job.confidence && (
                            <span>Confidence: {(job.confidence * 100).toFixed(1)}%</span>
                          )}
                        </div>
                        
                        {job.culturalAnalysis && (
                          <div className="mt-2 flex items-center text-xs text-blue-600">
                            <Globe className="w-3 h-3 mr-1" />
                            Cultural analysis enabled
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Quality & Performance Metrics
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of audio quality and cultural accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">95.2%</div>
                    <p className="text-sm text-gray-600">Recording Uptime</p>
                    <Progress value={95.2} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">4.3/5.0</div>
                    <p className="text-sm text-gray-600">Avg Audio Quality (MOS)</p>
                    <Progress value={86} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">88.7%</div>
                    <p className="text-sm text-gray-600">Malayalam Accuracy</p>
                    <Progress value={88.7} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {selectedPhase === 'conferencing' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Phase 2: Audio Conferencing Development
              </CardTitle>
              <CardDescription>
                Multi-party conferencing with live transcription (In Development)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Phase 2 Features Coming Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  Multi-party audio conferencing with real-time Malayalam transcription
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-blue-900 mb-2">Planned Features:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 50+ participant support</li>
                    <li>• Real-time transcription with speaker identification</li>
                    <li>• Malayalam-English code-switching detection</li>
                    <li>• Meeting intelligence and summaries</li>
                    <li>• Quality-aware adaptive streaming</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cultural Context Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Cultural Context & Language Analytics
            </CardTitle>
            <CardDescription>
              Real-time analysis of Malayalam cultural patterns and language usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Language Distribution (Last 24h)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Malayalam (ml-IN)</span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">English (en-IN)</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Code-switching</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Cultural Alignment Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Respect Level Detection</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">92%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Regional Dialect Recognition</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <span className="text-sm">Emotional Tone Analysis</span>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">89%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}