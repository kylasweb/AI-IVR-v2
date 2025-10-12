import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AMDCampaignManager, AMDDetectionService, DEFAULT_AMD_CONFIG } from '@/services/amd-detection-service';

// AMD Campaign Management API - Phase 3 Implementation
// Comprehensive campaign management with cultural intelligence

const CreateCampaignSchema = z.object({
    name: z.string().min(1).max(100),
    culturalProfile: z.object({
        primaryLanguage: z.enum(['malayalam', 'english', 'mixed']),
        targetAudience: z.enum(['business', 'personal', 'healthcare', 'education']),
        culturalSensitivity: z.enum(['high', 'medium', 'low']),
        festivalAdaptation: z.boolean(),
    }),
    messageConfiguration: z.object({
        humanMessage: z.object({
            malayalam: z.string(),
            english: z.string(),
            duration: z.number().positive(),
        }),
        machineMessage: z.object({
            malayalam: z.string(),
            english: z.string(),
            duration: z.number().positive(),
        }),
        callbackSettings: z.object({
            enabled: z.boolean(),
            delayHours: z.number().min(1).max(168), // Max 1 week
            maxAttempts: z.number().min(1).max(10),
        }),
    }),
});

const UpdateCampaignSchema = CreateCampaignSchema.partial();

const ProcessCallSchema = z.object({
    campaignId: z.string(),
    audioData: z.string(), // Base64 encoded
    phoneNumber: z.string(),
    callContext: z.object({
        timestamp: z.string().optional(),
        callerId: z.string().optional(),
        previousAttempts: z.number().optional(),
    }).optional(),
});

