import Redis from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

// Performance monitoring and caching middleware
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface PerformanceMetrics {
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    userAgent: string;
    timestamp: Date;
    userId?: string;
}

export class PerformanceMonitor {
    private static metrics: PerformanceMetrics[] = [];

    static async recordMetric(metric: PerformanceMetrics) {
        this.metrics.push(metric);

        // Store in Redis for real-time analytics
        try {
            await redis.lpush('performance_metrics', JSON.stringify(metric));
            await redis.ltrim('performance_metrics', 0, 999); // Keep last 1000 metrics
        } catch (error) {
            console.error('Failed to store performance metric:', error);
        }
    }

    static async getMetrics(limit = 100) {
        try {
            const metrics = await redis.lrange('performance_metrics', 0, limit - 1);
            return metrics.map(m => JSON.parse(m));
        } catch (error) {
            console.error('Failed to retrieve metrics:', error);
            return this.metrics.slice(-limit);
        }
    }

    static getAverageResponseTime(endpoint?: string) {
        const filteredMetrics = endpoint
            ? this.metrics.filter(m => m.endpoint === endpoint)
            : this.metrics;

        if (filteredMetrics.length === 0) return 0;

        const totalTime = filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0);
        return totalTime / filteredMetrics.length;
    }
}

export function withPerformanceMonitoring(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const startTime = Date.now();

        try {
            const response = await handler(req);
            const endTime = Date.now();

            // Record performance metrics
            await PerformanceMonitor.recordMetric({
                endpoint: req.url,
                method: req.method,
                responseTime: endTime - startTime,
                statusCode: response.status,
                userAgent: req.headers.get('user-agent') || 'unknown',
                timestamp: new Date(),
                userId: req.headers.get('x-user-id') || undefined
            });

            // Add performance headers
            response.headers.set('X-Response-Time', `${endTime - startTime}ms`);
            response.headers.set('X-Server-Time', new Date().toISOString());

            return response;
        } catch (error) {
            const endTime = Date.now();

            // Record error metrics
            await PerformanceMonitor.recordMetric({
                endpoint: req.url,
                method: req.method,
                responseTime: endTime - startTime,
                statusCode: 500,
                userAgent: req.headers.get('user-agent') || 'unknown',
                timestamp: new Date(),
                userId: req.headers.get('x-user-id') || undefined
            });

            throw error;
        }
    };
}

// Caching utilities
export class CacheManager {
    private static ttl = 300; // 5 minutes default TTL

    static async get(key: string) {
        try {
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    static async set(key: string, value: any, ttl = this.ttl) {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    static async del(key: string) {
        try {
            await redis.del(key);
        } catch (error) {
            console.error('Cache del error:', error);
        }
    }

    static async invalidatePattern(pattern: string) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }
}

// Rate limiting
export class RateLimiter {
    static async checkLimit(
        identifier: string,
        limit = 100,
        window = 3600 // 1 hour
    ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
        try {
            const key = `rate_limit:${identifier}`;
            const current = await redis.incr(key);

            if (current === 1) {
                await redis.expire(key, window);
            }

            const ttl = await redis.ttl(key);
            const resetTime = Date.now() + (ttl * 1000);

            return {
                allowed: current <= limit,
                remaining: Math.max(0, limit - current),
                resetTime
            };
        } catch (error) {
            console.error('Rate limiting error:', error);
            // Fail open for reliability
            return { allowed: true, remaining: limit, resetTime: Date.now() + (window * 1000) };
        }
    }
}