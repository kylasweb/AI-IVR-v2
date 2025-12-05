import { NextRequest, NextResponse } from 'next/server'

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Video Workflow Types
interface WorkflowStep {
    id: string;
    type: 'greeting' | 'menu' | 'form' | 'ai_response' | 'transfer' | 'end';
    title: string;
    content: string;
    options?: string[];
    nextStep?: string;
    conditions?: any[];
    aiEnabled: boolean;
}

interface VideoWorkflow {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'active' | 'paused' | 'archived';
    triggers: string[];
    steps: WorkflowStep[];
    analytics: {
        totalCalls: number;
        avgDuration: number;
        completionRate: number;
        satisfactionScore: number;
    };
    createdAt: string;
    updatedAt: string;
}

// GET - List Video IVR workflows
export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/video-ivr/workflows`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({
            success: true,
            data: data.workflows || data
        });
    } catch (error) {
        console.error('Error fetching workflows:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch workflows',
            data: []
        }, { status: 503 });
    }
}

// POST - Create a new workflow
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/video-ivr/workflows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error creating workflow:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create workflow'
        }, { status: 503 });
    }
}
