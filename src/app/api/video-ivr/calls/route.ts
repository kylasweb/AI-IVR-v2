import { NextRequest, NextResponse } from 'next/server'

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Video IVR Call Types
interface VideoCall {
    id: string;
    callerName: string;
    callerNumber: string;
    status: 'active' | 'waiting' | 'ended' | 'failed';
    duration: number;
    startTime: string;
    endTime?: string;
    type: 'inbound' | 'outbound';
    recordingEnabled: boolean;
    recordingUrl?: string;
    aiAssistantActive: boolean;
    transcriptAvailable: boolean;
    metadata: {
        device: string;
        resolution: string;
        bitrate: number;
        location: string;
    };
}

// GET - List Video IVR calls
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = searchParams.get('limit') || '50';

        const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/video-ivr/calls?limit=${limit}${status ? `&status=${status}` : ''}`, {
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
            data: data.calls || data
        });
    } catch (error) {
        console.error('Error fetching video calls:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch video calls',
            data: []
        }, { status: 503 });
    }
}

// POST - Start a new video call
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/video-ivr/calls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(15000),
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
        console.error('Error starting video call:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to start video call'
        }, { status: 503 });
    }
}
