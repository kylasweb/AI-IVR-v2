'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ClonedVoice {
    id: string;
    name: string;
    language: string;
    sampleCount: number;
    quality: number;
    status: 'ready' | 'processing' | 'training' | 'failed';
    createdAt: string;
    duration: number; // seconds of training audio
}

export interface GenerationHistory {
    id: string;
    voiceId: string;
    voiceName: string;
    text: string;
    createdAt: string;
    duration: number;
    liked: boolean;
}

export interface RecordingState {
    isRecording: boolean;
    recordingProgress: number;
    recordedChunks: number;
    totalChunks: number;
}

export function useVoiceCloning() {
    const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([
        {
            id: 'voice-1',
            name: 'Malayalam Professional',
            language: 'ml',
            sampleCount: 50,
            quality: 94.5,
            status: 'ready',
            createdAt: '2025-10-15T10:00:00Z',
            duration: 1200
        },
        {
            id: 'voice-2',
            name: 'Hindi Corporate',
            language: 'hi',
            sampleCount: 45,
            quality: 91.2,
            status: 'ready',
            createdAt: '2025-10-20T14:30:00Z',
            duration: 900
        },
        {
            id: 'voice-3',
            name: 'Custom Training',
            language: 'ml',
            sampleCount: 25,
            quality: 0,
            status: 'training',
            createdAt: '2025-11-01T08:00:00Z',
            duration: 500
        }
    ]);

    const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([
        {
            id: 'gen-1',
            voiceId: 'voice-1',
            voiceName: 'Malayalam Professional',
            text: 'നമസ്കാരം! ഞങ്ങളുടെ സേവനത്തിലേക്ക് സ്വാഗതം.',
            createdAt: '2025-11-05T09:15:00Z',
            duration: 3.2,
            liked: true
        },
        {
            id: 'gen-2',
            voiceId: 'voice-2',
            voiceName: 'Hindi Corporate',
            text: 'आपका स्वागत है। कृपया अपना विवरण साझा करें।',
            createdAt: '2025-11-05T10:30:00Z',
            duration: 4.1,
            liked: false
        }
    ]);

    const [recordingState, setRecordingState] = useState<RecordingState>({
        isRecording: false,
        recordingProgress: 0,
        recordedChunks: 0,
        totalChunks: 10
    });

    const [selectedVoice, setSelectedVoice] = useState<ClonedVoice | null>(null);

    const startRecording = () => {
        setRecordingState(prev => ({ ...prev, isRecording: true, recordingProgress: 0 }));

        // Simulate recording progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                setRecordingState(prev => ({
                    ...prev,
                    isRecording: false,
                    recordingProgress: 100,
                    recordedChunks: prev.recordedChunks + 1
                }));
                toast({
                    title: "Recording Complete",
                    description: "Audio sample has been recorded successfully.",
                });
            } else {
                setRecordingState(prev => ({ ...prev, recordingProgress: progress }));
            }
        }, 500);
    };

    const stopRecording = () => {
        setRecordingState(prev => ({ ...prev, isRecording: false }));
    };

    const createVoice = (name: string, language: string) => {
        const newVoice: ClonedVoice = {
            id: `voice-${Date.now()}`,
            name,
            language,
            sampleCount: recordingState.recordedChunks,
            quality: 0,
            status: 'training',
            createdAt: new Date().toISOString(),
            duration: recordingState.recordedChunks * 60
        };

        setClonedVoices(prev => [...prev, newVoice]);

        toast({
            title: "Voice Training Started",
            description: `Training "${name}" voice model with ${recordingState.recordedChunks} samples.`,
        });

        // Reset recording state
        setRecordingState({
            isRecording: false,
            recordingProgress: 0,
            recordedChunks: 0,
            totalChunks: 10
        });

        return newVoice;
    };

    const addGeneration = (voiceId: string, text: string, duration: number) => {
        const voice = clonedVoices.find(v => v.id === voiceId);
        if (!voice) return;

        const newGeneration: GenerationHistory = {
            id: `gen-${Date.now()}`,
            voiceId,
            voiceName: voice.name,
            text,
            createdAt: new Date().toISOString(),
            duration,
            liked: false
        };

        setGenerationHistory(prev => [newGeneration, ...prev]);
    };

    const toggleLike = (generationId: string) => {
        setGenerationHistory(prev => prev.map(gen =>
            gen.id === generationId ? { ...gen, liked: !gen.liked } : gen
        ));
    };

    return {
        clonedVoices,
        generationHistory,
        recordingState,
        selectedVoice,
        setSelectedVoice,
        startRecording,
        stopRecording,
        createVoice,
        addGeneration,
        toggleLike
    };
}

export default useVoiceCloning;
