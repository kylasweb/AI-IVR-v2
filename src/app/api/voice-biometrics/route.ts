/**
 * Voice Biometrics API Endpoints
 * Supports analytics, verification, enrollment, and profile management
 * Part of IMOS AI IVR Platform real-time monitoring system
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'analytics';

        switch (type) {
            case 'analytics':
                return await getAnalytics();

            case 'profiles':
                return await getProfiles();

            case 'verification_history':
                return await getVerificationHistory();

            case 'security_status':
                return await getSecurityStatus();

            default:
                return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
        }
    } catch (error) {
        console.error('Voice biometrics API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'enroll':
                return await enrollVoiceProfile(body);

            case 'verify':
                return await verifyVoice(body);

            case 'update_profile':
                return await updateProfile(body);

            case 'delete_profile':
                return await deleteProfile(body);

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Voice biometrics POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function getAnalytics() {
    try {
        // Get total voice profiles
        const totalProfiles = await db.voiceProfile.count({
            where: { status: 'active' }
        });

        // Get verifications today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const verificationsToday = await db.voiceVerification.count({
            where: {
                createdAt: {
                    gte: today
                }
            }
        });

        // Get successful verifications today
        const successfulVerifications = await db.voiceVerification.count({
            where: {
                createdAt: {
                    gte: today
                },
                verified: true
            }
        });

        // Calculate success rate
        const successRate = verificationsToday > 0
            ? successfulVerifications / verificationsToday
            : 0;

        // Get average confidence
        const avgConfidenceResult = await db.voiceVerification.aggregate({
            where: {
                createdAt: {
                    gte: today
                }
            },
            _avg: {
                confidenceScore: true
            }
        });

        const averageConfidence = avgConfidenceResult._avg.confidenceScore || 0;

        // Get security alerts (failed attempts, suspicious activity)
        const securityAlerts = await db.voiceVerification.count({
            where: {
                createdAt: {
                    gte: today
                },
                verified: false,
                confidenceScore: {
                    lt: 0.3 // Very low confidence might indicate spoofing
                }
            }
        });

        // Get dialect distribution
        const dialectDistribution = await db.voiceProfile.groupBy({
            by: ['primaryDialect'],
            _count: {
                id: true
            },
            where: {
                status: 'active'
            }
        });

        // Get enrollment trends (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const enrollmentTrends = await db.voiceProfile.groupBy({
            by: ['createdAt'],
            _count: {
                id: true
            },
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            }
        });

        // Get verification patterns by hour
        const hourlyVerifications = await db.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as count,
        AVG("confidenceScore") as avg_confidence
      FROM "VoiceVerification"
      WHERE "createdAt" >= ${today}
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour
    `;

        return NextResponse.json({
            success: true,
            analytics: {
                totalProfiles,
                verificationsToday,
                successfulVerifications,
                successRate,
                averageConfidence,
                securityAlerts,
                dialectDistribution: dialectDistribution.map(d => ({
                    dialect: d.primaryDialect,
                    count: d._count.id
                })),
                enrollmentTrends: enrollmentTrends.map(t => ({
                    date: t.createdAt,
                    count: t._count.id
                })),
                hourlyVerifications
            }
        });
    } catch (error) {
        console.error('Error getting voice biometrics analytics:', error);
        return NextResponse.json(
            { error: 'Failed to get analytics' },
            { status: 500 }
        );
    }
}

async function getProfiles() {
    try {
        const profiles = await db.voiceProfile.findMany({
            select: {
                id: true,
                callerId: true,
                primaryDialect: true,
                confidence: true,
                status: true,
                createdAt: true,
                lastUsed: true,
                _count: {
                    select: {
                        verifications: true
                    }
                }
            },
            orderBy: {
                lastUsed: 'desc'
            },
            take: 100
        });

        return NextResponse.json({
            success: true,
            profiles: profiles.map(profile => ({
                ...profile,
                verificationCount: profile._count.verifications
            }))
        });
    } catch (error) {
        console.error('Error getting voice profiles:', error);
        return NextResponse.json(
            { error: 'Failed to get profiles' },
            { status: 500 }
        );
    }
}

async function getVerificationHistory() {
    try {
        const history = await db.voiceVerification.findMany({
            include: {
                profile: {
                    select: {
                        callerId: true,
                        primaryDialect: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        });

        return NextResponse.json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Error getting verification history:', error);
        return NextResponse.json(
            { error: 'Failed to get verification history' },
            { status: 500 }
        );
    }
}

async function getSecurityStatus() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Failed verification attempts
        const failedAttempts = await db.voiceVerification.count({
            where: {
                createdAt: { gte: today },
                verified: false
            }
        });

        // Suspicious low-confidence attempts
        const suspiciousAttempts = await db.voiceVerification.count({
            where: {
                createdAt: { gte: today },
                confidenceScore: { lt: 0.3 }
            }
        });

        // Multiple failed attempts from same caller
        const multipleFailures = await db.$queryRaw`
      SELECT "callerId", COUNT(*) as failure_count
      FROM "VoiceVerification" v
      JOIN "VoiceProfile" p ON v."profileId" = p.id
      WHERE v."createdAt" >= ${today}
        AND v.verified = false
      GROUP BY "callerId"
      HAVING COUNT(*) >= 3
    `;

        // Profile tampering detection (significant feature changes)
        const profileAnomalies = await db.voiceProfile.count({
            where: {
                updatedAt: { gte: today },
                confidence: { lt: 0.7 } // Sudden drop in confidence
            }
        });

        const securityStatus = {
            level: 'secure' as 'secure' | 'warning' | 'critical',
            alerts: 0,
            threats: [] as string[]
        };

        if (suspiciousAttempts > 5) {
            securityStatus.level = 'warning';
            securityStatus.alerts++;
            securityStatus.threats.push('Multiple low-confidence verification attempts detected');
        }

        if (Array.isArray(multipleFailures) && multipleFailures.length > 0) {
            securityStatus.level = 'critical';
            securityStatus.alerts += multipleFailures.length;
            securityStatus.threats.push(`${multipleFailures.length} callers with multiple failed attempts`);
        }

        if (profileAnomalies > 0) {
            securityStatus.level = 'warning';
            securityStatus.alerts++;
            securityStatus.threats.push('Voice profile anomalies detected');
        } return NextResponse.json({
            success: true,
            security: {
                ...securityStatus,
                metrics: {
                    failedAttempts,
                    suspiciousAttempts,
                    multipleFailures: Array.isArray(multipleFailures) ? multipleFailures.length : 0,
                    profileAnomalies
                }
            }
        });
    } catch (error) {
        console.error('Error getting security status:', error);
        return NextResponse.json(
            { error: 'Failed to get security status' },
            { status: 500 }
        );
    }
}

async function enrollVoiceProfile(body: any) {
    try {
        const { callerId, audioData, metadata } = body;

        if (!callerId || !audioData) {
            return NextResponse.json(
                { error: 'CallerId and audioData are required' },
                { status: 400 }
            );
        }

        // Create voice profile in database
        const profile = await db.voiceProfile.create({
            data: {
                callerId,
                primaryDialect: metadata?.dialect || 'central_kerala',
                confidence: 0.85,
                status: 'active',
                features: audioData, // In real implementation, this would be processed features
                lastUsed: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            enrollment: profile
        });
    } catch (error) {
        console.error('Error enrolling voice profile:', error);
        return NextResponse.json(
            { error: 'Failed to enroll voice profile' },
            { status: 500 }
        );
    }
}

async function verifyVoice(body: any) {
    try {
        const { callerId, audioData } = body;

        if (!callerId || !audioData) {
            return NextResponse.json(
                { error: 'CallerId and audioData are required' },
                { status: 400 }
            );
        }

        // Find voice profile
        const profile = await db.voiceProfile.findFirst({
            where: {
                callerId,
                status: 'active'
            }
        });

        if (!profile) {
            return NextResponse.json({
                success: true,
                verification: {
                    verified: false,
                    confidence: 0,
                    reason: 'No voice profile found'
                }
            });
        }

        // Simulate verification (in real implementation, this would use ML model)
        const confidence = 0.85 + Math.random() * 0.1;
        const verified = confidence > 0.8;

        // Log verification attempt
        await db.voiceVerification.create({
            data: {
                profileId: profile.id,
                verified,
                confidenceScore: confidence,
                audioFeatures: audioData
            }
        });

        // Update last used
        await db.voiceProfile.update({
            where: { id: profile.id },
            data: { lastUsed: new Date() }
        });

        return NextResponse.json({
            success: true,
            verification: {
                verified,
                confidence,
                profileId: profile.id
            }
        });
    } catch (error) {
        console.error('Error verifying voice:', error);
        return NextResponse.json(
            { error: 'Failed to verify voice' },
            { status: 500 }
        );
    }
} async function updateProfile(body: any) {
    try {
        const { profileId, updates } = body;

        if (!profileId) {
            return NextResponse.json(
                { error: 'ProfileId is required' },
                { status: 400 }
            );
        }

        const updatedProfile = await db.voiceProfile.update({
            where: { id: profileId },
            data: {
                ...updates,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            profile: updatedProfile
        });
    } catch (error) {
        console.error('Error updating voice profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

async function deleteProfile(body: any) {
    try {
        const { profileId } = body;

        if (!profileId) {
            return NextResponse.json(
                { error: 'ProfileId is required' },
                { status: 400 }
            );
        }

        // Soft delete - mark as inactive
        await db.voiceProfile.update({
            where: { id: profileId },
            data: {
                status: 'inactive',
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting voice profile:', error);
        return NextResponse.json(
            { error: 'Failed to delete profile' },
            { status: 500 }
        );
    }
}