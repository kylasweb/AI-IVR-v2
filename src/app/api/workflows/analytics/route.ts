import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    
    // Get workflow execution statistics
    const executions = await db.workflowExecution.findMany({
      where: workflowId ? { workflowId } : undefined,
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    // Calculate statistics
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'SUCCESS').length;
    const failedExecutions = executions.filter(e => e.status === 'FAILED').length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    // Calculate average execution time
    const completedExecutions = executions.filter(e => e.completedAt);
    const avgExecutionTime = completedExecutions.length > 0 
      ? completedExecutions.reduce((sum, e) => {
          const duration = e.completedAt!.getTime() - e.startedAt.getTime();
          return sum + duration;
        }, 0) / completedExecutions.length / 1000 // Convert to seconds
      : 0;

    // Get daily execution counts
    const dailyStats = executions.reduce((acc, execution) => {
      const date = execution.startedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, successful: 0, failed: 0 };
      }
      acc[date].total++;
      if (execution.status === 'SUCCESS') acc[date].successful++;
      if (execution.status === 'FAILED') acc[date].failed++;
      return acc;
    }, {} as Record<string, { total: number; successful: number; failed: number }>);

    // Get workflow details
    const workflows = await db.workflow.findMany({
      include: {
        _count: {
          select: {
            nodes: true,
            executions: true
          }
        }
      }
    });

    // Get most used workflows
    const mostUsedWorkflows = workflows
      .map(w => ({
        id: w.id,
        name: w.name,
        executions: w._count.executions,
        nodes: w._count.nodes
      }))
      .sort((a, b) => b.executions - a.executions)
      .slice(0, 10);

    // Get error analysis
    const errorAnalysis = executions
      .filter(e => e.status === 'FAILED')
      .reduce((acc, execution) => {
        try {
          const output = JSON.parse(execution.output);
          const error = output.error || 'Unknown error';
          acc[error] = (acc[error] || 0) + 1;
        } catch {
          acc['Parse error'] = (acc['Parse error'] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

    return NextResponse.json({
      summary: {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate: Math.round(successRate * 100) / 100,
        avgExecutionTime: Math.round(avgExecutionTime * 100) / 100,
        totalWorkflows: workflows.length,
        totalNodes: workflows.reduce((sum, w) => sum + w._count.nodes, 0)
      },
      dailyStats,
      mostUsedWorkflows,
      errorAnalysis,
      recentExecutions: executions.slice(0, 10).map(e => ({
        id: e.id,
        workflowId: e.workflowId,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        duration: e.completedAt ? 
          Math.round((e.completedAt.getTime() - e.startedAt.getTime()) / 1000) : null
      }))
    });
  } catch (error: any) {
    console.error('Error fetching workflow analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics', details: error.message }, { status: 500 });
  }
}