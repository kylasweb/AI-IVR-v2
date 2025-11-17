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
    Router
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
    totalCalls: number;
    activeWorkflows: number;
    systemLoad: number;
    memoryUsage: number;
    activeUsers: number;
    monthlyUsage: number;
    billingCycle: string;
    planLimits: {
        calls: number;
        storage: number;
        users: number;
    };
}

const ClientAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalCalls: 0,
        activeWorkflows: 0,
        systemLoad: 0,
        memoryUsage: 0,
        activeUsers: 0,
        monthlyUsage: 0,
        billingCycle: 'November 2025',
        planLimits: {
            calls: 10000,
            storage: 100,
            users: 50
        }
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
                totalCalls: prev.totalCalls + Math.floor(Math.random() * 5),
                systemLoad: Math.max(0, Math.min(100, prev.systemLoad + (Math.random() - 0.5) * 10)),
                memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
                activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 3) - 1)
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
            description: 'System overview and key metrics'
        },
        {
            id: 'billing',
            name: 'Billing & Usage',
            icon: CreditCard,
            description: 'Subscription management and billing'
        },
        {
            id: 'ivr',
            name: 'IVR Management',
            icon: PhoneCall,
            description: 'Interactive Voice Response configuration'
        },
        {
            id: 'analytics',
            name: 'Analytics',
            icon: TrendingUp,
            description: 'Usage analytics and insights'
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
                <TabsList className="grid w-full grid-cols-4">
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
                                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                                <PhoneCall className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalCalls.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    +12% from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                                <Workflow className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.activeWorkflows}</div>
                                <p className="text-xs text-muted-foreground">
                                    All systems operational
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

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Currently online
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Health */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                {getStatusIcon(health.overall)}
                                <span>System Health</span>
                            </CardTitle>
                            <CardDescription>
                                Real-time status of all system services
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
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link href="/ivr-management">
                                    <Button className="w-full h-20 flex flex-col items-center space-y-2">
                                        <PhoneCall className="h-6 w-6" />
                                        <span>IVR Config</span>
                                    </Button>
                                </Link>
                                <Link href="/analytics">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                        <TrendingUp className="h-6 w-6" />
                                        <span>View Analytics</span>
                                    </Button>
                                </Link>
                                <Link href="/settings">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                        <Settings className="h-6 w-6" />
                                        <span>Settings</span>
                                    </Button>
                                </Link>
                                <Link href="/customers">
                                    <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                        <Users className="h-6 w-6" />
                                        <span>Customer Mgmt</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing & Usage Tab */}
                <TabsContent value="billing" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Plan</CardTitle>
                                <CardDescription>Professional Plan - {metrics.billingCycle}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Monthly Calls</span>
                                    <span>{metrics.monthlyUsage.toLocaleString()} / {metrics.planLimits.calls.toLocaleString()}</span>
                                </div>
                                <Progress value={(metrics.monthlyUsage / metrics.planLimits.calls) * 100} />

                                <div className="flex justify-between items-center">
                                    <span>Storage Used</span>
                                    <span>45GB / {metrics.planLimits.storage}GB</span>
                                </div>
                                <Progress value={45} />

                                <div className="flex justify-between items-center">
                                    <span>Active Users</span>
                                    <span>{metrics.activeUsers} / {metrics.planLimits.users}</span>
                                </div>
                                <Progress value={(metrics.activeUsers / metrics.planLimits.users) * 100} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Billing History</CardTitle>
                                <CardDescription>Recent invoices and payments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>October 2025</span>
                                        <div className="text-right">
                                            <div className="font-medium">$2,450.00</div>
                                            <div className="text-sm text-green-600">Paid</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>September 2025</span>
                                        <div className="text-right">
                                            <div className="font-medium">$2,380.00</div>
                                            <div className="text-sm text-green-600">Paid</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>August 2025</span>
                                        <div className="text-right">
                                            <div className="font-medium">$2,320.00</div>
                                            <div className="text-sm text-green-600">Paid</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* IVR Management Tab */}
                <TabsContent value="ivr" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>IVR Workflows</CardTitle>
                            <CardDescription>
                                Manage your interactive voice response systems
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Link href="/ivr-management">
                                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                <PhoneCall className="h-5 w-5" />
                                                <span>Customer Service</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                Main customer support workflow with multilingual support
                                            </p>
                                            <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/ivr-management">
                                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                <Car className="h-5 w-5" />
                                                <span>Ride Booking</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                Automated ride booking and dispatch system
                                            </p>
                                            <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/ivr-management">
                                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                <Receipt className="h-5 w-5" />
                                                <span>Billing Support</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                Automated billing inquiries and payment processing
                                            </p>
                                            <Badge className="mt-2 bg-yellow-100 text-yellow-800">Draft</Badge>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Call Analytics</CardTitle>
                                <CardDescription>Call volume and quality metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Total Calls</span>
                                        <span className="font-medium">{metrics.totalCalls.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Average Call Duration</span>
                                        <span className="font-medium">4:32</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Call Success Rate</span>
                                        <span className="font-medium text-green-600">94.2%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Peak Hours</span>
                                        <span className="font-medium">9 AM - 6 PM</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Engagement</CardTitle>
                                <CardDescription>User interaction and satisfaction metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Active Users</span>
                                        <span className="font-medium">{metrics.activeUsers}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>User Satisfaction</span>
                                        <span className="font-medium text-green-600">4.8/5.0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Self-Service Rate</span>
                                        <span className="font-medium">78.5%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Support Tickets</span>
                                        <span className="font-medium text-green-600">↓ 23%</span>
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

export default ClientAdminDashboard;