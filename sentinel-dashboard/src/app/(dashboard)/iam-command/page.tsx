'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, Shield, FileText } from 'lucide-react';

export default function IamCommandPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-green-500" />
                    IAM Command Center
                </h1>
                <p className="text-slate-400">Privileged access monitoring and identity management</p>
            </div>

            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Privileged Access Logs</CardTitle>
                    <CardDescription className="text-slate-400">
                        Real-time monitoring of administrative actions and privilege escalation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-slate-400">
                        <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">IAM activity monitoring</p>
                        <p className="text-sm">Privileged access logs and user activity tracking will be implemented here</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}