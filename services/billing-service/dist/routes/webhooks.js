"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_1 = require("../services/stripe");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * Stripe webhook endpoint
 * POST /api/webhooks/stripe
 */
router.post('/', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        logger_1.logger.error('Stripe webhook secret not configured');
        return res.status(500).send('Webhook secret not configured');
    }
    let event;
    try {
        event = await stripe_1.stripeService.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        logger_1.logger.error('Webhook signature verification failed', { error: err.message });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        // Handle the event
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionChange(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            default:
                logger_1.logger.info('Unhandled event type', { eventType: event.type });
        }
        res.json({ received: true });
    }
    catch (error) {
        logger_1.logger.error('Error processing webhook', { error, eventType: event.type });
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});
async function handleSubscriptionChange(subscription) {
    const { id, customer, status, current_period_start, current_period_end, cancel_at_period_end, metadata } = subscription;
    try {
        // Find tenant by Stripe customer ID
        const tenant = await prisma.tenant.findFirst({
            where: { stripeCustomerId: customer },
        });
        if (!tenant) {
            logger_1.logger.warn('Tenant not found for subscription change', { customerId: customer, subscriptionId: id });
            return;
        }
        // Update tenant subscription status
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                subscriptionId: id,
                subscriptionStatus: status,
                updatedAt: new Date(),
            },
        });
        // Log the subscription change
        await prisma.subscriptionLog.create({
            data: {
                tenantId: tenant.id,
                action: 'updated',
                oldPlanId: tenant.planId,
                newPlanId: subscription.items.data[0]?.price?.id || tenant.planId,
                stripeEventId: id,
                metadata: {
                    status,
                    currentPeriodStart: current_period_start,
                    currentPeriodEnd: current_period_end,
                    cancelAtPeriodEnd: cancel_at_period_end,
                },
            },
        });
        logger_1.logger.info('Subscription updated', { subscriptionId: id, status, tenantId: tenant.id });
    }
    catch (error) {
        logger_1.logger.error('Error updating subscription', { error, subscriptionId: id });
        throw error;
    }
}
async function handleSubscriptionDeleted(subscription) {
    const { id, customer } = subscription;
    try {
        // Find tenant by Stripe customer ID
        const tenant = await prisma.tenant.findFirst({
            where: { stripeCustomerId: customer },
        });
        if (!tenant) {
            logger_1.logger.warn('Tenant not found for subscription deletion', { customerId: customer, subscriptionId: id });
            return;
        }
        // Update tenant subscription status
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                subscriptionStatus: 'canceled',
                updatedAt: new Date(),
            },
        });
        // Log the cancellation
        await prisma.subscriptionLog.create({
            data: {
                tenantId: tenant.id,
                action: 'canceled',
                oldPlanId: tenant.planId,
                newPlanId: tenant.planId, // Plan stays the same
                stripeEventId: id,
                metadata: { cancelledAt: new Date().toISOString() },
            },
        });
        logger_1.logger.info('Subscription cancelled', { subscriptionId: id, tenantId: tenant.id });
    }
    catch (error) {
        logger_1.logger.error('Error cancelling subscription', { error, subscriptionId: id });
        throw error;
    }
}
async function handlePaymentSucceeded(invoice) {
    const { customer, amount_paid, currency, subscription } = invoice;
    try {
        // Find tenant by Stripe customer ID
        const tenant = await prisma.tenant.findFirst({
            where: { stripeCustomerId: customer },
        });
        if (!tenant) {
            logger_1.logger.warn('Tenant not found for payment success', { customerId: customer, invoiceId: invoice.id });
            return;
        }
        // Record payment in database
        await prisma.invoice.create({
            data: {
                tenantId: tenant.id,
                stripeInvoiceId: invoice.id,
                amount: amount_paid,
                currency,
                status: 'paid',
                paidAt: new Date(),
            },
        });
        logger_1.logger.info('Payment recorded', { invoiceId: invoice.id, amount: amount_paid, tenantId: tenant.id });
    }
    catch (error) {
        logger_1.logger.error('Error recording payment', { error, invoiceId: invoice.id });
        throw error;
    }
}
async function handlePaymentFailed(invoice) {
    const { customer } = invoice;
    try {
        // Find tenant by Stripe customer ID
        const tenant = await prisma.tenant.findFirst({
            where: { stripeCustomerId: customer },
        });
        if (!tenant) {
            logger_1.logger.warn('Tenant not found for payment failure', { customerId: customer, invoiceId: invoice.id });
            return;
        }
        // Update tenant subscription status to past_due
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                subscriptionStatus: 'past_due',
                updatedAt: new Date(),
            },
        });
        logger_1.logger.warn('Payment failed', { invoiceId: invoice.id, tenantId: tenant.id });
    }
    catch (error) {
        logger_1.logger.error('Error updating tenant for failed payment', { error, invoiceId: invoice.id });
        throw error;
    }
}
exports.default = router;
//# sourceMappingURL=webhooks.js.map