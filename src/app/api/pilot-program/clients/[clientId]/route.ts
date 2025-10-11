import { NextRequest, NextResponse } from 'next/server';
import { pilotManager } from '@/features/pilot-program/manager';

// GET /api/pilot-program/clients/[clientId] - Get specific client details
export async function GET(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const client = pilotManager.getClient(params.clientId);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ client });
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/pilot-program/clients/[clientId] - Update client status or configuration
export async function PUT(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const body = await request.json();
        const { status } = body;

        if (status) {
            await pilotManager.updateClientStatus(params.clientId, status);
        }

        return NextResponse.json({
            success: true,
            message: 'Client updated successfully'
        });
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}