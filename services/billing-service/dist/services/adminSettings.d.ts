export interface FeatureFlags {
    enableFreeswitchEsl: boolean;
    enableJioSipTrunk: boolean;
    enableOperationsHub: boolean;
    enableTestingInfrastructure: boolean;
    enableProductionDeployment: boolean;
}
export declare class AdminSettingsService {
    private prisma;
    constructor();
    /**
     * Get all feature flags
     */
    getFeatureFlags(): Promise<FeatureFlags>;
    /**
     * Get a specific feature flag
     */
    getFeatureFlag(key: keyof FeatureFlags): Promise<boolean>;
    /**
     * Set a feature flag
     */
    setFeatureFlag(key: keyof FeatureFlags, enabled: boolean, updatedBy?: string): Promise<void>;
    /**
     * Get all admin settings
     */
    getAllSettings(): Promise<any[]>;
    /**
     * Set any admin setting
     */
    setSetting(key: string, value: any, category?: string, updatedBy?: string): Promise<void>;
    /**
     * Initialize default feature flags (call this on startup)
     */
    initializeDefaults(): Promise<void>;
}
export declare const adminSettingsService: AdminSettingsService;
//# sourceMappingURL=adminSettings.d.ts.map