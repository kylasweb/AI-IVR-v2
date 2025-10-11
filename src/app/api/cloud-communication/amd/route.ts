import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Helper function for error handling
function formatError(error: unknown): string {
    if (error && typeof error === 'object' && 'issues' in error) {
        // Handle Zod validation errors
        const zodError = error as any;
        return zodError.errors?.map((e: any) => e.message).join(', ') || 'Validation error';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error) || 'Internal server error';
}

// AMD Analysis Creation Schema
const CreateAMDAnalysisSchema = z.object({
    callId: z.string().min(1, 'Call ID is required'),
    audioUrl: z.string().url('Valid audio URL is required'),
    campaignId: z.string().optional(),
    customerProfile: z.any().optional(),
    previousAttempts: z.number().int().min(0).default(0),
    culturalMode: z.enum(['malayalam_formal', 'malayalam_casual', 'english_formal', 'english_casual', 'mixed']).default('mixed'),
    maxDetectionTime: z.number().int().min(1000).max(10000).default(5000), // milliseconds
});

// AMD Analysis Update Schema
const UpdateAMDAnalysisSchema = z.object({
    isAnsweringMachine: z.boolean().optional(),
    confidence: z.number().min(0).max(1).optional(),
    detectionTime: z.number().int().min(0).optional(),
    audioPatterns: z.any().optional(),
    silenceDuration: z.number().int().min(0).optional(),
    beepDetected: z.boolean().optional(),
    voiceCharacteristics: z.any().optional(),
    greetingLanguage: z.string().optional(),
    culturalPattern: z.string().optional(),
    greetingText: z.string().optional(),
    messageStrategy: z.enum(['leave_message', 'callback', 'personalized', 'hang_up']).optional(),
    messageDelivered: z.boolean().optional(),
    callbackScheduled: z.boolean().optional(),
    callbackTime: z.string().datetime().optional(),
    accuracy: z.number().min(0).max(1).optional(),
    falsePositiveRate: z.number().min(0).max(1).optional(),
    processingLatency: z.number().int().min(0).optional(),
});

// GET /api/cloud-communication/amd - List AMD analyses
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
        const campaignId = searchParams.get('campaignId');
        const isAnsweringMachine = searchParams.get('isAnsweringMachine');
        const culturalPattern = searchParams.get('culturalPattern');
        const minConfidence = searchParams.get('minConfidence');
        const skip = (page - 1) * limit;

        // Build filter conditions
        const whereClause: any = {};
        if (campaignId) whereClause.campaignId = campaignId;
        if (isAnsweringMachine !== null && isAnsweringMachine !== undefined) {
            whereClause.isAnsweringMachine = isAnsweringMachine === 'true';
        }
        if (culturalPattern) whereClause.culturalPattern = culturalPattern;
        if (minConfidence) {
            whereClause.confidence = { gte: parseFloat(minConfidence) };
        }

        // Get AMD analyses with pagination
        const [analyses, totalCount] = await Promise.all([
            db.aMDAnalysis.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            db.aMDAnalysis.count({ where: whereClause }),
        ]);

        // Calculate campaign analytics
        const campaignAnalytics = await calculateCampaignAnalytics(campaignId);

        // Calculate detection accuracy metrics
        const detectionMetrics = {
            totalAnalyses: analyses.length,
            answeringMachines: analyses.filter(a => a.isAnsweringMachine).length,
            humanAnswers: analyses.filter(a => !a.isAnsweringMachine).length,
            averageConfidence: analyses.length > 0 ?
                analyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / analyses.length : 0,
            averageDetectionTime: analyses.length > 0 ?
                analyses.reduce((sum, a) => sum + (a.detectionTime || 0), 0) / analyses.length : 0,
            malayalamDetections: analyses.filter(a =>
                a.greetingLanguage === 'ml' || a.culturalPattern?.includes('malayalam')
            ).length,
        };

        // Enhance analyses with cultural insights
        const enhancedAnalyses = analyses.map(analysis => {
            const culturalInsights = analyzeCulturalContext(analysis);
            return {
                ...analysis,
                culturalInsights,
                humanizedResults: humanizeAMDResults(analysis),
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                analyses: enhancedAnalyses,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    hasNext: page * limit < totalCount,
                    hasPrev: page > 1,
                },
                metrics: detectionMetrics,
                campaignAnalytics,
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching AMD analyses:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 500 }
        );
    }
}

