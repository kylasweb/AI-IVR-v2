'use client';

/**
 * Warm Handoff Panel
 * Displays context for human agents when receiving transferred calls
 */

import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    MessageSquare,
    TrendingUp,
    Clock,
    FileText,
    CheckCircle,
    Copy,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Target
} from 'lucide-react';

interface WarmHandoffPanelProps {
    callId: string;
    onClose: () => void;
}

interface HandoffContext {
    call: {
        id: string;
        callId: string;
        type: string;
        duration: number;
        language: string;
    };
    intent: {
        label: string;
        category: string;
        confidence: number;
        keywords: string[];
    };
    sentiment: {
        score: number;
        label: string;
        percentage: number;
        alerts: string[];
    };
    transcript: {
        snippet: string;
        wordCount: number;
    };
    handoff: {
        status: string;
        type: string;
        reason: string;
        priority: string;
    };
    suggestions: {
        scripts: string[];
        doNotSay: string[];
        resolutionOptions: string[];
    };
}

export default function WarmHandoffPanel({ callId, onClose }: WarmHandoffPanelProps) {
    const [context, setContext] = useState<HandoffContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        transcript: true,
        scripts: true,
        doNotSay: false,
    });
    const [copied, setCopied] = useState(false);

    // Fetch handoff context
    useEffect(() => {
        const fetchContext = async () => {
            try {
                const response = await fetch(`/api/v1/agent/handoff-context/${callId}`);
                const result = await response.json();
                if (result.success) {
                    setContext(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch handoff context:', error);
                // Set mock data for demo
                setContext({
                    call: {
                        id: callId,
                        callId: callId,
                        type: 'inbound',
                        duration: 180,
                        language: 'en',
                    },
                    intent: {
                        label: 'Refund Request',
                        category: 'billing',
                        confidence: 85,
                        keywords: ['refund', 'charged twice', 'frustrated'],
                    },
                    sentiment: {
                        score: 0.35,
                        label: 'Frustrated',
                        percentage: 35,
                        alerts: ['Customer expressing high frustration - approach with empathy'],
                    },
                    transcript: {
                        snippet: "Customer: I've been charged twice for my subscription this month and I want a refund. This is the third time something like this has happened. I'm really frustrated with this service.\n\nAI Agent: I'm sorry to hear about the double charge. Let me look into this for you right away.\n\nCustomer: You better fix this or I'm canceling everything.",
                        wordCount: 67,
                    },
                    handoff: {
                        status: 'warm_transfer',
                        type: 'escalation',
                        reason: 'Customer frustration requires human empathy',
                        priority: 'high',
                    },
                    suggestions: {
                        scripts: [
                            "I understand how frustrating this must be, and I'm here to help resolve this for you today.",
                            "Thank you for your patience. Let me personally ensure this gets sorted out.",
                            "I see the notes from our AI assistant, and I want to apologize for the inconvenience.",
                        ],
                        doNotSay: [
                            "Don't use phrases like 'calm down' or 'there's nothing I can do'",
                            "Avoid reading from scripts in a robotic manner",
                            "Don't interrupt the customer while they're explaining",
                        ],
                        resolutionOptions: [
                            'Full refund',
                            'Partial refund',
                            'Account credit',
                            'Service discount',
                        ],
                    },
                });
            } finally {
                setLoading(false);
            }
        };

        fetchContext();
    }, [callId]);

    // Toggle section
    const toggleSection = (section: 'transcript' | 'scripts' | 'doNotSay') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Copy transcript
    const copyTranscript = () => {
        if (context?.transcript.snippet) {
            navigator.clipboard.writeText(context.transcript.snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    // Get sentiment color
    const getSentimentColor = (score: number) => {
        if (score < 0.3) return 'text-red-500';
        if (score < 0.5) return 'text-orange-500';
        if (score < 0.7) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-300">Loading handoff context...</p>
                </div>
            </div>
        );
    }

    if (!context) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end">
            <div className="w-full max-w-xl h-full bg-gray-900 border-l border-gray-700 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Warm Handoff</h2>
                        <p className="text-gray-400 text-sm">Call transferred from AI Agent</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Priority Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getPriorityColor(context.handoff.priority)}`}>
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium capitalize">{context.handoff.priority} Priority</span>
                    </div>

                    {/* Intent & Sentiment Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Intent */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-gray-400">Intent</span>
                            </div>
                            <div className="text-lg font-semibold text-white">{context.intent.label}</div>
                            <div className="text-sm text-gray-400 mt-1">
                                {context.intent.confidence}% confidence
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {context.intent.keywords.map((keyword, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Sentiment */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-gray-400">Sentiment</span>
                            </div>
                            <div className={`text-lg font-semibold ${getSentimentColor(context.sentiment.score)}`}>
                                {context.sentiment.label}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                                {context.sentiment.percentage}%
                            </div>
                            {/* Sentiment Bar */}
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${context.sentiment.score < 0.3 ? 'bg-red-500' :
                                            context.sentiment.score < 0.5 ? 'bg-orange-500' :
                                                context.sentiment.score < 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${context.sentiment.percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sentiment Alerts */}
                    {context.sentiment.alerts.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    {context.sentiment.alerts.map((alert, i) => (
                                        <p key={i} className="text-red-300 text-sm">⚠️ {alert}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Handoff Reason */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Handoff Reason</h3>
                        <p className="text-white">{context.handoff.reason}</p>
                    </div>

                    {/* Transcript Section */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('transcript')}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700/50"
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Last 2 Minutes Transcript</span>
                                <span className="text-xs text-gray-500">({context.transcript.wordCount} words)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyTranscript(); }}
                                    className="p-1 hover:bg-gray-600 rounded"
                                >
                                    {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                </button>
                                {expandedSections.transcript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </button>
                        {expandedSections.transcript && (
                            <div className="px-4 pb-4">
                                <div className="bg-gray-900/50 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {context.transcript.snippet}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggested Scripts */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('scripts')}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700/50"
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                                <span className="font-medium">Suggested Scripts</span>
                            </div>
                            {expandedSections.scripts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedSections.scripts && (
                            <div className="px-4 pb-4 space-y-2">
                                {context.suggestions.scripts.map((script, i) => (
                                    <div key={i} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <p className="text-sm text-gray-200">"{script}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Do Not Say */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <button
                            onClick={() => toggleSection('doNotSay')}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700/50"
                        >
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <span className="font-medium">Avoid Saying</span>
                            </div>
                            {expandedSections.doNotSay ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedSections.doNotSay && (
                            <div className="px-4 pb-4 space-y-2">
                                {context.suggestions.doNotSay.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                                        <span className="text-red-400">✕</span>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resolution Options */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Resolution Options</h3>
                        <div className="flex flex-wrap gap-2">
                            {context.suggestions.resolutionOptions.map((option, i) => (
                                <button
                                    key={i}
                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accept Handoff Button */}
                    <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all">
                        Accept Handoff
                    </button>
                </div>
            </div>
        </div>
    );
}
