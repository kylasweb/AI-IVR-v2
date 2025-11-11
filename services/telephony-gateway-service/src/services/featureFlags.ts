import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface FeatureFlags {
    enableFreeswitchEsl: boolean;
    enableJioSipTrunk: boolean;
    enableOperationsHub: boolean;
    enableTestingInfrastructure: boolean;
    enableProductionDeployment: boolean;
}

export class FeatureFlagService {
    private client: AxiosInstance;
    private cache: Map<string, { value: any; expires: number }> = new Map();
    private cacheTimeout = 5 * 60 * 1000; // 5 minutes

    constructor(billingServiceUrl: string = process.env.BILLING_SERVICE_URL || 'http://billing-service:3001') {
        this.client = axios.create({
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
    async getFeatureFlags(): Promise<FeatureFlags> {
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
        } catch (error) {
            logger.error('Error fetching feature flags', { error });
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
    async getFeatureFlag(key: keyof FeatureFlags): Promise<boolean> {
        const flags = await this.getFeatureFlags();
        return flags[key] ?? false;
    }

    /**
     * Check if FreeSWITCH ESL is enabled
     */
    async isFreeswitchEslEnabled(): Promise<boolean> {
        return this.getFeatureFlag('enableFreeswitchEsl');
    }

    /**
     * Check if Jio SIP trunk is enabled
     */
    async isJioSipTrunkEnabled(): Promise<boolean> {
        return this.getFeatureFlag('enableJioSipTrunk');
    }

    /**
     * Check if Operations Hub is enabled
     */
    async isOperationsHubEnabled(): Promise<boolean> {
        return this.getFeatureFlag('enableOperationsHub');
    }

    /**
     * Check if testing infrastructure is enabled
     */
    async isTestingInfrastructureEnabled(): Promise<boolean> {
        return this.getFeatureFlag('enableTestingInfrastructure');
    }

    /**
     * Check if production deployment is enabled
     */
    async isProductionDeploymentEnabled(): Promise<boolean> {
        return this.getFeatureFlag('enableProductionDeployment');
    }

    /**
     * Clear cache (useful for testing or when settings change)
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Health check for the feature flag service
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.client.get('/health');
            return true;
        } catch (error) {
            logger.error('Feature flag service health check failed', { error });
            return false;
        }
    }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();