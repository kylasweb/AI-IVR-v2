// Strategic Engine API Routes
// Project Saksham - Phase 1 Implementation

import { NextRequest, NextResponse } from 'next/server';
import { strategicEngineOrchestrator } from '@/features/strategic-engines/orchestrator';
import {
    StrategicEngineConfig,
    EngineExecution,
    CulturalContext,
    EngineType,
    EngineStatus
} from '@/features/strategic-engines/types';

// GET /api/strategic-engines - List all registered engines
export async function GET() {
    try {
        const engines = await strategicEngineOrchestrator.listEngines();

        return NextResponse.json({
            success: true,
            data: engines,
            count: engines.length
        });
    } catch (error) {
        console.error('Failed to list strategic engines:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to retrieve engines',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// POST /api/strategic-engines - Register a new engine
export async function POST(request: NextRequest) {
    try {
        const engineConfig: StrategicEngineConfig = await request.json();

        // Validate engine configuration
        if (!engineConfig.id || !engineConfig.name || !engineConfig.type) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid engine configuration',
                    details: 'Missing required fields: id, name, or type'
                },
                { status: 400 }
            );
        }

        await strategicEngineOrchestrator.registerEngine(engineConfig);

        return NextResponse.json({
            success: true,
            message: `Engine ${engineConfig.id} registered successfully`,
            engineId: engineConfig.id
        });
    } catch (error) {
        console.error('Failed to register strategic engine:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to register engine',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}