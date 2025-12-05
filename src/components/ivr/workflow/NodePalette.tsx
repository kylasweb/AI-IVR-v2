'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { nodeTypes, nodeCategories } from './node-types';
import { Button } from '@/components/ui/button';

interface NodePaletteProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    expandedCategories: Set<string>;
    onToggleCategory: (category: string) => void;
    onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

/**
 * Draggable node palette for adding nodes to the workflow.
 */
export function NodePalette({
    searchQuery,
    onSearchChange,
    expandedCategories,
    onToggleCategory,
    onDragStart
}: NodePaletteProps) {
    // Filter nodes based on search
    const filteredCategories = nodeCategories.map(category => ({
        ...category,
        types: category.types.filter(type => {
            const nodeType = nodeTypes[type as keyof typeof nodeTypes];
            if (!nodeType) return false;
            const searchLower = searchQuery.toLowerCase();
            return (
                nodeType.label.toLowerCase().includes(searchLower) ||
                nodeType.description.toLowerCase().includes(searchLower) ||
                category.name.toLowerCase().includes(searchLower)
            );
        })
    })).filter(category => category.types.length > 0);

    return (
        <Card className="w-72 max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">Node Palette</CardTitle>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search nodes..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredCategories.map((category) => (
                    <div key={category.name} className="border rounded-lg overflow-hidden">
                        <Button
                            variant="ghost"
                            className="w-full justify-between p-2 h-auto"
                            onClick={() => onToggleCategory(category.name)}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${category.color}`} />
                                <span className="font-medium text-sm">{category.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {category.types.length}
                                </Badge>
                            </div>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${expandedCategories.has(category.name) ? 'rotate-180' : ''}`}
                            />
                        </Button>

                        {expandedCategories.has(category.name) && (
                            <div className="p-2 pt-0 space-y-1">
                                {category.types.map((type) => {
                                    const nodeType = nodeTypes[type as keyof typeof nodeTypes];
                                    if (!nodeType) return null;
                                    const Icon = nodeType.icon;

                                    return (
                                        <div
                                            key={type}
                                            className="flex items-center gap-2 p-2 rounded-md bg-gray-50 hover:bg-gray-100 cursor-grab border border-transparent hover:border-gray-200 transition-all"
                                            draggable
                                            onDragStart={(e) => onDragStart(e, type)}
                                            title={nodeType.description}
                                        >
                                            <div className={`p-1 rounded ${nodeType.color}`}>
                                                <Icon className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium truncate">
                                                    {nodeType.label}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                        No nodes match your search
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default NodePalette;
