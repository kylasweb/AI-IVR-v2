// Rate limiting utilities for Strategic Engine API
// TODO: Implement Redis-based rate limiting for production

import { NextRequest } from 'next/server';

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: Date;
    error?: string;
}

// Simple in-memory rate limiting (not suitable for production with multiple instances)
const rateLimitStore = new Map<string, { count: number; resetTime: number; }>();

export default function rateLimit(config: RateLimitConfig) {
    return async (request: NextRequest): Promise<RateLimitResult> => {
        const key = config.keyGenerator ?
            config.keyGenerator(request) :
            getClientIdentifier(request);

        const now = Date.now();
        const windowStart = now - config.windowMs;

        // Clean up old entries
        for (const [storeKey, data] of rateLimitStore.entries()) {
            if (data.resetTime < windowStart) {
                rateLimitStore.delete(storeKey);
            }
        }

        const current = rateLimitStore.get(key);
        const resetTime = now + config.windowMs;

        if (!current || current.resetTime < now) {
            // First request or window has reset
            rateLimitStore.set(key, { count: 1, resetTime });
            return {
                success: true,
                limit: config.maxRequests,
                remaining: config.maxRequests - 1,
                reset: new Date(resetTime)
            };
        }

        if (current.count >= config.maxRequests) {
            // Rate limit exceeded
            return {
                success: false,
                limit: config.maxRequests,
                remaining: 0,
                reset: new Date(current.resetTime),
                error: 'Rate limit exceeded'
            };
        }

        // Increment counter
        current.count++;
        rateLimitStore.set(key, current);

        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - current.count,
            reset: new Date(current.resetTime)
        };
    };
}

function getClientIdentifier(request: NextRequest): string {
    // Try to get client IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback to a default if no IP is available
    return 'unknown-client';
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
    strategic: rateLimit({
        maxRequests: 100,
        windowMs: 60 * 1000, // 1 minute
    }),

    batch: rateLimit({
        maxRequests: 10,
        windowMs: 60 * 1000, // 1 minute
    }),

    status: rateLimit({
        maxRequests: 200,
        windowMs: 60 * 1000, // 1 minute
    })
};