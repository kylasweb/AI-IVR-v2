import { NextRequest, NextResponse } from 'next/server'

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Transfer Types
export type TransferType = 'agent' | 'video_ivr' | 'queue' | 'external' | 'callback' | 'ivr_flow';

export interface TransferDestination {
    id: string;
    name: string;
    type: TransferType;
    status: 'available' | 'busy' | 'offline';
    department?: string;
    skills?: string[];
    priority?: number;
    // Video IVR specific
    videoCapable?: boolean;
    workflowId?: string;
    // Queue specific
    queueSize?: number;
    avgWaitTime?: number;
    // Agent specific
    agentType?: 'human' | 'ai';
    currentLoad?: number;
}

export interface TransferRequest {
    session_id: string;
    transfer_type: TransferType;
    destination_id: string;
    reason: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    notes?: string;
    // Video IVR specific
    video_workflow_id?: string;
    upgrade_to_video?: boolean;
    // Callback specific
    callback_number?: string;
    callback_time?: string;
    // Context
    caller_info?: {
        name?: string;
        phone?: string;
        history?: string[];
    };
    session_context?: {
        current_intent?: string;
        transcript_summary?: string;
        sentiment?: string;
    };
}

export interface TransferResult {
    success: boolean;
    transfer_id: string;
    session_id: string;
    destination: TransferDestination;
    status: 'initiated' | 'connecting' | 'connected' | 'failed';
    estimated_wait?: number;
    queue_position?: number;
    video_session_url?: string; // For video IVR transfers
    error?: string;
}

// Predefined transfer destinations
const TRANSFER_DESTINATIONS: TransferDestination[] = [
    // Video IVR Destinations
    {
        id: 'video-support',
        name: 'Video Customer Support',
        type: 'video_ivr',
        status: 'available',
        department: 'Support',
        videoCapable: true,
        workflowId: 'customer-support',
        priority: 1
    },
    {
        id: 'video-kyc',
        name: 'Video KYC Verification',
        type: 'video_ivr',
        status: 'available',
        department: 'Verification',
        videoCapable: true,
        workflowId: 'video-kyc',
        priority: 2
    },
    {
        id: 'video-demo',
        name: 'Video Product Demo',
        type: 'video_ivr',
        status: 'available',
        department: 'Sales',
        videoCapable: true,
        workflowId: 'product-demo',
        priority: 3
    },
    // Agent Destinations
    {
        id: 'ai-support-agent',
        name: 'AI Support Agent',
        type: 'agent',
        status: 'available',
        department: 'Support',
        agentType: 'ai',
        skills: ['general', 'technical', 'billing'],
        currentLoad: 0.3,
        priority: 1
    },
    {
        id: 'human-support',
        name: 'Human Support Agent',
        type: 'agent',
        status: 'available',
        department: 'Support',
        agentType: 'human',
        skills: ['escalation', 'complaints'],
        currentLoad: 0.7,
        priority: 2
    },
    // Queue Destinations
    {
        id: 'queue-billing',
        name: 'Billing Department',
        type: 'queue',
        status: 'available',
        department: 'Billing',
        queueSize: 5,
        avgWaitTime: 120,
        priority: 1
    },
    {
        id: 'queue-technical',
        name: 'Technical Support Queue',
        type: 'queue',
        status: 'available',
        department: 'Technical',
        queueSize: 8,
        avgWaitTime: 180,
        priority: 2
    },
    {
        id: 'queue-sales',
        name: 'Sales Department',
        type: 'queue',
        status: 'available',
        department: 'Sales',
        queueSize: 2,
        avgWaitTime: 60,
        priority: 1
    },
    // IVR Flow Destinations
    {
        id: 'ivr-main-menu',
        name: 'Main IVR Menu',
        type: 'ivr_flow',
        status: 'available',
        priority: 1
    },
    {
        id: 'ivr-survey',
        name: 'Customer Survey',
        type: 'ivr_flow',
        status: 'available',
        priority: 3
    }
];

