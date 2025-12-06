'use client';

/**
 * Enhanced BPO KPI Dashboard
 * Enterprise metrics with AHT, ACW, FCR, CSAT, NPS, and financial KPIs
 */

import React, { useState } from 'react';
import BPOLayout from '@/components/layout/bpo-layout';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Clock,
    Phone,
    Users,
    Star,
    Target as DollarSign,
    Target,
    BarChart3 as Percent,
    TrendingUp as ArrowUpRight,
    TrendingDown as ArrowDownRight,
    Calendar,
    Download,
    RefreshCw,
    Activity,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Headphones,
    Clock as Timer,
    CheckCircle as ThumbsUp
} from 'lucide-react';

// Types
interface KPIMetric {
    name: string;
    value: string | number;
    unit?: string;
    change: number;
    changeType: 'positive' | 'negative' | 'neutral';
    target?: number;
    trend: number[];
}

interface AgentKPI {
    name: string;
    avatar: string;
    calls: number;
    aht: string;
    fcr: number;
    csat: number;
    adherence: number;
    utilization: number;
}

// Mock Data
const EFFICIENCY_KPIS: KPIMetric[] = [
    { name: 'Average Handle Time', value: '4:32', change: -8, changeType: 'positive', target: 300, trend: [280, 290, 285, 275, 272] },
    { name: 'After Call Work', value: '0:45', change: -12, changeType: 'positive', target: 60, trend: [55, 52, 48, 46, 45] },
    { name: 'Occupancy Rate', value: 78, unit: '%', change: 5, changeType: 'positive', target: 80, trend: [72, 74, 76, 77, 78] },
    { name: 'Utilization', value: 85, unit: '%', change: 3, changeType: 'positive', target: 85, trend: [80, 82, 83, 84, 85] }
];

const QUALITY_KPIS: KPIMetric[] = [
    { name: 'First Call Resolution', value: 72, unit: '%', change: 4, changeType: 'positive', target: 75, trend: [68, 69, 70, 71, 72] },
    { name: 'CSAT Score', value: 4.2, change: 0.3, changeType: 'positive', target: 4.5, trend: [3.9, 4.0, 4.1, 4.1, 4.2] },
    { name: 'NPS', value: 45, change: 8, changeType: 'positive', target: 50, trend: [35, 38, 40, 43, 45] },
    { name: 'QA Score', value: 88, unit: '%', change: 2, changeType: 'positive', target: 90, trend: [84, 85, 86, 87, 88] }
];

const SERVICE_KPIS: KPIMetric[] = [
    { name: 'Service Level', value: 82, unit: '%', change: -2, changeType: 'negative', target: 85, trend: [84, 83, 84, 83, 82] },
    { name: 'Abandon Rate', value: 4.5, unit: '%', change: 0.5, changeType: 'negative', target: 3, trend: [3.8, 4.0, 4.2, 4.3, 4.5] },
    { name: 'ASA (seconds)', value: 28, change: 3, changeType: 'negative', target: 25, trend: [25, 26, 27, 27, 28] },
    { name: 'Queue Wait', value: '0:35', change: 5, changeType: 'negative', target: 30, trend: [30, 32, 33, 34, 35] }
];

const FINANCIAL_KPIS: KPIMetric[] = [
    { name: 'Cost per Call', value: 4.25, unit: '$', change: -0.15, changeType: 'positive', target: 4.00, trend: [4.50, 4.40, 4.35, 4.30, 4.25] },
    { name: 'Revenue per Call', value: 12.50, unit: '$', change: 0.75, changeType: 'positive', target: 15.00, trend: [11.00, 11.50, 12.00, 12.25, 12.50] },
    { name: 'Collection Rate', value: 68, unit: '%', change: 3, changeType: 'positive', target: 70, trend: [62, 64, 65, 67, 68] },
    { name: 'Promise to Pay', value: 245, change: 15, changeType: 'positive', trend: [210, 220, 230, 240, 245] }
];

const AGENT_KPIS: AgentKPI[] = [
    { name: 'Sarah Johnson', avatar: 'SJ', calls: 145, aht: '4:15', fcr: 78, csat: 4.5, adherence: 96, utilization: 88 },
    { name: 'Mike Chen', avatar: 'MC', calls: 132, aht: '4:45', fcr: 72, csat: 4.2, adherence: 92, utilization: 85 },
    { name: 'Emily Davis', avatar: 'ED', calls: 128, aht: '3:58', fcr: 81, csat: 4.6, adherence: 98, utilization: 90 },
    { name: 'James Wilson', avatar: 'JW', calls: 110, aht: '5:12', fcr: 65, csat: 3.9, adherence: 88, utilization: 82 },
    { name: 'Lisa Brown', avatar: 'LB', calls: 138, aht: '4:22', fcr: 75, csat: 4.3, adherence: 94, utilization: 87 }
];

