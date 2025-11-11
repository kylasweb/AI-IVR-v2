import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3002', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],

    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://telephony_user:telephony_pass@localhost:5434/telephony_dev',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6380',

    // FreeSWITCH ESL
    freeswitchEslHost: process.env.FREESWITCH_ESL_HOST || 'freeswitch',
    freeswitchEslPort: parseInt(process.env.FREESWITCH_ESL_PORT || '8021', 10),
    freeswitchEslPassword: process.env.FREESWITCH_ESL_PASSWORD || 'ClueCon',

    // FairGo Integration
    fairgoApiUrl: process.env.FAIRGO_API_URL || 'http://localhost:10000',
    fairgoApiKey: process.env.FAIRGO_API_KEY,

    // Jio SIP Trunk (Production)
    jioSipHost: process.env.JIO_SIP_HOST,
    jioSipUsername: process.env.JIO_SIP_USERNAME,
    jioSipPassword: process.env.JIO_SIP_PASSWORD,

    // Security
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',

    // Monitoring
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '30000', 10), // 30 seconds

    // Health Checks
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000', 10), // 1 minute
    trunkTimeout: parseInt(process.env.TRUNK_TIMEOUT || '5000', 10), // 5 seconds

    // Feature flags
    enableEsl: process.env.ENABLE_ESL !== 'false',
    enableRouting: process.env.ENABLE_ROUTING !== 'false',
};

// Validation
if (config.enableEsl && !config.freeswitchEslPassword) {
    throw new Error('FREESWITCH_ESL_PASSWORD environment variable is required when ESL is enabled');
}

export default config;