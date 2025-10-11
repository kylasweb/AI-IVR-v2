// Strategic Engine Orchestration API
// Central endpoint for executing multiple engines in coordination
// Project Saksham Production API Layer

import { NextRequest, NextResponse } from 'next/server';
import { StrategicEngineOrchestratorImpl } from '@/features/strategic-engines/orchestrator';
import { EngineFactory } from '@/features/strategic-engines/factory';
import { EngineType, CulturalContext } from '@/features/strategic-engines/types';

interface OrchestrationRequest {
    engines: EngineType[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    culturalContext: CulturalContext;
    inputData: Record<string, any>;
    executionMode: 'sequential' | 'parallel' | 'adaptive';
    timeout?: number;
}

interface OrchestrationResponse {
    executionId: string;
    status: 'success' | 'partial' | 'failed';
    results: Partial<Record<EngineType, any>>;
    performance: {
        totalExecutionTime: number;
        enginePerformance: Partial<Record<EngineType, {
            executionTime: number;
            success: boolean;
            culturalAlignment: number;
        }>>;
    };
    culturalMetrics: {
        overallAlignment: number;
        malayalamProcessing: boolean;
        culturalRecommendations: string[];
    };
    timestamp: string;
    errors?: Record<string, string>;
}

// POST /api/strategic-engines/orchestrate
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body: OrchestrationRequest = await request.json();

        // Validate required fields
        if (!body.engines || !Array.isArray(body.engines) || body.engines.length === 0) {
            return NextResponse.json(
                {
                    executionId: '',
                    status: 'failed',
                    results: {},
                    performance: { totalExecutionTime: 0, enginePerformance: {} },
                    culturalMetrics: { overallAlignment: 0, malayalamProcessing: false, culturalRecommendations: [] },
                    timestamp: new Date().toISOString(),
                    errors: { validation: 'Invalid engines array provided' }
                },
                { status: 400 }
            );
        }

        const startTime = Date.now();
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Initialize orchestrator
        const factory = EngineFactory.getInstance();
        const orchestrator = new StrategicEngineOrchestratorImpl();

        // Execute engines based on mode
        const results: Partial<Record<EngineType, any>> = {};
        const enginePerformance: Partial<Record<EngineType, {
            executionTime: number;
            success: boolean;
            culturalAlignment: number;
        }>> = {};
        const errors: Partial<Record<EngineType, string>> = {};

        if (body.executionMode === 'parallel') {
            // Execute all engines in parallel
            const enginePromises = body.engines.map(async (engineType) => {
                const engineStartTime = Date.now();
                try {
                    const engine = factory.createEngine(engineType, orchestrator);
                    const result = await engine.execute(body.inputData, body.culturalContext);

                    const executionTime = Date.now() - engineStartTime;
                    results[engineType] = result.data;
                    enginePerformance[engineType] = {
                        executionTime,
                        success: result.status === 'success',
                        culturalAlignment: result.culturalAlignment || 0.8
                    };

                    return { engineType, success: true, result };
                } catch (error) {
                    const executionTime = Date.now() - engineStartTime;
                    errors[engineType] = error instanceof Error ? error.message : 'Unknown error';
                    enginePerformance[engineType] = {
                        executionTime,
                        success: false,
                        culturalAlignment: 0
                    };
                    return { engineType, success: false, error };
                }
            });

            await Promise.all(enginePromises);
        } else {
            // Sequential execution
            for (const engineType of body.engines) {
                const engineStartTime = Date.now();
                try {
                    const engine = factory.createEngine(engineType, orchestrator);
                    const result = await engine.execute(body.inputData, body.culturalContext);

                    const executionTime = Date.now() - engineStartTime;
                    results[engineType] = result.data;
                    enginePerformance[engineType] = {
                        executionTime,
                        success: result.status === 'success',
                        culturalAlignment: result.culturalAlignment || 0.8
                    };
                } catch (error) {
                    const executionTime = Date.now() - engineStartTime;
                    errors[engineType] = error instanceof Error ? error.message : 'Unknown error';
                    enginePerformance[engineType] = {
                        executionTime,
                        success: false,
                        culturalAlignment: 0
                    };
                }
            }
        }

        const totalExecutionTime = Date.now() - startTime;

        // Calculate overall cultural metrics
        const culturalAlignments = Object.values(enginePerformance)
            .filter(perf => perf.success)
            .map(perf => perf.culturalAlignment);

        const overallAlignment = culturalAlignments.length > 0
            ? culturalAlignments.reduce((sum, align) => sum + align, 0) / culturalAlignments.length
            : 0;

        const malayalamProcessing = body.culturalContext.language === 'ml' ||
            body.culturalContext.language === 'manglish';

        // Determine overall status
        const successfulEngines = Object.values(enginePerformance).filter(perf => perf.success).length;
        const totalEngines = body.engines.length;

        let status: 'success' | 'partial' | 'failed';
        if (successfulEngines === totalEngines) {
            status = 'success';
        } else if (successfulEngines > 0) {
            status = 'partial';
        } else {
            status = 'failed';
        }

        const response: OrchestrationResponse = {
            executionId,
            status,
            results,
            performance: {
                totalExecutionTime,
                enginePerformance
            },
            culturalMetrics: {
                overallAlignment,
                malayalamProcessing,
                culturalRecommendations: generateCulturalRecommendations(overallAlignment, malayalamProcessing)
            },
            timestamp: new Date().toISOString(),
            ...(Object.keys(errors).length > 0 && { errors })
        };

        return NextResponse.json(response, {
            status: status === 'success' ? 200 : status === 'partial' ? 206 : 500
        });

    } catch (error) {
        console.error('Strategic Engine Orchestration Error:', error);

        return NextResponse.json(
            {
                executionId: '',
                status: 'failed',
                results: {},
                performance: { totalExecutionTime: 0, enginePerformance: {} },
                culturalMetrics: { overallAlignment: 0, malayalamProcessing: false, culturalRecommendations: [] },
                timestamp: new Date().toISOString(),
                errors: { system: error instanceof Error ? error.message : 'System error occurred' }
            },
            { status: 500 }
        );
    }
}

function generateCulturalRecommendations(alignment: number, malayalamProcessing: boolean): string[] {
    const recommendations: string[] = [];

    if (alignment < 0.7) {
        recommendations.push('Consider enhancing cultural context parameters for better alignment');
    }

    if (!malayalamProcessing) {
        recommendations.push('Enable Malayalam processing for improved cultural integration');
    }

    if (alignment >= 0.9) {
        recommendations.push('Excellent cultural alignment achieved');
    }

    return recommendations;
}

// GET /api/strategic-engines/orchestrate - Get orchestration status
export async function GET(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
        return NextResponse.json(
            { error: 'executionId parameter is required' },
            { status: 400 }
        );
    }

    // In a real implementation, this would query a database or cache
    // For now, return a placeholder response
    return NextResponse.json({
        executionId,
        status: 'completed',
        message: 'Execution status lookup not yet implemented - requires database integration'
    });
}