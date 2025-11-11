"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routingRoutes = void 0;
const logger_1 = require("../utils/logger");
const routingRoutes = async (fastify) => {
    // SIP Trunk management
    fastify.get('/sip-trunks', async (request, reply) => {
        try {
            const { tenantId, status } = request.query;
            const where = {};
            if (tenantId)
                where.tenantId = tenantId;
            if (status)
                where.status = status;
            const sipTrunks = await fastify.prisma.sipTrunk.findMany({
                where,
            });
            return {
                success: true,
                data: sipTrunks,
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching SIP trunks', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to fetch SIP trunks',
            };
        }
    });
    fastify.post('/sip-trunks', async (request, reply) => {
        try {
            const sipTrunk = await fastify.prisma.sipTrunk.create({
                data: request.body,
            });
            return {
                success: true,
                data: sipTrunk,
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating SIP trunk', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to create SIP trunk',
            };
        }
    });
    // Routing rules management
    fastify.get('/routing-rules', async (request, reply) => {
        try {
            const { tenantId, priority } = request.query;
            const where = {};
            if (tenantId)
                where.tenantId = tenantId;
            if (priority)
                where.priority = parseInt(priority);
            const routingRules = await fastify.prisma.routingRule.findMany({
                where,
                orderBy: {
                    priority: 'asc',
                },
            });
            return {
                success: true,
                data: routingRules,
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching routing rules', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to fetch routing rules',
            };
        }
    });
    fastify.post('/routing-rules', async (request, reply) => {
        try {
            const routingRule = await fastify.prisma.routingRule.create({
                data: request.body,
            });
            return {
                success: true,
                data: routingRule,
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating routing rule', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to create routing rule',
            };
        }
    });
    // Call logs
    fastify.get('/call-logs', async (request, reply) => {
        try {
            const callLogs = await fastify.prisma.callLog.findMany({
                include: {
                    trunk: true,
                },
                orderBy: {
                    startedAt: 'desc',
                },
                take: 100, // Limit to last 100 calls
            });
            return {
                success: true,
                data: callLogs,
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching call logs', { error });
            reply.status(500);
            return {
                success: false,
                error: 'Failed to fetch call logs',
            };
        }
    });
};
exports.routingRoutes = routingRoutes;
//# sourceMappingURL=routing.js.map