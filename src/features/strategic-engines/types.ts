// Strategic Engine Core Types and Interfaces
// Project Saksham - Phase 1 Implementation

export interface StrategicEngineConfig {
    id: string;
    name: string;
    type: EngineType;
    version: string;
    description: string;
    culturalContext: CulturalContext;
    dependencies: string[];
    capabilities: EngineCapability[];
    performance: PerformanceMetrics;
    status: EngineStatus;
}

export enum EngineType {
    HYPER_PERSONALIZATION = 'hyper_personalization',
    AUTONOMOUS_DISPATCH = 'autonomous_dispatch',
    AUTOMATED_RESOLUTION = 'automated_resolution',
    DOCUMENT_PROCESSING = 'document_processing',
    SAFETY_ANOMALY = 'safety_anomaly',
    DYNAMIC_EMPATHY = 'dynamic_empathy',
    PROACTIVE_ENGAGEMENT = 'proactive_engagement',
    AI_COPILOT = 'ai_copilot',
    DYNAMIC_PRICING = 'dynamic_pricing',
    ROOT_CAUSE_ANALYSIS = 'root_cause_analysis',
    THIRD_PARTY_DEVELOPER = 'third_party_developer',
    MARKET_EXPANSION = 'market_expansion',
    CONTEXTUAL_COMMERCE = 'contextual_commerce',
    DECENTRALIZED_IDENTITY = 'decentralized_identity',
    REGULATORY_COMPLIANCE = 'regulatory_compliance'
}

export enum EngineStatus {
    DEVELOPMENT = 'development',
    TESTING = 'testing',
    PILOT = 'pilot',
    PRODUCTION = 'production',
    MAINTENANCE = 'maintenance',
    DEPRECATED = 'deprecated'
}

export interface CulturalContext {
    language: 'ml' | 'en' | 'manglish';
    dialect?: string;
    region: string;
    culturalPreferences: Record<string, any>;
    festivalAwareness: boolean;
    localCustoms: Record<string, any>;
}

export interface EngineCapability {
    name: string;
    description: string;
    inputTypes: string[];
    outputTypes: string[];
    realTime: boolean;
    accuracy: number;
    latency: number; // milliseconds
}

export interface PerformanceMetrics {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    throughput: number; // requests per second
    uptime: number; // percentage
    lastUpdated: Date;
}

export interface EngineExecution {
    engineId: string;
    sessionId: string;
    inputData: any;
    outputData?: any;
    startTime: Date;
    endTime?: Date;
    status: ExecutionStatus;
    culturalContext: CulturalContext;
    performanceData: ExecutionMetrics;
    errorDetails?: ErrorDetails;
}

export enum ExecutionStatus {
    QUEUED = 'queued',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    TIMEOUT = 'timeout',
    CANCELLED = 'cancelled'
}

export interface ExecutionMetrics {
    processingTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkCalls: number;
    cacheHits: number;
    cacheMisses: number;
}

export interface ErrorDetails {
    code: string;
    message: string;
    stack?: string;
    contextData?: any;
    recoverable: boolean;
    retryCount: number;
}

// Strategic Engine Orchestrator Interface
export interface EngineOrchestrator {
    registerEngine(config: StrategicEngineConfig): Promise<void>;
    unregisterEngine(engineId: string): Promise<void>;
    executeEngine(engineId: string, inputData: any, context: CulturalContext): Promise<EngineExecution>;
    getEngineStatus(engineId: string): Promise<EngineStatus>;
    getEngineMetrics(engineId: string): Promise<PerformanceMetrics>;
    listEngines(): Promise<StrategicEngineConfig[]>;
    healthCheck(): Promise<OrchestratorHealth>;
}

export interface OrchestratorHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    engines: Record<string, EngineStatus>;
    systemMetrics: SystemMetrics;
    lastChecked: Date;
}

export interface SystemMetrics {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkLatency: number;
    activeConnections: number;
}

// Workflow Builder Integration Types
export interface StrategyNode {
    id: string;
    type: 'strategy_engine';
    position: { x: number; y: number };
    data: StrategyNodeData;
}

export interface StrategyNodeData {
    engineType: EngineType;
    engineConfig: Partial<StrategicEngineConfig>;
    inputMapping: Record<string, string>;
    outputMapping: Record<string, string>;
    culturalContext: CulturalContext;
    fallbackBehavior: FallbackBehavior;
    label: string;
    description: string;
}

export interface FallbackBehavior {
    enabled: boolean;
    strategy: 'retry' | 'skip' | 'default_response' | 'human_handoff';
    maxRetries?: number;
    retryDelay?: number;
    defaultResponse?: any;
    handoffConfig?: HandoffConfig;
}

export interface HandoffConfig {
    agentGroup: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    contextData: Record<string, any>;
    estimatedWaitTime: number;
}

// Engine Development Framework
export abstract class BaseStrategicEngine {
    protected config: StrategicEngineConfig;
    protected orchestrator: EngineOrchestrator;

    constructor(config: StrategicEngineConfig, orchestrator: EngineOrchestrator) {
        this.config = config;
        this.orchestrator = orchestrator;
    }

    abstract execute(inputData: any, context: CulturalContext): Promise<any>;
    abstract validate(inputData: any): boolean;
    abstract getSchema(): any;

    protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
        console.log(`[${this.config.id}] ${level.toUpperCase()}: ${message}`, data);
    }

    protected async updateMetrics(metrics: Partial<PerformanceMetrics>): Promise<void> {
        // Update engine performance metrics
        this.config.performance = { ...this.config.performance, ...metrics };
    }

    async healthCheck(): Promise<boolean> {
        try {
            // Basic health check implementation
            return true;
        } catch (error) {
            this.log('error', 'Health check failed', error);
            return false;
        }
    }

    public getId(): string {
        return this.config.id;
    }

    public getName(): string {
        return this.config.name;
    }
}

// Phase 1 Engine Specifications
export interface HyperPersonalizationConfig {
    malayalamDialects: string[];
    personalityProfiles: PersonalityProfile[];
    culturalAdaptations: CulturalAdaptation[];
    learningRate: number;
    confidenceThreshold: number;
}

export interface PersonalityProfile {
    id: string;
    name: string;
    traits: Record<string, number>; // Big 5 personality traits
    communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional';
    responsePatterns: string[];
    culturalMarkers: string[];
}

export interface CulturalAdaptation {
    trigger: string;
    adaptation: string;
    context: string[];
    confidence: number;
}

export interface AutonomousDispatchConfig {
    optimizationAlgorithm: 'genetic' | 'simulated_annealing' | 'particle_swarm' | 'ml_based';
    predictionModel: 'lstm' | 'transformer' | 'xgboost' | 'ensemble';
    realTimeUpdates: boolean;
    geofencingEnabled: boolean;
    trafficIntegration: boolean;
    weatherAwareness: boolean;
    culturalEventAwareness: boolean;
}

// Analytics and Monitoring
export interface EngineAnalytics {
    engineId: string;
    timeRange: { start: Date; end: Date };
    executionCount: number;
    averageLatency: number;
    successRate: number;
    errorBreakdown: Record<string, number>;
    culturalContextUsage: Record<string, number>;
    performanceTrends: TrendData[];
}

export interface TrendData {
    timestamp: Date;
    metric: string;
    value: number;
    context?: any;
}