// Types and interfaces for AI Agent Builder
export interface AIAgent {
    id: string;
    name: string;
    description: string;
    status: AgentStatus;
    createdAt: Date;
    updatedAt: Date;
    creatorId: string;
    version: string;
    configuration: AgentConfiguration;
    metrics: AgentMetrics;
    pricing: AgentPricing;
}

export interface AgentConfiguration {
    // Core Agent Settings
    persona: {
        name: string;
        role: string;
        personality: string;
        expertise: string[];
        communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional' | 'creative';
        languagePreference: 'malayalam' | 'english' | 'manglish' | 'multilingual';
    };

    // AI Model Configuration
    model: {
        provider: 'openai' | 'anthropic' | 'google' | 'local';
        modelId: string;
        temperature: number;
        maxTokens: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
    };

    // Prompt Engineering
    prompts: {
        systemPrompt: string;
        userPromptTemplate: string;
        fallbackResponses: string[];
        contextInstructions: string;
    };

    // Capabilities and Tools
    capabilities: {
        textGeneration: boolean;
        questionAnswering: boolean;
        documentAnalysis: boolean;
        codeGeneration: boolean;
        translation: boolean;
        summarization: boolean;
        sentiment: boolean;
        voiceProcessing: boolean;
    };

    // Safety and Moderation
    safety: {
        contentFiltering: boolean;
        toxicityThreshold: number;
        piiDetection: boolean;
        biasMonitoring: boolean;
        adultContentFilter: boolean;
    };

    // Integration Settings
    integrations: {
        webhookUrl?: string;
        apiEndpoints: string[];
        externalTools: ExternalTool[];
        databases: DatabaseConnection[];
    };

    // Malayalam-specific Configuration
    malayalamSupport: {
        enabled: boolean;
        dialectSupport: string[];
        scriptSupport: 'malayalam' | 'latin' | 'both';
        culturalContext: boolean;
        regionalVariations: boolean;
    };
}

export interface ExternalTool {
    id: string;
    name: string;
    type: 'api' | 'database' | 'webhook' | 'service';
    endpoint: string;
    authentication: {
        type: 'none' | 'apiKey' | 'oauth' | 'bearer';
        credentials?: string;
    };
    parameters: Record<string, any>;
}

export interface DatabaseConnection {
    id: string;
    name: string;
    type: 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';
    connectionString: string;
    tables: string[];
    queryTemplate: string;
}

export interface AgentMetrics {
    totalExecutions: number;
    successRate: number;
    averageResponseTime: number;
    userRating: number;
    totalRevenue: number;
    activeUsers: number;
    lastExecuted?: Date;
    popularQueries: string[];
    errorRate: number;
    tokenUsage: number;
}

export interface AgentPricing {
    model: 'free' | 'pay-per-use' | 'subscription' | 'tiered';
    pricePerExecution?: number;
    monthlySubscription?: number;
    tierLimits?: {
        free: number;
        basic: number;
        premium: number;
    };
    currency: 'INR' | 'USD' | 'EUR';
    revenueShare: {
        platform: number;
        creator: number;
    };
}

export type AgentStatus =
    | 'draft'
    | 'testing'
    | 'review'
    | 'published'
    | 'suspended'
    | 'archived';

export interface AgentTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    configuration: Partial<AgentConfiguration>;
    isPopular: boolean;
    usageCount: number;
    tags?: string[];
    useCases?: string[];
    pricing?: AgentPricing;
    creator?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    industries?: string[];
    estimatedCost?: number;
    setupTime?: string;
}

export interface AgentExecutionRequest {
    agentId: string;
    prompt: string;
    context?: Record<string, any>;
    userId?: string;
    sessionId?: string;
}

export interface AgentExecutionResponse {
    id: string;
    agentId: string;
    response: string;
    confidence: number;
    executionTime: number;
    tokensUsed: number;
    cost: number;
    metadata: {
        model: string;
        temperature: number;
        timestamp: Date;
    };
    citations?: string[];
    errors?: string[];
}

export interface AgentAnalytics {
    period: 'hour' | 'day' | 'week' | 'month';
    executions: {
        timestamp: Date;
        count: number;
        revenue: number;
    }[];
    topQueries: {
        query: string;
        count: number;
        avgRating: number;
    }[];
    userDistribution: {
        newUsers: number;
        returningUsers: number;
    };
    performanceMetrics: {
        avgResponseTime: number;
        successRate: number;
        errorRate: number;
    };
}