'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api-client';
import { useMockData } from '@/hooks/use-mock-data';

export interface TestSuite {
    id: string;
    name: string;
    description: string;
    type: 'quality' | 'accuracy' | 'latency' | 'performance' | 'comprehensive';
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    testCases: TestCase[];
    createdAt: string;
    updatedAt: string;
    results: TestResults;
}

export interface TestCase {
    id: string;
    name: string;
    type: 'stt' | 'tts' | 'voice_cloning' | 'speech_recognition' | 'audio_quality';
    modelId: string;
    inputData: string;
    expectedOutput?: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    duration?: number;
    error?: string;
    metrics: {
        accuracy?: number;
        latency?: number;
        quality?: number;
        similarity?: number;
    };
}

export interface TestResults {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    avgLatency: number;
    avgAccuracy: number;
    avgQuality: number;
    totalDuration: number;
    coverage: number;
}

export interface TestConfiguration {
    id: string;
    name: string;
    description: string;
    testTypes: string[];
    models: string[];
    datasets: string[];
    parameters: {
        sampleRate: number;
        channels: number;
        duration: number;
        noiseLevel: number;
        language: string;
    };
}

export interface SuiteMetrics {
    totalSuites: number;
    runningSuites: number;
    completedSuites: number;
    avgAccuracy: number;
    avgQuality: number;
    totalTests: number;
    passedTests: number;
    successRate: number;
}

