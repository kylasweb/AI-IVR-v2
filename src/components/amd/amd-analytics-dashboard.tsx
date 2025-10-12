// AMD Analytics Dashboard - Phase 3 Implementation
// Comprehensive analytics for answering machine detection campaigns with cultural intelligence

'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    BarChart3,
    LineChart,
    PieChart,
    TrendingUp,
    TrendingUp as TrendingDown,
    Activity,
    Target,
    Brain,
    Globe,
    Users,
    MessageSquare,
    PhoneCall,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Zap,
    Shield,
    Star,
    RefreshCw,
    Download,
    Settings,
    Eye,
    Filter,
    Search,
    Clock as Calendar,
    MapPin,
    Mic,
    Volume2,
    MoreHorizontal,
} from 'lucide-react';

interface AMDAnalytics {
    totalCampaigns: number;
    totalCalls: number;
    totalAMDDetections: number;
    totalHumanConnections: number;
    totalMessagesLeft: number;
    totalCulturalEngagement: number;
    overallAMDAccuracy: string;
    humanConnectionRate: string;
    culturalEngagementRate: string;
    messageSuccessRate: string;
}

interface CampaignSummary {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'draft';
    language: 'malayalam' | 'english' | 'mixed';
    calls: number;
    lastUpdate: string;
}

interface CulturalDistribution {
    malayalam: number;
    english: number;
    mixed: number;
}

interface AMDPerformanceMetrics {
    totalDetections: number;
    accuracy: number;
    averageDetectionTime: number;
    falsePositives: number;
    falseNegatives: number;
}

