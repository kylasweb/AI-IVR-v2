export interface FeatureFlags {
    enableFreeswitchEsl: boolean;
    enableJioSipTrunk: boolean;
    enableOperationsHub: boolean;
    enableTestingInfrastructure: boolean;
    enableProductionDeployment: boolean;
}
export declare class FeatureFlagService {
    private client;
    private cache;
    private cacheTimeout;
    constructor(billingServiceUrl?: string);
    /**
     * Get all feature flags with caching
     */
    getFeatureFlags(): Promise<FeatureFlags>;
    /**
     * Get a specific feature flag with caching
     */
    getFeatureFlag(key: keyof FeatureFlags): Promise<boolean>;
    /**
     * Check if FreeSWITCH ESL is enabled
     */
    isFreeswitchEslEnabled(): Promise<boolean>;
    /**
     * Check if Jio SIP trunk is enabled
     */
    isJioSipTrunkEnabled(): Promise<boolean>;
    /**
     * Check if Operations Hub is enabled
     */
    isOperationsHubEnabled(): Promise<boolean>;
    /**
     * Check if testing infrastructure is enabled
     */
    isTestingInfrastructureEnabled(): Promise<boolean>;
    /**
     * Check if production deployment is enabled
     */
    isProductionDeploymentEnabled(): Promise<boolean>;
    /**
     * Clear cache (useful for testing or when settings change)
     */
    clearCache(): void;
    /**
     * Health check for the feature flag service
     */
    healthCheck(): Promise<boolean>;
}
export declare const featureFlagService: FeatureFlagService;
//# sourceMappingURL=featureFlags.d.ts.map