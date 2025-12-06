/**
 * CRM Activities API
 * Calls, emails, meetings, notes, and tasks
 */

import { NextRequest, NextResponse } from 'next/server';

type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';

interface Activity {
    id: string;
    type: ActivityType;
    subject: string;
    description: string;
    contactId: string;
    contactName: string;
    accountId?: string;
    dealId?: string;
    ownerId: string;
    ownerName: string;
    outcome?: string;
    duration?: number; // minutes
    dueDate?: string;
    completedAt?: string;
    status: 'pending' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    tags: string[];
    attachments: string[];
    createdAt: string;
    updatedAt: string;
}

// GET - List activities
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') as ActivityType | null;
        const contactId = searchParams.get('contactId');
        const accountId = searchParams.get('accountId');
        const dealId = searchParams.get('dealId');
        const ownerId = searchParams.get('ownerId');
        const status = searchParams.get('status');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Generate mock activities
        const activities = generateMockActivities(100);

        // Apply filters
        let filtered = activities;
        if (type) filtered = filtered.filter(a => a.type === type);
        if (contactId) filtered = filtered.filter(a => a.contactId === contactId);
        if (accountId) filtered = filtered.filter(a => a.accountId === accountId);
        if (dealId) filtered = filtered.filter(a => a.dealId === dealId);
        if (ownerId) filtered = filtered.filter(a => a.ownerId === ownerId);
        if (status) filtered = filtered.filter(a => a.status === status);

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Apply limit
        const limited = filtered.slice(0, limit);

        // Calculate stats
        const stats = {
            total: filtered.length,
            byType: {
                call: filtered.filter(a => a.type === 'call').length,
                email: filtered.filter(a => a.type === 'email').length,
                meeting: filtered.filter(a => a.type === 'meeting').length,
                note: filtered.filter(a => a.type === 'note').length,
                task: filtered.filter(a => a.type === 'task').length
            },
            pending: filtered.filter(a => a.status === 'pending').length,
            completed: filtered.filter(a => a.status === 'completed').length,
            overdue: filtered.filter(a =>
                a.status === 'pending' && a.dueDate && new Date(a.dueDate) < new Date()
            ).length
        };

        return NextResponse.json({
            success: true,
            data: {
                activities: limited,
                stats
            }
        });
    } catch (error) {
        console.error('CRM activities GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}

// POST - Create activity
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, subject, description, contactId, contactName, accountId, dealId, ownerId, ownerName, outcome, duration, dueDate, priority, tags } = body;

        if (!type || !subject || !contactId) {
            return NextResponse.json(
                { success: false, error: 'type, subject, and contactId are required' },
                { status: 400 }
            );
        }

        const validTypes: ActivityType[] = ['call', 'email', 'meeting', 'note', 'task'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        const activity: Activity = {
            id: `activity_${Date.now()}`,
            type,
            subject,
            description: description || '',
            contactId,
            contactName: contactName || 'Unknown',
            accountId,
            dealId,
            ownerId: ownerId || 'unassigned',
            ownerName: ownerName || 'System',
            outcome,
            duration,
            dueDate,
            status: type === 'task' ? 'pending' : 'completed',
            priority: priority || 'medium',
            tags: tags || [],
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: activity
        }, { status: 201 });
    } catch (error) {
        console.error('CRM activities POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create activity' },
            { status: 500 }
        );
    }
}

// PUT - Update activity (complete task, add outcome, etc.)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, outcome, completedAt, dueDate, priority } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id is required' },
                { status: 400 }
            );
        }

        const updates: Record<string, unknown> = {
            updatedAt: new Date().toISOString()
        };

        if (status) {
            updates.status = status;
            if (status === 'completed') {
                updates.completedAt = completedAt || new Date().toISOString();
            }
        }
        if (outcome) updates.outcome = outcome;
        if (dueDate) updates.dueDate = dueDate;
        if (priority) updates.priority = priority;

        return NextResponse.json({
            success: true,
            data: {
                id,
                ...updates
            }
        });
    } catch (error) {
        console.error('CRM activities PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update activity' },
            { status: 500 }
        );
    }
}

// DELETE - Delete activity
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id is required' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { id, deleted: true }
        });
    } catch (error) {
        console.error('CRM activities DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete activity' },
            { status: 500 }
        );
    }
}

// Helper: Generate mock activities
function generateMockActivities(count: number): Activity[] {
    const types: ActivityType[] = ['call', 'email', 'meeting', 'note', 'task'];
    const callSubjects = ['Follow-up call', 'Discovery call', 'Demo call', 'Check-in call', 'Closing call'];
    const emailSubjects = ['Sent proposal', 'Sent contract', 'Follow-up email', 'Introduction email', 'Thank you email'];
    const meetingSubjects = ['Demo presentation', 'Quarterly review', 'Contract discussion', 'Kickoff meeting', 'Training session'];
    const taskSubjects = ['Prepare proposal', 'Send quote', 'Schedule follow-up', 'Update Salesforce', 'Research competitor'];
    const noteSubjects = ['Customer feedback', 'Meeting notes', 'Call summary', 'Requirements gathered', 'Decision maker identified'];

    const outcomes = ['Positive', 'Negative', 'Neutral', 'Callback requested', 'No answer', 'Left voicemail'];
    const owners = [
        { id: 'user_1', name: 'Sarah Johnson' },
        { id: 'user_2', name: 'Mike Chen' },
        { id: 'user_3', name: 'Emily Davis' }
    ];
    const contacts = [
        { id: 'c1', name: 'John Doe' },
        { id: 'c2', name: 'Jane Smith' },
        { id: 'c3', name: 'Robert Johnson' },
        { id: 'c4', name: 'Emily Davis' },
        { id: 'c5', name: 'Michael Brown' }
    ];

    const activities: Activity[] = [];

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const owner = owners[Math.floor(Math.random() * owners.length)];

        let subject: string;
        switch (type) {
            case 'call': subject = callSubjects[Math.floor(Math.random() * callSubjects.length)]; break;
            case 'email': subject = emailSubjects[Math.floor(Math.random() * emailSubjects.length)]; break;
            case 'meeting': subject = meetingSubjects[Math.floor(Math.random() * meetingSubjects.length)]; break;
            case 'task': subject = taskSubjects[Math.floor(Math.random() * taskSubjects.length)]; break;
            default: subject = noteSubjects[Math.floor(Math.random() * noteSubjects.length)];
        }

        const isTask = type === 'task';
        const hoursAgo = Math.floor(Math.random() * 168); // Up to 7 days ago

        activities.push({
            id: `activity_${1000 + i}`,
            type,
            subject,
            description: '',
            contactId: contact.id,
            contactName: contact.name,
            accountId: `acc_${Math.floor(Math.random() * 10)}`,
            ownerId: owner.id,
            ownerName: owner.name,
            outcome: !isTask ? outcomes[Math.floor(Math.random() * outcomes.length)] : undefined,
            duration: type === 'call' || type === 'meeting' ? Math.floor(Math.random() * 60) + 5 : undefined,
            dueDate: isTask ? new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString() : undefined,
            status: isTask ? (Math.random() > 0.5 ? 'pending' : 'completed') : 'completed',
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
            tags: [],
            attachments: [],
            createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    return activities;
}
