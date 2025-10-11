import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe,
  Brain,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Activity,
  Globe as Languages,
  Star as Award,
  TrendingUp as DollarSign,
  Activity as Cpu,
  Globe as Network,
  MessageSquare,
  Clock as Timer,
  Star,
  Activity as Gauge
} from 'lucide-react';

interface TranslationSession {
  sessionId: string;
  type: 'standard' | 'realtime' | 'batch';
  sourceLanguage: string;
  targetLanguage: string;
  culturalMode: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'failed';
  qualityScore: number;
  processingTime: number;
  rdPartner: string;
  messageCount?: number;
}

interface QualityMetrics {
  overallQuality: number;
  malayalamAccuracy: number;
  englishAccuracy: number;
  culturalSensitivity: number;
  averageLatency: number;
  throughput: number;
  errorRate: number;
  costEfficiency: number;
}

interface RDPartnerMetrics {
  partnerId: string;
  partnerName: string;
  specialization: string[];
  qualityScore: number;
  averageLatency: number;
  availability: number;
  costPerUnit: number;
  culturalExpertise: string[];
  totalTranslations: number;
  successRate: number;
  lastUsed: string;
}

interface CulturalAnalytics {
  languagePairs: Record<string, {
    accuracy: number;
    volume: number;
    avgQuality: number;
    culturalAdaptations: number;
  }>;
  culturalContexts: Record<string, {
    accuracy: number;
    frequency: number;
    qualityTrend: number[];
  }>;
  regionalPatterns: Record<string, {
    accuracy: number;
    preferences: string[];
    adaptationSuccess: number;
  }>;
}

interface RealtimeStats {
  activeSessions: number;
  messagesPerSecond: number;
  averageQuality: number;
  systemLoad: number;
  rdPartnersOnline: number;
  culturalAccuracy: number;
}

