'use client';

/**
 * Admin Real-Time Utilization Monitor
 * Live dashboard for agent seat usage and system metrics
 */

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Users,
    Phone,
    Clock,
    TrendingUp,
    TrendingDown,
    Zap,
    AlertCircle,
    CheckCircle,
    XCircle,
    Pause,
    Play,
    RefreshCw
} from 'lucide-react';

interface AgentStatus {
    id: string;
    name: string;
    status: 'active' | 'idle' | 'away' | 'offline';
    currentCall: string | null;
    callDuration: number;
    handledToday: number;
    avgHandleTime: number;
    sentiment: number;
}

interface SystemMetrics {
    activeCalls: number;
    totalAgents: number;
    activeAgents: number;
    queueLength: number;
    avgWaitTime: number;
    aiResolutionRate: number;
    handoffRate: number;
    cpuUsage: number;
    memoryUsage: number;
}

export default function AdminUtilizationPage() {
    const [metrics, setMetrics] = useState<SystemMetrics>({
        activeCalls: 0,
        totalAgents: 0,
        activeAgents: 0,
        queueLength: 0,
        avgWaitTime: 0,
        aiResolutionRate: 0,
        handoffRate: 0,
        cpuUsage: 0,
        memoryUsage: 0,
    });
    const [agents, setAgents] = useState<AgentStatus[]>([]);
    const [isLive, setIsLive] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Simulate real-time updates
    useEffect(() => {
        const updateData = () => {
            // Simulate metrics
            setMetrics({
                activeCalls: Math.floor(Math.random() * 30) + 15,
                totalAgents: 24,
                activeAgents: Math.floor(Math.random() * 10) + 12,
                queueLength: Math.floor(Math.random() * 8),
                avgWaitTime: Math.floor(Math.random() * 60) + 15,
                aiResolutionRate: Math.floor(Math.random() * 15) + 75,
                handoffRate: Math.floor(Math.random() * 10) + 15,
                cpuUsage: Math.floor(Math.random() * 30) + 40,
                memoryUsage: Math.floor(Math.random() * 20) + 55,
            });

            // Simulate agent statuses
            const agentNames = [
                'Sarah Johnson', 'Mike Chen', 'Priya Patel', 'James Wilson',
                'Emily Davis', 'Carlos Rodriguez', 'Aisha Ahmed', 'Tom Brown'
            ];
            setAgents(agentNames.map((name, i) => ({
                id: `agent-${i}`,
                name,
                status: ['active', 'active', 'active', 'idle', 'away', 'active', 'idle', 'offline'][i] as any,
                currentCall: ['active', 'active'].includes(['active', 'active', 'active', 'idle', 'away', 'active', 'idle', 'offline'][i])
                    ? `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`
                    : null,
                callDuration: Math.floor(Math.random() * 300),
                handledToday: Math.floor(Math.random() * 20) + 5,
                avgHandleTime: Math.floor(Math.random() * 120) + 180,
                sentiment: Math.random() * 0.5 + 0.4,
            })));

            setLastUpdate(new Date());
        };

        updateData();

        if (isLive) {
            const interval = setInterval(updateData, 5000);
            return () => clearInterval(interval);
        }
    }, [isLive]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'idle': return 'bg-yellow-500';
            case 'away': return 'bg-orange-500';
            case 'offline': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <Activity className="w-7 h-7 text-green-400" />
                                Real-Time Utilization
                            </h1>
                            <p className="text-gray-400 mt-1">Live monitoring of agent activity and system performance</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-400">
                                Last updated: {lastUpdate.toLocaleTimeString()}
                            </div>
                            <button
                                onClick={() => setIsLive(!isLive)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isLive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700 text-gray-400'
                                    }`}
                            >
                                {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isLive ? 'Live' : 'Paused'}
                            </button>
                            <button
                                onClick={() => setLastUpdate(new Date())}
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <MetricCard
                        label="Active Calls"
                        value={metrics.activeCalls}
                        icon={Phone}
                        color="blue"
                        trend={3}
                    />
                    <MetricCard
                        label="Active Agents"
                        value={`${metrics.activeAgents}/${metrics.totalAgents}`}
                        icon={Users}
                        color="green"
                    />
                    <MetricCard
                        label="Queue Length"
                        value={metrics.queueLength}
                        icon={Clock}
                        color={metrics.queueLength > 5 ? 'red' : 'yellow'}
                        alert={metrics.queueLength > 5}
                    />
                    <MetricCard
                        label="AI Resolution"
                        value={`${metrics.aiResolutionRate}%`}
                        icon={Zap}
                        color="purple"
                        trend={2}
                    />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Agent Status Table */}
                    <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                            <h3 className="font-medium flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                Agent Status
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Active ({agents.filter(a => a.status === 'active').length})
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Idle ({agents.filter(a => a.status === 'idle').length})
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50 text-xs text-gray-400">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Agent</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Current Call</th>
                                        <th className="px-4 py-2 text-left">Duration</th>
                                        <th className="px-4 py-2 text-left">Handled</th>
                                        <th className="px-4 py-2 text-left">Avg Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {agents.map(agent => (
                                        <tr key={agent.id} className="hover:bg-gray-700/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-medium">
                                                        {agent.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span className="text-sm">{agent.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs capitalize ${getStatusColor(agent.status)}`}>
                                                    {agent.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-300">
                                                {agent.currentCall || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-300">
                                                {agent.currentCall ? formatTime(agent.callDuration) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium">
                                                {agent.handledToday}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-300">
                                                {formatTime(agent.avgHandleTime)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* System Health */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                            <h3 className="font-medium mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-green-400" />
                                System Health
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">CPU Usage</span>
                                        <span className={metrics.cpuUsage > 80 ? 'text-red-400' : 'text-green-400'}>
                                            {metrics.cpuUsage}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${metrics.cpuUsage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${metrics.cpuUsage}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Memory</span>
                                        <span className={metrics.memoryUsage > 85 ? 'text-red-400' : 'text-blue-400'}>
                                            {metrics.memoryUsage}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${metrics.memoryUsage > 85 ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${metrics.memoryUsage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                            <h3 className="font-medium mb-4">Today's Performance</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Avg Wait Time</span>
                                    <span className="font-medium">{formatTime(metrics.avgWaitTime)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Handoff Rate</span>
                                    <span className="font-medium">{metrics.handoffRate}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">AI Resolution</span>
                                    <span className="font-medium text-green-400">{metrics.aiResolutionRate}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Alerts */}
                        {metrics.queueLength > 5 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-red-400">High Queue Alert</div>
                                        <p queueLength="text-sm text-gray-300">
                                            Queue has {metrics.queueLength} customers waiting. Consider adding agents.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Metric Card Component
function MetricCard({
    label,
    value,
    icon: Icon,
    color,
    trend,
    alert
}: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: number;
    alert?: boolean;
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/20 text-blue-400',
        green: 'bg-green-500/20 text-green-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        red: 'bg-red-500/20 text-red-400',
        purple: 'bg-purple-500/20 text-purple-400',
    };

    return (
        <div className={`bg-gray-800 rounded-xl p-4 border ${alert ? 'border-red-500 animate-pulse' : 'border-gray-700'}`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
        </div>
    );
}
