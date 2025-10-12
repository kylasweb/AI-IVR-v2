// Team Agent Orchestration Engine
// Core implementation for multi-agent collaboration and coordination

import {
    TeamAgent,
    TeamTask,
    TeamSession,
    AgentMessage,
    TeamDecision,
    TeamMetrics,
    TaskDistributionStrategy,
    CollaborationPattern,
    TeamEvent,
    TeamEventHandler,
    TeamConfiguration,
    AgentStatus,
    TaskStatus,
    DecisionStatus,
    SessionStatus,
    MessageType,
    VotingMethod,
    AgentType,
    TaskPriority,
    TaskComplexity
} from './types';
import { CulturalContext } from '../chain-of-thought/types';
import { EventEmitter } from 'events';

export class TeamOrchestrationEngine extends EventEmitter {
    private agents: Map<string, TeamAgent> = new Map();
    private sessions: Map<string, TeamSession> = new Map();
    private messageQueue: AgentMessage[] = [];
    private collaborationPatterns: Map<string, CollaborationPattern> = new Map();
    private eventHandlers: TeamEventHandler[] = [];
    private config: TeamConfiguration;

    constructor(config?: Partial<TeamConfiguration>) {
        super();
        this.config = this.mergeWithDefaults(config || {});
        this.initializeDefaultPatterns();
        this.setupMessageProcessing();
    }

    /**
     * Register a new agent in the team
     */
    async registerAgent(agent: Omit<TeamAgent, 'id'>): Promise<TeamAgent> {
        const newAgent: TeamAgent = {
            id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...agent,
            status: 'available',
            workload: 0,
            performance: {
                tasksCompleted: 0,
                successRate: 1.0,
                averageResponseTime: 1000,
                qualityScore: 0.8,
                collaborationScore: 0.8,
                culturalAccuracy: 0.9,
                lastUpdated: new Date()
            }
        };

        this.agents.set(newAgent.id, newAgent);
        this.emitEvent({ type: 'agent_joined', agent: newAgent });

        console.log(`🤖 Agent registered: ${newAgent.name} (${newAgent.type})`);
        return newAgent;
    }

    /**
     * Create a new team session
     */
    async createTeamSession(
        name: string,
        description: string,
        agentIds: string[],
        culturalContext: CulturalContext
    ): Promise<TeamSession> {
        const session: TeamSession = {
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            description,
            participants: agentIds.map(id => this.agents.get(id)!).filter(Boolean),
            tasks: [],
            decisions: [],
            messageHistory: [],
            status: 'planning',
            startTime: new Date(),
            culturalContext,
            objectives: [],
            outcomes: []
        };

        this.sessions.set(session.id, session);

        // Set participating agents to busy
        session.participants.forEach(agent => {
            agent.status = 'busy';
            this.agents.set(agent.id, agent);
        });

        console.log(`🎯 Team session created: ${name} with ${session.participants.length} agents`);
        return session;
    }

