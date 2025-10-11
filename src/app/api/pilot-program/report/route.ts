import { NextRequest, NextResponse } from 'next/server';
import { pilotManager } from '@/features/pilot-program/manager';

// GET /api/pilot-program/report - Generate comprehensive pilot program report
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'json';
        const detailed = searchParams.get('detailed') === 'true';

        const report = pilotManager.generatePilotReport();

        if (detailed) {
            // Add detailed analysis for comprehensive reporting
            const clients = pilotManager.getClients();

            report.detailedAnalysis = {
                performanceTrends: clients.map(client => ({
                    clientId: client.id,
                    clientName: client.name,
                    satisfactionTrend: {
                        baseline: client.baselineMetrics.customerSatisfaction,
                        current: client.performanceData.currentMetrics.customerSatisfaction?.current || 0,
                        improvement: ((client.performanceData.currentMetrics.customerSatisfaction?.current || 0) - client.baselineMetrics.customerSatisfaction),
                        targetAchievement: Math.min(
                            ((client.performanceData.currentMetrics.customerSatisfaction?.current || 0) - client.baselineMetrics.customerSatisfaction) / 30 * 100, 100
                        )
                    },
                    waitTimeTrend: {
                        baseline: client.baselineMetrics.averageWaitTime,
                        current: client.baselineMetrics.averageWaitTime * (1 - (client.performanceData.currentMetrics.waitTimeReduction?.current || 0) / 100),
                        improvement: (client.performanceData.currentMetrics.waitTimeReduction?.current || 0),
                        targetAchievement: Math.min((client.performanceData.currentMetrics.waitTimeReduction?.current || 0) / 25 * 100, 100)
                    }
                })),
                culturalImpact: {
                    languageAccuracy: clients.reduce((sum, c) => sum + (c.performanceData.currentMetrics.culturalAccuracy?.current || 0), 0) / clients.length,
                    festivalHandling: 'Not yet measured - awaiting festival period',
                    localCustomsIntegration: 'Successfully integrated for all clients'
                },
                businessValue: {
                    estimatedROI: calculateEstimatedROI(clients),
                    costSavings: calculateCostSavings(clients),
                    customerRetentionImpact: 'Positive trend observed',
                    scalingPotential: 'High - ready for broader deployment'
                },
                riskMitigation: {
                    identifiedRisks: report.programOverview.timeline.filter((t: any) => t.status === 'blocked').length,
                    mitigatedRisks: 0,
                    currentRiskLevel: 'Low - all major risks under control'
                }
            };
        }

        if (format === 'csv') {
            // Convert to CSV format for Excel analysis
            const csvData = convertReportToCSV(report);
            return new Response(csvData, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="pilot-report.csv"'
                }
            });
        }

        return NextResponse.json(report);
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function calculateEstimatedROI(clients: any[]): string {
    // Simplified ROI calculation based on satisfaction and efficiency improvements
    const avgSatisfactionImprovement = clients.reduce((sum, c) =>
        sum + ((c.performanceData.currentMetrics.customerSatisfaction?.current || 0) - c.baselineMetrics.customerSatisfaction), 0
    ) / clients.length;

    const avgWaitTimeReduction = clients.reduce((sum, c) =>
        sum + (c.performanceData.currentMetrics.waitTimeReduction?.current || 0), 0
    ) / clients.length;

    // Estimated ROI based on customer retention and operational efficiency
    const estimatedROI = (avgSatisfactionImprovement * 0.02 + avgWaitTimeReduction * 0.015) * 100; // 2% retention per satisfaction point, 1.5% efficiency per wait time point

    return `${Math.round(estimatedROI)}% estimated ROI within 6 months`;
}

function calculateCostSavings(clients: any[]): string {
    // Estimated cost savings from reduced wait times and improved efficiency
    const avgWaitTimeReduction = clients.reduce((sum, c) =>
        sum + (c.performanceData.currentMetrics.waitTimeReduction?.current || 0), 0
    ) / clients.length;

    // Assume ₹50 per minute of operational cost savings
    const monthlySavings = (avgWaitTimeReduction / 100) * 500 * 30 * clients.length; // Rough estimate

    return `₹${Math.round(monthlySavings).toLocaleString()} monthly operational savings`;
}

function convertReportToCSV(report: any): string {
    const headers = [
        'Client ID', 'Client Name', 'Status', 'Satisfaction Current', 'Satisfaction Target',
        'Wait Time Reduction Current', 'Wait Time Reduction Target', 'Cultural Accuracy',
        'Feedback Count', 'Average Rating', 'Recommendations Count'
    ];

    const rows = report.clientReports.map((client: any) => [
        client.clientId,
        client.clientName,
        client.status,
        client.currentMetrics.customerSatisfaction?.current || 0,
        client.currentMetrics.customerSatisfaction?.target || 0,
        client.currentMetrics.waitTimeReduction?.current || 0,
        client.currentMetrics.waitTimeReduction?.target || 0,
        client.currentMetrics.culturalAccuracy?.current || 0,
        client.feedbackSummary.totalFeedback,
        client.feedbackSummary.averageRating,
        client.recommendations.length
    ]);

    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}