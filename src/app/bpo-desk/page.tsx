'use client';

/**
 * Unified Agent Desktop
 * Single-screen workspace for BPO agents with CTI, CRM, and coaching integration
 */

import React, { useState, useEffect } from 'react';
import {
    Phone,
    PhoneOff,
    Pause,
    Play,
    Users,
    ArrowRightLeft,
    Mic,
    MicOff,
    Clock,
    User,
    MessageSquare,
    FileText,
    Star,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronRight,
    RefreshCw,
    History,
    CreditCard,
    Mail,
    MapPin,
    Calendar,
    TrendingUp,
    TrendingDown,
    Minus,
    Volume2,
    Settings,
    Zap,
    Brain
} from 'lucide-react';

// Types
interface CustomerData {
    id: string;
    name: string;
    phone: string;
    email: string;
    tier: 'standard' | 'premium' | 'vip';
    accountNumber: string;
    location: string;
    lastContact: string;
    totalCalls: number;
    openTickets: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    notes: string[];
    transactions: Array<{ date: string; amount: number; type: string }>;
}

interface CallState {
    status: 'idle' | 'ringing' | 'active' | 'hold' | 'wrap';
    duration: number;
    callId: string | null;
    customerId: string | null;
    queueName: string;
}

interface CoachingTip {
    id: string;
    type: 'script' | 'warning' | 'suggestion';
    message: string;
    timestamp: Date;
}

// Mock Data
const MOCK_CUSTOMER: CustomerData = {
    id: 'cust_001',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@example.com',
    tier: 'premium',
    accountNumber: 'ACC-2024-001234',
    location: 'New York, NY',
    lastContact: '3 days ago',
    totalCalls: 12,
    openTickets: 1,
    sentiment: 'neutral',
    notes: [
        'Prefers email communication for follow-ups',
        'Has auto-pay enabled but card expired',
        'Long-term customer since 2019'
    ],
    transactions: [
        { date: '2024-11-15', amount: 150.00, type: 'Payment' },
        { date: '2024-10-15', amount: 150.00, type: 'Payment' },
        { date: '2024-09-15', amount: 0, type: 'Missed' }
    ]
};

const DISPOSITION_CODES = [
    { id: 'resolved', label: 'Issue Resolved', color: 'green', icon: CheckCircle },
    { id: 'callback', label: 'Callback Scheduled', color: 'blue', icon: Clock },
    { id: 'escalated', label: 'Escalated to Supervisor', color: 'orange', icon: Users },
    { id: 'no_answer', label: 'No Answer / VM', color: 'gray', icon: PhoneOff },
    { id: 'wrong_number', label: 'Wrong Number', color: 'red', icon: XCircle },
    { id: 'payment_taken', label: 'Payment Taken', color: 'emerald', icon: CreditCard }
];

const SCRIPT_TEMPLATES = {
    greeting: "Hello, thank you for calling. My name is [Agent Name]. How may I assist you today?",
    verification: "For security purposes, may I please verify your account number or the last four digits of your SSN?",
    empathy: "I understand this situation is frustrating, and I want to help resolve this for you.",
    closing: "Is there anything else I can help you with today? Thank you for calling, have a great day!"
};

