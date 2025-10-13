import { NextRequest, NextResponse } from 'next/server';
import { operatorHandoffService } from '@/services/operator-handoff-service';

// Handle handoff requests
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            action,
            sessionId,
            callRecordId,
            handoffType,
            priority,
            reason,
            customerIssue,
            culturalContext,
            languageRequirement,
            operatorId,
            handoffId,
            accepted,
            notes
        } = body;

        switch (action) {
            case 'request_handoff':
                const handoffRequest = {
                    callRecordId,
                    sessionId,
                    handoffType,
                    priority: priority || 'normal',
                    reason,
                    customerIssue,
                    culturalContext,
                    languageRequirement
                };

                const result = await operatorHandoffService.requestHandoff(handoffRequest);

                return NextResponse.json({
                    success: result.success,
                    handoffId: result.handoffId,
                    assignedOperatorId: result.assignedOperatorId,
                    estimatedWaitTime: result.estimatedWaitTime,
                    reason: result.reason,
                    alternativeOptions: result.alternativeOptions
                });

            case 'operator_response':
                if (!handoffId || !operatorId || accepted === undefined) {
                    return NextResponse.json(
                        { error: 'Missing required fields for operator response' },
                        { status: 400 }
                    );
                }

                await operatorHandoffService.handleOperatorResponse(handoffId, accepted, operatorId, notes);

                return NextResponse.json({
                    success: true,
                    message: accepted ? 'Handoff accepted' : 'Handoff rejected'
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Operator handoff API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get handoff metrics and operator analytics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const operatorId = searchParams.get('operatorId');
        const type = searchParams.get('type') || 'metrics';

        switch (type) {
            case 'metrics':
                const metrics = operatorHandoffService.getHandoffMetrics();
                return NextResponse.json({
                    success: true,
                    metrics
                });

            case 'operator_analytics':
                const analytics = await operatorHandoffService.getOperatorAnalytics(operatorId || undefined);
                return NextResponse.json({
                    success: true,
                    analytics
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid type parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Operator handoff metrics API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}