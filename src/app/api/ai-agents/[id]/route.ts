import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { AIAgent } from '@/types/ai-agent';

// Mock database - replace with actual database operations
let agents: AIAgent[] = [];

const updateAgentSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(['draft', 'testing', 'review', 'published', 'suspended', 'archived']).optional(),
    configuration: z.object({
        persona: z.object({
            name: z.string().min(1),
            role: z.string().min(1),
            personality: z.string().min(1),
            expertise: z.array(z.string()),
            communicationStyle: z.enum(['formal', 'casual', 'friendly', 'professional', 'creative']),
            languagePreference: z.enum(['english', 'malayalam', 'multilingual'])
        }).optional(),
        model: z.object({
            provider: z.enum(['openai', 'anthropic', 'google', 'local']),
            modelId: z.string().min(1),
            temperature: z.number().min(0).max(2),
            maxTokens: z.number().min(1).max(10000),
            topP: z.number().min(0).max(1),
            frequencyPenalty: z.number().min(0).max(2),
            presencePenalty: z.number().min(0).max(2)
        }).optional(),
        prompts: z.object({
            systemPrompt: z.string().min(1),
            userPromptTemplate: z.string().min(1),
            fallbackResponses: z.array(z.string()),
            contextInstructions: z.string().optional()
        }).optional(),
        capabilities: z.object({
            textGeneration: z.boolean(),
            questionAnswering: z.boolean(),
            documentAnalysis: z.boolean(),
            codeGeneration: z.boolean(),
            translation: z.boolean(),
            summarization: z.boolean(),
            sentiment: z.boolean(),
            voiceProcessing: z.boolean()
        }).optional(),
        safety: z.object({
            contentFiltering: z.boolean(),
            toxicityThreshold: z.number().min(0).max(1),
            piiDetection: z.boolean(),
            biasMonitoring: z.boolean(),
            adultContentFilter: z.boolean()
        }).optional(),
        integrations: z.object({
            apiEndpoints: z.array(z.string()),
            externalTools: z.array(z.string()),
            databases: z.array(z.string())
        }).optional(),
        malayalamSupport: z.object({
            enabled: z.boolean(),
            dialectSupport: z.array(z.enum(['central', 'northern', 'southern', 'malabar'])),
            scriptSupport: z.enum(['malayalam', 'english', 'both']),
            culturalContext: z.boolean(),
            regionalVariations: z.boolean()
        }).optional()
    }).optional(),
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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const agentId = params.id;
        const agent = agents.find(a => a.id === agentId);

        if (!agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ agent });
    } catch (error: unknown) {
        console.error('Error fetching agent:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agent' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const agentId = params.id;
        const body = await request.json();

        // Find existing agent
        const agentIndex = agents.findIndex(a => a.id === agentId);
        if (agentIndex === -1) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        // Validate request body
        const validatedData = updateAgentSchema.parse(body);

        // Update agent
        const existingAgent = agents[agentIndex];
        const updatedAgent: AIAgent = {
            ...existingAgent,
            ...validatedData,
            configuration: {
                ...existingAgent.configuration,
                ...validatedData.configuration
            },
            updatedAt: new Date(),
            version: incrementVersion(existingAgent.version)
        };

        agents[agentIndex] = updatedAgent;

        return NextResponse.json({
            message: 'Agent updated successfully',
            agent: updatedAgent
        });
    } catch (error: unknown) {
        console.error('Error updating agent:', error);

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
            { error: 'Failed to update agent' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const agentId = params.id;
        const agentIndex = agents.findIndex(a => a.id === agentId);

        if (agentIndex === -1) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        // Check if agent is published and has active users
        const agent = agents[agentIndex];
        if (agent.status === 'published' && agent.metrics.activeUsers > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete published agent with active users',
                    suggestion: 'Archive the agent instead'
                },
                { status: 409 }
            );
        }

        // Remove agent from database
        agents.splice(agentIndex, 1);

        return NextResponse.json({
            message: 'Agent deleted successfully'
        });
    } catch (error: unknown) {
        console.error('Error deleting agent:', error);
        return NextResponse.json(
            { error: 'Failed to delete agent' },
            { status: 500 }
        );
    }
}

// Helper function to increment version number
function incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
}