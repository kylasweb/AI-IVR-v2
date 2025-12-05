'use client';

/**
 * BPO Management Dashboard
 * Multi-tenancy client management interface
 */

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Building2,
    Phone,
    Settings,
    MoreVertical,
    Users,
    Activity,
    TrendingUp,
    ChevronRight,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    Layers,
    Link
} from 'lucide-react';

interface BPOClient {
    id: string;
    clientName: string;
    phoneNumbers: string[];
    crmType: string | null;
    isActive: boolean;
    createdAt: string;
    workflowCount: number;
    callCount: number;
    workflows: Array<{ id: string; name: string; isDefault: boolean }>;
}

export default function BPOManagementPage() {
    const [clients, setClients] = useState<BPOClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<BPOClient | null>(null);

    // Fetch clients
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/v1/bpo/clients');
            const result = await response.json();
            if (result.success) {
                setClients(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            // Set mock data for demo
            setClients([
                {
                    id: 'client-1',
                    clientName: 'First National Bank',
                    phoneNumbers: ['+1-800-555-0100', '+1-800-555-0101'],
                    crmType: 'salesforce',
                    isActive: true,
                    createdAt: '2025-11-01T00:00:00Z',
                    workflowCount: 3,
                    callCount: 12500,
                    workflows: [
                        { id: 'wf-1', name: 'Banking Support Triage', isDefault: true },
                        { id: 'wf-2', name: 'Card Services', isDefault: false },
                    ],
                },
                {
                    id: 'client-2',
                    clientName: 'TechMart Retail',
                    phoneNumbers: ['+1-888-555-0200'],
                    crmType: 'hubspot',
                    isActive: true,
                    createdAt: '2025-11-15T00:00:00Z',
                    workflowCount: 2,
                    callCount: 8300,
                    workflows: [
                        { id: 'wf-3', name: 'Order Status', isDefault: true },
                    ],
                },
                {
                    id: 'client-3',
                    clientName: 'HealthCare Plus',
                    phoneNumbers: ['+1-877-555-0300', '+1-877-555-0301', '+1-877-555-0302'],
                    crmType: null,
                    isActive: false,
                    createdAt: '2025-10-20T00:00:00Z',
                    workflowCount: 1,
                    callCount: 4200,
                    workflows: [],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Filter clients
    const filteredClients = clients.filter(client =>
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const stats = {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.isActive).length,
        totalCalls: clients.reduce((sum, c) => sum + c.callCount, 0),
        avgCallsPerClient: Math.round(clients.reduce((sum, c) => sum + c.callCount, 0) / clients.length) || 0,
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <Building2 className="w-7 h-7 text-blue-400" />
                                BPO Client Management
                            </h1>
                            <p className="text-gray-400 mt-1">Manage your client sub-accounts and integrations</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Client
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.totalClients}</div>
                                <div className="text-gray-400 text-sm">Total Clients</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.activeClients}</div>
                                <div className="text-gray-400 text-sm">Active</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Phone className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</div>
                                <div className="text-gray-400 text-sm">Total Calls</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.avgCallsPerClient.toLocaleString()}</div>
                                <div className="text-gray-400 text-sm">Avg Calls/Client</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Client List */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Client</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Phone Numbers</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">CRM</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Workflows</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Calls</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        Loading clients...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        No clients found
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {client.clientName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{client.clientName}</div>
                                                    <div className="text-gray-400 text-sm">
                                                        Added {new Date(client.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{client.phoneNumbers.length}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {client.crmType ? (
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs capitalize">
                                                    {client.crmType}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-sm">Not configured</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <Layers className="w-4 h-4 text-gray-400" />
                                                <span>{client.workflowCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-medium">{client.callCount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {client.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                                    <CheckCircle className="w-3 h-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                                                    <XCircle className="w-3 h-3" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedClient(client)}
                                                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                                                    title="Settings"
                                                >
                                                    <Settings className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Client Hierarchy Visualization */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Client Hierarchy</h2>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-start gap-4">
                            {/* Master Account */}
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <div className="mt-2 text-center">
                                    <div className="font-medium">Master BPO</div>
                                    <div className="text-gray-400 text-sm">Your Account</div>
                                </div>
                            </div>

                            {/* Connection Lines */}
                            <div className="flex-1 pt-8">
                                <div className="border-t-2 border-dashed border-gray-600 relative">
                                    <div className="absolute top-1/2 left-0 right-0 flex justify-around">
                                        {clients.slice(0, 4).map((client, i) => (
                                            <div key={client.id} className="flex flex-col items-center -mt-4">
                                                <div className="w-3 h-3 rounded-full bg-gray-600 border-2 border-gray-800" />
                                                <div className="h-6 w-0.5 bg-gray-600" />
                                                <div className={`w-12 h-12 rounded-lg ${client.isActive ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-700 border-gray-600'} border flex items-center justify-center`}>
                                                    <Building2 className={`w-6 h-6 ${client.isActive ? 'text-green-400' : 'text-gray-400'}`} />
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <div className="text-xs font-medium truncate w-20">{client.clientName.split(' ')[0]}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Client Modal - Simplified */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., First National Bank"
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Numbers</label>
                                <input
                                    type="text"
                                    placeholder="+1-800-555-0100, +1-800-555-0101"
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-500 outline-none"
                                />
                                <p className="text-gray-500 text-xs mt-1">Comma-separated list of phone numbers</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">CRM Integration</label>
                                <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-500 outline-none">
                                    <option value="">No Integration</option>
                                    <option value="salesforce">Salesforce</option>
                                    <option value="hubspot">HubSpot</option>
                                    <option value="zendesk">Zendesk</option>
                                    <option value="custom">Custom Webhook</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
                                >
                                    Create Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
