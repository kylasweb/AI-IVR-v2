import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

// IVR session start API - connects to Python FastAPI backend
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { callId, phoneNumber, workflow, language } = body;

        // Call the actual Python FastAPI backend
        const backendResponse = await apiClient.startCall(phoneNumber, language || 'en', workflow);

        if (!backendResponse.success) {
            return NextResponse.json(
                { error: backendResponse.error || 'Failed to start IVR session' },
                { status: 500 }
            );
        }

        // Return the backend response with additional frontend-specific data
        const sessionData = backendResponse.data;
        return NextResponse.json({
            ...sessionData,
            callId,
            workflow,
            frontendSessionId: `frontend_${sessionData.session_id}`,
            websocketUrl: `${process.env.NEXT_PUBLIC_WS_URL}/ws/call/${sessionData.session_id}`,
        });

    } catch (error) {
        console.error('IVR start API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}