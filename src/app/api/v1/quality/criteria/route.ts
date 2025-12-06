/**
 * Quality Criteria API
 * Manage evaluation criteria and weights
 */

import { NextRequest, NextResponse } from 'next/server';

interface Criterion {
    id: string;
    name: string;
    description: string;
    weight: number;
    category: string;
    isActive: boolean;
}

// Default criteria
const DEFAULT_CRITERIA: Criterion[] = [
    {
        id: 'greeting',
        name: 'Greeting & Verification',
        description: 'Proper greeting and customer identity verification',
        weight: 15,
        category: 'opening',
        isActive: true
    },
    {
        id: 'listening',
        name: 'Active Listening',
        description: 'Listening without interrupting, acknowledging concerns',
        weight: 20,
        category: 'communication',
        isActive: true
    },
    {
        id: 'resolution',
        name: 'Problem Resolution',
        description: 'Effectively addressing the customer\'s issue',
        weight: 25,
        category: 'core',
        isActive: true
    },
    {
        id: 'compliance',
        name: 'Compliance',
        description: 'Following all regulatory and company guidelines',
        weight: 20,
        category: 'regulatory',
        isActive: true
    },
    {
        id: 'professionalism',
        name: 'Professionalism',
        description: 'Maintaining professional tone and behavior',
        weight: 10,
        category: 'communication',
        isActive: true
    },
    {
        id: 'closing',
        name: 'Closing',
        description: 'Proper call wrap-up and next steps',
        weight: 10,
        category: 'closing',
        isActive: true
    }
];

// GET - Get all criteria
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const clientId = searchParams.get('clientId');
        const category = searchParams.get('category');

        // In production, fetch from database based on client
        let criteria = [...DEFAULT_CRITERIA];

        if (category) {
            criteria = criteria.filter(c => c.category === category);
        }

        // Validate total weight is 100
        const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

        return NextResponse.json({
            success: true,
            data: {
                criteria,
                categories: ['opening', 'communication', 'core', 'regulatory', 'closing'],
                totalWeight,
                isValid: totalWeight === 100
            }
        });
    } catch (error) {
        console.error('Quality criteria error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch criteria' },
            { status: 500 }
        );
    }
}

// POST - Create custom criterion
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, weight, category, clientId } = body;

        if (!name || !weight || !category) {
            return NextResponse.json(
                { success: false, error: 'name, weight, and category are required' },
                { status: 400 }
            );
        }

        if (weight < 1 || weight > 100) {
            return NextResponse.json(
                { success: false, error: 'Weight must be between 1 and 100' },
                { status: 400 }
            );
        }

        const criterion: Criterion = {
            id: `custom_${Date.now()}`,
            name,
            description: description || '',
            weight,
            category,
            isActive: true
        };

        return NextResponse.json({
            success: true,
            data: criterion
        });
    } catch (error) {
        console.error('Quality criterion create error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create criterion' },
            { status: 500 }
        );
    }
}

// PUT - Update criterion
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, description, weight, isActive } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'id is required' },
                { status: 400 }
            );
        }

        // In production, update in database
        const updated = {
            id,
            name,
            description,
            weight,
            isActive,
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error('Quality criterion update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update criterion' },
            { status: 500 }
        );
    }
}
