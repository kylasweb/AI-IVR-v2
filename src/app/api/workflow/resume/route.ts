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

        // Update execution status back to RUNNING
        const execution = await db.workflowExecution.updateMany({
            where: {
                workflowId,
                status: 'PAUSED'
            },
            data: {
                status: 'RUNNING'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Workflow execution resumed'
        });
    } catch (error) {
        console.error('Error resuming workflow:', error);
        return NextResponse.json(
            { error: 'Failed to resume workflow' },
            { status: 500 }
        );
    }
}