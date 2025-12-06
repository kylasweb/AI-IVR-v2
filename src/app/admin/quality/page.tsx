'use client';

/**
 * Quality Monitoring Dashboard
 * 100% AI call scoring, QA evaluation forms, and calibration tools
 */

import React, { useState } from 'react';
import {
    Star,
    Phone,
    Play,
    Pause,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronRight,
    Download,
    Filter,
    Search,
    Brain,
    TrendingUp,
    TrendingDown,
    Clock,
    Users,
    Award,
    Target,
    Sliders,
    RefreshCw,
    Volume2,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Minus
} from 'lucide-react';

// Types
interface CallEvaluation {
    id: string;
    callId: string;
    agentName: string;
    customerName: string;
    date: string;
    duration: string;
    aiScore: number;
    humanScore?: number;
    criteria: EvaluationCriteria[];
    sentiment: 'positive' | 'neutral' | 'negative';
    hasIssues: boolean;
    transcriptExcerpt: string;
}

interface EvaluationCriteria {
    name: string;
    aiScore: number;
    weight: number;
    feedback?: string;
}

// Mock Data
const EVALUATIONS: CallEvaluation[] = [
    {
        id: 'eval_001',
        callId: 'call_123',
        agentName: 'Sarah Johnson',
        customerName: 'John Doe',
        date: '2024-12-06 09:15',
        duration: '5:32',
        aiScore: 92,
        humanScore: 90,
        sentiment: 'positive',
        hasIssues: false,
        transcriptExcerpt: 'Thank you for calling. I completely understand your concern and I\'m happy to help...',
        criteria: [
            { name: 'Greeting & Verification', aiScore: 95, weight: 15 },
            { name: 'Active Listening', aiScore: 90, weight: 20 },
            { name: 'Problem Resolution', aiScore: 88, weight: 25 },
            { name: 'Compliance', aiScore: 100, weight: 20 },
            { name: 'Professionalism', aiScore: 92, weight: 10 },
            { name: 'Closing', aiScore: 85, weight: 10 }
        ]
    },
    {
        id: 'eval_002',
        callId: 'call_124',
        agentName: 'Mike Chen',
        customerName: 'Jane Smith',
        date: '2024-12-06 09:45',
        duration: '8:15',
        aiScore: 78,
        sentiment: 'negative',
        hasIssues: true,
        transcriptExcerpt: 'I understand this is frustrating. Let me see what options we have available...',
        criteria: [
            { name: 'Greeting & Verification', aiScore: 85, weight: 15 },
            { name: 'Active Listening', aiScore: 70, weight: 20, feedback: 'Agent interrupted customer multiple times' },
            { name: 'Problem Resolution', aiScore: 75, weight: 25, feedback: 'Resolution took longer than expected' },
            { name: 'Compliance', aiScore: 95, weight: 20 },
            { name: 'Professionalism', aiScore: 72, weight: 10, feedback: 'Tone became slightly defensive' },
            { name: 'Closing', aiScore: 70, weight: 10 }
        ]
    },
    {
        id: 'eval_003',
        callId: 'call_125',
        agentName: 'Emily Davis',
        customerName: 'Robert Brown',
        date: '2024-12-06 10:30',
        duration: '3:45',
        aiScore: 98,
        humanScore: 96,
        sentiment: 'positive',
        hasIssues: false,
        transcriptExcerpt: 'Perfect, I\'ve processed that for you. Is there anything else I can help with today?',
        criteria: [
            { name: 'Greeting & Verification', aiScore: 100, weight: 15 },
            { name: 'Active Listening', aiScore: 98, weight: 20 },
            { name: 'Problem Resolution', aiScore: 100, weight: 25 },
            { name: 'Compliance', aiScore: 100, weight: 20 },
            { name: 'Professionalism', aiScore: 95, weight: 10 },
            { name: 'Closing', aiScore: 95, weight: 10 }
        ]
    },
    {
        id: 'eval_004',
        callId: 'call_126',
        agentName: 'James Wilson',
        customerName: 'Alice Cooper',
        date: '2024-12-06 11:00',
        duration: '12:20',
        aiScore: 65,
        sentiment: 'negative',
        hasIssues: true,
        transcriptExcerpt: 'I apologize for the confusion. Let me transfer you to our supervisor who can better assist...',
        criteria: [
            { name: 'Greeting & Verification', aiScore: 80, weight: 15 },
            { name: 'Active Listening', aiScore: 55, weight: 20, feedback: 'Customer had to repeat information' },
            { name: 'Problem Resolution', aiScore: 50, weight: 25, feedback: 'Unable to resolve, required escalation' },
            { name: 'Compliance', aiScore: 100, weight: 20 },
            { name: 'Professionalism', aiScore: 65, weight: 10, feedback: 'Showed signs of frustration' },
            { name: 'Closing', aiScore: 60, weight: 10 }
        ]
    }
];

