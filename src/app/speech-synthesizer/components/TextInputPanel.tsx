// Speech Synthesizer Text Input Component

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface TextInputPanelProps {
    text: string;
    onChange: (text: string) => void;
}

export function TextInputPanel({ text, onChange }: TextInputPanelProps) {
    const estimatedDuration = Math.ceil(text.length / 150);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Text Input</CardTitle>
                <CardDescription>
                    Enter the text you want to convert to speech
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    value={text}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter your text here... Supports multiple languages and special characters."
                    rows={8}
                    className="resize-none"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{text.length} characters</span>
                    <span>Estimated duration: ~{estimatedDuration}s</span>
                </div>
            </CardContent>
        </Card>
    );
}