// POST /api/cloud-communication/amd - Start AMD analysis
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = CreateAMDAnalysisSchema.parse(body);

        // Check if analysis already exists for this call
        const existingAnalysis = await db.aMDAnalysis.findUnique({
            where: { callId: validatedData.callId },
        });

        if (existingAnalysis) {
            return NextResponse.json({
                success: true,
                data: existingAnalysis,
                message: 'AMD analysis already exists for this call',
            });
        }

        // Initialize AMD analysis with cultural context
        const culturalSettings = initializeCulturalSettings(
            validatedData.culturalMode,
            validatedData.customerProfile
        );

        // Create initial AMD analysis record
        const amdAnalysis = await db.aMDAnalysis.create({
            data: {
                callId: validatedData.callId,
                isAnsweringMachine: false, // Will be updated by analysis
                confidence: 0.0,
                detectionTime: 0,
                campaignId: validatedData.campaignId,
                customerProfile: validatedData.customerProfile || {},
                previousAttempts: validatedData.previousAttempts,
                culturalPattern: validatedData.culturalMode,
                audioPatterns: culturalSettings.audioPatterns,
                voiceCharacteristics: culturalSettings.voiceCharacteristics,
            },
        });

        // Trigger AMD analysis process
        const analysisResult = await performAMDAnalysis({
            callId: validatedData.callId,
            audioUrl: validatedData.audioUrl,
            culturalMode: validatedData.culturalMode,
            maxDetectionTime: validatedData.maxDetectionTime,
            customerProfile: validatedData.customerProfile,
        });

        // Update analysis with results
        const updatedAnalysis = await db.aMDAnalysis.update({
            where: { callId: validatedData.callId },
            data: {
                ...analysisResult,
                processingLatency: Date.now() - new Date(amdAnalysis.createdAt).getTime(),
                updatedAt: new Date(),
            },
        });

        // Log successful analysis for monitoring
        console.log(`AMD analysis completed for call ${validatedData.callId}:`, {
            isAnsweringMachine: analysisResult.isAnsweringMachine,
            confidence: analysisResult.confidence,
            detectionTime: analysisResult.detectionTime,
            culturalPattern: analysisResult.culturalPattern,
        });

        return NextResponse.json({
            success: true,
            data: {
                ...updatedAnalysis,
                culturalInsights: analyzeCulturalContext(updatedAnalysis),
                recommendedAction: getRecommendedAction(updatedAnalysis),
            },
            message: 'AMD analysis completed successfully',
        });
    } catch (error: unknown) {
        console.error('Error performing AMD analysis:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

// PATCH /api/cloud-communication/amd - Update AMD analysis
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { callId, ...updateData } = body;

        if (!callId) {
            return NextResponse.json(
                { success: false, error: 'Call ID is required' },
                { status: 400 }
            );
        }

        const validatedData = UpdateAMDAnalysisSchema.parse(updateData);

        // Handle datetime conversions
        const processedData: any = { ...validatedData };
        if (validatedData.callbackTime) {
            processedData.callbackTime = new Date(validatedData.callbackTime);
        }

        // Update AMD analysis
        const updatedAnalysis = await db.aMDAnalysis.update({
            where: { callId },
            data: {
                ...processedData,
                updatedAt: new Date(),
            },
        });

        // Update campaign metrics if this is part of a campaign
        if (updatedAnalysis.campaignId) {
            await updateCampaignMetrics(updatedAnalysis.campaignId);
        }

        return NextResponse.json({
            success: true,
            data: {
                ...updatedAnalysis,
                culturalInsights: analyzeCulturalContext(updatedAnalysis),
                recommendedAction: getRecommendedAction(updatedAnalysis),
            },
            message: 'AMD analysis updated successfully',
        });
    } catch (error: unknown) {
        console.error('Error updating AMD analysis:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 400 }
        );
    }
}

