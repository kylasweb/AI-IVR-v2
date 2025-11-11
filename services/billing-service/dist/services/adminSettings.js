"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSettingsService = exports.AdminSettingsService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
class AdminSettingsService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    /**
     * Get all feature flags
     */
    async getFeatureFlags() {
        try {
            const settings = await this.prisma.adminSetting.findMany({
                where: {
                    category: 'features',
                },
            });
            // Default values (all disabled for AI-first approach)
            const defaults = {
                enableFreeswitchEsl: false,
                enableJioSipTrunk: false,
                enableOperationsHub: false,
                enableTestingInfrastructure: false,
                enableProductionDeployment: false,
            };
            // Override with database values
            const flags = { ...defaults };
            settings.forEach(setting => {
                const key = setting.key;
                if (key in flags) {
                    flags[key] = setting.isEnabled;
                }
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
     * Get a specific feature flag
     */
    async getFeatureFlag(key) {
        try {
            const setting = await this.prisma.adminSetting.findUnique({
                where: { key },
            });
            return setting?.isEnabled ?? false;
        }
        catch (error) {
            logger_1.logger.error('Error fetching feature flag', { error, key });
            return false;
        }
    }
    /**
     * Set a feature flag
     */
    async setFeatureFlag(key, enabled, updatedBy) {
        try {
            const descriptions = {
                enableFreeswitchEsl: 'Enable FreeSWITCH ESL client for real-time call control',
                enableJioSipTrunk: 'Enable Jio SIP trunk integration and national routing',
                enableOperationsHub: 'Enable Operations Hub development for agent management',
                enableTestingInfrastructure: 'Enable testing infrastructure with Jest/Supertest',
                enableProductionDeployment: 'Enable production deployment configuration',
            };
            await this.prisma.adminSetting.upsert({
                where: { key },
                update: {
                    value: enabled,
                    isEnabled: enabled,
                    updatedAt: new Date(),
                    updatedBy,
                },
                create: {
                    key,
                    value: enabled,
                    description: descriptions[key],
                    category: 'features',
                    isEnabled: enabled,
                    updatedBy,
                },
            });
            logger_1.logger.info('Feature flag updated', { key, enabled, updatedBy });
        }
        catch (error) {
            logger_1.logger.error('Error setting feature flag', { error, key, enabled });
            throw error;
        }
    }
    /**
     * Get all admin settings
     */
    async getAllSettings() {
        try {
            return await this.prisma.adminSetting.findMany({
                orderBy: [
                    { category: 'asc' },
                    { key: 'asc' },
                ],
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching all settings', { error });
            return [];
        }
    }
    /**
     * Set any admin setting
     */
    async setSetting(key, value, category = 'system', updatedBy) {
        try {
            await this.prisma.adminSetting.upsert({
                where: { key },
                update: {
                    value,
                    isEnabled: typeof value === 'boolean' ? value : false,
                    updatedAt: new Date(),
                    updatedBy,
                },
                create: {
                    key,
                    value,
                    category,
                    isEnabled: typeof value === 'boolean' ? value : false,
                    updatedBy,
                },
            });
            logger_1.logger.info('Admin setting updated', { key, value, category, updatedBy });
        }
        catch (error) {
            logger_1.logger.error('Error setting admin setting', { error, key, value });
            throw error;
        }
    }
    /**
     * Initialize default feature flags (call this on startup)
     */
    async initializeDefaults() {
        try {
            const defaults = [
                {
                    key: 'enableFreeswitchEsl',
                    description: 'Enable FreeSWITCH ESL client for real-time call control',
                },
                {
                    key: 'enableJioSipTrunk',
                    description: 'Enable Jio SIP trunk integration and national routing',
                },
                {
                    key: 'enableOperationsHub',
                    description: 'Enable Operations Hub development for agent management',
                },
                {
                    key: 'enableTestingInfrastructure',
                    description: 'Enable testing infrastructure with Jest/Supertest',
                },
                {
                    key: 'enableProductionDeployment',
                    description: 'Enable production deployment configuration',
                },
            ];
            for (const { key, description } of defaults) {
                await this.prisma.adminSetting.upsert({
                    where: { key },
                    update: {}, // Don't change existing values
                    create: {
                        key,
                        value: false,
                        description,
                        category: 'features',
                        isEnabled: false,
                    },
                });
            }
            logger_1.logger.info('Default feature flags initialized');
        }
        catch (error) {
            logger_1.logger.error('Error initializing default feature flags', { error });
        }
    }
}
exports.AdminSettingsService = AdminSettingsService;
// Export singleton instance
exports.adminSettingsService = new AdminSettingsService();
//# sourceMappingURL=adminSettings.js.map