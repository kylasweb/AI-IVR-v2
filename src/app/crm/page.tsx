'use client';

/**
 * Advanced CRM Dashboard
 * Full-featured customer relationship management for BPO operations
 */

import React, { useState, useEffect } from 'react';
import BPOLayout from '@/components/layout/bpo-layout';
import {
    Users,
    Building2,
    Phone,
    Mail,
    MapPin,
    Search,
    Filter,
    Plus,
    MoreVertical,
    ChevronRight,
    ChevronDown,
    Star,
    Clock,
    Calendar,
    DollarSign,
    TrendingUp,
    MessageSquare,
    FileText,
    Tag,
    Edit,
    Trash2,
    Eye,
    Download,
    Upload,
    RefreshCw,
    Target,
    Briefcase,
    Activity,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

// Types
interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    title: string;
    status: 'active' | 'inactive' | 'lead' | 'prospect';
    source: string;
    score: number;
    tags: string[];
    lastActivity: string;
    createdAt: string;
}

interface Account {
    id: string;
    name: string;
    industry: string;
    size: 'small' | 'medium' | 'enterprise';
    revenue: number;
    contacts: number;
    deals: number;
    status: 'active' | 'churned' | 'prospect';
}

interface Deal {
    id: string;
    name: string;
    value: number;
    stage: string;
    probability: number;
    contactId: string;
    accountName: string;
    closeDate: string;
    owner: string;
}

interface Activity {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note' | 'task';
    subject: string;
    contactName: string;
    date: string;
    outcome?: string;
}

// Mock Data
const CONTACTS: Contact[] = [
    { id: 'c1', firstName: 'John', lastName: 'Doe', email: 'john.doe@acme.com', phone: '+1 555-123-4567', company: 'ACME Corp', title: 'CFO', status: 'active', source: 'Inbound Call', score: 85, tags: ['Decision Maker', 'VIP'], lastActivity: '2 hours ago', createdAt: '2024-01-15' },
    { id: 'c2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@globex.com', phone: '+1 555-234-5678', company: 'Globex Inc', title: 'Director of Operations', status: 'lead', source: 'Website', score: 72, tags: ['Qualified'], lastActivity: '1 day ago', createdAt: '2024-02-20' },
    { id: 'c3', firstName: 'Robert', lastName: 'Johnson', email: 'r.johnson@stark.io', phone: '+1 555-345-6789', company: 'Stark Industries', title: 'VP Finance', status: 'prospect', source: 'Referral', score: 90, tags: ['Hot Lead', 'Enterprise'], lastActivity: '30 mins ago', createdAt: '2024-03-05' },
    { id: 'c4', firstName: 'Emily', lastName: 'Davis', email: 'emily.d@wayne.com', phone: '+1 555-456-7890', company: 'Wayne Enterprises', title: 'Accounts Manager', status: 'active', source: 'Trade Show', score: 68, tags: ['Follow Up'], lastActivity: '3 days ago', createdAt: '2024-01-28' },
    { id: 'c5', firstName: 'Michael', lastName: 'Brown', email: 'm.brown@umbrella.co', phone: '+1 555-567-8901', company: 'Umbrella Corp', title: 'CEO', status: 'inactive', source: 'Cold Call', score: 45, tags: ['Churned'], lastActivity: '2 weeks ago', createdAt: '2023-11-10' }
];

const DEALS: Deal[] = [
    { id: 'd1', name: 'ACME Enterprise License', value: 125000, stage: 'Negotiation', probability: 75, contactId: 'c1', accountName: 'ACME Corp', closeDate: '2024-12-30', owner: 'Sarah J.' },
    { id: 'd2', name: 'Globex Pilot Program', value: 25000, stage: 'Discovery', probability: 40, contactId: 'c2', accountName: 'Globex Inc', closeDate: '2025-01-15', owner: 'Mike C.' },
    { id: 'd3', name: 'Stark Industries Renewal', value: 250000, stage: 'Proposal', probability: 85, contactId: 'c3', accountName: 'Stark Industries', closeDate: '2024-12-20', owner: 'Sarah J.' },
    { id: 'd4', name: 'Wayne Expansion', value: 75000, stage: 'Qualification', probability: 30, contactId: 'c4', accountName: 'Wayne Enterprises', closeDate: '2025-02-01', owner: 'Emily D.' }
];

const PIPELINE_STAGES = [
    { name: 'Qualification', color: 'blue', count: 12, value: 340000 },
    { name: 'Discovery', color: 'indigo', count: 8, value: 215000 },
    { name: 'Proposal', color: 'purple', count: 5, value: 425000 },
    { name: 'Negotiation', color: 'orange', count: 3, value: 280000 },
    { name: 'Closed Won', color: 'green', count: 15, value: 890000 }
];

const ACTIVITIES: Activity[] = [
    { id: 'a1', type: 'call', subject: 'Follow-up on proposal', contactName: 'John Doe', date: '2 hours ago', outcome: 'Positive - scheduling demo' },
    { id: 'a2', type: 'email', subject: 'Sent contract draft', contactName: 'Robert Johnson', date: '4 hours ago' },
    { id: 'a3', type: 'meeting', subject: 'Quarterly review', contactName: 'Jane Smith', date: 'Yesterday', outcome: 'Discussed expansion' },
    { id: 'a4', type: 'task', subject: 'Prepare pricing proposal', contactName: 'Emily Davis', date: '2 days ago', outcome: 'Completed' },
    { id: 'a5', type: 'note', subject: 'Customer feedback noted', contactName: 'John Doe', date: '3 days ago' }
];

