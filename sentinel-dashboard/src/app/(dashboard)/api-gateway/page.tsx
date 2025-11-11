'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Network, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ApiGatewayPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Network className="h-6 w-6 text-blue-500" />
                    API Gateway Monitor
                </h1>
                <p className="text-slate-400">Real-time API traffic monitoring and security analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-600 rounded-lg">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">1,247</p>
                                <p className="text-sm text-slate-400">Requests/min</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">99.8%</p>
                                <p className="text-sm text-slate-400">Uptime</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-600 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">3</p>
                                <p className="text-sm text-slate-400">Rate Limited</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-600 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">0</p>
                                <p className="text-sm text-slate-400">Blocked</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">API Gateway Status</CardTitle>
                    <CardDescription className="text-slate-400">
                        Service endpoints and their current status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-slate-400">
                        <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">API Gateway monitoring interface</p>
                        <p className="text-sm">Real-time metrics and endpoint monitoring will be implemented here</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}