// Strategic Engine Orchestrator - Core Implementation
// Project Saksham Phase 1

import {
    StrategicEngineConfig,
    EngineOrchestrator,
    EngineExecution,
    EngineStatus,
    PerformanceMetrics,
    OrchestratorHealth,
    SystemMetrics,
    CulturalContext,
    ExecutionStatus,
    ErrorDetails,
    BaseStrategicEngine
} from './types';

export class StrategicEngineOrchestratorImpl implements EngineOrchestrator {
    private engines: Map<string, StrategicEngineConfig> = new Map();
    private engineInstances: Map<string, BaseStrategicEngine> = new Map();
    private executions: Map<string, EngineExecution> = new Map();
    private healthStatus: OrchestratorHealth;

    constructor() {
        this.healthStatus = {
            status: 'healthy',
            engines: {},
            systemMetrics: {
                memoryUsage: 0,
                cpuUsage: 0,
                diskUsage: 0,
                networkLatency: 0,
                activeConnections: 0
            },
            lastChecked: new Date()
        };

        // Start health monitoring
        this.startHealthMonitoring();
    }

    async registerEngine(config: StrategicEngineConfig): Promise<void> {
        try {
            console.log(`Registering strategic engine: ${config.name} (${config.id})`);

            // Validate configuration
            this.validateEngineConfig(config);

            // Store engine configuration
            this.engines.set(config.id, config);
            this.healthStatus.engines[config.id] = config.status;

            console.log(`Successfully registered engine: ${config.id}`);
        } catch (error) {
            console.error(`Failed to register engine ${config.id}:`, error);
            throw error;
        }
    }

    async unregisterEngine(engineId: string): Promise<void> {
        try {
            if (!this.engines.has(engineId)) {
                throw new Error(`Engine ${engineId} not found`);
            }

            // Stop any running executions
            const runningExecutions = Array.from(this.executions.values())
                .filter(exec => exec.engineId === engineId && exec.status === ExecutionStatus.RUNNING);

            for (const execution of runningExecutions) {
                execution.status = ExecutionStatus.CANCELLED;
                execution.endTime = new Date();
            }

            // Remove engine
            this.engines.delete(engineId);
            this.engineInstances.delete(engineId);
            delete this.healthStatus.engines[engineId];

            console.log(`Successfully unregistered engine: ${engineId}`);
        } catch (error) {
            console.error(`Failed to unregister engine ${engineId}:`, error);
            throw error;
        }
    }

    async executeEngine(engineId: string, inputData: any, context: CulturalContext): Promise<EngineExecution> {
        const sessionId = this.generateSessionId();
        const execution: EngineExecution = {
            engineId,
            sessionId,
            inputData,
            startTime: new Date(),
            status: ExecutionStatus.QUEUED,
            culturalContext: context,
            performanceData: {
                processingTime: 0,
                memoryUsage: 0,
                cpuUsage: 0,
                networkCalls: 0,
                cacheHits: 0,
                cacheMisses: 0
            }
        };

        this.executions.set(sessionId, execution);

        try {
            const engine = this.engines.get(engineId);
            if (!engine) {
                throw new Error(`Engine ${engineId} not found`);
            }

            if (engine.status !== EngineStatus.PRODUCTION && engine.status !== EngineStatus.PILOT) {
                throw new Error(`Engine ${engineId} is not available (status: ${engine.status})`);
            }

            execution.status = ExecutionStatus.RUNNING;

            // Get or create engine instance
            let engineInstance = this.engineInstances.get(engineId);
            if (!engineInstance) {
                engineInstance = await this.createEngineInstance(engine);
                this.engineInstances.set(engineId, engineInstance);
            }

            // Execute with performance monitoring
            const startTime = Date.now();
            const startMemory = process.memoryUsage().heapUsed;

            execution.outputData = await engineInstance.execute(inputData, context);

            const endTime = Date.now();
            const endMemory = process.memoryUsage().heapUsed;

            execution.endTime = new Date();
            execution.status = ExecutionStatus.COMPLETED;
            execution.performanceData.processingTime = endTime - startTime;
            execution.performanceData.memoryUsage = Math.abs(endMemory - startMemory);

            // Update engine metrics
            await this.updateEngineMetrics(engineId, execution);

            console.log(`Engine ${engineId} executed successfully in ${execution.performanceData.processingTime}ms`);

            return execution;

        } catch (error) {
            execution.status = ExecutionStatus.FAILED;
            execution.endTime = new Date();
            const errorObj = error as Error;
            execution.errorDetails = {
                code: 'EXECUTION_FAILED',
                message: errorObj.message || 'Unknown error occurred',
                stack: errorObj.stack,
                contextData: { inputData, culturalContext: context },
                recoverable: this.isRecoverableError(error),
                retryCount: 0
            };

            console.error(`Engine ${engineId} execution failed:`, error);
            throw error;
        }
    }

