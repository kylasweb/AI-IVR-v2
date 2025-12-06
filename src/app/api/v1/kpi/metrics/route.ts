/**
 * KPI Metrics API
 * Enterprise performance metrics and analytics
 */

import { NextRequest, NextResponse } from 'next/server';

interface KPIMetric {
    name: string;
    value: number | string;
    unit?: string;
    change: number;
    changeType: 'positive' | 'negative' | 'neutral';
    target?: number;
    trend: number[];
}

// GET - Get KPI metrics
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const timeRange = searchParams.get('timeRange') || 'today'; // today, week, month
        const clientId = searchParams.get('clientId');
        const category = searchParams.get('category'); // efficiency, quality, service, financial

        // Generate metrics based on time range
        const multiplier = timeRange === 'month' ? 30 : timeRange === 'week' ? 7 : 1;

        const allMetrics = {
            efficiency: generateEfficiencyMetrics(multiplier),
            quality: generateQualityMetrics(multiplier),
            service: generateServiceMetrics(multiplier),
            financial: generateFinancialMetrics(multiplier)
        };

        // Return requested category or all
        const metrics = category
            ? { [category]: allMetrics[category as keyof typeof allMetrics] }
            : allMetrics;

        // Summary stats
        const summary = {
            totalCalls: Math.floor(2847 * multiplier),
            resolvedCalls: Math.floor(2052 * multiplier),
            escalatedCalls: Math.floor(342 * multiplier),
            abandonedCalls: Math.floor(128 * multiplier),
            activeAgents: 24,
            revenue: 35600 * multiplier
        };

        return NextResponse.json({
            success: true,
            data: {
                timeRange,
                clientId,
                metrics,
                summary,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('KPI metrics error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch KPI metrics' },
            { status: 500 }
        );
    }
}

// POST - Record custom metric
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, value, category, clientId, timestamp } = body;

        if (!name || value === undefined || !category) {
            return NextResponse.json(
                { success: false, error: 'name, value, and category are required' },
                { status: 400 }
            );
        }

        // In production, store to time-series database
        const metric = {
            id: `metric_${Date.now()}`,
            name,
            value,
            category,
            clientId,
            timestamp: timestamp || new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: metric
        });
    } catch (error) {
        console.error('KPI metric record error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to record metric' },
            { status: 500 }
        );
    }
}

function generateEfficiencyMetrics(multiplier: number): KPIMetric[] {
    return [
        {
            name: 'Average Handle Time',
            value: '4:32',
            change: -8,
            changeType: 'positive',
            target: 300,
            trend: [280, 290, 285, 275, 272]
        },
        {
            name: 'After Call Work',
            value: '0:45',
            change: -12,
            changeType: 'positive',
            target: 60,
            trend: [55, 52, 48, 46, 45]
        },
        {
            name: 'Occupancy Rate',
            value: 78,
            unit: '%',
            change: 5,
            changeType: 'positive',
            target: 80,
            trend: [72, 74, 76, 77, 78]
        },
        {
            name: 'Utilization',
            value: 85,
            unit: '%',
            change: 3,
            changeType: 'positive',
            target: 85,
            trend: [80, 82, 83, 84, 85]
        }
    ];
}

function generateQualityMetrics(multiplier: number): KPIMetric[] {
    return [
        {
            name: 'First Call Resolution',
            value: 72,
            unit: '%',
            change: 4,
            changeType: 'positive',
            target: 75,
            trend: [68, 69, 70, 71, 72]
        },
        {
            name: 'CSAT Score',
            value: 4.2,
            change: 0.3,
            changeType: 'positive',
            target: 4.5,
            trend: [3.9, 4.0, 4.1, 4.1, 4.2]
        },
        {
            name: 'NPS',
            value: 45,
            change: 8,
            changeType: 'positive',
            target: 50,
            trend: [35, 38, 40, 43, 45]
        },
        {
            name: 'QA Score',
            value: 88,
            unit: '%',
            change: 2,
            changeType: 'positive',
            target: 90,
            trend: [84, 85, 86, 87, 88]
        }
    ];
}

function generateServiceMetrics(multiplier: number): KPIMetric[] {
    return [
        {
            name: 'Service Level',
            value: 82,
            unit: '%',
            change: -2,
            changeType: 'negative',
            target: 85,
            trend: [84, 83, 84, 83, 82]
        },
        {
            name: 'Abandon Rate',
            value: 4.5,
            unit: '%',
            change: 0.5,
            changeType: 'negative',
            target: 3,
            trend: [3.8, 4.0, 4.2, 4.3, 4.5]
        },
        {
            name: 'Average Speed of Answer',
            value: 28,
            unit: 's',
            change: 3,
            changeType: 'negative',
            target: 25,
            trend: [25, 26, 27, 27, 28]
        },
        {
            name: 'Queue Wait Time',
            value: 35,
            unit: 's',
            change: 5,
            changeType: 'negative',
            target: 30,
            trend: [30, 32, 33, 34, 35]
        }
    ];
}

function generateFinancialMetrics(multiplier: number): KPIMetric[] {
    return [
        {
            name: 'Cost per Call',
            value: 4.25,
            unit: '$',
            change: -0.15,
            changeType: 'positive',
            target: 4.00,
            trend: [4.50, 4.40, 4.35, 4.30, 4.25]
        },
        {
            name: 'Revenue per Call',
            value: 12.50,
            unit: '$',
            change: 0.75,
            changeType: 'positive',
            target: 15.00,
            trend: [11.00, 11.50, 12.00, 12.25, 12.50]
        },
        {
            name: 'Collection Rate',
            value: 68,
            unit: '%',
            change: 3,
            changeType: 'positive',
            target: 70,
            trend: [62, 64, 65, 67, 68]
        },
        {
            name: 'Promise to Pay Count',
            value: Math.floor(245 * multiplier),
            change: 15,
            changeType: 'positive',
            trend: [210, 220, 230, 240, 245].map(v => Math.floor(v * multiplier))
        }
    ];
}
