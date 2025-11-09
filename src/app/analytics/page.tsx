'use client';

import React from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    TrendingUp,
    Users,
    Phone,
    Clock,
    Star,
    Download,
    RefreshCw,
    Settings,
    Activity,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <ManagementLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            Comprehensive analytics and business intelligence
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">45,231</div>
                            <p className="text-xs text-muted-foreground">
                                <TrendingUp className="inline h-3 w-3 mr-1" />
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2,350</div>
                            <p className="text-xs text-muted-foreground">
                                <TrendingUp className="inline h-3 w-3 mr-1" />
                                +180.1% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2.4s</div>
                            <p className="text-xs text-muted-foreground">
                                <TrendingUp className="inline h-3 w-3 mr-1" />
                                +19% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">98.5%</div>
                            <p className="text-xs text-muted-foreground">
                                <TrendingUp className="inline h-3 w-3 mr-1" />
                                +2.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="calls">Call Analytics</TabsTrigger>
                        <TabsTrigger value="users">User Behavior</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Call Volume Trends</CardTitle>
                                    <CardDescription>
                                        Daily call volume over the past 30 days
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 flex items-center justify-center border rounded-lg bg-gray-50">
                                        <p className="text-gray-500">Chart placeholder - Call volume trends</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Success Rate Distribution</CardTitle>
                                    <CardDescription>
                                        Call resolution and success metrics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Successful</span>
                                                <span>89.2%</span>
                                            </div>
                                            <Progress value={89.2} className="w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Partial Success</span>
                                                <span>8.3%</span>
                                            </div>
                                            <Progress value={8.3} className="w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Failed</span>
                                                <span>2.5%</span>
                                            </div>
                                            <Progress value={2.5} className="w-full" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="calls" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Call Analytics</CardTitle>
                                <CardDescription>
                                    Detailed call statistics and patterns
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-96 flex items-center justify-center border rounded-lg bg-gray-50">
                                    <p className="text-gray-500">Detailed call analytics charts would be displayed here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Behavior Analysis</CardTitle>
                                <CardDescription>
                                    User interaction patterns and journey analytics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-96 flex items-center justify-center border rounded-lg bg-gray-50">
                                    <p className="text-gray-500">User behavior analytics would be displayed here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Performance</CardTitle>
                                <CardDescription>
                                    System performance metrics and monitoring
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-96 flex items-center justify-center border rounded-lg bg-gray-50">
                                    <p className="text-gray-500">Performance metrics would be displayed here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ManagementLayout>
    );
}