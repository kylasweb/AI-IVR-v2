'use client';

/**
 * BPO Solutions Landing Page
 * Public page showcasing Enterprise Contact Center Automation
 */

import React, { useState } from 'react';
import {
    Phone,
    Brain,
    Headphones,
    MessageSquare,
    BarChart3,
    Shield,
    Zap,
    Users,
    ArrowRight,
    Play,
    CheckCircle,
    Mic,
    Star
} from 'lucide-react';
import Link from 'next/link';

// Key flow cards data
const SOLUTION_FLOWS = [
    {
        id: 'smart-triage',
        title: 'Smart Triage',
        description: 'AI-powered intent classification with sentiment-based routing. Automatically detect Billing vs Tech Support and route frustrated customers to priority queues.',
        icon: Brain,
        color: 'from-blue-500 to-indigo-600',
        features: ['Intent Classification', 'Sentiment Routing', 'Priority Queuing'],
        demoAvailable: true,
    },
    {
        id: 'transactional-resolver',
        title: 'Transactional Resolver',
        description: 'API-connected automation for order status, account balance, and more. Verify identity with OTP or Voice Biometrics before accessing sensitive data.',
        icon: Zap,
        color: 'from-emerald-500 to-teal-600',
        features: ['CRM Integration', 'Voice Biometrics', 'Real-time Data Fetch'],
        demoAvailable: false,
    },
    {
        id: 'lead-qualifier',
        title: 'Lead Qualifier',
        description: 'Pre-qualify leads through intelligent conversation. Score prospects, capture key information, and route hot leads directly to sales teams.',
        icon: Users,
        color: 'from-orange-500 to-amber-600',
        features: ['Lead Scoring', 'Info Capture', 'Hot Lead Routing'],
        demoAvailable: false,
    },
    {
        id: 'soft-collections',
        title: 'Soft Collections',
        description: 'Gentle payment reminders via Voice and WhatsApp. Detect payment intent, offer flexible options, and send secure payment links.',
        icon: MessageSquare,
        color: 'from-purple-500 to-violet-600',
        features: ['WhatsApp Integration', 'Payment Links', 'AMD Detection'],
        demoAvailable: false,
    },
    {
        id: 'csat-automation',
        title: 'CSAT Automation',
        description: 'Post-call satisfaction surveys that feel natural. Capture feedback, detect at-risk customers, and trigger follow-up actions automatically.',
        icon: BarChart3,
        color: 'from-pink-500 to-rose-600',
        features: ['Natural Surveys', 'At-Risk Detection', 'Auto Follow-up'],
        demoAvailable: false,
    },
    {
        id: 'agent-coaching',
        title: 'Real-Time Agent Coaching',
        description: 'AI assistant that guides human agents during live calls. Suggest scripts, warn about cadence, and display retention offers in real-time.',
        icon: Headphones,
        color: 'from-cyan-500 to-blue-600',
        features: ['Live Scripts', 'Cadence Warnings', 'Retention Prompts'],
        demoAvailable: false,
    },
];

// Stats display
const PLATFORM_STATS = [
    { value: '40%', label: 'Reduction in AHT', description: 'Average Handle Time' },
    { value: '85%', label: 'First Call Resolution', description: 'Without transfers' },
    { value: '3x', label: 'Agent Productivity', description: 'With AI Assist' },
    { value: '60%', label: 'Cost Reduction', description: 'Vs. Traditional IVR' },
];

