// Real-time Monitoring Dashboard for Strategic Engine Performance
// Project Saksham - Comprehensive Monitoring & Analytics Dashboard
// Tracks engine performance, cultural effectiveness, and Malayalam integration success

'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Note: Using simple div-based charts for compatibility
// In production, consider using a stable chart library or component
import {
    Activity,
    Users,
    Globe,
    FileText,
    Shield,
    Zap,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3
} from 'lucide-react';

interface EnginePerformanceData {
    engineId: string;
    name: string;
    status: 'healthy' | 'warning' | 'critical' | 'offline';
    responseTime: number;
    successRate: number;
    throughput: number;
    culturalAdaptationScore: number;
    malayalamUsage: number;
    userSatisfaction: number;
    lastUpdated: Date;
}

interface CulturalMetrics {
    malayalamRequestPercentage: number;
    culturalAdaptationSuccess: number;
    familyIntegrationScore: number;
    festivalAwarenessScore: number;
    respectProtocolAdherence: number;
    regionalVariantUsage: Record<string, number>;
}

interface SystemHealth {
    uptime: number;
    errorRate: number;
    activeUsers: number;
    totalRequests: number;
    culturalServerHealth: number;
    malayalamServiceAvailability: number;
}

interface AlertData {
    id: string;
    type: 'error' | 'warning' | 'info';
    engine: string;
    message: string;
    malayalamMessage: string;
    timestamp: Date;
    resolved: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export const StrategicEngineMonitoringDashboard: React.FC = () => {
    const [engineData, setEngineData] = useState<EnginePerformanceData[]>([]);
    const [culturalMetrics, setCulturalMetrics] = useState<CulturalMetrics | null>(null);
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [selectedTimeframe]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            
            // Mock data - in production, these would be API calls
            setEngineData([
                {
                    engineId: 'hyper-personalization-cultural-intelligence',
                    name: 'Hyper-Personalization Engine',
                    status: 'healthy',
                    responseTime: 245,
                    successRate: 98.7,
                    throughput: 156,
                    culturalAdaptationScore: 94.2,
                    malayalamUsage: 73.5,
                    userSatisfaction: 91.8,
                    lastUpdated: new Date()
                },
                {
                    engineId: 'autonomous-dispatch-cultural-integration',
                    name: 'Autonomous Dispatch Engine',
                    status: 'healthy',
                    responseTime: 187,
                    successRate: 99.1,
                    throughput: 203,
                    culturalAdaptationScore: 96.1,
                    malayalamUsage: 68.9,
                    userSatisfaction: 93.4,
                    lastUpdated: new Date()
                },
                {
                    engineId: 'automated-resolution',
                    name: 'Automated Resolution Engine',
                    status: 'warning',
                    responseTime: 412,
                    successRate: 85.3,
                    throughput: 89,
                    culturalAdaptationScore: 88.7,
                    malayalamUsage: 71.2,
                    userSatisfaction: 87.6,
                    lastUpdated: new Date()
                },
                {
                    engineId: 'intelligent-document-processing-malayalam',
                    name: 'Document Processing Engine',
                    status: 'healthy',
                    responseTime: 1250,
                    successRate: 96.8,
                    throughput: 45,
                    culturalAdaptationScore: 92.3,
                    malayalamUsage: 89.7,
                    userSatisfaction: 94.1,
                    lastUpdated: new Date()
                },
                {
                    engineId: 'real-time-safety-anomaly-detection',
                    name: 'Safety Monitoring Engine',
                    status: 'healthy',
                    responseTime: 78,
                    successRate: 99.8,
                    throughput: 312,
                    culturalAdaptationScore: 91.4,
                    malayalamUsage: 65.3,
                    userSatisfaction: 96.2,
                    lastUpdated: new Date()
                },
                {
                    engineId: 'dynamic-empathy-emotional-intelligence',
                    name: 'Dynamic Empathy Engine (Phase 2)',
                    status: 'healthy',
                    responseTime: 334,
                    successRate: 91.2,
                    throughput: 127,
                    culturalAdaptationScore: 97.8,
                    malayalamUsage: 82.4,
                    userSatisfaction: 95.7,
                    lastUpdated: new Date()
                }
            ]);

            setCulturalMetrics({
                malayalamRequestPercentage: 74.3,
                culturalAdaptationSuccess: 93.6,
                familyIntegrationScore: 89.2,
                festivalAwarenessScore: 91.7,
                respectProtocolAdherence: 95.4,
                regionalVariantUsage: {
                    'Central Kerala': 34.2,
                    'Northern Kerala': 28.7,
                    'Southern Kerala': 23.1,
                    'Kochi Urban': 14.0
                }
            });

            setSystemHealth({
                uptime: 99.94,
                errorRate: 0.12,
                activeUsers: 2847,
                totalRequests: 15693,
                culturalServerHealth: 98.7,
                malayalamServiceAvailability: 99.2
            });

            setAlerts([
                {
                    id: 'alert-1',
                    type: 'warning',
                    engine: 'Automated Resolution Engine',
                    message: 'Response time above threshold (400ms+)',
                    malayalamMessage: 'പ്രതികരണ സമയം പരിധി കവിഞ്ഞു (400ms+)',
                    timestamp: new Date(Date.now() - 300000),
                    resolved: false
                },
                {
                    id: 'alert-2',
                    type: 'info',
                    engine: 'System',
                    message: 'Festival season traffic increase detected',
                    malayalamMessage: 'ഉത്സവ കാലയളവിൽ ട്രാഫിക് വർദ്ധനവ് കണ്ടെത്തി',
                    timestamp: new Date(Date.now() - 600000),
                    resolved: false
                }
            ]);

            // Generate historical data
            setHistoricalData(generateHistoricalData());

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateHistoricalData = () => {
        const data: any[] = [];
        const now = new Date();
        const dataPoints = selectedTimeframe === '1h' ? 12 : selectedTimeframe === '24h' ? 24 : 30;
        
        for (let i = dataPoints; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * (selectedTimeframe === '1h' ? 5 * 60 * 1000 : selectedTimeframe === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)));
            
            data.push({
                timestamp: timestamp.toISOString().slice(11, 16),
                responseTime: 200 + Math.random() * 200,
                successRate: 95 + Math.random() * 5,
                throughput: 100 + Math.random() * 100,
                culturalScore: 90 + Math.random() * 10,
                malayalamUsage: 70 + Math.random() * 20,
                userSatisfaction: 85 + Math.random() * 15
            });
        }
        
