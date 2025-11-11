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
    Server,
    Network,
    Database,
    Shield,
    Zap,
    Phone,
    PhoneCall,
    Settings,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Cpu,
    HardDrive,
    Wifi,
    Globe,
    TrendingUp,
    Users,
    Bot,
    GitBranch as Workflow,
    FileText,
    Download,
    Upload,
    RefreshCw,
    Monitor,
    Terminal,
    Layers,
    Target
} from 'lucide-react'; interface SystemMetrics {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkTraffic: number;
    activeConnections: number;
    errorRate: number;
    responseTime: number;
    uptime: number;
}

interface InfrastructureStatus {
    servers: Array<{
        name: string;
        status: string;
        cpu: number;
        memory: number;
        load: number;
    }>;
    databases: Array<{
        name: string;
        status: string;
        connections: number;
        latency: number;
    }>;
    gateways: Array<{
        name: string;
        status: string;
        calls: number;
        quality: number;
    }>;
}

const SysAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [metrics, setMetrics] = useState<SystemMetrics>({
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkTraffic: 0,
        activeConnections: 0,
        errorRate: 0,
        responseTime: 0,
        uptime: 0
    });

    const [infrastructure, setInfrastructure] = useState<InfrastructureStatus>({
        servers: [],
        databases: [],
        gateways: []
    });

    // Simulate real-time metrics updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
                memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
                diskUsage: Math.max(0, Math.min(100, prev.diskUsage + (Math.random() - 0.5) * 2)),
                networkTraffic: Math.max(0, prev.networkTraffic + Math.floor(Math.random() * 100)),
                activeConnections: Math.max(0, prev.activeConnections + Math.floor(Math.random() * 10) - 5),
                errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5)),
                responseTime: Math.max(50, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50)),
                uptime: prev.uptime + 1
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Fetch infrastructure status
    useEffect(() => {
        const fetchInfrastructure = async () => {
            try {
                const response = await fetch('/api/infrastructure/status');
                if (response.ok) {
                    const data = await response.json();
                    setInfrastructure(data);
                }
            } catch (error) {
                console.error('Failed to fetch infrastructure:', error);
            }
        };

        fetchInfrastructure();
        const interval = setInterval(fetchInfrastructure, 10000);
        return () => clearInterval(interval);
    }, []);

    const navigationTabs = [
        {
            id: 'overview',
            name: 'System Overview',
            icon: Monitor,
            description: 'Real-time system metrics and health'
        },
        {
            id: 'telephony',
            name: 'Telephony Gateway',
            icon: Phone,
            description: 'Voice infrastructure and call management'
        },
        {
            id: 'infrastructure',
            name: 'Infrastructure',
            icon: Server,
            description: 'Servers, databases, and network monitoring'
        },
        {
            id: 'security',
            name: 'Security',
            icon: Shield,
            description: 'Security monitoring and threat detection'
        },
        {
            id: 'logs',
            name: 'System Logs',
            icon: FileText,
            description: 'Application and system logging'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'operational':
            case 'online':
                return 'bg-green-100 text-green-800';
            case 'degraded':
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'critical':
            case 'error':
            case 'offline':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'operational':
            case 'online':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'degraded':
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'critical':
            case 'error':
            case 'offline':
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

                {/* System Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* System Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                                <Cpu className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{Math.round(metrics.cpuUsage)}%</div>
                                <Progress value={metrics.cpuUsage} className="mt-2" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{Math.round(metrics.memoryUsage)}%</div>
                                <Progress value={metrics.memoryUsage} className="mt-2" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                                <Network className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.activeConnections}</div>
                                <p className="text-xs text-muted-foreground">
                                    Real-time connections
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{Math.round(metrics.responseTime)}ms</div>
                                <p className="text-xs text-muted-foreground">
                                    Average response time
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Infrastructure Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Server className="h-5 w-5" />
                                <span>Infrastructure Status</span>
                            </CardTitle>
                            <CardDescription>
                                Real-time status of all system components
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Servers */}
                                <div>
                                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                                        <Server className="h-4 w-4" />
                                        <span>Servers</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {infrastructure.servers.slice(0, 3).map((server, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(server.status)}
                                                    <span className="text-sm">{server.name}</span>
                                                </div>
                                                <Badge className={getStatusColor(server.status)}>
                                                    {server.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Databases */}
                                <div>
                                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                                        <Database className="h-4 w-4" />
                                        <span>Databases</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {infrastructure.databases.slice(0, 3).map((db, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(db.status)}
                                                    <span className="text-sm">{db.name}</span>
                                                </div>
                                                <Badge className={getStatusColor(db.status)}>
                                                    {db.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Gateways */}
                                <div>
                                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                                        <Phone className="h-4 w-4" />
                                        <span>Telephony Gateways</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {infrastructure.gateways.slice(0, 3).map((gateway, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(gateway.status)}
                                                    <span className="text-sm">{gateway.name}</span>
                                                </div>
                                                <Badge className={getStatusColor(gateway.status)}>
                                                    {gateway.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Administration</CardTitle>
                            <CardDescription>
                                Critical system management tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Button className="w-full h-20 flex flex-col items-center space-y-2">
                                    <RefreshCw className="h-6 w-6" />
                                    <span>Restart Services</span>
                                </Button>
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                    <HardDrive className="h-6 w-6" />
                                    <span>Backup System</span>
                                </Button>
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                    <Shield className="h-6 w-6" />
                                    <span>Security Scan</span>
                                </Button>
                                <Button variant="outline" className="w-full h-20 flex flex-col items-center space-y-2">
                                    <Monitor className="h-6 w-6" />
                                    <span>System Logs</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Telephony Gateway Tab */}
                <TabsContent value="telephony" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gateway Status</CardTitle>
                                <CardDescription>Telephony infrastructure health</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Primary Gateway</span>
                                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Backup Gateway</span>
                                        <Badge className="bg-green-100 text-green-800">Standby</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Active Calls</span>
                                        <span className="font-medium">47</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Call Quality</span>
                                        <span className="font-medium text-green-600">98.5%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Call Statistics</CardTitle>
                                <CardDescription>Real-time call metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Total Calls Today</span>
                                        <span className="font-medium">1,247</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Avg Call Duration</span>
                                        <span className="font-medium">4:32</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Call Success Rate</span>
                                        <span className="font-medium text-green-600">96.8%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Failed Calls</span>
                                        <span className="font-medium text-red-600">42</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gateway Configuration</CardTitle>
                            <CardDescription>Telephony gateway settings and controls</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span>Auto Failover</span>
                                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Load Balancing</span>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Call Recording</span>
                                        <Badge className="bg-blue-100 text-blue-800">Optional</Badge>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span>DTMF Detection</span>
                                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Echo Cancellation</span>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Noise Reduction</span>
                                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Infrastructure Tab */}
                <TabsContent value="infrastructure" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Server Resources</CardTitle>
                                <CardDescription>Real-time server monitoring</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>CPU Usage</span>
                                            <span>{Math.round(metrics.cpuUsage)}%</span>
                                        </div>
                                        <Progress value={metrics.cpuUsage} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Memory Usage</span>
                                            <span>{Math.round(metrics.memoryUsage)}%</span>
                                        </div>
                                        <Progress value={metrics.memoryUsage} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Disk Usage</span>
                                            <span>{Math.round(metrics.diskUsage)}%</span>
                                        </div>
                                        <Progress value={metrics.diskUsage} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Network Traffic</CardTitle>
                                <CardDescription>Bandwidth and connection monitoring</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Inbound Traffic</span>
                                        <span className="font-medium">{Math.round(metrics.networkTraffic * 0.6)} Mbps</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Outbound Traffic</span>
                                        <span className="font-medium">{Math.round(metrics.networkTraffic * 0.4)} Mbps</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Active Connections</span>
                                        <span className="font-medium">{metrics.activeConnections}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Network Latency</span>
                                        <span className="font-medium">12ms</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Database Performance</CardTitle>
                            <CardDescription>Database health and performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">99.7%</div>
                                    <div className="text-sm text-muted-foreground">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">45ms</div>
                                    <div className="text-sm text-muted-foreground">Avg Query Time</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">1,247</div>
                                    <div className="text-sm text-muted-foreground">Active Connections</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Status</CardTitle>
                                <CardDescription>Current security posture</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Firewall Status</span>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>SSL Certificates</span>
                                        <Badge className="bg-green-100 text-green-800">Valid</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Failed Login Attempts</span>
                                        <span className="font-medium text-yellow-600">23 (last 24h)</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Security Patches</span>
                                        <Badge className="bg-green-100 text-green-800">Up to Date</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Threat Detection</CardTitle>
                                <CardDescription>Recent security events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium">No active threats detected</div>
                                            <div className="text-xs text-muted-foreground">Last scan: 5 minutes ago</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium">Suspicious login attempt</div>
                                            <div className="text-xs text-muted-foreground">IP: 192.168.1.100 - 2 hours ago</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Lock className="w-4 h-4 text-blue-500 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium">Security policy updated</div>
                                            <div className="text-xs text-muted-foreground">Password complexity increased</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* System Logs Tab */}
                <TabsContent value="logs" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent System Logs</CardTitle>
                            <CardDescription>Application and system event logs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                <div className="flex items-start space-x-3 p-3 border rounded">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Database backup completed</div>
                                        <div className="text-xs text-muted-foreground">2024-01-15 14:30:22 - Backup size: 2.4GB</div>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 p-3 border rounded">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">High memory usage detected</div>
                                        <div className="text-xs text-muted-foreground">2024-01-15 14:25:10 - Memory: 87% - Server: web-01</div>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 p-3 border rounded">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">SSL certificate renewed</div>
                                        <div className="text-xs text-muted-foreground">2024-01-15 14:20:05 - Expires: 2025-01-15</div>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 p-3 border rounded">
                                    <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Failed login attempt</div>
                                        <div className="text-xs text-muted-foreground">2024-01-15 14:15:33 - IP: 10.0.0.50 - User: admin</div>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 p-3 border rounded">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">System update applied</div>
                                        <div className="text-xs text-muted-foreground">2024-01-15 14:10:00 - Kernel version: 5.15.0-91</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex space-x-4">
                        <Button variant="outline" className="flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Export Logs</span>
                        </Button>
                        <Button variant="outline" className="flex items-center space-x-2">
                            <HardDrive className="h-4 w-4" />
                            <span>Archive Old Logs</span>
                        </Button>
                        <Button variant="outline" className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Generate Report</span>
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SysAdminDashboard;