/**
 * BPO Client Single Client Operations
 * GET /api/v1/bpo/clients/[id] - Get client details
 * PUT /api/v1/bpo/clients/[id] - Update client
 * DELETE /api/v1/bpo/clients/[id] - Deactivate client
 */

import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { z } from 'zod';

// Update schema
const updateBPOClientSchema = z.object({
    clientName: z.string().min(2).max(100).optional(),
    phoneNumbers: z.array(z.string()).optional(),
    configSettings: z.object({
        branding: z.object({
            primaryColor: z.string().optional(),
            logo: z.string().optional(),
            companyName: z.string().optional(),
        }).optional(),
        greetingScript: z.string().optional(),
        escalationQueue: z.string().optional(),
        workingHours: z.object({
            timezone: z.string().optional(),
            start: z.string().optional(),
            end: z.string().optional(),
        }).optional(),
    }).optional(),
    crmType: z.enum(['salesforce', 'hubspot', 'zendesk', 'freshdesk', 'custom']).optional(),
    crmApiEndpoint: z.string().url().optional().nullable(),
    crmApiKey: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});

function getAuthenticatedUserId(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return 'cluser001'; // Mock - replace with JWT decode
    }
    return 'cluser001'; // Development fallback
}

type RouteContext = {
    params: Promise<{ id: string }>;
};

/**
 * GET /api/v1/bpo/clients/[id]
 * Get single BPO client details
 */
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const userId = getAuthenticatedUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const client = await prisma.bPOClient.findFirst({
            where: {
                id,
                parentAccountId: userId, // Tenant isolation
            },
            include: {
                workflows: {
                    include: {
                        workflow: {
                            select: { id: true, name: true, category: true, isActive: true }
                        }
                    }
                },
                templates: {
                    select: { id: true, name: true, category: true }
                },
                _count: {
                    select: { callRecords: true }
                }
            }
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Client not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: client.id,
                clientName: client.clientName,
                phoneNumbers: client.phoneNumbers,
                configSettings: client.configSettings,
                crmType: client.crmType,
                crmApiEndpoint: client.crmApiEndpoint,
                isActive: client.isActive,
                createdAt: client.createdAt,
                updatedAt: client.updatedAt,
                stats: {
                    totalCalls: client._count.callRecords,
                    workflowCount: client.workflows.length,
                    templateCount: client.templates.length,
                },
                workflows: client.workflows.map(w => ({
                    id: w.workflow.id,
                    name: w.workflow.name,
                    category: w.workflow.category,
                    isDefault: w.isDefault,
                    isActive: w.workflow.isActive
                })),
                templates: client.templates
            }
        });

    } catch (error) {
        console.error('Error fetching BPO client:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to fetch client' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/v1/bpo/clients/[id]
 * Update BPO client
 */
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const userId = getAuthenticatedUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify ownership
        const existingClient = await prisma.bPOClient.findFirst({
            where: {
                id,
                parentAccountId: userId,
            }
        });

        if (!existingClient) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Client not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validatedData = updateBPOClientSchema.parse(body);

        // Check for duplicate name if updating
        if (validatedData.clientName && validatedData.clientName !== existingClient.clientName) {
            const duplicateName = await prisma.bPOClient.findFirst({
                where: {
                    parentAccountId: userId,
                    clientName: validatedData.clientName,
                    id: { not: id }
                }
            });

            if (duplicateName) {
                return NextResponse.json(
                    { error: 'Conflict', message: 'A client with this name already exists' },
                    { status: 409 }
                );
            }
        }

        // Merge configSettings if provided
        const updatedConfigSettings = validatedData.configSettings
            ? { ...(existingClient.configSettings as object), ...validatedData.configSettings }
            : existingClient.configSettings;

        const updatedClient = await prisma.bPOClient.update({
            where: { id },
            data: {
                clientName: validatedData.clientName,
                phoneNumbers: validatedData.phoneNumbers,
                configSettings: updatedConfigSettings,
                crmType: validatedData.crmType,
                crmApiEndpoint: validatedData.crmApiEndpoint,
                crmApiKey: validatedData.crmApiKey,
                isActive: validatedData.isActive,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Client updated successfully',
            data: {
                id: updatedClient.id,
                clientName: updatedClient.clientName,
                phoneNumbers: updatedClient.phoneNumbers,
                crmType: updatedClient.crmType,
                isActive: updatedClient.isActive,
                updatedAt: updatedClient.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating BPO client:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation Error', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to update client' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/v1/bpo/clients/[id]
 * Soft delete (deactivate) BPO client
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const userId = getAuthenticatedUserId(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify ownership
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

        // Soft delete - deactivate instead of hard delete
        await prisma.bPOClient.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({
            success: true,
            message: 'Client deactivated successfully'
        });

    } catch (error) {
        console.error('Error deactivating BPO client:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to deactivate client' },
            { status: 500 }
        );
    }
}
