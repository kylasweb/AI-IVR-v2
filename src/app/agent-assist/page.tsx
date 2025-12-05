'use client';

/**
 * Agent Assist Page
 * Real-time coaching interface for human agents
 */

import React, { useState, useEffect } from 'react';
import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Clock,
    MessageSquare,
    AlertTriangle,
    TrendingUp,
    User,
    FileText,
    Settings,
    ChevronRight,
    Activity,
    Gauge,
    Brain
} from 'lucide-react';
import AgentCoachWidget from '@/components/agent-assist/AgentCoachWidget';
import WarmHandoffPanel from '@/components/agent-assist/WarmHandoffPanel';

// Mock active call data
const mockCallData = {
    callId: 'call-123456',
    customerName: 'Sarah Johnson',
    phoneNumber: '+1-555-0123',
    callType: 'inbound',
    startTime: new Date(Date.now() - 180000), // 3 mins ago
    intent: 'billing_inquiry',
    sentiment: 0.35,
    queueTime: 45,
};

export default function AgentAssistPage() {
    const [isCallActive, setIsCallActive] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(180);
    const [currentSentiment, setCurrentSentiment] = useState(0.35);
    const [showHandoffPanel, setShowHandoffPanel] = useState(false);
    const [coachingEvents, setCoachingEvents] = useState<any[]>([]);

    // Simulate call duration timer
    useEffect(() => {
        if (isCallActive) {
            const timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isCallActive]);

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get sentiment color
    const getSentimentColor = (score: number) => {
        if (score < 0.3) return 'text-red-500';
        if (score < 0.5) return 'text-orange-500';
        if (score < 0.7) return 'text-yellow-500';
        return 'text-green-500';
    };

    // Handle end call
    const handleEndCall = () => {
        setIsCallActive(false);
        setShowHandoffPanel(true);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header Bar */}
            <header className="fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur border-b border-gray-700 z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Left - Logo & Status */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Headphones className="w-6 h-6 text-blue-400" />
                            <span className="font-semibold">Agent Assist</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isCallActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                            {isCallActive ? 'On Call' : 'Idle'}
                        </div>
                    </div>

                    {/* Center - Call Info */}
                    {isCallActive && (
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{mockCallData.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-lg">{formatDuration(callDuration)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-gray-400" />
                                <span className={`font-medium ${getSentimentColor(currentSentiment)}`}>
                                    {Math.round(currentSentiment * 100)}%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Right - Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-2 rounded-lg ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600`}
                        >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        {isCallActive && (
                            <button
                                onClick={handleEndCall}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
                            >
                                <PhoneOff className="w-4 h-4" />
                                End Call
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 pb-8 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
                    {/* Left Panel - Call Context */}
                    <div className="col-span-3 space-y-4">
                        {/* Customer Info Card */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Customer</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-lg font-semibold">{mockCallData.customerName}</div>
                                    <div className="text-gray-400 text-sm">{mockCallData.phoneNumber}</div>
                                </div>
                                <div className="pt-3 border-t border-gray-700">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Previous Calls</span>
                                        <span>3</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-gray-400">Tier</span>
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">Premium</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Intent Card */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Detected Intent</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-medium capitalize">
                                        {mockCallData.intent.replace(/_/g, ' ')}
                                    </div>
                                    <div className="text-gray-400 text-sm">85% confidence</div>
                                </div>
                            </div>
                        </div>

                        {/* Sentiment Gauge */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Sentiment</h3>
                            <div className="relative pt-4">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                    <span>Frustrated</span>
                                    <span>Neutral</span>
                                    <span>Happy</span>
                                </div>
                                <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative">
                                    <div
                                        className="absolute w-4 h-4 bg-white rounded-full border-2 border-gray-900 -top-0.5 transform -translate-x-1/2"
                                        style={{ left: `${currentSentiment * 100}%` }}
                                    />
                                </div>
                                <div className="text-center mt-3">
                                    <span className={`text-2xl font-bold ${getSentimentColor(currentSentiment)}`}>
                                        {Math.round(currentSentiment * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center - Main Focus Area */}
                    <div className="col-span-6">
                        {/* Real-Time Script Suggestions */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                                <h3 className="font-medium flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                    Suggested Scripts
                                </h3>
                                <span className="text-xs text-gray-400">Updates in real-time</span>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Active Script */}
                                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-blue-400 font-medium mb-1">Retention Script</div>
                                            <p className="text-gray-200">
                                                "I understand you're concerned about the charges. Let me review your account
                                                and see what options we have to make this right for you."
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning Alert */}
                                {currentSentiment < 0.4 && (
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-yellow-400 font-medium mb-1">Customer Sentiment Low</div>
                                                <p className="text-gray-300 text-sm">
                                                    Use empathy statements. Acknowledge their frustration before problem-solving.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Available Actions */}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                        <div className="text-sm font-medium">Offer Credit</div>
                                        <div className="text-xs text-gray-400">Apply $20 account credit</div>
                                    </button>
                                    <button className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                        <div className="text-sm font-medium">Process Refund</div>
                                        <div className="text-xs text-gray-400">Initiate refund request</div>
                                    </button>
                                    <button className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                        <div className="text-sm font-medium">Escalate</div>
                                        <div className="text-xs text-gray-400">Transfer to supervisor</div>
                                    </button>
                                    <button className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                        <div className="text-sm font-medium">Create Ticket</div>
                                        <div className="text-xs text-gray-400">Open support ticket</div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Live Transcript */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 mt-4 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                                <h3 className="font-medium flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-purple-400" />
                                    Live Transcript
                                </h3>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                            <div className="p-4 h-48 overflow-y-auto space-y-3 text-sm">
                                <div className="flex gap-2">
                                    <span className="text-blue-400 font-medium w-20 flex-shrink-0">Customer:</span>
                                    <span className="text-gray-300">I've been charged twice for my subscription this month and I want a refund.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-green-400 font-medium w-20 flex-shrink-0">Agent:</span>
                                    <span className="text-gray-300">I'm sorry to hear about the double charge. Let me look into this for you right away.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-blue-400 font-medium w-20 flex-shrink-0">Customer:</span>
                                    <span className="text-gray-300">This is the third time something like this has happened. I'm really frustrated.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Quick Actions & Stats */}
                    <div className="col-span-3 space-y-4">
                        {/* Call Stats */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">This Call</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold">{formatDuration(callDuration)}</div>
                                    <div className="text-xs text-gray-400">Duration</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">3</div>
                                    <div className="text-xs text-gray-400">Scripts Used</div>
                                </div>
                            </div>
                        </div>

                        {/* Your Performance */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Today's Performance</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Calls Handled</span>
                                    <span className="font-semibold">12</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Avg Handle Time</span>
                                    <span className="font-semibold text-green-400">4:32</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">CSAT Score</span>
                                    <span className="font-semibold text-green-400">4.7/5</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">FCR Rate</span>
                                    <span className="font-semibold">91%</span>
                                </div>
                            </div>
                        </div>

                        {/* Knowledge Base Quick Access */}
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Links</h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                    <span className="text-sm">Billing Policies</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="w-full flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                    <span className="text-sm">Refund Guidelines</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="w-full flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg text-left transition-colors">
                                    <span className="text-sm">Retention Offers</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Coach Widget - Always visible */}
            <AgentCoachWidget
                isCallActive={isCallActive}
                sentiment={currentSentiment}
                callDuration={callDuration}
            />

            {/* Warm Handoff Panel - Shows when call ends or on transfer */}
            {showHandoffPanel && (
                <WarmHandoffPanel
                    callId={mockCallData.callId}
                    onClose={() => setShowHandoffPanel(false)}
                />
            )}
        </div>
    );
}

// Headphones icon component
function Headphones(props: any) {
    return <HeadphonesIcon {...props} />;
}

function HeadphonesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
    );
}
