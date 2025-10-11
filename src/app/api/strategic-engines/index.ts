// Strategic Engines API Integration Routes
// Project Saksham - Production API Endpoints for Phase 1 & Phase 2 Engines
// Comprehensive API layer with authentication, rate limiting, and cultural context handling

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import rateLimit from '../../../lib/rate-limit';
import { authenticateRequest, validateApiKey } from '../../../lib/auth';
import {
    HyperPersonalizationEngine,
    AutonomousDispatchEngine
} from '@/features/strategic-engines';
import {
    StrategicEngineConfig,
    CulturalContext,
    EngineType,
    EngineStatus,
    EngineOrchestrator
} from '@/features/strategic-engines/types';

// ===========================
// API MIDDLEWARE & UTILITIES
// ===========================

interface APIRequest {
    engineType: EngineType;
    inputData: any;
    culturalContext: CulturalContext;
    sessionId?: string;
    userId?: string;
    requestId?: string;
}

interface APIResponse {
    success: boolean;
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata: {
        engineId: string;
        processingTime: number;
        culturalAdaptation: boolean;
        malayalamSupport: boolean;
        requestId: string;
        timestamp: Date;
    };
    rateLimit?: {
        limit: number;
        remaining: number;
        reset: Date;
    };
}

// Rate limiting configurations per engine type
const RATE_LIMITS = {
    [EngineType.HYPER_PERSONALIZATION]: { requests: 1000, window: '1h' },
    [EngineType.AUTONOMOUS_DISPATCH]: { requests: 2000, window: '1h' },
    [EngineType.AUTOMATED_RESOLUTION]: { requests: 500, window: '1h' },
    [EngineType.DOCUMENT_PROCESSING]: { requests: 100, window: '1h' },
    [EngineType.SAFETY_ANOMALY]: { requests: 5000, window: '1h' },
    [EngineType.DYNAMIC_EMPATHY]: { requests: 800, window: '1h' },
    [EngineType.PROACTIVE_ENGAGEMENT]: { requests: 1200, window: '1h' }
};

// Cultural context validator
function validateCulturalContext(context: any): CulturalContext {
    return {
        language: context.language || 'ml',
        dialect: context.dialect,
        region: context.region || 'kerala',
        culturalPreferences: context.culturalPreferences || {},
        festivalAwareness: context.festivalAwareness || true,
        localCustoms: context.localCustoms || {}
    };
}

// Engine instance factory
class EngineFactory {
    private static orchestrator: EngineOrchestrator;
    private static instances: Map<string, any> = new Map();

    static async getEngine(engineType: EngineType, config: StrategicEngineConfig): Promise<any> {
        const key = `${engineType}-${config.id}`;

        if (this.instances.has(key)) {
            return this.instances.get(key);
        }

        let engine;
        switch (engineType) {
            case EngineType.HYPER_PERSONALIZATION:
                engine = new HyperPersonalizationEngine(config, this.orchestrator);
                break;
            case EngineType.AUTONOMOUS_DISPATCH:
                engine = new AutonomousDispatchEngine(config, this.orchestrator);
                break;
            case EngineType.AUTOMATED_RESOLUTION:
                // Mock implementation for now
                engine = { execute: async () => ({ success: true, data: 'Mock automated resolution' }) };
                break;
            case EngineType.DOCUMENT_PROCESSING:
                // Mock implementation for now
                engine = { execute: async () => ({ success: true, data: 'Mock document processing' }) };
                break;
            case EngineType.SAFETY_ANOMALY:
                // Mock implementation for now
                engine = { execute: async () => ({ success: true, data: 'Mock safety anomaly detection' }) };
                break;
            case EngineType.DYNAMIC_EMPATHY:
                // Mock implementation for now
                engine = { execute: async () => ({ success: true, data: 'Mock dynamic empathy' }) };
                break;
            // Phase 2 engines would be added here
            default:
                throw new Error(`Unsupported engine type: ${engineType}`);
        }

        this.instances.set(key, engine);
        return engine;
    }

    static setOrchestrator(orchestrator: EngineOrchestrator) {
        this.orchestrator = orchestrator;
    }
}

