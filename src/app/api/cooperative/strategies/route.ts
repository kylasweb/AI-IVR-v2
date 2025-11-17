import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cooperative/strategies - Get all cooperative strategies
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const societyId = searchParams.get('societyId');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        const where: any = {};
        if (societyId) where.societyId = societyId;
        if (category) where.category = category;
        if (status) where.status = status;
        if (priority) where.priority = priority;

        const strategies = await prisma.cooperativeStrategy.findMany({
            where,
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
                        name: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                milestones: {
                    orderBy: {
                        targetDate: 'asc'
                    }
                },
                _count: {
                    select: {
                        initiatives: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: strategies
        });
    } catch (error) {
        console.error('Error fetching cooperative strategies:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cooperative strategies' },
            { status: 500 }
        );
    }
}

// POST /api/cooperative/strategies - Create a new cooperative strategy
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { societyId, title, description, category, priority, targetDate, budget, assignedTo } = body;

        if (!societyId || !title || !category) {
            return NextResponse.json(
                { success: false, error: 'Society ID, title, and category are required' },
                { status: 400 }
            );
        }

        // Get the current user (in a real app, this would come from authentication)
        const createdBy = 'user-1'; // Placeholder - replace with actual user ID from auth

        const strategy = await prisma.cooperativeStrategy.create({
            data: {
                societyId,
                title,
                description,
                category,
                priority: priority || 'medium',
                targetDate: targetDate ? new Date(targetDate) : null,
                budget: budget ? parseFloat(budget) : null,
                createdBy,
                assignedTo
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
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating cooperative strategy:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create cooperative strategy' },
            { status: 500 }
        );
    }
}