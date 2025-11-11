'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMockData, mockDataGenerators } from '@/hooks/use-mock-data';
import {
    Database,
    RefreshCw,
    Play,
    Pause,
    Settings,
    BarChart3,
    Users,
    Phone,
    Activity,
    TrendingUp,
    Zap
} from 'lucide-react';

interface MockDataScenario {
    id: string;
    name: string;
    description: string;
    dataTypes: string[];
    isActive: boolean;
}

export default function MockDataManager() {
    const { mode, setMode, isDemoMode } = useMockData();
    const [scenarios, setScenarios] = useState<MockDataScenario[]>([
        {
            id: 'peak-hours',
            name: 'Peak Hours Simulation',
            description: 'High call volume during business hours',
            dataTypes: ['calls', 'agents', 'analytics'],
            isActive: false
        },
        {
            id: 'system-stress',
            name: 'System Stress Test',
            description: 'Simulate high system load and performance issues',
            dataTypes: ['system-health', 'performance', 'monitoring'],
            isActive: false
        },
        {
            id: 'cultural-demo',
            name: 'Cultural Intelligence Demo',
            description: 'Showcase Malayalam and Manglish processing',
            dataTypes: ['cultural-intelligence', 'speech-processing'],
            isActive: false
        },
        {
            id: 'revenue-boost',
            name: 'Revenue Optimization',
            description: 'Demonstrate revenue growth scenarios',
            dataTypes: ['revenue', 'analytics', 'performance'],
            isActive: false
        }
    ]);

    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30); // seconds
    const [customStats, setCustomStats] = useState({
        totalCalls: '',
        activeCalls: '',
        totalAgents: '',
        revenue: ''
    });

    // Auto-refresh mock data
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (autoRefresh && isDemoMode) {
            interval = setInterval(() => {
                // This would trigger data refresh in connected components
                window.dispatchEvent(new CustomEvent('mock-data-refresh'));
            }, refreshInterval * 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, refreshInterval, isDemoMode]);

    const handleScenarioToggle = (scenarioId: string) => {
        setScenarios(prev => prev.map(scenario =>
            scenario.id === scenarioId
                ? { ...scenario, isActive: !scenario.isActive }
                : scenario
        ));

        // Trigger scenario change event
        window.dispatchEvent(new CustomEvent('mock-scenario-change', {
            detail: { scenarioId, active: !scenarios.find(s => s.id === scenarioId)?.isActive }
        }));
    };

    const handleCustomStatChange = (field: string, value: string) => {
        setCustomStats(prev => ({ ...prev, [field]: value }));

        // Update custom stats
        if (value && !isNaN(Number(value))) {
            window.dispatchEvent(new CustomEvent('mock-custom-stat-update', {
                detail: { field, value: Number(value) }
            }));
        }
    };

    const generateRandomData = () => {
        const newData = mockDataGenerators.generateDashboardStats();
        setCustomStats({
            totalCalls: newData.totalCalls.toString(),
            activeCalls: newData.activeCalls.toString(),
            totalAgents: newData.totalAgents.toString(),
            revenue: newData.revenue.toString()
        });

        // Trigger immediate refresh
        window.dispatchEvent(new CustomEvent('mock-data-refresh'));
    };

    const resetToDefaults = () => {
        setCustomStats({
            totalCalls: '',
            activeCalls: '',
            totalAgents: '',
            revenue: ''
        });
        setScenarios(prev => prev.map(s => ({ ...s, isActive: false })));
        setAutoRefresh(false);

        window.dispatchEvent(new CustomEvent('mock-data-reset'));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Database className="h-8 w-8 text-blue-600" />
                        Mock Data Manager
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Configure and manage demo data scenarios for testing and demonstrations
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={isDemoMode ? "default" : "secondary"} className="px-3 py-1">
                        {isDemoMode ? 'Demo Mode Active' : 'Realtime Mode'}
                    </Badge>
                    <Button
                        onClick={() => setMode(isDemoMode ? 'realtime' : 'demo')}
                        variant={isDemoMode ? "default" : "outline"}
                    >
                        {isDemoMode ? 'Switch to Realtime' : 'Switch to Demo'}
                    </Button>
                </div>
            </div>

            {/* Global Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Global Controls
                    </CardTitle>
                    <CardDescription>
                        Configure automatic data refresh and global mock settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label htmlFor="auto-refresh">Auto Refresh Mock Data</Label>
                            <p className="text-sm text-gray-600">Automatically update mock data at regular intervals</p>
                        </div>
                        <Switch
                            id="auto-refresh"
                            checked={autoRefresh}
                            onCheckedChange={setAutoRefresh}
                            disabled={!isDemoMode}
                        />
                    </div>

                    {autoRefresh && (
                        <div className="flex items-center gap-4">
                            <Label htmlFor="refresh-interval">Refresh Interval:</Label>
                            <Select
                                value={refreshInterval.toString()}
                                onValueChange={(value) => setRefreshInterval(Number(value))}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 seconds</SelectItem>
                                    <SelectItem value="30">30 seconds</SelectItem>
                                    <SelectItem value="60">1 minute</SelectItem>
                                    <SelectItem value="300">5 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Separator />

                    <div className="flex gap-2">
                        <Button onClick={generateRandomData} disabled={!isDemoMode}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate Random Data
                        </Button>
                        <Button variant="outline" onClick={resetToDefaults} disabled={!isDemoMode}>
                            Reset to Defaults
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Stats Override */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Custom Statistics Override
                    </CardTitle>
                    <CardDescription>
                        Set specific values for dashboard statistics (leave empty for random generation)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="total-calls">Total Calls</Label>
                            <Input
                                id="total-calls"
                                type="number"
                                placeholder="Auto"
                                value={customStats.totalCalls}
                                onChange={(e) => handleCustomStatChange('totalCalls', e.target.value)}
                                disabled={!isDemoMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="active-calls">Active Calls</Label>
                            <Input
                                id="active-calls"
                                type="number"
                                placeholder="Auto"
                                value={customStats.activeCalls}
                                onChange={(e) => handleCustomStatChange('activeCalls', e.target.value)}
                                disabled={!isDemoMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="total-agents">Total Agents</Label>
                            <Input
                                id="total-agents"
                                type="number"
                                placeholder="Auto"
                                value={customStats.totalAgents}
                                onChange={(e) => handleCustomStatChange('totalAgents', e.target.value)}
                                disabled={!isDemoMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="revenue">Revenue ($)</Label>
                            <Input
                                id="revenue"
                                type="number"
                                placeholder="Auto"
                                value={customStats.revenue}
                                onChange={(e) => handleCustomStatChange('revenue', e.target.value)}
                                disabled={!isDemoMode}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Demo Scenarios */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Demo Scenarios
                    </CardTitle>
                    <CardDescription>
                        Pre-configured scenarios to demonstrate different system capabilities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scenarios.map((scenario) => (
                            <Card key={scenario.id} className={`border-2 transition-colors ${scenario.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{scenario.name}</CardTitle>
                                        <Switch
                                            checked={scenario.isActive}
                                            onCheckedChange={() => handleScenarioToggle(scenario.id)}
                                            disabled={!isDemoMode}
                                        />
                                    </div>
                                    <CardDescription>{scenario.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-1">
                                        {scenario.dataTypes.map((type) => (
                                            <Badge key={type} variant="outline" className="text-xs">
                                                {type.replace('-', ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Mock Data Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <div>
                                <p className="font-medium">Demo Mode</p>
                                <p className="text-sm text-gray-600">
                                    {isDemoMode ? 'Active - Using mock data' : 'Inactive - Using real data'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-blue-500' : 'bg-gray-400'}`} />
                            <div>
                                <p className="font-medium">Auto Refresh</p>
                                <p className="text-sm text-gray-600">
                                    {autoRefresh ? `Every ${refreshInterval}s` : 'Disabled'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${scenarios.some(s => s.isActive) ? 'bg-purple-500' : 'bg-gray-400'}`} />
                            <div>
                                <p className="font-medium">Active Scenarios</p>
                                <p className="text-sm text-gray-600">
                                    {scenarios.filter(s => s.isActive).length} of {scenarios.length} active
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}