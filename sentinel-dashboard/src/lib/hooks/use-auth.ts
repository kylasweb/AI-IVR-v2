// Authentication hook

import { useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { User } from '../../types/user';

export function useAuth() {
    const {
        user,
        isAuthenticated,
        isLoading,
        mfaRequired,
        login,
        verifyMFA,
        logout,
        refreshToken,
    } = useAuthStore();

    // Auto-refresh token on mount if we have a stored token
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshTokenValue = localStorage.getItem('refreshToken');

        if (accessToken && refreshTokenValue && !isAuthenticated && !isLoading) {
            // Try to refresh token on app start
            refreshToken().catch(() => {
                // If refresh fails, user needs to login again
                logout();
            });
        }
    }, [isAuthenticated, isLoading, refreshToken, logout]);

    return {
        user,
        isAuthenticated,
        isLoading,
        mfaRequired,
        login,
        verifyMFA,
        logout,
        refreshToken,
    };
}

// Hook to check if user has specific permissions
export function usePermissions() {
    const { user } = useAuthStore();

    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        return userPermissions[user.role]?.[permission as keyof typeof userPermissions[typeof user.role]] ?? false;
    };

    const canViewModule = (module: string): boolean => {
        switch (module) {
            case 'war-room':
                return hasPermission('canViewRealTimeAlerts');
            case 'api-gateway':
                return hasPermission('canViewRealTimeAlerts');
            case 'internal-monitor':
                return hasPermission('canViewRealTimeAlerts');
            case 'iam-command':
                return hasPermission('canViewPrivilegedLogs') || hasPermission('canViewRealTimeAlerts');
            case 'risk-center':
                return hasPermission('canViewRealTimeAlerts');
            default:
                return false;
        }
    };

    return {
        hasPermission,
        canViewModule,
        user,
    };
}

// Permission matrix based on user roles
const userPermissions = {
    Executive: {
        canViewExecutiveDashboard: true,
        canViewRealTimeAlerts: false,
        canAcknowledgeAlerts: false,
        canExecutePlaybooks: false,
        canViewPrivilegedLogs: false,
        canIsolateServices: false,
        canOverrideAI: false,
        canManageUsers: false,
    },
    SOC_Analyst: {
        canViewExecutiveDashboard: false,
        canViewRealTimeAlerts: true,
        canAcknowledgeAlerts: true,
        canExecutePlaybooks: false,
        canViewPrivilegedLogs: false,
        canIsolateServices: false,
        canOverrideAI: false,
        canManageUsers: false,
    },
    SOC_Lead: {
        canViewExecutiveDashboard: false,
        canViewRealTimeAlerts: true,
        canAcknowledgeAlerts: true,
        canExecutePlaybooks: true,
        canViewPrivilegedLogs: true,
        canIsolateServices: true,
        canOverrideAI: true,
        canManageUsers: false,
    },
    Admin: {
        canViewExecutiveDashboard: true,
        canViewRealTimeAlerts: true,
        canAcknowledgeAlerts: true,
        canExecutePlaybooks: true,
        canViewPrivilegedLogs: true,
        canIsolateServices: true,
        canOverrideAI: true,
        canManageUsers: true,
    },
};