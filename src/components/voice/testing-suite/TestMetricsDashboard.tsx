'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Target, Gauge, CheckCircle } from 'lucide-react';
import { SuiteMetrics } from '@/hooks/useTestSuite';

interface TestMetricsDashboardProps {
    metrics: SuiteMetrics;
}

/**
 * Dashboard component displaying test suite metrics.
 * Shows active suites, success rate, accuracy, and total tests.
 */
export function TestMetricsDashboard({ metrics }: TestMetricsDashboardProps) {
    const statCards = [
        {
            label: 'Active Suites',
            value: `${metrics.runningSuites}/${metrics.totalSuites}`,
            icon: Activity,
            color: 'text-blue-600'
        },
        {
            label: 'Success Rate',
            value: `${metrics.successRate}%`,
            icon: Target,
            color: 'text-green-600'
        },
        {
            label: 'Avg Accuracy',
            value: `${metrics.avgAccuracy}%`,
            icon: Gauge,
            color: 'text-purple-600'
        },
        {
            label: 'Total Tests',
            value: `${metrics.totalTests}`,
            icon: CheckCircle,
            color: 'text-orange-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statCards.map((stat) => (
                <Card key={stat.label}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default TestMetricsDashboard;
