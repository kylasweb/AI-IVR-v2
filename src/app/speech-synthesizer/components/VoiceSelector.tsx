// Speech Synthesizer Voice Selection Component

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Voice } from '@/lib/tts/hooks/useTTS';

interface VoiceSelectorProps {
    language: string;
    onLanguageChange: (language: string) => void;
    voiceModel: string;
    onVoiceChange: (voice: string) => void;
    availableVoices: Voice[];
}

const LANGUAGES = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'ml-IN', name: 'Malayalam' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'te-IN', name: 'Telugu' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
];

export function VoiceSelector({
    language,
    onLanguageChange,
    voiceModel,
    onVoiceChange,
    availableVoices
}: VoiceSelectorProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Voice Selection</CardTitle>
                <CardDescription>
                    Choose language and voice model
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={language}
                            onValueChange={onLanguageChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGES.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="voiceModel">Voice Model</Label>
                        <Select
                            value={voiceModel}
                            onValueChange={onVoiceChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select voice" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableVoices.map((voice) => (
                                    <SelectItem key={voice.id} value={voice.id}>
                                        {voice.name} ({voice.quality})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
