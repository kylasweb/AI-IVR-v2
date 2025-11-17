import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const initiative = await prisma.cooperativeInitiative.findUnique({
            where: { id: params.id },
            include: {
                strategy: {
                    select: {
                        id: true,
                        title: true,
                        society: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                milestones: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                _count: {
                    select: {
                        milestones: true
                    }
                }
            }
        });

        if (!initiative) {
            return NextResponse.json(
                { success: false, error: 'Initiative not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: initiative
        });
    } catch (error) {
        console.error('Error fetching cooperative initiative:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch initiative' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { title, description, status, priority, progress, startDate, endDate, budget, assignedTo } = body;

        const initiative = await prisma.cooperativeInitiative.update({
            where: { id: params.id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
                ...(priority && { priority }),
                ...(progress !== undefined && { progress }),
                ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                ...(budget !== undefined && { budget }),
                ...(assignedTo !== undefined && { assignedTo })
            },
            include: {
                strategy: {
                    select: {
                        id: true,
                        title: true,
                        society: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        milestones: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: initiative
        });
    } catch (error) {
        console.error('Error updating cooperative initiative:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update initiative' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.cooperativeInitiative.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Initiative deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cooperative initiative:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete initiative' },
            { status: 500 }
        );
    }
}