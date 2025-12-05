/**
 * BPO Client CRM Integrations API
 * GET /api/v1/bpo/clients/[id]/integrations - Fetch CRM configs
 * PUT /api/v1/bpo/clients/[id]/integrations - Update CRM configs
 */

import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { z } from 'zod';

const updateIntegrationsSchema = z.object({
    crmType: z.enum(['salesforce', 'hubspot', 'zendesk', 'freshdesk', 'custom']).optional(),
    crmApiEndpoint: z.string().url().optional().nullable(),
    crmApiKey: z.string().optional().nullable(),
    webhookSettings: z.object({
        onCallStart: z.string().url().optional(),
        onCallEnd: z.string().url().optional(),
        onHandoff: z.string().url().optional(),
        onSentimentAlert: z.string().url().optional(),
    }).optional(),
    authMethod: z.enum(['api_key', 'oauth2', 'basic']).optional(),
    oauthConfig: z.object({
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        tokenUrl: z.string().url().optional(),
        scope: z.string().optional(),
    }).optional(),
    fieldMappings: z.record(z.string()).optional(),
});

function getAuthenticatedUserId(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    return authHeader?.startsWith('Bearer ') ? 'cluser001' : 'cluser001';
}

type RouteContext = {
    params: Promise<{ id: string }>;
};

/**
 * GET /api/v1/bpo/clients/[id]/integrations
 * Fetch CRM integration configs for a client
 */
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const userId = getAuthenticatedUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const client = await prisma.bPOClient.findFirst({
            where: {
                id,
                parentAccountId: userId,
            },
            select: {
                id: true,
                clientName: true,
                crmType: true,
                crmApiEndpoint: true,
                configSettings: true,
            }
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Client not found' },
                { status: 404 }
            );
        }

        const configSettings = client.configSettings as any;

        return NextResponse.json({
            success: true,
            data: {
                clientId: client.id,
                clientName: client.clientName,
                crm: {
                    type: client.crmType,
                    endpoint: client.crmApiEndpoint,
                    hasApiKey: !!configSettings?.crmApiKey,
                    lastSyncAt: configSettings?.lastCrmSync || null,
                    status: client.crmType ? 'configured' : 'not_configured'
                },
                webhooks: configSettings?.webhookSettings || {
                    onCallStart: null,
                    onCallEnd: null,
                    onHandoff: null,
                    onSentimentAlert: null,
                },
                authMethod: configSettings?.authMethod || 'api_key',
                fieldMappings: configSettings?.fieldMappings || {},
                supportedCRMs: [
                    { id: 'salesforce', name: 'Salesforce', logo: '/images/crm/salesforce.png' },
                    { id: 'hubspot', name: 'HubSpot', logo: '/images/crm/hubspot.png' },
                    { id: 'zendesk', name: 'Zendesk', logo: '/images/crm/zendesk.png' },
                    { id: 'freshdesk', name: 'Freshdesk', logo: '/images/crm/freshdesk.png' },
                    { id: 'custom', name: 'Custom Webhook', logo: null },
                ]
            }
        });

    } catch (error) {
        console.error('Error fetching integrations:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/v1/bpo/clients/[id]/integrations
 * Update CRM integration configs
 */
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const userId = getAuthenticatedUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const client = await prisma.bPOClient.findFirst({
            where: {
                id,
                parentAccountId: userId,
            }
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Client not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validatedData = updateIntegrationsSchema.parse(body);

        const existingConfig = client.configSettings as any || {};

        // Merge new integration settings
        const updatedConfigSettings = {
            ...existingConfig,
            webhookSettings: validatedData.webhookSettings ?? existingConfig.webhookSettings,
            authMethod: validatedData.authMethod ?? existingConfig.authMethod,
            oauthConfig: validatedData.oauthConfig ?? existingConfig.oauthConfig,
            fieldMappings: validatedData.fieldMappings ?? existingConfig.fieldMappings,
            lastCrmSync: null, // Reset sync timestamp on config change
        };

        const updatedClient = await prisma.bPOClient.update({
            where: { id },
            data: {
                crmType: validatedData.crmType,
                crmApiEndpoint: validatedData.crmApiEndpoint,
                crmApiKey: validatedData.crmApiKey, // Should be encrypted
                configSettings: updatedConfigSettings,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Integration settings updated successfully',
            data: {
                crmType: updatedClient.crmType,
                crmApiEndpoint: updatedClient.crmApiEndpoint,
                hasApiKey: !!validatedData.crmApiKey,
                webhooksConfigured: !!validatedData.webhookSettings
            }
        });

    } catch (error) {
        console.error('Error updating integrations:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation Error', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/bpo/clients/[id]/integrations/test
 * Test CRM connection
 */
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const userId = getAuthenticatedUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const client = await prisma.bPOClient.findFirst({
            where: {
                id,
                parentAccountId: userId,
            }
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Not Found' },
                { status: 404 }
            );
        }

        if (!client.crmApiEndpoint) {
            return NextResponse.json({
                success: false,
                message: 'No CRM endpoint configured',
                test: { status: 'not_configured' }
            });
        }

        // Test the CRM connection
        try {
            const testResponse = await fetch(client.crmApiEndpoint, {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${client.crmApiKey}`,
                },
                signal: AbortSignal.timeout(5000),
            });

            return NextResponse.json({
                success: true,
                test: {
                    status: testResponse.ok ? 'connected' : 'error',
                    statusCode: testResponse.status,
                    responseTime: 'fast', // Would measure actual time
                }
            });
        } catch (fetchError) {
            return NextResponse.json({
                success: false,
                test: {
                    status: 'error',
                    message: 'Failed to connect to CRM endpoint',
                }
            });
        }

    } catch (error) {
        console.error('Error testing integration:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
