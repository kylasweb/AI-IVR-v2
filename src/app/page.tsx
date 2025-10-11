'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, Users, Activity, Settings, Mic, MicOff, PhoneCall, PhoneOff, BarChart3, Clock, CheckCircle, XCircle, Globe, Volume2, Car, Bot } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard'
import AIAgentDashboard from '@/components/ai-agent/ai-agent-dashboard'
import AdvancedAnalyticsDashboard from '@/components/advanced-dashboard/advanced-analytics-dashboard'
import WorkflowBuilder from '@/components/ivr/workflow-builder'

interface CallSession {
  session_id: string
  phone_number: string
  status: string
  start_time: string
  duration?: number
  transcript?: any[]
  language?: string
  dialect?: string
}

interface SystemStats {
  total_calls: number
  active_calls: number
  completed_calls: number
  average_duration: number
  success_rate: number
}

// Language configurations
const LANGUAGES = {
  ml: {
    name: 'മലയാളം',
    englishName: 'Malayalam',
    flag: '🇮🇳',
    dialects: [
      { code: 'standard', name: 'സ്റ്റാൻഡേർഡ്', englishName: 'Standard' },
      { code: 'travancore', name: 'തിരുവിതാംകൂർ', englishName: 'Travancore' },
      { code: 'malabar', name: 'മലബാർ', englishName: 'Malabar' },
      { code: 'cochin', name: 'കൊച്ചി', englishName: 'Cochin' }
    ]
  },
  manglish: {
    name: 'മംഗ്ലീഷ്',
    englishName: 'Manglish',
    flag: '🇮🇳',
    dialects: [
      { code: 'standard', name: 'സ്റ്റാൻഡേർഡ്', englishName: 'Standard' },
      { code: 'casual', name: 'കാഷ്വൽ', englishName: 'Casual' },
      { code: 'formal', name: 'ഫോർമൽ', englishName: 'Formal' }
    ]
  },
  en: {
    name: 'English',
    englishName: 'English',
    flag: '🇬🇧',
    dialects: [
      { code: 'standard', name: 'Standard', englishName: 'Standard' },
      { code: 'us', name: 'US English', englishName: 'US English' },
      { code: 'uk', name: 'UK English', englishName: 'UK English' }
    ]
  }
}

// UI Text translations
const UI_TEXT = {
  ml: {
    title: 'AI IVR പ്ലാറ്റ്ഫോം',
    subtitle: 'വോയ്‌സ് AI ഏജന്റുകളുമായുള്ള ഇന്ററാക്ടീവ് വോയ്‌സ് റെസ്പോൺസ്',
    totalCalls: 'ആകെ കോളുകൾ',
    activeCalls: 'സജീവ കോളുകൾ',
    completedCalls: 'പൂർത്തിയായ കോളുകൾ',
    avgDuration: 'ശരാശരി ദൈർഘ്യം',
    successRate: 'വിജയനിരക്ക്',
    simulateCall: 'കോൾ സിമുലേറ്റ് ചെയ്യുക',
    connected: 'ബന്ധിച്ചിരിക്കുന്നു',
    disconnected: 'ബന്ധം വിച്ഛേദിച്ചു',
    activeSessions: 'സജീവ സെഷനുകൾ',
    sessionDetails: 'സെഷൻ വിശദാംശങ്ങൾ',
    analytics: 'അനലിറ്റിക്സ്',
    settings: 'ക്രമീകരണങ്ങൾ',
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    selectDialect: 'ഭാഷാഭേദം തിരഞ്ഞെടുക്കുക',
    noActiveSessions: 'സജീവ സെഷനുകളൊന്നുമില്ല',
    noActiveSessionsDesc: 'ടെസ്റ്റ് സെഷൻ ആരംഭിക്കാൻ "കോൾ സിമുലേറ്റ് ചെയ്യുക" ക്ലിക്ക് ചെയ്യുക',
    selectSession: 'വിശദാംശങ്ങൾ കാണാൻ ഒരു സെഷൻ തിരഞ്ഞെടുക്കുക',
    transcript: 'ട്രാൻസ്ക്രിപ്റ്റ്',
    noTranscript: 'ട്രാൻസ്ക്രിപ്റ്റ് ലഭ്യമല്ല'
  },
  manglish: {
    title: 'AI IVR Platform',
    subtitle: 'Voice AI agentsum kudya Interactive Voice Response',
    totalCalls: 'Total calls',
    activeCalls: 'Active calls',
    completedCalls: 'Completed calls',
    avgDuration: 'Avg duration',
    successRate: 'Success rate',
    simulateCall: 'Simulate call',
    connected: 'Connected',
    disconnected: 'Disconnected',
    activeSessions: 'Active sessions',
    sessionDetails: 'Session details',
    analytics: 'Analytics',
    settings: 'Settings',
    selectLanguage: 'Select language',
    selectDialect: 'Select dialect',
    noActiveSessions: 'No active sessions',
    noActiveSessionsDesc: 'Click "Simulate Call" to start a test session',
    selectSession: 'Select a session to view details',
    transcript: 'Transcript',
    noTranscript: 'No transcript available'
  },
  en: {
    title: 'AI IVR Platform',
    subtitle: 'Interactive Voice Response with Voice AI Agents',
    totalCalls: 'Total Calls',
    activeCalls: 'Active Calls',
    completedCalls: 'Completed Calls',
    avgDuration: 'Avg Duration',
    successRate: 'Success Rate',
    simulateCall: 'Simulate Call',
    connected: 'Connected',
    disconnected: 'Disconnected',
    activeSessions: 'Active Sessions',
    sessionDetails: 'Session Details',
    analytics: 'Analytics',
    settings: 'Settings',
    selectLanguage: 'Select Language',
    selectDialect: 'Select Dialect',
    noActiveSessions: 'No Active Sessions',
    noActiveSessionsDesc: 'Click "Simulate Call" to start a test session',
    selectSession: 'Select a session to view details',
    transcript: 'Transcript',
    noTranscript: 'No transcript available'
  }
}

