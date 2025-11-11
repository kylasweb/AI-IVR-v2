// Alert store for real-time alert management

import { create } from 'zustand';
import { Alert, AlertStatus, AlertSeverity } from '../types/security';

interface AlertStore {
    alerts: Alert[];
    filteredAlerts: Alert[];
    selectedAlert: Alert | null;
    isLoading: boolean;
    error: string | null;

    // Filters
    statusFilter: AlertStatus | 'all';
    severityFilter: AlertSeverity | 'all';
    sourceFilter: string | 'all';

    // Actions
    setAlerts: (alerts: Alert[]) => void;
    addAlert: (alert: Alert) => void;
    updateAlert: (id: string, updates: Partial<Alert>) => void;
    acknowledgeAlert: (id: string, userId: string, comment?: string) => void;
    selectAlert: (alert: Alert | null) => void;
    setFilters: (filters: {
        status?: AlertStatus | 'all';
        severity?: AlertSeverity | 'all';
        source?: string | 'all';
    }) => void;
    clearFilters: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const initialState = {
    alerts: [],
    filteredAlerts: [],
    selectedAlert: null,
    isLoading: false,
    error: null,
    statusFilter: 'all' as const,
    severityFilter: 'all' as const,
    sourceFilter: 'all' as const,
};

export const useAlertStore = create<AlertStore>((set, get) => ({
    ...initialState,

    setAlerts: (alerts: Alert[]) => {
        set({ alerts });
        applyFilters();
    },

    addAlert: (alert: Alert) => {
        set((state) => ({
            alerts: [alert, ...state.alerts],
        }));
        applyFilters();
    },

    updateAlert: (id: string, updates: Partial<Alert>) => {
        set((state) => ({
            alerts: state.alerts.map((alert) =>
                alert.id === id ? { ...alert, ...updates, updatedAt: new Date() } : alert
            ),
        }));
        applyFilters();

        // Update selected alert if it's the one being updated
        const { selectedAlert } = get();
        if (selectedAlert?.id === id) {
            set({ selectedAlert: { ...selectedAlert, ...updates, updatedAt: new Date() } });
        }
    },

    acknowledgeAlert: (id: string, userId: string, comment?: string) => {
        const now = new Date();
        get().updateAlert(id, {
            status: 'acknowledged',
            acknowledgedBy: userId,
            acknowledgedAt: now,
            resolutionNotes: comment,
        });
    },

    selectAlert: (alert: Alert | null) => {
        set({ selectedAlert: alert });
    },

    setFilters: (filters) => {
        set({
            statusFilter: filters.status ?? get().statusFilter,
            severityFilter: filters.severity ?? get().severityFilter,
            sourceFilter: filters.source ?? get().sourceFilter,
        });
        applyFilters();
    },

    clearFilters: () => {
        set({
            statusFilter: 'all',
            severityFilter: 'all',
            sourceFilter: 'all',
        });
        applyFilters();
    },

    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },

    setError: (error: string | null) => {
        set({ error });
    },
}));

// Helper function to apply filters (defined outside the store)
function applyFilters() {
    const state = useAlertStore.getState();
    const { alerts, statusFilter, severityFilter, sourceFilter } = state;

    let filtered = alerts;

    if (statusFilter !== 'all') {
        filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    if (severityFilter !== 'all') {
        filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    if (sourceFilter !== 'all') {
        filtered = filtered.filter((alert) => alert.sourceService === sourceFilter);
    }

    // Sort by creation date (newest first)
    filtered = filtered.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    useAlertStore.setState({ filteredAlerts: filtered });
}