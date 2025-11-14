import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    // Return current settings (in a real app, this would fetch from database)
    // For now, return mock data that matches the frontend
    const settings = {
        integration: {
            vocode: {
                api_key: process.env.VOCODE_API_KEY || '',
                base_url: process.env.VOCODE_BASE_URL || 'api.vocode.dev',
                organization_id: process.env.VOCODE_ORGANIZATION_ID || ''
            },
            openai: {
                api_key: process.env.OPENAI_API_KEY || ''
            },
            azure: {
                speech_key: process.env.AZURE_SPEECH_KEY || '',
                speech_region: process.env.AZURE_SPEECH_REGION || 'eastus'
            },
            deepgram: {
                api_key: process.env.DEEPGRAM_API_KEY || ''
            }
        }
    };

    return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { settings } = body;

        // Update environment variables (in production, this would be persisted to database)
        if (settings.integration?.vocode?.api_key) {
            process.env.VOCODE_API_KEY = settings.integration.vocode.api_key;
        }
        if (settings.integration?.vocode?.base_url) {
            process.env.VOCODE_BASE_URL = settings.integration.vocode.base_url;
        }
        if (settings.integration?.vocode?.organization_id) {
            process.env.VOCODE_ORGANIZATION_ID = settings.integration.vocode.organization_id;
        }
        if (settings.integration?.openai?.api_key) {
            process.env.OPENAI_API_KEY = settings.integration.openai.api_key;
        }
        if (settings.integration?.azure?.speech_key) {
            process.env.AZURE_SPEECH_KEY = settings.integration.azure.speech_key;
        }
        if (settings.integration?.azure?.speech_region) {
            process.env.AZURE_SPEECH_REGION = settings.integration.azure.speech_region;
        }
        if (settings.integration?.deepgram?.api_key) {
            process.env.DEEPGRAM_API_KEY = settings.integration.deepgram.api_key;
        }

        // In a real application, you would:
        // 1. Validate the API keys
        // 2. Store them securely in a database
        // 3. Update the backend services
        // 4. Restart relevant services if needed

        // For now, we'll just acknowledge the update
        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            updated: Object.keys(settings)
        });

    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}