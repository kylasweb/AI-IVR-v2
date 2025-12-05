// Speech Synthesizer Preview & Playback Component

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Download, Radio as Waveform } from 'lucide-react';
import type { TTSResult } from '@/lib/tts/hooks/useTTS';

interface SynthesisPreviewProps {
    isLoading: boolean;
    isPlaying: boolean;
    lastResult: TTSResult | null;
    onPlay: () => void;
    onPause: () => void;
    onDownload: () => void;
}

export function SynthesisPreview({
    isLoading,
    isPlaying,
    lastResult,
    onPlay,
    onPause,
    onDownload
}: SynthesisPreviewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Preview & Playback</CardTitle>
                <CardDescription>
                    Listen to your generated speech
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Badge className="bg-yellow-100 text-yellow-800">
                                Processing
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Generating...
                            </span>
                        </div>
                        <Progress value={50} className="w-full" />
                    </div>
                )}

                {!isLoading && lastResult && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Badge className="bg-green-100 text-green-800">
                                Ready
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {lastResult.audio.duration.toFixed(1)}s
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={isPlaying ? onPause : onPlay}
                            >
                                {isPlaying ? (
                                    <>
                                        <Pause className="h-4 w-4 mr-1" />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 mr-1" />
                                        Play
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onDownload}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <div>Provider: {lastResult.provider}</div>
                            <div>Processing: {Math.round(lastResult.processing_time)}ms</div>
                            <div>Format: {lastResult.audio.format.toUpperCase()}</div>
                        </div>
                    </div>
                )}

                {!isLoading && !lastResult && (
                    <div className="text-center py-8">
                        <Waveform className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Generate speech to preview here
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
