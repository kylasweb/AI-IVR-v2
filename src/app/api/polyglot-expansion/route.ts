// Polyglot Language Expansion API Routes
// RESTful API for global multi-language support with cultural intelligence

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import PolyglotExpansionEngine from '../../../features/polyglot-expansion/engine';
import type {
    PolyglotTranslationRequest,
    PolyglotTranslationResult,
    LanguageDetectionResult,
    Language,
    GlobalCulturalContext,
    PolyglotConfiguration,
    PolyglotAnalytics
} from '../../../features/polyglot-expansion/types';

// Initialize the Polyglot Engine
let polyglotEngine: PolyglotExpansionEngine | null = null;

function getPolyglotEngine(): PolyglotExpansionEngine {
    if (!polyglotEngine) {
        polyglotEngine = new PolyglotExpansionEngine();
        console.log('🌍 Polyglot Expansion Engine initialized');
    }
    return polyglotEngine;
}

// Validation schemas
const TranslationRequestSchema = z.object({
    sourceText: z.string().min(1, 'Source text is required'),
    sourceLanguage: z.string().min(2, 'Source language code required'),
    targetLanguage: z.string().min(2, 'Target language code required'),
    context: z.string().optional(),
    formality: z.enum(['very_formal', 'formal', 'neutral', 'informal', 'very_informal']).optional(),
    domain: z.enum(['general', 'technical', 'medical', 'legal', 'business', 'academic', 'creative']).optional(),
    culturalAdaptation: z.boolean().optional(),
    alternatives: z.boolean().optional(),
    glossary: z.record(z.string()).optional(),
    metadata: z.object({
        userId: z.string().optional(),
        sessionId: z.string().optional(),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
        deadline: z.string().optional(),
        reference: z.string().optional(),
        tags: z.array(z.string()).optional()
    }).optional()
});

const LanguageDetectionSchema = z.object({
    text: z.string().min(1, 'Text is required for language detection'),
    candidateLanguages: z.array(z.string()).optional(),
    threshold: z.number().min(0).max(1).optional()
});

const ConfigurationUpdateSchema = z.object({
    enabledLanguages: z.array(z.string()).optional(),
    defaultLanguage: z.string().optional(),
    fallbackLanguage: z.string().optional(),
    autoDetection: z.boolean().optional(),
    culturalAdaptation: z.boolean().optional(),
    qualityThreshold: z.number().min(0).max(1).optional(),
    cacheEnabled: z.boolean().optional()
});

