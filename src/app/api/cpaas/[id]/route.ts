import { NextRequest, NextResponse } from 'next/server';

interface CPaaSProvider {
    id: string;
    name: string;
    type: 'voice' | 'sms' | 'whatsapp' | 'email' | 'multi';
    provider: 'twilio' | 'exotel' | 'knowlarity' | 'msg91' | 'aws_sns' | 'azure_communication' | 'custom';
    status: 'active' | 'inactive' | 'testing' | 'error';
    configuration: any;
    features: string[];
    pricing: any;
    usage: any;
    limits: any;
    createdAt: string;
    updatedAt: string;
}

// Mock data - same as in main route
let providers: CPaaSProvider[] = [
    {
        id: '1',
        name: 'Twilio Production',
        type: 'multi',
        provider: 'twilio',
        status: 'active',
        configuration: {
            accountSid: 'ACxxxxxxxxxx',
            authToken: '****',
            region: 'us1',
            environment: 'production',
            webhookUrl: 'https://your-app.com/webhook/twilio'
        },
        features: ['Voice', 'SMS', 'WhatsApp', 'Video'],
        pricing: {
            voiceRate: 0.0085,
            smsRate: 0.0075,
            whatsappRate: 0.0055,
            currency: 'USD'
        },
        usage: {
            voiceCalls: 15420,
            smsCount: 28540,
            whatsappMessages: 8930,
            monthlyCost: 1245.67
        },
        limits: {
            dailyLimit: 10000,
            monthlyLimit: 300000,
            rateLimit: 100
        },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: new Date().toISOString()
    }
];

// GET - Fetch specific CPaaS provider by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const provider = providers.find(p => p.id === id);

        if (!provider) {
            return NextResponse.json(
                { success: false, error: 'Provider not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: provider
        });
    } catch (error) {
        console.error('Error fetching CPaaS provider:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch provider' },
            { status: 500 }
        );
    }
}

// PUT - Update specific CPaaS provider
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        const providerIndex = providers.findIndex(p => p.id === id);
        if (providerIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Provider not found' },
                { status: 404 }
            );
        }

        providers[providerIndex] = {
            ...providers[providerIndex],
            ...body,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: providers[providerIndex],
            message: 'Provider updated successfully'
        });
    } catch (error) {
        console.error('Error updating CPaaS provider:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update provider' },
            { status: 500 }
        );
    }
}

// DELETE - Delete specific CPaaS provider
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const providerIndex = providers.findIndex(p => p.id === id);
        if (providerIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Provider not found' },
                { status: 404 }
            );
        }

        const deletedProvider = providers.splice(providerIndex, 1)[0];

        return NextResponse.json({
            success: true,
            data: deletedProvider,
            message: 'Provider deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting CPaaS provider:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete provider' },
            { status: 500 }
        );
    }
}

// PATCH - Toggle provider status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { action } = body;

        const providerIndex = providers.findIndex(p => p.id === id);
        if (providerIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Provider not found' },
                { status: 404 }
            );
        }

        if (action === 'toggleStatus') {
            const currentStatus = providers[providerIndex].status;
            providers[providerIndex].status = currentStatus === 'active' ? 'inactive' : 'active';
            providers[providerIndex].updatedAt = new Date().toISOString();
        } else if (action === 'updateStatus') {
            const { status } = body;
            if (!status || !['active', 'inactive', 'testing', 'error'].includes(status)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid status value' },
                    { status: 400 }
                );
            }
            providers[providerIndex].status = status;
            providers[providerIndex].updatedAt = new Date().toISOString();
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: providers[providerIndex],
            message: 'Provider status updated successfully'
        });
    } catch (error) {
        console.error('Error updating provider status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update provider status' },
            { status: 500 }
        );
    }
}