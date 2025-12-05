/**
 * BPO Client Management API
 * POST /api/v1/bpo/clients - Create new sub-client
 * GET /api/v1/bpo/clients - List all clients for authenticated BPO user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating a BPO client
const createBPOClientSchema = z.object({
    clientName: z.string().min(2).max(100),
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
    }).optional().default({}),
    crmType: z.enum(['salesforce', 'hubspot', 'zendesk', 'freshdesk', 'custom']).optional(),
    crmApiEndpoint: z.string().url().optional(),
    crmApiKey: z.string().optional(),
});

// Mock user ID for development (replace with actual auth)
function getAuthenticatedUserId(request: NextRequest): string | null {
    // In production, extract from Bearer token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        // Decode JWT and extract user ID
        // For now, return mock user
        return 'cluser001';
    }
    // Development fallback
    return 'cluser001';
}

/**
 * GET /api/v1/bpo/clients
 * List all BPO clients for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const userId = getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const isActive = searchParams.get('isActive');

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            parentAccountId: userId,
        };

        if (search) {
            where.clientName = {
                contains: search,
            };
        }

        if (isActive !== null && isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        // Fetch clients with pagination
        const [clients, total] = await Promise.all([
            prisma.bPOClient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    workflows: {
                        include: {
                            workflow: {
                                select: { id: true, name: true }
                            }
                        }
                    },
                    _count: {
                        select: { callRecords: true }
                    }
                }
            }),
            prisma.bPOClient.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: clients.map(client => ({
                id: client.id,
                clientName: client.clientName,
                phoneNumbers: client.phoneNumbers,
                crmType: client.crmType,
                isActive: client.isActive,
                createdAt: client.createdAt,
                updatedAt: client.updatedAt,
                workflowCount: client.workflows.length,
                callCount: client._count.callRecords,
                workflows: client.workflows.map(w => ({
                    id: w.workflow.id,
                    name: w.workflow.name,
                    isDefault: w.isDefault
                }))
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching BPO clients:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/bpo/clients
 * Create a new BPO sub-client
 */
export async function POST(request: NextRequest) {
    try {
        const userId = getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate request body
        const validatedData = createBPOClientSchema.parse(body);

        // Check for duplicate client name
        const existingClient = await prisma.bPOClient.findFirst({
            where: {
                parentAccountId: userId,
                clientName: validatedData.clientName
            }
        });

        if (existingClient) {
            return NextResponse.json(
                { error: 'Conflict', message: 'A client with this name already exists' },
                { status: 409 }
            );
        }

        // Create the client
        const newClient = await prisma.bPOClient.create({
            data: {
                parentAccountId: userId,
                clientName: validatedData.clientName,
                phoneNumbers: validatedData.phoneNumbers || [],
                configSettings: validatedData.configSettings || {},
                crmType: validatedData.crmType,
                crmApiEndpoint: validatedData.crmApiEndpoint,
                crmApiKey: validatedData.crmApiKey, // Should be encrypted in production
                isActive: true,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'BPO client created successfully',
            data: {
                id: newClient.id,
                clientName: newClient.clientName,
                phoneNumbers: newClient.phoneNumbers,
                crmType: newClient.crmType,
                isActive: newClient.isActive,
                createdAt: newClient.createdAt
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating BPO client:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Validation Error',
                    message: 'Invalid request data',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to create client' },
            { status: 500 }
        );
    }
}
