import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AMDDetectionService, DEFAULT_AMD_CONFIG } from '@/services/amd-detection-service';

// AMD Analysis API - Phase 3 Implementation
// Real-time answering machine detection with Malayalam cultural intelligence

const AMDAnalysisRequestSchema = z.object({
    audioData: z.string(), // Base64 encoded audio
    phoneNumber: z.string().optional(),
    campaignId: z.string().optional(),
    culturalContext: z.object({
        primaryLanguage: z.enum(['malayalam', 'english', 'mixed']).optional(),
        expectedDialect: z.enum(['northern', 'central', 'southern']).optional(),
        businessContext: z.boolean().optional(),
    }).optional(),
    detectionConfig: z.object({
        sensitivityLevel: z.number().min(0.1).max(1.0).optional(),
        maxDetectionTime: z.number().optional(),
        culturalAdaptation: z.boolean().optional(),
    }).optional(),
});

// Initialize AMD service (in production, this would be a singleton)
const amdService = new AMDDetectionService(DEFAULT_AMD_CONFIG);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = AMDAnalysisRequestSchema.parse(body);

        // Convert base64 audio to ArrayBuffer
        const audioBuffer = Buffer.from(validatedData.audioData, 'base64').buffer;

        // Update configuration if provided
        if (validatedData.detectionConfig) {
            amdService.updateConfiguration({
                detection: {
                    ...DEFAULT_AMD_CONFIG.detection,
                    sensitivityLevel: validatedData.detectionConfig.sensitivityLevel ?? DEFAULT_AMD_CONFIG.detection.sensitivityLevel,
                    culturalAdaptation: validatedData.detectionConfig.culturalAdaptation ?? DEFAULT_AMD_CONFIG.detection.culturalAdaptation,
                },
                performance: {
                    ...DEFAULT_AMD_CONFIG.performance,
                    maxDetectionTime: validatedData.detectionConfig.maxDetectionTime ?? DEFAULT_AMD_CONFIG.performance.maxDetectionTime,
                },
            });
        }

        // Perform AMD analysis
        const detectionResult = await amdService.analyzeAudio(audioBuffer, validatedData.phoneNumber);

        // Log for analytics
        console.log(`AMD Analysis: Phone ${validatedData.phoneNumber}, Result: ${detectionResult.isAnsweringMachine ? 'Machine' : 'Human'}, Confidence: ${detectionResult.confidence}`);

        return NextResponse.json({
            success: true,
            data: {
                analysis: detectionResult,
                timestamp: new Date().toISOString(),
                processingTime: detectionResult.detectionTime,
                culturalIntelligence: {
                    malayalamDetected: detectionResult.culturalContext.malayalamGreeting,
                    dialectRegion: detectionResult.culturalContext.regionalDialect,
                    formalityLevel: detectionResult.culturalContext.formalityLevel,
                },
                recommendations: {
                    action: detectionResult.recommendedAction,
                    culturalConsiderations: detectionResult.culturalContext.malayalamGreeting
                        ? ['Use Malayalam greeting', 'Respect cultural context', 'Consider regional dialect']
                        : ['Standard approach applicable'],
                },
            },
        }, { status: 200 });

    } catch (error) {
        console.error('AMD analysis error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid request format',
                details: (error as any).errors,
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'AMD analysis failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'performance':
                // Get AMD service performance metrics
                const metrics = amdService.getPerformanceMetrics();
                return NextResponse.json({
                    success: true,
                    data: {
                        metrics,
                        uptime: Date.now(), // Placeholder
                        version: '1.0.0',
                        culturalPatternsLoaded: true,
                        mlModelStatus: 'active',
                    },
                });

            case 'config':
                // Get current AMD configuration
                return NextResponse.json({
                    success: true,
                    data: {
                        config: DEFAULT_AMD_CONFIG,
                        culturalPatterns: {
                            malayalamGreetings: DEFAULT_AMD_CONFIG.culturalIntelligence.malayalamGreetingDatabase.length,
                            dialectsSupported: ['northern', 'central', 'southern'],
                            businessHours: DEFAULT_AMD_CONFIG.culturalIntelligence.businessHoursAdaptation,
                        },
                    },
                });

            default:
                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'AMD Analysis API - Phase 3',
                        version: '1.0.0',
                        endpoints: {
                            analyze: 'POST /api/cloud-communication/amd/analyze',
                            performance: 'GET /api/cloud-communication/amd/analyze?action=performance',
                            config: 'GET /api/cloud-communication/amd/analyze?action=config',
                        },
                        features: [
                            'ML-based answering machine detection',
                            'Malayalam cultural pattern recognition',
                            'Regional dialect analysis',
                            'Real-time audio processing',
                            'Business context awareness',
                            'Cultural intelligence integration',
                        ],
                    },
                });
        }

    } catch (error) {
        console.error('AMD API error:', error);
        return NextResponse.json({
            success: false,
            error: 'API request failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

// Health check endpoint
export async function HEAD() {
    return NextResponse.json(null, {
        status: 200,
        headers: {
            'X-AMD-Status': 'active',
            'X-Cultural-Intelligence': 'malayalam-enabled',
            'X-ML-Model': 'loaded',
        },
    });
}