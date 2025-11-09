import { NextRequest, NextResponse } from 'next/server';

interface CPaaSProvider {
    id: string;
    name: string;
    type: 'voice' | 'sms' | 'whatsapp' | 'email' | 'multi';
    provider: 'twilio' | 'exotel' | 'knowlarity' | 'msg91' | 'aws_sns' | 'azure_communication' | 'custom';
    status: 'active' | 'inactive' | 'testing' | 'error';
    configuration: {
        accountSid?: string;
        authToken?: string;
        apiKey?: string;
        apiSecret?: string;
        webhookUrl?: string;
        region?: string;
        environment?: 'production' | 'sandbox';
    };
    features: string[];
    pricing: {
        voiceRate?: number;
        smsRate?: number;
        whatsappRate?: number;
        currency: string;
    };
    usage: {
        voiceCalls: number;
        smsCount: number;
        whatsappMessages: number;
        monthlyCost: number;
    };
    limits: {
        dailyLimit?: number;
        monthlyLimit?: number;
        rateLimit?: number;
    };
    createdAt: string;
    updatedAt: string;
}

// Mock data store (in a real app, this would be a database)
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
    },
    {
        id: '2',
        name: 'Exotel India',
        type: 'voice',
        provider: 'exotel',
        status: 'active',
        configuration: {
            apiKey: 'EXxxxxxxxxxx',
            apiSecret: '****',
            region: 'mumbai',
            environment: 'production'
        },
        features: ['Voice', 'IVR', 'Call Recording'],
        pricing: {
            voiceRate: 0.012,
            currency: 'INR'
        },
        usage: {
            voiceCalls: 8750,
            smsCount: 0,
            whatsappMessages: 0,
            monthlyCost: 890.45
        },
        limits: {
            dailyLimit: 5000,
            monthlyLimit: 150000
        },
        createdAt: '2024-02-20T00:00:00Z',
        updatedAt: new Date().toISOString()
    }
];

// GET - Fetch all CPaaS providers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        let filteredProviders = providers;

        // Apply filters
        if (status && status !== 'all') {
            filteredProviders = filteredProviders.filter(p => p.status === status);
        }

        if (type && type !== 'all') {
            filteredProviders = filteredProviders.filter(p => p.type === type);
        }

        if (search) {
            filteredProviders = filteredProviders.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.provider.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Calculate stats
        const stats = {
            totalProviders: providers.length,
            activeProviders: providers.filter(p => p.status === 'active').length,
            totalCalls: providers.reduce((sum, p) => sum + p.usage.voiceCalls, 0),
            totalSMS: providers.reduce((sum, p) => sum + p.usage.smsCount, 0),
            totalCost: providers.reduce((sum, p) => sum + p.usage.monthlyCost, 0),
            avgResponseTime: 1.2
        };

        return NextResponse.json({
            success: true,
            data: {
                providers: filteredProviders,
                stats
            }
        });
    } catch (error) {
        console.error('Error fetching CPaaS providers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch providers' },
            { status: 500 }
        );
    }
}

// POST - Create a new CPaaS provider
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const newProvider: CPaaSProvider = {
            id: Date.now().toString(),
            name: body.name,
            type: body.type,
            provider: body.provider,
            status: body.status || 'inactive',
            configuration: body.configuration || {},
            features: body.features || [],
            pricing: body.pricing || { currency: 'USD' },
            usage: {
                voiceCalls: 0,
                smsCount: 0,
                whatsappMessages: 0,
                monthlyCost: 0
            },
            limits: body.limits || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        providers.push(newProvider);

        return NextResponse.json({
            success: true,
            data: newProvider,
            message: 'CPaaS provider created successfully'
        });
    } catch (error) {
        console.error('Error creating CPaaS provider:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create provider' },
            { status: 500 }
        );
    }
}

// PUT - Update an existing CPaaS provider
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        const providerIndex = providers.findIndex(p => p.id === id);
        if (providerIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Provider not found' },
                { status: 404 }
            );
        }

        providers[providerIndex] = {
            ...providers[providerIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: providers[providerIndex],
            message: 'CPaaS provider updated successfully'
        });
    } catch (error) {
        console.error('Error updating CPaaS provider:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update provider' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a CPaaS provider
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Provider ID is required' },
                { status: 400 }
            );
        }

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
            message: 'CPaaS provider deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting CPaaS provider:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete provider' },
            { status: 500 }
        );
    }
}