export default function IVRDashboard() {
  const [activeSessions, setActiveSessions] = useState<CallSession[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_calls: 0,
    active_calls: 0,
    completed_calls: 0,
    average_duration: 0,
    success_rate: 0
  })
  const [isSimulating, setIsSimulating] = useState(false)
  const [selectedSession, setSelectedSession] = useState<CallSession | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ml')
  const [selectedDialect, setSelectedDialect] = useState<string>('standard')

  // Get current UI text based on language
  const uiText = UI_TEXT[selectedLanguage as keyof typeof UI_TEXT] || UI_TEXT.en

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/ivr/sessions')
      if (response.ok) {
        const data = await response.json()
        setActiveSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  // Fetch system stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ivr/stats')
      if (response.ok) {
        const data = await response.json()
        setSystemStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Simulate a call
  const simulateCall = async () => {
    setIsSimulating(true)
    try {
      const response = await fetch('/api/ivr/simulate-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          language: selectedLanguage,
          dialect: selectedDialect
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: selectedLanguage === 'ml' ? 'കോൾ സിമുലേറ്റ് ചെയ്തു' : 
                  selectedLanguage === 'manglish' ? 'Call simulated' : 'Call Simulated',
          description: selectedLanguage === 'ml' ? `സെഷൻ ${data.session_id} വിജയകരമായി ആരംഭിച്ചു` :
                    selectedLanguage === 'manglish' ? `Session ${data.session_id} started successfully` :
                    `Session ${data.session_id} started successfully`
        })
        fetchSessions()
      } else {
        throw new Error('Failed to simulate call')
      }
    } catch (error) {
      toast({
        title: selectedLanguage === 'ml' ? 'പിശക്' : 
                selectedLanguage === 'manglish' ? 'Error' : 'Error',
        description: selectedLanguage === 'ml' ? 'കോൾ സിമുലേറ്റ് ചെയ്യാൻ കഴിഞ്ഞില്ല' :
                  selectedLanguage === 'manglish' ? 'Failed to simulate call' :
                  'Failed to simulate call',
        variant: 'destructive'
      })
    } finally {
      setIsSimulating(false)
    }
  }

  // End a session
  const endSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ivr/sessions/${sessionId}/end`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: selectedLanguage === 'ml' ? 'സെഷൻ അവസാനിച്ചു' : 
                  selectedLanguage === 'manglish' ? 'Session ended' : 'Session Ended',
          description: selectedLanguage === 'ml' ? `സെഷൻ ${sessionId} വിജയകരമായി അവസാനിച്ചു` :
                    selectedLanguage === 'manglish' ? `Session ${sessionId} ended successfully` :
                    `Session ${sessionId} ended successfully`
        })
        fetchSessions()
        fetchStats()
      }
    } catch (error) {
      toast({
        title: selectedLanguage === 'ml' ? 'പിശക്' : 
                selectedLanguage === 'manglish' ? 'Error' : 'Error',
        description: selectedLanguage === 'ml' ? 'സെഷൻ അവസാനിപ്പിക്കാൻ കഴിഞ്ഞില്ല' :
                  selectedLanguage === 'manglish' ? 'Failed to end session' :
                  'Failed to end session',
        variant: 'destructive'
      })
    }
  }

  // Check IVR backend health
  const checkHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/health')
      setIsConnected(response.ok)
    } catch (error) {
      setIsConnected(false)
    }
  }

  useEffect(() => {
    fetchSessions()
    fetchStats()
    checkHealth()

    // Set up polling
    const interval = setInterval(() => {
      fetchSessions()
      fetchStats()
      checkHealth()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'completed':
        return 'bg-blue-500'
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PhoneCall className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'disconnected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Language Selection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {uiText.title}
              <span className="text-2xl">{LANGUAGES[selectedLanguage as keyof typeof LANGUAGES]?.flag}</span>
            </h1>
            <p className="text-gray-600">{uiText.subtitle}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Language Selection */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <SelectItem key={code} value={code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dialect Selection */}
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-500" />
              <Select value={selectedDialect} onValueChange={setSelectedDialect}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES[selectedLanguage as keyof typeof LANGUAGES]?.dialects.map((dialect) => (
                    <SelectItem key={dialect.code} value={dialect.code}>
                      {dialect.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Connection Status */}
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {isConnected ? uiText.connected : uiText.disconnected}
            </Badge>

            {/* Simulate Call Button */}
            <Button onClick={simulateCall} disabled={isSimulating || !isConnected}>
              {isSimulating ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  {selectedLanguage === 'ml' ? 'സിമുലേറ്റ് ചെയ്യുന്നു...' :
                   selectedLanguage === 'manglish' ? 'Simulating...' : 'Simulating...'}
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  {uiText.simulateCall}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{uiText.totalCalls}</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.total_calls}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{uiText.activeCalls}</CardTitle>
              <PhoneCall className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemStats.active_calls}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{uiText.completedCalls}</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{systemStats.completed_calls}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{uiText.avgDuration}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(systemStats.average_duration)}s</div>
              <p className="text-xs text-muted-foreground">Average call length</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{uiText.successRate}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(systemStats.success_rate)}%</div>
              <Progress value={systemStats.success_rate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">{uiText.activeSessions}</TabsTrigger>
            <TabsTrigger value="analytics">{uiText.analytics}</TabsTrigger>
            <TabsTrigger value="advanced-analytics">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="workflow-builder">Workflow Builder</TabsTrigger>
            <TabsTrigger value="dispatcher">Dispatcher</TabsTrigger>
            <TabsTrigger value="ai-agent">AI Agent</TabsTrigger>
            <TabsTrigger value="settings">{uiText.settings}</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sessions List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{uiText.activeSessions}</CardTitle>
                  <CardDescription>Real-time call sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {activeSessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>{uiText.noActiveSessions}</p>
                          <p className="text-sm">{uiText.noActiveSessionsDesc}</p>
                        </div>
                      ) : (
                        activeSessions.map((session) => (
                          <div
                            key={session.session_id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedSession?.session_id === session.session_id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedSession(session)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                                <div>
                                  <p className="font-medium">{session.phone_number}</p>
                                  <p className="text-sm text-gray-500">{session.session_id}</p>
                                  {session.language && (
                                    <p className="text-xs text-gray-400">
                                      {LANGUAGES[session.language as keyof typeof LANGUAGES]?.flag} {LANGUAGES[session.language as keyof typeof LANGUAGES]?.name}
                                      {session.dialect && ` - ${session.dialect}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  {getStatusIcon(session.status)}
                                  {session.status}
                                </Badge>
                                {session.duration && (
                                  <span className="text-sm text-gray-500">{Math.round(session.duration)}s</span>
                                )}
                                {session.status === 'active' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      endSession(session.session_id)
                                    }}
                                  >
                                    <PhoneOff className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Session Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{uiText.sessionDetails}</CardTitle>
                  <CardDescription>Selected session information</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedSession ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Session ID</p>
                        <p className="font-mono text-sm">{selectedSession.session_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="font-mono text-sm">{selectedSession.phone_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getStatusIcon(selectedSession.status)}
                          {selectedSession.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Start Time</p>
                        <p className="text-sm">{new Date(selectedSession.start_time).toLocaleString()}</p>
                      </div>
                      {selectedSession.duration && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Duration</p>
                          <p className="text-sm">{Math.round(selectedSession.duration)} seconds</p>
                        </div>
                      )}
                      {selectedSession.language && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Language</p>
                          <p className="text-sm">
                            {LANGUAGES[selectedSession.language as keyof typeof LANGUAGES]?.flag} {LANGUAGES[selectedSession.language as keyof typeof LANGUAGES]?.name}
                            {selectedSession.dialect && ` - ${selectedSession.dialect}`}
                          </p>
                        </div>
                      )}
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">{uiText.transcript}</p>
                        <ScrollArea className="h-[200px] border rounded p-3">
                          {selectedSession.transcript && selectedSession.transcript.length > 0 ? (
                            <div className="space-y-2">
                              {selectedSession.transcript.map((entry, index) => (
                                <div key={index} className="text-sm">
                                  <p className="font-medium text-blue-600">
                                    {selectedSession.language === 'ml' ? 'ഉപയോക്താവ്:' : 
                                     selectedSession.language === 'manglish' ? 'User:' : 'User:'} {entry.user_input}
                                  </p>
                                  <p className="text-green-600">
                                    {selectedSession.language === 'ml' ? 'ഏജന്റ്:' : 
                                     selectedSession.language === 'manglish' ? 'Agent:' : 'Agent:'} {entry.agent_response}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">{uiText.noTranscript}</p>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{uiText.selectSession}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Call Analytics</CardTitle>
                <CardDescription>Detailed call metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard coming soon</p>
                  <p className="text-sm">View detailed call metrics, trends, and insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced-analytics">
            <AdvancedAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="workflow-builder">
            <WorkflowBuilder />
          </TabsContent>

          <TabsContent value="dispatcher">
            <DispatcherDashboard />
          </TabsContent>

          <TabsContent value="ai-agent">
            <AIAgentDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>IVR Settings</CardTitle>
                <CardDescription>Configure your IVR system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Settings panel coming soon</p>
                  <p className="text-sm">Configure voice settings, flows, and integrations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}