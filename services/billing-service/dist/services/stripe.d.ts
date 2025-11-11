import Stripe from 'stripe';
export declare class StripeService {
    private stripe;
    constructor(); /**
     * Create or retrieve a Stripe customer
     */
    createOrRetrieveCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer>;
    /**
     * Create a subscription for a customer
     */
    createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<Stripe.Response<Stripe.Subscription>>;
    /**
     * Cancel a subscription
     */
    cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<Stripe.Response<Stripe.Subscription>>;
    /**
     * Create a customer portal session
     */
    createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.Response<Stripe.BillingPortal.Session>>;
    /**
     * Retrieve subscription details
     */
    getSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>>;
    /**
     * List customer's subscriptions
     */
    listCustomerSubscriptions(customerId: string): Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>>>;
    /**
     * Handle webhook events
     */
    constructEvent(payload: string | Buffer, signature: string, webhookSecret: string): Promise<Stripe.Event>;
}
export declare const stripeService: StripeService;
//# sourceMappingURL=stripe.d.ts.map