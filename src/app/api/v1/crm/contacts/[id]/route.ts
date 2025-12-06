/**
 * CRM Individual Contact API
 * GET, PUT, DELETE for single contact
 */

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get single contact with full details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // In production, query database
        const contact = {
            id,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@acme.com',
            phone: '+1 555-123-4567',
            company: 'ACME Corp',
            title: 'Chief Financial Officer',
            status: 'active',
            source: 'Inbound Call',
            score: 85,
            tags: ['Decision Maker', 'VIP'],
            accountId: 'acc_001',
            ownerId: 'user_001',
            notes: 'Key decision maker for enterprise accounts',
            customFields: {
                birthday: '1985-06-15',
                preferredContactMethod: 'Phone',
                timezone: 'America/New_York'
            },
            socialProfiles: {
                linkedin: 'https://linkedin.com/in/johndoe',
                twitter: '@johndoe'
            },
            lastContactedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: new Date().toISOString(),
            // Related data
            deals: [
                { id: 'd1', name: 'ACME Enterprise License', value: 125000, stage: 'Negotiation' }
            ],
            activities: [
                { id: 'a1', type: 'call', subject: 'Follow-up on proposal', date: '2 hours ago', outcome: 'Positive' },
                { id: 'a2', type: 'email', subject: 'Sent contract draft', date: '4 hours ago' }
            ],
            tasks: [
                { id: 't1', title: 'Schedule demo', dueDate: '2024-12-10', status: 'pending' }
            ]
        };

        return NextResponse.json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('CRM contact GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contact' },
            { status: 500 }
        );
    }
}

// PUT - Update single contact
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate required fields if being updated
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid email format' },
                    { status: 400 }
                );
            }
        }

        // Allowed update fields
        const allowedFields = [
            'firstName', 'lastName', 'email', 'phone', 'company', 'title',
            'status', 'source', 'score', 'tags', 'accountId', 'ownerId',
            'notes', 'customFields', 'socialProfiles'
        ];

        const updates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(body)) {
            if (allowedFields.includes(key)) {
                updates[key] = value;
            }
        }

        // In production, update in database
        // await db.contact.update({ where: { id }, data: updates });

        const updatedContact = {
            id,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: updatedContact
        });
    } catch (error) {
        console.error('CRM contact PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update contact' },
            { status: 500 }
        );
    }
}

// DELETE - Delete single contact
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const hardDelete = searchParams.get('hardDelete') === 'true';

        // In production:
        // - Soft delete: update deletedAt timestamp
        // - Hard delete: actually remove from database

        return NextResponse.json({
            success: true,
            data: {
                id,
                deleted: true,
                hardDelete,
                deletedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('CRM contact DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete contact' },
            { status: 500 }
        );
    }
}
