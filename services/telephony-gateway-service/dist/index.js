"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const compress_1 = __importDefault(require("@fastify/compress"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
// Import routes
const health_1 = require("./routes/health");
const status_1 = require("./routes/status");
const routing_1 = require("./routes/routing");
// Import services
const freeswitchEsl_1 = require("./services/freeswitchEsl");
const jioSipTrunk_1 = require("./services/jioSipTrunk");
const operationsHub_1 = require("./services/operationsHub");
const testingInfrastructure_1 = require("./services/testingInfrastructure");
const productionDeployment_1 = require("./services/productionDeployment");
const fastify = (0, fastify_1.default)({
    logger: false, // Using winston logger
    trustProxy: true,
});
// Register plugins
fastify.register(helmet_1.default, {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
});
fastify.register(cors_1.default, {
    origin: config_1.config.corsOrigins,
    credentials: true,
});
fastify.register(rate_limit_1.default, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        statusCode: 429,
    }),
});
fastify.register(compress_1.default);
// Request logging
fastify.addHook('onRequest', (request, reply, done) => {
    logger_1.logger.info(`${request.method} ${request.url}`, {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
    });
    done();
});
// Register routes
fastify.register(health_1.healthRoutes, { prefix: '/health' });
fastify.register(status_1.statusRoutes, { prefix: '/api/v1/telephony' });
fastify.register(routing_1.routingRoutes, { prefix: '/api/v1/telephony' });
// Error handling
fastify.setErrorHandler(errorHandler_1.errorHandler);
fastify.setNotFoundHandler(notFoundHandler_1.notFoundHandler);
// Graceful shutdown
const closeGracefully = (signal) => {
    logger_1.logger.info(`Received ${signal}, shutting down gracefully`);
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
        logger_1.logger.info('Initializing advanced services...');
        // Services are initialized as singletons when imported
        // Feature flag checks happen during service initialization
        logger_1.logger.info('Advanced services initialization completed', {
            freeswitchEslEnabled: freeswitchEsl_1.freeswitchEslService.isEnabled(),
            jioSipTrunkEnabled: jioSipTrunk_1.jioSipTrunkService.isEnabled(),
            operationsHubEnabled: operationsHub_1.operationsHubService.isEnabled(),
            testingInfrastructureEnabled: testingInfrastructure_1.testingInfrastructureService.isEnabled(),
            productionDeploymentEnabled: productionDeployment_1.productionDeploymentService.isEnabled(),
        });
        await fastify.listen({ port: config_1.config.port, host: '0.0.0.0' });
        logger_1.logger.info(`Telephony Gateway Service listening on port ${config_1.config.port}`, {
            environment: config_1.config.nodeEnv,
            port: config_1.config.port,
        });
    }
    catch (err) {
        logger_1.logger.error('Failed to start server:', err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map