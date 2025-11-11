-- FairGo Billing Database Initialization
-- This script sets up the initial database structure for the billing service

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default plans
INSERT INTO plans (id, name, description, price_id, amount, currency, interval, is_active) VALUES
('plan_pilot', 'Pilot', 'Perfect for small operations and testing', 'price_pilot', 299900, 'INR', 'month', true),
('plan_professional', 'Professional', 'Ideal for growing dispatch operations', 'price_professional', 999900, 'INR', 'month', true),
('plan_enterprise', 'Enterprise', 'Full-featured solution for large-scale operations', 'price_enterprise', 0, 'INR', 'month', false)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_fairgo_tenant_id ON tenants(fairgo_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_tenant_id ON webhook_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_tenant_id ON subscription_logs(tenant_id);