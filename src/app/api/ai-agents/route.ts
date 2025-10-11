import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { AIAgent, AgentConfiguration } from '@/types/ai-agent';

// Validation schemas
const agentConfigurationSchema = z.object({
    persona: z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        personality: z.string().min(1),
        expertise: z.array(z.string()),
        communicationStyle: z.enum(['formal', 'casual', 'friendly', 'professional', 'creative']),
        languagePreference: z.enum(['english', 'malayalam', 'multilingual'])
    }),
    model: z.object({
        provider: z.enum(['openai', 'anthropic', 'google', 'local']),
        modelId: z.string().min(1),
        temperature: z.number().min(0).max(2),
        maxTokens: z.number().min(1).max(10000),
        topP: z.number().min(0).max(1),
        frequencyPenalty: z.number().min(0).max(2),
        presencePenalty: z.number().min(0).max(2)
    }),
    prompts: z.object({
        systemPrompt: z.string().min(1),
        userPromptTemplate: z.string().min(1),
        fallbackResponses: z.array(z.string()),
        contextInstructions: z.string().optional()
    }),
    capabilities: z.object({
        textGeneration: z.boolean(),
        questionAnswering: z.boolean(),
        documentAnalysis: z.boolean(),
        codeGeneration: z.boolean(),
        translation: z.boolean(),
        summarization: z.boolean(),
        sentiment: z.boolean(),
        voiceProcessing: z.boolean()
    }),
    safety: z.object({
        contentFiltering: z.boolean(),
        toxicityThreshold: z.number().min(0).max(1),
        piiDetection: z.boolean(),
        biasMonitoring: z.boolean(),
        adultContentFilter: z.boolean()
    }),
    integrations: z.object({
        apiEndpoints: z.array(z.string()),
        externalTools: z.array(z.string()),
        databases: z.array(z.string())
    }),
    malayalamSupport: z.object({
        enabled: z.boolean(),
        dialectSupport: z.array(z.enum(['central', 'northern', 'southern', 'malabar'])),
        scriptSupport: z.enum(['malayalam', 'english', 'both']),
        culturalContext: z.boolean(),
        regionalVariations: z.boolean()
    })
});

const createAgentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    configuration: agentConfigurationSchema,
    pricing: z.object({
        model: z.enum(['free', 'pay-per-use', 'subscription', 'enterprise']),
        pricePerExecution: z.number().min(0).optional(),
        currency: z.string().default('INR'),
        revenueShare: z.object({
            platform: z.number().min(0).max(100),
            creator: z.number().min(0).max(100)
        }).optional()
    }).optional()
});

const updateAgentSchema = createAgentSchema.partial();

// Mock database - replace with actual database operations
let agents: AIAgent[] = [];
let agentCounter = 1;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'updatedAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Filter agents
        let filteredAgents = [...agents];

        if (status && status !== 'all') {
            filteredAgents = filteredAgents.filter(agent => agent.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filteredAgents = filteredAgents.filter(agent =>
                agent.name.toLowerCase().includes(searchLower) ||
                agent.description.toLowerCase().includes(searchLower)
            );
        }

        // Sort agents
        filteredAgents.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'executions':
                    aValue = a.metrics.totalExecutions;
                    bValue = b.metrics.totalExecutions;
                    break;
                case 'revenue':
                    aValue = a.metrics.totalRevenue;
                    bValue = b.metrics.totalRevenue;
                    break;
                case 'rating':
                    aValue = a.metrics.userRating;
                    bValue = b.metrics.userRating;
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'updatedAt':
                default:
                    aValue = new Date(a.updatedAt).getTime();
                    bValue = new Date(b.updatedAt).getTime();
                    break;
            }

            if (sortOrder === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

        return NextResponse.json({
            agents: paginatedAgents,
            pagination: {
                page,
                limit,
                total: filteredAgents.length,
                totalPages: Math.ceil(filteredAgents.length / limit)
            },
            metrics: {
                totalAgents: agents.length,
                publishedAgents: agents.filter(a => a.status === 'published').length,
                draftAgents: agents.filter(a => a.status === 'draft').length,
                testingAgents: agents.filter(a => a.status === 'testing').length
            }
        });
    } catch (error) {
        console.error('Error fetching agents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = createAgentSchema.parse(body);

        // Create new agent
        const newAgent: AIAgent = {
            id: `agent_${agentCounter++}`,
            name: validatedData.name,
            description: validatedData.description,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            creatorId: 'current-user', // TODO: Get from session
            version: '0.1.0',
            configuration: validatedData.configuration,
            metrics: {
                totalExecutions: 0,
                successRate: 0,
                averageResponseTime: 0,
                userRating: 0,
                totalRevenue: 0,
                activeUsers: 0,
                popularQueries: [],
                errorRate: 0,
                tokenUsage: 0
            },
            pricing: validatedData.pricing || {
                model: 'pay-per-use',
                pricePerExecution: 5,
                currency: 'INR',
                revenueShare: {
                    platform: 30,
                    creator: 70
                }
            }
        };

        // Save to database (mock)
        agents.push(newAgent);

        return NextResponse.json(
            {
                message: 'Agent created successfully',
                agent: newAgent
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Error creating agent:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: 'Invalid input data'
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create agent' },
            { status: 500 }
        );
    }
}