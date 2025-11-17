import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const strategyId = searchParams.get('strategyId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        const where: any = {};

        if (strategyId) {
            where.strategyId = strategyId;
        }

        if (status) {
            where.status = status;
        }

        if (priority) {
            where.priority = priority;
        }

        const initiatives = await prisma.cooperativeInitiative.findMany({
            where,
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: initiatives
        });
    } catch (error) {
        console.error('Error fetching cooperative initiatives:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch initiatives' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { strategyId, title, description, priority, startDate, endDate, budget, assignedTo } = body;

        if (!strategyId || !title) {
            return NextResponse.json(
                { success: false, error: 'Strategy ID and title are required' },
                { status: 400 }
            );
        }

        // Check if strategy exists
        const strategy = await prisma.cooperativeStrategy.findUnique({
            where: { id: strategyId }
        });

        if (!strategy) {
            return NextResponse.json(
                { success: false, error: 'Strategy not found' },
                { status: 404 }
            );
        }

        const initiative = await prisma.cooperativeInitiative.create({
            data: {
                strategyId,
                title,
                description,
                status: 'planned',
                priority: priority || 'medium',
                progress: 0,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budget,
                assignedTo
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
        console.error('Error creating cooperative initiative:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create initiative' },
            { status: 500 }
        );
    }
}