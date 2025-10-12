// Enhanced Workflow Node Types
// Extended node definitions for Chain of Thought, Team Orchestration, and Polyglot Expansion

import React from 'react';
import {
    Brain,
    Users,
    Globe,
    MessageSquare,
    Target,
    GitBranch as Network,
    Zap as Lightbulb,
    CheckCircle,
    ArrowRight,
    Globe as Languages,
    Users as UserCheck,
    Zap,
    Star as Heart,
    Star,
    Shield
} from 'lucide-react';

// Extended node types for our new features
export const enhancedNodeTypes = {
    // Existing nodes (abbreviated for space)
    trigger: {
        icon: Zap,
        label: 'Trigger',
        color: 'bg-green-500',
        category: 'Input',
        description: 'Workflow entry point - triggers on phone calls, events, or schedules'
    },

    // Chain of Thought Processing Nodes
    cot_reasoning: {
        icon: Brain,
        label: 'CoT Reasoning',
        color: 'bg-purple-600',
        category: 'Reasoning',
        description: 'Step-by-step reasoning chain with cultural validation and Malayalam support',
        supportedLanguages: ['ml', 'en', 'hi'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high'
    },
    cot_validation: {
        icon: CheckCircle,
        label: 'CoT Validation',
        color: 'bg-purple-500',
        category: 'Reasoning',
        description: 'Validate reasoning chains for cultural appropriateness and logical consistency',
        supportedLanguages: ['ml', 'en', 'hi'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high'
    },
    cot_template: {
        icon: Lightbulb,
        label: 'CoT Template',
        color: 'bg-purple-400',
        category: 'Reasoning',
        description: 'Pre-built reasoning templates for common Malayalam business scenarios',
        supportedLanguages: ['ml', 'en'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'medium'
    },
    cultural_reasoning: {
        icon: Heart,
        label: 'Cultural Reasoning',
        color: 'bg-pink-600',
        category: 'Reasoning',
        description: 'Reasoning with deep Malayalam cultural context and Kerala-specific knowledge',
        supportedLanguages: ['ml'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high',
        malayalamSpecific: true
    },

    // Team Orchestration Nodes
    team_coordinator: {
        icon: Users,
        label: 'Team Coordinator',
        color: 'bg-blue-600',
        category: 'Collaboration',
        description: 'Coordinate multiple AI agents for collaborative task execution',
        supportedLanguages: ['ml', 'en', 'hi'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high'
    },
    agent_assignment: {
        icon: UserCheck,
        label: 'Agent Assignment',
        color: 'bg-blue-500',
        category: 'Collaboration',
        description: 'Intelligently assign tasks to AI agents based on capabilities and cultural context',
        supportedLanguages: ['ml', 'en'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high'
    },
    collective_decision: {
        icon: Target,
        label: 'Collective Decision',
        color: 'bg-blue-400',
        category: 'Collaboration',
        description: 'Multi-agent decision making with cultural consensus and Malayalam values',
        supportedLanguages: ['ml', 'en'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high',
        malayalamSpecific: true
    },
    team_communication: {
        icon: MessageSquare,
        label: 'Team Communication',
        color: 'bg-indigo-600',
        category: 'Collaboration',
        description: 'Agent-to-agent communication with cultural awareness and protocol management',
        supportedLanguages: ['ml', 'en', 'hi'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'medium'
    },

    // Polyglot Language Expansion Nodes
    polyglot_translator: {
        icon: Globe,
        label: 'Polyglot Translator',
        color: 'bg-emerald-600',
        category: 'Translation',
        description: 'Advanced translation with cultural adaptation for 100+ languages',
        supportedLanguages: ['100+ languages'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high'
    },
    cultural_adapter: {
        icon: Shield,
        label: 'Cultural Adapter',
        color: 'bg-emerald-500',
        category: 'Translation',
        description: 'Adapt content for cultural sensitivity, business etiquette, and local customs',
        supportedLanguages: ['ml', 'en', 'hi', 'ar', 'zh', 'es', 'fr'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high'
    },
    language_detector: {
        icon: Languages,
        label: 'Language Detector',
        color: 'bg-emerald-400',
        category: 'Translation',
        description: 'Automatically detect language and cultural context from input text',
        supportedLanguages: ['100+ languages'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'medium'
    },
    quality_assessor: {
        icon: Star,
        label: 'Quality Assessor',
        color: 'bg-teal-600',
        category: 'Translation',
        description: 'Assess translation quality, cultural appropriateness, and accuracy',
        supportedLanguages: ['ml', 'en', 'hi', 'ta', 'te'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high'
    },

    // Phase 4 Autonomous Intelligence Nodes
    autonomous_ops: {
        icon: Zap,
        label: 'Autonomous Ops',
        color: 'bg-orange-600',
        category: 'Autonomous',
        description: 'Fully autonomous business operations with Malayalam cultural intelligence',
        supportedLanguages: ['ml', 'en'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'maximum',
        malayalamSpecific: true
    },
    self_learning: {
        icon: Brain,
        label: 'Self Learning',
        color: 'bg-orange-500',
        category: 'Autonomous',
        description: 'Continuous learning and adaptation without human intervention',
        supportedLanguages: ['ml', 'en', 'hi'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'maximum'
    },
    predictive_intel: {
        icon: Target,
        label: 'Predictive Intel',
        color: 'bg-orange-400',
        category: 'Autonomous',
        description: 'Market and cultural trend prediction with 30-day forecasting',
        supportedLanguages: ['ml', 'en'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'high',
        malayalamSpecific: true
    },
    cultural_evolution: {
        icon: Heart,
        label: 'Cultural Evolution',
        color: 'bg-red-600',
        category: 'Autonomous',
        description: 'Monitor and adapt to Malayalam cultural changes and language evolution',
        supportedLanguages: ['ml'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'maximum',
        malayalamSpecific: true
    },

    // Integration and Orchestration Nodes
    platform_integration: {
        icon: Network,
        label: 'Platform Integration',
        color: 'bg-violet-600',
        category: 'Integration',
        description: 'Coordinate all systems: CoT, Team Orchestration, Polyglot, and Phase 4 Intelligence',
        supportedLanguages: ['ml', 'en', 'hi', 'ta', 'te'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'maximum'
    },
    strategic_orchestrator: {
        icon: Star,
        label: 'Strategic Orchestrator',
        color: 'bg-violet-500',
        category: 'Integration',
        description: 'High-level strategic decision making across all platform systems',
        supportedLanguages: ['ml', 'en'],
        culturalIntelligence: true,
        phase: 4,
        autonomyLevel: 'maximum',
        malayalamSpecific: true
    }
};

// Node categories with enhanced organization
export const nodeCategories = {
    'Input': {
        color: 'bg-green-100 border-green-300',
        description: 'Entry points and triggers',
        nodes: ['trigger', 'webhook']
    },
    'Processing': {
        color: 'bg-blue-100 border-blue-300',
        description: 'Core processing and AI',
        nodes: ['stt', 'nlu', 'agent', 'variable']
    },
    'Reasoning': {
        color: 'bg-purple-100 border-purple-300',
        description: 'Chain of Thought and cultural reasoning',
        nodes: ['cot_reasoning', 'cot_validation', 'cot_template', 'cultural_reasoning'],
        phase: 4,
        new: true
    },
    'Collaboration': {
        color: 'bg-blue-100 border-blue-300',
        description: 'Multi-agent team orchestration',
        nodes: ['team_coordinator', 'agent_assignment', 'collective_decision', 'team_communication'],
        phase: 4,
        new: true
    },
    'Translation': {
        color: 'bg-emerald-100 border-emerald-300',
        description: 'Global polyglot language expansion',
        nodes: ['polyglot_translator', 'cultural_adapter', 'language_detector', 'quality_assessor'],
        phase: 4,
        new: true
    },
    'Autonomous': {
        color: 'bg-orange-100 border-orange-300',
        description: 'Phase 4 autonomous intelligence',
        nodes: ['autonomous_ops', 'self_learning', 'predictive_intel', 'cultural_evolution'],
        phase: 4,
        new: true
    },
    'Integration': {
        color: 'bg-violet-100 border-violet-300',
        description: 'System integration and orchestration',
        nodes: ['platform_integration', 'strategic_orchestrator'],
        phase: 4,
        new: true
    },
    'Logic': {
        color: 'bg-yellow-100 border-yellow-300',
        description: 'Conditional logic and flow control',
        nodes: ['condition', 'loop', 'switch']
    },
    'Data': {
        color: 'bg-cyan-100 border-cyan-300',
        description: 'Data operations and transformations',
        nodes: ['data', 'transform']
    },
    'External': {
        color: 'bg-pink-100 border-pink-300',
        description: 'External integrations',
        nodes: ['api']
    },
    'Output': {
        color: 'bg-orange-100 border-orange-300',
        description: 'Output and communication',
        nodes: ['tts', 'sms', 'email']
    },
    'Analytics': {
        color: 'bg-gray-100 border-gray-300',
        description: 'Monitoring and analytics',
        nodes: ['analytics', 'log']
    },
    'Control': {
        color: 'bg-slate-100 border-slate-300',
        description: 'Flow control',
        nodes: ['delay', 'end']
    }
};

// Node configuration templates for new Phase 4 nodes
export const nodeConfigTemplates = {
    cot_reasoning: {
        reasoningDepth: 'deep',
        culturalValidation: true,
        malayalamSupport: true,
        templateId: '',
        customInstructions: '',
        outputFormat: 'structured'
    },
    cot_validation: {
        validationCriteria: ['logical_consistency', 'cultural_appropriateness', 'malayalam_accuracy'],
        strictMode: true,
        culturalContext: 'kerala',
        failureAction: 'retry'
    },
    team_coordinator: {
        maxAgents: 5,
        collaborationMode: 'hybrid',
        culturalSensitivity: 'high',
        decisionThreshold: 0.8,
        malayalamCoordination: true
    },
    agent_assignment: {
        assignmentStrategy: 'capability_based',
        culturalMatching: true,
        loadBalancing: true,
        specialization: ['customer_service', 'technical_support', 'cultural_guidance']
    },
    polyglot_translator: {
        sourceLanguage: 'auto',
        targetLanguages: ['ml', 'en', 'hi'],
        culturalAdaptation: true,
        qualityThreshold: 0.8,
        alternativeTranslations: 3
    },
    cultural_adapter: {
        adaptationLevel: 'comprehensive',
        culturalDatabase: 'global',
        tabooAvoidance: true,
        businessEtiquette: true,
        regionalCustoms: true
    },
    autonomous_ops: {
        autonomyLevel: 'high',
        decisionThreshold: 0.9,
        culturalValidation: true,
        malayalamFirst: true,
        escalationRules: []
    },
    platform_integration: {
        enabledSystems: ['cot', 'team', 'polyglot', 'autonomous'],
        orchestrationMode: 'intelligent',
        culturalPriority: 'malayalam',
        performanceOptimization: true
    }
};

// Enhanced node validation functions
export const validateEnhancedNode = (nodeType: string, config: any): boolean => {
    const template = nodeConfigTemplates[nodeType as keyof typeof nodeConfigTemplates];
    if (!template) return true; // No specific validation for unknown types

    switch (nodeType) {
        case 'cot_reasoning':
            return config.reasoningDepth && ['shallow', 'medium', 'deep', 'comprehensive'].includes(config.reasoningDepth);

        case 'team_coordinator':
            return config.maxAgents > 0 && config.maxAgents <= 10 && config.decisionThreshold >= 0 && config.decisionThreshold <= 1;

        case 'polyglot_translator':
            return config.targetLanguages && Array.isArray(config.targetLanguages) && config.targetLanguages.length > 0;

        case 'platform_integration':
            return config.enabledSystems && Array.isArray(config.enabledSystems) && config.enabledSystems.length > 0;

        default:
            return true;
    }
};

export const checkEnhancedNodeWarnings = (nodeType: string, config: any): string[] => {
    const warnings: string[] = [];

    switch (nodeType) {
        case 'cot_reasoning':
            if (!config.culturalValidation) {
                warnings.push('Cultural validation disabled - may affect Malayalam accuracy');
            }
            if (config.reasoningDepth === 'shallow') {
                warnings.push('Shallow reasoning may miss cultural nuances');
            }
            break;

        case 'team_coordinator':
            if (config.maxAgents > 7) {
                warnings.push('High agent count may increase coordination complexity');
            }
            if (!config.malayalamCoordination) {
                warnings.push('Malayalam coordination disabled');
            }
            break;

        case 'polyglot_translator':
            if (!config.culturalAdaptation) {
                warnings.push('Cultural adaptation disabled - translations may be culturally inappropriate');
            }
            if (config.qualityThreshold < 0.7) {
                warnings.push('Low quality threshold may produce poor translations');
            }
            break;

        case 'autonomous_ops':
            if (config.autonomyLevel === 'maximum' && !config.culturalValidation) {
                warnings.push('Maximum autonomy without cultural validation may be risky');
            }
            break;
    }

    return warnings;
};

// Phase 4 specific node properties
export const phase4NodeProperties = {
    culturalIntelligence: 'Advanced Malayalam cultural awareness with Kerala-specific knowledge',
    autonomyLevel: 'Self-operating systems with minimal human intervention',
    malayalamSpecific: 'Specialized for Malayalam language and culture',
    globalExpansion: 'Supports international Malayalam diaspora communities',
    swatantrataCapable: 'Part of Phase 4 Swatantrata (Autonomous Independence) system'
};

// Export combined node types
export const allNodeTypes = {
    ...enhancedNodeTypes
};

export default enhancedNodeTypes;