'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Activity, Server, Network } from 'lucide-react';

export default function InternalMonitorPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="h-6 w-6 text-purple-500" />
                    Internal Monitor
                </h1>
                <p className="text-slate-400">Service communication and dependency monitoring</p>
            </div>

            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Service Communication Grid</CardTitle>
                    <CardDescription className="text-slate-400">
                        Real-time visualization of internal service interactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-slate-400">
                        <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Service dependency graph</p>
                        <p className="text-sm">Interactive service communication monitoring will be implemented here</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}