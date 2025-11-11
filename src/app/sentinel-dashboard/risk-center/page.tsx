'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Shield } from 'lucide-react';

export default function RiskCenterPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                    Risk Center
                </h1>
                <p className="text-muted-foreground">Risk assessment and mitigation strategies</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Risk Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Medium</div>
                        <Badge variant="secondary" className="text-xs">Score: 6.2/10</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Mitigations Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground">Active risk controls</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Critical Vulnerabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <Badge variant="destructive" className="text-xs">Requires Attention</Badge>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Risk Assessment Dashboard</CardTitle>
                    <CardDescription>
                        Comprehensive risk analysis and mitigation planning
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Risk Analysis Interface</p>
                        <p className="text-sm">Risk assessment and mitigation tools will be implemented here</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}