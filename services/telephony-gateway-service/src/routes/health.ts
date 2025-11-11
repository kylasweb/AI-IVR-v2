import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export const healthRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'telephony-gateway-service',
            version: process.env.npm_package_version || '1.0.0',
        };
    });

    fastify.get('/ready', async (request: FastifyRequest, reply: FastifyReply) => {
        // Check database connectivity
        try {
            await fastify.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'ready',
                timestamp: new Date().toISOString(),
                database: 'connected',
            };
        } catch (error) {
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