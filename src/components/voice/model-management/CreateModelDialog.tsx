'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceModel } from '@/hooks/useVoiceModels';

interface CreateModelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (modelData: {
        name: string;
        type: VoiceModel['type'];
        provider: string;
        language: string;
        description: string;
    }) => void;
}

/**
 * Dialog for creating a new voice model.
 */
export function CreateModelDialog({ open, onOpenChange, onCreate }: CreateModelDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: '' as VoiceModel['type'] | '',
        provider: '',
        language: '',
        description: ''
    });

    const handleCreate = () => {
        if (!formData.name || !formData.type || !formData.provider || !formData.language) return;
        onCreate({
            name: formData.name,
            type: formData.type as VoiceModel['type'],
            provider: formData.provider,
            language: formData.language,
            description: formData.description
        });
        setFormData({ name: '', type: '', provider: '', language: '', description: '' });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Voice Model</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Model Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Malayalam Professional Voice"
                            />
                        </div>
                        <div>
                            <Label htmlFor="type">Model Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as VoiceModel['type'] })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="synthesis">Speech Synthesis</SelectItem>
                                    <SelectItem value="recognition">Speech Recognition</SelectItem>
                                    <SelectItem value="cloning">Voice Cloning</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="provider">Provider</Label>
                            <Select
                                value={formData.provider}
                                onValueChange={(value) => setFormData({ ...formData, provider: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Azure">Azure Cognitive Services</SelectItem>
                                    <SelectItem value="Google">Google Cloud</SelectItem>
                                    <SelectItem value="ElevenLabs">ElevenLabs</SelectItem>
                                    <SelectItem value="Custom">Custom Training</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={formData.language}
                                onValueChange={(value) => setFormData({ ...formData, language: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ml">Malayalam</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                    <SelectItem value="ta">Tamil</SelectItem>
                                    <SelectItem value="te">Telugu</SelectItem>
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
                            placeholder="Describe the voice model and its intended use..."
                            rows={3}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!formData.name || !formData.type || !formData.provider || !formData.language}
                    >
                        Create Model
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateModelDialog;