export default function BPOSolutionsPage() {
    const [activeDemo, setActiveDemo] = useState(false);
    const [demoResult, setDemoResult] = useState<any>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [demoText, setDemoText] = useState('');

    // Handle demo submission
    const handleDemoSubmit = async () => {
        if (!demoText.trim()) return;

        setActiveDemo(true);

        try {
            const response = await fetch('/api/v1/ivr/analyze-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputType: 'text',
                    text: demoText,
                    language: 'en',
                }),
            });

            const result = await response.json();
            setDemoResult(result.data);
        } catch (error) {
            console.error('Demo error:', error);
            setDemoResult({ error: 'Failed to analyze. Please try again.' });
        } finally {
            setActiveDemo(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                            <Phone className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 text-sm font-medium">Enterprise Contact Center</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                            Transform Your{' '}
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                BPO Operations
                            </span>
                        </h1>

                        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
                            AI-powered contact center automation with real-time agent coaching,
                            intelligent routing, and seamless multi-tenancy for enterprise BPO operations.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/bpo-management"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                            >
                                <Play className="w-5 h-5" />
                                Try Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-y border-white/10 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {PLATFORM_STATS.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-white font-semibold mt-2">{stat.label}</div>
                                <div className="text-gray-400 text-sm">{stat.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Flows Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            6 Key Process Flows
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Pre-built automation templates designed for enterprise BPO operations
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SOLUTION_FLOWS.map((flow) => {
                            const Icon = flow.icon;
                            return (
                                <div
                                    key={flow.id}
                                    className="group relative bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all hover:transform hover:-translate-y-1"
                                >
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${flow.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-white mb-2">{flow.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{flow.description}</p>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {flow.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-md"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Demo badge */}
                                    {flow.demoAvailable && (
                                        <div className="absolute top-4 right-4">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                                Demo Available
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Interactive Demo Section */}
            <section id="demo-section" className="py-24 bg-gradient-to-b from-gray-800/50 to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                            <Mic className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">Interactive Demo</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Try Smart Triage
                        </h2>
                        <p className="text-gray-400">
                            Enter a customer statement and see how our AI classifies intent and sentiment
                        </p>
                    </div>

                    {/* Demo Input */}
                    <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-700 backdrop-blur">
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Customer Statement
                            </label>
                            <textarea
                                value={demoText}
                                onChange={(e) => setDemoText(e.target.value)}
                                placeholder="e.g., I've been waiting for my refund for 3 weeks and I'm really frustrated. I want to cancel my subscription."
                                className="w-full h-24 bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>

                        <button
                            onClick={handleDemoSubmit}
                            disabled={activeDemo || !demoText.trim()}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {activeDemo ? 'Analyzing...' : 'Analyze Statement'}
                        </button>

                        {/* Demo Result */}
                        {demoResult && !demoResult.error && (
                            <div className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Intent */}
                                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                        <div className="text-gray-400 text-sm mb-1">Intent</div>
                                        <div className="text-white font-semibold text-lg capitalize">
                                            {demoResult.intent?.primary?.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            Confidence: {Math.round((demoResult.intent?.confidence || 0) * 100)}%
                                        </div>
                                    </div>

                                    {/* Sentiment */}
                                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                        <div className="text-gray-400 text-sm mb-1">Sentiment</div>
                                        <div className={`text-lg font-semibold capitalize ${(demoResult.sentiment?.score || 0.5) < 0.4 ? 'text-red-400' :
                                                (demoResult.sentiment?.score || 0.5) < 0.6 ? 'text-yellow-400' : 'text-green-400'
                                            }`}>
                                            {demoResult.sentiment?.label?.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            Score: {Math.round((demoResult.sentiment?.score || 0) * 100)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Routing Suggestion */}
                                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                    <div className="text-gray-400 text-sm mb-2">Suggested Routing</div>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${demoResult.routing?.needsEscalation ? 'bg-red-500' : 'bg-green-500'
                                            }`} />
                                        <span className="text-white font-medium capitalize">
                                            {demoResult.routing?.suggestedTarget?.replace(/_/g, ' ')}
                                        </span>
                                        {demoResult.routing?.needsEscalation && (
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                                Escalation Required
                                            </span>
                                        )}
                                    </div>
                                    {demoResult.routing?.escalationReason && (
                                        <p className="text-gray-400 text-sm mt-2">
                                            {demoResult.routing.escalationReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {demoResult?.error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                                {demoResult.error}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Contact Center?
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Start with a free pilot program and see results within 2 weeks.
                    </p>
                    <Link
                        href="/pilot-program"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                        Start Free Pilot
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    <p>© 2025 AI IVR Platform. Enterprise Contact Center Automation.</p>
                </div>
            </footer>
        </div>
    );
}
