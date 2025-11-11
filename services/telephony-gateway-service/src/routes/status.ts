import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { featureFlagService } from '../services/featureFlags';
import { freeswitchEslService } from '../services/freeswitchEsl';
import { jioSipTrunkService } from '../services/jioSipTrunk';
import { operationsHubService } from '../services/operationsHub';
import { testingInfrastructureService } from '../services/testingInfrastructure';
import { productionDeploymentService } from '../services/productionDeployment';

export const statusRoutes = async (fastify: FastifyInstance) => {
    // Get service status and metrics
    fastify.get('/status', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Get feature flags
            const featureFlags = await featureFlagService.getFeatureFlags();

            // Get basic metrics
            const metrics = await fastify.prisma.telephonyMetric.findMany({
                orderBy: {
                    timestamp: 'desc',
                },
                take: 10,
            });

            // Get active SIP trunks count (only if Jio SIP trunk is enabled)
            let activeTrunks = 0;
            if (featureFlags.enableJioSipTrunk) {
                activeTrunks = await fastify.prisma.sipTrunk.count({
                    where: {
                        isActive: true,
                    },
                });
            }

            // Get recent call count (last hour) (only if FreeSWITCH ESL is enabled)
            let recentCalls = 0;
            if (featureFlags.enableFreeswitchEsl) {
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                recentCalls = await fastify.prisma.callLog.count({
                    where: {
                        startedAt: {
                            gte: oneHourAgo,
                        },
                    },
                });
            }

            return {
                success: true,
                data: {
                    service: 'telephony-gateway-service',
                    timestamp: new Date().toISOString(),
                    features: featureFlags,
                    activeSipTrunks: activeTrunks,
                    recentCalls: recentCalls,
                    metrics: metrics,
                    services: {
                        freeswitchEsl: freeswitchEslService.isEnabled(),
                        jioSipTrunk: jioSipTrunkService.isEnabled(),
                        operationsHub: operationsHubService.isEnabled(),
                        testingInfrastructure: testingInfrastructureService.isEnabled(),
                        productionDeployment: productionDeploymentService.isEnabled(),
                    },
                },
            };
        } catch (error) {
            logger.error('Error fetching service status', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to fetch service status',
            };
        }
    });

    // Get FreeSWITCH status (placeholder for ESL integration)
    fastify.get('/freeswitch/status', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // TODO: Implement FreeSWITCH ESL client status check
            return {
                success: true,
                data: {
                    freeswitch: {
                        status: 'unknown', // Will be 'connected' or 'disconnected' when ESL is implemented
                        uptime: null,
                        activeCalls: 0,
                        timestamp: new Date().toISOString(),
                    },
                },
            };
        } catch (error) {
            logger.error('Error fetching FreeSWITCH status', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to fetch FreeSWITCH status',
            };
        }
    });
};