    /**
     * Distribute a task among team agents
     */
    async distributeTask(
        sessionId: string,
        task: Omit<TeamTask, 'id' | 'assignedAgents' | 'status' | 'progress'>
    ): Promise<TeamTask> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        const newTask: TeamTask = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...task,
            assignedAgents: [],
            status: 'pending',
            progress: 0,
            subtasks: task.subtasks || []
        };

        // Use intelligent task distribution
        const assignedAgents = await this.intelligentTaskDistribution(newTask, session);
        newTask.assignedAgents = assignedAgents.map(agent => agent.id);
        newTask.status = 'assigned';

        session.tasks.push(newTask);
        this.sessions.set(sessionId, session);

        // Notify assigned agents
        await this.notifyAgentsOfAssignment(assignedAgents, newTask, session);

        this.emitEvent({ type: 'task_created', task: newTask });
        this.emitEvent({ type: 'task_assigned', taskId: newTask.id, agentIds: newTask.assignedAgents });

        console.log(`📋 Task distributed: ${newTask.title} to ${assignedAgents.length} agents`);
        return newTask;
    }

    /**
     * Intelligent task distribution algorithm
     */
    private async intelligentTaskDistribution(
        task: TeamTask,
        session: TeamSession
    ): Promise<TeamAgent[]> {
        const availableAgents = session.participants.filter(agent =>
            agent.status === 'available' || agent.workload < 0.8
        );

        // Score agents based on multiple criteria
        const agentScores = availableAgents.map(agent => ({
            agent,
            score: this.calculateAgentSuitability(agent, task, session.culturalContext)
        }));

        // Sort by score and select best matches
        agentScores.sort((a, b) => b.score - a.score);

        // Determine optimal team size based on task complexity
        const teamSize = this.determineOptimalTeamSize(task);
        const selectedAgents = agentScores.slice(0, teamSize).map(item => item.agent);

        // Ensure cultural advisor is included for high cultural sensitivity tasks
        if (task.culturalSensitivity === 'high') {
            const culturalAdvisor = availableAgents.find(agent => agent.type === 'cultural_advisor');
            if (culturalAdvisor && !selectedAgents.includes(culturalAdvisor)) {
                selectedAgents.push(culturalAdvisor);
            }
        }

        return selectedAgents;
    }

    /**
     * Calculate agent suitability score for a task
     */
    private calculateAgentSuitability(
        agent: TeamAgent,
        task: TeamTask,
        culturalContext: CulturalContext
    ): number {
        let score = 0;

        // Skill match
        const skillMatch = task.skillsRequired.filter(skill =>
            agent.capabilities.includes(skill) || agent.specializations.includes(skill)
        ).length / Math.max(task.skillsRequired.length, 1);
        score += skillMatch * 0.3;

        // Workload balance
        const workloadScore = 1 - agent.workload;
        score += workloadScore * 0.2;

        // Performance history
        score += agent.performance.successRate * 0.15;
        score += agent.performance.qualityScore * 0.15;
        score += agent.performance.collaborationScore * 0.1;

        // Cultural alignment
        if (task.culturalSensitivity !== 'low') {
            score += agent.performance.culturalAccuracy * 0.1;
        }

        return score;
    }

    /**
     * Determine optimal team size based on task characteristics
     */
    private determineOptimalTeamSize(task: TeamTask): number {
        let baseSize = 1;

        // Adjust based on complexity
        switch (task.complexity) {
            case 'simple': baseSize = 1; break;
            case 'moderate': baseSize = 2; break;
            case 'complex': baseSize = 3; break;
            case 'expert': baseSize = 4; break;
        }

        // Adjust based on priority
        if (task.priority === 'critical') baseSize += 1;
        if (task.priority === 'high') baseSize += 0.5;

        // Adjust based on cultural sensitivity
        if (task.culturalSensitivity === 'high') baseSize += 1;

        return Math.min(Math.ceil(baseSize), this.config.maxAgents);
    }

    /**
     * Send message between agents
     */
    async sendMessage(
        fromAgentId: string,
        toAgentId: string | 'broadcast',
        messageType: MessageType,
        content: string,
        metadata?: Partial<AgentMessage['metadata']>
    ): Promise<AgentMessage> {
        const fromAgent = this.agents.get(fromAgentId);
        if (!fromAgent) {
            throw new Error(`Agent not found: ${fromAgentId}`);
        }

        const message: AgentMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromAgent: fromAgentId,
            toAgent: toAgentId,
            messageType,
            content,
            malayalamContent: await this.translateToMalayalam(content),
            metadata: {
                confidentialityLevel: 'team',
                actionRequired: false,
                ...metadata
            },
            timestamp: new Date(),
            priority: 'medium',
            requiresResponse: messageType === 'question' || messageType === 'collaboration_request',
            thread: metadata?.relatedTask
        };

        this.messageQueue.push(message);
        this.emitEvent({ type: 'message_sent', message });

        // Add to relevant session history
        const relevantSession = Array.from(this.sessions.values()).find(session =>
            session.participants.some(agent => agent.id === fromAgentId) ||
            (toAgentId !== 'broadcast' && session.participants.some(agent => agent.id === toAgentId))
        );

        if (relevantSession) {
            relevantSession.messageHistory.push(message);
            this.sessions.set(relevantSession.id, relevantSession);
        }

        console.log(`💬 Message sent: ${fromAgent.name} → ${toAgentId} (${messageType})`);
        return message;
    }

    /**
     * Create a team decision request
     */
    async createDecision(
        sessionId: string,
        topic: string,
        description: string,
        options: TeamDecision['options'],
        votingMethod: VotingMethod = 'weighted'
    ): Promise<TeamDecision> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        const decision: TeamDecision = {
            id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            topic,
            description,
            options,
            votingMethod,
            participatingAgents: session.participants.map(agent => agent.id),
            votes: [],
            status: 'open',
            deadline: new Date(Date.now() + this.config.decisionTimeout),
            reasoning: '',
            culturalConsiderations: this.extractCulturalConsiderations(description, session.culturalContext),
            created: new Date()
        };

        session.decisions.push(decision);
        this.sessions.set(sessionId, session);

        // Notify all agents about the decision
        await this.notifyAgentsOfDecision(session.participants, decision);

        this.emitEvent({ type: 'decision_requested', decision });

        console.log(`🗳️ Decision created: ${topic} with ${options.length} options`);
        return decision;
    }

    /**
     * Process agent vote on a decision
     */
    async submitVote(
        decisionId: string,
        agentId: string,
        optionId: string,
        reasoning: string,
        confidence: number
    ): Promise<void> {
        const session = Array.from(this.sessions.values()).find(s =>
            s.decisions.some(d => d.id === decisionId)
        );

        if (!session) {
            throw new Error(`Decision not found: ${decisionId}`);
        }

        const decision = session.decisions.find(d => d.id === decisionId);
        if (!decision) {
            throw new Error(`Decision not found: ${decisionId}`);
        }

        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        // Remove existing vote from this agent
        decision.votes = decision.votes.filter(vote => vote.agentId !== agentId);

        // Add new vote
        decision.votes.push({
            agentId,
            optionId,
            weight: this.calculateVotingWeight(agent, decision),
            reasoning,
            confidence,
            timestamp: new Date()
        });

        // Check if voting is complete
        if (decision.votes.length >= decision.participatingAgents.length) {
            await this.resolveDecision(decision, session);
        }

        this.sessions.set(session.id, session);
        console.log(`🗳️ Vote submitted: ${agent.name} voted on ${decision.topic}`);
    }

    /**
     * Resolve a completed decision
     */
    private async resolveDecision(decision: TeamDecision, session: TeamSession): Promise<void> {
        decision.status = 'reviewing';

        // Calculate weighted results
        const optionScores = new Map<string, number>();

        decision.options.forEach(option => {
            const votes = decision.votes.filter(vote => vote.optionId === option.id);
            const totalScore = votes.reduce((sum, vote) => sum + (vote.weight * vote.confidence), 0);
            optionScores.set(option.id, totalScore);
        });

        // Find winning option
        const winningOptionId = Array.from(optionScores.entries())
            .sort(([, a], [, b]) => b - a)[0][0];

        const winningOption = decision.options.find(opt => opt.id === winningOptionId);

        decision.finalDecision = winningOption?.title || 'No decision reached';
        decision.reasoning = this.generateDecisionReasoning(decision, optionScores);
        decision.status = 'decided';
        decision.resolved = new Date();

        // Notify all agents of the decision
        await this.notifyAgentsOfDecisionResult(session.participants, decision);

        this.emitEvent({ type: 'decision_made', decisionId: decision.id, result: decision.finalDecision });

        console.log(`✅ Decision resolved: ${decision.topic} → ${decision.finalDecision}`);
    }

    /**
     * Get comprehensive team metrics
     */
    async getTeamMetrics(sessionId: string): Promise<TeamMetrics> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        const completedTasks = session.tasks.filter(task => task.status === 'completed');
        const totalTasks = session.tasks.length;

        const agentUtilization: Record<string, number> = {};
        session.participants.forEach(agent => {
            agentUtilization[agent.id] = agent.workload;
        });

        return {
            sessionId,
            totalTasks,
            completedTasks: completedTasks.length,
            averageTaskDuration: this.calculateAverageTaskDuration(completedTasks),
            teamEfficiency: this.calculateTeamEfficiency(session),
            collaborationScore: this.calculateCollaborationScore(session),
            culturalAlignmentScore: this.calculateCulturalAlignment(session),
            communicationEffectiveness: this.calculateCommunicationEffectiveness(session),
            decisionQuality: this.calculateDecisionQuality(session),
            agentUtilization,
            bottlenecks: this.identifyBottlenecks(session),
            recommendations: this.generateRecommendations(session)
        };
    }

    /**
     * Initialize default collaboration patterns
     */
    private initializeDefaultPatterns(): void {
        // Problem-solving pattern
        this.collaborationPatterns.set('problem_solving', {
            id: 'problem_solving',
            name: 'Collaborative Problem Solving',
            description: 'Multi-agent approach to complex problem resolution',
            agentTypes: ['coordinator', 'analyst', 'specialist', 'cultural_advisor'],
            taskTypes: ['analysis', 'research', 'solution_design'],
            workflow: [
                {
                    step: 1,
                    action: 'Problem Analysis',
                    responsibleAgentType: 'analyst',
                    supportingAgentTypes: ['specialist'],
                    duration: 300000, // 5 minutes
                    requirements: ['Problem statement', 'Context data'],
                    outputs: ['Analysis report', 'Key insights']
                },
                {
                    step: 2,
                    action: 'Cultural Context Review',
                    responsibleAgentType: 'cultural_advisor',
                    supportingAgentTypes: ['coordinator'],
                    duration: 180000, // 3 minutes
                    requirements: ['Analysis report', 'Cultural context'],
                    outputs: ['Cultural considerations', 'Sensitivity assessment']
                },
                {
                    step: 3,
                    action: 'Solution Generation',
                    responsibleAgentType: 'specialist',
                    supportingAgentTypes: ['analyst', 'cultural_advisor'],
                    duration: 600000, // 10 minutes
                    requirements: ['Problem analysis', 'Cultural considerations'],
                    outputs: ['Solution options', 'Implementation plan']
                },
                {
                    step: 4,
                    action: 'Consensus Building',
                    responsibleAgentType: 'coordinator',
                    supportingAgentTypes: ['analyst', 'specialist', 'cultural_advisor'],
                    duration: 300000, // 5 minutes
                    requirements: ['Solution options', 'Team input'],
                    outputs: ['Final recommendation', 'Action plan']
                }
            ],
            culturalConsiderations: ['Respect for hierarchy', 'Consensus importance', 'Cultural sensitivity'],
            successCriteria: ['Problem resolved', 'Cultural alignment maintained', 'Team consensus achieved'],
            examples: ['Customer service escalation', 'Technical troubleshooting', 'Policy decisions']
        });

        // Creative collaboration pattern
        this.collaborationPatterns.set('creative_collaboration', {
            id: 'creative_collaboration',
            name: 'Creative Team Collaboration',
            description: 'Multi-agent creative ideation and development',
            agentTypes: ['creative', 'analyst', 'cultural_advisor', 'validator'],
            taskTypes: ['brainstorming', 'design', 'content_creation'],
            workflow: [
                {
                    step: 1,
                    action: 'Ideation Phase',
                    responsibleAgentType: 'creative',
                    supportingAgentTypes: ['cultural_advisor'],
                    duration: 900000, // 15 minutes
                    requirements: ['Creative brief', 'Cultural context'],
                    outputs: ['Initial concepts', 'Creative directions']
                },
                {
                    step: 2,
                    action: 'Feasibility Analysis',
                    responsibleAgentType: 'analyst',
                    supportingAgentTypes: ['creative'],
                    duration: 600000, // 10 minutes
                    requirements: ['Creative concepts', 'Resource constraints'],
                    outputs: ['Feasibility assessment', 'Resource requirements']
                },
                {
                    step: 3,
                    action: 'Cultural Validation',
                    responsibleAgentType: 'cultural_advisor',
                    supportingAgentTypes: ['creative', 'analyst'],
                    duration: 300000, // 5 minutes
                    requirements: ['Concepts', 'Cultural guidelines'],
                    outputs: ['Cultural approval', 'Adaptation suggestions']
                },
                {
                    step: 4,
                    action: 'Quality Review',
                    responsibleAgentType: 'validator',
                    supportingAgentTypes: ['creative', 'cultural_advisor'],
                    duration: 300000, // 5 minutes
                    requirements: ['Final concepts', 'Quality standards'],
                    outputs: ['Quality assessment', 'Final recommendations']
                }
            ],
            culturalConsiderations: ['Artistic traditions', 'Cultural symbols', 'Community values'],
            successCriteria: ['Creative objectives met', 'Cultural appropriateness', 'Quality standards achieved'],
            examples: ['Marketing campaigns', 'Content creation', 'Product design']
        });
    }

    /**
     * Setup message processing system
     */
    private setupMessageProcessing(): void {
        // Process message queue every second
        setInterval(() => {
            this.processMessageQueue();
        }, 1000);
    }

    /**
     * Process pending messages
     */
    private processMessageQueue(): void {
        const messagesToProcess = this.messageQueue.splice(0, 10); // Process up to 10 messages at a time

        messagesToProcess.forEach(async (message) => {
            try {
                await this.routeMessage(message);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });
    }

    /**
     * Route message to appropriate handler
     */
    private async routeMessage(message: AgentMessage): Promise<void> {
        // Simulate message routing and processing
        if (message.toAgent === 'broadcast') {
            // Handle broadcast messages
            console.log(`📢 Broadcasting message: ${message.content.substring(0, 50)}...`);
        } else {
            // Handle direct messages
            const toAgent = this.agents.get(message.toAgent);
            if (toAgent) {
                console.log(`📬 Message delivered to ${toAgent.name}: ${message.content.substring(0, 50)}...`);

                // Auto-generate response for certain message types
                if (message.requiresResponse) {
                    setTimeout(() => {
                        this.generateAutoResponse(message, toAgent);
                    }, Math.random() * 5000 + 1000); // 1-6 seconds delay
                }
            }
        }
    }

    /**
     * Generate automatic response from agent
     */
    private async generateAutoResponse(originalMessage: AgentMessage, respondingAgent: TeamAgent): Promise<void> {
        let responseContent = '';

        switch (originalMessage.messageType) {
            case 'question':
                responseContent = `Based on my expertise in ${respondingAgent.specializations.join(', ')}, I believe...`;
                break;
            case 'collaboration_request':
                responseContent = `I'm available to collaborate on this task. My relevant capabilities include ${respondingAgent.capabilities.slice(0, 3).join(', ')}.`;
                break;
            case 'task_assignment':
                responseContent = `Task received and understood. I'll begin work immediately with an estimated completion time of...`;
                break;
            default:
                responseContent = 'Message acknowledged. Thank you for the information.';
        }

        await this.sendMessage(
            respondingAgent.id,
            originalMessage.fromAgent,
            'answer',
            responseContent,
            {
                relatedTask: originalMessage.metadata.relatedTask,
                confidentialityLevel: originalMessage.metadata.confidentialityLevel
            }
        );
    }

    // Helper methods
    private mergeWithDefaults(config: Partial<TeamConfiguration>): TeamConfiguration {
        return {
            maxAgents: 10,
            maxConcurrentTasks: 20,
            defaultTaskTimeout: 3600000, // 1 hour
            communicationTimeout: 300000, // 5 minutes
            decisionTimeout: 1800000, // 30 minutes
            culturalValidationRequired: true,
            allowedAgentTypes: ['coordinator', 'specialist', 'generalist', 'cultural_advisor', 'validator', 'translator', 'analyst', 'creative', 'executor'],
            distributionStrategy: {
                name: 'Hybrid Intelligent',
                description: 'AI-powered task distribution with cultural optimization',
                algorithm: 'hybrid_intelligent',
                criteria: {
                    skillMatch: 0.3,
                    workloadBalance: 0.2,
                    culturalAlignment: 0.15,
                    responseTime: 0.1,
                    qualityHistory: 0.15,
                    collaborationHistory: 0.1
                },
                culturalFactors: ['Regional expertise', 'Language proficiency', 'Cultural sensitivity'],
                weightings: { expertise: 0.4, availability: 0.3, cultural: 0.3 }
            },
            escalationRules: [
                {
                    condition: 'task_overdue',
                    action: 'notify_lead',
                    threshold: 1.2,
                    agents: []
                },
                {
                    condition: 'quality_below_threshold',
                    action: 'add_support',
                    threshold: 0.7,
                    agents: []
                }
            ],
            ...config
        };
    }

    private async translateToMalayalam(text: string): Promise<string> {
        // Placeholder for Malayalam translation
        return `[ML: ${text}]`;
    }

    private async notifyAgentsOfAssignment(agents: TeamAgent[], task: TeamTask, session: TeamSession): Promise<void> {
        for (const agent of agents) {
            await this.sendMessage(
                'system',
                agent.id,
                'task_assignment',
                `New task assigned: ${task.title}. Priority: ${task.priority}. Estimated duration: ${task.estimatedDuration}ms.`,
                {
                    relatedTask: task.id,
                    actionRequired: true,
                    confidentialityLevel: 'team'
                }
            );
        }
    }

    private async notifyAgentsOfDecision(agents: TeamAgent[], decision: TeamDecision): Promise<void> {
        for (const agent of agents) {
            await this.sendMessage(
                'system',
                agent.id,
                'collaboration_request',
                `Decision required: ${decision.topic}. Please review options and submit your vote.`,
                {
                    actionRequired: true,
                    confidentialityLevel: 'team'
                }
            );
        }
    }

    private async notifyAgentsOfDecisionResult(agents: TeamAgent[], decision: TeamDecision): Promise<void> {
        for (const agent of agents) {
            await this.sendMessage(
                'system',
                agent.id,
                'completion_notification',
                `Decision resolved: ${decision.topic} → ${decision.finalDecision}`,
                {
                    confidentialityLevel: 'team'
                }
            );
        }
    }

    private extractCulturalConsiderations(description: string, context: CulturalContext): string[] {
        const considerations: string[] = [];

        if (context.respectLevel === 'elder') {
            considerations.push('Maintain appropriate respect for elder involvement');
        }

        if (context.familyStructure === 'joint') {
            considerations.push('Consider impact on extended family');
        }

        if (context.festivalContext) {
            considerations.push(`Festival context: ${context.festivalContext}`);
        }

        return considerations;
    }

    private calculateVotingWeight(agent: TeamAgent, decision: TeamDecision): number {
        let weight = 1.0;

        // Adjust based on agent role
        switch (agent.role) {
            case 'team_lead': weight = 1.5; break;
            case 'senior_specialist': weight = 1.3; break;
            case 'specialist': weight = 1.1; break;
            case 'support': weight = 0.8; break;
        }

        // Adjust based on performance
        weight *= agent.performance.successRate;

        return Math.min(weight, 2.0); // Cap at 2.0
    }

    private generateDecisionReasoning(decision: TeamDecision, scores: Map<string, number>): string {
        const sortedOptions = Array.from(scores.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([id, score]) => {
                const option = decision.options.find(opt => opt.id === id);
                return `${option?.title}: ${score.toFixed(2)}`;
            });

        return `Decision based on weighted voting: ${sortedOptions.join(', ')}`;
    }

    // Metric calculation methods
    private calculateAverageTaskDuration(tasks: TeamTask[]): number {
        if (tasks.length === 0) return 0;
        const totalDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
        return totalDuration / tasks.length;
    }

    private calculateTeamEfficiency(session: TeamSession): number {
        const completedTasks = session.tasks.filter(task => task.status === 'completed').length;
        const totalTasks = session.tasks.length;
        return totalTasks > 0 ? completedTasks / totalTasks : 1.0;
    }

    private calculateCollaborationScore(session: TeamSession): number {
        const totalMessages = session.messageHistory.length;
        const collaborativeMessages = session.messageHistory.filter(msg =>
            ['collaboration_request', 'question', 'answer'].includes(msg.messageType)
        ).length;

        return totalMessages > 0 ? collaborativeMessages / totalMessages : 0.5;
    }

    private calculateCulturalAlignment(session: TeamSession): number {
        const culturalMessages = session.messageHistory.filter(msg =>
            msg.messageType === 'cultural_guidance' ||
            msg.metadata.culturalContext !== undefined
        ).length;

        const totalMessages = session.messageHistory.length;
        return totalMessages > 0 ? Math.min(culturalMessages / totalMessages * 2, 1.0) : 0.8;
    }

    private calculateCommunicationEffectiveness(session: TeamSession): number {
        const questionsAsked = session.messageHistory.filter(msg => msg.messageType === 'question').length;
        const answersProvided = session.messageHistory.filter(msg => msg.messageType === 'answer').length;

        return questionsAsked > 0 ? Math.min(answersProvided / questionsAsked, 1.0) : 1.0;
    }

    private calculateDecisionQuality(session: TeamSession): number {
        const completedDecisions = session.decisions.filter(d => d.status === 'decided').length;
        const totalDecisions = session.decisions.length;
        return totalDecisions > 0 ? completedDecisions / totalDecisions : 1.0;
    }

    private identifyBottlenecks(session: TeamSession): string[] {
        const bottlenecks: string[] = [];

        // Check for overloaded agents
        const overloadedAgents = session.participants.filter(agent => agent.workload > 0.9);
        if (overloadedAgents.length > 0) {
            bottlenecks.push(`Overloaded agents: ${overloadedAgents.map(a => a.name).join(', ')}`);
        }

        // Check for stalled tasks
        const stalledTasks = session.tasks.filter(task =>
            task.status === 'in_progress' &&
            Date.now() - new Date(task.metadata?.startedAt || 0).getTime() > 3600000
        );
        if (stalledTasks.length > 0) {
            bottlenecks.push(`Stalled tasks: ${stalledTasks.length} tasks overdue`);
        }

        return bottlenecks;
    }

    private generateRecommendations(session: TeamSession): string[] {
        const recommendations: string[] = [];

        const efficiency = this.calculateTeamEfficiency(session);
        if (efficiency < 0.8) {
            recommendations.push('Consider redistributing tasks to improve efficiency');
        }

        const collaborationScore = this.calculateCollaborationScore(session);
        if (collaborationScore < 0.6) {
            recommendations.push('Encourage more collaborative communication between agents');
        }

        const culturalAlignment = this.calculateCulturalAlignment(session);
        if (culturalAlignment < 0.7) {
            recommendations.push('Increase cultural context consideration in task execution');
        }

        return recommendations;
    }

    private emitEvent(event: TeamEvent): void {
        this.emit('team_event', event);
        this.eventHandlers.forEach(handler => {
            try {
                handler.onEvent(event);
            } catch (error) {
                console.error('Error in team event handler:', error);
            }
        });
    }

    // Public API methods
    addEventHandler(handler: TeamEventHandler): void {
        this.eventHandlers.push(handler);
    }

    removeEventHandler(handler: TeamEventHandler): void {
        const index = this.eventHandlers.indexOf(handler);
        if (index > -1) {
            this.eventHandlers.splice(index, 1);
        }
    }

    getAgent(agentId: string): TeamAgent | undefined {
        return this.agents.get(agentId);
    }

    getSession(sessionId: string): TeamSession | undefined {
        return this.sessions.get(sessionId);
    }

    listAgents(): TeamAgent[] {
        return Array.from(this.agents.values());
    }

    listSessions(): TeamSession[] {
        return Array.from(this.sessions.values());
    }

    getCollaborationPattern(patternId: string): CollaborationPattern | undefined {
        return this.collaborationPatterns.get(patternId);
    }

    listCollaborationPatterns(): CollaborationPattern[] {
        return Array.from(this.collaborationPatterns.values());
    }
}

export default TeamOrchestrationEngine;