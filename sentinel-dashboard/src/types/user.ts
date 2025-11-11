// User and role types for Sentinel Dashboard

export type UserRole = 'Executive' | 'SOC_Analyst' | 'SOC_Lead' | 'Admin';

export type MFAType = 'disabled' | 'enabled' | 'required';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    mfaStatus: MFAType;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    mfaRequired: boolean;
    mfaToken?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface MFACredentials {
    mfaToken: string;
    code: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Role-based permissions
export interface RolePermissions {
    canViewExecutiveDashboard: boolean;
    canViewRealTimeAlerts: boolean;
    canAcknowledgeAlerts: boolean;
    canExecutePlaybooks: boolean;
    canViewPrivilegedLogs: boolean;
    canIsolateServices: boolean;
    canOverrideAI: boolean;
    canManageUsers: boolean;
}

export const getRolePermissions = (role: UserRole): RolePermissions => {
    switch (role) {
        case 'Executive':
            return {
                canViewExecutiveDashboard: true,
                canViewRealTimeAlerts: false,
                canAcknowledgeAlerts: false,
                canExecutePlaybooks: false,
                canViewPrivilegedLogs: false,
                canIsolateServices: false,
                canOverrideAI: false,
                canManageUsers: false,
            };
        case 'SOC_Analyst':
            return {
                canViewExecutiveDashboard: false,
                canViewRealTimeAlerts: true,
                canAcknowledgeAlerts: true,
                canExecutePlaybooks: false,
                canViewPrivilegedLogs: false,
                canIsolateServices: false,
                canOverrideAI: false,
                canManageUsers: false,
            };
        case 'SOC_Lead':
            return {
                canViewExecutiveDashboard: false,
                canViewRealTimeAlerts: true,
                canAcknowledgeAlerts: true,
                canExecutePlaybooks: true,
                canViewPrivilegedLogs: true,
                canIsolateServices: true,
                canOverrideAI: true,
                canManageUsers: false,
            };
        case 'Admin':
            return {
                canViewExecutiveDashboard: true,
                canViewRealTimeAlerts: true,
                canAcknowledgeAlerts: true,
                canExecutePlaybooks: true,
                canViewPrivilegedLogs: true,
                canIsolateServices: true,
                canOverrideAI: true,
                canManageUsers: true,
            };
        default:
            return {
                canViewExecutiveDashboard: false,
                canViewRealTimeAlerts: false,
                canAcknowledgeAlerts: false,
                canExecutePlaybooks: false,
                canViewPrivilegedLogs: false,
                canIsolateServices: false,
                canOverrideAI: false,
                canManageUsers: false,
            };
    }
};