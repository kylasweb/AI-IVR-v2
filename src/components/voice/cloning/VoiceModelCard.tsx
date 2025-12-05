'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Play, Edit, Trash2, Globe, Clock, Star } from 'lucide-react';
import { VoiceStatusBadge } from '@/components/voice/common/VoiceStatusBadge';
import { ClonedVoice } from '@/hooks/useVoiceCloning';

interface VoiceModelCardProps {
    voice: ClonedVoice;
    onPlay?: (voice: ClonedVoice) => void;
    onEdit?: (voice: ClonedVoice) => void;
    onDelete?: (voice: ClonedVoice) => void;
    isPlaying?: boolean;
}

/**
 * Card component for displaying a cloned voice model.
 */
export function VoiceModelCard({ voice, onPlay, onEdit, onDelete, isPlaying }: VoiceModelCardProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${voice.status === 'ready' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{voice.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {voice.sampleCount} samples • {formatDuration(voice.duration)}
                            </p>
                        </div>
                    </div>
                    <VoiceStatusBadge status={voice.status} />
                </div>

                {voice.status === 'training' && (
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Training Progress</span>
                            <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            Language
                        </div>
                        <div className="font-medium">{voice.language.toUpperCase()}</div>
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3" />
                            Quality
                        </div>
                        <div className="font-medium">{voice.quality > 0 ? `${voice.quality}%` : 'N/A'}</div>
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Created
                        </div>
                        <div className="font-medium text-xs">{new Date(voice.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {voice.status === 'ready' && onPlay && (
                        <Button size="sm" className="flex-1" onClick={() => onPlay(voice)}>
                            <Play className="h-4 w-4 mr-1" />
                            {isPlaying ? 'Stop' : 'Preview'}
                        </Button>
                    )}
                    {onEdit && (
                        <Button size="sm" variant="outline" onClick={() => onEdit(voice)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button size="sm" variant="outline" onClick={() => onDelete(voice)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default VoiceModelCard;
