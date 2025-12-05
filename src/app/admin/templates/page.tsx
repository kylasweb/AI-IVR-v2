'use client';

/**
 * Admin Template Manager Page
 * Global workflow template management
 */

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Layers,
    Edit2,
    Trash2,
    Eye,
    Copy,
    Download,
    Upload,
    CheckCircle,
    Building2,
    Brain,
    Zap,
    Phone,
    MessageSquare,
    BarChart3,
    Headphones,
    MoreVertical,
    Filter
} from 'lucide-react';
import { BPO_PROCESS_TEMPLATES, ProcessTemplate } from '@/lib/workflow/process-templates';

// Category icons mapping
const CATEGORY_ICONS: Record<string, any> = {
    smart_triage: Brain,
    transactional_resolver: Zap,
    outbound_campaign: Phone,
    soft_collection: MessageSquare,
    csat: BarChart3,
    agent_coaching: Headphones,
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
    smart_triage: 'from-blue-500 to-indigo-600',
    transactional_resolver: 'from-emerald-500 to-teal-600',
    outbound_campaign: 'from-orange-500 to-amber-600',
    soft_collection: 'from-purple-500 to-violet-600',
    csat: 'from-pink-500 to-rose-600',
    agent_coaching: 'from-cyan-500 to-blue-600',
};

interface TemplateWithMeta extends ProcessTemplate {
    usageCount: number;
    lastModified: string;
    createdBy: string;
    clients: string[];
}

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<TemplateWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithMeta | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Load templates
    useEffect(() => {
        // Combine built-in templates with mock metadata
        const templatesWithMeta: TemplateWithMeta[] = BPO_PROCESS_TEMPLATES.map(t => ({
            ...t,
            usageCount: Math.floor(Math.random() * 50) + 5,
            lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'System',
            clients: ['First National Bank', 'TechMart Retail'].slice(0, Math.floor(Math.random() * 2) + 1),
        }));

        setTemplates(templatesWithMeta);
        setLoading(false);
    }, []);

    // Filter templates
    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories
    const categories = ['all', ...new Set(templates.map(t => t.category))];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <Layers className="w-7 h-7 text-purple-400" />
                                Global Template Manager
                            </h1>
                            <p className="text-gray-400 mt-1">Manage workflow templates across all BPO clients</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                                <Upload className="w-4 h-4" />
                                Import
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                New Template
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="text-2xl font-bold">{templates.length}</div>
                        <div className="text-gray-400 text-sm">Total Templates</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="text-2xl font-bold">{templates.filter(t => t.clients.length > 0).length}</div>
                        <div className="text-gray-400 text-sm">In Use</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="text-2xl font-bold">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</div>
                        <div className="text-gray-400 text-sm">Total Deployments</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="text-2xl font-bold">{categories.length - 1}</div>
                        <div className="text-gray-400 text-sm">Categories</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                                <div className="w-12 h-12 bg-gray-700 rounded-xl mb-4" />
                                <div className="h-5 bg-gray-700 rounded mb-2 w-3/4" />
                                <div className="h-4 bg-gray-700 rounded w-full" />
                            </div>
                        ))
                    ) : filteredTemplates.length === 0 ? (
                        <div className="col-span-3 text-center py-12 text-gray-400">
                            No templates found matching your criteria
                        </div>
                    ) : (
                        filteredTemplates.map(template => {
                            const Icon = CATEGORY_ICONS[template.category] || Layers;
                            const colorClass = CATEGORY_COLORS[template.category] || 'from-gray-500 to-gray-600';

                            return (
                                <div
                                    key={template.id}
                                    className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all group"
                                >
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <button className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Title & Description */}
                                        <h3 className="text-lg font-semibold mb-1">{template.name}</h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{template.description}</p>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Layers className="w-4 h-4" />
                                                {template.nodes.length} nodes
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-4 h-4" />
                                                {template.clients.length} clients
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs capitalize">
                                                {template.category.replace(/_/g, ' ')}
                                            </span>
                                            {template.createdBy === 'System' && (
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                                    Built-in
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex border-t border-gray-700">
                                        <button
                                            onClick={() => setSelectedTemplate(template)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-700/50 transition-colors text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Preview
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-700/50 transition-colors text-sm border-l border-gray-700">
                                            <Copy className="w-4 h-4" />
                                            Clone
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-700/50 transition-colors text-sm border-l border-gray-700">
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Template Preview Modal */}
            {selectedTemplate && (
                <TemplatePreviewModal
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                />
            )}
        </div>
    );
}

// Template Preview Modal Component
function TemplatePreviewModal({
    template,
    onClose
}: {
    template: TemplateWithMeta;
    onClose: () => void;
}) {
    const Icon = CATEGORY_ICONS[template.category] || Layers;
    const colorClass = CATEGORY_COLORS[template.category] || 'from-gray-500 to-gray-600';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{template.name}</h2>
                            <p className="text-gray-400 text-sm">{template.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Node List */}
                    <h3 className="font-medium mb-4">Workflow Nodes ({template.nodes.length})</h3>
                    <div className="space-y-2 mb-6">
                        {template.nodes.map((node, i) => (
                            <div key={node.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                                <div className="w-6 h-6 rounded bg-gray-600 flex items-center justify-center text-xs font-medium">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{node.label}</div>
                                    <div className="text-xs text-gray-400 capitalize">{node.type.replace(/_/g, ' ')}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Connections */}
                    <h3 className="font-medium mb-4">Connections ({template.connections.length})</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {template.connections.map(conn => (
                            <div key={conn.id} className="text-xs p-2 bg-gray-700/30 rounded">
                                <span className="text-blue-400">{conn.source}</span>
                                <span className="text-gray-400"> → </span>
                                <span className="text-green-400">{conn.target}</span>
                                {conn.condition && (
                                    <span className="text-yellow-400 ml-1">({conn.condition})</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                        Close
                    </button>
                    <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium">
                        Deploy to Client
                    </button>
                </div>
            </div>
        </div>
    );
}