export default function KPIDashboardPage() {
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
    const [clientFilter, setClientFilter] = useState<string>('all');

    const renderKPICard = (kpi: KPIMetric, icon: React.ReactNode, iconColor: string) => {
        const isPositive = kpi.changeType === 'positive';
        const isNegative = kpi.changeType === 'negative';

        return (
            <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${iconColor}`}>
                        {icon}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
                        }`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : isNegative ? <ArrowDownRight className="w-4 h-4" /> : null}
                        {Math.abs(kpi.change)}{kpi.unit === '%' ? 'pts' : kpi.unit || '%'}
                    </div>
                </div>
                <div className="mb-1">
                    <span className="text-2xl font-bold">
                        {kpi.unit === '$' ? '$' : ''}{kpi.value}{kpi.unit && kpi.unit !== '$' ? kpi.unit : ''}
                    </span>
                </div>
                <div className="text-sm text-gray-400">{kpi.name}</div>
                {kpi.target && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Target: {kpi.unit === '$' ? '$' : ''}{kpi.target}{kpi.unit && kpi.unit !== '$' ? kpi.unit : ''}</span>
                            <span>{Math.round((Number(String(kpi.value).replace(':', '.')) / kpi.target) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${kpi.changeType === 'positive' ? 'bg-green-500' :
                                    kpi.changeType === 'negative' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${Math.min(100, (Number(String(kpi.value).replace(':', '.')) / kpi.target) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <BPOLayout title="KPI Dashboard" subtitle="Enterprise performance metrics">
            <div className="h-full bg-gray-900 text-white p-6 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-7 h-7 text-blue-400" />
                            BPO KPI Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Enterprise performance metrics and analytics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                        >
                            <option value="all">All Clients</option>
                            <option value="acme">ACME Corp</option>
                            <option value="global">Global Finance</option>
                        </select>
                        <div className="flex rounded-lg overflow-hidden border border-gray-700">
                            {(['today', 'week', 'month'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 text-sm capitalize ${timeRange === range
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Quick Summary */}
                <div className="grid grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-blue-200 mb-1">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">Total Calls</span>
                        </div>
                        <div className="text-3xl font-bold">2,847</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-200 mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Resolved</span>
                        </div>
                        <div className="text-3xl font-bold">2,052</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-yellow-200 mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm">Escalated</span>
                        </div>
                        <div className="text-3xl font-bold">342</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-200 mb-1">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">Abandoned</span>
                        </div>
                        <div className="text-3xl font-bold">128</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-purple-200 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Active Agents</span>
                        </div>
                        <div className="text-3xl font-bold">24</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-indigo-200 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm">Revenue</span>
                        </div>
                        <div className="text-3xl font-bold">$35.6K</div>
                    </div>
                </div>

                {/* KPI Sections */}
                <div className="space-y-6">
                    {/* Efficiency KPIs */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Timer className="w-5 h-5 text-blue-400" />
                            Efficiency Metrics
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            {EFFICIENCY_KPIS.map((kpi, i) => (
                                <div key={i}>
                                    {renderKPICard(kpi, <Clock className="w-5 h-5 text-blue-400" />, 'bg-blue-500/20')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quality KPIs */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            Quality Metrics
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            {QUALITY_KPIS.map((kpi, i) => (
                                <div key={i}>
                                    {renderKPICard(kpi, <ThumbsUp className="w-5 h-5 text-yellow-400" />, 'bg-yellow-500/20')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Service Level KPIs */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-400" />
                            Service Level Metrics
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            {SERVICE_KPIS.map((kpi, i) => (
                                <div key={i}>
                                    {renderKPICard(kpi, <Headphones className="w-5 h-5 text-purple-400" />, 'bg-purple-500/20')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Financial KPIs */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            Financial Metrics
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            {FINANCIAL_KPIS.map((kpi, i) => (
                                <div key={i}>
                                    {renderKPICard(kpi, <DollarSign className="w-5 h-5 text-green-400" />, 'bg-green-500/20')}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Agent Performance Table */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Agent Performance
                    </h2>
                    <div className="bg-gray-800 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-300">Agent</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">Calls</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">AHT</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">FCR</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">CSAT</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">Adherence</th>
                                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-300">Utilization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {AGENT_KPIS.map((agent, i) => (
                                    <tr key={i} className="hover:bg-gray-700/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium">
                                                    {agent.avatar}
                                                </div>
                                                <span className="font-medium">{agent.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-center px-4 py-3 font-medium">{agent.calls}</td>
                                        <td className="text-center px-4 py-3 font-mono text-sm">{agent.aht}</td>
                                        <td className="text-center px-4 py-3">
                                            <span className={agent.fcr >= 75 ? 'text-green-400' : agent.fcr >= 65 ? 'text-yellow-400' : 'text-red-400'}>
                                                {agent.fcr}%
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3">
                                            <span className={agent.csat >= 4.3 ? 'text-green-400' : agent.csat >= 3.8 ? 'text-yellow-400' : 'text-red-400'}>
                                                {agent.csat}
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3">
                                            <span className={agent.adherence >= 95 ? 'text-green-400' : agent.adherence >= 90 ? 'text-yellow-400' : 'text-red-400'}>
                                                {agent.adherence}%
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${agent.utilization >= 85 ? 'bg-green-500' :
                                                            agent.utilization >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${agent.utilization}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm">{agent.utilization}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </BPOLayout>
    );
}
