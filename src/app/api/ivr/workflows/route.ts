/**
 * IVR Workflows Enhanced CRUD API
 * Complete management of IVR workflow designs with Malayalam cultural intelligence
 * Supports visual workflow builder, node management, and execution tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CreateWorkflowRequest {
    name: string;
    description?: string;
    category: string;
    language?: string;
    cultural_settings?: Record<string, any>;
    nodes: WorkflowNodeData[];
    connections: WorkflowConnectionData[];
    is_active?: boolean;
    is_template?: boolean;
}

interface WorkflowNodeData {
    type: string;
    label: string;
    description?: string;
    config: Record<string, any>;
    position: { x: number; y: number };
    cultural_config?: Record<string, any>;
}

interface WorkflowConnectionData {
    source_node_id: string;
    target_node_id: string;
    source_handle?: string;
    target_handle?: string;
    condition?: string;
}

interface UpdateWorkflowRequest {
    name?: string;
    description?: string;
    category?: string;
    is_active?: boolean;
    nodes?: WorkflowNodeData[];
    connections?: WorkflowConnectionData[];
    cultural_settings?: Record<string, any>;
    performance_settings?: Record<string, any>;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workflowId = searchParams.get('workflow_id');
        const action = searchParams.get('action') || 'workflows';

        switch (action) {
            case 'workflows':
                if (workflowId) {
                    return await getWorkflow(workflowId);
                }
                return await listWorkflows(searchParams);

            case 'templates':
                return await getWorkflowTemplates(searchParams);

            case 'executions':
                return await getWorkflowExecutions(searchParams);

            case 'performance':
                return await getWorkflowPerformance(searchParams);

            case 'validate':
                if (!workflowId) {
                    return NextResponse.json(
                        { error: 'workflow_id is required for validation' },
                        { status: 400 }
                    );
                }
                return await validateWorkflow(workflowId);

            case 'preview':
                if (!workflowId) {
                    return NextResponse.json(
                        { error: 'workflow_id is required for preview' },
                        { status: 400 }
                    );
                }
                return await previewWorkflow(workflowId);

            case 'export':
                if (!workflowId) {
                    return NextResponse.json(
                        { error: 'workflow_id is required for export' },
                        { status: 400 }
                    );
                }
                return await exportWorkflow(workflowId);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in workflows GET:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'create';
        const body = await request.json();

        switch (action) {
            case 'create':
                return await createWorkflow(body);

            case 'clone':
                return await cloneWorkflow(body);

            case 'import':
                return await importWorkflow(body);

            case 'execute':
                return await executeWorkflow(body);

            case 'test':
                return await testWorkflow(body);

            case 'deploy':
                return await deployWorkflow(body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in workflows POST:', error);
        return NextResponse.json(
            { error: 'Failed to create workflow' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workflowId = searchParams.get('workflow_id');
        const action = searchParams.get('action') || 'update';

        if (!workflowId) {
            return NextResponse.json(
                { error: 'workflow_id is required' },
                { status: 400 }
            );
        }

        const body = await request.json();

        switch (action) {
            case 'update':
                return await updateWorkflow(workflowId, body);

            case 'activate':
                return await activateWorkflow(workflowId);

            case 'deactivate':
                return await deactivateWorkflow(workflowId);

            case 'nodes':
                return await updateWorkflowNodes(workflowId, body);

            case 'connections':
                return await updateWorkflowConnections(workflowId, body);

            case 'cultural_settings':
                return await updateCulturalSettings(workflowId, body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in workflows PUT:', error);
        return NextResponse.json(
            { error: 'Failed to update workflow' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workflowId = searchParams.get('workflow_id');
        const permanent = searchParams.get('permanent') === 'true';
        const action = searchParams.get('action') || 'delete';

        if (!workflowId) {
            return NextResponse.json(
                { error: 'workflow_id is required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'delete':
                return await deleteWorkflow(workflowId, permanent);

            case 'node':
                const nodeId = searchParams.get('node_id');
                if (!nodeId) {
                    return NextResponse.json(
                        { error: 'node_id is required' },
                        { status: 400 }
                    );
                }
                return await deleteWorkflowNode(workflowId, nodeId);

            case 'connection':
                const connectionId = searchParams.get('connection_id');
                if (!connectionId) {
                    return NextResponse.json(
                        { error: 'connection_id is required' },
                        { status: 400 }
                    );
                }
                return await deleteWorkflowConnection(workflowId, connectionId);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in workflows DELETE:', error);
        return NextResponse.json(
            { error: 'Failed to delete workflow' },
            { status: 500 }
        );
    }
}

// Implementation functions

async function createWorkflow(data: CreateWorkflowRequest) {
    // Validate required fields
    if (!data.name || !data.category) {
        return NextResponse.json(
            { error: 'name and category are required' },
            { status: 400 }
        );
    }

    // Create workflow
    const workflow = await db.workflow.create({
        data: {
            name: data.name,
            description: data.description,
            category: data.category.toUpperCase(),
            isActive: data.is_active ?? true
        }
    });

    // Create nodes
    const nodeIdMap = new Map<string, string>();
    if (data.nodes && data.nodes.length > 0) {
        for (let i = 0; i < data.nodes.length; i++) {
            const nodeData = data.nodes[i];

            // Enhance config with cultural settings if Malayalam
            const enhancedConfig = {
                ...nodeData.config,
                ...(data.language === 'ml' && nodeData.cultural_config ? {
                    cultural: nodeData.cultural_config
                } : {})
            };

            const node = await db.workflowNode.create({
                data: {
                    workflowId: workflow.id,
                    type: nodeData.type,
                    config: JSON.stringify(enhancedConfig),
                    position: i,
                    label: nodeData.label,
                    description: nodeData.description
                }
            });

            nodeIdMap.set(`temp_${i}`, node.id);
        }
    }

    // Create connections
    if (data.connections && data.connections.length > 0) {
        for (const connData of data.connections) {
            const sourceNodeId = nodeIdMap.get(connData.source_node_id) || connData.source_node_id;
            const targetNodeId = nodeIdMap.get(connData.target_node_id) || connData.target_node_id;

            if (sourceNodeId && targetNodeId) {
                await db.nodeConnection.create({
                    data: {
                        sourceNodeId,
                        targetNodeId,
                        sourceHandle: connData.source_handle || 'source',
                        targetHandle: connData.target_handle || 'target',
                        condition: connData.condition
                    }
                });
            }
        }
    }

    // Create workflow version
    await db.workflowVersion.create({
        data: {
            workflowId: workflow.id,
            version: 1,
            changeDescription: 'Initial workflow creation',
            workflowData: JSON.stringify({
                workflow: {
                    id: workflow.id,
                    name: workflow.name,
                    description: workflow.description,
                    category: workflow.category
                },
                nodes: data.nodes || [],
                connections: data.connections || [],
                cultural_settings: data.cultural_settings || {},
                metadata: {
                    created_at: new Date().toISOString(),
                    language: data.language || 'ml',
                    is_template: data.is_template || false
                }
            }),
            createdBy: 'system'
        }
    });

    return NextResponse.json({
        success: true,
        workflow: {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description,
            category: workflow.category,
            is_active: workflow.isActive,
            node_count: data.nodes?.length || 0,
            connection_count: data.connections?.length || 0,
            cultural_enabled: !!(data.cultural_settings && Object.keys(data.cultural_settings).length > 0),
            created_at: workflow.createdAt.toISOString()
        }
    }, { status: 201 });
}

async function getWorkflow(workflowId: string) {
    const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
        include: {
            nodes: {
                include: {
                    sourceConnections: true,
                    targetConnections: true
                },
                orderBy: { position: 'asc' }
            },
            executions: {
                orderBy: { startedAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    status: true,
                    startedAt: true,
                    completedAt: true,
                    input: true,
                    output: true
                }
            },
            versions: {
                orderBy: { version: 'desc' },
                take: 5,
                select: {
                    id: true,
                    version: true,
                    changeDescription: true,
                    createdAt: true,
                    createdBy: true
                }
            }
        }
    });

    if (!workflow) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    // Parse cultural settings from latest version
    const latestVersion = workflow.versions[0];
    let culturalSettings = {};
    if (latestVersion) {
        try {
            const versionData = JSON.parse(latestVersion.workflowData);
            culturalSettings = versionData.cultural_settings || {};
        } catch (error) {
            console.warn('Failed to parse workflow version data:', error);
        }
    }

    // Calculate execution statistics
    const executionStats = await db.workflowExecution.aggregate({
        where: { workflowId },
        _count: { id: true },
        _avg: {
            // Calculate average execution time
        }
    });

    const successfulExecutions = await db.workflowExecution.count({
        where: {
            workflowId,
            status: 'SUCCESS'
        }
    });

    const successRate = executionStats._count.id > 0
        ? (successfulExecutions / executionStats._count.id) * 100
        : 0;

    // Format nodes with connections
    const formattedNodes = workflow.nodes.map(node => {
        const config = JSON.parse(node.config || '{}');

        return {
            id: node.id,
            type: node.type,
            label: node.label,
            description: node.description,
            position: node.position,
            config: config,
            cultural_config: config.cultural || null,
            source_connections: node.sourceConnections.map(conn => ({
                id: conn.id,
                target_node_id: conn.targetNodeId,
                source_handle: conn.sourceHandle,
                target_handle: conn.targetHandle,
                condition: conn.condition
            })),
            target_connections: node.targetConnections.map(conn => ({
                id: conn.id,
                source_node_id: conn.sourceNodeId,
                source_handle: conn.sourceHandle,
                target_handle: conn.targetHandle,
                condition: conn.condition
            }))
        };
    });

    return NextResponse.json({
        success: true,
        workflow: {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description,
            category: workflow.category,
            is_active: workflow.isActive,

            // Workflow structure
            nodes: formattedNodes,
            node_count: workflow.nodes.length,
            connection_count: workflow.nodes.reduce(
                (acc, node) => acc + node.sourceConnections.length,
                0
            ),

            // Cultural settings
            cultural_settings: culturalSettings,
            cultural_enabled: Object.keys(culturalSettings).length > 0,

            // Execution history
            recent_executions: workflow.executions.map(exec => ({
                id: exec.id,
                status: exec.status,
                started_at: exec.startedAt.toISOString(),
                completed_at: exec.completedAt?.toISOString(),
                duration_ms: exec.completedAt
                    ? exec.completedAt.getTime() - exec.startedAt.getTime()
                    : null
            })),

            // Statistics
            execution_stats: {
                total_executions: executionStats._count.id,
                successful_executions: successfulExecutions,
                success_rate: successRate
            },

            // Version history
            versions: workflow.versions.map(version => ({
                id: version.id,
                version: version.version,
                change_description: version.changeDescription,
                created_at: version.createdAt.toISOString(),
                created_by: version.createdBy
            })),

            // Metadata
            created_at: workflow.createdAt.toISOString(),
            updated_at: workflow.updatedAt.toISOString()
        }
    });
}

async function listWorkflows(searchParams: URLSearchParams) {
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const is_active = searchParams.get('is_active');
    const search = searchParams.get('search');
    const cultural_only = searchParams.get('cultural_only') === 'true';

    const whereClause: any = {};

    if (category) {
        whereClause.category = category.toUpperCase();
    }

    if (is_active !== null) {
        whereClause.isActive = is_active === 'true';
    }

    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [workflows, totalCount] = await Promise.all([
        db.workflow.findMany({
            where: whereClause,
            include: {
                nodes: {
                    select: { id: true }
                },
                executions: {
                    select: {
                        id: true,
                        status: true,
                        startedAt: true
                    },
                    orderBy: { startedAt: 'desc' },
                    take: 1
                },
                versions: {
                    select: {
                        workflowData: true
                    },
                    orderBy: { version: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            skip: offset
        }),
        db.workflow.count({ where: whereClause })
    ]);

    const formattedWorkflows = workflows
        .map(workflow => {
            // Parse cultural settings from latest version
            let culturalEnabled = false;
            let language = 'en';

            if (workflow.versions[0]) {
                try {
                    const versionData = JSON.parse(workflow.versions[0].workflowData);
                    culturalEnabled = !!(versionData.cultural_settings &&
                        Object.keys(versionData.cultural_settings).length > 0);
                    language = versionData.metadata?.language || 'en';
                } catch (error) {
                    // Ignore parsing errors
                }
            }

            const lastExecution = workflow.executions[0];

            return {
                id: workflow.id,
                name: workflow.name,
                description: workflow.description,
                category: workflow.category,
                is_active: workflow.isActive,
                node_count: workflow.nodes.length,
                cultural_enabled: culturalEnabled,
                language: language,
                last_execution: lastExecution ? {
                    status: lastExecution.status,
                    started_at: lastExecution.startedAt.toISOString()
                } : null,
                created_at: workflow.createdAt.toISOString(),
                updated_at: workflow.updatedAt.toISOString()
            };
        })
        .filter(workflow => {
            // Apply client-side filters
            if (cultural_only && !workflow.cultural_enabled) return false;
            return true;
        });

    return NextResponse.json({
        success: true,
        workflows: formattedWorkflows,
        pagination: {
            total_count: totalCount,
            limit,
            offset,
            has_more: offset + limit < totalCount
        }
    });
}

async function updateWorkflow(workflowId: string, updates: UpdateWorkflowRequest) {
    const existingWorkflow = await db.workflow.findUnique({
        where: { id: workflowId },
        include: {
            versions: {
                orderBy: { version: 'desc' },
                take: 1
            }
        }
    });

    if (!existingWorkflow) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    // Update workflow metadata
    const updateData: any = {
        updatedAt: new Date()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category.toUpperCase();
    if (updates.is_active !== undefined) updateData.isActive = updates.is_active;

    const updatedWorkflow = await db.workflow.update({
        where: { id: workflowId },
        data: updateData
    });

    // Handle nodes and connections updates
    if (updates.nodes || updates.connections) {
        // Delete existing nodes and connections
        await db.workflowNode.deleteMany({
            where: { workflowId }
        });

        // Create new nodes
        const nodeIdMap = new Map<string, string>();
        if (updates.nodes) {
            for (let i = 0; i < updates.nodes.length; i++) {
                const nodeData = updates.nodes[i];

                const node = await db.workflowNode.create({
                    data: {
                        workflowId,
                        type: nodeData.type,
                        config: JSON.stringify(nodeData.config),
                        position: i,
                        label: nodeData.label,
                        description: nodeData.description
                    }
                });

                nodeIdMap.set(`temp_${i}`, node.id);
            }
        }

        // Create new connections
        if (updates.connections) {
            for (const connData of updates.connections) {
                const sourceNodeId = nodeIdMap.get(connData.source_node_id) || connData.source_node_id;
                const targetNodeId = nodeIdMap.get(connData.target_node_id) || connData.target_node_id;

                if (sourceNodeId && targetNodeId) {
                    await db.nodeConnection.create({
                        data: {
                            sourceNodeId,
                            targetNodeId,
                            sourceHandle: connData.source_handle || 'source',
                            targetHandle: connData.target_handle || 'target',
                            condition: connData.condition
                        }
                    });
                }
            }
        }

        // Create new version
        const nextVersion = (existingWorkflow.versions[0]?.version || 0) + 1;
        await db.workflowVersion.create({
            data: {
                workflowId,
                version: nextVersion,
                changeDescription: 'Workflow structure updated',
                workflowData: JSON.stringify({
                    workflow: {
                        id: updatedWorkflow.id,
                        name: updatedWorkflow.name,
                        description: updatedWorkflow.description,
                        category: updatedWorkflow.category
                    },
                    nodes: updates.nodes || [],
                    connections: updates.connections || [],
                    cultural_settings: updates.cultural_settings || {},
                    metadata: {
                        updated_at: new Date().toISOString(),
                        version: nextVersion
                    }
                }),
                createdBy: 'system'
            }
        });
    }

    return NextResponse.json({
        success: true,
        workflow: {
            id: updatedWorkflow.id,
            name: updatedWorkflow.name,
            description: updatedWorkflow.description,
            category: updatedWorkflow.category,
            is_active: updatedWorkflow.isActive,
            updated_at: updatedWorkflow.updatedAt.toISOString()
        }
    });
}

async function deleteWorkflow(workflowId: string, permanent: boolean = false) {
    const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
        include: {
            executions: true
        }
    });

    if (!workflow) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    if (permanent) {
        // Check for active executions
        const activeExecutions = workflow.executions.filter(
            exec => exec.status === 'RUNNING' || exec.status === 'PENDING'
        );

        if (activeExecutions.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete workflow with active executions' },
                { status: 400 }
            );
        }

        // Permanent deletion
        await db.workflow.delete({
            where: { id: workflowId }
        });

        return NextResponse.json({
            success: true,
            message: 'Workflow permanently deleted'
        });
    } else {
        // Soft delete - deactivate workflow
        await db.workflow.update({
            where: { id: workflowId },
            data: {
                isActive: false,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Workflow deactivated'
        });
    }
}

async function executeWorkflow(data: { workflow_id: string; input: any; context?: any }) {
    const workflow = await db.workflow.findUnique({
        where: { id: data.workflow_id },
        include: {
            nodes: {
                include: {
                    sourceConnections: true,
                    targetConnections: true
                },
                orderBy: { position: 'asc' }
            }
        }
    });

    if (!workflow) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    if (!workflow.isActive) {
        return NextResponse.json(
            { error: 'Workflow is not active' },
            { status: 400 }
        );
    }

    // Create execution record
    const execution = await db.workflowExecution.create({
        data: {
            workflowId: data.workflow_id,
            input: JSON.stringify(data.input),
            status: 'RUNNING'
        }
    });

    try {
        // Execute workflow (simplified simulation)
        const result = await simulateWorkflowExecution(workflow, data.input, data.context);

        // Update execution record
        await db.workflowExecution.update({
            where: { id: execution.id },
            data: {
                output: JSON.stringify(result),
                status: 'SUCCESS',
                completedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            execution: {
                id: execution.id,
                workflow_id: data.workflow_id,
                status: 'SUCCESS',
                result: result,
                started_at: execution.startedAt.toISOString(),
                completed_at: new Date().toISOString()
            }
        });

    } catch (error) {
        // Update execution record with failure
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        await db.workflowExecution.update({
            where: { id: execution.id },
            data: {
                output: JSON.stringify({ error: errorMessage }),
                status: 'FAILED',
                completedAt: new Date()
            }
        });

        return NextResponse.json({
            success: false,
            execution: {
                id: execution.id,
                workflow_id: data.workflow_id,
                status: 'FAILED',
                error: errorMessage,
                started_at: execution.startedAt.toISOString(),
                completed_at: new Date().toISOString()
            }
        });
    }
}

// Additional helper functions

async function getWorkflowTemplates(searchParams: URLSearchParams) {
    const category = searchParams.get('category');
    const language = searchParams.get('language') || 'ml';

    // Mock workflow templates
    const templates = [
        {
            id: 'template_1',
            name: 'Customer Service IVR - Malayalam',
            description: 'Standard customer service workflow with Malayalam support',
            category: 'CUSTOMER_SERVICE',
            language: 'ml',
            cultural_features: ['greeting_variations', 'respect_levels', 'dialect_support'],
            nodes: [
                { type: 'greeting', label: 'Welcome Message' },
                { type: 'menu', label: 'Main Menu' },
                { type: 'department_routing', label: 'Route to Department' }
            ],
            preview_url: '/templates/customer-service-ml'
        },
        {
            id: 'template_2',
            name: 'Banking IVR - Cultural',
            description: 'Banking workflow with cultural sensitivity',
            category: 'BANKING',
            language: 'ml',
            cultural_features: ['formal_tone', 'security_awareness', 'local_banking_terms'],
            nodes: [
                { type: 'greeting', label: 'Bank Welcome' },
                { type: 'authentication', label: 'Customer Verification' },
                { type: 'banking_menu', label: 'Banking Services' }
            ],
            preview_url: '/templates/banking-ml'
        }
    ];

    let filteredTemplates = templates;
    if (category) {
        filteredTemplates = templates.filter(t => t.category === category.toUpperCase());
    }
    if (language) {
        filteredTemplates = filteredTemplates.filter(t => t.language === language);
    }

    return NextResponse.json({
        success: true,
        templates: filteredTemplates
    });
}

async function getWorkflowExecutions(searchParams: URLSearchParams) {
    const workflowId = searchParams.get('workflow_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!workflowId) {
        return NextResponse.json(
            { error: 'workflow_id is required' },
            { status: 400 }
        );
    }

    const executions = await db.workflowExecution.findMany({
        where: { workflowId },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset
    });

    return NextResponse.json({
        success: true,
        executions: executions.map(exec => ({
            id: exec.id,
            status: exec.status,
            started_at: exec.startedAt.toISOString(),
            completed_at: exec.completedAt?.toISOString(),
            duration_ms: exec.completedAt
                ? exec.completedAt.getTime() - exec.startedAt.getTime()
                : null
        }))
    });
}

async function getWorkflowPerformance(searchParams: URLSearchParams) {
    const workflowId = searchParams.get('workflow_id');
    const days = parseInt(searchParams.get('days') || '7');

    if (!workflowId) {
        return NextResponse.json(
            { error: 'workflow_id is required' },
            { status: 400 }
        );
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const executions = await db.workflowExecution.findMany({
        where: {
            workflowId,
            startedAt: { gte: since }
        }
    });

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'SUCCESS').length;
    const failedExecutions = executions.filter(e => e.status === 'FAILED').length;

    const avgDuration = executions
        .filter(e => e.completedAt)
        .reduce((acc, e) => {
            const duration = e.completedAt!.getTime() - e.startedAt.getTime();
            return acc + duration;
        }, 0) / executions.filter(e => e.completedAt).length || 0;

    return NextResponse.json({
        success: true,
        performance: {
            period_days: days,
            total_executions: totalExecutions,
            successful_executions: successfulExecutions,
            failed_executions: failedExecutions,
            success_rate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
            average_duration_ms: avgDuration
        }
    });
}

async function previewWorkflow(workflowId: string) {
    const workflow = await getWorkflow(workflowId);

    // Extract workflow data for preview
    const workflowData = await workflow.json();

    return NextResponse.json({
        success: true,
        preview: {
            workflow_id: workflowId,
            visual_representation: {
                nodes: workflowData.workflow.nodes.map((node: any) => ({
                    id: node.id,
                    type: node.type,
                    label: node.label,
                    position: { x: node.position * 200, y: 100 }
                })),
                connections: workflowData.workflow.nodes.flatMap((node: any) =>
                    node.source_connections || []
                )
            },
            estimated_performance: {
                avg_execution_time: '2.5s',
                complexity_score: workflowData.workflow.nodes.length * 10,
                cultural_readiness: workflowData.workflow.cultural_enabled ? 'High' : 'Low'
            }
        }
    });
}

async function exportWorkflow(workflowId: string) {
    const workflow = await getWorkflow(workflowId);
    const workflowData = await workflow.json();

    const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        workflow: workflowData.workflow
    };

    return NextResponse.json({
        success: true,
        export_data: exportData,
        download_url: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`
    });
}

async function cloneWorkflow(data: { workflow_id: string; new_name: string; description?: string }) {
    const originalWorkflow = await getWorkflow(data.workflow_id);
    const originalData = await originalWorkflow.json();

    const cloneData = {
        name: data.new_name,
        description: data.description || `Clone of ${originalData.workflow.name}`,
        category: originalData.workflow.category,
        nodes: originalData.workflow.nodes,
        connections: originalData.workflow.nodes.flatMap((node: any) =>
            node.source_connections || []
        ),
        cultural_settings: originalData.workflow.cultural_settings
    };

    return await createWorkflow(cloneData);
}

async function importWorkflow(data: { workflow_data: any; name?: string }) {
    const importData = {
        name: data.name || data.workflow_data.workflow?.name || 'Imported Workflow',
        description: data.workflow_data.workflow?.description,
        category: data.workflow_data.workflow?.category || 'GENERAL',
        nodes: data.workflow_data.nodes || [],
        connections: data.workflow_data.connections || [],
        cultural_settings: data.workflow_data.cultural_settings || {}
    };

    return await createWorkflow(importData);
}

async function testWorkflow(data: { workflow_id: string; test_input?: any }) {
    const testInput = data.test_input || {
        caller_id: '+919876543210',
        language: 'ml',
        test_mode: true
    };

    return await executeWorkflow({
        workflow_id: data.workflow_id,
        input: testInput,
        context: { test_execution: true }
    });
}

async function deployWorkflow(data: { workflow_id: string; environment: string }) {
    const workflow = await db.workflow.findUnique({
        where: { id: data.workflow_id }
    });

    if (!workflow) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    // Simulate deployment
    await db.workflow.update({
        where: { id: data.workflow_id },
        data: { isActive: true }
    });

    return NextResponse.json({
        success: true,
        deployment: {
            workflow_id: data.workflow_id,
            environment: data.environment,
            status: 'deployed',
            deployed_at: new Date().toISOString(),
            endpoint: `https://api.example.com/ivr/workflows/${data.workflow_id}/execute`
        }
    });
}

async function activateWorkflow(workflowId: string) {
    await db.workflow.update({
        where: { id: workflowId },
        data: { isActive: true }
    });

    return NextResponse.json({
        success: true,
        message: 'Workflow activated'
    });
}

async function deactivateWorkflow(workflowId: string) {
    await db.workflow.update({
        where: { id: workflowId },
        data: { isActive: false }
    });

    return NextResponse.json({
        success: true,
        message: 'Workflow deactivated'
    });
}

async function updateWorkflowNodes(workflowId: string, data: { nodes: WorkflowNodeData[] }) {
    // Delete existing nodes
    await db.workflowNode.deleteMany({
        where: { workflowId }
    });

    // Create new nodes
    for (let i = 0; i < data.nodes.length; i++) {
        const nodeData = data.nodes[i];
        await db.workflowNode.create({
            data: {
                workflowId,
                type: nodeData.type,
                config: JSON.stringify(nodeData.config),
                position: i,
                label: nodeData.label,
                description: nodeData.description
            }
        });
    }

    return NextResponse.json({
        success: true,
        message: 'Workflow nodes updated'
    });
}

async function updateWorkflowConnections(workflowId: string, data: { connections: WorkflowConnectionData[] }) {
    // Delete existing connections for this workflow's nodes
    const workflowNodes = await db.workflowNode.findMany({
        where: { workflowId },
        select: { id: true }
    });

    const nodeIds = workflowNodes.map(n => n.id);

    await db.nodeConnection.deleteMany({
        where: {
            OR: [
                { sourceNodeId: { in: nodeIds } },
                { targetNodeId: { in: nodeIds } }
            ]
        }
    });

    // Create new connections
    for (const connData of data.connections) {
        await db.nodeConnection.create({
            data: {
                sourceNodeId: connData.source_node_id,
                targetNodeId: connData.target_node_id,
                sourceHandle: connData.source_handle || 'source',
                targetHandle: connData.target_handle || 'target',
                condition: connData.condition
            }
        });
    }

    return NextResponse.json({
        success: true,
        message: 'Workflow connections updated'
    });
}

async function updateCulturalSettings(workflowId: string, data: { cultural_settings: Record<string, any> }) {
    // Get latest version
    const latestVersion = await db.workflowVersion.findFirst({
        where: { workflowId },
        orderBy: { version: 'desc' }
    });

    if (latestVersion) {
        const versionData = JSON.parse(latestVersion.workflowData);
        versionData.cultural_settings = data.cultural_settings;

        const nextVersion = latestVersion.version + 1;
        await db.workflowVersion.create({
            data: {
                workflowId,
                version: nextVersion,
                changeDescription: 'Cultural settings updated',
                workflowData: JSON.stringify(versionData),
                createdBy: 'system'
            }
        });
    }

    return NextResponse.json({
        success: true,
        message: 'Cultural settings updated'
    });
}

async function deleteWorkflowNode(workflowId: string, nodeId: string) {
    const node = await db.workflowNode.findFirst({
        where: { id: nodeId, workflowId }
    });

    if (!node) {
        return NextResponse.json(
            { error: 'Node not found' },
            { status: 404 }
        );
    }

    await db.workflowNode.delete({
        where: { id: nodeId }
    });

    return NextResponse.json({
        success: true,
        message: 'Node deleted'
    });
}

async function deleteWorkflowConnection(workflowId: string, connectionId: string) {
    const connection = await db.nodeConnection.findUnique({
        where: { id: connectionId },
        include: {
            sourceNode: true,
            targetNode: true
        }
    });

    if (!connection ||
        (connection.sourceNode.workflowId !== workflowId &&
            connection.targetNode.workflowId !== workflowId)) {
        return NextResponse.json(
            { error: 'Connection not found' },
            { status: 404 }
        );
    }

    await db.nodeConnection.delete({
        where: { id: connectionId }
    });

    return NextResponse.json({
        success: true,
        message: 'Connection deleted'
    });
}

// Helper functions

async function simulateWorkflowExecution(workflow: any, input: any, context: any) {
    // Simplified workflow execution simulation
    const result = {
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        input: input,
        steps: [] as any[],
        output: null as any,
        execution_time_ms: 1000 + Math.random() * 2000
    };

    // Simulate executing each node
    for (const node of workflow.nodes) {
        const config = JSON.parse(node.config || '{}');

        const stepResult = {
            node_id: node.id,
            node_type: node.type,
            node_label: node.label,
            status: 'success',
            processing_time_ms: 100 + Math.random() * 500,
            output: null as any
        };        // Simulate different node types
        switch (node.type) {
            case 'greeting':
                stepResult.output = {
                    message: config.message || 'Hello',
                    language: config.language || 'ml',
                    cultural_tone: config.cultural_tone || 'neutral'
                };
                break;

            case 'stt':
                stepResult.output = {
                    transcript: 'Simulated speech-to-text output',
                    confidence: 0.9,
                    language_detected: 'ml'
                };
                break;

            case 'nlu':
                stepResult.output = {
                    intent: 'customer_service',
                    confidence: 0.85,
                    entities: { department: 'support' }
                };
                break;

            case 'tts':
                stepResult.output = {
                    audio_url: 'https://example.com/audio.wav',
                    duration_ms: 3000,
                    language: 'ml'
                };
                break;

            default:
                stepResult.output = {
                    message: `Processed ${node.type}`,
                    success: true
                };
        }

        result.steps.push(stepResult);
    }

    result.output = {
        final_message: 'Workflow completed successfully',
        total_steps: result.steps.length,
        success: true
    };

    return result;
}

async function validateWorkflow(workflowId: string) {
    if (!workflowId) {
        return NextResponse.json(
            { error: 'workflow_id is required' },
            { status: 400 }
        );
    }

    const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
        include: {
            nodes: {
                include: {
                    sourceConnections: true,
                    targetConnections: true
                }
            }
        }
    });

    if (!workflow) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    const validation = {
        is_valid: true,
        errors: [] as string[],
        warnings: [] as string[],
        suggestions: [] as string[]
    };

    // Check for nodes
    if (workflow.nodes.length === 0) {
        validation.is_valid = false;
        validation.errors.push('Workflow must contain at least one node');
    }

    // Check for entry point
    const entryNodes = workflow.nodes.filter(node =>
        node.targetConnections.length === 0
    );

    if (entryNodes.length === 0 && workflow.nodes.length > 0) {
        validation.warnings.push('No entry point found - workflow may not execute properly');
    }

    if (entryNodes.length > 1) {
        validation.warnings.push('Multiple entry points found - execution behavior may be unpredictable');
    }

    // Check for exit points
    const exitNodes = workflow.nodes.filter(node =>
        node.sourceConnections.length === 0
    );

    if (exitNodes.length === 0 && workflow.nodes.length > 0) {
        validation.warnings.push('No exit point found - workflow may not terminate properly');
    }

    // Check for orphaned nodes
    const orphanedNodes = workflow.nodes.filter(node =>
        node.sourceConnections.length === 0 && node.targetConnections.length === 0
    );

    if (orphanedNodes.length > 0) {
        validation.warnings.push(`${orphanedNodes.length} orphaned nodes found`);
    }

    // Check node configurations
    for (const node of workflow.nodes) {
        try {
            const config = JSON.parse(node.config || '{}');

            // Node-specific validations
            switch (node.type) {
                case 'greeting':
                    if (!config.message) {
                        validation.warnings.push(`Greeting node "${node.label}" has no message configured`);
                    }
                    break;

                case 'menu':
                    if (!config.options || !Array.isArray(config.options) || config.options.length === 0) {
                        validation.errors.push(`Menu node "${node.label}" has no options configured`);
                        validation.is_valid = false;
                    }
                    break;

                case 'condition':
                    if (!config.condition) {
                        validation.errors.push(`Condition node "${node.label}" has no condition configured`);
                        validation.is_valid = false;
                    }
                    break;
            }
        } catch (error) {
            validation.errors.push(`Node "${node.label}" has invalid configuration`);
            validation.is_valid = false;
        }
    }

    // Performance suggestions
    if (workflow.nodes.length > 20) {
        validation.suggestions.push('Large workflow detected - consider breaking into smaller sub-workflows');
    }

    return NextResponse.json({
        success: true,
        workflow_id: workflowId,
        validation
    });
}