        return data;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            case 'offline': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy': return <Badge className="bg-green-100 text-green-800">സ്വസ്ഥം / Healthy</Badge>;
            case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">മുന്നറിയിപ്പ് / Warning</Badge>;
            case 'critical': return <Badge className="bg-red-100 text-red-800">ഗുരുതരം / Critical</Badge>;
            case 'offline': return <Badge className="bg-gray-100 text-gray-800">ഓഫ്‌ലൈൻ / Offline</Badge>;
            default: return <Badge>Unknown</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-lg text-gray-600">Loading Dashboard...</p>
                    <p className="text-sm text-gray-500">ഡാഷ്ബോർഡ് ലോഡ് ചെയ്യുന്നു...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">
                        Strategic Engine Monitoring Dashboard
                    </h1>
                    <p className="text-lg mb-1">സ്ട്രാറ്റെജിക് എൻജിൻ നിരീക്ഷണ ഡാഷ്ബോർഡ്</p>
                    <p className="text-sm opacity-90">
                        Project Saksham - Real-time Performance & Cultural Intelligence Monitoring
                    </p>
                    
                    {/* Timeframe Selector */}
                    <div className="mt-4 flex space-x-2">
                        {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
                            <Button
                                key={timeframe}
                                variant={selectedTimeframe === timeframe ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedTimeframe(timeframe)}
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                            >
                                {timeframe}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* System Health Overview */}
                {systemHealth && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                                <Activity className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{systemHealth.uptime}%</div>
                                <p className="text-xs text-muted-foreground">സിസ്റ്റം പ്രവർത്തന സമയം</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <Users className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{systemHealth.activeUsers.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">സജീവ ഉപയോക്താക്കൾ</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                                <BarChart3 className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{systemHealth.totalRequests.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">മൊത്തം അഭ്യർത്ഥനകൾ</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cultural Server Health</CardTitle>
                                <Globe className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600">{systemHealth.culturalServerHealth}%</div>
                                <p className="text-xs text-muted-foreground">സാംസ്കാരിക സെർവർ ആരോഗ്യം</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Malayalam Service</CardTitle>
                                <Globe className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{systemHealth.malayalamServiceAvailability}%</div>
                                <p className="text-xs text-muted-foreground">മലയാളം സേവന ലഭ്യത</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Alerts Section */}
                {alerts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                Active Alerts / സജീവ മുന്നറിയിപ്പുകൾ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {alerts.filter(alert => !alert.resolved).map((alert) => (
                                    <Alert key={alert.id} className={`border-l-4 ${
                                        alert.type === 'error' ? 'border-red-500' :
                                        alert.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
                                    }`}>
                                        <AlertDescription>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{alert.engine}</p>
                                                    <p className="text-sm">{alert.message}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{alert.malayalamMessage}</p>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {alert.timestamp.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Dashboard Content */}
                <Tabs defaultValue="engines" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="engines">Engine Performance</TabsTrigger>
                        <TabsTrigger value="cultural">Cultural Metrics</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="malayalam">Malayalam Intelligence</TabsTrigger>
                    </TabsList>

                    {/* Engine Performance Tab */}
                    <TabsContent value="engines" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {engineData.map((engine) => (
                                <Card key={engine.engineId} className="overflow-hidden">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{engine.name}</CardTitle>
                                                <CardDescription className="text-xs">{engine.engineId}</CardDescription>
                                            </div>
                                            {getStatusBadge(engine.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Response Time */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Response Time</span>
                                                <span>{engine.responseTime}ms</span>
                                            </div>
                                            <Progress 
                                                value={Math.min((engine.responseTime / 500) * 100, 100)} 
                                                className="h-2"
                                            />
                                        </div>

                                        {/* Success Rate */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Success Rate</span>
                                                <span>{engine.successRate}%</span>
                                            </div>
                                            <Progress value={engine.successRate} className="h-2" />
                                        </div>

                                        {/* Cultural Adaptation Score */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Cultural Adaptation</span>
                                                <span>{engine.culturalAdaptationScore}%</span>
                                            </div>
                                            <Progress value={engine.culturalAdaptationScore} className="h-2" />
                                        </div>

                                        {/* Malayalam Usage */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Malayalam Usage</span>
                                                <span>{engine.malayalamUsage}%</span>
                                            </div>
                                            <Progress value={engine.malayalamUsage} className="h-2" />
                                        </div>

                                        {/* User Satisfaction */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>User Satisfaction</span>
                                                <span>{engine.userSatisfaction}%</span>
                                            </div>
                                            <Progress value={engine.userSatisfaction} className="h-2" />
                                        </div>

                                        {/* Key Metrics Row */}
                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-blue-600">{engine.throughput}</div>
                                                <div className="text-xs text-gray-500">Req/min</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-green-600">
                                                    {engine.lastUpdated.toLocaleTimeString().slice(0, 5)}
                                                </div>
                                                <div className="text-xs text-gray-500">Last Update</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Cultural Metrics Tab */}
                    <TabsContent value="cultural" className="space-y-4">
                        {culturalMetrics && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Cultural Effectiveness Overview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Cultural Effectiveness Metrics</CardTitle>
                                        <CardDescription>സാംസ്കാരിക ഫലപ്രാപ്തി മെട്രിക്സ്</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Cultural Adaptation Success</span>
                                                <span>{culturalMetrics.culturalAdaptationSuccess}%</span>
                                            </div>
                                            <Progress value={culturalMetrics.culturalAdaptationSuccess} className="h-3" />
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Family Integration Score</span>
                                                <span>{culturalMetrics.familyIntegrationScore}%</span>
                                            </div>
                                            <Progress value={culturalMetrics.familyIntegrationScore} className="h-3" />
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Festival Awareness</span>
                                                <span>{culturalMetrics.festivalAwarenessScore}%</span>
                                            </div>
                                            <Progress value={culturalMetrics.festivalAwarenessScore} className="h-3" />
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Respect Protocol Adherence</span>
                                                <span>{culturalMetrics.respectProtocolAdherence}%</span>
                                            </div>
                                            <Progress value={culturalMetrics.respectProtocolAdherence} className="h-3" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Regional Usage Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Regional Usage Distribution</CardTitle>
                                        <CardDescription>പ്രാദേശിക ഉപയോഗ വിതരണം</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {Object.entries(culturalMetrics.regionalVariantUsage).map(([region, value], index) => (
                                                <div key={region} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div 
                                                            className="w-4 h-4 rounded-full" 
                                                            style={{ backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4] }}
                                                        ></div>
                                                        <span className="text-sm font-medium">{region}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="h-2 rounded-full"
                                                                style={{ 
                                                                    width: `${(value * 100)}%`,
                                                                    backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-600 w-12 text-right">{(value * 100).toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Malayalam Usage Trend */}
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Malayalam Usage & Cultural Adaptation Trends</CardTitle>
                                        <CardDescription>മലയാളം ഉപയോഗവും സാംസ്കാരിക പൊരുത്തപ്പെടുത്തൽ പ്രവണതകളും</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <div className="text-center">
                                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">Line Chart: Malayalam Usage & Cultural Trends</p>
                                                <p className="text-xs text-gray-500">Use Strategic Engine Monitoring (Simplified) for interactive charts</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Performance Trends */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Trends</CardTitle>
                                    <CardDescription>പ്രകടന പ്രവണതകൾ</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <div className="text-center">
                                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">Area Chart: Performance Metrics</p>
                                            <p className="text-xs text-gray-500">Use Strategic Engine Monitoring (Simplified) for interactive charts</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Success Rate & Satisfaction */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Success Rate & User Satisfaction</CardTitle>
                                    <CardDescription>വിജയ നിരക്കും ഉപയോക്തൃ സംതൃപ്തിയും</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <div className="text-center">
                                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">Line Chart: Success Rate & Satisfaction</p>
                                            <p className="text-xs text-gray-500">Use Strategic Engine Monitoring (Simplified) for interactive charts</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Malayalam Intelligence Tab */}
                    <TabsContent value="malayalam" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Malayalam Service Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Malayalam Service Overview
                                    </CardTitle>
                                    <CardDescription>മലയാളം സേവന അവലോകനം</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">
                                            {culturalMetrics?.malayalamRequestPercentage || 74.3}%
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Malayalam Requests
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            മലയാളം അഭ്യർത്ഥനകൾ
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Translation Accuracy</span>
                                            <span className="font-medium">96.8%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Cultural Context Understanding</span>
                                            <span className="font-medium">94.2%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Response Appropriateness</span>
                                            <span className="font-medium">92.7%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Engine Malayalam Performance */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Engine Malayalam Performance</CardTitle>
                                    <CardDescription>എൻജിൻ മലയാളം പ്രകടനം</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <div className="text-center">
                                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">Bar Chart: Engine Malayalam Performance</p>
                                            <p className="text-xs text-gray-500">Use Strategic Engine Monitoring (Simplified) for interactive charts</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Malayalam Analytics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Malayalam Intelligence Analytics</CardTitle>
                                <CardDescription>വിശദമായ മലയാളം ബുദ്ധിമത്ത വിശകലനം</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">98.7%</div>
                                        <div className="text-sm text-gray-600">Grammar Accuracy</div>
                                        <div className="text-xs text-gray-500">വ്യാകരണ കൃത്യത</div>
                                    </div>
                                    
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">94.3%</div>
                                        <div className="text-sm text-gray-600">Cultural Context</div>
                                        <div className="text-xs text-gray-500">സാംസ്കാരിക സന്ദർഭം</div>
                                    </div>
                                    
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">92.8%</div>
                                        <div className="text-sm text-gray-600">Formality Detection</div>
                                        <div className="text-xs text-gray-500">ഔപചാരികത കണ്ടെത്തൽ</div>
                                    </div>
                                    
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">96.1%</div>
                                        <div className="text-sm text-gray-600">User Satisfaction</div>
                                        <div className="text-xs text-gray-500">ഉപയോക്തൃ സംതൃപ്തി</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <div>
                                <p>Project Saksham Strategic Engine Monitoring System</p>
                                <p className="text-xs">പ്രോജക്ട് സക്ഷം സ്ട്രാറ്റെജിക് എൻജിൻ മോണിറ്ററിംഗ് സിസ്റ്റം</p>
                            </div>
                            <div className="text-right">
                                <p>Last Updated: {new Date().toLocaleTimeString()}</p>
                                <p className="text-xs">Data refreshes every 30 seconds</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StrategicEngineMonitoringDashboard;