const TranslationDashboard: React.FC = () => {
  const [translationSessions, setTranslationSessions] = useState<TranslationSession[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    overallQuality: 0,
    malayalamAccuracy: 0,
    englishAccuracy: 0,
    culturalSensitivity: 0,
    averageLatency: 0,
    throughput: 0,
    errorRate: 0,
    costEfficiency: 0,
  });
  const [rdPartnerMetrics, setRdPartnerMetrics] = useState<RDPartnerMetrics[]>([]);
  const [culturalAnalytics, setCulturalAnalytics] = useState<CulturalAnalytics>({
    languagePairs: {},
    culturalContexts: {},
    regionalPatterns: {},
  });
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
    activeSessions: 0,
    messagesPerSecond: 0,
    averageQuality: 0,
    systemLoad: 0,
    rdPartnersOnline: 0,
    culturalAccuracy: 0,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h');
  const [selectedLanguagePair, setSelectedLanguagePair] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTranslationData();
    const interval = setInterval(fetchTranslationData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe, selectedLanguagePair]);

  const fetchTranslationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch translation sessions
      const sessionsResponse = await fetch(`/api/cloud-communication/translation?timeframe=${selectedTimeframe}&languagePair=${selectedLanguagePair}`);
      if (!sessionsResponse.ok) throw new Error('Failed to fetch translation sessions');
      const sessionsData = await sessionsResponse.json();
      setTranslationSessions(sessionsData.data || []);

      // Fetch quality metrics
      const metricsResponse = await fetch(`/api/cloud-communication/translation/metrics?timeframe=${selectedTimeframe}`);
      if (!metricsResponse.ok) throw new Error('Failed to fetch quality metrics');
      const metricsData = await metricsResponse.json();
      setQualityMetrics(metricsData.data || {});

      // Fetch R&D partner metrics
      const partnersResponse = await fetch(`/api/cloud-communication/translation/partners?timeframe=${selectedTimeframe}`);
      if (!partnersResponse.ok) throw new Error('Failed to fetch R&D partner metrics');
      const partnersData = await partnersResponse.json();
      setRdPartnerMetrics(partnersData.data || []);

      // Fetch cultural analytics
      const culturalResponse = await fetch(`/api/cloud-communication/translation/cultural-analytics?timeframe=${selectedTimeframe}`);
      if (!culturalResponse.ok) throw new Error('Failed to fetch cultural analytics');
      const culturalData = await culturalResponse.json();
      setCulturalAnalytics(culturalData.data || {});

      // Fetch realtime stats
      const realtimeResponse = await fetch('/api/cloud-communication/translation/realtime-stats');
      if (!realtimeResponse.ok) throw new Error('Failed to fetch realtime stats');
      const realtimeData = await realtimeResponse.json();
      setRealtimeStats(realtimeData.data || {});

    } catch (error) {
      console.error('Error fetching translation data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality: number): string => {
    if (quality >= 0.95) return 'text-green-600';
    if (quality >= 0.90) return 'text-blue-600';
    if (quality >= 0.80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (quality: number): React.ReactNode => {
    if (quality >= 0.95) {
      return <Badge className="bg-green-100 text-green-800"><Star className="w-3 h-3 mr-1" />Excellent</Badge>;
    }
    if (quality >= 0.90) {
      return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Good</Badge>;
    }
    if (quality >= 0.80) {
      return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Fair</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Poor</Badge>;
  };

  const formatLatency = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatLanguagePair = (pair: string): string => {
    const [source, target] = pair.split('-');
    const langNames: Record<string, string> = {
      'ml': 'Malayalam',
      'en': 'English',
      'hi': 'Hindi',
      'ta': 'Tamil',
    };
    return `${langNames[source] || source} → ${langNames[target] || target}`;
  };

  if (loading && translationSessions.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading translation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Translation Dashboard</h1>
          <p className="text-gray-600">Real-time translation quality monitoring with R&D partner analytics and cultural intelligence</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedLanguagePair} onValueChange={setSelectedLanguagePair}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Language Pair" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Language Pairs</SelectItem>
              <SelectItem value="ml-en">Malayalam → English</SelectItem>
              <SelectItem value="en-ml">English → Malayalam</SelectItem>
              <SelectItem value="ml-hi">Malayalam → Hindi</SelectItem>
              <SelectItem value="en-hi">English → Hindi</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchTranslationData} disabled={loading}>
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Realtime Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translation Quality</CardTitle>
            <Award className={`h-4 w-4 ${getQualityColor(realtimeStats.averageQuality)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(realtimeStats.averageQuality)}</div>
            <div className="flex items-center gap-2 text-xs">
              {getQualityBadge(realtimeStats.averageQuality)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.activeSessions}</div>
            <div className="text-xs text-gray-600">
              {realtimeStats.messagesPerSecond.toFixed(1)} msg/s
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultural Accuracy</CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(realtimeStats.culturalAccuracy)}</div>
            <div className="text-xs text-gray-600">
              {qualityMetrics.malayalamAccuracy ? formatPercentage(qualityMetrics.malayalamAccuracy) : 'N/A'} ML | {qualityMetrics.englishAccuracy ? formatPercentage(qualityMetrics.englishAccuracy) : 'N/A'} EN
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">R&D Partners</CardTitle>
            <Network className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.rdPartnersOnline}</div>
            <div className="text-xs text-gray-600">
              Load: {realtimeStats.systemLoad.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="quality" className="space-y-6">
        <TabsList>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
          <TabsTrigger value="partners">R&D Partners</TabsTrigger>
          <TabsTrigger value="cultural">Cultural Analytics</TabsTrigger>
        </TabsList>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Translation Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Translation Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Quality</span>
                    <span className="font-bold">{formatPercentage(qualityMetrics.overallQuality)}</span>
                  </div>
                  <Progress value={qualityMetrics.overallQuality * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Malayalam Accuracy</span>
                    <span className="font-bold">{formatPercentage(qualityMetrics.malayalamAccuracy)}</span>
                  </div>
                  <Progress value={qualityMetrics.malayalamAccuracy * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">English Accuracy</span>
                    <span className="font-bold">{formatPercentage(qualityMetrics.englishAccuracy)}</span>
                  </div>
                  <Progress value={qualityMetrics.englishAccuracy * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cultural Sensitivity</span>
                    <span className="font-bold">{formatPercentage(qualityMetrics.culturalSensitivity)}</span>
                  </div>
                  <Progress value={qualityMetrics.culturalSensitivity * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatLatency(qualityMetrics.averageLatency)}</div>
                    <div className="text-xs text-gray-600">Avg Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{qualityMetrics.throughput.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">Trans/sec</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{formatPercentage(qualityMetrics.errorRate)}</div>
                    <div className="text-xs text-gray-600">Error Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatPercentage(qualityMetrics.costEfficiency)}</div>
                    <div className="text-xs text-gray-600">Cost Efficiency</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Malayalam → English</span>
                      <Badge variant="outline">{formatLatency(145)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>English → Malayalam</span>
                      <Badge variant="outline">{formatLatency(165)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Real-time Sessions</span>
                      <Badge variant="outline">{formatLatency(85)}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Translation Sessions
              </CardTitle>
              <CardDescription>
                Real-time monitoring of translation sessions with quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {translationSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active translation sessions found.
                  </div>
                ) : (
                  translationSessions.slice(0, 10).map((session, index) => (
                    <div key={session.sessionId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          session.status === 'active' ? 'bg-green-500' : 
                          session.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        
                        <div>
                          <div className="font-medium">Session {session.sessionId}</div>
                          <div className="text-sm text-gray-600">{new Date(session.startTime).toLocaleString()}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={session.type === 'realtime' ? "default" : "outline"}>
                            {session.type}
                          </Badge>
                          
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            {formatLanguagePair(`${session.sourceLanguage}-${session.targetLanguage}`)}
                          </Badge>
                          
                          <Badge variant="outline">
                            {session.culturalMode.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          {getQualityBadge(session.qualityScore)}
                          <span className="font-bold">{formatPercentage(session.qualityScore)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatLatency(session.processingTime)} • {session.rdPartner}
                          {session.messageCount && ` • ${session.messageCount} messages`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* R&D Partners Tab */}
        <TabsContent value="partners" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {rdPartnerMetrics.map(partner => (
              <Card key={partner.partnerId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{partner.partnerName}</CardTitle>
                      <CardDescription>{partner.specialization.join(', ')}</CardDescription>
                    </div>
                    
                    <Badge className={`ml-2 ${
                      partner.availability > 0.95 ? 'bg-green-100 text-green-800' :
                      partner.availability > 0.90 ? 'bg-blue-100 text-blue-800' :
                      partner.availability > 0.80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {formatPercentage(partner.availability)} uptime
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{formatPercentage(partner.qualityScore)}</div>
                      <div className="text-xs text-gray-600">Quality Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatLatency(partner.averageLatency)}</div>
                      <div className="text-xs text-gray-600">Avg Latency</div>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">{formatPercentage(partner.successRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Translations:</span>
                      <span className="font-medium">{partner.totalTranslations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per Unit:</span>
                      <span className="font-medium">${partner.costPerUnit.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Used:</span>
                      <span className="font-medium">{new Date(partner.lastUsed).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Cultural Expertise */}
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium mb-2">Cultural Expertise</div>
                    <div className="flex flex-wrap gap-1">
                      {partner.culturalExpertise.map(expertise => (
                        <Badge key={expertise} variant="outline" className="text-xs">
                          {expertise}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cultural Analytics Tab */}
        <TabsContent value="cultural" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Language Pair Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Language Pair Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(culturalAnalytics.languagePairs).map(([pair, metrics]) => (
                  <div key={pair} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{formatLanguagePair(pair)}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{metrics.volume.toLocaleString()} trans</Badge>
                        {getQualityBadge(metrics.accuracy)}
                      </div>
                    </div>
                    <Progress value={metrics.accuracy * 100} className="h-2" />
                    <div className="text-xs text-gray-600">
                      Avg Quality: {formatPercentage(metrics.avgQuality)} | 
                      Cultural Adaptations: {metrics.culturalAdaptations}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cultural Context Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Cultural Context Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(culturalAnalytics.culturalContexts).map(([context, metrics]) => (
                  <div key={context} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{context.replace('_', ' ')}</span>
                      <Badge variant="outline">{formatPercentage(metrics.accuracy)}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Frequency: {metrics.frequency}% | 
                      Quality Trend: {metrics.qualityTrend.length > 0 ? 
                        (metrics.qualityTrend[metrics.qualityTrend.length - 1] > metrics.qualityTrend[0] ? '↗' : '↘') : '→'}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Regional Pattern Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Pattern Analysis
              </CardTitle>
              <CardDescription>
                Cultural adaptation success by regional patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(culturalAnalytics.regionalPatterns).map(([region, data]) => (
                  <div key={region} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium capitalize">{region}</span>
                      <Badge variant={data.accuracy > 0.9 ? "default" : "outline"}>
                        {formatPercentage(data.accuracy)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Adaptation Success:</span>
                        <div className="mt-1">
                          <Progress value={data.adaptationSuccess * 100} className="h-1" />
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Preferences:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {data.preferences.slice(0, 3).map(pref => (
                            <Badge key={pref} variant="outline" className="text-xs">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslationDashboard;