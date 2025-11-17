import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const societyId = searchParams.get('societyId');
        const status = searchParams.get('status');
        const role = searchParams.get('role');

        const where: any = {};

        if (societyId) {
            where.societyId = societyId;
        }

        if (status) {
            where.status = status;
        }

        if (role) {
            where.role = role;
        }

        const members = await prisma.cooperativeMember.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                society: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        region: true
                    }
                }
            },
            orderBy: {
                joinedAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: members
        });
    } catch (error) {
        console.error('Error fetching cooperative members:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch members' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, societyId, role, contributionAmount, performanceRating } = body;

        if (!userId || !societyId) {
            return NextResponse.json(
                { success: false, error: 'User ID and Society ID are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if society exists
        const society = await prisma.cooperativeSociety.findUnique({
            where: { id: societyId }
        });

        if (!society) {
            return NextResponse.json(
                { success: false, error: 'Society not found' },
                { status: 404 }
            );
        }

        // Check if member already exists
        const existingMember = await prisma.cooperativeMember.findFirst({
            where: {
                userId,
                societyId
            }
        });

        if (existingMember) {
            return NextResponse.json(
                { success: false, error: 'User is already a member of this society' },
                { status: 400 }
            );
        }

        const member = await prisma.cooperativeMember.create({
            data: {
                userId,
                societyId,
                role: role || 'member',
                status: 'pending',
                contributionAmount,
                performanceRating
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                society: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        region: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error('Error creating cooperative member:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create member' },
            { status: 500 }
        );
    }
}