export default function BPODeskPage() {
    const [callState, setCallState] = useState<CallState>({
        status: 'idle',
        duration: 0,
        callId: null,
        customerId: null,
        queueName: 'Collections Queue'
    });

    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [activeTab, setActiveTab] = useState<'crm' | 'history' | 'notes'>('crm');
    const [coachingTips, setCoachingTips] = useState<CoachingTip[]>([
        { id: '1', type: 'script', message: 'Customer has missed 1 payment. Consider offering a payment plan.', timestamp: new Date() }
    ]);
    const [selectedDisposition, setSelectedDisposition] = useState<string | null>(null);
    const [transcriptLines, setTranscriptLines] = useState<Array<{ speaker: string; text: string; time: string }>>([]);

    // Call timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callState.status === 'active' || callState.status === 'hold') {
            interval = setInterval(() => {
                setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callState.status]);

    // Simulate incoming call
    useEffect(() => {
        const timer = setTimeout(() => {
            setCallState(prev => ({ ...prev, status: 'ringing', callId: 'call_123' }));
            setCustomer(MOCK_CUSTOMER);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = () => {
        setCallState(prev => ({ ...prev, status: 'active' }));
        setTranscriptLines([
            { speaker: 'Agent', text: 'Thank you for calling, this is Sarah. How may I help you?', time: '0:00' }
        ]);
    };

    const handleHold = () => {
        setCallState(prev => ({
            ...prev,
            status: prev.status === 'hold' ? 'active' : 'hold'
        }));
    };

    const handleEndCall = () => {
        setCallState(prev => ({ ...prev, status: 'wrap' }));
    };

    const handleWrapUp = () => {
        if (!selectedDisposition) return;
        setCallState({ status: 'idle', duration: 0, callId: null, customerId: null, queueName: 'Collections Queue' });
        setCustomer(null);
        setSelectedDisposition(null);
        setTranscriptLines([]);
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'vip': return 'bg-purple-500';
            case 'premium': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <TrendingUp className="w-4 h-4 text-green-400" />;
            case 'negative': return <TrendingDown className="w-4 h-4 text-red-400" />;
            default: return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col">
            {/* Top Bar - Call Status */}
            <div className={`h-14 flex items-center justify-between px-4 border-b border-gray-700 ${callState.status === 'ringing' ? 'bg-green-500/20 animate-pulse' :
                    callState.status === 'active' ? 'bg-blue-500/10' :
                        callState.status === 'hold' ? 'bg-yellow-500/10' :
                            callState.status === 'wrap' ? 'bg-orange-500/10' : 'bg-gray-800'
                }`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Phone className={`w-5 h-5 ${callState.status !== 'idle' ? 'text-green-400' : 'text-gray-500'}`} />
                        <span className="font-medium">
                            {callState.status === 'idle' ? 'Ready' :
                                callState.status === 'ringing' ? 'Incoming Call...' :
                                    callState.status === 'active' ? 'On Call' :
                                        callState.status === 'hold' ? 'On Hold' : 'Wrap-Up'}
                        </span>
                    </div>
                    {callState.status !== 'idle' && (
                        <>
                            <div className="w-px h-6 bg-gray-600" />
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-lg">{formatDuration(callState.duration)}</span>
                            </div>
                            <div className="w-px h-6 bg-gray-600" />
                            <span className="text-sm text-gray-400">{callState.queueName}</span>
                        </>
                    )}
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-2">
                    {callState.status === 'ringing' && (
                        <button
                            onClick={handleAnswer}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium"
                        >
                            <Phone className="w-4 h-4" />
                            Answer
                        </button>
                    )}

                    {(callState.status === 'active' || callState.status === 'hold') && (
                        <>
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-2 rounded-lg ${isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleHold}
                                className={`p-2 rounded-lg ${callState.status === 'hold' ? 'bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {callState.status === 'hold' ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            </button>
                            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                                <ArrowRightLeft className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                                <Users className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleEndCall}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
                            >
                                <PhoneOff className="w-4 h-4" />
                                End
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Customer Info / CRM */}
                <div className="w-80 border-r border-gray-700 flex flex-col bg-gray-800/50">
                    {customer ? (
                        <>
                            {/* Customer Header */}
                            <div className="p-4 border-b border-gray-700">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-semibold">{customer.name}</h2>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTierColor(customer.tier)}`}>
                                                {customer.tier.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-400">{customer.accountNumber}</div>
                                    </div>
                                    {getSentimentIcon(customer.sentiment)}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-700">
                                {(['crm', 'history', 'notes'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 px-4 py-2 text-sm font-medium capitalize ${activeTab === tab
                                                ? 'text-blue-400 border-b-2 border-blue-400'
                                                : 'text-gray-400 hover:text-gray-300'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-auto p-4">
                                {activeTab === 'crm' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{customer.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span>{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{customer.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>Last contact: {customer.lastContact}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-3 bg-gray-700/50 rounded-lg text-center">
                                                <div className="text-2xl font-bold">{customer.totalCalls}</div>
                                                <div className="text-xs text-gray-400">Total Calls</div>
                                            </div>
                                            <div className="p-3 bg-gray-700/50 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-yellow-400">{customer.openTickets}</div>
                                                <div className="text-xs text-gray-400">Open Tickets</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-2">Recent Transactions</div>
                                            <div className="space-y-1">
                                                {customer.transactions.map((tx, i) => (
                                                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-700/30 rounded">
                                                        <span className="text-gray-400">{tx.date}</span>
                                                        <span className={tx.type === 'Missed' ? 'text-red-400' : 'text-green-400'}>
                                                            {tx.type === 'Missed' ? 'Missed' : `$${tx.amount.toFixed(2)}`}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className="space-y-2">
                                        {customer.notes.map((note, i) => (
                                            <div key={i} className="p-3 bg-gray-700/30 rounded-lg text-sm">
                                                {note}
                                            </div>
                                        ))}
                                        <button className="w-full p-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:border-gray-500">
                                            + Add Note
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No active call</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center Panel - Transcript & Scripts */}
                <div className="flex-1 flex flex-col">
                    {/* Transcript */}
                    <div className="flex-1 p-4 overflow-auto">
                        <div className="max-w-2xl mx-auto space-y-3">
                            {transcriptLines.length > 0 ? (
                                transcriptLines.map((line, i) => (
                                    <div key={i} className={`flex gap-3 ${line.speaker === 'Agent' ? 'justify-end' : ''}`}>
                                        <div className={`max-w-md p-3 rounded-lg ${line.speaker === 'Agent'
                                                ? 'bg-blue-500/20 text-blue-100'
                                                : 'bg-gray-700 text-gray-200'
                                            }`}>
                                            <div className="text-xs text-gray-400 mb-1">{line.speaker} • {line.time}</div>
                                            <p>{line.text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    {callState.status === 'idle' ? 'Waiting for call...' : 'Call transcript will appear here'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Script Suggestions */}
                    {callState.status === 'active' && (
                        <div className="border-t border-gray-700 p-4 bg-gray-800/50">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">Quick Scripts</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(SCRIPT_TEMPLATES).map(([key, script]) => (
                                    <button
                                        key={key}
                                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm capitalize"
                                    >
                                        {key.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Wrap-Up / Disposition */}
                    {callState.status === 'wrap' && (
                        <div className="border-t border-gray-700 p-4 bg-orange-500/5">
                            <div className="max-w-md mx-auto">
                                <h3 className="font-medium mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Select Disposition
                                </h3>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {DISPOSITION_CODES.map((code) => {
                                        const Icon = code.icon;
                                        return (
                                            <button
                                                key={code.id}
                                                onClick={() => setSelectedDisposition(code.id)}
                                                className={`p-3 rounded-lg border text-left transition-all ${selectedDisposition === code.id
                                                        ? `border-${code.color}-500 bg-${code.color}-500/10`
                                                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4 mb-1" />
                                                <div className="text-sm font-medium">{code.label}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={handleWrapUp}
                                    disabled={!selectedDisposition}
                                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Complete Wrap-Up
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - AI Coaching */}
                <div className="w-72 border-l border-gray-700 bg-gray-800/50 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            <span className="font-medium">AI Coach</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {coachingTips.map((tip) => (
                            <div
                                key={tip.id}
                                className={`p-3 rounded-lg border ${tip.type === 'warning'
                                        ? 'border-yellow-500/50 bg-yellow-500/10'
                                        : tip.type === 'script'
                                            ? 'border-blue-500/50 bg-blue-500/10'
                                            : 'border-green-500/50 bg-green-500/10'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    {tip.type === 'warning' ? (
                                        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    ) : tip.type === 'script' ? (
                                        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    <p className="text-sm">{tip.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Real-time Metrics */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="text-sm font-medium mb-3">Today's Stats</div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Calls Handled</span>
                                <span className="font-medium">23</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Avg Handle Time</span>
                                <span className="font-medium">4:32</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Resolution Rate</span>
                                <span className="font-medium text-green-400">87%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
