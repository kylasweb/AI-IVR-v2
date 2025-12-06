/**
 * Quality Evaluations API
 * AI call scoring and QA evaluations
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface EvaluationCriteria {
    name: string;
    aiScore: number;
    weight: number;
    feedback?: string;
}

interface CallEvaluation {
    id: string;
    callId: string;
    agentId: string;
    agentName: string;
    customerName: string;
    date: string;
    duration: string;
    aiScore: number;
    humanScore?: number;
    criteria: EvaluationCriteria[];
    sentiment: 'positive' | 'neutral' | 'negative';
    hasIssues: boolean;
    transcriptExcerpt: string;
}

// Default evaluation criteria
const DEFAULT_CRITERIA = [
    { name: 'Greeting & Verification', weight: 15 },
    { name: 'Active Listening', weight: 20 },
    { name: 'Problem Resolution', weight: 25 },
    { name: 'Compliance', weight: 20 },
    { name: 'Professionalism', weight: 10 },
    { name: 'Closing', weight: 10 }
];

// GET - Get evaluations
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const agentId = searchParams.get('agentId');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const minScore = searchParams.get('minScore');
        const maxScore = searchParams.get('maxScore');
        const hasIssues = searchParams.get('hasIssues');
        const limit = parseInt(searchParams.get('limit') || '50');

        // In production, query from database
        // For now, generate sample evaluations
        const evaluations = await generateEvaluations(limit);

        // Apply filters
        let filtered = evaluations;

        if (agentId) {
            filtered = filtered.filter(e => e.agentId === agentId);
        }
        if (minScore) {
            filtered = filtered.filter(e => e.aiScore >= parseInt(minScore));
        }
        if (maxScore) {
            filtered = filtered.filter(e => e.aiScore <= parseInt(maxScore));
        }
        if (hasIssues === 'true') {
            filtered = filtered.filter(e => e.hasIssues);
        }

        // Calculate stats
        const avgScore = Math.round(filtered.reduce((sum, e) => sum + e.aiScore, 0) / filtered.length);
        const issueCount = filtered.filter(e => e.hasIssues).length;

        return NextResponse.json({
            success: true,
            data: {
                evaluations: filtered,
                summary: {
                    total: filtered.length,
                    avgAiScore: avgScore,
                    callsWithIssues: issueCount,
                    calibrated: filtered.filter(e => e.humanScore).length,
                    sentimentBreakdown: {
                        positive: filtered.filter(e => e.sentiment === 'positive').length,
                        neutral: filtered.filter(e => e.sentiment === 'neutral').length,
                        negative: filtered.filter(e => e.sentiment === 'negative').length
                    }
                }
            }
        });
    } catch (error) {
        console.error('Quality evaluations error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch evaluations' },
            { status: 500 }
        );
    }
}

// POST - Create human evaluation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { callId, evaluatorId, criteria, feedback } = body;

        if (!callId || !criteria) {
            return NextResponse.json(
                { success: false, error: 'callId and criteria are required' },
                { status: 400 }
            );
        }

        // Calculate total score from criteria
        const totalScore = criteria.reduce((sum: number, c: EvaluationCriteria) => {
            return sum + (c.aiScore * c.weight / 100);
        }, 0);

        const evaluation = {
            id: `eval_${Date.now()}`,
            callId,
            evaluatorId,
            humanScore: Math.round(totalScore),
            criteria,
            feedback,
            createdAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: evaluation
        });
    } catch (error) {
        console.error('Quality evaluation create error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create evaluation' },
            { status: 500 }
        );
    }
}

// Helper function to generate sample evaluations
async function generateEvaluations(count: number): Promise<CallEvaluation[]> {
    const agents = [
        { id: 'agent_1', name: 'Sarah Johnson' },
        { id: 'agent_2', name: 'Mike Chen' },
        { id: 'agent_3', name: 'Emily Davis' },
        { id: 'agent_4', name: 'James Wilson' },
        { id: 'agent_5', name: 'Lisa Brown' }
    ];

    const customers = ['John Doe', 'Jane Smith', 'Robert Brown', 'Alice Cooper', 'David Wilson'];
    const transcripts = [
        'Thank you for calling. I completely understand your concern and I\'m happy to help...',
        'I understand this is frustrating. Let me see what options we have available...',
        'Perfect, I\'ve processed that for you. Is there anything else I can help with today?',
        'I apologize for the confusion. Let me transfer you to our supervisor who can better assist...',
        'Great question! Let me explain how this works...'
    ];

    const evaluations: CallEvaluation[] = [];

    for (let i = 0; i < count; i++) {
        const agent = agents[i % agents.length];
        const baseScore = 60 + Math.floor(Math.random() * 40); // 60-100

        const criteria: EvaluationCriteria[] = DEFAULT_CRITERIA.map(c => {
            const score = Math.max(50, Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10));
            return {
                name: c.name,
                aiScore: score,
                weight: c.weight,
                feedback: score < 75 ? getRandomFeedback(c.name) : undefined
            };
        });

        const totalScore = Math.round(
            criteria.reduce((sum, c) => sum + (c.aiScore * c.weight / 100), 0)
        );

        const date = new Date();
        date.setMinutes(date.getMinutes() - i * 15);

        evaluations.push({
            id: `eval_${1000 + i}`,
            callId: `call_${1000 + i}`,
            agentId: agent.id,
            agentName: agent.name,
            customerName: customers[i % customers.length],
            date: date.toISOString().replace('T', ' ').slice(0, 16),
            duration: `${Math.floor(Math.random() * 8) + 2}:${(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}`,
            aiScore: totalScore,
            humanScore: Math.random() > 0.7 ? totalScore + Math.floor(Math.random() * 6) - 3 : undefined,
            criteria,
            sentiment: totalScore >= 85 ? 'positive' : totalScore >= 70 ? 'neutral' : 'negative',
            hasIssues: totalScore < 75,
            transcriptExcerpt: transcripts[i % transcripts.length]
        });
    }

    return evaluations;
}

function getRandomFeedback(criterion: string): string {
    const feedbacks: Record<string, string[]> = {
        'Greeting & Verification': ['Skipped verification step', 'Rushed greeting'],
        'Active Listening': ['Interrupted customer multiple times', 'Customer had to repeat information'],
        'Problem Resolution': ['Resolution took longer than expected', 'Unable to resolve on first call'],
        'Compliance': ['Missed disclosure statement', 'Did not confirm terms'],
        'Professionalism': ['Tone became slightly defensive', 'Showed signs of frustration'],
        'Closing': ['Abrupt ending', 'Did not confirm next steps']
    };

    const options = feedbacks[criterion] || ['Needs improvement'];
    return options[Math.floor(Math.random() * options.length)];
}
