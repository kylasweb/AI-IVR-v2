'use client';

import { useState } from 'react';
import { useDefcon } from '../../../lib/hooks/use-defcon';
import { useRealTimeAlerts } from '../../../lib/hooks/use-socket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { DefconLevel } from '../../../types/security';
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
    const { currentLevel, getStatusDescription, getStatusColor, requestEscalation } = useDefcon();
    const { alerts, acknowledgeAlert } = useRealTimeAlerts();
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

    const handleEscalateDefcon = async (level: number) => {
        try {
            await requestEscalation(level as DefconLevel, `Manual escalation from War Room - Threat level increased`);
        } catch (error) {
            console.error('Failed to escalate DEFCON:', error);
        }
    }; const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    const highAlerts = alerts.filter(alert => alert.severity === 'high');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="h-6 w-6 text-red-500" />
                        War Room
                    </h1>
                    <p className="text-slate-400">Global threat monitoring and command center</p>
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
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        DEFCON Status Control
                    </CardTitle>
                    <CardDescription className="text-slate-400">
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
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Global Threat Map
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Real-time visualization of security threats worldwide
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 bg-slate-900 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600">
                        <div className="text-center text-slate-400">
                            <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Interactive World Map</p>
                            <p className="text-sm">Real-time threat visualization will be implemented here</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-600 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{criticalAlerts.length}</p>
                                <p className="text-sm text-slate-400">Critical Alerts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-600 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{highAlerts.length}</p>
                                <p className="text-sm text-slate-400">High Priority</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{alerts.length}</p>
                                <p className="text-sm text-slate-400">Total Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-600 rounded-lg">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">98.5%</p>
                                <p className="text-sm text-slate-400">System Health</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Recent Security Alerts</CardTitle>
                    <CardDescription className="text-slate-400">
                        Latest security events requiring attention
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {alerts.slice(0, 5).map((alert) => (
                            <Alert key={alert.id} className="bg-slate-700 border-slate-600">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-slate-300">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium">{alert.title}</span>
                                            <span className="text-slate-400 ml-2">• {alert.sourceService}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`border-0 ${alert.severity === 'critical' ? 'bg-red-600 text-white' :
                                                    alert.severity === 'high' ? 'bg-orange-600 text-white' :
                                                        'bg-yellow-600 text-black'
                                                    }`}
                                            >
                                                {alert.severity}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => acknowledgeAlert(alert.id)}
                                                className="border-slate-600 text-slate-300 hover:bg-slate-600"
                                            >
                                                Acknowledge
                                            </Button>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                        {alerts.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
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