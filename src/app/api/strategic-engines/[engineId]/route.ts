// Strategic Engine Execution API Routes
// Individual engine execution and management

import { NextRequest, NextResponse } from 'next/server';
import { strategicEngineOrchestrator } from '@/features/strategic-engines/orchestrator';
import { CulturalContext } from '@/features/strategic-engines/types';

// GET /api/strategic-engines/[engineId] - Get engine status and metrics
export async function GET(
    request: NextRequest,
    { params }: { params: { engineId: string } }
) {
    try {
        const { engineId } = params;

        const [status, metrics] = await Promise.all([
            strategicEngineOrchestrator.getEngineStatus(engineId),
            strategicEngineOrchestrator.getEngineMetrics(engineId)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                engineId,
                status,
                metrics,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error(`Failed to get engine ${params.engineId} status:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to retrieve engine status',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 404 }
        );
    }
}

// POST /api/strategic-engines/[engineId]/execute - Execute engine
export async function POST(
    request: NextRequest,
    { params }: { params: { engineId: string } }
) {
    try {
        const { engineId } = params;
        const requestBody = await request.json();

        // Extract execution parameters
        const { inputData, culturalContext } = requestBody;

        // Validate input
        if (!inputData) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing input data',
                    details: 'inputData is required for engine execution'
                },
                { status: 400 }
            );
        }

        // Default cultural context if not provided
        const defaultCulturalContext: CulturalContext = {
            language: 'ml',
            region: 'kerala-central',
            culturalPreferences: {},
            festivalAwareness: true,
            localCustoms: {}
        };

        const context: CulturalContext = culturalContext || defaultCulturalContext;

        // Execute engine
        const execution = await strategicEngineOrchestrator.executeEngine(
            engineId,
            inputData,
            context
        );

        return NextResponse.json({
            success: true,
            data: execution,
            executionId: execution.sessionId
        });
    } catch (error) {
        console.error(`Failed to execute engine ${params.engineId}:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Engine execution failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// DELETE /api/strategic-engines/[engineId] - Unregister engine
export async function DELETE(
    request: NextRequest,
    { params }: { params: { engineId: string } }
) {
    try {
        const { engineId } = params;

        await strategicEngineOrchestrator.unregisterEngine(engineId);

        return NextResponse.json({
            success: true,
            message: `Engine ${engineId} unregistered successfully`
        });
    } catch (error) {
        console.error(`Failed to unregister engine ${params.engineId}:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to unregister engine',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}