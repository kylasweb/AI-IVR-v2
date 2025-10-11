import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { AIAgent, AgentExecutionRequest, AgentExecutionResponse } from '@/types/ai-agent';

// Mock database - replace with actual database operations
let agents: AIAgent[] = [];

const executionRequestSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    context: z.record(z.any()).optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional()
});

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const agentId = params.id;
        const body = await request.json();

        // Validate request body
        const validatedData = executionRequestSchema.parse(body);

        // Find agent
        const agent = agents.find(a => a.id === agentId);
        if (!agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        // Check if agent is available for execution
        if (agent.status !== 'published' && agent.status !== 'testing') {
            return NextResponse.json(
                {
                    error: 'Agent is not available for execution',
                    status: agent.status
                },
                { status: 403 }
            );
        }

        // Execute agent (mock implementation)
        const executionStart = Date.now();
        const result = await executeAgent(agent, validatedData);
        const executionTime = Date.now() - executionStart;

        // Update agent metrics (mock)
        updateAgentMetrics(agent, {
            execution: true,
            success: result.success,
            executionTime,
            tokenUsage: result.tokenUsage || 0
        });

        const response: AgentExecutionResponse = {
            id: `execution_${Date.now()}`,
            agentId: agent.id,
            response: result.output,
            confidence: result.success ? 0.9 : 0.3,
            executionTime,
            tokensUsed: result.tokenUsage || 0,
            cost: calculateCost(agent, result.tokenUsage || 0),
            metadata: {
                model: agent.configuration.model.modelId,
                temperature: agent.configuration.model.temperature,
                timestamp: new Date()
            }
        }; return NextResponse.json(response);
    } catch (error: unknown) {
        console.error('Error executing agent:', error);

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
            { error: 'Agent execution failed' },
            { status: 500 }
        );
    }
}

// Mock agent execution function
async function executeAgent(agent: AIAgent, request: AgentExecutionRequest): Promise<{
    output: string;
    success: boolean;
    tokenUsage?: number;
    error?: string;
}> {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

        const { configuration } = agent;
        const { prompt, context } = request;

        // Build prompt based on agent configuration
        const systemPrompt = configuration.prompts.systemPrompt;
        const userPrompt = configuration.prompts.userPromptTemplate.replace('{input}', prompt);

        // Mock AI response based on agent capabilities
        let output = '';

        if (configuration.malayalamSupport.enabled && containsMalayalam(prompt)) {
            output = generateMalayalamResponse(prompt, agent);
        } else {
            output = generateEnglishResponse(prompt, agent);
        }        // Simulate different success rates based on agent quality
        const successProbability = agent.metrics.successRate / 100 || 0.9;
        const isSuccess = Math.random() < successProbability;

        if (!isSuccess) {
            const fallbackResponse = configuration.prompts.fallbackResponses[
                Math.floor(Math.random() * configuration.prompts.fallbackResponses.length)
            ];
            return {
                output: fallbackResponse,
                success: false,
                tokenUsage: Math.floor(Math.random() * 100) + 50,
                error: 'Agent failed to generate appropriate response'
            };
        }

        return {
            output,
            success: true,
            tokenUsage: Math.floor(Math.random() * 500) + 100
        };
    } catch (error) {
        return {
            output: 'I apologize, but I encountered an error processing your request.',
            success: false,
            error: 'Internal execution error'
        };
    }
}

function containsMalayalam(text: string): boolean {
    // Simple check for Malayalam Unicode range
    const malayalamRange = /[\u0D00-\u0D7F]/;
    return malayalamRange.test(text);
}

function generateMalayalamResponse(prompt: string, agent: AIAgent): string {
    const responses = [
        'നിങ്ങളുടെ ചോദ്യം മനസ്സിലായി. ഞാൻ സഹായിക്കാം.',
        'ഇത് വളരെ നല്ല ചോദ്യമാണ്. കൂടുതൽ വിവരങ്ങൾ തരാം.',
        'കേരളത്തെ കുറിച്ച് എനിക്ക് വിപുലമായ അറിവുണ്ട്. എന്ത് വേണമെന്ന് പറയൂ.',
        'നിങ്ങൾക്ക് വേണ്ട സഹായം ഞാൻ നൽകാം.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function generateEnglishResponse(prompt: string, agent: AIAgent): string {
    const { persona } = agent.configuration;

    // Generate response based on persona and capabilities
    if (persona.role.toLowerCase().includes('support')) {
        return `Thank you for contacting us! I understand you're asking about: "${prompt}". As your ${persona.role}, I'm here to help you with detailed information and support.`;
    }

    if (persona.role.toLowerCase().includes('tourism')) {
        return `Welcome to Kerala! I'd be happy to help you with your query about: "${prompt}". As a local tourism expert, I can provide you with authentic recommendations and insights.`;
    }

    if (persona.role.toLowerCase().includes('content')) {
        return `Great idea for content! Based on your request: "${prompt}", I can help you create engaging and culturally relevant content that resonates with your audience.`;
    }

    return `I understand your query about: "${prompt}". Let me provide you with a helpful and detailed response based on my expertise in ${persona.expertise.join(', ')}.`;
} function updateAgentMetrics(agent: AIAgent, execution: {
    execution: boolean;
    success: boolean;
    executionTime: number;
    tokenUsage: number;
}) {
    if (execution.execution) {
        agent.metrics.totalExecutions++;
        agent.metrics.tokenUsage += execution.tokenUsage;
        agent.metrics.lastExecuted = new Date();

        // Update success rate (rolling average)
        const totalExecutions = agent.metrics.totalExecutions;
        const previousSuccessCount = Math.floor((agent.metrics.successRate / 100) * (totalExecutions - 1));
        const newSuccessCount = previousSuccessCount + (execution.success ? 1 : 0);
        agent.metrics.successRate = (newSuccessCount / totalExecutions) * 100;

        // Update error rate
        agent.metrics.errorRate = 100 - agent.metrics.successRate;

        // Update average response time (rolling average)
        agent.metrics.averageResponseTime =
            ((agent.metrics.averageResponseTime * (totalExecutions - 1)) + execution.executionTime) / totalExecutions / 1000;
    }
}

function calculateCost(agent: AIAgent, tokenUsage: number): number {
    if (!agent.pricing || agent.pricing.model === 'free') {
        return 0;
    }

    if (agent.pricing.model === 'pay-per-use') {
        return agent.pricing.pricePerExecution || 0;
    }

    // For token-based pricing (could be added later)
    const tokenRate = 0.001; // ₹0.001 per token
    return tokenUsage * tokenRate;
}