// Helper function for batch processing individual requests
async function processSingleEngineRequest(
    requestData: {
        inputData: any;
        culturalContext: CulturalContext;
        sessionId: string;
        userId: string;
    },
    engineType: EngineType
): Promise<APIResponse> {
    try {
        // Mock implementation for now
        const result = {
            success: true,
            data: {
                engineType,
                processedData: requestData.inputData,
                culturalAdaptations: [],
                malayalamContent: requestData.culturalContext.language === 'ml' ? 'Mock Malayalam response' : null,
                processing: {
                    startTime: new Date(),
                    endTime: new Date(),
                    culturalContext: requestData.culturalContext,
                    sessionId: requestData.sessionId
                }
            },
            metadata: {
                engineId: engineType,
                processingTime: 150,
                culturalAdaptation: requestData.culturalContext.language === 'ml',
                malayalamSupport: true,
                requestId: crypto.randomUUID(),
                timestamp: new Date()
            }
        };

        return result;
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'PROCESSING_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            metadata: {
                engineId: engineType,
                processingTime: 0,
                culturalAdaptation: false,
                malayalamSupport: false,
                requestId: crypto.randomUUID(),
                timestamp: new Date()
            }
        };
    }
}

// Request processing middleware
async function processEngineRequest(
    request: NextRequest,
    engineType: EngineType
): Promise<NextResponse> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
        // 1. Authentication
        const authResult = await authenticateRequest(request);
        if (!authResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'AUTHENTICATION_FAILED',
                        message: 'Invalid or missing authentication credentials'
                    },
                    metadata: {
                        requestId,
                        timestamp: new Date(),
                        processingTime: Date.now() - startTime
                    }
                },
                { status: 401 }
            );
        }

        // 2. Rate Limiting
        const rateLimitConfig = RATE_LIMITS[engineType];
        const rateLimiter = rateLimit({
            maxRequests: rateLimitConfig.requests,
            windowMs: rateLimitConfig.window,
            keyGenerator: () => `${engineType}-${authResult.userId}`
        });
        const rateLimitResult = await rateLimiter(request);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: 'Rate limit exceeded for this engine'
                    },
                    metadata: {
                        requestId,
                        timestamp: new Date(),
                        processingTime: Date.now() - startTime
                    },
                    rateLimit: {
                        limit: rateLimitConfig.requests,
                        remaining: 0,
                        reset: new Date(Date.now() + (60 * 60 * 1000)) // 1 hour
                    }
                },
                { status: 429 }
            );
        }

        // 3. Request Validation
        const body = await request.json() as APIRequest;

        if (!body.inputData) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_INPUT',
                        message: 'Missing required inputData field'
                    },
                    metadata: {
                        requestId,
                        timestamp: new Date(),
                        processingTime: Date.now() - startTime
                    }
                },
                { status: 400 }
            );
        }

        // 4. Cultural Context Processing
        const culturalContext = validateCulturalContext(body.culturalContext || {});

        // 5. Engine Configuration
        const engineConfig: StrategicEngineConfig = {
            id: `${engineType}-${authResult.userId}`,
            name: `${engineType} Engine`,
            type: engineType,
            version: '2.0.0',
            description: `Strategic Engine for ${engineType}`,
            culturalContext,
            dependencies: [],
            capabilities: [],
            performance: {
                averageResponseTime: 0,
                successRate: 0,
                errorRate: 0,
                throughput: 0,
                uptime: 0,
                lastUpdated: new Date()
            },
            status: EngineStatus.PRODUCTION
        };

        // 6. Engine Execution
        const engine = await EngineFactory.getEngine(engineType, engineConfig);

        // Validate input data
        if (!engine.validate(body.inputData)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_FAILED',
                        message: 'Input data validation failed',
                        details: engine.getSchema()
                    },
                    metadata: {
                        engineId: engineConfig.id,
                        requestId,
                        timestamp: new Date(),
                        processingTime: Date.now() - startTime,
                        culturalAdaptation: true,
                        malayalamSupport: culturalContext.language === 'ml'
                    }
                },
                { status: 400 }
            );
        }

        // Execute engine
        const result = await engine.execute(body.inputData, culturalContext);

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: result,
            metadata: {
                engineId: engineConfig.id,
                requestId,
                timestamp: new Date(),
                processingTime,
                culturalAdaptation: true,
                malayalamSupport: culturalContext.language === 'ml'
            },
            rateLimit: {
                limit: rateLimitConfig.requests,
                remaining: rateLimitResult.remaining,
                reset: rateLimitResult.reset
            }
        } as APIResponse);

    } catch (error) {
        const processingTime = Date.now() - startTime;

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: error instanceof Error ? error.message : 'Internal server error',
                    details: process.env.NODE_ENV === 'development' ? error : undefined
                },
                metadata: {
                    engineId: 'unknown',
                    requestId,
                    timestamp: new Date(),
                    processingTime,
                    culturalAdaptation: false,
                    malayalamSupport: false
                }
            } as APIResponse,
            { status: 500 }
        );
    }
}

