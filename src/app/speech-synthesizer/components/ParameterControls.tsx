// Speech Synthesizer Parameter Controls Component

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ParameterControlsProps {
    speed: number[];
    onSpeedChange: (value: number[]) => void;
    pitch: number[];
    onPitchChange: (value: number[]) => void;
    volume: number[];
    onVolumeChange: (value: number[]) => void;
    emotion: string;
    onEmotionChange: (emotion: string) => void;
    style: string;
    onStyleChange: (style: string) => void;
    outputFormat: string;
    onFormatChange: (format: string) => void;
}

const EMOTIONS = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'happy', label: 'Happy' },
    { value: 'sad', label: 'Sad' },
    { value: 'professional', label: 'Professional' },
];

const STYLES = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'friendly', label: 'Friendly' },
];

const FORMATS = [
    { value: 'mp3', label: 'MP3' },
    { value: 'wav', label: 'WAV' },
    { value: 'ogg', label: 'OGG' },
    { value: 'flac', label: 'FLAC' },
];

export function ParameterControls({
    speed,
    onSpeedChange,
    pitch,
    onPitchChange,
    volume,
    onVolumeChange,
    emotion,
    onEmotionChange,
    style,
    onStyleChange,
    outputFormat,
    onFormatChange
}: ParameterControlsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Voice Parameters</CardTitle>
                <CardDescription>
                    Fine-tune the speech characteristics
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <Label>Speed: {speed[0].toFixed(1)}x</Label>
                        <Slider
                            value={speed}
                            onValueChange={onSpeedChange}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <Label>Pitch: {pitch[0] > 0 ? '+' : ''}{pitch[0]}</Label>
                        <Slider
                            value={pitch}
                            onValueChange={onPitchChange}
                            min={-12}
                            max={12}
                            step={1}
                            className="mt-2"
                        />
                    </div>
                    <div>
                        <Label>Volume: {Math.round(volume[0] * 100)}%</Label>
                        <Slider
                            value={volume}
                            onValueChange={onVolumeChange}
                            min={0.1}
                            max={2.0}
                            step={0.1}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="emotion">Emotion</Label>
                        <Select
                            value={emotion}
                            onValueChange={onEmotionChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {EMOTIONS.map((e) => (
                                    <SelectItem key={e.value} value={e.value}>
                                        {e.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="style">Style</Label>
                        <Select
                            value={style}
                            onValueChange={onStyleChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STYLES.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="outputFormat">Output Format</Label>
                    <Select
                        value={outputFormat}
                        onValueChange={onFormatChange}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FORMATS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
