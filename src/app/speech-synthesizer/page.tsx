// Refactored Speech Synthesizer Main Page

'use client';

import React, { useState, useEffect } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Speaker, Settings, BarChart3, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTTS } from '@/lib/tts/hooks/useTTS';

// Import components
import { TextInputPanel } from './components/TextInputPanel';
import { VoiceSelector } from './components/VoiceSelector';
import { ParameterControls } from './components/ParameterControls';
import { SynthesisPreview } from './components/SynthesisPreview';

export default function SpeechSynthesizerPage() {
    // TTS Hook
    const {
        synthesize,
        isLoading,
        isPlaying,
        error,
        lastResult,
        listVoices,
        availableVoices,
        play,
        pause,
        download
    } = useTTS();

    // Form state
    const [formData, setFormData] = useState({
        text: '',
        voiceModel: '',
        speed: [1.0],
        pitch: [0],
        volume: [1.0],
        emotion: 'neutral',
        style: 'professional',
        outputFormat: 'mp3' as 'mp3' | 'wav' | 'ogg' | 'flac',
        language: 'en-US'
    });

    const [selectedTab, setSelectedTab] = useState('synthesizer');

    // Load voices on language change
    useEffect(() => {
        const loadVoices = async () => {
            await listVoices(formData.language);
        };
        loadVoices();
    }, [formData.language, listVoices]);

    // Handle synthesis
    const handleSynthesize = async () => {
        if (!formData.text.trim() || !formData.voiceModel) {
            toast({
                title: "Validation Error",
                description: "Please enter text and select a voice model.",
                variant: "destructive"
            });
            return;
        }

        try {
            const result = await synthesize({
                text: formData.text,
                voice: formData.voiceModel,
                language: formData.language,
                speed: formData.speed[0],
                pitch: formData.pitch[0],
                volume: formData.volume[0],
                format: formData.outputFormat,
                provider: 'google_cloud'
            });

            if (result) {
                toast({
                    title: "Synthesis Complete",
                    description: `Generated ${result.characters} characters in ${Math.round(result.processing_time)}ms`,
                });
            }
        } catch (err) {
            toast({
                title: "Synthesis Failed",
                description: error?.message || "Failed to generate speech. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleDownload = () => {
        download(`speech-${Date.now()}.${formData.outputFormat}`);
        toast({
            title: "Download Started",
            description: "Your audio file is being downloaded.",
        });
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Speaker className="h-8 w-8 text-blue-600" />
                            Speech Synthesizer
                        </h1>
                        <p className="text-muted-foreground">
                            Advanced text-to-speech synthesis with multiple voices and customization options
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                        <Button size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="synthesizer">Synthesizer</TabsTrigger>
                        <TabsTrigger value="batch">Batch Processing</TabsTrigger>
                        <TabsTrigger value="history">Synthesis History</TabsTrigger>
                        <TabsTrigger value="voices">Voice Library</TabsTrigger>
                    </TabsList>

                    <TabsContent value="synthesizer" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Input Panel */}
                            <div className="lg:col-span-2 space-y-6">
                                <TextInputPanel
                                    text={formData.text}
                                    onChange={(text) => setFormData({ ...formData, text })}
                                />

                                <VoiceSelector
                                    language={formData.language}
                                    onLanguageChange={(language) => setFormData({ ...formData, language, voiceModel: '' })}
                                    voiceModel={formData.voiceModel}
                                    onVoiceChange={(voiceModel) => setFormData({ ...formData, voiceModel })}
                                    availableVoices={availableVoices}
                                />

                                <ParameterControls
                                    speed={formData.speed}
                                    onSpeedChange={(speed) => setFormData({ ...formData, speed })}
                                    pitch={formData.pitch}
                                    onPitchChange={(pitch) => setFormData({ ...formData, pitch })}
                                    volume={formData.volume}
                                    onVolumeChange={(volume) => setFormData({ ...formData, volume })}
                                    emotion={formData.emotion}
                                    onEmotionChange={(emotion) => setFormData({ ...formData, emotion })}
                                    style={formData.style}
                                    onStyleChange={(style) => setFormData({ ...formData, style })}
                                    outputFormat={formData.outputFormat}
                                    onFormatChange={(outputFormat) => setFormData({ ...formData, outputFormat: outputFormat as any })}
                                />

                                {/* Generate Button */}
                                <div className="flex justify-center">
                                    <Button
                                        size="lg"
                                        onClick={handleSynthesize}
                                        disabled={!formData.text.trim() || !formData.voiceModel || isLoading}
                                        className="px-8"
                                    >
                                        <Zap className="h-5 w-5 mr-2" />
                                        {isLoading ? 'Generating...' : 'Generate Speech'}
                                    </Button>
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div className="space-y-6">
                                <SynthesisPreview
                                    isLoading={isLoading}
                                    isPlaying={isPlaying}
                                    lastResult={lastResult}
                                    onPlay={play}
                                    onPause={pause}
                                    onDownload={handleDownload}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="batch">
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Batch processing coming soon...</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Synthesis history coming soon...</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="voices">
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Voice library coming soon...</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ManagementLayout>
    );
}