import { NextRequest, NextResponse } from 'next/server';
import { culturalEffectivenessService } from '@/services/cultural-effectiveness-service';

// Handle cultural effectiveness analysis and feedback
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'analyze_effectiveness':
                const { sessionId, transcript, userProfile, responseData } = body;

                if (!sessionId || !transcript) {
                    return NextResponse.json(
                        { error: 'Missing required fields: sessionId, transcript' },
                        { status: 400 }
                    );
                }

                const analysis = await culturalEffectivenessService.analyzeCulturalEffectiveness(
                    sessionId,
                    transcript,
                    userProfile || {},
                    responseData || {}
                );

                return NextResponse.json({
                    success: true,
                    analysis
                });

            case 'submit_feedback':
                const {
                    userId,
                    sessionId: feedbackSessionId,
                    feedbackType,
                    rating,
                    comment,
                    culturalContext
                } = body;

                if (!userId || !feedbackSessionId || !feedbackType || rating === undefined) {
                    return NextResponse.json(
                        { error: 'Missing required feedback fields' },
                        { status: 400 }
                    );
                }

                await culturalEffectivenessService.processCommunityFeedback({
                    userId,
                    sessionId: feedbackSessionId,
                    feedbackType,
                    rating,
                    comment: comment || '',
                    culturalContext: culturalContext || {}
                });

                return NextResponse.json({
                    success: true,
                    message: 'Community feedback processed successfully'
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Cultural effectiveness API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get cultural metrics and analytics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'metrics';
        const timeframe = searchParams.get('timeframe') || '24h';
        const dialect = searchParams.get('dialect');

        switch (type) {
            case 'metrics':
                const metrics = culturalEffectivenessService.getRealTimeCulturalMetrics();
                return NextResponse.json({
                    success: true,
                    metrics
                });

            case 'performance_report':
                const report = await culturalEffectivenessService.generatePerformanceReport(timeframe);
                return NextResponse.json({
                    success: true,
                    report
                });

            case 'dialect_analytics':
                const dialectAnalytics = await culturalEffectivenessService.getDialectAnalytics(dialect || undefined);
                return NextResponse.json({
                    success: true,
                    analytics: dialectAnalytics
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid type parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Cultural effectiveness metrics API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}