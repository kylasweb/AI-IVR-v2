import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import { healthRoutes } from './routes/health';
import { statusRoutes } from './routes/status';
import { routingRoutes } from './routes/routing';

// Import services
import { freeswitchEslService } from './services/freeswitchEsl';
import { jioSipTrunkService } from './services/jioSipTrunk';
import { operationsHubService } from './services/operationsHub';
import { testingInfrastructureService } from './services/testingInfrastructure';
import { productionDeploymentService } from './services/productionDeployment';

const fastify = Fastify({
    logger: false, // Using winston logger
    trustProxy: true,
});

// Register plugins
fastify.register(helmet, {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
});

fastify.register(cors, {
    origin: config.corsOrigins,
    credentials: true,
});

fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        statusCode: 429,
    }),
});

fastify.register(compress);

// Request logging
fastify.addHook('onRequest', (request, reply, done) => {
    logger.info(`${request.method} ${request.url}`, {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
    });
    done();
});

// Register routes
fastify.register(healthRoutes, { prefix: '/health' });
fastify.register(statusRoutes, { prefix: '/api/v1/telephony' });
fastify.register(routingRoutes, { prefix: '/api/v1/telephony' });

// Error handling
fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

// Graceful shutdown
const closeGracefully = (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    fastify.close(() => {
        process.exit(0);
    });
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

// Start server
const start = async () => {
    try {
        // Initialize advanced services (conditionally based on feature flags)
        logger.info('Initializing advanced services...');

        // Services are initialized as singletons when imported
        // Feature flag checks happen during service initialization

        logger.info('Advanced services initialization completed', {
            freeswitchEslEnabled: freeswitchEslService.isEnabled(),
            jioSipTrunkEnabled: jioSipTrunkService.isEnabled(),
            operationsHubEnabled: operationsHubService.isEnabled(),
            testingInfrastructureEnabled: testingInfrastructureService.isEnabled(),
            productionDeploymentEnabled: productionDeploymentService.isEnabled(),
        });

        await fastify.listen({ port: config.port, host: '0.0.0.0' });
        logger.info(`Telephony Gateway Service listening on port ${config.port}`, {
            environment: config.nodeEnv,
            port: config.port,
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
};

start();