import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';

export const notFoundHandler = (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    logger.warn('Route not found', {
        method: request.method,
        url: request.url,
        ip: request.ip,
    });

    reply.status(404).send({
        success: false,
        error: 'Route not found',
        path: request.url,
        method: request.method,
    });
};