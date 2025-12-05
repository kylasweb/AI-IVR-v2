'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestSuite } from '@/hooks/useTestSuite';

interface CreateSuiteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (name: string, description: string, type: TestSuite['type']) => void;
}

/**
 * Dialog component for creating a new test suite.
 */
export function CreateSuiteDialog({ open, onOpenChange, onCreate }: CreateSuiteDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'comprehensive' as TestSuite['type']
    });

    const handleCreate = () => {
        if (!formData.name) return;
        onCreate(formData.name, formData.description, formData.type);
        setFormData({ name: '', description: '', type: 'comprehensive' });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Test Suite</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Suite Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Malayalam STT Quality Test"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Test Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value as TestSuite['type'] })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                <SelectItem value="quality">Quality</SelectItem>
                                <SelectItem value="accuracy">Accuracy</SelectItem>
                                <SelectItem value="latency">Latency</SelectItem>
                                <SelectItem value="performance">Performance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the test suite purpose..."
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={!formData.name}>
                        Create Suite
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateSuiteDialog;