export function useTestSuite() {
    const { isDemoMode } = useMockData();
    const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
    const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
    const [loading, setLoading] = useState(true);

    // Load test suites on mount
    useEffect(() => {
        loadTestSuites();
    }, [isDemoMode]);

    const loadTestSuites = async () => {
        try {
            setLoading(true);

            if (isDemoMode) {
                // Mock data for demonstration
                const mockTestSuites: TestSuite[] = [
                    {
                        id: 'suite-1',
                        name: 'Malayalam STT Quality Test Suite',
                        description: 'Comprehensive quality testing for Malayalam speech-to-text models',
                        type: 'quality',
                        status: 'completed',
                        progress: 100,
                        testCases: [
                            {
                                id: 'test-1',
                                name: 'Clean Audio STT Test',
                                type: 'stt',
                                modelId: 'vertex-ai-chirp2',
                                inputData: 'malayalam_clean_audio.wav',
                                expectedOutput: 'Expected Malayalam transcription',
                                status: 'passed',
                                duration: 2.3,
                                metrics: { accuracy: 94.2, latency: 1.8, quality: 92.1 }
                            },
                            {
                                id: 'test-2',
                                name: 'Noisy Audio STT Test',
                                type: 'stt',
                                modelId: 'assembly-ai',
                                inputData: 'malayalam_noisy_audio.wav',
                                expectedOutput: 'Expected Malayalam transcription',
                                status: 'passed',
                                duration: 3.1,
                                metrics: { accuracy: 87.6, latency: 2.2, quality: 85.4 }
                            },
                            {
                                id: 'test-3',
                                name: 'Long Audio STT Test',
                                type: 'stt',
                                modelId: 'ai4bharat-whisper',
                                inputData: 'malayalam_long_audio.wav',
                                expectedOutput: 'Expected Malayalam transcription',
                                status: 'failed',
                                duration: 15.7,
                                error: 'Timeout exceeded',
                                metrics: { accuracy: 0, latency: 15.7, quality: 0 }
                            }
                        ],
                        createdAt: '2024-11-01T10:00:00Z',
                        updatedAt: '2024-11-08T15:30:00Z',
                        results: {
                            totalTests: 3,
                            passedTests: 2,
                            failedTests: 1,
                            avgLatency: 7.2,
                            avgAccuracy: 60.6,
                            avgQuality: 59.2,
                            totalDuration: 21.1,
                            coverage: 85.3
                        }
                    },
                    {
                        id: 'suite-2',
                        name: 'Voice Synthesis Performance Test',
                        description: 'Performance testing for voice synthesis models',
                        type: 'performance',
                        status: 'running',
                        progress: 67,
                        testCases: [
                            {
                                id: 'test-4',
                                name: 'TTS Speed Test',
                                type: 'tts',
                                modelId: 'elevenlabs-voice-1',
                                inputData: 'Hello world in Malayalam',
                                expectedOutput: 'synthesized_audio.wav',
                                status: 'running',
                                duration: 1.2,
                                metrics: { latency: 1.2, quality: 88.5, similarity: 92.1 }
                            },
                            {
                                id: 'test-5',
                                name: 'TTS Quality Test',
                                type: 'tts',
                                modelId: 'elevenlabs-voice-2',
                                inputData: 'Complex Malayalam sentence',
                                expectedOutput: 'synthesized_audio.wav',
                                status: 'pending',
                                metrics: {}
                            }
                        ],
                        createdAt: '2024-11-02T14:20:00Z',
                        updatedAt: '2024-11-08T16:45:00Z',
                        results: {
                            totalTests: 2,
                            passedTests: 0,
                            failedTests: 0,
                            avgLatency: 1.2,
                            avgAccuracy: 0,
                            avgQuality: 88.5,
                            totalDuration: 1.2,
                            coverage: 50.0
                        }
                    }
                ];

                setTestSuites(mockTestSuites);
            } else {
                // Real API call
                const response = await api.getVoiceTestingSuites();
                setTestSuites(response.data);
            }
        } catch (error) {
            console.error('Error loading test suites:', error);
            toast({
                title: 'Error',
                description: 'Failed to load voice testing suites',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const createSuite = (name: string, description: string, type: TestSuite['type']) => {
        const newSuite: TestSuite = {
            id: `suite-${Date.now()}`,
            name,
            description,
            type,
            status: 'idle',
            progress: 0,
            testCases: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            results: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                avgLatency: 0,
                avgAccuracy: 0,
                avgQuality: 0,
                totalDuration: 0,
                coverage: 0
            }
        };

        setTestSuites(prev => [...prev, newSuite]);

        toast({
            title: "Test Suite Created",
            description: `Test suite "${newSuite.name}" has been created.`,
        });

        return newSuite;
    };

    const runSuite = (suiteId: string) => {
        const suite = testSuites.find(s => s.id === suiteId);
        if (!suite) return;

        setTestSuites(prev => prev.map(s =>
            s.id === suiteId
                ? { ...s, status: 'running' as const, updatedAt: new Date().toISOString() }
                : s
        ));

        // Simulate test suite execution
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTestSuites(prev => prev.map(s =>
                    s.id === suiteId
                        ? {
                            ...s,
                            status: 'completed' as const,
                            progress: 100,
                            updatedAt: new Date().toISOString(),
                            results: {
                                ...s.results,
                                passedTests: Math.floor(s.results.totalTests * 0.85),
                                failedTests: Math.floor(s.results.totalTests * 0.15),
                                avgAccuracy: 87.3,
                                avgQuality: 84.6,
                                coverage: 92.1
                            }
                        }
                        : s
                ));
            } else {
                setTestSuites(prev => prev.map(s =>
                    s.id === suiteId
                        ? { ...s, progress: Math.round(progress) }
                        : s
                ));
            }
        }, 1500);

        toast({
            title: "Test Suite Started",
            description: `Test suite "${suite.name}" is now running.`,
        });
    };

    const pauseSuite = (suiteId: string) => {
        const suite = testSuites.find(s => s.id === suiteId);
        if (!suite) return;

        setTestSuites(prev => prev.map(s =>
            s.id === suiteId
                ? { ...s, status: 'idle' as const, updatedAt: new Date().toISOString() }
                : s
        ));

        toast({
            title: "Test Suite Paused",
            description: `Test suite "${suite.name}" has been paused.`,
        });
    };

    const deleteSuite = (suiteId: string) => {
        const suite = testSuites.find(s => s.id === suiteId);
        if (!suite) return;

        setTestSuites(prev => prev.filter(s => s.id !== suiteId));

        toast({
            title: "Test Suite Deleted",
            description: `Test suite "${suite.name}" has been deleted.`,
        });
    };

    const calculateMetrics = (): SuiteMetrics => {
        const totalSuites = testSuites.length;
        const runningSuites = testSuites.filter(s => s.status === 'running').length;
        const completedSuites = testSuites.filter(s => s.status === 'completed').length;
        const avgAccuracy = testSuites.length > 0
            ? testSuites.reduce((sum, s) => sum + s.results.avgAccuracy, 0) / testSuites.length
            : 0;
        const avgQuality = testSuites.length > 0
            ? testSuites.reduce((sum, s) => sum + s.results.avgQuality, 0) / testSuites.length
            : 0;
        const totalTests = testSuites.reduce((sum, s) => sum + s.results.totalTests, 0);
        const passedTests = testSuites.reduce((sum, s) => sum + s.results.passedTests, 0);

        return {
            totalSuites,
            runningSuites,
            completedSuites,
            avgAccuracy: Math.round(avgAccuracy * 10) / 10,
            avgQuality: Math.round(avgQuality * 10) / 10,
            totalTests,
            passedTests,
            successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 1000) / 10 : 0
        };
    };

    return {
        testSuites,
        selectedSuite,
        setSelectedSuite,
        loading,
        metrics: calculateMetrics(),
        createSuite,
        runSuite,
        pauseSuite,
        deleteSuite,
        refreshSuites: loadTestSuites
    };
}

export default useTestSuite;
