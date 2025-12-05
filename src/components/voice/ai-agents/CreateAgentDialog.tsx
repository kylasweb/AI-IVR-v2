'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Loader2, Square } from 'lucide-react';
import { AgentFormData } from '@/hooks/useVoiceAgents';

interface CreateAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (formData: AgentFormData) => void;
    onPreviewVoice?: (voiceModel: string, language: string, speed: number) => void;
    previewingModel?: string | null;
    isPlaying?: boolean;
    ttsLoading?: boolean;
}

const voiceModels = [
    { value: 'ml-IN-Wavenet-A', label: 'Malayalam Female Professional' },
    { value: 'ml-IN-Wavenet-B', label: 'Malayalam Male Professional' },
    { value: 'hi-IN-Wavenet-A', label: 'Hindi Female Professional' },
    { value: 'hi-IN-Wavenet-B', label: 'Hindi Male Professional' },
    { value: 'en-US-Neural2-A', label: 'English Female (American)' },
    { value: 'en-US-Neural2-D', label: 'English Male (American)' },
];

/**
 * Dialog for creating a new voice AI agent.
 */
export function CreateAgentDialog({
    open,
    onOpenChange,
    onCreate,
    onPreviewVoice,
    previewingModel,
    isPlaying,
    ttsLoading
}: CreateAgentDialogProps) {
    const [formData, setFormData] = useState<AgentFormData>({
        name: '',
        description: '',
        language: 'Malayalam',
        voice: 'Female Professional',
        voiceModel: 'ml-IN-Wavenet-A',
        personality: 'friendly',
        emotion: 'neutral',
        speed: 1.0
    });

    const handleCreate = () => {
        if (!formData.name) return;
        onCreate(formData);
        setFormData({
            name: '',
            description: '',
            language: 'Malayalam',
            voice: 'Female Professional',
            voiceModel: 'ml-IN-Wavenet-A',
            personality: 'friendly',
            emotion: 'neutral',
            speed: 1.0
        });
        onOpenChange(false);
    };

    const handlePreview = (model: string) => {
        if (onPreviewVoice) {
            onPreviewVoice(model, formData.language, formData.speed);
        }
    };

    const isPreviewingThisModel = (model: string) => previewingModel === model;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Voice AI Agent</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Agent Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., ശ്രീ - Customer Support"
                            />
                        </div>
                        <div>
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={formData.language}
                                onValueChange={(value) => setFormData({ ...formData, language: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Malayalam">Malayalam</SelectItem>
                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Tamil">Tamil</SelectItem>
                                    <SelectItem value="Telugu">Telugu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the agent's purpose and capabilities..."
                            rows={2}
                        />
                    </div>

                    <div>
                        <Label>Voice Model</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {voiceModels.map((model) => (
                                <div
                                    key={model.value}
                                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent ${formData.voiceModel === model.value ? 'border-primary bg-accent' : ''}`}
                                    onClick={() => setFormData({ ...formData, voiceModel: model.value })}
                                >
                                    <span className="text-sm">{model.label}</span>
                                    {onPreviewVoice && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreview(model.value);
                                            }}
                                            disabled={ttsLoading && isPreviewingThisModel(model.value)}
                                        >
                                            {ttsLoading && isPreviewingThisModel(model.value) ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : isPlaying && isPreviewingThisModel(model.value) ? (
                                                <Square className="h-3 w-3" />
                                            ) : (
                                                <Play className="h-3 w-3" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="personality">Personality</Label>
                            <Select
                                value={formData.personality}
                                onValueChange={(value) => setFormData({ ...formData, personality: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="friendly">Friendly</SelectItem>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="formal">Formal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="emotion">Emotion</Label>
                            <Select
                                value={formData.emotion}
                                onValueChange={(value) => setFormData({ ...formData, emotion: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="neutral">Neutral</SelectItem>
                                    <SelectItem value="happy">Happy</SelectItem>
                                    <SelectItem value="calm">Calm</SelectItem>
                                    <SelectItem value="empathetic">Empathetic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Speech Speed: {formData.speed}x</Label>
                        <Slider
                            value={[formData.speed]}
                            onValueChange={([value]) => setFormData({ ...formData, speed: value })}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={!formData.name}>
                        Create Agent
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateAgentDialog;