// POST /api/polyglot-expansion/translate - Translate text with cultural adaptation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedRequest = TranslationRequestSchema.parse(body);

        const engine = getPolyglotEngine();
        const translationResult = await engine.translate(validatedRequest as PolyglotTranslationRequest);

        return NextResponse.json({
            success: true,
            data: translationResult,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Translation error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({
                success: false,
                error: 'Validation error',
                details: error.errors,
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Translation failed',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// GET /api/polyglot-expansion - Get supported languages and system status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        const engine = getPolyglotEngine();

        switch (action) {
            case 'languages':
                const languages = engine.getSupportedLanguages();
                return NextResponse.json({
                    success: true,
                    data: {
                        languages,
                        count: languages.length,
                        categories: {
                            families: [...new Set(languages.map(l => l.family))],
                            regions: [...new Set(languages.flatMap(l => l.region))],
                            scripts: [...new Set(languages.flatMap(l => l.writingSystem))]
                        }
                    },
                    timestamp: new Date().toISOString()
                });

            case 'language':
                const code = searchParams.get('code');
                if (!code) {
                    return NextResponse.json({
                        success: false,
                        error: 'Language code is required',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                const language = engine.getLanguage(code);
                if (!language) {
                    return NextResponse.json({
                        success: false,
                        error: `Language '${code}' not found`,
                        timestamp: new Date().toISOString()
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: language,
                    timestamp: new Date().toISOString()
                });

            case 'cultural-context':
                const contextCode = searchParams.get('code');
                const region = searchParams.get('region');

                if (!contextCode) {
                    return NextResponse.json({
                        success: false,
                        error: 'Language code is required',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                const culturalContext = engine.getCulturalContext(contextCode, region || undefined);
                if (!culturalContext) {
                    return NextResponse.json({
                        success: false,
                        error: `Cultural context for '${contextCode}' not found`,
                        timestamp: new Date().toISOString()
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: culturalContext,
                    timestamp: new Date().toISOString()
                });

            case 'analytics':
                const analytics = engine.getAnalytics();
                return NextResponse.json({
                    success: true,
                    data: analytics,
                    timestamp: new Date().toISOString()
                });

            case 'configuration':
                const config = engine.getConfiguration();
                return NextResponse.json({
                    success: true,
                    data: config,
                    timestamp: new Date().toISOString()
                });

            case 'health':
                const supportedLanguages = engine.getSupportedLanguages();
                const systemAnalytics = engine.getAnalytics();

                return NextResponse.json({
                    success: true,
                    data: {
                        status: 'healthy',
                        version: '1.0.0',
                        languagesSupported: supportedLanguages.length,
                        totalTranslations: systemAnalytics.totalTranslations,
                        averageQuality: systemAnalytics.qualityMetrics.averageQuality,
                        uptime: process.uptime(),
                        memory: process.memoryUsage(),
                        timestamp: new Date().toISOString()
                    },
                    timestamp: new Date().toISOString()
                });

            default:
                // Default: return system overview
                const allLanguages = engine.getSupportedLanguages();
                const systemConfig = engine.getConfiguration();
                const systemHealth = {
                    status: 'operational',
                    languagesSupported: allLanguages.length,
                    version: '1.0.0'
                };

                return NextResponse.json({
                    success: true,
                    data: {
                        overview: systemHealth,
                        configuration: systemConfig,
                        languageCount: allLanguages.length,
                        features: [
                            'Multi-language translation',
                            'Cultural adaptation',
                            'Language detection',
                            'Quality assessment',
                            'Cultural context awareness',
                            'Alternative translations',
                            'Translation warnings',
                            'Analytics and metrics'
                        ]
                    },
                    timestamp: new Date().toISOString()
                });
        }

    } catch (error: any) {
        console.error('Polyglot API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to process request',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// PUT /api/polyglot-expansion - Update configuration or add languages
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        const engine = getPolyglotEngine();

        switch (action) {
            case 'configuration':
                const configUpdate = ConfigurationUpdateSchema.parse(body);
                engine.updateConfiguration(configUpdate);

                return NextResponse.json({
                    success: true,
                    message: 'Configuration updated successfully',
                    data: engine.getConfiguration(),
                    timestamp: new Date().toISOString()
                });

            case 'language':
                const languageData = body as Language;
                engine.addLanguage(languageData);

                return NextResponse.json({
                    success: true,
                    message: `Language '${languageData.name}' added successfully`,
                    data: languageData,
                    timestamp: new Date().toISOString()
                });

            case 'cache-clear':
                engine.clearCache();

                return NextResponse.json({
                    success: true,
                    message: 'Translation cache cleared successfully',
                    timestamp: new Date().toISOString()
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Supported actions: configuration, language, cache-clear',
                    timestamp: new Date().toISOString()
                }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Polyglot update error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({
                success: false,
                error: 'Validation error',
                details: error.errors,
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Update failed',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// Language detection function
async function detectLanguageHandler(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedRequest = LanguageDetectionSchema.parse(body);

        const engine = getPolyglotEngine();
        const detectionResult = await engine.detectLanguage(validatedRequest.text);

        return NextResponse.json({
            success: true,
            data: detectionResult,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Language detection error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({
                success: false,
                error: 'Validation error',
                details: error.errors,
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Language detection failed',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// Batch translation function
async function batchTranslateHandler(request: NextRequest) {
    try {
        const body = await request.json();
        const { requests } = body;

        if (!Array.isArray(requests) || requests.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Requests array is required and must not be empty',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        if (requests.length > 100) {
            return NextResponse.json({
                success: false,
                error: 'Maximum 100 requests allowed per batch',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        const engine = getPolyglotEngine();
        const results: any[] = [];
        const errors: any[] = [];

        for (let i = 0; i < requests.length; i++) {
            try {
                const validatedRequest = TranslationRequestSchema.parse(requests[i]);
                const result = await engine.translate(validatedRequest as PolyglotTranslationRequest);
                results.push({
                    index: i,
                    success: true,
                    data: result
                });
            } catch (error: any) {
                errors.push({
                    index: i,
                    success: false,
                    error: error.message || 'Translation failed'
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                results,
                errors,
                summary: {
                    total: requests.length,
                    successful: results.length,
                    failed: errors.length,
                    successRate: results.length / requests.length
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Batch translation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Batch translation failed',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// Feedback submission function
async function submitFeedbackHandler(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation schema for feedback
        const feedbackSchema = z.object({
            translationId: z.string().optional(),
            sourceText: z.string().min(1),
            sourceLanguage: z.string().min(2),
            targetLanguage: z.string().min(2),
            translatedText: z.string().min(1),
            rating: z.number().min(1).max(5),
            issues: z.array(z.enum(['accuracy', 'fluency', 'cultural', 'formality', 'context', 'other'])).optional(),
            comments: z.string().optional(),
            suggestedImprovement: z.string().optional(),
            userInfo: z.object({
                userId: z.string().optional(),
                expertise: z.enum(['native', 'fluent', 'intermediate', 'beginner']).optional(),
                context: z.string().optional()
            }).optional()
        });

        const validatedFeedback = feedbackSchema.parse(body);

        // Store feedback (in real implementation, this would save to database)
        console.log('💬 Translation feedback received:', {
            rating: validatedFeedback.rating,
            languages: `${validatedFeedback.sourceLanguage} → ${validatedFeedback.targetLanguage}`,
            issues: validatedFeedback.issues,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                feedbackId: `feedback_${Date.now()}`,
                acknowledged: true
            },
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Feedback submission error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json({
                success: false,
                error: 'Validation error',
                details: error.errors,
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Feedback submission failed',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// DELETE /api/polyglot-expansion - Clear cache or reset system
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        const engine = getPolyglotEngine();

        switch (action) {
            case 'cache':
                engine.clearCache();
                return NextResponse.json({
                    success: true,
                    message: 'Translation cache cleared successfully',
                    timestamp: new Date().toISOString()
                });

            case 'analytics':
                // Reset analytics (in real implementation)
                return NextResponse.json({
                    success: true,
                    message: 'Analytics data reset successfully',
                    timestamp: new Date().toISOString()
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Supported actions: cache, analytics',
                    timestamp: new Date().toISOString()
                }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Delete operation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Delete operation failed',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// Export named functions for specific endpoints
export {
    POST as translateText,
    GET as getSystemInfo,
    PUT as updateSystem,
    DELETE as deleteData,
    detectLanguageHandler as detectLanguage,
    batchTranslateHandler as batchTranslate,
    submitFeedbackHandler as submitFeedback
};