// Team Orchestration API Routes
// RESTful endpoints for multi-agent collaboration and coordination

import { NextRequest, NextResponse } from 'next/server';
import TeamOrchestrationEngine from '@/features/team-orchestration/engine';
import { z } from 'zod';

// Input validation schemas
const RegisterAgentSchema = z.object({
    name: z.string().min(1, 'Agent name is required'),
    type: z.enum(['coordinator', 'specialist', 'generalist', 'cultural_advisor', 'validator', 'translator', 'analyst', 'creative', 'executor']),
    role: z.enum(['team_lead', 'senior_specialist', 'specialist', 'support', 'observer']),
    capabilities: z.array(z.string()),
    specializations: z.array(z.string()),
    culturalContext: z.object({
        region: z.string().default('kerala'),
        dialect: z.string().optional(),
        respectLevel: z.enum(['formal', 'informal', 'elder', 'peer']).default('formal'),
        festivalContext: z.string().optional(),
        familyStructure: z.enum(['nuclear', 'joint', 'extended']).optional(),
        religiousContext: z.string().optional(),
        socialNorms: z.array(z.string()).default([])
    }),
    communicationPreferences: z.object({
        preferredLanguages: z.array(z.string()).default(['en', 'ml']),
        communicationStyle: z.enum(['formal', 'casual', 'technical', 'cultural']).default('formal'),
        responseTimeExpectation: z.number().min(1000).max(300000).default(30000),
        escalationThreshold: z.number().min(0.1).max(1.0).default(0.8)
    }).default({})
});

const CreateSessionSchema = z.object({
    name: z.string().min(1, 'Session name is required'),
    description: z.string().min(1, 'Description is required'),
    agentIds: z.array(z.string()).min(1, 'At least one agent is required'),
    culturalContext: z.object({
        region: z.string().default('kerala'),
        dialect: z.string().optional(),
        respectLevel: z.enum(['formal', 'informal', 'elder', 'peer']).default('formal'),
        festivalContext: z.string().optional(),
        familyStructure: z.enum(['nuclear', 'joint', 'extended']).optional(),
        religiousContext: z.string().optional(),
        socialNorms: z.array(z.string()).default([])
    })
});

const CreateTaskSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    title: z.string().min(1, 'Task title is required'),
    description: z.string().min(1, 'Task description is required'),
    malayalamDescription: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    complexity: z.enum(['simple', 'moderate', 'complex', 'expert']).default('moderate'),
    estimatedDuration: z.number().min(60000).max(86400000).default(1800000), // 1 minute to 24 hours
    skillsRequired: z.array(z.string()).default([]),
    culturalSensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
    deadline: z.string().datetime().optional(),
    dependencies: z.array(z.string()).default([]),
    subtasks: z.array(z.object({
        title: z.string(),
        description: z.string(),
        estimatedDuration: z.number(),
        dependencies: z.array(z.string()).default([])
    })).default([])
});

const SendMessageSchema = z.object({
    fromAgentId: z.string().min(1, 'From agent ID is required'),
    toAgentId: z.string().min(1, 'To agent ID is required'), // Can be 'broadcast'
    messageType: z.enum(['task_assignment', 'task_update', 'question', 'answer', 'collaboration_request', 'status_update', 'escalation', 'cultural_guidance', 'validation_request', 'completion_notification']),
    content: z.string().min(1, 'Message content is required'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    requiresResponse: z.boolean().default(false),
    metadata: z.object({
        relatedTask: z.string().optional(),
        actionRequired: z.boolean().default(false),
        confidentialityLevel: z.enum(['public', 'team', 'private']).default('team')
    }).default({})
});

const CreateDecisionSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    topic: z.string().min(1, 'Decision topic is required'),
    description: z.string().min(1, 'Decision description is required'),
    options: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        pros: z.array(z.string()).default([]),
        cons: z.array(z.string()).default([]),
        culturalImpact: z.string().default(''),
        feasibility: z.number().min(0).max(1).default(0.5),
        cost: z.number().min(0).default(0),
        timeline: z.number().min(0).default(0)
    })).min(2, 'At least two options are required'),
    votingMethod: z.enum(['simple_majority', 'weighted', 'consensus', 'expert_override', 'cultural_priority']).default('weighted')
});

