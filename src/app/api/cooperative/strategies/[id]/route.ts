import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/cooperative/strategies/[id] - Get a specific cooperative strategy
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const strategy = await db.cooperativeStrategy.findUnique({
            where: { id: params.id },
            include: {
                society: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        region: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                milestones: {
                    orderBy: {
                        targetDate: 'asc'
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
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!strategy) {
            return NextResponse.json(
                { success: false, error: 'Cooperative strategy not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: strategy
        });
    } catch (error) {
        console.error('Error fetching cooperative strategy:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cooperative strategy' },
            { status: 500 }
        );
    }
}

// PUT /api/cooperative/strategies/[id] - Update a cooperative strategy
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { title, description, category, priority, status, targetDate, budget, assignedTo } = body;

        const strategy = await db.cooperativeStrategy.update({
            where: { id: params.id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(category && { category }),
                ...(priority && { priority }),
                ...(status && { status }),
                ...(targetDate && { targetDate: new Date(targetDate) }),
                ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
                ...(assignedTo !== undefined && { assignedTo })
            },
            include: {
                society: {
                    select: {
                        id: true,
                        name: true
                    }
                },
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
                milestones: true
            }
        });

        return NextResponse.json({
            success: true,
            data: strategy
        });
    } catch (error) {
        console.error('Error updating cooperative strategy:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update cooperative strategy' },
            { status: 500 }
        );
    }
}

// DELETE /api/cooperative/strategies/[id] - Delete a cooperative strategy
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await db.cooperativeStrategy.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Cooperative strategy deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cooperative strategy:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete cooperative strategy' },
            { status: 500 }
        );
    }
}