// Security domain types for Sentinel Dashboard

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
export type DefconLevel = 1 | 2 | 3 | 4 | 5;

export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: AlertSeverity;
    status: AlertStatus;
    sourceService: string;
    sourceIp?: string;
    userId?: string; // anonymized
    rawEvent?: any;
    aiRiskScore?: number; // 0.00 to 1.00
    aiConfidence?: string; // 'high', 'medium', 'low'
    assignedTo?: string;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
    resolutionNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    location?: {
        lat: number;
        lon: number;
    };
}

export interface DefconStatus {
    level: DefconLevel;
    reason: string;
    triggeredBy: string;
    triggeredAt: Date;
    activeThreats: number;
    acknowledgedThreats: number;
    resolvedThreats: number;
}

export interface ThreatLocation {
    id: string;
    lat: number;
    lon: number;
    country: string;
    city?: string;
    threatType: 'malicious' | 'suspicious' | 'normal';
    severity: AlertSeverity;
    description: string;
    sourceIp: string;
    timestamp: Date;
}

export interface ServiceHealth {
    serviceName: string;
    status: 'healthy' | 'degraded' | 'critical' | 'down';
    uptime: number; // percentage
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    activeConnections: number;
    lastChecked: Date;
    metrics: {
        cpu: number;
        memory: number;
        disk: number;
    };
}

export interface APIMetrics {
    endpoint: string;
    method: string;
    totalRequests: number;
    successRequests: number;
    errorRequests: number;
    averageResponseTime: number;
    rateLimitHits: number;
    lastUpdated: Date;
}

export interface IVRBiometrics {
    verificationSuccessRate: number;
    livenessDetectionFailures: number;
    bruteForceAttempts: number;
    totalVerifications: number;
    averageConfidence: number;
    lastUpdated: Date;
}

export interface RiskAssessment {
    id: string;
    title: string;
    riskScore: number; // 0-100
    aiConfidence: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    recommendedActions: string[];
    requiresApproval: boolean;
    createdAt: Date;
}

export interface Playbook {
    id: string;
    name: string;
    description: string;
    category: string;
    steps: PlaybookStep[];
    requiresApproval: boolean;
    approvalRole: 'SOC_Analyst' | 'SOC_Lead';
    estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
    rollbackAvailable: boolean;
    rollbackTimeMinutes: number;
}

export interface PlaybookStep {
    id: string;
    order: number;
    action: string;
    description: string;
    automated: boolean;
    requiresConfirmation: boolean;
    parameters?: Record<string, any>;
}

export interface ResponseAction {
    id: string;
    alertId: string;
    playbookId: string;
    actionType: 'isolate_service' | 'throttle_traffic' | 'block_ip' | 'reset_password' | 'alert_only';
    targetResource: string;
    status: 'pending' | 'approved' | 'executed' | 'failed' | 'cancelled';
    requestedBy: string;
    approvedBy?: string;
    approvedAt?: Date;
    executedBy?: string;
    executedAt?: Date;
    executionResult?: any;
    rollbackAvailable: boolean;
    rollbackExecutedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// WebSocket event types
export interface WebSocketEvent {
    event: string;
    data: any;
    timestamp: Date;
}

export interface DefconUpdateEvent extends WebSocketEvent {
    event: 'defcon_update';
    data: {
        level: DefconLevel;
        reason: string;
        timestamp: string;
    };
}

export interface NewAlertEvent extends WebSocketEvent {
    event: 'new_alert';
    data: Alert;
}

export interface AlertUpdateEvent extends WebSocketEvent {
    event: 'alert_update';
    data: {
        id: string;
        status: AlertStatus;
        updatedBy: string;
        timestamp: string;
    };
}

export interface MapDataEvent extends WebSocketEvent {
    event: 'map_data';
    data: ThreatLocation[];
}

export interface ServiceHealthEvent extends WebSocketEvent {
    event: 'service_health_update';
    data: ServiceHealth;
}

export interface APIMetricsEvent extends WebSocketEvent {
    event: 'api_metrics_update';
    data: APIMetrics;
}

export interface IVRBiometricsEvent extends WebSocketEvent {
    event: 'ivr_biometric_update';
    data: IVRBiometrics;
}