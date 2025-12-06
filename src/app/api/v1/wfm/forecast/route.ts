/**
 * WFM Forecast API
 * Call volume forecasting and staffing requirements
 */

import { NextRequest, NextResponse } from 'next/server';

interface ForecastInterval {
    time: string;
    predicted: number;
    actual?: number;
    scheduled: number;
    required: number;
    variance?: number;
}

// GET - Get forecast for a specific date
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
        const clientId = searchParams.get('clientId');

        // Generate forecast intervals (30-min increments)
        const intervals: ForecastInterval[] = generateForecastIntervals(date);

        // Calculate stats
        const totalPredicted = intervals.reduce((sum, i) => sum + i.predicted, 0);
        const totalActual = intervals.reduce((sum, i) => sum + (i.actual || 0), 0);
        const avgRequired = Math.round(intervals.reduce((sum, i) => sum + i.required, 0) / intervals.length);
        const avgScheduled = Math.round(intervals.reduce((sum, i) => sum + i.scheduled, 0) / intervals.length);

        return NextResponse.json({
            success: true,
            data: {
                date,
                clientId,
                intervals,
                summary: {
                    totalPredictedCalls: totalPredicted,
                    totalActualCalls: totalActual,
                    avgRequiredAgents: avgRequired,
                    avgScheduledAgents: avgScheduled,
                    staffingGap: avgRequired - avgScheduled,
                    forecastAccuracy: totalActual > 0
                        ? Math.round((1 - Math.abs(totalPredicted - totalActual) / totalActual) * 100)
                        : null
                }
            }
        });
    } catch (error) {
        console.error('WFM forecast error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate forecast' },
            { status: 500 }
        );
    }
}

// POST - Generate new forecast
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { startDate, endDate, clientId, historicalWeeks = 4 } = body;

        if (!startDate || !endDate) {
            return NextResponse.json(
                { success: false, error: 'startDate and endDate are required' },
                { status: 400 }
            );
        }

        // In production, this would use ML models based on historical data
        // For now, generate realistic-looking forecast
        const forecasts: { date: string; intervals: ForecastInterval[] }[] = [];

        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            forecasts.push({
                date: d.toISOString().split('T')[0],
                intervals: generateForecastIntervals(d.toISOString().split('T')[0])
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                clientId,
                historicalWeeks,
                forecasts,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('WFM forecast generation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate forecast' },
            { status: 500 }
        );
    }
}

function generateForecastIntervals(date: string): ForecastInterval[] {
    const intervals: ForecastInterval[] = [];
    const isToday = date === new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    // Business hours: 8 AM to 6 PM
    for (let hour = 8; hour < 18; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

            // Simulate call volume pattern (peaks at 10-11 AM and 2-3 PM)
            let baseVolume = 50;
            if (hour >= 10 && hour <= 11) baseVolume = 85;
            else if (hour >= 14 && hour <= 15) baseVolume = 80;
            else if (hour === 12) baseVolume = 55; // Lunch dip

            const predicted = baseVolume + Math.floor(Math.random() * 20) - 10;
            const required = Math.ceil(predicted / 7); // ~7 calls per agent per hour
            const scheduled = required + Math.floor(Math.random() * 3) - 1; // Slight variance

            const interval: ForecastInterval = {
                time,
                predicted,
                scheduled: Math.max(1, scheduled),
                required
            };

            // Add actual data for past intervals today
            if (isToday && (hour < currentHour || (hour === currentHour && min < 30))) {
                interval.actual = predicted + Math.floor(Math.random() * 10) - 5;
                interval.variance = interval.actual - predicted;
            }

            intervals.push(interval);
        }
    }

    return intervals;
}