// Initialize services
const amdService = new AMDDetectionService(DEFAULT_AMD_CONFIG);
const campaignManager = new AMDCampaignManager(amdService);

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const body = await request.json();

        switch (action) {
            case 'create': {
                const validatedData = CreateCampaignSchema.parse(body);

                const campaignId = await campaignManager.createCampaign({
                    ...validatedData,
                    status: 'draft',
                    analytics: {
                        totalCalls: 0,
                        amdDetections: 0,
                        humanConnections: 0,
                        messagesLeft: 0,
                        callbackSuccess: 0,
                        culturalEngagement: 0,
                    },
                });

                const campaign = campaignManager.getCampaign(campaignId);

                return NextResponse.json({
                    success: true,
                    data: {
                        campaignId,
                        campaign,
                        message: 'Campaign created successfully',
                        culturalIntelligence: {
                            languageSupport: validatedData.culturalProfile.primaryLanguage,
                            targetAudience: validatedData.culturalProfile.targetAudience,
                            culturalAdaptation: validatedData.culturalProfile.festivalAdaptation,
                        },
                    },
                }, { status: 201 });
            }

            case 'process': {
                const validatedData = ProcessCallSchema.parse(body);

                // Convert base64 audio to ArrayBuffer
                const audioBuffer = Buffer.from(validatedData.audioData, 'base64').buffer;

                // Process campaign call
                const result = await campaignManager.processCampaignCall(
                    validatedData.campaignId,
                    audioBuffer,
                    validatedData.phoneNumber
                );

                return NextResponse.json({
                    success: true,
                    data: {
                        callProcessing: result,
                        analytics: {
                            detectionResult: result.amdResult.isAnsweringMachine ? 'answering_machine' : 'human',
                            confidence: result.amdResult.confidence,
                            detectionTime: result.amdResult.detectionTime,
                            culturalContext: result.amdResult.culturalContext,
                        },
                        recommendations: {
                            nextAction: result.amdResult.recommendedAction,
                            messageDelivered: result.messageDelivered,
                            culturalConsiderations: result.amdResult.culturalContext.malayalamGreeting
                                ? ['Malayalam patterns detected', 'Cultural message used', 'Regional adaptation applied']
                                : ['Standard message protocol', 'No cultural adaptation needed'],
                        },
                    },
                });
            }

            case 'update': {
                const campaignId = url.searchParams.get('campaignId');
                if (!campaignId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Campaign ID required for update',
                    }, { status: 400 });
                }

                const validatedData = UpdateCampaignSchema.parse(body);
                const updated = await campaignManager.updateCampaign(campaignId, validatedData);

                if (!updated) {
                    return NextResponse.json({
                        success: false,
                        error: 'Campaign not found or update failed',
                    }, { status: 404 });
                }

                const campaign = campaignManager.getCampaign(campaignId);

                return NextResponse.json({
                    success: true,
                    data: {
                        campaign,
                        message: 'Campaign updated successfully',
                    },
                });
            }

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action parameter',
                    validActions: ['create', 'process', 'update'],
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Campaign management error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid request format',
                details: (error as any).errors,
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Campaign operation failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const campaignId = url.searchParams.get('campaignId');
        const action = url.searchParams.get('action');

        if (campaignId) {
            // Get specific campaign
            const campaign = campaignManager.getCampaign(campaignId);

            if (!campaign) {
                return NextResponse.json({
                    success: false,
                    error: 'Campaign not found',
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: {
                    campaign,
                    culturalIntelligence: {
                        primaryLanguage: campaign.culturalProfile.primaryLanguage,
                        culturalSensitivity: campaign.culturalProfile.culturalSensitivity,
                        festivalAdaptation: campaign.culturalProfile.festivalAdaptation,
                        culturalEngagementRate: campaign.analytics.totalCalls > 0
                            ? (campaign.analytics.culturalEngagement / campaign.analytics.totalCalls * 100).toFixed(2) + '%'
                            : '0%',
                    },
                    performance: {
                        totalCalls: campaign.analytics.totalCalls,
                        amdAccuracy: campaign.analytics.amdDetections > 0
                            ? ((campaign.analytics.amdDetections / campaign.analytics.totalCalls) * 100).toFixed(2) + '%'
                            : '0%',
                        humanConnectionRate: campaign.analytics.totalCalls > 0
                            ? ((campaign.analytics.humanConnections / campaign.analytics.totalCalls) * 100).toFixed(2) + '%'
                            : '0%',
                        messageDeliveryRate: campaign.analytics.amdDetections > 0
                            ? ((campaign.analytics.messagesLeft / campaign.analytics.amdDetections) * 100).toFixed(2) + '%'
                            : '0%',
                    },
                },
            });
        }

        switch (action) {
            case 'analytics': {
                // Get aggregated campaign analytics
                const campaigns = campaignManager.getAllCampaigns();
                const aggregated = campaigns.reduce((acc, campaign) => ({
                    totalCampaigns: acc.totalCampaigns + 1,
                    totalCalls: acc.totalCalls + campaign.analytics.totalCalls,
                    totalAMDDetections: acc.totalAMDDetections + campaign.analytics.amdDetections,
                    totalHumanConnections: acc.totalHumanConnections + campaign.analytics.humanConnections,
                    totalMessagesLeft: acc.totalMessagesLeft + campaign.analytics.messagesLeft,
                    totalCulturalEngagement: acc.totalCulturalEngagement + campaign.analytics.culturalEngagement,
                }), {
                    totalCampaigns: 0,
                    totalCalls: 0,
                    totalAMDDetections: 0,
                    totalHumanConnections: 0,
                    totalMessagesLeft: 0,
                    totalCulturalEngagement: 0,
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        aggregatedAnalytics: aggregated,
                        performanceMetrics: {
                            overallAMDAccuracy: aggregated.totalCalls > 0
                                ? ((aggregated.totalAMDDetections / aggregated.totalCalls) * 100).toFixed(2) + '%'
                                : '0%',
                            humanConnectionRate: aggregated.totalCalls > 0
                                ? ((aggregated.totalHumanConnections / aggregated.totalCalls) * 100).toFixed(2) + '%'
                                : '0%',
                            culturalEngagementRate: aggregated.totalCalls > 0
                                ? ((aggregated.totalCulturalEngagement / aggregated.totalCalls) * 100).toFixed(2) + '%'
                                : '0%',
                            messageSuccessRate: aggregated.totalAMDDetections > 0
                                ? ((aggregated.totalMessagesLeft / aggregated.totalAMDDetections) * 100).toFixed(2) + '%'
                                : '0%',
                        },
                        campaignSummary: campaigns.map(c => ({
                            id: c.id,
                            name: c.name,
                            status: c.status,
                            language: c.culturalProfile.primaryLanguage,
                            calls: c.analytics.totalCalls,
                            lastUpdate: c.updatedAt,
                        })),
                    },
                });
            }

            default: {
                // Get all campaigns
                const campaigns = campaignManager.getAllCampaigns();

                return NextResponse.json({
                    success: true,
                    data: {
                        campaigns,
                        summary: {
                            totalCampaigns: campaigns.length,
                            activeCampaigns: campaigns.filter(c => c.status === 'active').length,
                            pausedCampaigns: campaigns.filter(c => c.status === 'paused').length,
                            completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
                        },
                        culturalDistribution: {
                            malayalam: campaigns.filter(c => c.culturalProfile.primaryLanguage === 'malayalam').length,
                            english: campaigns.filter(c => c.culturalProfile.primaryLanguage === 'english').length,
                            mixed: campaigns.filter(c => c.culturalProfile.primaryLanguage === 'mixed').length,
                        },
                    },
                });
            }
        }

    } catch (error) {
        console.error('Campaign GET error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve campaign data',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const campaignId = url.searchParams.get('campaignId');

        if (!campaignId) {
            return NextResponse.json({
                success: false,
                error: 'Campaign ID required for deletion',
            }, { status: 400 });
        }

        const deleted = await campaignManager.deleteCampaign(campaignId);

        if (!deleted) {
            return NextResponse.json({
                success: false,
                error: 'Campaign not found or deletion failed',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                message: 'Campaign deleted successfully',
                campaignId,
            },
        });

    } catch (error) {
        console.error('Campaign deletion error:', error);
        return NextResponse.json({
            success: false,
            error: 'Campaign deletion failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}