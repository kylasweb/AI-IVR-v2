import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],

    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://billing_user:billing_pass@localhost:5433/billing_dev',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6380',

    // Stripe
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,

    // Email (for invoices)
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'billing@fairgo.ai',

    // FairGo Integration
    fairgoApiUrl: process.env.FAIRGO_API_URL || 'http://localhost:10000',
    fairgoApiKey: process.env.FAIRGO_API_KEY,

    // Security
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

    // Feature flags
    enableWebhooks: process.env.ENABLE_WEBHOOKS !== 'false',
    enableEmails: process.env.ENABLE_EMAILS !== 'false',

    // External URLs
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    pricingUrl: process.env.PRICING_URL || 'http://localhost:3000/pricing',
};

// Validation
if (!config.stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

if (!config.stripeWebhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
}

export default config;