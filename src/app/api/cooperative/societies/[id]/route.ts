import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cooperative/societies/[id] - Get a specific cooperative society
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const society = await prisma.cooperativeSociety.findUnique({
            where: { id: params.id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                strategies: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        assignee: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        milestones: true,
                        _count: {
                            select: {
                                initiatives: true
                            }
                        }
                    }
                },
                initiatives: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        assignee: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!society) {
            return NextResponse.json(
                { success: false, error: 'Cooperative society not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: society
        });
    } catch (error) {
        console.error('Error fetching cooperative society:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cooperative society' },
            { status: 500 }
        );
    }
}

// PUT /api/cooperative/societies/[id] - Update a cooperative society
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, description, type, region, status } = body;

        const society = await prisma.cooperativeSociety.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(type && { type }),
                ...(region && { region }),
                ...(status && { status })
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                strategies: true,
                initiatives: true
            }
        });

        return NextResponse.json({
            success: true,
            data: society
        });
    } catch (error) {
        console.error('Error updating cooperative society:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update cooperative society' },
            { status: 500 }
        );
    }
}

// DELETE /api/cooperative/societies/[id] - Delete a cooperative society
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.cooperativeSociety.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Cooperative society deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cooperative society:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete cooperative society' },
            { status: 500 }
        );
    }
}