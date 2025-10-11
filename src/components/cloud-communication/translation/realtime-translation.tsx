import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  XCircle as Pause,
  XCircle as SquareIcon,
  Mic,
  MicOff,
  Volume2,
  Volume2 as VolumeX,
  Settings,
  Users,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Volume2 as Headphones,
  MessageSquare,
  Globe as Languages,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Types
interface LiveTranslationSession {
  sessionId: string;
  participants: {
    id: string;
    name: string;
    language: string;
    status: 'connected' | 'disconnected' | 'speaking' | 'listening';
    avatar?: string;
  }[];
  sourceLanguage: string;
  targetLanguages: string[];
  status: 'active' | 'paused' | 'ended';
  startTime: string;
  duration: number;
  quality: {
    overall: number;
    latency: number;
    accuracy: number;
    cultural: number;
  };
  partner: string;
  translationMode: 'real-time' | 'batch' | 'hybrid';
  culturalContext: string;
}

interface TranslationEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  speakerId: string;
  sourceText: string;
  translations: {
    language: string;
    text: string;
    confidence: number;
    culturalAdaptations: string[];
  }[];
  processingTime: number;
  quality: number;
  partner: string;
}

interface AudioSettings {
  inputVolume: number;
  outputVolume: number;
  noiseCancellation: boolean;
  autoGainControl: boolean;
  echoCancellation: boolean;
  sampleRate: number;
  bufferSize: number;
}

