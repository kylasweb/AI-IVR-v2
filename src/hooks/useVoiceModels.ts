'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface VoiceModel {
    id: string;
    name: string;
    type: 'synthesis' | 'recognition' | 'cloning';
    provider: string;
    language: string;
    status: 'active' | 'training' | 'inactive' | 'failed';
    version: string;
    accuracy?: number;
    latency?: number;
    trainingProgress?: number;
    lastTrained?: string;
    usageCount: number;
    size: number; // MB
    createdAt: string;
    description: string;
    parameters: Record<string, any>;
}

export interface TrainingJob {
    id: string;
    modelId: string;
    modelName: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    progress: number;
    startTime: string;
    estimatedCompletion?: string;
    currentEpoch?: number;
    totalEpochs?: number;
    loss?: number;
    accuracy?: number;
    error?: string;
}

export interface ModelMetrics {
    totalModels: number;
    activeModels: number;
    trainingModels: number;
    avgAccuracy: number;
    totalStorage: number;
    runningJobs: number;
}

export function useVoiceModels() {
    const [models, setModels] = useState<VoiceModel[]>([
        {
            id: 'tts-ml-001',
            name: 'Malayalam Professional Female',
            type: 'synthesis',
            provider: 'Azure Neural',
            language: 'ml',
            status: 'active',
            version: '2.1.0',
            accuracy: 97.2,
            latency: 0.8,
            usageCount: 15420,
            size: 245,
            createdAt: '2025-10-15T08:00:00Z',
            description: 'High-quality Malayalam TTS voice for professional applications',
            parameters: { pitch: 0, speed: 1.0, volume: 1.0, emotion: 'neutral' }
        },
        {
            id: 'stt-ml-002',
            name: 'Malayalam Speech Recognition',
            type: 'recognition',
            provider: 'Google Cloud',
            language: 'ml',
            status: 'active',
            version: '1.8.3',
            accuracy: 94.7,
            latency: 0.12,
            usageCount: 12500,
            size: 180,
            createdAt: '2025-09-20T10:30:00Z',
            description: 'Advanced Malayalam speech-to-text with noise cancellation',
            parameters: { noiseReduction: true, punctuation: true, speakerDiarization: false }
        },
        {
            id: 'clone-custom-003',
            name: 'Custom Malayalam Voice',
            type: 'cloning',
            provider: 'Custom',
            language: 'ml',
            status: 'training',
            version: '0.1.0',
            trainingProgress: 65,
            usageCount: 0,
            size: 320,
            createdAt: '2025-11-10T08:00:00Z',
            description: 'Custom voice model trained on 5000 Malayalam samples',
            parameters: { trainingSamples: 5000, epochs: 100, learningRate: 0.001 }
        }
    ]);

    const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([
        {
            id: 'train-001',
            modelId: 'clone-custom-003',
            modelName: 'Custom Malayalam Voice',
            status: 'running',
            progress: 65,
            startTime: '2025-11-10T08:00:00Z',
            estimatedCompletion: '2025-11-11T14:30:00Z',
            currentEpoch: 65,
            totalEpochs: 100,
            loss: 0.0234,
            accuracy: 87.3
        }
    ]);

    const createModel = (modelData: {
        name: string;
        type: VoiceModel['type'];
        provider: string;
        language: string;
        description: string;
        parameters?: Record<string, any>;
    }) => {
        const newModel: VoiceModel = {
            id: `model-${Date.now()}`,
            name: modelData.name,
            type: modelData.type,
            provider: modelData.provider,
            language: modelData.language,
            status: 'inactive',
            version: '0.1.0',
            usageCount: 0,
            size: 0,
            createdAt: new Date().toISOString(),
            description: modelData.description,
            parameters: modelData.parameters || {}
        };

        setModels(prev => [...prev, newModel]);

        toast({
            title: "Model Created",
            description: `Voice model "${modelData.name}" has been created successfully.`,
        });

        return newModel;
    };

    const startTraining = (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        if (!model) return;

        const trainingJob: TrainingJob = {
            id: `train-${Date.now()}`,
            modelId,
            modelName: model.name,
            status: 'queued',
            progress: 0,
            startTime: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        };

        setTrainingJobs(prev => [...prev, trainingJob]);
        setModels(prev => prev.map(m =>
            m.id === modelId ? { ...m, status: 'training' as const, trainingProgress: 0 } : m
        ));

        toast({
            title: "Training Started",
            description: `Training job for "${model.name}" has been queued.`,
        });
    };

    const deleteModel = (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        if (!model) return;

        setModels(prev => prev.filter(m => m.id !== modelId));

        toast({
            title: "Model Deleted",
            description: `Voice model "${model.name}" has been deleted.`,
        });
    };

    const calculateMetrics = (): ModelMetrics => {
        const modelsWithAccuracy = models.filter(m => m.accuracy);
        return {
            totalModels: models.length,
            activeModels: models.filter(m => m.status === 'active').length,
            trainingModels: models.filter(m => m.status === 'training').length,
            avgAccuracy: modelsWithAccuracy.length > 0
                ? Math.round(modelsWithAccuracy.reduce((sum, m) => sum + (m.accuracy || 0), 0) / modelsWithAccuracy.length)
                : 0,
            totalStorage: models.reduce((sum, m) => sum + m.size, 0),
            runningJobs: trainingJobs.filter(j => j.status === 'running').length
        };
    };

    return {
        models,
        trainingJobs,
        metrics: calculateMetrics(),
        createModel,
        startTraining,
        deleteModel
    };
}

export default useVoiceModels;
