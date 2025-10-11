// Cultural Alignment Metrics Tracker
// Specialized component for monitoring Malayalam and cultural context performance
// Project Saksham Cultural Intelligence Dashboard

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Globe, 
    Users, 
    Clock,
    TrendingUp,
    Star,
    MapPin
} from 'lucide-react';

interface CulturalMetric {
    language: string;
    region: string;
    community: string;
    festival?: string;
    timeOfDay: string;
    alignmentScore: number;
    responseQuality: number;
    userSatisfaction: number;
    executionCount: number;
    averageTime: number;
    successRate: number;
    lastUpdated: string;
}

interface FestivalContext {
    name: string;
    date: string;
    significance: string;
    alignmentBoost: number;
    activeEngines: string[];
}

interface RegionalInsights {
    region: string;
    totalExecutions: number;
    averageAlignment: number;
    preferredLanguage: string;
    culturalNuances: string[];
    engagementPatterns: {
        timeOfDay: string;
        engagementLevel: number;
    }[];
}

export function CulturalAlignmentTracker() {
    const [culturalMetrics, setCulturalMetrics] = useState<CulturalMetric[]>([]);
    const [activeFestivals, setActiveFestivals] = useState<FestivalContext[]>([]);
    const [regionalInsights, setRegionalInsights] = useState<RegionalInsights[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

    useEffect(() => {
        fetchCulturalMetrics();
        const interval = setInterval(fetchCulturalMetrics, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [selectedTimeframe]);

    const fetchCulturalMetrics = async () => {
        try {
            // In a real implementation, this would call actual API endpoints
            // For now, generating representative cultural data
            
            const mockCulturalMetrics: CulturalMetric[] = [
                {
                    language: 'ml',
                    region: 'kerala',
                    community: 'malayali',
                    festival: 'onam',
                    timeOfDay: 'morning',
                    alignmentScore: 0.92,
                    responseQuality: 0.89,
                    userSatisfaction: 0.94,
                    executionCount: 245,
                    averageTime: 320,
                    successRate: 0.96,
                    lastUpdated: new Date().toISOString()
                },
                {
                    language: 'manglish',
                    region: 'kerala',
                    community: 'malayali',
                    timeOfDay: 'evening',
                    alignmentScore: 0.87,
                    responseQuality: 0.85,
                    userSatisfaction: 0.91,
                    executionCount: 189,
                    averageTime: 285,
                    successRate: 0.94,
                    lastUpdated: new Date().toISOString()
                },
                {
                    language: 'en',
                    region: 'kerala',
                    community: 'general',
                    timeOfDay: 'afternoon',
                    alignmentScore: 0.76,
                    responseQuality: 0.82,
                    userSatisfaction: 0.79,
                    executionCount: 156,
                    averageTime: 230,
                    successRate: 0.91,
                    lastUpdated: new Date().toISOString()
                }
            ];

            const mockFestivals: FestivalContext[] = [
                {
                    name: 'Onam',
                    date: '2025-09-15',
                    significance: 'Kerala Harvest Festival',
                    alignmentBoost: 0.15,
                    activeEngines: ['contextual_commerce', 'market_expansion', 'cultural_personalization']
                },
                {
                    name: 'Vishu',
                    date: '2025-04-14',
                    significance: 'Malayalam New Year',
                    alignmentBoost: 0.12,
                    activeEngines: ['hyper_personalization', 'proactive_engagement']
                }
            ];

            const mockRegionalInsights: RegionalInsights[] = [
                {
                    region: 'Thiruvananthapuram',
                    totalExecutions: 1250,
                    averageAlignment: 0.89,
                    preferredLanguage: 'ml',
                    culturalNuances: ['formal_address', 'cultural_respect', 'traditional_greetings'],
                    engagementPatterns: [
                        { timeOfDay: 'morning', engagementLevel: 0.92 },
                        { timeOfDay: 'afternoon', engagementLevel: 0.76 },
                        { timeOfDay: 'evening', engagementLevel: 0.88 },
                        { timeOfDay: 'night', engagementLevel: 0.45 }
                    ]
                },
                {
                    region: 'Kochi',
                    totalExecutions: 980,
                    averageAlignment: 0.84,
                    preferredLanguage: 'manglish',
                    culturalNuances: ['business_friendly', 'tech_savvy', 'multicultural'],
                    engagementPatterns: [
                        { timeOfDay: 'morning', engagementLevel: 0.85 },
                        { timeOfDay: 'afternoon', engagementLevel: 0.89 },
                        { timeOfDay: 'evening', engagementLevel: 0.92 },
                        { timeOfDay: 'night', engagementLevel: 0.67 }
                    ]
                }
            ];

            setCulturalMetrics(mockCulturalMetrics);
            setActiveFestivals(mockFestivals);
            setRegionalInsights(mockRegionalInsights);
            
        } catch (error) {
            console.error('Failed to fetch cultural metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLanguageFlag = (language: string) => {
        switch (language) {
            case 'ml': return '🇮🇳 ML';
            case 'en': return '🇺🇸 EN';
            case 'manglish': return '🌐 Manglish';
            default: return '🏳️ Unknown';
        }
    };

    const getAlignmentColor = (score: number) => {
        if (score >= 0.9) return 'text-green-600';
        if (score >= 0.8) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getAlignmentBadge = (score: number) => {
        if (score >= 0.9) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
        if (score >= 0.8) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
        if (score >= 0.7) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
        return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const overallAlignment = culturalMetrics.reduce((sum, metric) => sum + metric.alignmentScore, 0) / culturalMetrics.length;
    const totalExecutions = culturalMetrics.reduce((sum, metric) => sum + metric.executionCount, 0);
    const malayalamExecutions = culturalMetrics
        .filter(m => m.language === 'ml' || m.language === 'manglish')
        .reduce((sum, metric) => sum + metric.executionCount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center">
                        <Globe className="mr-2 h-6 w-6 text-blue-600" />
                        Cultural Alignment Intelligence
                    </h2>
                    <p className="text-gray-600">Malayalam and cultural context performance tracking</p>
                </div>
                <div className="flex space-x-2">
                    {(['24h', '7d', '30d'] as const).map((timeframe) => (
                        <button
                            key={timeframe}
                            onClick={() => setSelectedTimeframe(timeframe)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                selectedTimeframe === timeframe
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {timeframe}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Overall Alignment</p>
                                <p className={`text-2xl font-bold ${getAlignmentColor(overallAlignment)}`}>
                                    {Math.round(overallAlignment * 100)}%
                                </p>
                            </div>
                            <Star className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="mt-2">
                            {getAlignmentBadge(overallAlignment)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Malayalam Adoption</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {Math.round((malayalamExecutions / totalExecutions) * 100)}%
                                </p>
                            </div>
                            <Globe className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {malayalamExecutions.toLocaleString()} ML executions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Festivals</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {activeFestivals.length}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Cultural adaptations active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Regions Covered</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {regionalInsights.length}
                                </p>
                            </div>
                            <MapPin className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Kerala districts active
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="metrics">Language Metrics</TabsTrigger>
                    <TabsTrigger value="festivals">Festival Context</TabsTrigger>
                    <TabsTrigger value="regional">Regional Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {culturalMetrics.map((metric, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg flex items-center">
                                                <span className="mr-2">{getLanguageFlag(metric.language)}</span>
                                                {metric.region} - {metric.community}
                                            </CardTitle>
                                            <CardDescription>
                                                {metric.festival && (
                                                    <span className="inline-flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {metric.festival} context
                                                    </span>
                                                )}
                                                <span className="ml-2 inline-flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {metric.timeOfDay}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        {getAlignmentBadge(metric.alignmentScore)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Cultural Alignment</span>
                                                <span className={getAlignmentColor(metric.alignmentScore)}>
                                                    {Math.round(metric.alignmentScore * 100)}%
                                                </span>
                                            </div>
                                            <Progress value={metric.alignmentScore * 100} className="h-2" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Response Quality</span>
                                                <span>{Math.round(metric.responseQuality * 100)}%</span>
                                            </div>
                                            <Progress value={metric.responseQuality * 100} className="h-2" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>User Satisfaction</span>
                                                <span>{Math.round(metric.userSatisfaction * 100)}%</span>
                                            </div>
                                            <Progress value={metric.userSatisfaction * 100} className="h-2" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Executions</p>
                                            <p className="font-medium">{metric.executionCount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Avg Time</p>
                                            <p className="font-medium">{metric.averageTime}ms</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Success Rate</p>
                                            <p className="font-medium">{Math.round(metric.successRate * 100)}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="festivals" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeFestivals.map((festival, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="mr-2 h-5 w-5 text-purple-600" />
                                        {festival.name}
                                    </CardTitle>
                                    <CardDescription>{festival.significance}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Cultural Alignment Boost</p>
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <span className="font-medium text-green-600">
                                                +{Math.round(festival.alignmentBoost * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Active Engines</p>
                                        <div className="flex flex-wrap gap-1">
                                            {festival.activeEngines.map((engine) => (
                                                <Badge key={engine} variant="outline" className="text-xs">
                                                    {engine.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Date: {new Date(festival.date).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="regional" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {regionalInsights.map((region, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                                        {region.region}
                                    </CardTitle>
                                    <CardDescription>
                                        {region.totalExecutions.toLocaleString()} total executions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Regional Alignment</span>
                                            <span className={getAlignmentColor(region.averageAlignment)}>
                                                {Math.round(region.averageAlignment * 100)}%
                                            </span>
                                        </div>
                                        <Progress value={region.averageAlignment * 100} className="h-2" />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Preferred Language</p>
                                        <Badge variant="outline">
                                            {getLanguageFlag(region.preferredLanguage)}
                                        </Badge>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Cultural Nuances</p>
                                        <div className="flex flex-wrap gap-1">
                                            {region.culturalNuances.map((nuance) => (
                                                <Badge key={nuance} variant="outline" className="text-xs">
                                                    {nuance.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Engagement by Time</p>
                                        <div className="space-y-1">
                                            {region.engagementPatterns.map((pattern) => (
                                                <div key={pattern.timeOfDay} className="flex items-center space-x-2">
                                                    <span className="text-xs w-16 capitalize">{pattern.timeOfDay}</span>
                                                    <Progress value={pattern.engagementLevel * 100} className="h-1 flex-1" />
                                                    <span className="text-xs w-8">{Math.round(pattern.engagementLevel * 100)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}