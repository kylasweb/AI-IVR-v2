"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const healthRoutes = async (fastify) => {
    fastify.get('/health', async (request, reply) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'telephony-gateway-service',
            version: process.env.npm_package_version || '1.0.0',
        };
    });
    fastify.get('/ready', async (request, reply) => {
        // Check database connectivity
        try {
            await fastify.prisma.$queryRaw `SELECT 1`;
            return {
                status: 'ready',
                timestamp: new Date().toISOString(),
                database: 'connected',
            };
        }
        catch (error) {
            reply.status(503);
            return {
                status: 'not ready',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    });
};
exports.healthRoutes = healthRoutes;
//# sourceMappingURL=health.js.map