const SubmitVoteSchema = z.object({
    decisionId: z.string().min(1, 'Decision ID is required'),
    agentId: z.string().min(1, 'Agent ID is required'),
    optionId: z.string().min(1, 'Option ID is required'),
    reasoning: z.string().min(1, 'Vote reasoning is required'),
    confidence: z.number().min(0.1).max(1.0),
    culturalNotes: z.string().optional()
});

// Global team orchestration engine
const teamEngine = new TeamOrchestrationEngine();

// POST /api/team-orchestration - Various team operations
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'register_agent':
                const agentData = RegisterAgentSchema.parse(body.data);
                const agent = await teamEngine.registerAgent({
                    name: agentData.name,
                    type: agentData.type,
                    role: agentData.role,
                    capabilities: agentData.capabilities,
                    specializations: agentData.specializations,
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
                    },
                    culturalContext: agentData.culturalContext,
                    communicationPreferences: agentData.communicationPreferences,
                    metadata: {}
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Agent registered successfully',
                        agent: {
                            id: agent.id,
                            name: agent.name,
                            type: agent.type,
                            role: agent.role,
                            status: agent.status,
                            capabilities: agent.capabilities,
                            specializations: agent.specializations
                        }
                    }
                });

            case 'create_session':
                const sessionData = CreateSessionSchema.parse(body.data);
                const session = await teamEngine.createTeamSession(
                    sessionData.name,
                    sessionData.description,
                    sessionData.agentIds,
                    sessionData.culturalContext
                );

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Team session created successfully',
                        session: {
                            id: session.id,
                            name: session.name,
                            description: session.description,
                            participants: session.participants.map(p => ({
                                id: p.id,
                                name: p.name,
                                type: p.type,
                                role: p.role
                            })),
                            status: session.status,
                            startTime: session.startTime,
                            culturalContext: session.culturalContext
                        }
                    }
                });

            case 'create_task':
                const taskData = CreateTaskSchema.parse(body.data);
                const task = await teamEngine.distributeTask(taskData.sessionId, {
                    title: taskData.title,
                    description: taskData.description,
                    malayalamDescription: taskData.malayalamDescription,
                    priority: taskData.priority,
                    complexity: taskData.complexity,
                    estimatedDuration: taskData.estimatedDuration,
                    skillsRequired: taskData.skillsRequired,
                    culturalSensitivity: taskData.culturalSensitivity,
                    deadline: taskData.deadline ? new Date(taskData.deadline) : undefined,
                    dependencies: taskData.dependencies,
                    subtasks: taskData.subtasks.map(st => ({
                        id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        title: st.title,
                        description: st.description,
                        status: 'pending' as any,
                        estimatedDuration: st.estimatedDuration,
                        dependencies: st.dependencies
                    })),
                    metadata: {}
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Task created and distributed successfully',
                        task: {
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            priority: task.priority,
                            complexity: task.complexity,
                            status: task.status,
                            assignedAgents: task.assignedAgents,
                            progress: task.progress,
                            subtasks: task.subtasks
                        }
                    }
                });

            case 'send_message':
                const messageData = SendMessageSchema.parse(body.data);
                const message = await teamEngine.sendMessage(
                    messageData.fromAgentId,
                    messageData.toAgentId,
                    messageData.messageType,
                    messageData.content,
                    messageData.metadata
                );

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Message sent successfully',
                        messageInfo: {
                            id: message.id,
                            fromAgent: message.fromAgent,
                            toAgent: message.toAgent,
                            messageType: message.messageType,
                            timestamp: message.timestamp,
                            priority: message.priority
                        }
                    }
                });

            case 'create_decision':
                const decisionData = CreateDecisionSchema.parse(body.data);
                const decision = await teamEngine.createDecision(
                    decisionData.sessionId,
                    decisionData.topic,
                    decisionData.description,
                    decisionData.options,
                    decisionData.votingMethod
                );

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Decision created successfully',
                        decision: {
                            id: decision.id,
                            topic: decision.topic,
                            description: decision.description,
                            options: decision.options,
                            votingMethod: decision.votingMethod,
                            status: decision.status,
                            deadline: decision.deadline,
                            participatingAgents: decision.participatingAgents
                        }
                    }
                });

            case 'submit_vote':
                const voteData = SubmitVoteSchema.parse(body.data);
                await teamEngine.submitVote(
                    voteData.decisionId,
                    voteData.agentId,
                    voteData.optionId,
                    voteData.reasoning,
                    voteData.confidence
                );

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Vote submitted successfully',
                        vote: {
                            decisionId: voteData.decisionId,
                            agentId: voteData.agentId,
                            optionId: voteData.optionId,
                            confidence: voteData.confidence
                        }
                    }
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action specified'
                }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Team orchestration POST error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid input data',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process team operation'
        }, { status: 500 });
    }
}

