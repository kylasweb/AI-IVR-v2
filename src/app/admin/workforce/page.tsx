'use client';

/**
 * Workforce Management Dashboard
 * Forecasting, scheduling, and real-time adherence monitoring
 */

import React, { useState, useEffect } from 'react';
import BPOLayout from '@/components/layout/bpo-layout';
import {
    Users,
    Clock,
    Calendar,
    TrendingUp,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    Phone,
    PhoneOff,
    Clock as Coffee,
    LogOut,
    RefreshCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Zap,
    Target,
    Activity
} from 'lucide-react';

// Types
interface AgentStatus {
    id: string;
    name: string;
    status: 'available' | 'on_call' | 'break' | 'acw' | 'offline' | 'training';
    scheduledStatus: 'available' | 'break' | 'offline';
    adherence: number;
    callsToday: number;
    avgHandleTime: string;
    loginTime: string;
    skill: string;
}

interface ForecastInterval {
    time: string;
    predicted: number;
    actual?: number;
    scheduled: number;
    required: number;
}

interface ScheduleShift {
    agentId: string;
    agentName: string;
    startTime: string;
    endTime: string;
    breaks: Array<{ start: string; end: string }>;
    skill: string;
}

// Mock Data
const AGENTS: AgentStatus[] = [
    { id: '1', name: 'Sarah Johnson', status: 'on_call', scheduledStatus: 'available', adherence: 95, callsToday: 23, avgHandleTime: '4:32', loginTime: '09:00', skill: 'Collections' },
    { id: '2', name: 'Mike Chen', status: 'available', scheduledStatus: 'available', adherence: 100, callsToday: 18, avgHandleTime: '3:45', loginTime: '08:30', skill: 'Support' },
    { id: '3', name: 'Emily Davis', status: 'break', scheduledStatus: 'break', adherence: 100, callsToday: 15, avgHandleTime: '5:12', loginTime: '09:30', skill: 'Collections' },
    { id: '4', name: 'James Wilson', status: 'acw', scheduledStatus: 'available', adherence: 88, callsToday: 20, avgHandleTime: '4:00', loginTime: '08:00', skill: 'Sales' },
    { id: '5', name: 'Lisa Brown', status: 'on_call', scheduledStatus: 'available', adherence: 92, callsToday: 21, avgHandleTime: '4:15', loginTime: '09:00', skill: 'Collections' },
    { id: '6', name: 'David Lee', status: 'offline', scheduledStatus: 'available', adherence: 45, callsToday: 0, avgHandleTime: '0:00', loginTime: '--:--', skill: 'Support' },
];

const FORECAST: ForecastInterval[] = [
    { time: '08:00', predicted: 45, actual: 42, scheduled: 8, required: 7 },
    { time: '08:30', predicted: 52, actual: 55, scheduled: 8, required: 8 },
    { time: '09:00', predicted: 68, actual: 71, scheduled: 10, required: 10 },
    { time: '09:30', predicted: 75, actual: 72, scheduled: 10, required: 11 },
    { time: '10:00', predicted: 82, actual: 85, scheduled: 12, required: 12 },
    { time: '10:30', predicted: 78, scheduled: 12, required: 11 },
    { time: '11:00', predicted: 85, scheduled: 12, required: 12 },
    { time: '11:30', predicted: 90, scheduled: 14, required: 13 },
    { time: '12:00', predicted: 65, scheduled: 10, required: 9 },
    { time: '12:30', predicted: 58, scheduled: 10, required: 8 },
    { time: '13:00', predicted: 72, scheduled: 10, required: 10 },
    { time: '13:30', predicted: 80, scheduled: 12, required: 11 },
    { time: '14:00', predicted: 88, scheduled: 14, required: 13 },
];

