// API response types for Sentinel Dashboard

import { User, LoginCredentials, MFACredentials, AuthTokens } from './user';
import { Alert, DefconStatus, APIMetrics, IVRBiometrics, RiskAssessment, Playbook, ResponseAction } from './security';

// Authentication API
export interface LoginRequest extends LoginCredentials { }

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    mfaRequired: boolean;
}

export interface MFAVerifyRequest extends MFACredentials { }

export interface MFAVerifyResponse extends AuthTokens {
    user: User;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse extends AuthTokens { }

// Dashboard API
export interface DashboardOverviewResponse {
    defconLevel: number;
    activeAlerts: number;
    systemHealth: {
        overall: 'healthy' | 'degraded' | 'critical';
        services: number;
        healthyServices: number;
    };
    recentActivity: {
        alertsLastHour: number;
        threatsBlocked: number;
        apiRequests: number;
    };
}

// Alerts API
export interface AlertsListRequest {
    status?: string;
    severity?: string;
    sourceService?: string;
    limit?: number;
    offset?: number;
}

export interface AlertsListResponse {
    alerts: Alert[];
    total: number;
    hasMore: boolean;
}

export interface AcknowledgeAlertRequest {
    comment?: string;
}

export interface AcknowledgeAlertResponse {
    success: boolean;
    acknowledgedBy: string;
    acknowledgedAt: string;
}

// Metrics API
export interface APIMetricsRequest {
    timeframe: '1h' | '24h' | '7d';
    endpoint?: string;
}

export interface APIMetricsResponse {
    endpoints: APIMetrics[];
    summary: {
        totalRequests: number;
        successRate: number;
        averageResponseTime: number;
    };
}

export interface IVRBiometricsRequest {
    timeframe: '1h' | '24h' | '7d';
}

export interface IVRBiometricsResponse extends IVRBiometrics { }

// Risk Center API
export interface RiskFeedResponse {
    risks: RiskAssessment[];
    total: number;
}

export interface PlaybookDetailsRequest {
    alertId: string;
}

export interface PlaybookDetailsResponse {
    playbook: Playbook;
    requiresApproval: boolean;
}

export interface ExecuteResponseRequest {
    action: 'ISOLATE_SERVICE' | 'THROTTLE_TRAFFIC' | 'BLOCK_IP' | 'RESET_PASSWORD' | 'ALERT_ONLY';
    target: string;
    justification: string;
}

export interface ExecuteResponseResponse {
    executionId: string;
    status: 'pending' | 'approved' | 'executed' | 'failed';
    requiresApproval: boolean;
    estimatedCompletion: string;
}

// Error responses
export interface APIError {
    error: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
}

// Generic API response wrapper
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: APIError;
    timestamp: string;
}

// Pagination metadata
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Paginated response
export interface PaginatedResponse<T> extends APIResponse<T[]> {
    meta: PaginationMeta;
}