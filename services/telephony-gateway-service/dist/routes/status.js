"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusRoutes = void 0;
const logger_1 = require("../utils/logger");
const featureFlags_1 = require("../services/featureFlags");
const freeswitchEsl_1 = require("../services/freeswitchEsl");
const jioSipTrunk_1 = require("../services/jioSipTrunk");
const operationsHub_1 = require("../services/operationsHub");
const testingInfrastructure_1 = require("../services/testingInfrastructure");
const productionDeployment_1 = require("../services/productionDeployment");
const statusRoutes = async (fastify) => {
    // Get service status and metrics
    fastify.get('/status', async (request, reply) => {
        try {
            // Get feature flags
            const featureFlags = await featureFlags_1.featureFlagService.getFeatureFlags();
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
                        freeswitchEsl: freeswitchEsl_1.freeswitchEslService.isEnabled(),
                        jioSipTrunk: jioSipTrunk_1.jioSipTrunkService.isEnabled(),
                        operationsHub: operationsHub_1.operationsHubService.isEnabled(),
                        testingInfrastructure: testingInfrastructure_1.testingInfrastructureService.isEnabled(),
                        productionDeployment: productionDeployment_1.productionDeploymentService.isEnabled(),
                    },
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching service status', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to fetch service status',
            };
        }
    });
    // Get FreeSWITCH status (placeholder for ESL integration)
    fastify.get('/freeswitch/status', async (request, reply) => {
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
        }
        catch (error) {
            logger_1.logger.error('Error fetching FreeSWITCH status', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to fetch FreeSWITCH status',
            };
        }
    });
};
exports.statusRoutes = statusRoutes;
//# sourceMappingURL=status.js.map