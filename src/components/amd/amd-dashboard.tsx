// AMD Dashboard - Phase 3 Implementation
// Main dashboard for Answering Machine Detection with cultural intelligence

'use client';

import React, { useState } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Brain,
    Target,
    MessageSquare,
    BarChart3,
    Settings,
    Users,
    Globe,
    Zap,
    Shield,
    CheckCircle,
    PhoneCall,
    Mic,
    Volume2,
} from 'lucide-react';

import { AMDAnalyticsDashboard } from './amd-analytics-dashboard';
import { AMDCampaignManagement } from './amd-campaign-management';

export default function AMDDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">AMD System</h1>
                    <p className="text-muted-foreground text-lg">
                        Answering Machine Detection with Malayalam Cultural Intelligence
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Phase 3 Active
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Brain className="w-3 h-3 mr-1" />
                        Malayalam AI
                    </Badge>
                </div>
            </div>

            {/* System Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ML Detection Engine</CardTitle>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Active</div>
                        <p className="text-xs text-muted-foreground">
                            Neural network with Malayalam patterns
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cultural Intelligence</CardTitle>
                        <Brain className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">Enhanced</div>
                        <p className="text-xs text-muted-foreground">
                            Kerala regional dialects supported
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Real-time Processing</CardTitle>
                        <Zap className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">&lt;500ms</div>
                        <p className="text-xs text-muted-foreground">
                            Average detection latency
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Campaign Status</CardTitle>
                        <Target className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">Ready</div>
                        <p className="text-xs text-muted-foreground">
                            Campaigns can be deployed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaign Management</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="settings">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* AMD Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    AMD Capabilities
                                </CardTitle>
                                <CardDescription>
                                    Advanced machine learning detection with cultural intelligence
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <Brain className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">ML-Based Detection</p>
                                                <p className="text-sm text-muted-foreground">Neural network with &gt;95% accuracy</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Malayalam Patterns</p>
                                                <p className="text-sm text-muted-foreground">Cultural greeting recognition</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Enhanced</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Real-time Processing</p>
                                                <p className="text-sm text-muted-foreground">Low latency detection</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700">Optimized</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                <MessageSquare className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Smart Messaging</p>
                                                <p className="text-sm text-muted-foreground">Cultural message adaptation</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700">Intelligent</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cultural Intelligence */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    Cultural Intelligence
                                </CardTitle>
                                <CardDescription>
                                    Malayalam language and cultural adaptation features
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">95%</div>
                                            <div className="text-sm text-muted-foreground">Malayalam Recognition</div>
                                        </div>
                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">3</div>
                                            <div className="text-sm text-muted-foreground">Regional Dialects</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Northern Kerala</span>
                                            <span className="font-medium">Supported</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Central Kerala</span>
                                            <span className="font-medium">Supported</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Southern Kerala</span>
                                            <span className="font-medium">Supported</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Festival Awareness</span>
                                            <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common AMD system operations and management
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-20 flex-col space-y-2"
                                    onClick={() => setActiveTab('campaigns')}
                                >
                                    <MessageSquare className="w-6 h-6" />
                                    <span>Create Campaign</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex-col space-y-2"
                                    onClick={() => setActiveTab('analytics')}
                                >
                                    <BarChart3 className="w-6 h-6" />
                                    <span>View Analytics</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex-col space-y-2"
                                >
                                    <PhoneCall className="w-6 h-6" />
                                    <span>Test Detection</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-20 flex-col space-y-2"
                                    onClick={() => setActiveTab('settings')}
                                >
                                    <Settings className="w-6 h-6" />
                                    <span>Configuration</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Architecture */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Architecture</CardTitle>
                            <CardDescription>
                                AMD system components and integration points
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mic className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h4 className="font-medium mb-2">Audio Processing</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Real-time audio analysis with Malayalam speech patterns
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Brain className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h4 className="font-medium mb-2">ML Detection</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Neural network trained on cultural voice patterns
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h4 className="font-medium mb-2">Smart Response</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Culturally adapted message delivery system
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="campaigns">
                    <AMDCampaignManagement />
                </TabsContent>

                <TabsContent value="analytics">
                    <AMDAnalyticsDashboard />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>AMD Configuration</CardTitle>
                            <CardDescription>
                                System settings and cultural intelligence parameters
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-4">Detection Settings</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">ML Algorithm</span>
                                                <Badge variant="outline">Hybrid Neural Network</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Sensitivity Level</span>
                                                <Badge variant="outline">70%</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Max Detection Time</span>
                                                <Badge variant="outline">5000ms</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Accuracy Threshold</span>
                                                <Badge variant="outline">85%</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-4">Cultural Intelligence</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Malayalam Patterns</span>
                                                <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Dialect Recognition</span>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">Active</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Festival Awareness</span>
                                                <Badge variant="outline" className="bg-purple-50 text-purple-700">Enabled</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Business Hours</span>
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700">Adaptive</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <h4 className="font-medium mb-4">Performance Optimization</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold">95.7%</div>
                                            <div className="text-sm text-muted-foreground">Detection Accuracy</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold">456ms</div>
                                            <div className="text-sm text-muted-foreground">Avg Processing Time</div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold">2.3%</div>
                                            <div className="text-sm text-muted-foreground">False Positive Rate</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}