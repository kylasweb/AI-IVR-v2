/**
 * CRM Accounts API
 * Company/organization management
 */

import { NextRequest, NextResponse } from 'next/server';

interface Account {
    id: string;
    name: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'enterprise';
    website: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    };
    annualRevenue: number;
    employees: number;
    status: 'active' | 'churned' | 'prospect';
    ownerId: string;
    parentAccountId?: string;
    contacts: number;
    deals: number;
    totalDealValue: number;
    tags: string[];
    notes: string;
    createdAt: string;
    updatedAt: string;
}

const INDUSTRIES = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
    'Education', 'Real Estate', 'Consulting', 'Telecommunications', 'Energy'
];

// GET - List/search accounts
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const industry = searchParams.get('industry');
        const size = searchParams.get('size');
        const status = searchParams.get('status');
        const ownerId = searchParams.get('ownerId');
        const minRevenue = searchParams.get('minRevenue');

        // Generate mock accounts
        const accounts = generateMockAccounts(30);

        // Apply filters
        let filtered = accounts;
        if (search) {
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.industry.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (industry) filtered = filtered.filter(a => a.industry === industry);
        if (size) filtered = filtered.filter(a => a.size === size);
        if (status) filtered = filtered.filter(a => a.status === status);
        if (ownerId) filtered = filtered.filter(a => a.ownerId === ownerId);
        if (minRevenue) filtered = filtered.filter(a => a.annualRevenue >= parseInt(minRevenue));

        // Calculate stats
        const stats = {
            total: filtered.length,
            active: filtered.filter(a => a.status === 'active').length,
            churned: filtered.filter(a => a.status === 'churned').length,
            prospects: filtered.filter(a => a.status === 'prospect').length,
            enterprise: filtered.filter(a => a.size === 'enterprise').length,
            totalRevenue: filtered.reduce((sum, a) => sum + a.annualRevenue, 0),
            totalDealValue: filtered.reduce((sum, a) => sum + a.totalDealValue, 0),
            byIndustry: INDUSTRIES.map(ind => ({
                industry: ind,
                count: filtered.filter(a => a.industry === ind).length
            })).filter(i => i.count > 0)
        };

        return NextResponse.json({
            success: true,
            data: {
                accounts: filtered,
                stats,
                industries: INDUSTRIES
            }
        });
    } catch (error) {
        console.error('CRM accounts GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch accounts' },
            { status: 500 }
        );
    }
}

// POST - Create account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, industry, size, website, phone, address, annualRevenue, employees, ownerId, tags, notes } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'name is required' },
                { status: 400 }
            );
        }

        const account: Account = {
            id: `acc_${Date.now()}`,
            name,
            industry: industry || 'Other',
            size: size || 'small',
            website: website || '',
            phone: phone || '',
            address: address || { street: '', city: '', state: '', country: '', zip: '' },
            annualRevenue: annualRevenue || 0,
            employees: employees || 0,
            status: 'prospect',
            ownerId: ownerId || 'unassigned',
            contacts: 0,
            deals: 0,
            totalDealValue: 0,
            tags: tags || [],
            notes: notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: account
        }, { status: 201 });
    } catch (error) {
        console.error('CRM accounts POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create account' },
            { status: 500 }
        );
    }
}

// PUT - Update account
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id is required' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id,
                ...updates,
                updatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('CRM accounts PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update account' },
            { status: 500 }
        );
    }
}

// DELETE - Delete account
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
        console.error('CRM accounts DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete account' },
            { status: 500 }
        );
    }
}

// Helper: Generate mock accounts
function generateMockAccounts(count: number): Account[] {
    const companyNames = [
        'ACME Corporation', 'Globex Industries', 'Stark Technologies', 'Wayne Enterprises',
        'Umbrella Corp', 'Cyberdyne Systems', 'Initech', 'Massive Dynamic', 'Oscorp',
        'LexCorp', 'Weyland-Yutani', 'Soylent Corp', 'Tyrell Corporation', 'InGen'
    ];
    const sizes: Account['size'][] = ['startup', 'small', 'medium', 'enterprise'];
    const statuses: Account['status'][] = ['active', 'churned', 'prospect'];
    const owners = ['Sarah J.', 'Mike C.', 'Emily D.', 'James W.'];

    const accounts: Account[] = [];

    for (let i = 0; i < count; i++) {
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const revenueMultiplier = size === 'enterprise' ? 100 : size === 'medium' ? 10 : size === 'small' ? 1 : 0.1;

        accounts.push({
            id: `acc_${1000 + i}`,
            name: companyNames[i % companyNames.length] + (i >= companyNames.length ? ` ${Math.floor(i / companyNames.length) + 1}` : ''),
            industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
            size,
            website: `https://www.company${i}.com`,
            phone: `+1 555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            address: {
                street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
                city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
                state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
                country: 'USA',
                zip: String(Math.floor(Math.random() * 90000) + 10000)
            },
            annualRevenue: Math.floor(Math.random() * 10000000 * revenueMultiplier),
            employees: Math.floor(Math.random() * 1000 * revenueMultiplier) + 1,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            ownerId: owners[Math.floor(Math.random() * owners.length)],
            contacts: Math.floor(Math.random() * 20) + 1,
            deals: Math.floor(Math.random() * 5),
            totalDealValue: Math.floor(Math.random() * 500000),
            tags: [],
            notes: '',
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    return accounts;
}