    async getEngineStatus(engineId: string): Promise<EngineStatus> {
        const engine = this.engines.get(engineId);
        if (!engine) {
            throw new Error(`Engine ${engineId} not found`);
        }
        return engine.status;
    }

    async getEngineMetrics(engineId: string): Promise<PerformanceMetrics> {
        const engine = this.engines.get(engineId);
        if (!engine) {
            throw new Error(`Engine ${engineId} not found`);
        }
        return engine.performance;
    }

    async listEngines(): Promise<StrategicEngineConfig[]> {
        return Array.from(this.engines.values());
    }

    async healthCheck(): Promise<OrchestratorHealth> {
        const systemMetrics = await this.collectSystemMetrics();
        const engineStatuses: Record<string, EngineStatus> = {};

        // Check each engine health
        for (const [engineId, engine] of this.engines) {
            try {
                const instance = this.engineInstances.get(engineId);
                if (instance) {
                    const healthy = await instance.healthCheck();
                    engineStatuses[engineId] = healthy ? engine.status : EngineStatus.MAINTENANCE;
                } else {
                    engineStatuses[engineId] = engine.status;
                }
            } catch (error) {
                console.error(`Health check failed for engine ${engineId}:`, error);
                engineStatuses[engineId] = EngineStatus.MAINTENANCE;
            }
        }

        // Determine overall health
        const unhealthyEngines = Object.values(engineStatuses)
            .filter(status => status === EngineStatus.MAINTENANCE).length;

        let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        if (unhealthyEngines > 0) {
            overallStatus = unhealthyEngines > this.engines.size * 0.5 ? 'unhealthy' : 'degraded';
        }

        this.healthStatus = {
            status: overallStatus,
            engines: engineStatuses,
            systemMetrics,
            lastChecked: new Date()
        };

        return this.healthStatus;
    }

    // Cultural Context Enhancement
    enhanceCulturalContext(baseContext: CulturalContext, userHistory?: any[]): CulturalContext {
        const enhanced = { ...baseContext };

        // Add Malayalam dialect detection
        if (baseContext.language === 'ml' && userHistory) {
            enhanced.dialect = this.detectMalayalamDialect(userHistory);
        }

        // Add regional preferences
        if (baseContext.region) {
            enhanced.culturalPreferences = this.getRegionalPreferences(baseContext.region);
        }

        // Add festival awareness
        enhanced.festivalAwareness = this.checkFestivalSeason();

        return enhanced;
    }

    // Private Methods
    private validateEngineConfig(config: StrategicEngineConfig): void {
        if (!config.id || !config.name || !config.type) {
            throw new Error('Engine configuration missing required fields');
        }

        if (this.engines.has(config.id)) {
            throw new Error(`Engine with id ${config.id} already registered`);
        }

        // Validate cultural context
        if (!config.culturalContext.language) {
            throw new Error('Cultural context must specify language');
        }
    }

    private async createEngineInstance(config: StrategicEngineConfig): Promise<BaseStrategicEngine> {
        // Dynamic engine instance creation based on type
        // This would be implemented with actual engine classes
        console.log(`Creating instance for engine type: ${config.type}`);

        // For now, return a mock instance
        // In real implementation, this would use factory pattern
        throw new Error(`Engine type ${config.type} not implemented yet`);
    }

    private async updateEngineMetrics(engineId: string, execution: EngineExecution): Promise<void> {
        const engine = this.engines.get(engineId);
        if (!engine) return;

        const metrics = engine.performance;
        const executionTime = execution.performanceData.processingTime;

        // Update running averages
        metrics.averageResponseTime = (metrics.averageResponseTime + executionTime) / 2;

        if (execution.status === ExecutionStatus.COMPLETED) {
            metrics.successRate = Math.min(100, metrics.successRate + 0.1);
            metrics.errorRate = Math.max(0, metrics.errorRate - 0.1);
        } else {
            metrics.successRate = Math.max(0, metrics.successRate - 0.1);
            metrics.errorRate = Math.min(100, metrics.errorRate + 0.1);
        }

        metrics.lastUpdated = new Date();
        engine.performance = metrics;
    }

    private async collectSystemMetrics(): Promise<SystemMetrics> {
        const memUsage = process.memoryUsage();

        return {
            memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
            cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
            diskUsage: 0, // Would need filesystem check
            networkLatency: 0, // Would need network ping
            activeConnections: this.executions.size
        };
    }