export default function CRMPage() {
    const [activeView, setActiveView] = useState<'contacts' | 'accounts' | 'deals' | 'pipeline'>('contacts');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400';
            case 'lead': return 'bg-blue-500/20 text-blue-400';
            case 'prospect': return 'bg-purple-500/20 text-purple-400';
            case 'inactive': return 'bg-gray-500/20 text-gray-400';
            case 'churned': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'call': return <Phone className="w-4 h-4" />;
            case 'email': return <Mail className="w-4 h-4" />;
            case 'meeting': return <Calendar className="w-4 h-4" />;
            case 'task': return <CheckCircle className="w-4 h-4" />;
            case 'note': return <FileText className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    // Filter contacts
    const filteredContacts = CONTACTS.filter(c => {
        const matchesSearch = searchQuery === '' ||
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Stats
    const totalContacts = CONTACTS.length;
    const activeContacts = CONTACTS.filter(c => c.status === 'active').length;
    const totalDeals = DEALS.length;
    const pipelineValue = DEALS.reduce((sum, d) => sum + d.value, 0);

    return (
        <BPOLayout title="Advanced CRM" subtitle="Customer relationship management">
            <div className="h-full bg-gray-900 text-white p-6 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Briefcase className="w-7 h-7 text-blue-400" />
                            Advanced CRM
                        </h1>
                        <p className="text-gray-400 mt-1">Customer relationship management for BPO operations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                            <Upload className="w-4 h-4" />
                            Import
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                            <Plus className="w-4 h-4" />
                            Add Contact
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Total Contacts</span>
                        </div>
                        <div className="text-3xl font-bold">{totalContacts}</div>
                        <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>+12 this week</span>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Active</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400">{activeContacts}</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                            <Target className="w-4 h-4" />
                            <span className="text-sm">Open Deals</span>
                        </div>
                        <div className="text-3xl font-bold text-purple-400">{totalDeals}</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm">Pipeline Value</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-400">${(pipelineValue / 1000).toFixed(0)}K</div>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['contacts', 'accounts', 'deals', 'pipeline'] as const).map((view) => (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize ${activeView === view
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {view}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Left - Contact List */}
                    <div className="col-span-2">
                        {activeView === 'contacts' && (
                            <div className="bg-gray-800 rounded-xl">
                                {/* Search & Filters */}
                                <div className="p-4 border-b border-gray-700 flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search contacts..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="lead">Lead</option>
                                        <option value="prospect">Prospect</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                {/* Contact List */}
                                <div className="divide-y divide-gray-700">
                                    {filteredContacts.map((contact) => (
                                        <button
                                            key={contact.id}
                                            onClick={() => setSelectedContact(contact)}
                                            className={`w-full p-4 text-left hover:bg-gray-700/50 transition-colors ${selectedContact?.id === contact.id ? 'bg-gray-700/50' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-medium">
                                                        {contact.firstName[0]}{contact.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(contact.status)}`}>
                                                                {contact.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-400">{contact.title} at {contact.company}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className={`text-lg font-bold ${getScoreColor(contact.score)}`}>
                                                            {contact.score}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Lead Score</div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {contact.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {contact.lastActivity}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeView === 'deals' && (
                            <div className="bg-gray-800 rounded-xl">
                                <div className="p-4 border-b border-gray-700">
                                    <h3 className="font-semibold">Open Deals</h3>
                                </div>
                                <div className="divide-y divide-gray-700">
                                    {DEALS.map((deal) => (
                                        <div key={deal.id} className="p-4 hover:bg-gray-700/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <div className="font-medium">{deal.name}</div>
                                                    <div className="text-sm text-gray-400">{deal.accountName}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-green-400">${(deal.value / 1000).toFixed(0)}K</div>
                                                    <div className="text-xs text-gray-500">{deal.probability}% probability</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{deal.stage}</span>
                                                <span className="text-gray-400">Close: {deal.closeDate}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeView === 'pipeline' && (
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="font-semibold mb-4">Sales Pipeline</h3>
                                <div className="space-y-4">
                                    {PIPELINE_STAGES.map((stage) => (
                                        <div key={stage.name}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{stage.name}</span>
                                                    <span className="text-sm text-gray-400">({stage.count} deals)</span>
                                                </div>
                                                <span className="text-green-400 font-medium">${(stage.value / 1000).toFixed(0)}K</span>
                                            </div>
                                            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-${stage.color}-500`}
                                                    style={{ width: `${(stage.value / 890000) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right - Contact Detail / Activities */}
                    <div className="col-span-1 space-y-4">
                        {selectedContact ? (
                            <div className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Contact Details</h3>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-gray-700 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-700 rounded-lg text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                                        {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold">
                                            {selectedContact.firstName} {selectedContact.lastName}
                                        </div>
                                        <div className="text-gray-400">{selectedContact.title}</div>
                                        <div className="text-sm text-blue-400">{selectedContact.company}</div>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{selectedContact.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{selectedContact.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-4 h-4 text-gray-400" />
                                        <div className="flex flex-wrap gap-1">
                                            {selectedContact.tags.map((tag, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
                                        <Phone className="w-4 h-4 inline mr-1" /> Call
                                    </button>
                                    <button className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium">
                                        <Mail className="w-4 h-4 inline mr-1" /> Email
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-800 rounded-xl p-8 text-center">
                                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500">Select a contact to view details</p>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="bg-gray-800 rounded-xl p-4">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-400" />
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {ACTIVITIES.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-700/50 rounded-lg">
                                        <div className={`p-2 rounded-lg ${activity.type === 'call' ? 'bg-green-500/20 text-green-400' :
                                            activity.type === 'email' ? 'bg-blue-500/20 text-blue-400' :
                                                activity.type === 'meeting' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{activity.subject}</div>
                                            <div className="text-xs text-gray-400">{activity.contactName} • {activity.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BPOLayout>
    );
}
