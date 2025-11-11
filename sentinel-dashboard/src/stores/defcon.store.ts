// DEFCON status store

import { create } from 'zustand';
import { DefconStatus, DefconLevel } from '../types/security';

interface DefconStore {
    currentLevel: DefconLevel;
    status: DefconStatus | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setDefconLevel: (level: DefconLevel, reason?: string) => void;
    setStatus: (status: DefconStatus) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetToNormal: () => void;
}

const initialState = {
    currentLevel: 5 as DefconLevel, // Normal state
    status: null,
    isLoading: false,
    error: null,
};

export const useDefconStore = create<DefconStore>((set, get) => ({
    ...initialState,

    setDefconLevel: (level: DefconLevel, reason?: string) => {
        const now = new Date();
        const status: DefconStatus = {
            level,
            reason: reason || 'AI-detected anomaly',
            triggeredBy: 'sentinel-ai',
            triggeredAt: now,
            activeThreats: 0, // Will be updated by alert system
            acknowledgedThreats: 0,
            resolvedThreats: 0,
        };

        set({
            currentLevel: level,
            status,
        });
    },

    setStatus: (status: DefconStatus) => {
        set({
            currentLevel: status.level,
            status,
        });
    },

    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    resetToNormal: () => {
        set({
            currentLevel: 5,
            status: null,
        });
    },
}));