// Chain of Thought API Routes
// RESTful endpoints for CoT processing and management

import { NextRequest, NextResponse } from 'next/server';
import ChainOfThoughtProcessor from '@/features/chain-of-thought/processor';
import { CoTExecutionConfig, CulturalContext } from '@/features/chain-of-thought/types';
import { z } from 'zod';

// Input validation schemas
const CoTRequestSchema = z.object({
    problem: z.string().min(1, 'Problem statement is required'),
    malayalamProblem: z.string().optional(),
    config: z.object({
        maxSteps: z.number().min(1).max(20).default(10),
        requireValidation: z.boolean().default(true),
        culturalValidation: z.boolean().default(true),
        timeoutMs: z.number().min(1000).max(300000).default(60000),
        template: z.string().optional(),
        language: z.enum(['en', 'ml', 'mixed']).default('mixed'),
        confidenceThreshold: z.number().min(0.1).max(1.0).default(0.6)
    }).default({}),
    culturalContext: z.object({
        region: z.string().default('kerala'),
        dialect: z.string().optional(),
        respectLevel: z.enum(['formal', 'informal', 'elder', 'peer']).default('formal'),
        festivalContext: z.string().optional(),
        familyStructure: z.enum(['nuclear', 'joint', 'extended']).optional(),
        religiousContext: z.string().optional(),
        socialNorms: z.array(z.string()).default([])
    }).optional(),
    agentId: z.string().optional(),
    sessionId: z.string().optional()
});

const TemplateRequestSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    malayalamDescription: z.string().optional(),
    category: z.enum(['problem_solving', 'decision_making', 'analysis', 'cultural_adaptation']),
    steps: z.array(z.object({
        stepType: z.enum(['observation', 'analysis', 'hypothesis', 'conclusion', 'validation', 'action']),
        prompt: z.string().min(1),
        malayalamPrompt: z.string().optional(),
        expectedFormat: z.string(),
        validationRules: z.array(z.string()),
        culturalNotes: z.string().optional()
    })),
    culturalConsiderations: z.array(z.string()),
    useCases: z.array(z.string())
});

// Global CoT processor instance
const cotProcessor = new ChainOfThoughtProcessor();

// POST /api/chain-of-thought - Process a problem with CoT
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = CoTRequestSchema.parse(body);

        console.log('🧠 Processing Chain of Thought request:', {
            problem: validatedData.problem.substring(0, 100),
            hasTemplate: !!validatedData.config.template,
            language: validatedData.config.language
        });

        const result = await cotProcessor.processWithCoT(
            validatedData.problem,
            validatedData.config as CoTExecutionConfig,
            validatedData.culturalContext as CulturalContext
        );

        return NextResponse.json({
            success: true,
            data: {
                reasoning_chain: {
                    id: result.chain.id,
                    problem: result.chain.problem,
                    malayalamProblem: result.chain.malayalamProblem,
                    goal: result.chain.goal,
                    steps: result.chain.steps.map(step => ({
                        id: step.id,
                        stepNumber: step.stepNumber,
                        type: step.type,
                        content: step.content,
                        malayalamContent: step.malayalamContent,
                        confidence: step.confidence,
                        reasoning: step.reasoning,
                        evidence: step.evidence,
                        timestamp: step.timestamp,
                        culturalContext: step.culturalContext
                    })),
                    conclusion: result.chain.conclusion,
                    malayalamConclusion: result.chain.malayalamConclusion,
                    confidence: result.chain.confidence,
                    reasoning_type: result.chain.reasoning_type,
                    validation_status: result.chain.validation_status,
                    culturalAlignment: result.chain.culturalAlignment
                },
                performance: result.performance,
                execution_time: result.executionTime,
                tokens_used: result.tokensUsed,
                cost: result.cost,
                recommendations: result.recommendations,
                metadata: {
                    template_used: validatedData.config.template,
                    cultural_validation: validatedData.config.culturalValidation,
                    steps_completed: result.chain.steps.length,
                    processed_at: new Date().toISOString()
                }
            }
        });

    } catch (error: any) {
        console.error('Chain of Thought processing error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid input data',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process Chain of Thought request'
        }, { status: 500 });
    }
}

