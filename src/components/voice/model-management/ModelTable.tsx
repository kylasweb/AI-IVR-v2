'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Mic, Users, Brain, Eye, Edit, Play, Trash2 } from 'lucide-react';
import { VoiceStatusBadge } from '@/components/voice/common/VoiceStatusBadge';
import { VoiceModel } from '@/hooks/useVoiceModels';

interface ModelTableProps {
    models: VoiceModel[];
    onView?: (model: VoiceModel) => void;
    onEdit?: (model: VoiceModel) => void;
    onTrain: (model: VoiceModel) => void;
    onDelete?: (model: VoiceModel) => void;
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'synthesis': return <Volume2 className="h-4 w-4" />;
        case 'recognition': return <Mic className="h-4 w-4" />;
        case 'cloning': return <Users className="h-4 w-4" />;
        default: return <Brain className="h-4 w-4" />;
    }
};

/**
 * Table component for displaying and managing voice models.
 */
export function ModelTable({ models, onView, onEdit, onTrain, onDelete }: ModelTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Voice Models</CardTitle>
                <CardDescription>
                    Manage and monitor all voice AI models
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Accuracy</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {models.map((model) => (
                            <TableRow key={model.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{model.name}</div>
                                        <div className="text-sm text-muted-foreground">v{model.version}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(model.type)}
                                        <span className="capitalize">{model.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{model.provider}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{model.language.toUpperCase()}</Badge>
                                </TableCell>
                                <TableCell>
                                    <VoiceStatusBadge status={model.status} />
                                </TableCell>
                                <TableCell>
                                    {model.accuracy ? `${model.accuracy}%` : 'N/A'}
                                </TableCell>
                                <TableCell>{model.usageCount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {onView && (
                                            <Button variant="ghost" size="sm" onClick={() => onView(model)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onEdit && (
                                            <Button variant="ghost" size="sm" onClick={() => onEdit(model)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {model.status !== 'training' && (
                                            <Button variant="ghost" size="sm" onClick={() => onTrain(model)}>
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button variant="ghost" size="sm" onClick={() => onDelete(model)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default ModelTable;
