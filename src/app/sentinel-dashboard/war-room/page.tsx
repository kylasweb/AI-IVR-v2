'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Globe,
    AlertTriangle,
    Shield,
    Zap,
    Activity,
    Users,
    Server,
    TrendingUp
} from 'lucide-react';

export default function WarRoomPage() {
    const [currentLevel] = useState(5); // Default to DEFCON 5
    const [alerts] = useState([]); // Mock alerts for now

    const getStatusDescription = () => {
        switch (currentLevel) {
            case 1: return 'Maximum readiness - Critical national security threat';
            case 2: return 'Next step to nuclear war - Imminent critical threat';
            case 3: return 'Increase in force readiness - Elevated threat level';
            case 4: return 'Increased intelligence watch - Moderate threat level';
            case 5: return 'Normal peacetime readiness - Standard operations';
            default: return 'Unknown DEFCON status';
        }
    };

    const getStatusColor = () => {
        switch (currentLevel) {
            case 1: return 'bg-red-600 text-white';
            case 2: return 'bg-red-500 text-white';
            case 3: return 'bg-orange-500 text-white';
            case 4: return 'bg-yellow-500 text-black';
            case 5: return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const handleEscalateDefcon = async (level: number) => {
        // TODO: Implement DEFCON escalation logic
        console.log('Escalating to DEFCON', level);
    };

    const criticalAlerts = alerts.filter((alert: any) => alert.severity === 'critical');
    const highAlerts = alerts.filter((alert: any) => alert.severity === 'high');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Globe className="h-6 w-6 text-red-500" />
                        War Room
                    </h1>
                    <p className="text-muted-foreground">Global threat monitoring and command center</p>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className={`${getStatusColor()} border-0 text-lg px-4 py-2`}>
                        <Zap className="h-4 w-4 mr-2" />
                        DEFCON {currentLevel}
                    </Badge>
                    <Badge variant="outline" className="border-red-800 text-red-400">
                        {getStatusDescription()}
                    </Badge>
                </div>
            </div>

            {/* DEFCON Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        DEFCON Status Control
                    </CardTitle>
                    <CardDescription>
                        Manual override controls for threat level escalation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <Button
                                key={level}
                                variant={currentLevel === level ? "default" : "outline"}
                                className={`flex-1 ${level === 1 ? 'bg-red-600 hover:bg-red-700' :
                                        level === 2 ? 'bg-red-500 hover:bg-red-600' :
                                            level === 3 ? 'bg-orange-500 hover:bg-orange-600' :
                                                level === 4 ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                                                    'bg-green-500 hover:bg-green-600'
                                    }`}
                                onClick={() => handleEscalateDefcon(level)}
                                disabled={currentLevel === level}
                            >
                                DEFCON {level}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Global Threat Map Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Global Threat Map
                    </CardTitle>
                    <CardDescription>
                        Real-time visualization of security threats worldwide
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                        <div className="text-center text-muted-foreground">
                            <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Interactive World Map</p>
                            <p className="text-sm">Real-time threat visualization will be implemented here</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-600 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{criticalAlerts.length}</p>
                                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-600 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{highAlerts.length}</p>
                                <p className="text-sm text-muted-foreground">High Priority</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{alerts.length}</p>
                                <p className="text-sm text-muted-foreground">Total Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-600 rounded-lg">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">98.5%</p>
                                <p className="text-sm text-muted-foreground">System Health</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Security Alerts</CardTitle>
                    <CardDescription>
                        Latest security events requiring attention
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {alerts.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No active alerts</p>
                                <p className="text-sm">All systems operating normally</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}