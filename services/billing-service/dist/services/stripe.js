"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = exports.StripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const logger_1 = require("../utils/logger");
class StripeService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    } /**
     * Create or retrieve a Stripe customer
     */
    async createOrRetrieveCustomer(email, name, metadata) {
        try {
            // Check if customer already exists
            const existingCustomers = await this.stripe.customers.list({
                email,
                limit: 1,
            });
            if (existingCustomers.data.length > 0) {
                return existingCustomers.data[0];
            }
            // Create new customer
            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata: metadata || {},
            });
            logger_1.logger.info('Created new Stripe customer', { customerId: customer.id, email });
            return customer;
        }
        catch (error) {
            logger_1.logger.error('Error creating/retrieving Stripe customer', { error, email });
            throw error;
        }
    }
    /**
     * Create a subscription for a customer
     */
    async createSubscription(customerId, priceId, metadata) {
        try {
            const subscription = await this.stripe.subscriptions.create({
                customer: customerId,
                items: [{
                        price: priceId,
                    }],
                metadata: metadata || {},
                payment_behavior: 'default_incomplete',
                expand: ['latest_invoice.payment_intent'],
            });
            logger_1.logger.info('Created Stripe subscription', {
                subscriptionId: subscription.id,
                customerId,
                priceId
            });
            return subscription;
        }
        catch (error) {
            logger_1.logger.error('Error creating Stripe subscription', { error, customerId, priceId });
            throw error;
        }
    }
    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: cancelAtPeriodEnd,
            });
            logger_1.logger.info('Cancelled Stripe subscription', {
                subscriptionId,
                cancelAtPeriodEnd
            });
            return subscription;
        }
        catch (error) {
            logger_1.logger.error('Error cancelling Stripe subscription', { error, subscriptionId });
            throw error;
        }
    }
    /**
     * Create a customer portal session
     */
    async createPortalSession(customerId, returnUrl) {
        try {
            const session = await this.stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl,
            });
            logger_1.logger.info('Created customer portal session', { customerId, sessionId: session.id });
            return session;
        }
        catch (error) {
            logger_1.logger.error('Error creating customer portal session', { error, customerId });
            throw error;
        }
    }
    /**
     * Retrieve subscription details
     */
    async getSubscription(subscriptionId) {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        }
        catch (error) {
            logger_1.logger.error('Error retrieving subscription', { error, subscriptionId });
            throw error;
        }
    }
    /**
     * List customer's subscriptions
     */
    async listCustomerSubscriptions(customerId) {
        try {
            const subscriptions = await this.stripe.subscriptions.list({
                customer: customerId,
                status: 'active',
            });
            return subscriptions;
        }
        catch (error) {
            logger_1.logger.error('Error listing customer subscriptions', { error, customerId });
            throw error;
        }
    }
    /**
     * Handle webhook events
     */
    async constructEvent(payload, signature, webhookSecret) {
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            return event;
        }
        catch (error) {
            logger_1.logger.error('Error constructing webhook event', { error });
            throw error;
        }
    }
}
exports.StripeService = StripeService;
// Export singleton instance
exports.stripeService = new StripeService();
//# sourceMappingURL=stripe.js.map