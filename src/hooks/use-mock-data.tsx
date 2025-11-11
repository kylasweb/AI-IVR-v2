'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DataMode = 'realtime' | 'demo';

interface MockDataContextType {
    mode: DataMode;
    setMode: (mode: DataMode) => void;
    isDemoMode: boolean;
    isRealtimeMode: boolean;
    toggleMode: () => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

interface MockDataProviderProps {
    children: ReactNode;
}

export function MockDataProvider({ children }: MockDataProviderProps) {
    const [mode, setMode] = useState<DataMode>('realtime');

    // Load mode from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('mock-data-mode') as DataMode;
        if (savedMode && (savedMode === 'realtime' || savedMode === 'demo')) {
            setMode(savedMode);
        }
    }, []);

    // Save mode to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('mock-data-mode', mode);
    }, [mode]);

    const isDemoMode = mode === 'demo';
    const isRealtimeMode = mode === 'realtime';

    const toggleMode = () => {
        setMode(prevMode => prevMode === 'realtime' ? 'demo' : 'realtime');
    };

    const value: MockDataContextType = {
        mode,
        setMode,
        isDemoMode,
        isRealtimeMode,
        toggleMode,
    };

    return (
        <MockDataContext.Provider value={value}>
            {children}
        </MockDataContext.Provider>
    );
}

export function useMockData() {
    const context = useContext(MockDataContext);
    if (context === undefined) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
}

// Mock data generators
export const mockDataGenerators = {
    // Dashboard stats generator
    generateDashboardStats: () => ({
        totalCalls: Math.floor(Math.random() * 5000) + 1000,
        activeCalls: Math.floor(Math.random() * 50) + 10,
        totalAgents: Math.floor(Math.random() * 20) + 10,
        activeAgents: Math.floor(Math.random() * 15) + 5,
        workflows: Math.floor(Math.random() * 15) + 5,
        uptime: 99.5 + Math.random() * 0.4, // 99.5-99.9%
        satisfaction: 4.2 + Math.random() * 0.7, // 4.2-4.9
        revenue: Math.floor(Math.random() * 50000) + 10000,
    }),

    // System health generator
    generateSystemHealth: () => {
        const services = [
            'Voice Processing',
            'AI Engine',
            'Malayalam TTS',
            'Manglish STT',
            'Analytics',
            'Database',
            'API Gateway',
            'Load Balancer'
        ];

        const statuses: ('online' | 'offline' | 'degraded')[] = ['online', 'online', 'online', 'degraded', 'online'];

        return {
            overall: Math.random() > 0.8 ? 'warning' : 'healthy' as 'healthy' | 'warning' | 'critical',
            services: services.map(service => ({
                name: service,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                uptime: 95 + Math.random() * 4.9, // 95-99.9%
            }))
        };
    },

    // Call analytics generator
    generateCallAnalytics: () => ({
        totalCalls: Math.floor(Math.random() * 10000) + 5000,
        answeredCalls: Math.floor(Math.random() * 8000) + 4000,
        avgCallDuration: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
        callSuccessRate: 85 + Math.random() * 10, // 85-95%
        peakHours: ['9:00-10:00', '14:00-15:00', '18:00-19:00'][Math.floor(Math.random() * 3)],
    }),

    // Agent performance generator
    generateAgentPerformance: () => ({
        totalAgents: Math.floor(Math.random() * 25) + 10,
        activeAgents: Math.floor(Math.random() * 20) + 8,
        avgResponseTime: Math.floor(Math.random() * 30) + 15, // 15-45 seconds
        customerSatisfaction: 4.0 + Math.random() * 0.8, // 4.0-4.8
        resolutionRate: 75 + Math.random() * 20, // 75-95%
    }),

    // Revenue metrics generator
    generateRevenueMetrics: () => ({
        totalRevenue: Math.floor(Math.random() * 100000) + 50000,
        monthlyGrowth: -5 + Math.random() * 15, // -5% to +10%
        avgRevenuePerCall: 15 + Math.random() * 15, // $15-30
        topRevenueSource: ['Voice Calls', 'Video Calls', 'Chat Support', 'Premium Services'][Math.floor(Math.random() * 4)],
    })
};