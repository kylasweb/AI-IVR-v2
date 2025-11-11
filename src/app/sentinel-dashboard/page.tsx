'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Globe,
    Network,
    Activity,
    Users,
    Brain,
    Zap,
    AlertTriangle
} from 'lucide-react';

const modules = [
    {
        id: 'war-room',
        title: 'War Room',
        description: 'Global threat monitoring and DEFCON command center',
        icon: Globe,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950',
        status: 'Active'
    },
    {
        id: 'api-gateway',
        title: 'API Gateway Monitor',
        description: 'Real-time API traffic monitoring and security analysis',
        icon: Network,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        status: 'Active'
    },
    {
        id: 'internal-monitor',
        title: 'Internal Monitor',
        description: 'Service communication and dependency monitoring',
        icon: Activity,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
        status: 'Active'
    },
    {
        id: 'iam-command',
        title: 'IAM Command Center',
        description: 'Privileged access monitoring and identity management',
        icon: Users,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950',
        status: 'Active'
    },
    {
        id: 'risk-center',
        title: 'Risk Center',
        description: 'AI-driven response playbooks and automated remediation',
        icon: Brain,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        status: 'Active'
    }
];

export default function SentinelDashboardPage() {
    const router = useRouter();

    // Redirect to war-room by default
    useEffect(() => {
        router.push('/sentinel-dashboard/war-room');
    }, [router]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-red-100 dark:bg-red-950 rounded-full">
                        <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Sentinel Command Dashboard</h1>
                <p className="text-muted-foreground text-lg mb-8">
                    IMOS Security Operations Center - Real-time threat monitoring and response
                </p>

                <div className="flex justify-center gap-4 mb-8">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2">
                        <Zap className="h-4 w-4 mr-2" />
                        DEFCON 5 - Normal Operations
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        All Systems Operational
                    </Badge>
                </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <Card
                        key={module.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => router.push(`/sentinel-dashboard/${module.id}`)}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-lg ${module.bgColor}`}>
                                    <module.icon className={`h-6 w-6 ${module.color}`} />
                                </div>
                                <Badge
                                    variant={module.status === 'Active' ? 'default' : 'secondary'}
                                    className="text-xs"
                                >
                                    {module.status}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" variant="outline">
                                Access Module
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* System Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        System Overview
                    </CardTitle>
                    <CardDescription>
                        Current security posture and system health metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                            <div className="text-sm text-muted-foreground">Active Threats</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
                            <div className="text-sm text-muted-foreground">Modules Online</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">98.5%</div>
                            <div className="text-sm text-muted-foreground">System Health</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                            <div className="text-sm text-muted-foreground">Monitoring</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}