    private detectMalayalamDialect(userHistory: any[]): string {
        // Analyze user communication patterns to detect Malayalam dialect
        // This would use NLP analysis of previous interactions
        return 'central'; // Default to Central Malayalam
    }

    private getRegionalPreferences(region: string): Record<string, any> {
        const preferences: Record<string, Record<string, any>> = {
            'kerala-north': {
                greeting: 'vanakkam',
                formality: 'moderate',
                festivalsEmphasis: ['onam', 'vishu', 'thrissur_pooram']
            },
            'kerala-central': {
                greeting: 'namaskar',
                formality: 'high',
                festivalsEmphasis: ['onam', 'vishu', 'kochi_carnival']
            },
            'kerala-south': {
                greeting: 'vanakkam',
                formality: 'moderate',
                festivalsEmphasis: ['onam', 'vishu', 'attukal_pongala']
            }
        };

        return preferences[region] || preferences['kerala-central'];
    }

    private checkFestivalSeason(): boolean {
        const now = new Date();
        const month = now.getMonth() + 1; // JavaScript months are 0-indexed

        // Malayalam festival calendar awareness
        const festivalMonths = [3, 4, 8, 9, 10, 11, 12]; // Major Malayalam festival months
        return festivalMonths.includes(month);
    }

    private isRecoverableError(error: any): boolean {
        // Determine if error is recoverable based on error type
        const recoverableErrors = ['TIMEOUT', 'NETWORK_ERROR', 'TEMPORARY_UNAVAILABLE'];
        return recoverableErrors.some(type => error.message.includes(type));
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private startHealthMonitoring(): void {
        setInterval(async () => {
            try {
                await this.healthCheck();
            } catch (error) {
                console.error('Health check failed:', error);
            }
        }, 30000); // Check every 30 seconds
    }

    // Advanced Features
    async getEngineAnalytics(engineId: string, timeRange: { start: Date; end: Date }) {
        const executions = Array.from(this.executions.values())
            .filter(exec =>
                exec.engineId === engineId &&
                exec.startTime >= timeRange.start &&
                exec.startTime <= timeRange.end
            );

        const successfulExecutions = executions.filter(exec => exec.status === ExecutionStatus.COMPLETED);
        const failedExecutions = executions.filter(exec => exec.status === ExecutionStatus.FAILED);

        return {
            engineId,
            timeRange,
            executionCount: executions.length,
            averageLatency: successfulExecutions.reduce((sum, exec) => sum + exec.performanceData.processingTime, 0) / successfulExecutions.length || 0,
            successRate: (successfulExecutions.length / executions.length) * 100 || 0,
            errorBreakdown: this.analyzeErrorBreakdown(failedExecutions),
            culturalContextUsage: this.analyzeCulturalContextUsage(executions),
            performanceTrends: this.calculatePerformanceTrends(executions)
        };
    }

    private analyzeErrorBreakdown(failedExecutions: EngineExecution[]): Record<string, number> {
        const breakdown: Record<string, number> = {};

        failedExecutions.forEach(exec => {
            const errorCode = exec.errorDetails?.code || 'UNKNOWN';
            breakdown[errorCode] = (breakdown[errorCode] || 0) + 1;
        });

        return breakdown;
    }

    private analyzeCulturalContextUsage(executions: EngineExecution[]): Record<string, number> {
        const usage: Record<string, number> = {};

        executions.forEach(exec => {
            const lang = exec.culturalContext.language;
            const region = exec.culturalContext.region;
            const key = `${lang}_${region}`;
            usage[key] = (usage[key] || 0) + 1;
        });

        return usage;
    }

    private calculatePerformanceTrends(executions: EngineExecution[]): any[] {
        // Group executions by hour and calculate trends
        const hourlyGroups: Record<string, EngineExecution[]> = {};

        executions.forEach(exec => {
            const hour = new Date(exec.startTime).toISOString().slice(0, 13);
            if (!hourlyGroups[hour]) hourlyGroups[hour] = [];
            hourlyGroups[hour].push(exec);
        });

        return Object.entries(hourlyGroups).map(([hour, execs]) => ({
            timestamp: new Date(hour + ':00:00'),
            metric: 'average_latency',
            value: execs.reduce((sum, exec) => sum + exec.performanceData.processingTime, 0) / execs.length,
            context: { executionCount: execs.length }
        }));
    }
}

// Export singleton instance
export const strategicEngineOrchestrator = new StrategicEngineOrchestratorImpl();