/**
 * CRM Deals/Opportunities API
 * Sales pipeline and deal management
 */

import { NextRequest, NextResponse } from 'next/server';

interface Deal {
    id: string;
    name: string;
    value: number;
    currency: string;
    stage: string;
    probability: number;
    contactId: string;
    accountId: string;
    ownerId: string;
    closeDate: string;
    source: string;
    description: string;
    tags: string[];
    products: Array<{ name: string; quantity: number; price: number }>;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    wonLost?: 'won' | 'lost';
    lostReason?: string;
}

const PIPELINE_STAGES = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

// GET - List deals
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const stage = searchParams.get('stage');
        const ownerId = searchParams.get('ownerId');
        const accountId = searchParams.get('accountId');
        const contactId = searchParams.get('contactId');
        const minValue = searchParams.get('minValue');
        const maxValue = searchParams.get('maxValue');
        const closeDateFrom = searchParams.get('closeDateFrom');
        const closeDateTo = searchParams.get('closeDateTo');

        // Generate mock deals
        const deals = generateMockDeals(20);

        // Apply filters
        let filtered = deals;
        if (stage) filtered = filtered.filter(d => d.stage === stage);
        if (ownerId) filtered = filtered.filter(d => d.ownerId === ownerId);
        if (accountId) filtered = filtered.filter(d => d.accountId === accountId);
        if (contactId) filtered = filtered.filter(d => d.contactId === contactId);
        if (minValue) filtered = filtered.filter(d => d.value >= parseInt(minValue));
        if (maxValue) filtered = filtered.filter(d => d.value <= parseInt(maxValue));

        // Calculate pipeline stats
        const pipelineStats = PIPELINE_STAGES.map(stageName => {
            const stageDeals = deals.filter(d => d.stage === stageName);
            return {
                stage: stageName,
                count: stageDeals.length,
                value: stageDeals.reduce((sum, d) => sum + d.value, 0),
                avgProbability: stageDeals.length > 0
                    ? Math.round(stageDeals.reduce((sum, d) => sum + d.probability, 0) / stageDeals.length)
                    : 0
            };
        });

        // Weighted pipeline value
        const weightedValue = deals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);

        return NextResponse.json({
            success: true,
            data: {
                deals: filtered,
                pipeline: pipelineStats,
                summary: {
                    totalDeals: filtered.length,
                    totalValue: filtered.reduce((sum, d) => sum + d.value, 0),
                    weightedValue: Math.round(weightedValue),
                    avgDealSize: filtered.length > 0
                        ? Math.round(filtered.reduce((sum, d) => sum + d.value, 0) / filtered.length)
                        : 0,
                    closingThisMonth: filtered.filter(d => {
                        const closeDate = new Date(d.closeDate);
                        const now = new Date();
                        return closeDate.getMonth() === now.getMonth() && closeDate.getFullYear() === now.getFullYear();
                    }).length
                }
            }
        });
    } catch (error) {
        console.error('CRM deals GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch deals' },
            { status: 500 }
        );
    }
}

// POST - Create deal
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, value, stage, contactId, accountId, ownerId, closeDate, source, description, tags, products } = body;

        if (!name || !value || !contactId) {
            return NextResponse.json(
                { success: false, error: 'name, value, and contactId are required' },
                { status: 400 }
            );
        }

        // Validate stage
        const validStage = stage && PIPELINE_STAGES.includes(stage) ? stage : 'Qualification';

        // Calculate probability based on stage
        const stageProbabilities: Record<string, number> = {
            'Qualification': 20,
            'Discovery': 40,
            'Proposal': 60,
            'Negotiation': 80,
            'Closed Won': 100,
            'Closed Lost': 0
        };

        const deal: Deal = {
            id: `deal_${Date.now()}`,
            name,
            value,
            currency: 'USD',
            stage: validStage,
            probability: stageProbabilities[validStage] || 20,
            contactId,
            accountId: accountId || '',
            ownerId: ownerId || 'unassigned',
            closeDate: closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            source: source || 'Unknown',
            description: description || '',
            tags: tags || [],
            products: products || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: deal
        }, { status: 201 });
    } catch (error) {
        console.error('CRM deals POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create deal' },
            { status: 500 }
        );
    }
}

// PUT - Update deal (stage change, etc.)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, stage, value, closeDate, ownerId, wonLost, lostReason } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id is required' },
                { status: 400 }
            );
        }

        // Validate stage if provided
        if (stage && !PIPELINE_STAGES.includes(stage)) {
            return NextResponse.json(
                { success: false, error: `Invalid stage. Must be one of: ${PIPELINE_STAGES.join(', ')}` },
                { status: 400 }
            );
        }

        const updates: Record<string, unknown> = {
            updatedAt: new Date().toISOString()
        };

        if (stage) {
            updates.stage = stage;
            // Update probability based on stage
            const stageProbabilities: Record<string, number> = {
                'Qualification': 20,
                'Discovery': 40,
                'Proposal': 60,
                'Negotiation': 80,
                'Closed Won': 100,
                'Closed Lost': 0
            };
            updates.probability = stageProbabilities[stage];
        }

        if (value !== undefined) updates.value = value;
        if (closeDate) updates.closeDate = closeDate;
        if (ownerId) updates.ownerId = ownerId;

        if (wonLost) {
            updates.wonLost = wonLost;
            updates.closedAt = new Date().toISOString();
            if (wonLost === 'lost' && lostReason) {
                updates.lostReason = lostReason;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                id,
                ...updates
            }
        });
    } catch (error) {
        console.error('CRM deals PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update deal' },
            { status: 500 }
        );
    }
}

// Helper: Generate mock deals
function generateMockDeals(count: number): Deal[] {
    const dealNames = [
        'Enterprise License', 'Pilot Program', 'Annual Renewal', 'Expansion Deal',
        'Professional Services', 'Platform Migration', 'API Integration', 'Training Package'
    ];
    const accounts = ['ACME Corp', 'Globex Inc', 'Stark Industries', 'Wayne Enterprises', 'Umbrella Corp'];
    const owners = ['Sarah J.', 'Mike C.', 'Emily D.', 'James W.'];
    const sources = ['Outbound', 'Inbound', 'Referral', 'Partner', 'Upsell'];

    const deals: Deal[] = [];

    for (let i = 0; i < count; i++) {
        const account = accounts[Math.floor(Math.random() * accounts.length)];
        const stage = PIPELINE_STAGES[Math.floor(Math.random() * (PIPELINE_STAGES.length - 1))]; // Exclude Closed Lost for most

        const stageProbabilities: Record<string, number> = {
            'Qualification': 20,
            'Discovery': 40,
            'Proposal': 60,
            'Negotiation': 80,
            'Closed Won': 100,
            'Closed Lost': 0
        };

        const daysToClose = Math.floor(Math.random() * 60) + 10;

        deals.push({
            id: `deal_${1000 + i}`,
            name: `${account} ${dealNames[Math.floor(Math.random() * dealNames.length)]}`,
            value: Math.floor(Math.random() * 200000) + 10000,
            currency: 'USD',
            stage,
            probability: stageProbabilities[stage],
            contactId: `contact_${1000 + Math.floor(Math.random() * 50)}`,
            accountId: `acc_${Math.floor(Math.random() * 10)}`,
            ownerId: owners[Math.floor(Math.random() * owners.length)],
            closeDate: new Date(Date.now() + daysToClose * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            source: sources[Math.floor(Math.random() * sources.length)],
            description: '',
            tags: [],
            products: [],
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    return deals;
}
