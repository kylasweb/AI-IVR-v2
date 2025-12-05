'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit, X, Shield } from 'lucide-react';
import { SystemSetting } from './types';

interface SortableSettingProps {
    setting: SystemSetting;
    onUpdate: (id: string, value: string) => void;
    isEditing: boolean;
    onToggleEdit: () => void;
}

/**
 * Sortable setting card component with drag-and-drop support.
 */
export function SortableSetting({ setting, onUpdate, isEditing, onToggleEdit }: SortableSettingProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: setting.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const renderInput = () => {
        switch (setting.type) {
            case 'boolean':
                return (
                    <Switch
                        checked={setting.value === 'true'}
                        onCheckedChange={(checked) => onUpdate(setting.id, String(checked))}
                    />
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        value={setting.value}
                        onChange={(e) => onUpdate(setting.id, e.target.value)}
                        className="w-32"
                        disabled={!isEditing}
                    />
                );
            default:
                return (
                    <Input
                        type={setting.isEncrypted ? 'password' : 'text'}
                        value={setting.value}
                        onChange={(e) => onUpdate(setting.id, e.target.value)}
                        className="flex-1 max-w-xs"
                        disabled={!isEditing}
                    />
                );
        }
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={`mb-2 ${isDragging ? 'shadow-lg' : ''}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                        >
                            <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Setting Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{setting.key}</span>
                                {setting.isEncrypted && (
                                    <Badge variant="outline" className="text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Encrypted
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                    {setting.type}
                                </Badge>
                            </div>
                            {setting.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {setting.description}
                                </p>
                            )}
                        </div>

                        {/* Value Input */}
                        <div className="flex items-center gap-2">
                            {renderInput()}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onToggleEdit}
                            >
                                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default SortableSetting;