// GET /api/team-orchestration - Get team data and metrics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const sessionId = searchParams.get('session_id');
        const agentId = searchParams.get('agent_id');

        switch (action) {
            case 'agents':
                const agents = teamEngine.listAgents();
                return NextResponse.json({
                    success: true,
                    data: {
                        agents: agents.map(agent => ({
                            id: agent.id,
                            name: agent.name,
                            type: agent.type,
                            role: agent.role,
                            status: agent.status,
                            workload: agent.workload,
                            capabilities: agent.capabilities,
                            specializations: agent.specializations,
                            performance: agent.performance
                        }))
                    }
                });

            case 'sessions':
                const sessions = teamEngine.listSessions();
                return NextResponse.json({
                    success: true,
                    data: {
                        sessions: sessions.map(session => ({
                            id: session.id,
                            name: session.name,
                            description: session.description,
                            status: session.status,
                            participantCount: session.participants.length,
                            taskCount: session.tasks.length,
                            decisionCount: session.decisions.length,
                            messageCount: session.messageHistory.length,
                            startTime: session.startTime,
                            endTime: session.endTime
                        }))
                    }
                });

            case 'session_details':
                if (!sessionId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Session ID is required'
                    }, { status: 400 });
                }

                const session = teamEngine.getSession(sessionId);
                if (!session) {
                    return NextResponse.json({
                        success: false,
                        error: 'Session not found'
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        session: {
                            id: session.id,
                            name: session.name,
                            description: session.description,
                            status: session.status,
                            participants: session.participants.map(p => ({
                                id: p.id,
                                name: p.name,
                                type: p.type,
                                role: p.role,
                                status: p.status,
                                workload: p.workload
                            })),
                            tasks: session.tasks.map(task => ({
                                id: task.id,
                                title: task.title,
                                status: task.status,
                                priority: task.priority,
                                progress: task.progress,
                                assignedAgents: task.assignedAgents,
                                subtasks: task.subtasks.length
                            })),
                            decisions: session.decisions.map(decision => ({
                                id: decision.id,
                                topic: decision.topic,
                                status: decision.status,
                                votes: decision.votes.length,
                                options: decision.options.length,
                                finalDecision: decision.finalDecision
                            })),
                            recentMessages: session.messageHistory.slice(-10).map(msg => ({
                                id: msg.id,
                                fromAgent: msg.fromAgent,
                                toAgent: msg.toAgent,
                                messageType: msg.messageType,
                                content: msg.content.substring(0, 100),
                                timestamp: msg.timestamp
                            })),
                            startTime: session.startTime,
                            endTime: session.endTime,
                            culturalContext: session.culturalContext
                        }
                    }
                });

            case 'metrics':
                if (!sessionId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Session ID is required for metrics'
                    }, { status: 400 });
                }

                const metrics = await teamEngine.getTeamMetrics(sessionId);
                return NextResponse.json({
                    success: true,
                    data: { metrics }
                });

            case 'patterns':
                const patterns = teamEngine.listCollaborationPatterns();
                return NextResponse.json({
                    success: true,
                    data: {
                        patterns: patterns.map(pattern => ({
                            id: pattern.id,
                            name: pattern.name,
                            description: pattern.description,
                            agentTypes: pattern.agentTypes,
                            taskTypes: pattern.taskTypes,
                            steps: pattern.workflow.length,
                            culturalConsiderations: pattern.culturalConsiderations,
                            successCriteria: pattern.successCriteria,
                            examples: pattern.examples
                        }))
                    }
                });

            case 'capabilities':
                return NextResponse.json({
                    success: true,
                    data: {
                        features: [
                            'Multi-agent collaboration',
                            'Intelligent task distribution',
                            'Agent-to-agent communication',
                            'Collective decision making',
                            'Cultural context awareness',
                            'Performance monitoring',
                            'Workflow patterns',
                            'Real-time coordination'
                        ],
                        agent_types: ['coordinator', 'specialist', 'generalist', 'cultural_advisor', 'validator', 'translator', 'analyst', 'creative', 'executor'],
                        communication_types: ['task_assignment', 'task_update', 'question', 'answer', 'collaboration_request', 'status_update', 'escalation', 'cultural_guidance'],
                        decision_methods: ['simple_majority', 'weighted', 'consensus', 'expert_override', 'cultural_priority'],
                        max_agents_per_session: 10,
                        max_concurrent_tasks: 20,
                        supported_languages: ['en', 'ml']
                    }
                });

            default:
                return NextResponse.json({
                    success: true,
                    data: {
                        service: 'Team Orchestration API',
                        version: '1.0.0',
                        status: 'operational',
                        active_agents: teamEngine.listAgents().length,
                        active_sessions: teamEngine.listSessions().length,
                        endpoints: [
                            'POST /api/team-orchestration - Perform team operations',
                            'GET /api/team-orchestration?action=agents - List agents',
                            'GET /api/team-orchestration?action=sessions - List sessions',
                            'GET /api/team-orchestration?action=session_details&session_id=X - Get session details',
                            'GET /api/team-orchestration?action=metrics&session_id=X - Get team metrics',
                            'GET /api/team-orchestration?action=patterns - List collaboration patterns',
                            'GET /api/team-orchestration?action=capabilities - Get capabilities'
                        ]
                    }
                });
        }

    } catch (error: any) {
        console.error('Team orchestration GET error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process request'
        }, { status: 500 });
    }
}

// PUT /api/team-orchestration - Update team configurations
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'update_agent_status':
                // Implementation for updating agent status
                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Agent status update functionality ready for implementation'
                    }
                });

            case 'update_task_progress':
                // Implementation for updating task progress
                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Task progress update functionality ready for implementation'
                    }
                });

            case 'update_session_status':
                // Implementation for updating session status
                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Session status update functionality ready for implementation'
                    }
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid update action specified'
                }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Team orchestration PUT error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update'
        }, { status: 500 });
    }
}

// DELETE /api/team-orchestration - Remove agents, sessions, or tasks
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID is required for deletion'
            }, { status: 400 });
        }

        switch (action) {
            case 'agent':
                // Implementation for removing agent
                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Agent removal functionality ready for implementation'
                    }
                });

            case 'session':
                // Implementation for ending/removing session
                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Session removal functionality ready for implementation'
                    }
                });

            case 'task':
                // Implementation for cancelling task
                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Task cancellation functionality ready for implementation'
                    }
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid deletion action specified'
                }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Team orchestration DELETE error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete'
        }, { status: 500 });
    }
}