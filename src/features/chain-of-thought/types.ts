// Chain of Thought (CoT) Processing Framework
// Core types and interfaces for reasoning systems

export interface ThoughtStep {
    id: string;
    stepNumber: number;
    type: 'observation' | 'analysis' | 'hypothesis' | 'conclusion' | 'validation' | 'action';
    content: string;
    malayalamContent?: string;
    confidence: number;
    reasoning: string;
    evidence?: string[];
    timestamp: Date;
    culturalContext?: CulturalContext;
    dependencies?: string[]; // IDs of previous steps this depends on
    metadata?: Record<string, any>;
}

export interface ReasoningChain {
    id: string;
    sessionId: string;
    agentId?: string;
    engineId?: string;
    problem: string;
    malayalamProblem?: string;
    goal: string;
    steps: ThoughtStep[];
    conclusion: string;
    malayalamConclusion?: string;
    confidence: number;
    reasoning_type: 'analytical' | 'creative' | 'logical' | 'cultural' | 'ethical';
    validation_status: ValidationStatus;
    created: Date;
    updated: Date;
    culturalAlignment: number; // 0-1 score for cultural appropriateness
}

export interface ValidationStatus {
    isValid: boolean;
    validationScore: number;
    inconsistencies: string[];
    culturalIssues: string[];
    logicalGaps: string[];
    recommendations: string[];
}

export interface CoTTemplate {
    id: string;
    name: string;
    description: string;
    malayalamDescription?: string;
    category: 'problem_solving' | 'decision_making' | 'analysis' | 'cultural_adaptation';
    steps: CoTStepTemplate[];
    culturalConsiderations: string[];
    useCases: string[];
    examples: CoTExample[];
}

export interface CoTStepTemplate {
    stepType: ThoughtStep['type'];
    prompt: string;
    malayalamPrompt?: string;
    expectedFormat: string;
    validationRules: string[];
    culturalNotes?: string;
}

export interface CoTExample {
    scenario: string;
    malayalamScenario?: string;
    expectedChain: Partial<ThoughtStep>[];
    culturalContext: CulturalContext;
}

export interface CulturalContext {
    region: string;
    dialect?: string;
    respectLevel: 'formal' | 'informal' | 'elder' | 'peer';
    festivalContext?: string;
    familyStructure?: 'nuclear' | 'joint' | 'extended';
    religiousContext?: string;
    socialNorms: string[];
}

export interface CoTExecutionConfig {
    maxSteps: number;
    requireValidation: boolean;
    culturalValidation: boolean;
    timeoutMs: number;
    template?: string;
    language: 'en' | 'ml' | 'mixed';
    confidenceThreshold: number;
}

export interface CoTResult {
    chain: ReasoningChain;
    executionTime: number;
    tokensUsed: number;
    cost: number;
    performance: CoTPerformance;
    recommendations: string[];
}

export interface CoTPerformance {
    reasoningAccuracy: number;
    culturalAlignment: number;
    logicalConsistency: number;
    completeness: number;
    efficiency: number;
}

export interface CoTAnalytics {
    sessionId: string;
    totalChains: number;
    averageSteps: number;
    averageConfidence: number;
    successRate: number;
    culturalAlignmentScore: number;
    commonPatterns: string[];
    improvementAreas: string[];
}

// Event types for CoT system
export type CoTEvent =
    | { type: 'step_started'; stepId: string; step: ThoughtStep }
    | { type: 'step_completed'; stepId: string; result: any }
    | { type: 'validation_started'; chainId: string }
    | { type: 'validation_completed'; chainId: string; status: ValidationStatus }
    | { type: 'chain_completed'; chainId: string; result: CoTResult }
    | { type: 'error'; error: string; context: any };

export interface CoTEventHandler {
    onEvent(event: CoTEvent): void | Promise<void>;
}