// Team Agent Orchestration System
// Types and interfaces for multi-agent collaboration

import { CulturalContext } from '../chain-of-thought/types';

export interface TeamAgent {
    id: string;
    name: string;
    type: AgentType;
    role: AgentRole;
    capabilities: string[];
    specializations: string[];
    status: AgentStatus;
    workload: number; // 0-1 scale
    performance: AgentPerformance;
    culturalContext: CulturalContext;
    communicationPreferences: CommunicationPreferences;
    metadata: Record<string, any>;
}

export type AgentType =
    | 'coordinator'      // Orchestrates team activities
    | 'specialist'       // Domain expert
    | 'generalist'       // Handles diverse tasks
    | 'cultural_advisor' // Cultural context expert
    | 'validator'        // Quality assurance
    | 'translator'       // Language services
    | 'analyst'          // Data analysis
    | 'creative'         // Creative problem solving
    | 'executor'         // Task execution;

export type AgentRole =
    | 'team_lead'
    | 'senior_specialist'
    | 'specialist'
    | 'support'
    | 'observer';

export type AgentStatus =
    | 'available'
    | 'busy'
    | 'offline'
    | 'maintenance'
    | 'overloaded';

export interface AgentPerformance {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
    qualityScore: number;
    collaborationScore: number;
    culturalAccuracy: number;
    lastUpdated: Date;
}

export interface CommunicationPreferences {
    preferredLanguages: string[];
    communicationStyle: 'formal' | 'casual' | 'technical' | 'cultural';
    responseTimeExpectation: number; // milliseconds
    escalationThreshold: number;
}

