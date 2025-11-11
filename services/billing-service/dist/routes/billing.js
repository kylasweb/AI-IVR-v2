"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_1 = require("../services/stripe");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * Create a new subscription
 * POST /api/billing/subscribe
 */
router.post('/subscribe', async (req, res) => {
    try {
        const { priceId, tenantName } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }
        // Create or retrieve Stripe customer
        const customer = await stripe_1.stripeService.createOrRetrieveCustomer(user.email, tenantName || user.email, { tenantId: user.tenantId, userId: user.id });
        // Create subscription
        const subscription = await stripe_1.stripeService.createSubscription(customer.id, priceId, { tenantId: user.tenantId, userId: user.id });
        // Store subscription in database (update tenant)
        await prisma.tenant.update({
            where: { id: parseInt(user.tenantId) },
            data: {
                stripeCustomerId: customer.id,
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                planId: priceId,
            },
        });
        // Log the subscription creation
        await prisma.subscriptionLog.create({
            data: {
                tenantId: parseInt(user.tenantId),
                action: 'created',
                oldPlanId: null,
                newPlanId: priceId,
                stripeEventId: subscription.id,
                metadata: {
                    customerId: customer.id,
                    status: subscription.status,
                },
            },
        });
        logger_1.logger.info('Subscription created', {
            subscriptionId: subscription.id,
            customerId: customer.id,
            tenantId: user.tenantId
        });
        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
            status: subscription.status,
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating subscription', { error });
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});
/**
 * Get current subscription status
 * GET /api/billing/subscription
 */
router.get('/subscription', async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Get subscription from tenant
        const tenant = await prisma.tenant.findUnique({
            where: { id: parseInt(user.tenantId) },
        });
        if (!tenant || !tenant.subscriptionId) {
            return res.json({ status: 'none' });
        }
        // Get latest subscription data from Stripe
        const stripeSubscription = await stripe_1.stripeService.getSubscription(tenant.subscriptionId);
        res.json({
            subscriptionId: tenant.subscriptionId,
            stripeSubscriptionId: tenant.subscriptionId,
            status: tenant.subscriptionStatus,
            planId: tenant.planId,
            stripeStatus: stripeSubscription.status,
            currentPeriodStart: stripeSubscription.current_period_start,
            currentPeriodEnd: stripeSubscription.current_period_end,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting subscription', { error });
        res.status(500).json({ error: 'Failed to get subscription' });
    }
});
/**
 * Create customer portal session
 * POST /api/billing/portal
 */
router.post('/portal', async (req, res) => {
    try {
        const { returnUrl } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Get customer's Stripe customer ID from tenant
        const tenant = await prisma.tenant.findUnique({
            where: { id: parseInt(user.tenantId) },
        });
        if (!tenant || !tenant.stripeCustomerId) {
            return res.status(404).json({ error: 'No subscription found' });
        }
        // Create portal session
        const session = await stripe_1.stripeService.createPortalSession(tenant.stripeCustomerId, returnUrl || `${process.env.FRONTEND_URL}/billing`);
        res.json({
            url: session.url,
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating portal session', { error });
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});
/**
 * Cancel subscription
 * POST /api/billing/cancel
 */
router.post('/cancel', async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Get tenant with active subscription
        const tenant = await prisma.tenant.findUnique({
            where: { id: parseInt(user.tenantId) },
        });
        if (!tenant || !tenant.subscriptionId || tenant.subscriptionStatus === 'canceled') {
            return res.status(404).json({ error: 'No active subscription found' });
        }
        // Cancel subscription in Stripe
        const cancelledSubscription = await stripe_1.stripeService.cancelSubscription(tenant.subscriptionId, true // Cancel at period end
        );
        // Update tenant status
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                subscriptionStatus: cancelledSubscription.status,
                updatedAt: new Date(),
            },
        });
        // Log the cancellation
        await prisma.subscriptionLog.create({
            data: {
                tenantId: tenant.id,
                action: 'canceled',
                oldPlanId: tenant.planId,
                newPlanId: tenant.planId,
                stripeEventId: tenant.subscriptionId,
                metadata: { cancelledAt: new Date().toISOString() },
            },
        });
        logger_1.logger.info('Subscription cancelled', {
            tenantId: tenant.id,
            stripeSubscriptionId: tenant.subscriptionId
        });
        res.json({
            message: 'Subscription will be cancelled at the end of the billing period',
            cancelAt: cancelledSubscription.cancel_at,
        });
    }
    catch (error) {
        logger_1.logger.error('Error cancelling subscription', { error });
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});
exports.default = router;
//# sourceMappingURL=billing.js.map