const QA_CRITERIA = [
    { id: 'greeting', name: 'Greeting & Verification', weight: 15, description: 'Proper greeting and customer identity verification' },
    { id: 'listening', name: 'Active Listening', weight: 20, description: 'Listening without interrupting, acknowledging concerns' },
    { id: 'resolution', name: 'Problem Resolution', weight: 25, description: 'Effectively addressing the customer\'s issue' },
    { id: 'compliance', name: 'Compliance', weight: 20, description: 'Following all regulatory and company guidelines' },
    { id: 'professionalism', name: 'Professionalism', weight: 10, description: 'Maintaining professional tone and behavior' },
    { id: 'closing', name: 'Closing', weight: 10, description: 'Proper call wrap-up and next steps' }
];

export default function QualityPage() {
    const [selectedEval, setSelectedEval] = useState<CallEvaluation | null>(null);
    const [activeTab, setActiveTab] = useState<'evaluations' | 'criteria' | 'calibration' | 'coaching'>('evaluations');
    const [isPlaying, setIsPlaying] = useState(false);
    const [filterAgent, setFilterAgent] = useState<string>('all');
    const [filterScore, setFilterScore] = useState<string>('all');

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 75) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 90) return 'bg-green-500/20 border-green-500/30';
        if (score >= 75) return 'bg-yellow-500/20 border-yellow-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <ThumbsUp className="w-4 h-4 text-green-400" />;
            case 'negative': return <ThumbsDown className="w-4 h-4 text-red-400" />;
            default: return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    // Calculate stats
    const avgAIScore = Math.round(EVALUATIONS.reduce((sum, e) => sum + e.aiScore, 0) / EVALUATIONS.length);
    const callsWithIssues = EVALUATIONS.filter(e => e.hasIssues).length;
    const calibratedCalls = EVALUATIONS.filter(e => e.humanScore).length;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-7 h-7 text-yellow-400" />
                        Quality Monitoring
                    </h1>
                    <p className="text-gray-400 mt-1">100% AI-powered call evaluation and quality assurance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                        <RefreshCw className="w-4 h-4" />
                        Sync Scores
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">Average QA Score</span>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(avgAIScore)}`}>{avgAIScore}%</div>
                    <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+3% vs last week</span>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">Calls Evaluated</span>
                    </div>
                    <div className="text-3xl font-bold">{EVALUATIONS.length}</div>
                    <div className="text-sm text-gray-500 mt-1">100% coverage</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-400 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Calls with Issues</span>
                    </div>
                    <div className="text-3xl font-bold text-red-400">{callsWithIssues}</div>
                    <div className="text-sm text-gray-500 mt-1">Require review</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-sm">Calibrated</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">{calibratedCalls}</div>
                    <div className="text-sm text-gray-500 mt-1">AI vs Human aligned</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {(['evaluations', 'criteria', 'calibration', 'coaching'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left - Evaluations List */}
                <div className="col-span-2">
                    {activeTab === 'evaluations' && (
                        <div className="bg-gray-800 rounded-xl">
                            {/* Filters */}
                            <div className="p-4 border-b border-gray-700 flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search calls..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <select
                                    value={filterAgent}
                                    onChange={(e) => setFilterAgent(e.target.value)}
                                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                                >
                                    <option value="all">All Agents</option>
                                    <option value="sarah">Sarah Johnson</option>
                                    <option value="mike">Mike Chen</option>
                                    <option value="emily">Emily Davis</option>
                                </select>
                                <select
                                    value={filterScore}
                                    onChange={(e) => setFilterScore(e.target.value)}
                                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                                >
                                    <option value="all">All Scores</option>
                                    <option value="high">90%+</option>
                                    <option value="medium">75-89%</option>
                                    <option value="low">&lt;75%</option>
                                </select>
                            </div>

                            {/* List */}
                            <div className="divide-y divide-gray-700">
                                {EVALUATIONS.map((evaluation) => (
                                    <button
                                        key={evaluation.id}
                                        onClick={() => setSelectedEval(evaluation)}
                                        className={`w-full p-4 text-left hover:bg-gray-700/50 transition-colors ${selectedEval?.id === evaluation.id ? 'bg-gray-700/50' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${getScoreBg(evaluation.aiScore)} border`}>
                                                    {evaluation.aiScore}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{evaluation.agentName}</div>
                                                    <div className="text-sm text-gray-400">
                                                        {evaluation.customerName} • {evaluation.duration}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {evaluation.hasIssues && (
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                                        Issues
                                                    </span>
                                                )}
                                                {getSentimentIcon(evaluation.sentiment)}
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            "{evaluation.transcriptExcerpt}"
                                        </p>
                                        <div className="text-xs text-gray-500 mt-2">{evaluation.date}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'criteria' && (
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-blue-400" />
                                QA Evaluation Criteria
                            </h3>
                            <div className="space-y-4">
                                {QA_CRITERIA.map((criterion) => (
                                    <div key={criterion.id} className="p-4 bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium">{criterion.name}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-400">Weight:</span>
                                                <input
                                                    type="number"
                                                    value={criterion.weight}
                                                    className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-center text-sm"
                                                    readOnly
                                                />
                                                <span className="text-sm text-gray-400">%</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">{criterion.description}</p>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                                    <span className="font-medium">Total Weight</span>
                                    <span className="text-xl font-bold text-blue-400">
                                        {QA_CRITERIA.reduce((sum, c) => sum + c.weight, 0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'calibration' && (
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-400" />
                                AI vs Human Calibration
                            </h3>
                            <div className="space-y-4">
                                {EVALUATIONS.filter(e => e.humanScore).map((evaluation) => (
                                    <div key={evaluation.id} className="p-4 bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="font-medium">{evaluation.agentName}</div>
                                                <div className="text-sm text-gray-400">{evaluation.date}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-400 mb-1">AI Score</div>
                                                    <div className={`text-lg font-bold ${getScoreColor(evaluation.aiScore)}`}>
                                                        {evaluation.aiScore}%
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-400 mb-1">Human Score</div>
                                                    <div className={`text-lg font-bold ${getScoreColor(evaluation.humanScore!)}`}>
                                                        {evaluation.humanScore}%
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-400 mb-1">Variance</div>
                                                    <div className={`text-lg font-bold ${Math.abs(evaluation.aiScore - evaluation.humanScore!) <= 5
                                                            ? 'text-green-400'
                                                            : 'text-yellow-400'
                                                        }`}>
                                                        {Math.abs(evaluation.aiScore - evaluation.humanScore!)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                                style={{ width: `${100 - Math.abs(evaluation.aiScore - evaluation.humanScore!) * 5}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'coaching' && (
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-green-400" />
                                Auto-Coaching Triggers
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                            <span className="font-medium">Score Below 70%</span>
                                        </div>
                                        <span className="text-sm text-gray-400">Immediate Review</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Agent receives coaching notification and supervisor is alerted</p>
                                </div>
                                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4 text-yellow-400" />
                                            <span className="font-medium">3+ Consecutive Low Scores</span>
                                        </div>
                                        <span className="text-sm text-gray-400">Training Assignment</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Automatic enrollment in targeted training modules</p>
                                </div>
                                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-green-400" />
                                            <span className="font-medium">Score Above 95%</span>
                                        </div>
                                        <span className="text-sm text-gray-400">Recognition</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Agent receives achievement badge and leaderboard points</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right - Detail Panel */}
                <div className="col-span-1">
                    {selectedEval ? (
                        <div className="bg-gray-800 rounded-xl p-4 sticky top-6">
                            {/* Audio Player */}
                            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center"
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-1 bg-gray-600 rounded-full">
                                            <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>1:45</span>
                                            <span>{selectedEval.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Volume2 className="w-4 h-4" />
                                    <span>Call Recording</span>
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <h4 className="font-medium mb-3">Score Breakdown</h4>
                            <div className="space-y-3">
                                {selectedEval.criteria.map((criterion, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-400">{criterion.name}</span>
                                            <span className={getScoreColor(criterion.aiScore)}>{criterion.aiScore}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${criterion.aiScore >= 90 ? 'bg-green-500' :
                                                        criterion.aiScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${criterion.aiScore}%` }}
                                            />
                                        </div>
                                        {criterion.feedback && (
                                            <p className="text-xs text-yellow-400 mt-1">⚠️ {criterion.feedback}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                                <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">
                                    Add Human Evaluation
                                </button>
                                <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium">
                                    View Full Transcript
                                </button>
                                <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium">
                                    Assign Coaching
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800 rounded-xl p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500">Select a call to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
