// DEFCON status management hook

import { useCallback } from 'react';
import { useDefconStore } from '../../stores/defcon.store';
import { usePermissions } from './use-auth';
import { DefconLevel } from '../../types/security';

export function useDefcon() {
    const {
        currentLevel,
        status: currentStatus,
        isLoading,
        setDefconLevel,
        setStatus,
        setLoading,
        setError,
        resetToNormal,
    } = useDefconStore();

    const { hasPermission } = usePermissions();

    // Check if user can escalate DEFCON
    const canEscalate = useCallback((targetLevel: DefconLevel): boolean => {
        if (!hasPermission('canOverrideAI')) return false;
        return targetLevel < currentLevel; // Lower number = higher alert level
    }, [hasPermission, currentLevel]);

    // Check if user can de-escalate DEFCON
    const canDeescalate = useCallback((targetLevel: DefconLevel): boolean => {
        if (!hasPermission('canOverrideAI')) return false;
        return targetLevel > currentLevel; // Higher number = lower alert level
    }, [hasPermission, currentLevel]);

    // Escalate with permission check
    const requestEscalation = useCallback(async (
        targetLevel: DefconLevel,
        reason: string,
        automated: boolean = false
    ) => {
        if (!canEscalate(targetLevel) && !automated) {
            throw new Error('Insufficient permissions to escalate DEFCON level');
        }

        setDefconLevel(targetLevel, reason);
    }, [canEscalate, setDefconLevel]);

    // De-escalate with permission check
    const requestDeescalation = useCallback(async (
        targetLevel: DefconLevel,
        reason: string
    ) => {
        if (!canDeescalate(targetLevel)) {
            throw new Error('Insufficient permissions to de-escalate DEFCON level');
        }

        setDefconLevel(targetLevel, reason);
    }, [canDeescalate, setDefconLevel]);

    // Get escalation recommendations based on current alerts
    const getEscalationRecommendations = useCallback(() => {
        const recommendations: Array<{ level: DefconLevel; condition: string; automated: boolean }> = [];

        // DEFCON 1: Maximum readiness - only for critical national security threats
        if (currentLevel > 1) {
            recommendations.push({
                level: 1 as DefconLevel,
                condition: 'Critical national security threat detected',
                automated: false,
            });
        }

        // DEFCON 2: Next step to nuclear war - for imminent threats
        if (currentLevel > 2) {
            recommendations.push({
                level: 2 as DefconLevel,
                condition: 'Imminent threat to critical infrastructure',
                automated: true,
            });
        }

        // DEFCON 3: Increase in force readiness - for elevated threats
        if (currentLevel > 3) {
            recommendations.push({
                level: 3 as DefconLevel,
                condition: 'Multiple high-severity alerts across systems',
                automated: true,
            });
        }

        // DEFCON 4: Increased intelligence watch - for moderate threats
        if (currentLevel > 4) {
            recommendations.push({
                level: 4 as DefconLevel,
                condition: 'Elevated alert volume with potential threats',
                automated: true,
            });
        }

        return recommendations;
    }, [currentLevel]);

    // Get current DEFCON status description
    const getStatusDescription = useCallback(() => {
        switch (currentLevel) {
            case 1:
                return 'Maximum readiness - Critical national security threat';
            case 2:
                return 'Next step to nuclear war - Imminent critical threat';
            case 3:
                return 'Increase in force readiness - Elevated threat level';
            case 4:
                return 'Increased intelligence watch - Moderate threat level';
            case 5:
                return 'Normal peacetime readiness - Standard operations';
            default:
                return 'Unknown DEFCON status';
        }
    }, [currentLevel]);

    // Get color coding for DEFCON levels
    const getStatusColor = useCallback(() => {
        switch (currentLevel) {
            case 1:
                return 'bg-red-600 text-white';
            case 2:
                return 'bg-red-500 text-white';
            case 3:
                return 'bg-orange-500 text-white';
            case 4:
                return 'bg-yellow-500 text-black';
            case 5:
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    }, [currentLevel]);

    return {
        currentLevel,
        currentStatus,
        isLoading,
        canEscalate,
        canDeescalate,
        requestEscalation,
        requestDeescalation,
        getEscalationRecommendations,
        getStatusDescription,
        getStatusColor,
        resetToNormal,
    };
}