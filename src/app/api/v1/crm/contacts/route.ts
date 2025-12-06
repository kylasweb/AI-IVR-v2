/**
 * CRM Contacts API
 * Full CRUD for contact management
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Types
interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    title: string;
    status: 'active' | 'inactive' | 'lead' | 'prospect';
    source: string;
    score: number;
    tags: string[];
    accountId?: string;
    ownerId?: string;
    notes: string;
    customFields?: Record<string, unknown>;
    lastContactedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// GET - List/search contacts
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const tag = searchParams.get('tag');
        const accountId = searchParams.get('accountId');
        const ownerId = searchParams.get('ownerId');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build query conditions
        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (status) where.status = status;
        if (accountId) where.accountId = accountId;
        if (ownerId) where.ownerId = ownerId;

        // For now, return mock data
        // In production, query Prisma with above conditions
        const contacts = generateMockContacts(50)
            .filter(c => !search ||
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                c.company.toLowerCase().includes(search.toLowerCase())
            )
            .filter(c => !status || c.status === status);

        const paginatedContacts = contacts.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            success: true,
            data: {
                contacts: paginatedContacts,
                pagination: {
                    page,
                    limit,
                    total: contacts.length,
                    totalPages: Math.ceil(contacts.length / limit)
                },
                stats: {
                    total: contacts.length,
                    active: contacts.filter(c => c.status === 'active').length,
                    leads: contacts.filter(c => c.status === 'lead').length,
                    prospects: contacts.filter(c => c.status === 'prospect').length
                }
            }
        });
    } catch (error) {
        console.error('CRM contacts GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contacts' },
            { status: 500 }
        );
    }
}

// POST - Create new contact
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, phone, company, title, status, source, tags, accountId, ownerId, notes, customFields } = body;

        if (!firstName || !lastName || !email) {
            return NextResponse.json(
                { success: false, error: 'firstName, lastName, and email are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Calculate lead score based on attributes
        const score = calculateLeadScore({ source, company, title, tags });

        const contact: Contact = {
            id: `contact_${Date.now()}`,
            firstName,
            lastName,
            email,
            phone: phone || '',
            company: company || '',
            title: title || '',
            status: status || 'lead',
            source: source || 'Manual Entry',
            score,
            tags: tags || [],
            accountId,
            ownerId,
            notes: notes || '',
            customFields,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // In production, save to database
        // await db.contact.create({ data: contact });

        return NextResponse.json({
            success: true,
            data: contact
        }, { status: 201 });
    } catch (error) {
        console.error('CRM contacts POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create contact' },
            { status: 500 }
        );
    }
}

// PUT - Bulk update contacts
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { contactIds, updates } = body;

        if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'contactIds array is required' },
                { status: 400 }
            );
        }

        if (!updates || Object.keys(updates).length === 0) {
            return NextResponse.json(
                { success: false, error: 'updates object is required' },
                { status: 400 }
            );
        }

        // Validate allowed update fields
        const allowedFields = ['status', 'ownerId', 'tags', 'score', 'accountId'];
        const updateFields = Object.keys(updates);
        const invalidFields = updateFields.filter(f => !allowedFields.includes(f));

        if (invalidFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Invalid update fields: ${invalidFields.join(', ')}` },
                { status: 400 }
            );
        }

        // In production, bulk update in database
        return NextResponse.json({
            success: true,
            data: {
                updatedCount: contactIds.length,
                contactIds,
                updates
            }
        });
    } catch (error) {
        console.error('CRM contacts PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update contacts' },
            { status: 500 }
        );
    }
}

// DELETE - Bulk delete contacts
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { contactIds, hardDelete = false } = body;

        if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'contactIds array is required' },
                { status: 400 }
            );
        }

        // In production:
        // - Soft delete: set deletedAt timestamp
        // - Hard delete: actually remove from database

        return NextResponse.json({
            success: true,
            data: {
                deletedCount: contactIds.length,
                contactIds,
                hardDelete
            }
        });
    } catch (error) {
        console.error('CRM contacts DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete contacts' },
            { status: 500 }
        );
    }
}

// Helper: Calculate lead score
function calculateLeadScore(data: { source?: string; company?: string; title?: string; tags?: string[] }): number {
    let score = 50; // Base score

    // Source scoring
    const sourceScores: Record<string, number> = {
        'Referral': 20,
        'Inbound Call': 15,
        'Website': 10,
        'Trade Show': 12,
        'Cold Call': 5,
        'Manual Entry': 0
    };
    score += sourceScores[data.source || ''] || 0;

    // Title scoring
    const titleKeywords: Record<string, number> = {
        'CEO': 15,
        'CFO': 15,
        'CTO': 15,
        'VP': 12,
        'Director': 10,
        'Manager': 8
    };
    if (data.title) {
        for (const [keyword, points] of Object.entries(titleKeywords)) {
            if (data.title.toUpperCase().includes(keyword)) {
                score += points;
                break;
            }
        }
    }

    // Tag scoring
    const tagScores: Record<string, number> = {
        'Decision Maker': 10,
        'VIP': 10,
        'Hot Lead': 15,
        'Qualified': 8,
        'Enterprise': 12
    };
    if (data.tags) {
        for (const tag of data.tags) {
            score += tagScores[tag] || 0;
        }
    }

    return Math.min(100, Math.max(0, score));
}

// Helper: Generate mock contacts
function generateMockContacts(count: number): Contact[] {
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'James', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
    const companies = ['ACME Corp', 'Globex Inc', 'Stark Industries', 'Wayne Enterprises', 'Umbrella Corp', 'Cyberdyne Systems', 'Initech', 'Massive Dynamic'];
    const titles = ['CEO', 'CFO', 'CTO', 'VP Sales', 'Director of Operations', 'Manager', 'Accounts Lead', 'Head of Procurement'];
    const sources = ['Inbound Call', 'Website', 'Referral', 'Trade Show', 'Cold Call', 'LinkedIn'];
    const statuses: Contact['status'][] = ['active', 'inactive', 'lead', 'prospect'];
    const tagOptions = ['Decision Maker', 'VIP', 'Hot Lead', 'Qualified', 'Enterprise', 'Follow Up', 'Churned'];

    const contacts: Contact[] = [];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const numTags = Math.floor(Math.random() * 3);
        const tags = Array.from({ length: numTags }, () => tagOptions[Math.floor(Math.random() * tagOptions.length)]);

        const contact: Contact = {
            id: `contact_${1000 + i}`,
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s/g, '')}.com`,
            phone: `+1 555-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            company,
            title: titles[Math.floor(Math.random() * titles.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            source,
            score: calculateLeadScore({ source, company, title: titles[0], tags }),
            tags: [...new Set(tags)], // Remove duplicates
            notes: '',
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
        };

        contacts.push(contact);
    }

    return contacts;
}