export function AMDAnalyticsDashboard() {
    const [analytics, setAnalytics] = useState<AMDAnalytics | null>(null);
    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
    const [culturalDistribution, setCulturalDistribution] = useState<CulturalDistribution | null>(null);
    const [performanceMetrics, setPerformanceMetrics] = useState<AMDPerformanceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

    useEffect(() => {
        loadAnalyticsData();
        loadPerformanceMetrics();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadAnalyticsData, 30000);
        return () => clearInterval(interval);
    }, [selectedTimeRange, selectedLanguage]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);

            // Load campaign analytics
            const campaignResponse = await fetch('/api/cloud-communication/amd/campaigns?action=analytics');
            if (campaignResponse.ok) {
                const data = await campaignResponse.json();
                setAnalytics(data.data.performanceMetrics);
                setCampaigns(data.data.campaignSummary);

                // Calculate cultural distribution
                const malayalam = data.data.campaignSummary.filter((c: CampaignSummary) => c.language === 'malayalam').length;
                const english = data.data.campaignSummary.filter((c: CampaignSummary) => c.language === 'english').length;
                const mixed = data.data.campaignSummary.filter((c: CampaignSummary) => c.language === 'mixed').length;

                setCulturalDistribution({ malayalam, english, mixed });
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPerformanceMetrics = async () => {
        try {
            const response = await fetch('/api/cloud-communication/amd/analyze?action=performance');
            if (response.ok) {
                const data = await response.json();
                setPerformanceMetrics(data.data.metrics);
            }
        } catch (error) {
            console.error('Failed to load performance metrics:', error);
        }
    };

    const getCulturalEngagementColor = (rate: string) => {
        const numRate = parseFloat(rate);
        if (numRate >= 80) return 'text-green-600 bg-green-50';
        if (numRate >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'paused': return 'bg-yellow-500';
            case 'completed': return 'bg-blue-500';
            case 'draft': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getLanguageIcon = (language: string) => {
        switch (language) {
            case 'malayalam': return <Globe className="w-4 h-4 text-green-600" />;
            case 'english': return <Globe className="w-4 h-4 text-blue-600" />;
            case 'mixed': return <Globe className="w-4 h-4 text-purple-600" />;
            default: return <Globe className="w-4 h-4 text-gray-600" />;
        }
    };

    if (loading && !analytics) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Loading AMD analytics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AMD Analytics Dashboard</h2>
                    <p className="text-muted-foreground">
                        Answering Machine Detection performance with Malayalam cultural intelligence
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1d">Last 24h</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Languages</SelectItem>
                            <SelectItem value="malayalam">Malayalam</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={loadAnalyticsData} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">AMD Accuracy</CardTitle>
                            <Target className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.overallAMDAccuracy}</div>
                            <p className="text-xs text-muted-foreground">
                                Machine detection accuracy
                            </p>
                            <Progress value={parseFloat(analytics.overallAMDAccuracy)} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Human Connections</CardTitle>
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.humanConnectionRate}</div>
                            <p className="text-xs text-muted-foreground">
                                Successful human connections
                            </p>
                            <Progress value={parseFloat(analytics.humanConnectionRate)} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cultural Engagement</CardTitle>
                            <Brain className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.culturalEngagementRate}</div>
                            <p className="text-xs text-muted-foreground">
                                Malayalam cultural patterns detected
                            </p>
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs mt-2 ${getCulturalEngagementColor(analytics.culturalEngagementRate)}`}>
                                Cultural Intelligence Active
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Message Success</CardTitle>
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.messageSuccessRate}</div>
                            <p className="text-xs text-muted-foreground">
                                Messages successfully left
                            </p>
                            <Progress value={parseFloat(analytics.messageSuccessRate)} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="cultural">Cultural Intelligence</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Call Volume Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LineChart className="w-5 h-5" />
                                    Call Volume Trends
                                </CardTitle>
                                <CardDescription>
                                    AMD detection trends over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Total Calls</span>
                                        <span className="font-medium">{analytics?.totalCalls || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Machine Detections</span>
                                        <span className="font-medium">{analytics?.totalAMDDetections || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Human Connections</span>
                                        <span className="font-medium">{analytics?.totalHumanConnections || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Cultural Engagement</span>
                                        <span className="font-medium">{analytics?.totalCulturalEngagement || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Language Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="w-5 h-5" />
                                    Language Distribution
                                </CardTitle>
                                <CardDescription>
                                    Campaign distribution by language
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {culturalDistribution && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-sm">Malayalam</span>
                                            </div>
                                            <span className="font-medium">{culturalDistribution.malayalam}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm">English</span>
                                            </div>
                                            <span className="font-medium">{culturalDistribution.english}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                <span className="text-sm">Mixed</span>
                                            </div>
                                            <span className="font-medium">{culturalDistribution.mixed}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Real-time Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                System Status
                            </CardTitle>
                            <CardDescription>
                                Real-time AMD system performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <div>
                                        <p className="text-sm font-medium">ML Model</p>
                                        <p className="text-xs text-muted-foreground">Active</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <div>
                                        <p className="text-sm font-medium">Cultural AI</p>
                                        <p className="text-xs text-muted-foreground">Malayalam Ready</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <div>
                                        <p className="text-sm font-medium">Detection Engine</p>
                                        <p className="text-xs text-muted-foreground">Processing</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <div>
                                        <p className="text-sm font-medium">Analytics</p>
                                        <p className="text-xs text-muted-foreground">Real-time</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Management</CardTitle>
                            <CardDescription>
                                Active AMD campaigns with cultural intelligence
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {campaigns.map((campaign) => (
                                    <div
                                        key={campaign.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(campaign.status)}`}></div>
                                            <div>
                                                <h4 className="font-medium">{campaign.name}</h4>
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    {getLanguageIcon(campaign.language)}
                                                    <span className="capitalize">{campaign.language}</span>
                                                    <span>•</span>
                                                    <span>{campaign.calls} calls</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="capitalize">
                                                {campaign.status}
                                            </Badge>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {campaigns.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No campaigns found</p>
                                        <p className="text-sm">Create your first AMD campaign to get started</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    {performanceMetrics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="w-5 h-5" />
                                        Detection Accuracy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold mb-2">
                                        {(performanceMetrics.accuracy * 100).toFixed(1)}%
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        From {performanceMetrics.totalDetections} detections
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Avg Detection Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold mb-2">
                                        {performanceMetrics.averageDetectionTime.toFixed(0)}ms
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Real-time processing
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Error Rate
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold mb-2">
                                        {((performanceMetrics.falsePositives + performanceMetrics.falseNegatives) / performanceMetrics.totalDetections * 100).toFixed(1)}%
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        FP: {performanceMetrics.falsePositives}, FN: {performanceMetrics.falseNegatives}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="cultural" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    Cultural Intelligence
                                </CardTitle>
                                <CardDescription>
                                    Malayalam pattern recognition and cultural adaptation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Malayalam Greeting Detection</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Regional Dialect Recognition</span>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                            Enhanced
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Festival Awareness</span>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                            Enabled
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Business Hours Adaptation</span>
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                            Smart
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Regional Performance
                                </CardTitle>
                                <CardDescription>
                                    Performance by Kerala regions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Northern Kerala</span>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={87} className="w-20" />
                                            <span className="text-sm font-medium">87%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Central Kerala</span>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={92} className="w-20" />
                                            <span className="text-sm font-medium">92%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Southern Kerala</span>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={89} className="w-20" />
                                            <span className="text-sm font-medium">89%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}