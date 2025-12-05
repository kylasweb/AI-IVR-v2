'use client';

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';
import { WorkflowNodeData } from './types';
import { nodeTypes } from './node-types';

interface NodePropertyPanelProps {
    selectedNode: Node<WorkflowNodeData> | null;
    onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
    onClose: () => void;
}

/**
 * Property panel for configuring workflow nodes.
 * Renders different form fields based on node type.
 */
export function NodePropertyPanel({ selectedNode, onNodeUpdate, onClose }: NodePropertyPanelProps) {
    const [config, setConfig] = useState<Record<string, any>>({});
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (selectedNode) {
            setConfig(selectedNode?.data?.config || {});
            setLabel(selectedNode?.data?.label || '');
            setDescription(selectedNode?.data?.description || '');
        }
    }, [selectedNode]);

    const handleSave = () => {
        if (selectedNode) {
            onNodeUpdate(selectedNode.id, {
                config,
                label,
                description,
            });
        }
    };

    if (!selectedNode) {
        return (
            <Card className="w-80">
                <CardContent className="p-6 text-center text-muted-foreground">
                    Select a node to configure
                </CardContent>
            </Card>
        );
    }

    const nodeType = nodeTypes[selectedNode.data?.type as keyof typeof nodeTypes];

    return (
        <Card className="w-80 max-h-[80vh] overflow-y-auto">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{nodeType?.label || 'Node'} Settings</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Common Fields */}
                <div>
                    <Label htmlFor="node-label">Label</Label>
                    <Input
                        id="node-label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Node label"
                    />
                </div>
                <div>
                    <Label htmlFor="node-description">Description</Label>
                    <Textarea
                        id="node-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description..."
                        rows={2}
                    />
                </div>

                {/* Type-specific Fields */}
                {renderConfigFields(selectedNode.data?.type, config, setConfig)}

                {/* Save Button */}
                <Button onClick={handleSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                </Button>
            </CardContent>
        </Card>
    );
}

/**
 * Renders configuration fields based on node type
 */
function renderConfigFields(
    nodeType: string | undefined,
    config: Record<string, any>,
    setConfig: React.Dispatch<React.SetStateAction<Record<string, any>>>
) {
    if (!nodeType) return null;

    switch (nodeType) {
        case 'agent':
            return (
                <div className="space-y-4">
                    <div>
                        <Label>AI Prompt</Label>
                        <Textarea
                            value={config.prompt || ''}
                            onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                            placeholder="Enter the AI agent's system prompt..."
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label>Model</Label>
                        <Select value={config.model || 'gpt-3.5-turbo'} onValueChange={(v) => setConfig({ ...config, model: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="claude-3">Claude 3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Temperature ({config.temperature || 0.7})</Label>
                        <Input type="number" min="0" max="2" step="0.1" value={config.temperature || 0.7} onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })} />
                    </div>
                </div>
            );

        case 'api':
            return (
                <div className="space-y-4">
                    <div>
                        <Label>API URL</Label>
                        <Input value={config.url || ''} onChange={(e) => setConfig({ ...config, url: e.target.value })} placeholder="https://api.example.com/endpoint" />
                    </div>
                    <div>
                        <Label>HTTP Method</Label>
                        <Select value={config.method || 'GET'} onValueChange={(v) => setConfig({ ...config, method: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Timeout (seconds)</Label>
                        <Input type="number" value={config.timeout || 30} onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })} />
                    </div>
                </div>
            );

        case 'condition':
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Condition Expression</Label>
                        <Input value={config.condition || ''} onChange={(e) => setConfig({ ...config, condition: e.target.value })} placeholder="e.g., intent === 'greeting'" />
                    </div>
                    <div>
                        <Label>True Path Label</Label>
                        <Input value={config.truePath || 'Yes'} onChange={(e) => setConfig({ ...config, truePath: e.target.value })} />
                    </div>
                    <div>
                        <Label>False Path Label</Label>
                        <Input value={config.falsePath || 'No'} onChange={(e) => setConfig({ ...config, falsePath: e.target.value })} />
                    </div>
                </div>
            );

        case 'tts':
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Voice</Label>
                        <Select value={config.voice || 'malayalam-female'} onValueChange={(v) => setConfig({ ...config, voice: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="malayalam-female">Malayalam Female</SelectItem>
                                <SelectItem value="malayalam-male">Malayalam Male</SelectItem>
                                <SelectItem value="english-female">English Female</SelectItem>
                                <SelectItem value="english-male">English Male</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Speed ({config.speed || 1.0}x)</Label>
                        <Input type="number" min="0.5" max="2" step="0.1" value={config.speed || 1.0} onChange={(e) => setConfig({ ...config, speed: parseFloat(e.target.value) })} />
                    </div>
                </div>
            );

        case 'dtmf':
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Timeout (seconds)</Label>
                        <Input type="number" value={config.timeout || 10} onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })} />
                    </div>
                    <div>
                        <Label>Valid Digits</Label>
                        <Input value={config.validDigits || '0123456789*#'} onChange={(e) => setConfig({ ...config, validDigits: e.target.value })} />
                    </div>
                    <div>
                        <Label>Max Length</Label>
                        <Input type="number" value={config.maxLength || 10} onChange={(e) => setConfig({ ...config, maxLength: parseInt(e.target.value) })} />
                    </div>
                </div>
            );

        case 'sms':
            return (
                <div className="space-y-4">
                    <div>
                        <Label>To (variable or number)</Label>
                        <Input value={config.to || ''} onChange={(e) => setConfig({ ...config, to: e.target.value })} placeholder="${caller_number}" />
                    </div>
                    <div>
                        <Label>Message Template</Label>
                        <Textarea value={config.message || ''} onChange={(e) => setConfig({ ...config, message: e.target.value })} placeholder="Hello ${name}..." rows={3} />
                    </div>
                </div>
            );

        case 'delay':
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Duration (seconds)</Label>
                        <Input type="number" value={config.duration || 5} onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })} />
                    </div>
                </div>
            );

        default:
            return (
                <div className="text-sm text-muted-foreground">
                    This node type uses default configuration.
                </div>
            );
    }
}

export default NodePropertyPanel;