// DELETE /api/cloud-communication/amd - Delete AMD analysis
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const callId = searchParams.get('callId');

        if (!callId) {
            return NextResponse.json(
                { success: false, error: 'Call ID is required' },
                { status: 400 }
            );
        }

        // Check if analysis exists
        const analysis = await db.aMDAnalysis.findUnique({
            where: { callId },
        });

        if (!analysis) {
            return NextResponse.json(
                { success: false, error: 'AMD analysis not found' },
                { status: 404 }
            );
        }

        // Delete AMD analysis
        await db.aMDAnalysis.delete({
            where: { callId },
        });

        return NextResponse.json({
            success: true,
            message: 'AMD analysis deleted successfully',
            callId,
        });
    } catch (error: unknown) {
        console.error('Error deleting AMD analysis:', error);
        return NextResponse.json(
            {
                success: false,
                error: formatError(error),
            },
            { status: 500 }
        );
    }
}

// Helper functions
function initializeCulturalSettings(culturalMode: string, customerProfile: any): any {
    const baseSettings = {
        audioPatterns: {},
        voiceCharacteristics: {},
    };

    if (culturalMode.includes('malayalam')) {
        baseSettings.audioPatterns = {
            expectedGreetings: ['hello', 'namaste', 'vanakkam', 'namaskar'],
            silenceThreshold: 2500, // Malayalam speakers may pause longer
            tonePatterns: ['respectful', 'formal'],
        };
    }

    if (culturalMode.includes('formal')) {
        baseSettings.voiceCharacteristics = {
            expectedTone: 'formal',
            respectMarkers: true,
            paceExpectation: 'moderate',
        };
    }

    return baseSettings;
}

async function performAMDAnalysis(params: {
    callId: string;
    audioUrl: string;
    culturalMode: string;
    maxDetectionTime: number;
    customerProfile?: any;
}): Promise<any> {
    const startTime = Date.now();

    // Simulate AMD analysis with cultural intelligence
    // In production, this would integrate with ML models

    // Mock analysis results based on cultural patterns
    const mockResult = {
        isAnsweringMachine: Math.random() > 0.7, // 30% answering machine rate
        confidence: 0.85 + (Math.random() * 0.15), // High confidence 85-100%
        detectionTime: Math.min(1500 + (Math.random() * 2000), params.maxDetectionTime),
        silenceDuration: Math.random() * 3000,
        beepDetected: Math.random() > 0.8,
        greetingLanguage: params.culturalMode.includes('malayalam') ? 'ml' : 'en',
        culturalPattern: params.culturalMode,
        greetingText: params.culturalMode.includes('malayalam') ?
            'Namaste, ningal aarannu vilikkunnathu?' : 'Hello, who is calling?',
    };

    // Add cultural context analysis
    if (mockResult.isAnsweringMachine) {
        mockResult.greetingText = params.culturalMode.includes('malayalam') ?
            'Ningal visheshangal parayam beep kazhinju' :
            'Please leave a message after the beep';
    }

    // Determine message strategy based on cultural context
    const messageStrategy = determineMessageStrategy(mockResult, params.customerProfile);

    return {
        ...mockResult,
        messageStrategy,
        audioPatterns: {
            toneAnalysis: mockResult.isAnsweringMachine ? 'mechanical' : 'human',
            speechRate: mockResult.isAnsweringMachine ? 'consistent' : 'natural',
            backgroundNoise: Math.random() > 0.5 ? 'minimal' : 'moderate',
        },
        voiceCharacteristics: {
            pitch: mockResult.isAnsweringMachine ? 'artificial' : 'natural',
            intonation: mockResult.isAnsweringMachine ? 'flat' : 'varied',
            clarity: 0.8 + (Math.random() * 0.2),
        },
    };
}

