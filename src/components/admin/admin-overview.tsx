'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Users,
    Globe,
    Activity,
    FileText,
    Database,
    Shield,
    BarChart3,
    CheckCircle,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';

export default function AdminOverview() {
    const stats = {
        totalUsers: 1247,
        activeSessions: 34,
        callsToday: 892,
        systemHealth: 'healthy' as const,
        activeIntegrations: 6,
        errorRate: 0.2,
        avgResponseTime: 245,
        uptime: 99.9
    };

    const quickActions = [
        {
            title: 'User Management',
            description: 'Manage users and permissions',
            url: '/admin/users',
            icon: Users,
            color: 'bg-blue-500'
        },
        {
            title: 'System Settings',
            description: 'Configure system parameters',
            url: '/admin/settings',
            icon: Settings,
            color: 'bg-green-500'
        },
        {
            title: 'Integrations',
            description: 'External services and APIs',
            url: '/admin/integrations',
            icon: Globe,
            color: 'bg-purple-500'
        },
        {
            title: 'System Monitoring',
            description: 'Real-time system health',
            url: '/admin/monitoring',
            icon: Activity,
            color: 'bg-orange-500'
        },
        {
            title: 'Log Management',
            description: 'System logs and debugging',
            url: '/admin/logs',
            icon: FileText,
            color: 'bg-red-500'
        },
        {
            title: 'Mock Data Manager',
            description: 'Manage demo data and scenarios',
            url: '/admin/mock-data',
            icon: Database,
            color: 'bg-indigo-500'
        }
    ];

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'healthy': return CheckCircle;
            case 'warning': return AlertTriangle;
            case 'critical': return AlertTriangle;
            default: return Activity;
        }
    };

    return (
        <div className="space-y-6">
            {/* System Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            <TrendingUp className="inline h-3 w-3 mr-1" />
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            Real-time active users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.callsToday}</div>
                        <p className="text-xs text-muted-foreground">
                            <TrendingUp className="inline h-3 w-3 mr-1" />
                            +8% from yesterday
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        {React.createElement(getHealthIcon(stats.systemHealth), {
                            className: `h-4 w-4 ${getHealthColor(stats.systemHealth).split(' ')[0]}`
                        })}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{stats.systemHealth}</div>
                        <Badge className={`mt-1 ${getHealthColor(stats.systemHealth)}`}>
                            {stats.uptime}% uptime
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Administration Quick Actions</CardTitle>
                    <CardDescription>
                        Access key administrative functions and system management tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <a
                                    key={action.url}
                                    href={action.url}
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
                                >
                                    <div className={`p-2 rounded-lg ${action.color} mr-4`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {action.description}
                                        </p>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Active Integrations</span>
                            <Badge variant="secondary">{stats.activeIntegrations}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Error Rate</span>
                            <span className="text-sm text-gray-600">{stats.errorRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Avg Response Time</span>
                            <span className="text-sm text-gray-600">{stats.avgResponseTime}ms</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Shield className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium">Security Systems</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                            All security protocols are functioning normally
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}