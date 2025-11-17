import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { workflowId } = body;

        if (!workflowId) {
            return NextResponse.json(
                { error: 'Workflow ID is required' },
                { status: 400 }
            );
        }

        // Update execution status to STOPPED and set completion time
        const execution = await db.workflowExecution.updateMany({
            where: {
                workflowId,
                status: { in: ['RUNNING', 'PAUSED'] }
            },
            data: {
                status: 'STOPPED',
                completedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Workflow execution stopped'
        });
    } catch (error) {
        console.error('Error stopping workflow:', error);
        return NextResponse.json(
            { error: 'Failed to stop workflow' },
            { status: 500 }
        );
    }
}