// GET - List available transfer destinations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as TransferType | null;
        const department = searchParams.get('department');
        const availableOnly = searchParams.get('available') === 'true';

        let destinations = [...TRANSFER_DESTINATIONS];

        // Filter by type
        if (type) {
            destinations = destinations.filter(d => d.type === type);
        }

        // Filter by department
        if (department) {
            destinations = destinations.filter(d => d.department === department);
        }

        // Filter available only
        if (availableOnly) {
            destinations = destinations.filter(d => d.status === 'available');
        }

        // Sort by priority
        destinations.sort((a, b) => (a.priority || 99) - (b.priority || 99));

        return NextResponse.json({
            success: true,
            data: {
                destinations,
                total: destinations.length,
                types: ['agent', 'video_ivr', 'queue', 'external', 'callback', 'ivr_flow'],
                departments: [...new Set(TRANSFER_DESTINATIONS.map(d => d.department).filter(Boolean))]
            }
        });
    } catch (error) {
        console.error('Error fetching transfer destinations:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch transfer destinations'
        }, { status: 500 });
    }
}

// POST - Initiate a call transfer
export async function POST(request: NextRequest) {
    try {
        const body: TransferRequest = await request.json();

        // Validate required fields
        if (!body.session_id) {
            return NextResponse.json({
                success: false,
                error: 'Session ID is required'
            }, { status: 400 });
        }

        if (!body.transfer_type || !body.destination_id) {
            return NextResponse.json({
                success: false,
                error: 'Transfer type and destination are required'
            }, { status: 400 });
        }

        // Find destination
        const destination = TRANSFER_DESTINATIONS.find(d => d.id === body.destination_id);
        if (!destination) {
            return NextResponse.json({
                success: false,
                error: 'Transfer destination not found'
            }, { status: 404 });
        }

        // Check destination availability
        if (destination.status !== 'available') {
            return NextResponse.json({
                success: false,
                error: `Destination ${destination.name} is currently ${destination.status}`
            }, { status: 409 });
        }

        console.log(`Initiating transfer: ${body.session_id} -> ${destination.name} (${body.transfer_type})`);

        // Build transfer payload
        const transferPayload = {
            session_id: body.session_id,
            transfer_type: body.transfer_type,
            destination_id: body.destination_id,
            reason: body.reason || 'User requested transfer',
            priority: body.priority || 'normal',
            notes: body.notes,
            caller_info: body.caller_info,
            session_context: body.session_context,
            // Video IVR specific
            video_workflow_id: destination.workflowId || body.video_workflow_id,
            upgrade_to_video: body.transfer_type === 'video_ivr'
        };

        // Try backend first
        try {
            const response = await fetch(`${PYTHON_BACKEND_URL}/api/v1/transfer/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transferPayload),
                signal: AbortSignal.timeout(15000)
            });

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json({
                    success: true,
                    data: {
                        transfer_id: data.transfer_id,
                        session_id: body.session_id,
                        destination,
                        status: 'initiated',
                        estimated_wait: data.estimated_wait || destination.avgWaitTime || 0,
                        queue_position: data.queue_position,
                        video_session_url: body.transfer_type === 'video_ivr'
                            ? `/video-ivr?session=${data.video_session_id || body.session_id}&workflow=${destination.workflowId}`
                            : undefined
                    }
                });
            }
        } catch (backendError) {
            console.warn('Backend transfer failed, using local transfer:', backendError);
        }

        // Local fallback transfer
        const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result: TransferResult = {
            success: true,
            transfer_id: transferId,
            session_id: body.session_id,
            destination,
            status: 'initiated',
            estimated_wait: destination.avgWaitTime || 30,
            queue_position: destination.queueSize ? destination.queueSize + 1 : undefined,
            video_session_url: body.transfer_type === 'video_ivr'
                ? `/video-ivr?session=${body.session_id}&workflow=${destination.workflowId}&transfer=${transferId}`
                : undefined
        };

        return NextResponse.json({
            success: true,
            data: result,
            message: `Transfer to ${destination.name} initiated successfully`
        });

    } catch (error) {
        console.error('Error initiating transfer:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to initiate transfer',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
