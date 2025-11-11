// Autonomous Intelligence Cluster - Phase 4
// Swatantrata - स्वतंत्रता (Autonomous Independence)
// Export all autonomous intelligence engines

import { createSelfLearningAdaptationEngine } from './self-learning-adaptation';
import { createPredictiveIntelligenceEngine } from './predictive-intelligence';
import { createAutonomousOperationsEngine } from './autonomous-operations';
import { createCulturalEvolutionEngine } from './cultural-evolution';

export {
    SelfLearningAdaptationEngine,
    createSelfLearningAdaptationEngine,
    type SelfLearningAdaptationConfig,
    type LearningMetrics,
    type AdaptationEvent
} from './self-learning-adaptation';

export {
    PredictiveIntelligenceEngine,
    createPredictiveIntelligenceEngine,
    type PredictiveIntelligenceConfig,
    type PredictionMetrics,
    type MarketIntelligence,
    type CulturalIntelligence
} from './predictive-intelligence';

export {
    AutonomousOperationsEngine,
    createAutonomousOperationsEngine,
    type AutonomousOperationsConfig,
    type OperationalMetrics,
    type BusinessProcess,
    type ResourceAllocation,
    type CrisisEvent
} from './autonomous-operations';

export {
    CulturalEvolutionEngine,
    createCulturalEvolutionEngine,
    type CulturalEvolutionConfig,
    type CulturalMetrics,
    type LanguagePattern,
    type CulturalEvent,
    type DialectVariation
} from './cultural-evolution';

// Cluster factory function
export function createAutonomousIntelligenceCluster() {
    return {
        selfLearningAdaptation: createSelfLearningAdaptationEngine(),
        predictiveIntelligence: createPredictiveIntelligenceEngine(),
        autonomousOperations: createAutonomousOperationsEngine(),
        culturalEvolution: createCulturalEvolutionEngine()
    };
}

// Cluster information
export const AUTONOMOUS_INTELLIGENCE_CLUSTER = {
    name: 'Autonomous Intelligence Cluster',
    phase: 'Phase 4 - Swatantrata',
    description: 'Self-learning and predictive engines with Malayalam cultural intelligence',
    engines: [
        'Self-Learning Adaptation Engine',
        'Predictive Intelligence Engine',
        'Autonomous Operations Engine',
        'Cultural Evolution Monitoring Engine'
    ],
    autonomyLevel: 'Fully Autonomous',
    culturalIntelligence: 'Advanced Malayalam Cultural Awareness',
    capabilities: [
        'Self-Learning and Adaptation',
        'Market and Cultural Prediction',
        'Autonomous Business Operations',
        'Real-time Cultural Evolution Tracking'
    ]
} as const;