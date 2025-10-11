// Strategic Engine Health Check API Routes
// System health monitoring and orchestrator status

import { NextRequest, NextResponse } from 'next/server';
import { strategicEngineOrchestrator } from '@/features/strategic-engines/orchestrator';

// GET /api/strategic-engines/health - System health check
export async function GET() {
    try {
        const health = await strategicEngineOrchestrator.healthCheck();

        // Determine HTTP status based on health
        let httpStatus = 200;
        if (health.status === 'degraded') {
            httpStatus = 206; // Partial Content
        } else if (health.status === 'unhealthy') {
            httpStatus = 503; // Service Unavailable
        }

        return NextResponse.json({
            success: health.status !== 'unhealthy',
            data: health,
            timestamp: new Date().toISOString()
        }, { status: httpStatus });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Health check failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        );
    }
}