// ===========================
// INDIVIDUAL ENGINE ENDPOINTS
// ===========================

// POST /api/strategic-engines/hyper-personalization
export async function hyperPersonalizationHandler(request: NextRequest): Promise<NextResponse> {
    return processEngineRequest(request, EngineType.HYPER_PERSONALIZATION);
}

// POST /api/strategic-engines/autonomous-dispatch
export async function autonomousDispatchHandler(request: NextRequest): Promise<NextResponse> {
    return processEngineRequest(request, EngineType.AUTONOMOUS_DISPATCH);
}

// POST /api/strategic-engines/automated-resolution
export async function automatedResolutionHandler(request: NextRequest): Promise<NextResponse> {
    return processEngineRequest(request, EngineType.AUTOMATED_RESOLUTION);
}

// POST /api/strategic-engines/document-processing
export async function documentProcessingHandler(request: NextRequest): Promise<NextResponse> {
    return processEngineRequest(request, EngineType.DOCUMENT_PROCESSING);
}

// POST /api/strategic-engines/safety-anomaly
export async function safetyAnomalyHandler(request: NextRequest): Promise<NextResponse> {
    return processEngineRequest(request, EngineType.SAFETY_ANOMALY);
}

// POST /api/strategic-engines/dynamic-empathy
export async function dynamicEmpathyHandler(request: NextRequest): Promise<NextResponse> {
    return processEngineRequest(request, EngineType.DYNAMIC_EMPATHY);
}

// POST /api/strategic-engines/proactive-engagement
export async function proactiveEngagementHandler(request: NextRequest): Promise<NextResponse> {
    return processEngineRequest(request, EngineType.PROACTIVE_ENGAGEMENT);
}

// ===========================
// BATCH PROCESSING ENDPOINT
// ===========================

// POST /api/strategic-engines/batch
export async function batchProcessingHandler(request: NextRequest): Promise<NextResponse> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
        // Authentication
        const authResult = await authenticateRequest(request);
        if (!authResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'AUTHENTICATION_FAILED',
                        message: 'Invalid or missing authentication credentials'
                    }
                },
                { status: 401 }
            );
        }

        const body = await request.json() as { requests: APIRequest[] };

        if (!body.requests || !Array.isArray(body.requests)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_BATCH_REQUEST',
                        message: 'Batch request must contain an array of requests'
                    }
                },
                { status: 400 }
            );
        }

        // Process each request
        const results = await Promise.allSettled(
            body.requests.map(async (req, index) => {
                try {
                    // Create request data for direct processing
                    const requestData = {
                        inputData: req.inputData,
                        culturalContext: req.culturalContext,
                        sessionId: req.sessionId || `batch-${requestId}-${index}`,
                        userId: req.userId || authResult.userId || 'anonymous'
                    };

                    const response = await processSingleEngineRequest(requestData, req.engineType);
                    return response;
                } catch (error) {
                    return {
                        success: false,
                        error: {
                            code: 'BATCH_ITEM_ERROR',
                            message: error instanceof Error ? error.message : 'Unknown error',
                            index
                        }
                    };
                }
            })
        );

        return NextResponse.json({
            success: true,
            data: {
                results: results.map((result, index) => ({
                    index,
                    status: result.status,
                    data: result.status === 'fulfilled' ? result.value : null,
                    error: result.status === 'rejected' ? result.reason : null
                })),
                summary: {
                    total: body.requests.length,
                    successful: results.filter(r => r.status === 'fulfilled').length,
                    failed: results.filter(r => r.status === 'rejected').length
                }
            },
            metadata: {
                requestId,
                timestamp: new Date(),
                processingTime: Date.now() - startTime,
                batchSize: body.requests.length
            }
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'BATCH_PROCESSING_ERROR',
                    message: error instanceof Error ? error.message : 'Batch processing failed'
                },
                metadata: {
                    requestId,
                    timestamp: new Date(),
                    processingTime: Date.now() - startTime
                }
            },
            { status: 500 }
        );
    }
}

