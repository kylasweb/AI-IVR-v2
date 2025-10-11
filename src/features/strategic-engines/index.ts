// Strategic Engines - Main Export Index
// Project Saksham Phase 1 Implementation

// Core Types and Interfaces
export * from './types';

// Engine Orchestrator
export { strategicEngineOrchestrator, StrategicEngineOrchestratorImpl } from './orchestrator';

// Engine Factory
export { engineFactory, EngineFactory } from './factory';

// Individual Engines
export {
    HyperPersonalizationEngine,
    hyperPersonalizationEngineConfig
} from './engines/hyper-personalization';

export {
    AutonomousDispatchEngine,
    autonomousDispatchEngineConfig
} from './engines/autonomous-dispatch';

export {
    ThirdPartyDeveloperEngine,
    thirdPartyDeveloperEngineConfig
} from './engines/third-party-developer-streamlined';

export {
    MarketExpansionEngine,
    marketExpansionEngineConfig
} from './engines/market-expansion';

export {
    ContextualCommerceEngine,
    contextualCommerceEngineConfig
} from './engines/contextual-commerce';

export {
    DecentralizedIdentityEngine,
    decentralizedIdentityEngineConfig
} from './engines/decentralized-identity';

export {
    RegulatoryComplianceEngine,
    regulatoryComplianceEngineConfig
} from './engines/regulatory-compliance';

// React Components
export { default as StrategicWorkflowBuilder } from '../../components/strategic-engines/strategic-workflow-builder';

// Utility Functions
export const createDefaultCulturalContext = (
    language: 'ml' | 'en' | 'manglish' = 'ml',
    region: string = 'kerala-central'
) => ({
    language,
    region,
    culturalPreferences: {},
    festivalAwareness: true,
    localCustoms: {}
});

export const initializeStrategicEngines = async () => {
    try {
        const { strategicEngineOrchestrator } = await import('./orchestrator');
        const { hyperPersonalizationEngineConfig } = await import('./engines/hyper-personalization');
        const { autonomousDispatchEngineConfig } = await import('./engines/autonomous-dispatch');

        // Register Phase 1 engines
        await strategicEngineOrchestrator.registerEngine(hyperPersonalizationEngineConfig);
        await strategicEngineOrchestrator.registerEngine(autonomousDispatchEngineConfig); console.log('✅ Strategic Engines initialized successfully');
        console.log('📊 Phase 1 engines registered: Hyper-Personalization, Autonomous Dispatch');

        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Strategic Engines:', error);
        return false;
    }
};

export const getEngineHealthStatus = async () => {
    try {
        const { strategicEngineOrchestrator } = await import('./orchestrator');
        const health = await strategicEngineOrchestrator.healthCheck();
        return {
            overall: health.status,
            engines: health.engines,
            timestamp: health.lastChecked,
            systemMetrics: health.systemMetrics
        };
    } catch (error) {
        return {
            overall: 'unhealthy' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
        };
    }
};

// Engine Execution Helpers
export const executeHyperPersonalization = async (
    inputData: any,
    culturalContext?: any
) => {
    const { strategicEngineOrchestrator } = await import('./orchestrator');
    const context = culturalContext || createDefaultCulturalContext();
    return await strategicEngineOrchestrator.executeEngine(
        'hyper_personalization_v1',
        inputData,
        context
    );
};

export const executeAutonomousDispatch = async (
    inputData: any,
    culturalContext?: any
) => {
    const { strategicEngineOrchestrator } = await import('./orchestrator');
    const context = culturalContext || createDefaultCulturalContext();
    return await strategicEngineOrchestrator.executeEngine(
        'autonomous_dispatch_v1',
        inputData,
        context
    );
};// Constants
export const PROJECT_SAKSHAM_VERSION = '1.0.0';
export const SUPPORTED_LANGUAGES = ['ml', 'en', 'manglish'] as const;
export const SUPPORTED_REGIONS = ['kerala-north', 'kerala-central', 'kerala-south'] as const;

// Phase Information
export const PHASE_1_ENGINES = [
    'hyper_personalization_v1',
    'autonomous_dispatch_v1'
] as const;

export const IMPLEMENTATION_PHASES = {
    PHASE_1: {
        name: 'Vyapaar (Business Excellence)',
        duration: '0-12 months',
        engines: ['Hyper-Personalization', 'Autonomous Dispatch', 'Automated Resolution', 'Document Processing', 'Safety & Anomaly Detection'],
        target: 'Revenue optimization and operational efficiency'
    },
    PHASE_2: {
        name: 'Buddhi (Intelligence Amplification)',
        duration: '12-24 months',
        engines: ['Dynamic Empathy', 'Proactive Engagement', 'AI Copilot', 'Voice-First Architecture', 'Semantic Understanding'],
        target: 'Enhanced customer experience and AI-human collaboration'
    },
    PHASE_3: {
        name: 'Vistar (Market Expansion)',
        duration: '24-36 months',
        engines: ['Dynamic Pricing', 'Root Cause Analysis', 'Predictive Analytics', 'Market Intelligence', 'Autonomous Operations'],
        target: 'Market leadership and autonomous business operations'
    }
} as const;