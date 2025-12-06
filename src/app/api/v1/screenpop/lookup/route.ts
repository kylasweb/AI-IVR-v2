/**
 * Screen Pop API
 * CTI screen pop for incoming calls - lookup customer data from CRM
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CustomerData {
    id: string;
    externalId?: string;
    name: string;
    phone: string;
    email?: string;
    tier: 'standard' | 'premium' | 'vip';
    accountNumber?: string;
    location?: string;
    lastContact?: string;
    totalCalls: number;
    openTickets: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    notes: string[];
    transactions: Array<{
        date: string;
        amount: number;
        type: string;
    }>;
    source: 'crm' | 'database' | 'mock';
}

// GET - Lookup customer by phone number (for screen pop)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const phone = searchParams.get('phone');
        const email = searchParams.get('email');
        const clientId = searchParams.get('clientId');

        if (!phone && !email) {
            return NextResponse.json(
                { success: false, error: 'phone or email is required' },
                { status: 400 }
            );
        }

        // Normalize phone number
        const normalizedPhone = phone?.replace(/\D/g, '') || '';

        // Try to find customer in database first
        let customer = await findCustomerInDatabase(normalizedPhone, email || undefined);

        // If not found, try CRM integration
        if (!customer && clientId) {
            customer = await lookupFromCRM(clientId, normalizedPhone, email || undefined);
        }

        // If still not found, return unknown caller data
        if (!customer) {
            customer = createUnknownCallerData(phone || email || 'Unknown');
        }

        // Generate AI suggestions based on customer data
        const suggestions = generateSuggestions(customer);

        return NextResponse.json({
            success: true,
            data: {
                customer,
                suggestions,
                lookupTime: Date.now()
            }
        });
    } catch (error) {
        console.error('Screen pop lookup error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to lookup customer' },
            { status: 500 }
        );
    }
}

// POST - Log screen pop event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { callId, agentId, customerId, phone, lookupResult } = body;

        // In production, log this event for analytics
        const event = {
            id: `pop_${Date.now()}`,
            callId,
            agentId,
            customerId,
            phone,
            lookupResult,
            timestamp: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Screen pop log error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to log screen pop' },
            { status: 500 }
        );
    }
}

async function findCustomerInDatabase(phone: string, email?: string): Promise<CustomerData | null> {
    try {
        // Look up in User table (could be a dedicated Customer table)
        const user = await db.user.findFirst({
            where: {
                OR: [
                    { phone: { contains: phone.slice(-10) } },
                    ...(email ? [{ email }] : [])
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true
            }
        });

        if (user) {
            return {
                id: user.id,
                name: user.name || 'Unknown',
                phone: user.phone || phone,
                email: user.email || undefined,
                tier: 'standard',
                totalCalls: Math.floor(Math.random() * 20),
                openTickets: Math.floor(Math.random() * 3),
                sentiment: 'neutral',
                notes: [],
                transactions: [],
                source: 'database'
            };
        }

        return null;
    } catch {
        return null;
    }
}

async function lookupFromCRM(clientId: string, phone: string, email?: string): Promise<CustomerData | null> {
    // In production, this would call the CRM connector
    // For now, simulate a CRM lookup with mock data

    // 70% chance of finding customer in CRM
    if (Math.random() < 0.7) {
        const tiers: Array<'standard' | 'premium' | 'vip'> = ['standard', 'premium', 'vip'];
        const sentiments: Array<'positive' | 'neutral' | 'negative'> = ['positive', 'neutral', 'negative'];

        return {
            id: `crm_${Date.now()}`,
            externalId: `CRM-${Math.floor(Math.random() * 100000)}`,
            name: generateRandomName(),
            phone: formatPhone(phone),
            email: email || `customer${Math.floor(Math.random() * 1000)}@example.com`,
            tier: tiers[Math.floor(Math.random() * 3)],
            accountNumber: `ACC-${Math.floor(Math.random() * 9999999).toString().padStart(7, '0')}`,
            location: getRandomLocation(),
            lastContact: getRandomLastContact(),
            totalCalls: Math.floor(Math.random() * 30) + 1,
            openTickets: Math.floor(Math.random() * 3),
            sentiment: sentiments[Math.floor(Math.random() * 3)],
            notes: generateRandomNotes(),
            transactions: generateRandomTransactions(),
            source: 'crm'
        };
    }

    return null;
}

function createUnknownCallerData(identifier: string): CustomerData {
    return {
        id: `unknown_${Date.now()}`,
        name: 'Unknown Caller',
        phone: identifier,
        tier: 'standard',
        totalCalls: 0,
        openTickets: 0,
        sentiment: 'neutral',
        notes: ['New caller - no prior history'],
        transactions: [],
        source: 'mock'
    };
}

function generateSuggestions(customer: CustomerData): string[] {
    const suggestions: string[] = [];

    if (customer.source === 'mock') {
        suggestions.push('New caller - collect customer information');
    }

    if (customer.tier === 'vip') {
        suggestions.push('VIP customer - prioritize resolution');
    }

    if (customer.openTickets > 0) {
        suggestions.push(`Customer has ${customer.openTickets} open ticket(s) - check status`);
    }

    if (customer.sentiment === 'negative') {
        suggestions.push('Previous negative sentiment detected - handle with care');
    }

    if (customer.totalCalls === 0) {
        suggestions.push('First-time caller - welcome warmly');
    } else if (customer.totalCalls > 10) {
        suggestions.push('Frequent caller - check for recurring issues');
    }

    // Check for payment issues
    const missedPayments = customer.transactions?.filter(t => t.type === 'Missed').length || 0;
    if (missedPayments > 0) {
        suggestions.push(`${missedPayments} missed payment(s) - consider payment plan`);
    }

    return suggestions.slice(0, 5); // Max 5 suggestions
}

function generateRandomName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function formatPhone(phone: string): string {
    if (phone.length === 10) {
        return `+1 (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
}

function getRandomLocation(): string {
    const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
    return locations[Math.floor(Math.random() * locations.length)];
}

function getRandomLastContact(): string {
    const days = Math.floor(Math.random() * 30);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
}

function generateRandomNotes(): string[] {
    const notes = [
        'Prefers email communication for follow-ups',
        'Has auto-pay enabled but card expired',
        'Long-term customer since 2019',
        'Requested callback for billing question',
        'Satisfied with service in last call'
    ];

    const count = Math.floor(Math.random() * 3);
    return notes.slice(0, count);
}

function generateRandomTransactions(): CustomerData['transactions'] {
    const transactions: CustomerData['transactions'] = [];
    const now = new Date();

    for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);

        const isMissed = Math.random() < 0.1;
        transactions.push({
            date: date.toISOString().split('T')[0],
            amount: isMissed ? 0 : Math.floor(Math.random() * 200) + 50,
            type: isMissed ? 'Missed' : 'Payment'
        });
    }

    return transactions;
}