export interface TeamTask {
    id: string;
    title: string;
    description: string;
    malayalamDescription?: string;
    priority: TaskPriority;
    complexity: TaskComplexity;
    estimatedDuration: number;
    skillsRequired: string[];
    culturalSensitivity: 'low' | 'medium' | 'high';
    deadline?: Date;
    dependencies: string[]; // Other task IDs
    subtasks: SubTask[];
    assignedAgents: string[]; // Agent IDs
    status: TaskStatus;
    progress: number; // 0-100
    metadata: Record<string, any>;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'expert';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'failed' | 'cancelled';

export interface SubTask {
    id: string;
    title: string;
    description: string;
    assignedAgent?: string;
    status: TaskStatus;
    estimatedDuration: number;
    actualDuration?: number;
    dependencies: string[];
}

export interface AgentMessage {
    id: string;
    fromAgent: string;
    toAgent: string | 'broadcast';
    messageType: MessageType;
    content: string;
    malayalamContent?: string;
    metadata: MessageMetadata;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requiresResponse: boolean;
    responseDeadline?: Date;
    thread?: string; // For message threading
}

export type MessageType =
    | 'task_assignment'
    | 'task_update'
    | 'question'
    | 'answer'
    | 'collaboration_request'
    | 'status_update'
    | 'escalation'
    | 'cultural_guidance'
    | 'validation_request'
    | 'completion_notification';

export interface MessageMetadata {
    relatedTask?: string;
    culturalContext?: CulturalContext;
    attachments?: string[];
    actionRequired?: boolean;
    confidentialityLevel?: 'public' | 'team' | 'private';
}

export interface TeamDecision {
    id: string;
    topic: string;
    description: string;
    options: DecisionOption[];
    votingMethod: VotingMethod;
    participatingAgents: string[];
    votes: AgentVote[];
    status: DecisionStatus;
    deadline: Date;
    finalDecision?: string;
    reasoning: string;
    culturalConsiderations: string[];
    created: Date;
    resolved?: Date;
}

export interface DecisionOption {
    id: string;
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    culturalImpact: string;
    feasibility: number; // 0-1 scale
    cost: number;
    timeline: number;
}

export interface AgentVote {
    agentId: string;
    optionId: string;
    weight: number; // Based on agent expertise and role
    reasoning: string;
    confidence: number;
    culturalNotes?: string;
    timestamp: Date;
}

export type VotingMethod =
    | 'simple_majority'
    | 'weighted'
    | 'consensus'
    | 'expert_override'
    | 'cultural_priority';

export type DecisionStatus =
    | 'open'
    | 'voting'
    | 'reviewing'
    | 'decided'
    | 'cancelled';

export interface TeamSession {
    id: string;
    name: string;
    description: string;
    participants: TeamAgent[];
    tasks: TeamTask[];
    decisions: TeamDecision[];
    messageHistory: AgentMessage[];
    status: SessionStatus;
    startTime: Date;
    endTime?: Date;
    culturalContext: CulturalContext;
    objectives: string[];
    outcomes: SessionOutcome[];
}

export type SessionStatus =
    | 'planning'
    | 'active'
    | 'paused'
    | 'reviewing'
    | 'completed'
    | 'cancelled';

export interface SessionOutcome {
    type: 'task_completed' | 'decision_made' | 'knowledge_gained' | 'process_improved';
    description: string;
    impact: 'low' | 'medium' | 'high';
    agents_involved: string[];
    metrics: Record<string, number>;
}

export interface TeamMetrics {
    sessionId: string;
    totalTasks: number;
    completedTasks: number;
    averageTaskDuration: number;
    teamEfficiency: number;
    collaborationScore: number;
    culturalAlignmentScore: number;
    communicationEffectiveness: number;
    decisionQuality: number;
    agentUtilization: Record<string, number>;
    bottlenecks: string[];
    recommendations: string[];
}

export interface CollaborationPattern {
    id: string;
    name: string;
    description: string;
    agentTypes: AgentType[];
    taskTypes: string[];
    workflow: CollaborationStep[];
    culturalConsiderations: string[];
    successCriteria: string[];
    examples: string[];
}

export interface CollaborationStep {
    step: number;
    action: string;
    responsibleAgentType: AgentType;
    supportingAgentTypes: AgentType[];
    duration: number;
    requirements: string[];
    outputs: string[];
}

export interface TaskDistributionStrategy {
    name: string;
    description: string;
    algorithm: DistributionAlgorithm;
    criteria: DistributionCriteria;
    culturalFactors: string[];
    weightings: Record<string, number>;
}

export type DistributionAlgorithm =
    | 'round_robin'
    | 'capability_based'
    | 'workload_balanced'
    | 'expertise_weighted'
    | 'cultural_optimized'
    | 'hybrid_intelligent';

export interface DistributionCriteria {
    skillMatch: number;
    workloadBalance: number;
    culturalAlignment: number;
    responseTime: number;
    qualityHistory: number;
    collaborationHistory: number;
}

// Event types for team coordination
export type TeamEvent =
    | { type: 'agent_joined'; agent: TeamAgent }
    | { type: 'agent_left'; agentId: string }
    | { type: 'task_created'; task: TeamTask }
    | { type: 'task_assigned'; taskId: string; agentIds: string[] }
    | { type: 'task_completed'; taskId: string; result: any }
    | { type: 'message_sent'; message: AgentMessage }
    | { type: 'decision_requested'; decision: TeamDecision }
    | { type: 'decision_made'; decisionId: string; result: string }
    | { type: 'collaboration_started'; pattern: string }
    | { type: 'session_status_changed'; sessionId: string; status: SessionStatus };

export interface TeamEventHandler {
    onEvent(event: TeamEvent): void | Promise<void>;
}

export interface TeamConfiguration {
    maxAgents: number;
    maxConcurrentTasks: number;
    defaultTaskTimeout: number;
    communicationTimeout: number;
    decisionTimeout: number;
    culturalValidationRequired: boolean;
    allowedAgentTypes: AgentType[];
    distributionStrategy: TaskDistributionStrategy;
    escalationRules: EscalationRule[];
}

export interface EscalationRule {
    condition: string;
    action: 'notify_lead' | 'reassign_task' | 'add_support' | 'pause_task' | 'escalate_decision';
    threshold: number;
    agents: string[];
}