function determineMessageStrategy(amdResult: any, customerProfile: any): string {
    if (amdResult.isAnsweringMachine) {
        // Machine detected - choose strategy based on cultural context
        if (amdResult.culturalPattern?.includes('malayalam')) {
            return customerProfile?.preferredLanguage === 'ml' ? 'personalized' : 'leave_message';
        }
        return 'leave_message';
    } else {
        // Human detected - proceed with conversation
        return 'personalized';
    }
}

async function calculateCampaignAnalytics(campaignId?: string | null): Promise<any> {
    if (!campaignId) return null;

    const campaignData = await db.aMDAnalysis.findMany({
        where: { campaignId },
        select: {
            isAnsweringMachine: true,
            confidence: true,
            detectionTime: true,
            greetingLanguage: true,
            culturalPattern: true,
            messageDelivered: true,
            callbackScheduled: true,
        },
    });

    if (campaignData.length === 0) return null;

    const analytics = {
        totalCalls: campaignData.length,
        answeringMachineRate: (campaignData.filter(d => d.isAnsweringMachine).length / campaignData.length) * 100,
        humanAnswerRate: (campaignData.filter(d => !d.isAnsweringMachine).length / campaignData.length) * 100,
        averageDetectionTime: campaignData.reduce((sum, d) => sum + (d.detectionTime || 0), 0) / campaignData.length,
        malayalamCallsRatio: (campaignData.filter(d => d.greetingLanguage === 'ml').length / campaignData.length) * 100,
        messageDeliveryRate: (campaignData.filter(d => d.messageDelivered).length / campaignData.length) * 100,
        callbackScheduleRate: (campaignData.filter(d => d.callbackScheduled).length / campaignData.length) * 100,
        culturalDistribution: campaignData.reduce((acc: any, d) => {
            acc[d.culturalPattern || 'unknown'] = (acc[d.culturalPattern || 'unknown'] || 0) + 1;
            return acc;
        }, {}),
    };

    return analytics;
}

function analyzeCulturalContext(analysis: any): any {
    return {
        languageDetection: {
            primary: analysis.greetingLanguage || 'unknown',
            confidence: analysis.confidence || 0,
            culturalMarkers: analysis.culturalPattern?.split('_') || [],
        },
        communicationStyle: {
            formality: analysis.culturalPattern?.includes('formal') ? 'high' : 'moderate',
            respectLevel: analysis.greetingText?.includes('sir') || analysis.greetingText?.includes('madam') ? 'high' : 'standard',
            regionalPattern: analysis.greetingLanguage === 'ml' ? 'kerala' : 'general',
        },
        engagementRecommendations: {
            preferredLanguage: analysis.greetingLanguage || 'en',
            culturalSensitivity: analysis.culturalPattern?.includes('malayalam') ? 'high' : 'standard',
            communicationTone: analysis.culturalPattern?.includes('formal') ? 'formal' : 'friendly',
        },
    };
}

function humanizeAMDResults(analysis: any): any {
    return {
        detectionResult: analysis.isAnsweringMachine ?
            'Answering Machine Detected' : 'Human Answer Detected',
        confidenceLevel: analysis.confidence >= 0.9 ? 'Very High' :
            analysis.confidence >= 0.7 ? 'High' :
                analysis.confidence >= 0.5 ? 'Moderate' : 'Low',
        detectionSpeed: analysis.detectionTime <= 2000 ? 'Fast' :
            analysis.detectionTime <= 4000 ? 'Normal' : 'Slow',
        culturalContext: analysis.culturalPattern ?
            analysis.culturalPattern.replace('_', ' - ').toUpperCase() : 'Standard',
        recommendedAction: getRecommendedAction(analysis),
    };
}

function getRecommendedAction(analysis: any): string {
    if (analysis.isAnsweringMachine) {
        if (analysis.messageStrategy === 'personalized') {
            return 'Leave personalized message in preferred language';
        }
        return 'Leave standard message and schedule callback';
    } else {
        return 'Continue with live conversation';
    }
}

async function updateCampaignMetrics(campaignId: string): Promise<void> {
    // Update campaign-level metrics
    // This would typically update a Campaign model with aggregated statistics
    console.log(`Updating metrics for campaign: ${campaignId}`);
}