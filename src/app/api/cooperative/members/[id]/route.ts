import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const member = await db.cooperativeMember.findUnique({
            where: { id: params.id },
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

        if (!member) {
            return NextResponse.json(
                { success: false, error: 'Member not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error('Error fetching cooperative member:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch member' },
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
        const { role, status, contributionAmount, performanceRating } = body;

        const member = await db.cooperativeMember.update({
            where: { id: params.id },
            data: {
                ...(role && { role }),
                ...(status && { status }),
                ...(contributionAmount !== undefined && { contributionAmount }),
                ...(performanceRating !== undefined && { performanceRating })
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
        console.error('Error updating cooperative member:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update member' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await db.cooperativeMember.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Error deleting cooperative member:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove member' },
            { status: 500 }
        );
    }
}