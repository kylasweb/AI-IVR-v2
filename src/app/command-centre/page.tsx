'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Settings as Command,
    Settings,
    Database,
    Activity,
    Users,
    Phone,
    Bot,
    Mic,
    Volume2,
    BarChart3,
    Zap,
    Shield,
    Globe,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Play,
    Settings as Pause,
    Settings as Square,
    RefreshCw,
    Settings as Power,
    Activity as Monitor,
    FileText,
    Activity as Network,
    Brain,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

interface SystemStatus {
    service: string;
    status: 'online' | 'offline' | 'maintenance' | 'warning';
    uptime: string;
    load: number;
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
    action: () => void;
    disabled?: boolean;
}

export default function CommandCentrePage() {
    const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
        { service: 'IVR Core', status: 'online', uptime: '99.9%', load: 45 },
        { service: 'AI Agents', status: 'online', uptime: '98.7%', load: 62 },
        { service: 'Voice Processing', status: 'online', uptime: '99.5%', load: 38 },
        { service: 'Database', status: 'online', uptime: '99.8%', load: 23 },
        { service: 'API Gateway', status: 'warning', uptime: '97.2%', load: 78 },
        { service: 'Monitoring', status: 'online', uptime: '99.9%', load: 15 }
    ]);

    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30);

    const quickActions: QuickAction[] = [
        {
            id: 'create-ivr',
            title: 'Create IVR Flow',
            description: 'Quick setup for new IVR configuration',
            icon: Phone,
            category: 'IVR Management',
            action: () => console.log('Create IVR')
        },
        {
            id: 'deploy-agent',
            title: 'Deploy AI Agent',
            description: 'Deploy new or updated AI agent',
            icon: Bot,
            category: 'AI Management',
            action: () => console.log('Deploy Agent')
        },
        {
            id: 'backup-db',
            title: 'Database Backup',
            description: 'Create system backup',
            icon: Database,
            category: 'Database',
            action: () => console.log('Backup DB')
        },
        {
            id: 'system-restart',
            title: 'System Restart',
            description: 'Restart core services',
            icon: RefreshCw,
            category: 'System',
            action: () => console.log('System Restart'),
            disabled: false
        },
        {
            id: 'user-management',
            title: 'Manage Users',
            description: 'Add, edit, or remove users',
            icon: Users,
            category: 'User Management',
            action: () => console.log('Manage Users')
        },
        {
            id: 'voice-training',
            title: 'Voice Training',
            description: 'Train voice recognition models',
            icon: Mic,
            category: 'Voice AI',
            action: () => console.log('Voice Training')
        },
        {
            id: 'analytics-export',
            title: 'Export Analytics',
            description: 'Generate and export reports',
            icon: BarChart3,
            category: 'Analytics',
            action: () => console.log('Export Analytics')
        },
        {
            id: 'security-scan',
            title: 'Security Scan',
            description: 'Run security vulnerability scan',
            icon: Shield,
            category: 'Security',
            action: () => console.log('Security Scan')
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'offline': return 'text-red-600';
            case 'maintenance': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return CheckCircle;
            case 'warning': return AlertTriangle;
            case 'offline': return XCircle;
            case 'maintenance': return Settings;
            default: return AlertCircle;
        }
    };

    const categorizedActions = quickActions.reduce((acc, action) => {
        if (!acc[action.category]) {
            acc[action.category] = [];
        }
        acc[action.category].push(action);
        return acc;
    }, {} as Record<string, QuickAction[]>);

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Command Centre</h1>
                        <p className="text-muted-foreground">
                            Centralized control hub for all system operations and management
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="autoRefresh"
                                checked={autoRefresh}
                                onCheckedChange={setAutoRefresh}
                            />
                            <span className="text-sm">Auto Refresh</span>
                        </div>
                        <Badge variant="secondary">New Feature</Badge>
                    </div>
                </div>

                {/* System Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <Activity className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {systemStatus.filter(s => s.status === 'online').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Services Online</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {systemStatus.filter(s => s.status === 'warning').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Warnings</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {(systemStatus.reduce((acc, s) => acc + parseFloat(s.uptime), 0) / systemStatus.length).toFixed(1)}%
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Uptime</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <Monitor className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {(systemStatus.reduce((acc, s) => acc + s.load, 0) / systemStatus.length).toFixed(0)}%
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Load</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">System Overview</TabsTrigger>
                        <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
                        <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
                        <TabsTrigger value="database">Database Control</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* System Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Service Status
                                </CardTitle>
                                <CardDescription>
                                    Real-time status of all core services and components
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {systemStatus.map((service) => {
                                        const StatusIcon = getStatusIcon(service.status);
                                        return (
                                            <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <StatusIcon className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                                                    <div>
                                                        <p className="font-medium">{service.service}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Uptime: {service.uptime}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{service.load}%</p>
                                                    <Progress value={service.load} className="w-16 h-2" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Alerts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    System Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            API Gateway experiencing high load (78%). Consider scaling resources.
                                        </AlertDescription>
                                    </Alert>
                                    <Alert>
                                        <Clock className="h-4 w-4" />
                                        <AlertDescription>
                                            Scheduled maintenance for Database service tonight at 2:00 AM.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="quick-actions" className="space-y-4">
                        {/* Quick Actions by Category */}
                        {Object.entries(categorizedActions).map(([category, actions]) => (
                            <Card key={category}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{category}</CardTitle>
                                    <CardDescription>
                                        Common actions for {category.toLowerCase()} operations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {actions.map((action) => {
                                            const ActionIcon = action.icon;
                                            return (
                                                <Button
                                                    key={action.id}
                                                    variant="outline"
                                                    className="h-24 flex flex-col items-center justify-center gap-2 p-4"
                                                    onClick={action.action}
                                                    disabled={action.disabled}
                                                >
                                                    <ActionIcon className="h-6 w-6" />
                                                    <div className="text-center">
                                                        <p className="font-medium text-sm">{action.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="monitoring" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5" />
                                    Live System Monitoring
                                </CardTitle>
                                <CardDescription>
                                    Real-time performance metrics and system health
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Live Monitoring Dashboard</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Advanced monitoring interface will be available here.
                                    </p>
                                    <Button>Open Monitoring Dashboard</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="database" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        Database Operations
                                    </CardTitle>
                                    <CardDescription>
                                        Manage database operations and maintenance tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        <Button variant="outline" className="justify-start">
                                            <Database className="h-4 w-4 mr-2" />
                                            Backup Database
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Restore from Backup
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Database Analytics
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Configuration
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Database Health</CardTitle>
                                    <CardDescription>Current database performance metrics</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Storage Used</span>
                                            <span>65%</span>
                                        </div>
                                        <Progress value={65} className="h-2" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Query Performance</span>
                                            <span>92%</span>
                                        </div>
                                        <Progress value={92} className="h-2" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Connection Pool</span>
                                            <span>34%</span>
                                        </div>
                                        <Progress value={34} className="h-2" />
                                    </div>

                                    <div className="pt-2 text-sm text-muted-foreground">
                                        Last backup: 2 hours ago
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Control Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Command className="h-5 w-5" />
                            System Control Panel
                        </CardTitle>
                        <CardDescription>
                            Critical system operations and emergency controls
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Button className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Refresh All Services
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Power className="h-4 w-4" />
                                System Restart
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Advanced Settings
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                System Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ManagementLayout>
    );
}