const RealtimeTranslation: React.FC = () => {
  const [sessions, setSessions] = useState<LiveTranslationSession[]>([]);
  const [activeSession, setActiveSession] = useState<LiveTranslationSession | null>(null);
  const [translationEvents, setTranslationEvents] = useState<TranslationEvent[]>([]);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    inputVolume: 80,
    outputVolume: 75,
    noiseCancellation: true,
    autoGainControl: true,
    echoCancellation: true,
    sampleRate: 44100,
    bufferSize: 1024,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ml');
  const [culturalMode, setCulturalMode] = useState('formal');
  const [loading, setLoading] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadActiveSessions();
    
    // Setup WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:3000/api/cloud-communication/translation/live');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'translation_event':
          setTranslationEvents(prev => [data.event, ...prev.slice(0, 49)]);
          break;
        case 'session_update':
          updateSession(data.session);
          break;
        case 'quality_update':
          updateSessionQuality(data.sessionId, data.quality);
          break;
      }
    };

    return () => {
      ws.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const loadActiveSessions = async () => {
    try {
      setLoading(true);
      
      // Mock data - in production, this would fetch from API
      const mockSessions: LiveTranslationSession[] = [
        {
          sessionId: 'session-1',
          participants: [
            {
              id: 'user-1',
              name: 'Rahul Kumar',
              language: 'en',
              status: 'speaking',
            },
            {
              id: 'user-2',
              name: 'Priya Nair',
              language: 'ml',
              status: 'listening',
            },
          ],
          sourceLanguage: 'en',
          targetLanguages: ['ml', 'hi'],
          status: 'active',
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          duration: 15 * 60, // 15 minutes
          quality: {
            overall: 0.92,
            latency: 185,
            accuracy: 0.94,
            cultural: 0.89,
          },
          partner: 'microsoft-translator',
          translationMode: 'real-time',
          culturalContext: 'business',
        },
        {
          sessionId: 'session-2',
          participants: [
            {
              id: 'user-3',
              name: 'John Smith',
              language: 'en',
              status: 'connected',
            },
            {
              id: 'user-4',
              name: 'അനിൽ മേനോൻ',
              language: 'ml',
              status: 'connected',
            },
            {
              id: 'user-5',
              name: 'രാജേഷ് പിള്ള',
              language: 'ml',
              status: 'connected',
            },
          ],
          sourceLanguage: 'ml',
          targetLanguages: ['en'],
          status: 'paused',
          startTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          duration: 8 * 60, // 8 minutes
          quality: {
            overall: 0.88,
            latency: 220,
            accuracy: 0.90,
            cultural: 0.85,
          },
          partner: 'google-translate-api',
          translationMode: 'hybrid',
          culturalContext: 'casual',
        },
      ];

      setSessions(mockSessions);
      if (mockSessions.length > 0) {
        setActiveSession(mockSessions[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSession = (updatedSession: LiveTranslationSession) => {
    setSessions(prev => 
      prev.map(session => 
        session.sessionId === updatedSession.sessionId ? updatedSession : session
      )
    );
    
    if (activeSession?.sessionId === updatedSession.sessionId) {
      setActiveSession(updatedSession);
    }
  };

  const updateSessionQuality = (sessionId: string, quality: any) => {
    setSessions(prev => 
      prev.map(session => 
        session.sessionId === sessionId 
          ? { ...session, quality: { ...session.quality, ...quality } }
          : session
      )
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: audioSettings.noiseCancellation,
          autoGainControl: audioSettings.autoGainControl,
          echoCancellation: audioSettings.echoCancellation,
          sampleRate: audioSettings.sampleRate,
        },
      });

      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Send audio data to translation service
          processAudioChunk(event.data);
        }
      };

      mediaRecorder.start(1000); // Capture every second
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const processAudioChunk = async (audioData: Blob) => {
    if (!activeSession) return;

    // Mock audio processing - in production, this would send to speech-to-text API
    const mockTranslationEvent: TranslationEvent = {
      id: `event-${Date.now()}`,
      sessionId: activeSession.sessionId,
      timestamp: new Date().toISOString(),
      speakerId: 'user-1',
      sourceText: 'Sample text from audio processing',
      translations: [
        {
          language: 'ml',
          text: 'ഓഡിയോ പ്രോസസ്സിംഗിൽ നിന്നുള്ള സാമ്പിൾ ടെക്സ്റ്റ്',
          confidence: 0.92,
          culturalAdaptations: ['formal_address', 'respectful_tone'],
        },
      ],
      processingTime: 185,
      quality: 0.91,
      partner: activeSession.partner,
    };

    setTranslationEvents(prev => [mockTranslationEvent, ...prev.slice(0, 49)]);
  };

  const toggleSession = () => {
    if (!activeSession) return;

    const newStatus = activeSession.status === 'active' ? 'paused' : 'active';
    updateSession({
      ...activeSession,
      status: newStatus,
    });
  };

  const joinSession = async (sessionId: string) => {
    // Mock joining session
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      setActiveSession(session);
    }
  };

  const endSession = () => {
    if (!activeSession) return;

    updateSession({
      ...activeSession,
      status: 'ended',
    });
    
    setActiveSession(null);
    stopRecording();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'speaking': return <Mic className="w-4 h-4 text-green-500" />;
      case 'listening': return <Headphones className="w-4 h-4 text-blue-500" />;
      case 'connected': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Real-time Translation</h2>
          <p className="text-gray-600">Live translation sessions with cultural intelligence</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh Sessions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Active Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  activeSession?.sessionId === session.sessionId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => joinSession(session.sessionId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {formatDuration(session.duration)}
                  </span>
                </div>
                
                <div className="text-sm font-medium mb-2">
                  {session.sourceLanguage.toUpperCase()} → {session.targetLanguages.join(', ').toUpperCase()}
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {session.participants.length} participants
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    Quality: {(session.quality.overall * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active sessions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Session View */}
        <div className="lg:col-span-2 space-y-6">
          {activeSession ? (
            <>
              {/* Session Controls */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Globe className="w-5 h-5" />
                        <span>Session: {activeSession.sessionId}</span>
                      </CardTitle>
                      <CardDescription>
                        {activeSession.sourceLanguage.toUpperCase()} → {activeSession.targetLanguages.join(', ').toUpperCase()} • 
                        {activeSession.culturalContext} context
                      </CardDescription>
                    </div>
                    <Badge variant={activeSession.status === 'active' ? 'default' : 'secondary'}>
                      {activeSession.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-2">
                      <Button
                        onClick={toggleSession}
                        variant={activeSession.status === 'active' ? 'default' : 'outline'}
                      >
                        {activeSession.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        variant="outline"
                        disabled={activeSession.status !== 'active'}
                      >
                        {isRecording ? (
                          <>
                            <SquareIcon className="w-4 h-4 mr-2" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => setIsMuted(!isMuted)}
                        variant="outline"
                        disabled={activeSession.status !== 'active'}
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-4 h-4 mr-2" />
                            Unmute
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 mr-2" />
                            Mute
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Button onClick={endSession} variant="destructive">
                      <SquareIcon className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                  </div>

                  {/* Quality Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <Label className="text-sm font-medium">Overall Quality</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={activeSession.quality.overall * 100} className="flex-1" />
                        <span className="text-sm font-medium">
                          {(activeSession.quality.overall * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Accuracy</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={activeSession.quality.accuracy * 100} className="flex-1" />
                        <span className="text-sm font-medium">
                          {(activeSession.quality.accuracy * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Latency</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">{activeSession.quality.latency}ms</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cultural</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={activeSession.quality.cultural * 100} className="flex-1" />
                        <span className="text-sm font-medium">
                          {(activeSession.quality.cultural * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Participants</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeSession.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          {getStatusIcon(participant.status)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{participant.name}</div>
                            <div className="text-xs text-gray-500">
                              {participant.language.toUpperCase()} • {participant.status}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {participant.language}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings and Translation Feed */}
              <Tabs defaultValue="feed" className="w-full">
                <TabsList>
                  <TabsTrigger value="feed">Translation Feed</TabsTrigger>
                  <TabsTrigger value="settings">Audio Settings</TabsTrigger>
                  <TabsTrigger value="cultural">Cultural Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="feed">
                  <Card>
                    <CardHeader>
                      <CardTitle>Live Translation Feed</CardTitle>
                      <CardDescription>Real-time translation events and quality metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {translationEvents.map((event) => (
                          <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">
                                Speaker: {event.speakerId}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                <Zap className="w-3 h-3" />
                                <span>{event.processingTime}ms</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-600">Original:</span>
                                <p className="text-sm">{event.sourceText}</p>
                              </div>
                              
                              {event.translations.map((translation, index) => (
                                <div key={index} className="bg-gray-50 p-2 rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {translation.language.toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {(translation.confidence * 100).toFixed(0)}% confidence
                                    </span>
                                  </div>
                                  <p className="text-sm">{translation.text}</p>
                                  {translation.culturalAdaptations.length > 0 && (
                                    <div className="mt-1">
                                      <span className="text-xs text-gray-600">Cultural adaptations: </span>
                                      {translation.culturalAdaptations.map((adaptation, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs mr-1">
                                          {adaptation}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {translationEvents.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Languages className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No translation events yet</p>
                            <p className="text-sm">Start speaking to see live translations</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Audio Settings</CardTitle>
                      <CardDescription>Configure audio capture and processing settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Input Volume</Label>
                          <Slider
                            value={[audioSettings.inputVolume]}
                            onValueChange={(value) => setAudioSettings(prev => ({ ...prev, inputVolume: value[0] }))}
                            max={100}
                            step={1}
                            className="mt-2"
                          />
                          <span className="text-sm text-gray-600">{audioSettings.inputVolume}%</span>
                        </div>
                        
                        <div>
                          <Label>Output Volume</Label>
                          <Slider
                            value={[audioSettings.outputVolume]}
                            onValueChange={(value) => setAudioSettings(prev => ({ ...prev, outputVolume: value[0] }))}
                            max={100}
                            step={1}
                            className="mt-2"
                          />
                          <span className="text-sm text-gray-600">{audioSettings.outputVolume}%</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="noise-cancellation">Noise Cancellation</Label>
                          <Switch
                            id="noise-cancellation"
                            checked={audioSettings.noiseCancellation}
                            onCheckedChange={(checked) => setAudioSettings(prev => ({ ...prev, noiseCancellation: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-gain">Auto Gain Control</Label>
                          <Switch
                            id="auto-gain"
                            checked={audioSettings.autoGainControl}
                            onCheckedChange={(checked) => setAudioSettings(prev => ({ ...prev, autoGainControl: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="echo-cancellation">Echo Cancellation</Label>
                          <Switch
                            id="echo-cancellation"
                            checked={audioSettings.echoCancellation}
                            onCheckedChange={(checked) => setAudioSettings(prev => ({ ...prev, echoCancellation: checked }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Sample Rate</Label>
                        <Select
                          value={audioSettings.sampleRate.toString()}
                          onValueChange={(value) => setAudioSettings(prev => ({ ...prev, sampleRate: parseInt(value) }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16000">16 kHz</SelectItem>
                            <SelectItem value="22050">22.05 kHz</SelectItem>
                            <SelectItem value="44100">44.1 kHz</SelectItem>
                            <SelectItem value="48000">48 kHz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cultural">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cultural Intelligence Settings</CardTitle>
                      <CardDescription>Configure cultural adaptation and language preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Primary Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ml">Malayalam (മലയാളം)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                            <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Cultural Context</Label>
                        <Select value={culturalMode} onValueChange={setCulturalMode}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formal">Formal / Business</SelectItem>
                            <SelectItem value="casual">Casual / Friendly</SelectItem>
                            <SelectItem value="traditional">Traditional / Respectful</SelectItem>
                            <SelectItem value="modern">Modern / Contemporary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Cultural Adaptations</Label>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>✓ Respectful address forms (ബഹുമാനപൂർവ്വം)</p>
                          <p>✓ Regional dialectal preferences</p>
                          <p>✓ Context-appropriate formality levels</p>
                          <p>✓ Cultural concept translations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
                <p className="text-gray-600 mb-4">Select a session from the list to start translating</p>
                <Button onClick={() => window.location.reload()}>
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh Sessions
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeTranslation;