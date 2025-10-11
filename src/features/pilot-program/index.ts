// Pilot Program Feature Exports
export * from './types';
export { PilotProgramManager, pilotManager } from './manager';

// React Components
export { default as PilotProgramDashboard } from '../../components/pilot-program/pilot-program-dashboard';

// Utility functions for pilot program management
export const pilotUtils = {
    formatClientType: (type: string) => {
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    calculateProgressPercentage: (current: number, baseline: number, target: number) => {
        if (target === 0) return 0;
        return Math.min(((current - baseline) / target) * 100, 100);
    },

    getStatusColor: (status: string) => {
        switch (status.toLowerCase()) {
            case 'above_target': return 'success';
            case 'on_target': return 'info';
            case 'below_target': return 'warning';
            case 'active': case 'completed': return 'success';
            case 'onboarding': return 'info';
            case 'pending': return 'secondary';
            default: return 'default';
        }
    },

    formatMetricValue: (value: number, unit: string) => {
        switch (unit) {
            case 'percentage': return `${Math.round(value)}%`;
            case 'minutes': return `${value.toFixed(1)} min`;
            case 'seconds': return `${Math.round(value)}s`;
            case 'currency': return `₹${Math.round(value).toLocaleString()}`;
            default: return Math.round(value).toString();
        }
    }
};

// Constants for pilot program configuration
export const PILOT_CONSTANTS = {
    TARGET_CLIENTS: 3,
    DURATION_DAYS: 60,
    SUCCESS_THRESHOLDS: {
        SATISFACTION_INCREASE: 30, // 30% improvement
        WAIT_TIME_REDUCTION: 25,   // 25% reduction
        CULTURAL_ACCURACY: 95,     // 95% accuracy
        SYSTEM_UPTIME: 99.5        // 99.5% uptime
    },
    MONITORING_INTERVALS: {
        METRICS_COLLECTION: 5 * 60 * 1000,     // 5 minutes
        HEALTH_CHECK: 2 * 60 * 1000,           // 2 minutes
        ALERT_CHECK: 1 * 60 * 1000,            // 1 minute
        REPORT_GENERATION: 24 * 60 * 60 * 1000 // 24 hours
    },
    CLIENT_TYPES: {
        TAXI_OPERATOR: 'Kerala State Taxi Operators Union',
        RIDE_SHARING: 'Metro Rides Kerala',
        LOGISTICS_COMPANY: 'Spice Coast Logistics'
    }
};