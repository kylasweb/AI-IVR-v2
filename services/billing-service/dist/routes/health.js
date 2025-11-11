"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const ioredis_1 = __importDefault(require("ioredis"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6380');
// Health check endpoint
router.get('/', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: 'unknown',
            redis: 'unknown',
        },
    };
    try {
        // Check database connection
        await prisma.$queryRaw `SELECT 1`;
        health.services.database = 'healthy';
    }
    catch (error) {
        health.services.database = 'unhealthy';
        health.status = 'degraded';
    }
    try {
        // Check Redis connection
        await redis.ping();
        health.services.redis = 'healthy';
    }
    catch (error) {
        health.services.redis = 'unhealthy';
        health.status = 'degraded';
    }
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});
// Detailed health check
router.get('/detailed', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: {
                status: 'unknown',
                latency: null,
            },
            redis: {
                status: 'unknown',
                latency: null,
            },
        },
    };
    // Database health check with latency
    const dbStart = Date.now();
    try {
        await prisma.$queryRaw `SELECT 1`;
        health.services.database.status = 'healthy';
        health.services.database.latency = Date.now() - dbStart;
    }
    catch (error) {
        health.services.database.status = 'unhealthy';
        health.status = 'degraded';
    }
    // Redis health check with latency
    const redisStart = Date.now();
    try {
        await redis.ping();
        health.services.redis.status = 'healthy';
        health.services.redis.latency = Date.now() - redisStart;
    }
    catch (error) {
        health.services.redis.status = 'unhealthy';
        health.status = 'degraded';
    }
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});
exports.default = router;
//# sourceMappingURL=health.js.map