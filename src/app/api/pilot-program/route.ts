import { NextRequest, NextResponse } from 'next/server';
import { pilotManager } from '@/features/pilot-program/manager';

// GET /api/pilot-program - Get pilot program overview and status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeClients = searchParams.get('includeClients') === 'true';
        const includeReport = searchParams.get('includeReport') === 'true';

        const program = pilotManager.getProgram();
        if (!program) {
            return NextResponse.json({ error: 'No active pilot program' }, { status: 404 });
        }

        let response: any = {
            program: {
                id: program.id,
                name: program.name,
                description: program.description,
                status: program.status,
                startDate: program.startDate,
                endDate: program.endDate,
                objectives: program.objectives,
                timeline: program.timeline,
                riskAssessment: {
                    overallRiskLevel: program.riskAssessment.overallRiskLevel,
                    identifiedRisks: program.riskAssessment.identifiedRisks.map(risk => ({
                        id: risk.id,
                        description: risk.description,
                        category: risk.category,
                        severity: risk.severity
                    }))
                },
                budget: {
                    total: program.budget.totalBudget,
                    remaining: program.budget.remaining,
                    currency: program.budget.currency
                }
            }
        };

        if (includeClients) {
            response.clients = pilotManager.getClients().map(client => ({
                id: client.id,
                name: client.name,
                type: client.type,
                status: client.status,
                onboardingDate: client.onboardingDate,
                currentMetrics: client.performanceData.currentMetrics
            }));
        }

        if (includeReport) {
            response.report = pilotManager.generatePilotReport();
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching pilot program:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/pilot-program - Initialize pilot program and select clients
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'select-clients':
                const selectedClients = await pilotManager.selectPilotClients();
                return NextResponse.json({
                    success: true,
                    message: 'Pilot clients selected successfully',
                    clients: selectedClients,
                    count: selectedClients.length
                });

            case 'start-metrics-collection':
                pilotManager.startMetricsCollection();
                return NextResponse.json({
                    success: true,
                    message: 'Metrics collection started'
                });

            case 'stop-metrics-collection':
                pilotManager.stopMetricsCollection();
                return NextResponse.json({
                    success: true,
                    message: 'Metrics collection stopped'
                });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in pilot program action:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}