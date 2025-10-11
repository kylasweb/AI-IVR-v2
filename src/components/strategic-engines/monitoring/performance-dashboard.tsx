// Strategic Engine Performance Dashboard
// Real-time monitoring and visualization for all strategic engines
// Project Saksham Production Monitoring Component

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
    Activity, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle,
    Clock,
    Database,
    Globe,
    Zap
} from 'lucide-react';

interface EngineMetrics {
    engineType: string;
    status: 'healthy' | 'degraded' | 'critical';
    isHealthy: boolean;
    averageResponseTime: number;
    successRate: number;
    errorCount: number;
    uptime: number;
    culturalAlignment: number;
    malayalamCapability: boolean;
    lastHealthCheck: string;
    version: string;
    executionsToday: number;
    throughput: number;
}

interface SystemMetrics {
    overallStatus: 'healthy' | 'degraded' | 'critical';
    totalEngines: number;
    healthyEngines: number;
    degradedEngines: number;
    failedEngines: number;
    averageAlignment: number;
    malayalamSupportPercentage: number;
    totalExecutions: number;
    averageSystemResponseTime: number;
    systemUptime: number;
}

export function PerformanceDashboard() {
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
    const [engineMetrics, setEngineMetrics] = useState<EngineMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchMetrics();
        
        if (autoRefresh) {
            const interval = setInterval(fetchMetrics, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);

    const fetchMetrics = async () => {
        try {
            setError(null);
            const response = await fetch('/api/strategic-engines/health?detailed=true');
            
            if (!response.ok) {
                throw new Error(`Health check failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Transform data to match our interface
            setSystemMetrics({
                overallStatus: data.overallStatus,
                totalEngines: data.totalEngines,
                healthyEngines: data.healthyEngines,
                degradedEngines: data.degradedEngines,
                failedEngines: data.failedEngines,
                averageAlignment: data.culturalMetrics?.averageAlignment || 0,
                malayalamSupportPercentage: data.culturalMetrics?.malayalamSupportPercentage || 0,
                totalExecutions: data.systemMetrics?.totalExecutions || 0,
                averageSystemResponseTime: data.systemMetrics?.averageSystemResponseTime || 0,
                systemUptime: data.systemMetrics?.systemUptime || 0
            });

            setEngineMetrics(data.engines?.map((engine: any): EngineMetrics => ({
                engineType: engine.engineType,
                status: engine.isHealthy ? 'healthy' : 'critical',
                isHealthy: engine.isHealthy,
                averageResponseTime: engine.averageResponseTime,
                successRate: engine.successRate,
                errorCount: engine.errorCount,
                uptime: engine.uptime,
                culturalAlignment: engine.culturalAlignment,
                malayalamCapability: engine.malayalamCapability,
                lastHealthCheck: engine.lastHealthCheck,
                version: engine.version,
                executionsToday: Math.floor(Math.random() * 1000), // Placeholder
                throughput: Math.floor(Math.random() * 100) // Placeholder
            })) || []);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-500';
            case 'degraded': return 'bg-yellow-500';
            case 'critical': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default: return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const formatEngineType = (engineType: string) => {
        return engineType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Error loading metrics: {error}</span>
                    </div>
                    <Button 
                        onClick={fetchMetrics} 
                        className="mt-4"
                        variant="outline"
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Strategic Engine Performance</h2>
                    <p className="text-gray-600">Real-time monitoring and cultural alignment tracking</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? 'Pause' : 'Resume'} Auto Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchMetrics}
                    >
                        Refresh Now
                    </Button>
                </div>
            </div>

            {/* System Overview */}
            {systemMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">System Status</p>
                                    <p className="text-2xl font-bold">
                                        {systemMetrics.overallStatus.toUpperCase()}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-full ${getStatusColor(systemMetrics.overallStatus)}`}>
                                    {getStatusIcon(systemMetrics.overallStatus)}
                                </div>
                            </div>
                            <div className="mt-4 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Healthy Engines</span>
                                    <span>{systemMetrics.healthyEngines}/{systemMetrics.totalEngines}</span>
                                </div>
                                <Progress 
                                    value={(systemMetrics.healthyEngines / systemMetrics.totalEngines) * 100} 
                                    className="h-2"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Cultural Alignment</p>
                                    <p className="text-2xl font-bold">
                                        {Math.round(systemMetrics.averageAlignment * 100)}%
                                    </p>
                                </div>
                                <Globe className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Malayalam Support</span>
                                    <span>{Math.round(systemMetrics.malayalamSupportPercentage)}%</span>
                                </div>
                                <Progress value={systemMetrics.malayalamSupportPercentage} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                                    <p className="text-2xl font-bold">
                                        {systemMetrics.averageSystemResponseTime}ms
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                System Uptime: {Math.round(systemMetrics.systemUptime)}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Executions</p>
                                    <p className="text-2xl font-bold">
                                        {systemMetrics.totalExecutions.toLocaleString()}
                                    </p>
                                </div>
                                <Zap className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="mt-4 text-sm text-green-600 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Active Production System
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Engine Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {engineMetrics.map((engine) => (
                    <Card key={engine.engineType} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">
                                        {formatEngineType(engine.engineType)}
                                    </CardTitle>
                                    <CardDescription>
                                        v{engine.version} • {engine.malayalamCapability ? 'ML Support' : 'EN Only'}
                                    </CardDescription>
                                </div>
                                <Badge 
                                    variant={engine.isHealthy ? "default" : "destructive"}
                                    className="capitalize"
                                >
                                    {engine.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Success Rate</p>
                                    <div className="flex items-center space-x-2">
                                        <Progress value={engine.successRate * 100} className="h-2 flex-1" />
                                        <span className="font-medium">{Math.round(engine.successRate * 100)}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-600">Cultural Alignment</p>
                                    <div className="flex items-center space-x-2">
                                        <Progress value={engine.culturalAlignment * 100} className="h-2 flex-1" />
                                        <span className="font-medium">{Math.round(engine.culturalAlignment * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Response Time
                                    </p>
                                    <p className="font-medium">{engine.averageResponseTime}ms</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 flex items-center">
                                        <Activity className="h-3 w-3 mr-1" />
                                        Uptime
                                    </p>
                                    <p className="font-medium">{Math.round(engine.uptime)}%</p>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 border-t pt-2">
                                Last checked: {new Date(engine.lastHealthCheck).toLocaleTimeString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}