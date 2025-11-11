'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { FileText, Zap, Brain } from 'lucide-react';

export default function RiskCenterPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Brain className="h-6 w-6 text-yellow-500" />
                    Risk Center
                </h1>
                <p className="text-slate-400">AI-driven response playbooks and automated remediation</p>
            </div>

            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">AI Response Playbooks</CardTitle>
                    <CardDescription className="text-slate-400">
                        Automated incident response workflows and human-in-the-loop decision support
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-slate-400">
                        <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">AI-driven response system</p>
                        <p className="text-sm">Automated playbooks and incident response workflows will be implemented here</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}