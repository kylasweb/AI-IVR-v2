'use client';

import { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { TextInput } from './components/TextInput';
import { AudioPlayer } from './components/AudioPlayer';
import { SamplePhrases } from './components/SamplePhrases';
import { SettingsPanel } from './components/SettingsPanel';
import { useMalayalamTTS } from './hooks/useMalayalamTTS';
import { MALAYALAM_VOICES, type VoiceId, type DialectId, type EmotionId } from './constants';

export default function MalayalamTTSDemo() {
    // State management
    const [text, setText] = useState('നമസ്കാരം! എങ്ങനെയുണ്ട്? ഞാൻ മലയാളം സംസാരിക്കാൻ കഴിയുന്ന AI സഹായിയാണ്.');
    const [selectedVoice, setSelectedVoice] = useState<VoiceId>('ml-IN-Wavenet-A');
    const [emotion, setEmotion] = useState<EmotionId>('neutral');
    const [dialect, setDialect] = useState<DialectId>('standard');
    const [volume, setVolume] = useState([80]);

    // TTS hook
    const { isLoading, isPlaying, lastResult, generateSpeech, playPause, download } = useMalayalamTTS();

    // Handlers
    const handleGenerate = () => {
        generateSpeech(text, emotion, volume[0], selectedVoice, dialect);
    };

    const voiceName = MALAYALAM_VOICES.find(v => v.id === selectedVoice)?.name;

    return (
        <ManagementLayout
            title="Malayalam TTS Demo"
            subtitle="മലയാളം ടെക്സ്റ്റ്-ടു-സ്പീച്ച് • High-Quality Cloud Voices"
        >
            <div className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Control Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <TextInput
                            text={text}
                            onChange={setText}
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                        />

                        <AudioPlayer
                            lastResult={lastResult}
                            isPlaying={isPlaying}
                            volume={volume}
                            onPlayPause={playPause}
                            onVolumeChange={setVolume}
                            onDownload={download}
                            voiceName={voiceName}
                        />

                        <SamplePhrases onSelectPhrase={setText} />
                    </div>

                    {/* Settings Panel */}
                    <SettingsPanel
                        selectedVoice={selectedVoice}
                        onVoiceChange={setSelectedVoice}
                        dialect={dialect}
                        onDialectChange={setDialect}
                        emotion={emotion}
                        onEmotionChange={setEmotion}
                    />
                </div>
            </div>
        </ManagementLayout>
    );
}