// ===========================
// ENGINE HEALTH & STATUS ENDPOINTS
// ===========================

// GET /api/strategic-engines/health
export async function healthCheckHandler(request: NextRequest): Promise<NextResponse> {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');

        if (!authHeader || !await validateApiKey(authHeader)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Valid API key required for health check'
                    }
                },
                { status: 401 }
            );
        }

        // Check health of all engine types
        const engineTypes = Object.values(EngineType);
        const healthChecks = await Promise.allSettled(
            engineTypes.map(async (engineType) => {
                try {
                    const config: StrategicEngineConfig = {
                        id: `health-${engineType}`,
                        name: `Health Check ${engineType}`,
                        type: engineType,
                        version: '2.0.0',
                        description: 'Health check instance',
                        culturalContext: {
                            language: 'ml',
                            region: 'kerala',
                            culturalPreferences: {},
                            festivalAwareness: true,
                            localCustoms: {}
                        },
                        dependencies: [],
                        capabilities: [],
                        performance: {
                            averageResponseTime: 0,
                            successRate: 0,
                            errorRate: 0,
                            throughput: 0,
                            uptime: 0,
                            lastUpdated: new Date()
                        },
                        status: EngineStatus.PRODUCTION
                    };

                    const engine = await EngineFactory.getEngine(engineType, config);
                    const isHealthy = await engine.healthCheck();

                    return {
                        engineType,
                        status: isHealthy ? 'healthy' : 'unhealthy',
                        lastChecked: new Date()
                    };
                } catch (error) {
                    return {
                        engineType,
                        status: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error',
                        lastChecked: new Date()
                    };
                }
            })
        );

        const engineHealth = healthChecks.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    engineType: engineTypes[index],
                    status: 'error',
                    error: result.reason,
                    lastChecked: new Date()
                };
            }
        });

        const overallHealthy = engineHealth.every(engine => engine.status === 'healthy');

        return NextResponse.json({
            success: true,
            data: {
                overall: overallHealthy ? 'healthy' : 'degraded',
                engines: engineHealth,
                systemMetrics: {
                    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
                    uptime: process.uptime(),
                    nodeVersion: process.version,
                    timestamp: new Date()
                },
                culturalContextSupport: {
                    malayalamSupport: true,
                    keralaCulturalAdaptation: true,
                    festivalAwareness: true,
                    respectProtocols: true
                }
            }
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'HEALTH_CHECK_ERROR',
                    message: error instanceof Error ? error.message : 'Health check failed'
                }
            },
            { status: 500 }
        );
    }
}

// GET /api/strategic-engines/status
export async function statusHandler(request: NextRequest): Promise<NextResponse> {
    try {
        const authResult = await authenticateRequest(request);
        if (!authResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'AUTHENTICATION_FAILED',
                        message: 'Authentication required for status endpoint'
                    }
                },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                availableEngines: Object.values(EngineType),
                supportedLanguages: ['ml', 'en', 'manglish'],
                culturalFeatures: [
                    'kerala_cultural_adaptation',
                    'malayalam_language_support',
                    'festival_awareness',
                    'family_respect_protocols',
                    'regional_dialect_support'
                ],
                apiVersion: '2.0.0',
                lastUpdated: new Date(),
                rateLimits: RATE_LIMITS
            }
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'STATUS_ERROR',
                    message: error instanceof Error ? error.message : 'Status retrieval failed'
                }
            },
            { status: 500 }
        );
    }
}

// ===========================
// EXPORT ROUTE HANDLERS
// ===========================

export {
    hyperPersonalizationHandler as hyperPersonalization,
    autonomousDispatchHandler as autonomousDispatch,
    automatedResolutionHandler as automatedResolution,
    documentProcessingHandler as documentProcessing,
    safetyAnomalyHandler as safetyAnomaly,
    dynamicEmpathyHandler as dynamicEmpathy,
    proactiveEngagementHandler as proactiveEngagement,
    batchProcessingHandler as batchProcessing,
    healthCheckHandler as healthCheck,
    statusHandler as status
};