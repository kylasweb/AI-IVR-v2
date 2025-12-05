'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { IVRTemplate } from './types';

interface IVRTemplateCardProps {
    template: IVRTemplate;
    onUseTemplate: (templateId: string) => void;
}

/**
 * Card component for displaying an IVR template.
 */
export function IVRTemplateCard({ template, onUseTemplate }: IVRTemplateCardProps) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300 bg-white">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                        {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-medium bg-gray-100 text-gray-800">
                            {template.flow_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-800">
                            {template.language.toUpperCase()}
                        </Badge>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-700">Cultural Features:</span>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {template.cultural_features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    {feature}
                                </Badge>
                            ))}
                            {template.cultural_features.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                                    +{template.cultural_features.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => onUseTemplate(template.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300"
                    size="lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                </Button>
            </CardContent>
        </Card>
    );
}

export default IVRTemplateCard;
