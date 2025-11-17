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

        // Update execution status to PAUSED
        const execution = await db.workflowExecution.updateMany({
            where: {
                workflowId,
                status: 'RUNNING'
            },
            data: {
                status: 'PAUSED'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Workflow execution paused'
        });
    } catch (error) {
        console.error('Error pausing workflow:', error);
        return NextResponse.json(
            { error: 'Failed to pause workflow' },
            { status: 500 }
        );
    }
}