// GET /api/chain-of-thought - Get templates and capabilities
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'templates':
                const templates = cotProcessor.listTemplates();
                return NextResponse.json({
                    success: true,
                    data: {
                        templates: templates.map(template => ({
                            id: template.id,
                            name: template.name,
                            description: template.description,
                            malayalamDescription: template.malayalamDescription,
                            category: template.category,
                            steps: template.steps.length,
                            culturalConsiderations: template.culturalConsiderations,
                            useCases: template.useCases
                        }))
                    }
                });

            case 'capabilities':
                return NextResponse.json({
                    success: true,
                    data: {
                        features: [
                            'Step-by-step reasoning documentation',
                            'Cultural context awareness',
                            'Malayalam language support',
                            'Template-based processing',
                            'Dynamic reasoning chains',
                            'Logical consistency validation',
                            'Cultural sensitivity validation',
                            'Performance metrics',
                            'Real-time step tracking'
                        ],
                        supported_languages: ['en', 'ml', 'mixed'],
                        reasoning_types: ['analytical', 'creative', 'logical', 'cultural', 'ethical'],
                        step_types: ['observation', 'analysis', 'hypothesis', 'conclusion', 'validation', 'action'],
                        cultural_contexts: ['kerala', 'malayalam', 'indian'],
                        max_steps: 20,
                        timeout_limit: 300000
                    }
                });

            case 'analytics':
                // Return mock analytics data
                return NextResponse.json({
                    success: true,
                    data: {
                        total_chains_processed: 1250,
                        average_steps_per_chain: 6.4,
                        average_confidence: 0.87,
                        success_rate: 0.94,
                        cultural_alignment_score: 0.91,
                        popular_templates: ['problem_solving', 'cultural_adaptation'],
                        common_reasoning_types: ['logical', 'cultural', 'analytical'],
                        performance_trends: {
                            reasoning_accuracy: 0.89,
                            processing_speed: '2.3s avg',
                            user_satisfaction: 0.92
                        }
                    }
                });

            default:
                return NextResponse.json({
                    success: true,
                    data: {
                        service: 'Chain of Thought Processing API',
                        version: '1.0.0',
                        status: 'operational',
                        endpoints: [
                            'POST /api/chain-of-thought - Process with CoT',
                            'GET /api/chain-of-thought?action=templates - List templates',
                            'GET /api/chain-of-thought?action=capabilities - Get capabilities',
                            'GET /api/chain-of-thought?action=analytics - Get analytics',
                            'POST /api/chain-of-thought/templates - Create template',
                            'PUT /api/chain-of-thought/templates/{id} - Update template'
                        ]
                    }
                });
        }

    } catch (error) {
        console.error('Chain of Thought GET error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process request'
        }, { status: 500 });
    }
}

// PUT /api/chain-of-thought - Update configuration or templates
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'add_template':
                const validatedTemplate = TemplateRequestSchema.parse(data);
                const template = {
                    id: `custom_${Date.now()}`,
                    ...validatedTemplate,
                    examples: []
                };

                cotProcessor.addTemplate(template);

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Template added successfully',
                        template_id: template.id,
                        template: template
                    }
                });

            case 'update_template':
                // Implementation for updating existing templates
                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Template update functionality ready for implementation'
                    }
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action specified'
                }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Chain of Thought PUT error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid template data',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update'
        }, { status: 500 });
    }
}

// DELETE /api/chain-of-thought - Remove templates or clear data
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const templateId = searchParams.get('template_id');

        if (templateId) {
            // Implementation for removing specific template
            return NextResponse.json({
                success: true,
                data: {
                    message: `Template deletion functionality ready for implementation`,
                    template_id: templateId
                }
            });
        }

        return NextResponse.json({
            success: false,
            error: 'Template ID is required'
        }, { status: 400 });

    } catch (error) {
        console.error('Chain of Thought DELETE error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete'
        }, { status: 500 });
    }
}

export { cotProcessor };