'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, X as Pause, Settings as Edit, Trash2, Activity as TestTube, Globe } from 'lucide-react';
import { IVRConfig } from './types';

interface IVRConfigCardProps {
    config: IVRConfig;
    onToggleStatus: (config: IVRConfig) => void;
    onEdit: (config: IVRConfig) => void;
    onTest: (configId: string) => void;
    onDelete: (configId: string) => void;
}

/**
 * Card component for displaying an IVR configuration.
 */
export function IVRConfigCard({
    config,
    onToggleStatus,
    onEdit,
    onTest,
    onDelete
}: IVRConfigCardProps) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300 bg-white">
            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                            {config.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {config.description || 'No description provided'}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 ml-3">
                        <Badge variant={config.is_active ? "default" : "secondary"} className="text-xs">
                            {config.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {config.cultural_enabled && (
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                                Cultural AI
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</span>
                        <p className="text-gray-900 font-medium capitalize">{config.flow_type.replace('_', ' ')}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Language</span>
                        <div className="flex items-center gap-1">
                            <p className="text-gray-900 font-medium uppercase">{config.language}</p>
                            {config.language === 'ml' && <Globe className="h-3 w-3 text-green-600" />}
                        </div>
                    </div>
                </div>

                {config.usage_stats && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Statistics</span>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-lg font-bold text-blue-600">{config.usage_stats.total_calls}</p>
                                <p className="text-xs text-gray-600">Calls</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-green-600">{config.usage_stats.success_rate}%</p>
                                <p className="text-xs text-gray-600">Success</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-purple-600">{config.usage_stats.avg_duration}s</p>
                                <p className="text-xs text-gray-600">Avg Duration</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button
                        onClick={() => onToggleStatus(config)}
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${config.is_active
                            ? 'border-red-300 text-red-700 hover:bg-red-50'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                    >
                        {config.is_active ? (
                            <Pause className="h-3 w-3 mr-1" />
                        ) : (
                            <Play className="h-3 w-3 mr-1" />
                        )}
                        {config.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                        onClick={() => onEdit(config)}
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                        onClick={() => onTest(config.id)}
                        variant="outline"
                        size="sm"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                        <TestTube className="h-3 w-3" />
                    </Button>
                    <Button
                        onClick={() => onDelete(config.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default IVRConfigCard;
