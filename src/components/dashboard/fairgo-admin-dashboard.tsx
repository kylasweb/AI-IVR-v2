'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    Users,
    Phone,
    PhoneCall,
    Settings,
    BarChart3,
    Bot,
    GitBranch as Workflow,
    Shield,
    Globe,
    Zap,
    TrendingUp,
    Clock,
    Database,
    Phone as AudioLines,
    MessageSquare,
    Eye as Video,
    Phone as Smartphone,
    Brain,
    Eye,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Car,
    FileText,
    Mic,
    CreditCard,
    Receipt,
    UserCheck,
    Server,
    Network,
    Router,
    Building,
    Target,
    Award
} from 'lucide-react';

interface SystemHealth {
    overall: string;
    services: Array<{
        name: string;
        status: string;
        uptime: number;
        responseTime: number;
    }>;
}

interface DashboardMetrics {
    totalClients: number;
    activeClients: number;
    totalRevenue: number;
    monthlyGrowth: number;
    systemLoad: number;
    activeWorkflows: number;
    trainingCompletion: number;
    clientSatisfaction: number;
}

const FairGoAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalClients: 0,
        activeClients: 0,
        totalRevenue: 0,
        monthlyGrowth: 0,
        systemLoad: 0,
        activeWorkflows: 0,
        trainingCompletion: 0,
        clientSatisfaction: 0
    });

    const [health, setHealth] = useState<SystemHealth>({
        overall: 'healthy',
        services: []
    });

    // Simulate real-time metrics updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                totalClients: Math.max(0, prev.totalClients + Math.floor(Math.random() * 3) - 1),
                activeClients: Math.max(0, prev.activeClients + Math.floor(Math.random() * 2) - 1),
                totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 1000),
                systemLoad: Math.max(0, Math.min(100, prev.systemLoad + (Math.random() - 0.5) * 10)),
                trainingCompletion: Math.max(0, Math.min(100, prev.trainingCompletion + (Math.random() - 0.5) * 2)),
                clientSatisfaction: Math.max(0, Math.min(5, prev.clientSatisfaction + (Math.random() - 0.5) * 0.1))
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Fetch system health
    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const response = await fetch('/api/health');
                if (response.ok) {
                    const data = await response.json();
                    setHealth(data);
                }
            } catch (error) {
                console.error('Failed to fetch health:', error);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const navigationTabs = [
        {
            id: 'overview',
            name: 'Overview',
            icon: BarChart3,
            description: 'Platform overview and key metrics'
        },
        {
            id: 'training',
            name: 'Training Hub',
            icon: UserCheck,
            description: 'Operator training and SOP management'
        },
        {
            id: 'clients',
            name: 'Client Management',
            icon: Users,
            description: 'Manage client accounts and subscriptions'
        },
        {
            id: 'operations',
            name: 'Operations',
            icon: Settings,
            description: 'Operational oversight and management'
        },
        {
            id: 'analytics',
            name: 'Analytics',
            icon: TrendingUp,
            description: 'Advanced analytics and insights'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'operational':
                return 'bg-green-100 text-green-800';
            case 'degraded':
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'critical':
            case 'error':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'operational':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'degraded':
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'critical':
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    {navigationTabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.name}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalClients}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{Math.round(metrics.monthlyGrowth)}% from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.activeClients}</div>
                                <p className="text-xs text-muted-foreground">
                                    Currently active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    +12% from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Load</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{Math.round(metrics.systemLoad)}%</div>
                                <Progress value={metrics.systemLoad} className="mt-2" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Health */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                {getStatusIcon(health.overall)}
                                <span>Platform Health</span>
                            </CardTitle>
                            <CardDescription>
                                Real-time status of all platform services
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {health.services.slice(0, 6).map((service, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(service.status)}
                                            <span className="text-sm font-medium">{service.name}</span>
                                        </div>
                                        <Badge className={getStatusColor(service.status)}>
                                            {service.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Management</CardTitle>
                            <CardDescription>
                                Key administrative tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link href="/customers">
                                    <Button className="w-full h-20 flex flex-col items-center space-y-2">
                                        <Building className="h-6 w-6" />
                                        <span>Client Mgmt</span>
                                    </Button>
                                </Link>
                                <Link href="/analytics">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                        <TrendingUp className="h-6 w-6" />
                                        <span>Analytics</span>
                                    </Button>
                                </Link>
                                <Link href="/settings">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                        <Settings className="h-6 w-6" />
                                        <span>Platform Settings</span>
                                    </Button>
                                </Link>
                                <Link href="/monitoring">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                        <Activity className="h-6 w-6" />
                                        <span>System Monitor</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Training Hub Tab */}
                <TabsContent value="training" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Training Progress</CardTitle>
                                <CardDescription>Operator training completion rates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Overall Completion</span>
                                    <span className="font-medium">{Math.round(metrics.trainingCompletion)}%</span>
                                </div>
                                <Progress value={metrics.trainingCompletion} />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>IVR Management</span>
                                        <span className="text-sm text-green-600">85%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Crisis Response</span>
                                        <span className="text-sm text-yellow-600">72%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Cultural Training</span>
                                        <span className="text-sm text-green-600">91%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Training Modules</CardTitle>
                                <CardDescription>Available training programs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">IVR System Training</div>
                                            <div className="text-sm text-muted-foreground">Interactive Voice Response basics</div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">Required</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">Crisis Management</div>
                                            <div className="text-sm text-muted-foreground">Emergency response protocols</div>
                                        </div>
                                        <Badge className="bg-yellow-100 text-yellow-800">Optional</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">Cultural Sensitivity</div>
                                            <div className="text-sm text-muted-foreground">Regional and cultural awareness</div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">Required</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Client Management Tab */}
                <TabsContent value="clients" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Overview</CardTitle>
                            <CardDescription>
                                Manage client accounts, subscriptions, and support
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center space-x-2">
                                            <Building className="h-5 w-5" />
                                            <span>Kochi General Hospital</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Plan:</span>
                                                <span className="font-medium">Enterprise</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Status:</span>
                                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Revenue:</span>
                                                <span className="font-medium">$4,250/mo</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center space-x-2">
                                            <Building className="h-5 w-5" />
                                            <span>Trivandrum Medical Center</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Plan:</span>
                                                <span className="font-medium">Professional</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Status:</span>
                                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Revenue:</span>
                                                <span className="font-medium">$2,150/mo</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center space-x-2">
                                            <Building className="h-5 w-5" />
                                            <span>Ernakulam City Hospital</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Plan:</span>
                                                <span className="font-medium">Professional</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Status:</span>
                                                <Badge className="bg-yellow-100 text-yellow-800">Trial</Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Revenue:</span>
                                                <span className="font-medium">$0/mo</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Operations Tab */}
                <TabsContent value="operations" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Operational Metrics</CardTitle>
                                <CardDescription>Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>System Uptime</span>
                                        <span className="font-medium text-green-600">99.9%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Avg Response Time</span>
                                        <span className="font-medium">245ms</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Active Workflows</span>
                                        <span className="font-medium">{metrics.activeWorkflows}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Client Satisfaction</span>
                                        <span className="font-medium text-green-600">{metrics.clientSatisfaction.toFixed(1)}/5.0</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activities</CardTitle>
                                <CardDescription>Latest platform activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium">New client onboarded</div>
                                            <div className="text-xs text-muted-foreground">Kochi General Hospital - 2 hours ago</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium">System maintenance scheduled</div>
                                            <div className="text-xs text-muted-foreground">Tomorrow 2:00 AM IST</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium">Monthly target achieved</div>
                                            <div className="text-xs text-muted-foreground">Revenue target exceeded by 15%</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Analytics</CardTitle>
                                <CardDescription>Monthly recurring revenue trends</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>MRR</span>
                                        <span className="font-medium">${metrics.totalRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Growth Rate</span>
                                        <span className="font-medium text-green-600">+12.5%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Churn Rate</span>
                                        <span className="font-medium text-green-600">2.1%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Avg Contract Value</span>
                                        <span className="font-medium">$3,250</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Client Metrics</CardTitle>
                                <CardDescription>Client engagement and usage statistics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Total Clients</span>
                                        <span className="font-medium">{metrics.totalClients}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Active Clients</span>
                                        <span className="font-medium">{metrics.activeClients}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Client Retention</span>
                                        <span className="font-medium text-green-600">94.2%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Avg Session Duration</span>
                                        <span className="font-medium">8:32</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FairGoAdminDashboard;