'use client';

/**
 * Admin Sentiment Calibration Tool
 * Tune sentiment thresholds and test NLU analysis
 */

import React, { useState } from 'react';
import {
    Sliders,
    Play,
    Save,
    RotateCcw,
    TrendingUp,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Brain,
    Gauge
} from 'lucide-react';

interface CalibrationSettings {
    sentimentThresholds: {
        critical: number;
        low: number;
        neutral: number;
        high: number;
    };
    escalationRules: {
        autoEscalateBelow: number;
        preferHumanBelow: number;
    };
    intentConfidence: {
        highConfidence: number;
        lowConfidence: number;
    };
}

const DEFAULT_SETTINGS: CalibrationSettings = {
    sentimentThresholds: {
        critical: 0.2,
        low: 0.35,
        neutral: 0.5,
        high: 0.7,
    },
    escalationRules: {
        autoEscalateBelow: 0.2,
        preferHumanBelow: 0.35,
    },
    intentConfidence: {
        highConfidence: 0.85,
        lowConfidence: 0.6,
    },
};

interface TestResult {
    input: string;
    intent: { primary: string; confidence: number };
    sentiment: { score: number; label: string };
    routing: { target: string; needsEscalation: boolean };
}

export default function AdminSentimentCalibrationPage() {
    const [settings, setSettings] = useState<CalibrationSettings>(DEFAULT_SETTINGS);
    const [testInput, setTestInput] = useState('');
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isTesting, setIsTesting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Update threshold
    const updateThreshold = (category: keyof CalibrationSettings, key: string, value: number) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] as Record<string, number>),
                [key]: value,
            },
        }));
        setHasChanges(true);
    };

    // Run test
    const runTest = async () => {
        if (!testInput.trim()) return;

        setIsTesting(true);
        try {
            const response = await fetch('/api/v1/ivr/analyze-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputType: 'text',
                    text: testInput,
                    language: 'en',
                }),
            });

            const data = await response.json();
            if (data.success) {
                setTestResults(prev => [{
                    input: testInput,
                    intent: data.data.intent,
                    sentiment: data.data.sentiment,
                    routing: data.data.routing,
                }, ...prev].slice(0, 10));
            }
        } catch (error) {
            console.error('Test failed:', error);
        } finally {
            setIsTesting(false);
            setTestInput('');
        }
    };

    // Reset to defaults
    const resetToDefaults = () => {
        setSettings(DEFAULT_SETTINGS);
        setHasChanges(false);
    };

    // Get sentiment label color
    const getSentimentColor = (score: number) => {
        if (score < settings.sentimentThresholds.critical) return 'text-red-500 bg-red-500/20';
        if (score < settings.sentimentThresholds.low) return 'text-orange-500 bg-orange-500/20';
        if (score < settings.sentimentThresholds.neutral) return 'text-yellow-500 bg-yellow-500/20';
        if (score < settings.sentimentThresholds.high) return 'text-blue-500 bg-blue-500/20';
        return 'text-green-500 bg-green-500/20';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <Sliders className="w-7 h-7 text-orange-400" />
                                Sentiment Calibration
                            </h1>
                            <p className="text-gray-400 mt-1">Fine-tune NLU thresholds and routing rules</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={resetToDefaults}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                            <button
                                disabled={!hasChanges}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${hasChanges
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left - Settings */}
                    <div className="space-y-6">
                        {/* Sentiment Thresholds */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <h3 className="font-medium mb-6 flex items-center gap-2">
                                <Gauge className="w-5 h-5 text-blue-400" />
                                Sentiment Thresholds
                            </h3>

                            <div className="space-y-6">
                                {/* Visual Scale */}
                                <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
                                    {Object.entries(settings.sentimentThresholds).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                                            style={{ left: `${value * 100}%` }}
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                                                {key}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Sliders */}
                                {Object.entries(settings.sentimentThresholds).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-4">
                                        <label className="w-24 text-sm text-gray-400 capitalize">{key}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={value * 100}
                                            onChange={(e) => updateThreshold('sentimentThresholds', key, parseInt(e.target.value) / 100)}
                                            className="flex-1 accent-orange-500"
                                        />
                                        <span className="w-12 text-right font-mono text-sm">{Math.round(value * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Escalation Rules */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <h3 className="font-medium mb-6 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                Escalation Rules
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Auto-escalate to human when sentiment below:
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={settings.escalationRules.autoEscalateBelow * 100}
                                            onChange={(e) => updateThreshold('escalationRules', 'autoEscalateBelow', parseInt(e.target.value) / 100)}
                                            className="flex-1 accent-red-500"
                                        />
                                        <span className="w-12 text-right font-mono text-sm text-red-400">
                                            {Math.round(settings.escalationRules.autoEscalateBelow * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Prefer human agent when sentiment below:
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="60"
                                            value={settings.escalationRules.preferHumanBelow * 100}
                                            onChange={(e) => updateThreshold('escalationRules', 'preferHumanBelow', parseInt(e.target.value) / 100)}
                                            className="flex-1 accent-yellow-500"
                                        />
                                        <span className="w-12 text-right font-mono text-sm text-yellow-400">
                                            {Math.round(settings.escalationRules.preferHumanBelow * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Intent Confidence */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <h3 className="font-medium mb-6 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-400" />
                                Intent Confidence
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        High confidence threshold:
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="70"
                                            max="100"
                                            value={settings.intentConfidence.highConfidence * 100}
                                            onChange={(e) => updateThreshold('intentConfidence', 'highConfidence', parseInt(e.target.value) / 100)}
                                            className="flex-1 accent-green-500"
                                        />
                                        <span className="w-12 text-right font-mono text-sm text-green-400">
                                            {Math.round(settings.intentConfidence.highConfidence * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Low confidence threshold:
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="40"
                                            max="80"
                                            value={settings.intentConfidence.lowConfidence * 100}
                                            onChange={(e) => updateThreshold('intentConfidence', 'lowConfidence', parseInt(e.target.value) / 100)}
                                            className="flex-1 accent-orange-500"
                                        />
                                        <span className="w-12 text-right font-mono text-sm text-orange-400">
                                            {Math.round(settings.intentConfidence.lowConfidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Testing */}
                    <div className="space-y-6">
                        {/* Test Input */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <h3 className="font-medium mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-green-400" />
                                Test Calibration
                            </h3>

                            <div className="space-y-4">
                                <textarea
                                    value={testInput}
                                    onChange={(e) => setTestInput(e.target.value)}
                                    placeholder="Enter a customer statement to test..."
                                    className="w-full h-24 bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 outline-none resize-none"
                                />
                                <button
                                    onClick={runTest}
                                    disabled={isTesting || !testInput.trim()}
                                    className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    {isTesting ? 'Analyzing...' : 'Run Test'}
                                </button>
                            </div>
                        </div>

                        {/* Test Results */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <h3 className="font-medium mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Test Results
                            </h3>

                            {testResults.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    No tests run yet. Enter a statement above to test.
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {testResults.map((result, i) => (
                                        <div key={i} className="p-4 bg-gray-700/50 rounded-lg space-y-3">
                                            <p className="text-sm text-gray-300 italic">"{result.input}"</p>

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-400">Intent: </span>
                                                    <span className="text-blue-400 capitalize">
                                                        {result.intent.primary.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-gray-500 ml-1">
                                                        ({Math.round(result.intent.confidence * 100)}%)
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-gray-400">Sentiment: </span>
                                                    <span className={`px-2 py-0.5 rounded ${getSentimentColor(result.sentiment.score)}`}>
                                                        {Math.round(result.sentiment.score * 100)}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {result.routing.needsEscalation ? (
                                                    <span className="flex items-center gap-1 text-red-400 text-xs">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Escalation Required
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-green-400 text-xs">
                                                        <CheckCircle className="w-3 h-3" />
                                                        AI Can Handle
                                                    </span>
                                                )}
                                                <span className="text-gray-500 text-xs">
                                                    → {result.routing.target.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