export default function WorkforcePage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'realtime' | 'forecast' | 'schedule'>('realtime');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-500';
            case 'on_call': return 'bg-blue-500';
            case 'break': return 'bg-yellow-500';
            case 'acw': return 'bg-purple-500';
            case 'training': return 'bg-indigo-500';
            case 'offline': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available': return 'Available';
            case 'on_call': return 'On Call';
            case 'break': return 'Break';
            case 'acw': return 'Wrap-Up';
            case 'training': return 'Training';
            case 'offline': return 'Offline';
            default: return status;
        }
    };

    const getAdherenceColor = (adherence: number) => {
        if (adherence >= 95) return 'text-green-400';
        if (adherence >= 85) return 'text-yellow-400';
        return 'text-red-400';
    };

    // Summary Stats
    const availableAgents = AGENTS.filter(a => a.status === 'available').length;
    const onCallAgents = AGENTS.filter(a => a.status === 'on_call').length;
    const breakAgents = AGENTS.filter(a => a.status === 'break').length;
    const offlineAgents = AGENTS.filter(a => a.status === 'offline').length;
    const avgAdherence = Math.round(AGENTS.reduce((sum, a) => sum + a.adherence, 0) / AGENTS.length);

    return (
        <BPOLayout title="Workforce Management" subtitle="Forecasting, scheduling, and adherence">
            <div className="h-full bg-gray-900 text-white p-6 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Users className="w-7 h-7 text-blue-400" />
                            Workforce Management
                        </h1>
                        <p className="text-gray-400 mt-1">Real-time monitoring, forecasting, and scheduling</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className={`p-2 bg-gray-800 rounded-lg hover:bg-gray-700 ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Total Agents</span>
                        </div>
                        <div className="text-3xl font-bold">{AGENTS.length}</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Available</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400">{availableAgents}</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">On Call</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-400">{onCallAgents}</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-yellow-400 mb-1">
                            <Coffee className="w-4 h-4" />
                            <span className="text-sm">On Break</span>
                        </div>
                        <div className="text-3xl font-bold text-yellow-400">{breakAgents}</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Target className="w-4 h-4" />
                            <span className="text-sm">Avg Adherence</span>
                        </div>
                        <div className={`text-3xl font-bold ${getAdherenceColor(avgAdherence)}`}>{avgAdherence}%</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['realtime', 'forecast', 'schedule'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab === 'realtime' ? 'Real-Time Status' : tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'realtime' && (
                    <div className="bg-gray-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-300">Agent</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-300">Status</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-300">Scheduled</th>
                                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">Adherence</th>
                                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">Calls</th>
                                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">AHT</th>
                                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">Login</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-300">Skill</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {AGENTS.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-gray-700/30">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-medium">
                                                        {agent.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span className="font-medium">{agent.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                                                    {getStatusLabel(agent.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-600`}>
                                                    {getStatusLabel(agent.scheduledStatus)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-medium ${getAdherenceColor(agent.adherence)}`}>
                                                    {agent.adherence}%
                                                </span>
                                                {agent.status !== agent.scheduledStatus && (
                                                    <AlertTriangle className="w-3 h-3 text-yellow-400 inline ml-1" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium">{agent.callsToday}</td>
                                            <td className="px-4 py-3 text-center font-mono text-sm">{agent.avgHandleTime}</td>
                                            <td className="px-4 py-3 text-center font-mono text-sm">{agent.loginTime}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-gray-700 rounded text-xs">{agent.skill}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'forecast' && (
                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Call Volume Forecast vs Staffing
                            </h3>
                            <div className="flex items-center gap-2">
                                <button className="p-1 hover:bg-gray-700 rounded">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-medium">Today</span>
                                <button className="p-1 hover:bg-gray-700 rounded">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Forecast Chart */}
                        <div className="h-64 flex items-end gap-2 mb-4">
                            {FORECAST.map((interval, i) => {
                                const maxValue = Math.max(...FORECAST.map(f => f.predicted));
                                const height = (interval.predicted / maxValue) * 100;
                                const actualHeight = interval.actual ? (interval.actual / maxValue) * 100 : 0;

                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="relative w-full h-48 flex items-end justify-center gap-1">
                                            <div
                                                className="w-4 bg-blue-500/30 rounded-t absolute left-1/2 -translate-x-4"
                                                style={{ height: `${height}%` }}
                                            />
                                            {interval.actual && (
                                                <div
                                                    className="w-4 bg-green-500 rounded-t absolute left-1/2"
                                                    style={{ height: `${actualHeight}%` }}
                                                />
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">{interval.time}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-blue-500/30" />
                                <span className="text-gray-400">Forecast</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-green-500" />
                                <span className="text-gray-400">Actual</span>
                            </div>
                        </div>

                        {/* Staffing Table */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400">
                                        <th className="text-left py-2">Interval</th>
                                        {FORECAST.slice(0, 8).map((f, i) => (
                                            <th key={i} className="text-center py-2">{f.time}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2 text-gray-400">Predicted Calls</td>
                                        {FORECAST.slice(0, 8).map((f, i) => (
                                            <td key={i} className="text-center py-2">{f.predicted}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-400">Required Agents</td>
                                        {FORECAST.slice(0, 8).map((f, i) => (
                                            <td key={i} className="text-center py-2">{f.required}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-400">Scheduled</td>
                                        {FORECAST.slice(0, 8).map((f, i) => (
                                            <td key={i} className={`text-center py-2 font-medium ${f.scheduled >= f.required ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {f.scheduled}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                Agent Schedule
                            </h3>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium">
                                <Zap className="w-4 h-4" />
                                Auto-Generate Schedule
                            </button>
                        </div>

                        {/* Timeline View */}
                        <div className="relative">
                            {/* Time Headers */}
                            <div className="flex mb-2 ml-32">
                                {['08', '09', '10', '11', '12', '13', '14', '15', '16', '17'].map((hour) => (
                                    <div key={hour} className="flex-1 text-xs text-gray-400 text-center">
                                        {hour}:00
                                    </div>
                                ))}
                            </div>

                            {/* Agent Rows */}
                            <div className="space-y-2">
                                {AGENTS.slice(0, 5).map((agent) => (
                                    <div key={agent.id} className="flex items-center">
                                        <div className="w-32 text-sm truncate">{agent.name}</div>
                                        <div className="flex-1 h-8 bg-gray-700/30 rounded relative">
                                            {/* Shift bar */}
                                            <div
                                                className="absolute h-full bg-blue-500/50 rounded"
                                                style={{ left: '10%', width: '80%' }}
                                            />
                                            {/* Break */}
                                            <div
                                                className="absolute h-full bg-yellow-500/50 rounded"
                                                style={{ left: '40%', width: '10%' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-6 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-blue-500/50" />
                                    <span className="text-gray-400">Scheduled</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-yellow-500/50" />
                                    <span className="text-gray-400">Break</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BPOLayout>
    );
}
