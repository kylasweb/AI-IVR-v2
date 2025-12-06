'use client';

/**
 * BPO Dashboard
 * Central hub for BPO operations with real-time stats
 */

import React, { useState, useEffect } from 'react';
import BPOLayout from '@/components/layout/bpo-layout';
import {
    Phone,
    PhoneIncoming,
    PhoneOff,
    Users,
    Clock,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Activity,
    Target,
    DollarSign,
    BarChart3,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Play
} from 'lucide-react';

interface QueueStats {
    name: string;
    waiting: number;
    inProgress: number;
    avgWait: string;
    sla: number;
    color: string;
}

interface AgentSummary {
    available: number;
    onCall: number;
    onBreak: number;
    offline: number;
}

export default function BPODashboardPage() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Mock real-time stats
    const queues: QueueStats[] = [
        { name: 'Collections', waiting: 12, inProgress: 8, avgWait: '1:45', sla: 78, color: 'blue' },
        { name: 'Support', waiting: 5, inProgress: 15, avgWait: '0:32', sla: 92, color: 'green' },
        { name: 'Sales', waiting: 3, inProgress: 6, avgWait: '0:18', sla: 95, color: 'purple' },
        { name: 'Billing', waiting: 8, inProgress: 4, avgWait: '2:15', sla: 65, color: 'orange' }
    ];

    const agents: AgentSummary = {
        available: 12,
        onCall: 24,
        onBreak: 6,
        offline: 3
    };

    const totalAgents = agents.available + agents.onCall + agents.onBreak + agents.offline;
    const totalWaiting = queues.reduce((sum, q) => sum + q.waiting, 0);
    const avgSLA = Math.round(queues.reduce((sum, q) => sum + q.sla, 0) / queues.length);

    return (
        <BPOLayout title="Dashboard" subtitle="Real-time operations overview">
            <div className="p-6 space-y-6">
                {/* Top Stats */}
                <div className="grid grid-cols-6 gap-4">
                    {/* Waiting Calls */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <PhoneIncoming className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-yellow-400 font-medium">WAITING</span>
                        </div>
                        <div className="text-3xl font-bold text-yellow-400">{totalWaiting}</div>
                        <div className="text-sm text-gray-400">calls in queue</div>
                    </div>

                    {/* Active Calls */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Phone className="w-5 h-5 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">ACTIVE</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400">{queues.reduce((sum, q) => sum + q.inProgress, 0)}</div>
                        <div className="text-sm text-gray-400">calls in progress</div>
                    </div>

                    {/* Agents */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            <span className="text-xs text-blue-400 font-medium">AGENTS</span>
                        </div>
                        <div className="text-3xl font-bold">{totalAgents}</div>
                        <div className="text-sm text-gray-400">{agents.available} available</div>
                    </div>

                    {/* SLA */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-5 h-5 text-purple-400" />
                            <span className="text-xs text-gray-400">TARGET: 85%</span>
                        </div>
                        <div className={`text-3xl font-bold ${avgSLA >= 85 ? 'text-green-400' : avgSLA >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {avgSLA}%
                        </div>
                        <div className="text-sm text-gray-400">service level</div>
                    </div>

                    {/* Calls Today */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            <div className="flex items-center text-green-400 text-xs">
                                <ArrowUpRight className="w-3 h-3" />
                                +12%
                            </div>
                        </div>
                        <div className="text-3xl font-bold">1,247</div>
                        <div className="text-sm text-gray-400">calls today</div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            <div className="flex items-center text-green-400 text-xs">
                                <ArrowUpRight className="w-3 h-3" />
                                +8%
                            </div>
                        </div>
                        <div className="text-3xl font-bold">$24.5K</div>
                        <div className="text-sm text-gray-400">collected today</div>
                    </div>
                </div>

                {/* Queue Cards */}
                <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Queue Status
                    </h2>
                    <div className="grid grid-cols-4 gap-4">
                        {queues.map((queue) => (
                            <div key={queue.name} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium">{queue.name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${queue.sla >= 85 ? 'bg-green-500/20 text-green-400' :
                                            queue.sla >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {queue.sla}% SLA
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-gray-400">Waiting</div>
                                        <div className="text-xl font-bold text-yellow-400">{queue.waiting}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Active</div>
                                        <div className="text-xl font-bold text-green-400">{queue.inProgress}</div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Avg Wait</span>
                                    <span className="font-mono">{queue.avgWait}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Agent Status Breakdown */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            Agent Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                                    <span>Available</span>
                                </div>
                                <span className="font-bold">{agents.available}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                                    <span>On Call</span>
                                </div>
                                <span className="font-bold">{agents.onCall}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                                    <span>On Break</span>
                                </div>
                                <span className="font-bold">{agents.onBreak}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                                    <span>Offline</span>
                                </div>
                                <span className="font-bold">{agents.offline}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Take Call
                            </button>
                            <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Start Outbound
                            </button>
                            <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                View Agents
                            </button>
                            <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Reports
                            </button>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            Active Alerts
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    High wait time in Billing
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Average wait exceeds 2 minutes</p>
                            </div>
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                                    <Clock className="w-4 h-4" />
                                    Break limit exceeded
                                </div>
                                <p className="text-xs text-gray-400 mt-1">2 agents over scheduled break time</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Time */}
                <div className="text-center text-sm text-gray-500">
                    Last updated: {currentTime.toLocaleTimeString()}
                </div>
            </div>
        </BPOLayout>
    );
}
