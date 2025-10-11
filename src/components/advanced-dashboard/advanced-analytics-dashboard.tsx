"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Phone, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Shield,
  Brain,
  Mic,
  Volume2,
  Eye,
  Target,
  Globe,
  Settings,
  Download,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  realTimeMetrics: {
    activeCalls: number;
    totalCallsToday: number;
    averageCallDuration: number;
    successRate: number;
    systemLoad: number;
    responseTime: number;
  };
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  predictions: {
    callVolume: Array<{ date: string; predicted: number; actual?: number }>;
    peakHours: Array<{ hour: number; predicted: number }>;
    churnRisk: Array<{ userId: string; risk: string; probability: number }>;
  };
  conversationFlows: {
    totalFlows: number;
    averageDuration: number;
    dropOffPoints: Array<{ node: string; count: number }>;
    popularPaths: Array<{ path: string; count: number }>;
  };
  securityMetrics: {
    totalUsers: number;
    activeUsers: number;
    accessAttempts: number;
    securityEvents: number;
    encryptionStatus: string;
  };
  voiceBiometrics: {
    totalProfiles: number;
    verificationAttempts: number;
    successRate: number;
    averageConfidence: number;
  };
}

export default function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAnalyticsData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, autoRefresh]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockData: AnalyticsData = {
        realTimeMetrics: {
          activeCalls: 23,
          totalCallsToday: 1247,
          averageCallDuration: 3.2,
          successRate: 92.5,
          systemLoad: 0.65,
          responseTime: 850
        },
        sentimentAnalysis: {
          positive: 45,
          negative: 15,
          neutral: 30,
          mixed: 10
        },
        predictions: {
          callVolume: [
            { date: '2024-01-01', predicted: 1200, actual: 1185 },
            { date: '2024-01-02', predicted: 1350, actual: 1320 },
            { date: '2024-01-03', predicted: 1100, actual: 1125 },
            { date: '2024-01-04', predicted: 1400, actual: undefined },
            { date: '2024-01-05', predicted: 1250, actual: undefined },
            { date: '2024-01-06', predicted: 1300, actual: undefined },
            { date: '2024-01-07', predicted: 1150, actual: undefined }
          ],
          peakHours: [
            { hour: 9, predicted: 85 },
            { hour: 12, predicted: 120 },
            { hour: 15, predicted: 95 },
            { hour: 18, predicted: 110 }
          ],
          churnRisk: [
            { userId: 'user_001', risk: 'high', probability: 0.85 },
            { userId: 'user_002', risk: 'medium', probability: 0.65 },
            { userId: 'user_003', risk: 'low', probability: 0.25 }
          ]
        },
        conversationFlows: {
          totalFlows: 5423,
          averageDuration: 45.2,
          dropOffPoints: [
            { node: 'collect_location', count: 234 },
            { node: 'intent_recognition', count: 156 },
            { node: 'payment_verification', count: 89 }
          ],
          popularPaths: [
            { path: 'start -> greeting -> book_ride -> collect_location -> confirm_booking -> end_success', count: 342 },
            { path: 'start -> greeting -> ride_status -> end_success', count: 289 },
            { path: 'start -> greeting -> help -> provide_help -> end_success', count: 156 }
          ]
        },
        securityMetrics: {
          totalUsers: 1247,
          activeUsers: 342,
          accessAttempts: 5423,
          securityEvents: 12,
          encryptionStatus: 'AES-256-GCM'
        },
        voiceBiometrics: {
          totalProfiles: 892,
          verificationAttempts: 2341,
          successRate: 94.2,
          averageConfidence: 87.5
        }
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights across all platform features</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.realTimeMetrics.activeCalls}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.realTimeMetrics.successRate.toFixed(1)}%</div>
            <Progress value={data.realTimeMetrics.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{(data.realTimeMetrics.systemLoad * 100).toFixed(1)}%</div>
            <Progress value={data.realTimeMetrics.systemLoad * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.realTimeMetrics.responseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Call Volume Trends
                </CardTitle>
                <CardDescription>Predicted vs actual call volumes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <LineChart className="h-8 w-8 mr-2" />
                  Call volume chart visualization
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Intent Distribution
                </CardTitle>
                <CardDescription>Most common user intents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Book Ride</span>
                    <Badge variant="secondary">35%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ride Status</span>
                    <Badge variant="secondary">28%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Help</span>
                    <Badge variant="secondary">20%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emergency</span>
                    <Badge variant="secondary">12%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Other</span>
                    <Badge variant="secondary">5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Sentiment Analysis
                </CardTitle>
                <CardDescription>Emotional analysis of conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-green-600">Positive</span>
                      <span>{data.sentimentAnalysis.positive}%</span>
                    </div>
                    <Progress value={data.sentimentAnalysis.positive} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-red-600">Negative</span>
                      <span>{data.sentimentAnalysis.negative}%</span>
                    </div>
                    <Progress value={data.sentimentAnalysis.negative} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Neutral</span>
                      <span>{data.sentimentAnalysis.neutral}%</span>
                    </div>
                    <Progress value={data.sentimentAnalysis.neutral} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-yellow-600">Mixed</span>
                      <span>{data.sentimentAnalysis.mixed}%</span>
                    </div>
                    <Progress value={data.sentimentAnalysis.mixed} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Adaptive Responses
                </CardTitle>
                <CardDescription>Response adjustments based on sentiment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Happy Customers</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">92% Success</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Frustrated Users</span>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Escalate to Human</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Confused Users</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Provide Clarity</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Call Volume Predictions
                </CardTitle>
                <CardDescription>7-day forecast with confidence intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {data.predictions.callVolume.map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{prediction.date}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{prediction.predicted}</span>
                          {prediction.actual && (
                            <span className="text-gray-500">({prediction.actual})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Churn Risk Analysis
                </CardTitle>
                <CardDescription>Users at risk of churning</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {data.predictions.churnRisk.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{user.userId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.risk === 'high' ? 'destructive' : user.risk === 'medium' ? 'default' : 'secondary'}>
                            {user.risk}
                          </Badge>
                          <span className="text-sm">{(user.probability * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Conversation Flow Metrics
                </CardTitle>
                <CardDescription>Flow performance and drop-off points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{data.conversationFlows.totalFlows}</div>
                      <p className="text-sm text-gray-600">Total Flows</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{data.conversationFlows.averageDuration.toFixed(1)}s</div>
                      <p className="text-sm text-gray-600">Avg Duration</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Drop-off Points</h4>
                    <div className="space-y-1">
                      {data.conversationFlows.dropOffPoints.slice(0, 3).map((point, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{point.node}</span>
                          <Badge variant="outline">{point.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Popular Paths
                </CardTitle>
                <CardDescription>Most common conversation paths</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {data.conversationFlows.popularPaths.map((path, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Path {index + 1}</span>
                          <Badge variant="secondary">{path.count} times</Badge>
                        </div>
                        <div className="text-xs text-gray-600 truncate">{path.path}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
                <CardDescription>System security metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{data.securityMetrics.totalUsers}</div>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{data.securityMetrics.activeUsers}</div>
                      <p className="text-sm text-gray-600">Active Users</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{data.securityMetrics.accessAttempts}</div>
                      <p className="text-sm text-gray-600">Access Attempts</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{data.securityMetrics.securityEvents}</div>
                      <p className="text-sm text-gray-600">Security Events</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Encryption Status</span>
                    <Badge className="bg-green-100 text-green-800">{data.securityMetrics.encryptionStatus}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Access Control
                </CardTitle>
                <CardDescription>Role-based access control status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Super Admins</span>
                    <Badge variant="destructive">2</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Administrators</span>
                    <Badge variant="default">5</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Managers</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Agents</span>
                    <Badge variant="outline">45</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Biometrics
                </CardTitle>
                <CardDescription>Voice authentication metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{data.voiceBiometrics.totalProfiles}</div>
                      <p className="text-sm text-gray-600">Voice Profiles</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{data.voiceBiometrics.verificationAttempts}</div>
                      <p className="text-sm text-gray-600">Verifications</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Success Rate</span>
                      <span>{data.voiceBiometrics.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={data.voiceBiometrics.successRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Avg Confidence</span>
                      <span>{data.voiceBiometrics.averageConfidence.toFixed(1)}%</span>
                    </div>
                    <Progress value={data.voiceBiometrics.averageConfidence} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice Quality Metrics
                </CardTitle>
                <CardDescription>Audio quality and processing metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Audio Quality</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Noise Reduction</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Voice Clarity</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">High</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Analytics
          </CardTitle>
          <CardDescription>Export analytics data in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}