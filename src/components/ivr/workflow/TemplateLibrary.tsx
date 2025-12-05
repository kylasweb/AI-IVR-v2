'use client';

/**
 * Process Template Library
 * Sidebar/modal component for workflow builder to select BPO templates
 */

import React, { useState } from 'react';
import {
    Layers,
    Search,
    Brain,
    Zap,
    Phone,
    MessageSquare,
    BarChart3,
    Headphones,
    ChevronRight,
    Plus,
    X,
    Check
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

const CATEGORY_COLORS: Record<string, string> = {
    smart_triage: 'from-blue-500 to-indigo-600',
    transactional_resolver: 'from-emerald-500 to-teal-600',
    outbound_campaign: 'from-orange-500 to-amber-600',
    soft_collection: 'from-purple-500 to-violet-600',
    csat: 'from-pink-500 to-rose-600',
    agent_coaching: 'from-cyan-500 to-blue-600',
};

interface TemplateLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: ProcessTemplate) => void;
}

export default function TemplateLibrary({
    isOpen,
    onClose,
    onSelectTemplate
}: TemplateLibraryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

    if (!isOpen) return null;

    // Filter templates
    const filteredTemplates = BPO_PROCESS_TEMPLATES.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories
    const categories = [...new Set(BPO_PROCESS_TEMPLATES.map(t => t.category))];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end">
            <div className="w-full max-w-md h-full bg-gray-900 border-l border-gray-700 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold">Process Templates</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-700 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="px-4 py-3 border-b border-gray-700">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${!selectedCategory
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(cat => {
                            const Icon = CATEGORY_ICONS[cat] || Layers;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${selectedCategory === cat
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    <Icon className="w-3 h-3" />
                                    {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Templates List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No templates found
                        </div>
                    ) : (
                        filteredTemplates.map(template => {
                            const Icon = CATEGORY_ICONS[template.category] || Layers;
                            const colorClass = CATEGORY_COLORS[template.category] || 'from-gray-500 to-gray-600';
                            const isHovered = hoveredTemplate === template.id;

                            return (
                                <div
                                    key={template.id}
                                    className={`p-4 bg-gray-800 rounded-xl border transition-all cursor-pointer ${isHovered ? 'border-purple-500 scale-[1.02]' : 'border-gray-700 hover:border-gray-600'
                                        }`}
                                    onMouseEnter={() => setHoveredTemplate(template.id)}
                                    onMouseLeave={() => setHoveredTemplate(null)}
                                    onClick={() => onSelectTemplate(template)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-white">{template.name}</h4>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-1 text-purple-400' : 'text-gray-400'}`} />
                                            </div>
                                            <p className="text-gray-400 text-sm line-clamp-2 mt-1">{template.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span>{template.nodes.length} nodes</span>
                                                <span>{template.connections.length} connections</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700">
                    <button className="w-full flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition-colors">
                        <Plus className="w-4 h-4" />
                        Create Custom Template
                    </button>
                </div>
            </div>
        </div>
    );
}

// Compact inline version for workflow builder sidebar
export function TemplateLibraryInline({
    onSelectTemplate
}: {
    onSelectTemplate: (template: ProcessTemplate) => void;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">BPO Templates</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {expanded && (
                <div className="px-2 pb-2 space-y-1">
                    {BPO_PROCESS_TEMPLATES.map(template => {
                        const Icon = CATEGORY_ICONS[template.category] || Layers;

                        return (
                            <button
                                key={template.id}
                                onClick={() => onSelectTemplate(template)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700/50 text-left transition-colors"
                            >
                                <Icon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm truncate">{template.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
