import { Router, Request, Response } from 'express';
import { adminSettingsService, FeatureFlags } from '../services/adminSettings';
import { logger } from '../utils/logger';

const router = Router();

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        tenantId: string;
        role?: string;
    };
}

/**
 * Get all feature flags
 * GET /api/admin/features
 */
router.get('/features', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        // Basic auth check - in production, check for admin role
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const features = await adminSettingsService.getFeatureFlags();

        res.json({
            success: true,
            data: features,
        });
    } catch (error) {
        logger.error('Error fetching feature flags', { error });
        res.status(500).json({ error: 'Failed to fetch feature flags' });
    }
});

/**
 * Update feature flags
 * PUT /api/admin/features
 */
router.put('/features', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        // Basic auth check - in production, check for admin role
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const updates: Partial<FeatureFlags> = req.body;
        const updatedBy = user.email;

        // Update each feature flag
        for (const [key, enabled] of Object.entries(updates)) {
            if (typeof enabled === 'boolean') {
                await adminSettingsService.setFeatureFlag(key as keyof FeatureFlags, enabled, updatedBy);
            }
        }

        // Return updated flags
        const features = await adminSettingsService.getFeatureFlags();

        logger.info('Feature flags updated', { updates, updatedBy });

        res.json({
            success: true,
            message: 'Feature flags updated successfully',
            data: features,
        });
    } catch (error) {
        logger.error('Error updating feature flags', { error });
        res.status(500).json({ error: 'Failed to update feature flags' });
    }
});

/**
 * Get all admin settings
 * GET /api/admin/settings
 */
router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        // Basic auth check - in production, check for admin role
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const settings = await adminSettingsService.getAllSettings();

        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        logger.error('Error fetching admin settings', { error });
        res.status(500).json({ error: 'Failed to fetch admin settings' });
    }
});

/**
 * Update any admin setting
 * PUT /api/admin/settings/:key
 */
router.put('/settings/:key', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        // Basic auth check - in production, check for admin role
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { key } = req.params;
        const { value, category } = req.body;
        const updatedBy = user.email;

        await adminSettingsService.setSetting(key, value, category, updatedBy);

        res.json({
            success: true,
            message: `Setting '${key}' updated successfully`,
        });
    } catch (error) {
        logger.error('Error updating admin setting', { error, key: req.params.key });
        res.status(500).json({ error: 'Failed to update admin setting' });
    }
});

/**
 * Initialize default settings (one-time setup)
 * POST /api/admin/initialize
 */
router.post('/initialize', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        // Basic auth check - in production, check for admin role
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        await adminSettingsService.initializeDefaults();

        res.json({
            success: true,
            message: 'Default admin settings initialized',
        });
    } catch (error) {
        logger.error('Error initializing admin settings', { error });
        res.status(500).json({ error: 'Failed to initialize admin settings' });
    }
});

export default router;