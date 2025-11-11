"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlagService = exports.FeatureFlagService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class FeatureFlagService {
    constructor(billingServiceUrl = process.env.BILLING_SERVICE_URL || 'http://billing-service:3001') {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.client = axios_1.default.create({
            baseURL: billingServiceUrl,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
                // In production, add authentication headers here
                // 'Authorization': `Bearer ${process.env.SERVICE_TOKEN}`,
            },
        });
    }
    /**
     * Get all feature flags with caching
     */
    async getFeatureFlags() {
        const cacheKey = 'featureFlags';
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            return cached.value;
        }
        try {
            const response = await this.client.get('/api/v1/admin/features');
            const flags = response.data.data;
            // Cache the result
            this.cache.set(cacheKey, {
                value: flags,
                expires: Date.now() + this.cacheTimeout,
            });
            return flags;
        }
        catch (error) {
            logger_1.logger.error('Error fetching feature flags', { error });
            // Return defaults on error
            return {
                enableFreeswitchEsl: false,
                enableJioSipTrunk: false,
                enableOperationsHub: false,
                enableTestingInfrastructure: false,
                enableProductionDeployment: false,
            };
        }
    }
    /**
     * Get a specific feature flag with caching
     */
    async getFeatureFlag(key) {
        const flags = await this.getFeatureFlags();
        return flags[key] ?? false;
    }
    /**
     * Check if FreeSWITCH ESL is enabled
     */
    async isFreeswitchEslEnabled() {
        return this.getFeatureFlag('enableFreeswitchEsl');
    }
    /**
     * Check if Jio SIP trunk is enabled
     */
    async isJioSipTrunkEnabled() {
        return this.getFeatureFlag('enableJioSipTrunk');
    }
    /**
     * Check if Operations Hub is enabled
     */
    async isOperationsHubEnabled() {
        return this.getFeatureFlag('enableOperationsHub');
    }
    /**
     * Check if testing infrastructure is enabled
     */
    async isTestingInfrastructureEnabled() {
        return this.getFeatureFlag('enableTestingInfrastructure');
    }
    /**
     * Check if production deployment is enabled
     */
    async isProductionDeploymentEnabled() {
        return this.getFeatureFlag('enableProductionDeployment');
    }
    /**
     * Clear cache (useful for testing or when settings change)
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Health check for the feature flag service
     */
    async healthCheck() {
        try {
            await this.client.get('/health');
            return true;
        }
        catch (error) {
            logger_1.logger.error('Feature flag service health check failed', { error });
            return false;
        }
    }
}
exports.FeatureFlagService = FeatureFlagService;
// Export singleton instance
exports.featureFlagService = new FeatureFlagService();
//# sourceMappingURL=featureFlags.js.map