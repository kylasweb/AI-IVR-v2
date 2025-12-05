'use client';

import { useState } from 'react';

export interface VoiceSystemStatus {
    speechSynthesis: {
        status: 'operational' | 'degraded' | 'down';
        activeModels: number;
        totalRequests: number;
        avgResponseTime: number;
    };
    voiceCloning: {
        status: 'operational' | 'degraded' | 'down';
        trainingJobs: number;
        completedModels: number;
        avgTrainingTime: number;
    };
    speechRecognition: {
        status: 'operational' | 'degraded' | 'down';
        activeSessions: number;
        accuracy: number;
        languages: string[];
    };
    voiceData: {
        totalSamples: number;
        processedSamples: number;
        storageUsed: number;
        storageLimit: number;
    };
}

export interface VoiceCommand {
    id: string;
    command: string;
    description: string;
    category: 'synthesis' | 'recognition' | 'cloning' | 'analysis' | 'management';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: string;
    estimatedCompletion?: string;
}

export function useCommandCenter() {
    const [systemStatus, setSystemStatus] = useState<VoiceSystemStatus>({
        speechSynthesis: {
            status: 'operational',
            activeModels: 12,
            totalRequests: 15420,
            avgResponseTime: 0.8
        },
        voiceCloning: {
            status: 'operational',
            trainingJobs: 3,
            completedModels: 45,
            avgTrainingTime: 240
        },
        speechRecognition: {
            status: 'operational',
            activeSessions: 28,
            accuracy: 94.7,
            languages: ['en', 'ml', 'hi', 'ta', 'te']
        },
        voiceData: {
            totalSamples: 125000,
            processedSamples: 118500,
            storageUsed: 2.4,
            storageLimit: 10.0
        }
    });

    const [commands, setCommands] = useState<VoiceCommand[]>([
        {
            id: '1',
            command: 'Train Malayalam Voice Model',
            description: 'Training custom voice model for Malayalam with 5000 samples',
            category: 'cloning',
            status: 'processing',
            priority: 'high',
            createdAt: '2025-11-11T10:30:00Z',
            estimatedCompletion: '2025-11-11T14:30:00Z'
        },
        {
            id: '2',
            command: 'Generate Hindi TTS Dataset',
            description: 'Creating synthetic Hindi speech dataset for model training',
            category: 'synthesis',
            status: 'processing',
            priority: 'medium',
            createdAt: '2025-11-11T09:15:00Z',
            estimatedCompletion: '2025-11-11T16:00:00Z'
        },
        {
            id: '3',
            command: 'Voice Quality Analysis',
            description: 'Analyzing voice quality metrics across all active models',
            category: 'analysis',
            status: 'pending',
            priority: 'low',
            createdAt: '2025-11-11T11:00:00Z'
        }
    ]);

    const addCommand = (command: Omit<VoiceCommand, 'id' | 'createdAt'>) => {
        const newCommand: VoiceCommand = {
            ...command,
            id: `cmd-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        setCommands(prev => [...prev, newCommand]);
    };

    const updateCommandStatus = (id: string, status: VoiceCommand['status']) => {
        setCommands(prev => prev.map(cmd =>
            cmd.id === id ? { ...cmd, status } : cmd
        ));
    };

    return {
        systemStatus,
        commands,
        addCommand,
        updateCommandStatus
    };
}

export default useCommandCenter;
