import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cooperative/societies - Get all cooperative societies
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const region = searchParams.get('region');
        const status = searchParams.get('status');

        const where: any = {};
        if (type) where.type = type;
        if (region) where.region = region;
        if (status) where.status = status;

        const societies = await prisma.cooperativeSociety.findMany({
            where,
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
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                },
                _count: {
                    select: {
                        members: true,
                        strategies: true,
                        initiatives: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: societies
        });
    } catch (error) {
        console.error('Error fetching cooperative societies:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cooperative societies' },
            { status: 500 }
        );
    }
}

// POST /api/cooperative/societies - Create a new cooperative society
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, type, region } = body;

        if (!name || !type || !region) {
            return NextResponse.json(
                { success: false, error: 'Name, type, and region are required' },
                { status: 400 }
            );
        }

        const society = await prisma.cooperativeSociety.create({
            data: {
                name,
                description,
                type,
                region
            },
            include: {
                members: true,
                strategies: true,
                initiatives: true
            }
        });

        return NextResponse.json({
            success: true,
            data: society
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating cooperative society:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create cooperative society' },
            { status: 500 }
        );
    }
}