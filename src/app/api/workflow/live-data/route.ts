import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Get active workflows
        const workflows = await db.workflow.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                category: true,
                updatedAt: true,
                _count: {
                    select: {
                        nodes: true,
                        executions: {
                            where: {
                                status: 'RUNNING'
                            }
                        }
                    }
                }
            }
        });

        // Get running executions
        const executions = await db.workflowExecution.findMany({
            where: {
                status: 'RUNNING'
            },
            include: {
                workflow: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                startedAt: 'desc'
            }
        });

        // Transform executions to match the expected format
        const transformedExecutions = executions.map(exec => ({
            workflowId: exec.workflowId,
            status: 'running' as const,
            currentNodeId: exec.currentNodeId || undefined,
            progress: exec.progress || 0,
            startTime: exec.startedAt,
            executionLog: exec.logs ? JSON.parse(exec.logs) : [],
            metrics: {
                totalNodes: exec.workflow._count?.nodes || 0,
                completedNodes: Math.floor((exec.progress || 0) / 100 * (exec.workflow._count?.nodes || 1)),
                failedNodes: 0, // Would need to track this separately
                averageExecutionTime: 0 // Would need to calculate this
            }
        }));

        // Get node statuses (simplified - would need more complex logic for real implementation)
        const nodeStatuses = new Map();

        // Get system metrics
        const totalWorkflows = await db.workflow.count();
        const activeWorkflows = workflows.length;
        const runningExecutions = executions.length;

        const systemMetrics = {
            activeWorkflows,
            queuedExecutions: 0, // Would need to implement queuing system
            systemLoad: runningExecutions / Math.max(totalWorkflows, 1), // Simple load calculation
            memoryUsage: 0 // Would need system monitoring
        };

        return NextResponse.json({
            workflows,
            executions: transformedExecutions,
            nodeStatuses,
            systemMetrics
        });
    } catch (error) {
        console.error('Error fetching live workflow data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch live workflow data' },
            { status: 500 }
        );
    }
}