'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Mic, Volume2, Brain, Zap, Settings, Monitor, Users, Database, TestTube,
    Speaker, Layers, CheckCircle, AlertTriangle, Info, TrendingUp
} from 'lucide-react';

// Modular components
import { SystemStatusCards, CommandsList } from '@/components/voice/command-center';

// Custom hook for state management
import { useCommandCenter } from '@/hooks/useCommandCenter';

/**
 * Voice AI Command Center Page
 * Central hub for voice AI operations, model management, and speech processing.
 * 
 * Refactored from 547 lines to ~200 lines using modular components.
 */
export default function VoiceCommandCenterPage() {
    const { systemStatus, commands } = useCommandCenter();
    const [selectedTab, setSelectedTab] = useState('overview');
    const router = useRouter();

    const quickActions = [
        { icon: Mic, label: 'Start Recording', route: '/speech-synthesizer' },
        { icon: Volume2, label: 'Generate Speech', route: '/speech-synthesizer', variant: 'outline' as const },
        { icon: Users, label: 'Clone Voice', route: '/voice-cloning', variant: 'outline' as const },
        { icon: TestTube, label: 'Run Tests', route: '/voice-testing-suite', variant: 'outline' as const },
        { icon: Database, label: 'Manage Data', route: '/voice-data-management', variant: 'outline' as const },
        { icon: Monitor, label: 'View Analytics', route: '/analytics', variant: 'outline' as const },
    ];

    const tabContent = [
        { value: 'models', title: 'Voice Model Management', desc: 'Manage voice models, training jobs, and performance metrics', icon: Brain, route: '/voice-model-management', btnText: 'Access Model Manager' },
        { value: 'synthesis', title: 'Speech Synthesis Control', desc: 'Advanced text-to-speech synthesis with multiple voices and languages', icon: Speaker, route: '/speech-synthesizer', btnText: 'Launch Synthesizer' },
        { value: 'cloning', title: 'Voice Cloning Studio', desc: 'Professional voice cloning with quality analysis and model training', icon: Users, route: '/voice-cloning', btnText: 'Access Voice Cloning' },
        { value: 'data', title: 'Voice Data Foundry', desc: 'Comprehensive voice data management and processing platform', icon: Database, route: '/voice-data-management', btnText: 'Enter Data Foundry' },
        { value: 'processing', title: 'Voice Data Processing Pipeline', desc: 'Advanced ETL pipelines for comprehensive voice data processing and transformation', icon: Layers, route: '/voice-data-processing-pipeline', btnText: 'Launch Pipeline Manager' },
        { value: 'testing', title: 'Voice Testing Suite', desc: 'Comprehensive testing tools for voice quality, accuracy, and performance', icon: TestTube, route: '/voice-testing-suite', btnText: 'Run Test Suite' },
    ];

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <Mic className="h-10 w-10 text-blue-600" />
                            Voice AI Command Center
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Central hub for voice AI operations, model management, and speech processing
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            System Settings
                        </Button>
                        <Button size="sm">
                            <Monitor className="h-4 w-4 mr-2" />
                            Launch Control Panel
                        </Button>
                    </div>
                </div>

                {/* System Status Overview */}
                <SystemStatusCards status={systemStatus} />

                {/* Main Control Interface */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="models">Model Management</TabsTrigger>
                        <TabsTrigger value="synthesis">Speech Synthesis</TabsTrigger>
                        <TabsTrigger value="cloning">Voice Cloning</TabsTrigger>
                        <TabsTrigger value="data">Data Management</TabsTrigger>
                        <TabsTrigger value="processing">Data Processing</TabsTrigger>
                        <TabsTrigger value="testing">Testing Suite</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Active Commands */}
                            <CommandsList commands={commands} />

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription>
                                        Common voice AI operations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3">
                                    {quickActions.map((action) => (
                                        <Button
                                            key={action.label}
                                            variant={action.variant || 'default'}
                                            className="h-20 flex-col gap-2"
                                            onClick={() => router.push(action.route)}
                                        >
                                            <action.icon className="h-6 w-6" />
                                            <span className="text-sm">{action.label}</span>
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Alerts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    System Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Voice Cloning Queue</AlertTitle>
                                    <AlertDescription>
                                        3 voice cloning jobs are currently processing. Estimated completion in 2 hours.
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>Storage Capacity</AlertTitle>
                                    <AlertDescription>
                                        Voice data storage is at 24% capacity. 7.6GB remaining.
                                    </AlertDescription>
                                </Alert>
                                <Alert>
                                    <TrendingUp className="h-4 w-4" />
                                    <AlertTitle>Performance Improvement</AlertTitle>
                                    <AlertDescription>
                                        Speech recognition accuracy improved by 2.1% this week.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Other tabs - navigation to dedicated pages */}
                    {tabContent.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{tab.title}</CardTitle>
                                    <CardDescription>{tab.desc}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <tab.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">{tab.title}</h3>
                                        <p className="text-muted-foreground mb-4">{tab.desc}</p>
                                        <Button onClick={() => router.push(tab.route)}>
                                            {tab.btnText}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </ManagementLayout>
    );
}