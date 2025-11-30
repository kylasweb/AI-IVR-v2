'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManagementLayout from '@/components/layout/management-layout';

export default function MalayalamTTSDemo() {
    const [text, setText] = useState('നമസ്കാരം! എങ്ങനെയുണ്ട്? ഞാൻ മലയാളം സംസാരിക്കാൻ കഴിയുന്ന AI സഹായിയാണ്.');
    const [selectedVoice, setSelectedVoice] = useState('ml-IN-Wavenet-A');
    const [emotion, setEmotion] = useState('neutral');
    const [dialect, setDialect] = useState('standard');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<any>(null);
    const [volume, setVolume] = useState([80]);

    const voices = [
        {
            id: 'ml-IN-Wavenet-A',
            name: 'മലയാളം (സ്ത്രീ) - Neural',
            description: 'High-quality neural female voice',
            gender: 'female',
            quality: 'wavenet',
            recommended: true
        },
        {
            id: 'ml-IN-Wavenet-B',
            name: 'മലയാളം (പുരുഷൻ) - Neural',
            description: 'High-quality neural male voice',
            gender: 'male',
            quality: 'wavenet',
            recommended: true
        },
        {
            id: 'ml-IN-Standard-A',
            name: 'മലയാളം (സ്ത്രീ) - Standard',
            description: 'Standard female voice',
            gender: 'female',
            quality: 'standard'
        },
        {
            id: 'ml-IN-Standard-B',
            name: 'മലയാളം (പുരുഷൻ) - Standard',
            description: 'Standard male voice',
            gender: 'male',
            quality: 'standard'
        }
    ];

    const dialects = [
        { id: 'standard', name: 'സ്റ്റാൻഡേർഡ് (Standard)', description: 'Neutral Malayalam' },
        { id: 'travancore', name: 'തിരുവിതാംകൂർ (Travancore)', description: 'Southern dialect' },
        { id: 'malabar', name: 'മലബാർ (Malabar)', description: 'Northern dialect' },
        { id: 'cochin', name: 'കൊച്ചി (Cochin)', description: 'Central dialect' }
    ];

    const emotions = [
        { id: 'neutral', name: 'സാധാരണം (Neutral)', icon: '😐' },
        { id: 'happy', name: 'സന്തോഷം (Happy)', icon: '😊' },
        { id: 'professional', name: 'പ്രൊഫഷണൽ (Professional)', icon: '💼' },
        { id: 'sad', name: 'ദുഃഖം (Sad)', icon: '😢' }
    ];

    const samplePhrases = [
        {
            category: 'Greetings',
            phrases: [
                'നമസ്കാരം! എങ്ങനെയുണ്ട്?',
                'സുഖമാണോ? എല്ലാം ശരിയാണോ?',
                'വിളിച്ചതിന് നന്ദി. എങ്ങനെ സഹായിക്കാം?'
            ]
        },
        {
            category: 'Customer Service',
            phrases: [
                'ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് ആവശ്യം?',
                'നിങ്ങളുടെ അന്വേഷണം എനിക്ക് മനസ്സിലായി. ഒരു നിമിഷം കാത്തിരിക്കുക.',
                'നിങ്ങളുടെ സഹകരണത്തിന് നന്ദി. വീണ്ടും കാണാം!'
            ]
        },
        {
            category: 'Manglish',
            phrases: [
                'Namaskaram! Phone cheyyunnathinu nanni.',
                'Ningalude vishayam njan manassilaakki. Help cheyyam.',
                'Enthu problem aanu? Parayamo?'
            ]
        }
    ];

    const handleGenerateSpeech = async () => {
        if (!text.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/speech/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    language: 'ml-IN',
                    voiceName: selectedVoice,
                    emotion: emotion,
                    dialect: dialect
                })
            });

            if (!response.ok) {
                throw new Error('TTS generation failed');
            }

            const data = await response.json();
            setLastResult(data.result);

            // In a real implementation, this would use the actual audio data
            // For demo purposes, we're showing the result structure
            console.log('TTS Result:', data.result);

        } catch (error) {
            console.error('Error generating speech:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayPause = () => {
        // In production, this would control actual audio playback
        setIsPlaying(!isPlaying);
    };

    const handleDownload = () => {
        // In production, this would download the generated audio
        console.log('Download audio');
    };

    return (
        <ManagementLayout
            title="Malayalam TTS Demo"
            subtitle="മലയാളം ടെക്സ്റ്റ്-ടു-സ്പീച്ച് • High-Quality Cloud Voices"
        >
            <div className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Control Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Text Input */}
                        <Card className="shadow-lg border-2 border-purple-100">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle>Text Input</CardTitle>
                                <CardDescription>
                                    Enter Malayalam, Manglish, or English text
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="നിങ്ങളുടെ ടെക്സ്റ്റ് ഇവിടെ ടൈപ്പ് ചെയ്യുക..."
                                    className="min-h-[150px] text-lg font-malayalam"
                                    dir="auto"
                                />
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-gray-500">
                                        {text.length} characters
                                    </span>
                                    <Button
                                        onClick={handleGenerateSpeech}
                                        disabled={isLoading || !text.trim()}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-4 w-4" />
                                                Generate Speech
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audio Player */}
                        {lastResult && (
                            <Card className="shadow-lg border-2 border-blue-100">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                                    <CardTitle>Audio Player</CardTitle>
                                    <CardDescription>
                                        Voice: {voices.find(v => v.id === selectedVoice)?.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {/* Waveform Visualization Placeholder */}
                                        <div className="h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                            <div className="flex items-end gap-1 h-16">
                                                {[...Array(40)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-1 bg-purple-600 rounded-full animate-pulse"
                                                        style={{
                                                            height: `${Math.random() * 100}%`,
                                                            animationDelay: `${i * 0.05}s`
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Playback Controls */}
                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={handlePlayPause}
                                                size="lg"
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                {isPlaying ? (
                                                    <Pause className="h-5 w-5" />
                                                ) : (
                                                    <Play className="h-5 w-5" />
                                                )}
                                            </Button>

                                            <div className="flex-1 flex items-center gap-3">
                                                <Volume2 className="h-5 w-5 text-gray-600" />
                                                <Slider
                                                    value={volume}
                                                    onValueChange={setVolume}
                                                    max={100}
                                                    step={1}
                                                    className="flex-1"
                                                />
                                                <span className="text-sm text-gray-600 w-12">
                                                    {volume[0]}%
                                                </span>
                                            </div>

                                            <Button
                                                onClick={handleDownload}
                                                variant="outline"
                                                size="lg"
                                            >
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        {/* Audio Info */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                            <div>
                                                <p className="text-sm text-gray-500">Duration</p>
                                                <p className="text-lg font-semibold">
                                                    {lastResult.duration}s
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Quality</p>
                                                <p className="text-lg font-semibold capitalize">
                                                    {lastResult.quality}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Engine</p>
                                                <p className="text-lg font-semibold capitalize">
                                                    {lastResult.ttsEngine?.replace('_', ' ')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Processing Time</p>
                                                <p className="text-lg font-semibold">
                                                    {Math.round(lastResult.processingTime)}ms
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Sample Phrases */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Sample Phrases</CardTitle>
                                <CardDescription>
                                    Click to try common Malayalam phrases
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="Greetings">
                                    <TabsList className="grid w-full grid-cols-3">
                                        {samplePhrases.map((category) => (
                                            <TabsTrigger key={category.category} value={category.category}>
                                                {category.category}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {samplePhrases.map((category) => (
                                        <TabsContent key={category.category} value={category.category} className="space-y-2">
                                            {category.phrases.map((phrase, idx) => (
                                                <Button
                                                    key={idx}
                                                    variant="outline"
                                                    className="w-full justify-start text-left h-auto py-3"
                                                    onClick={() => setText(phrase)}
                                                >
                                                    <Play className="mr-2 h-4 w-4 flex-shrink-0" />
                                                    <span className="font-malayalam">{phrase}</span>
                                                </Button>
                                            ))}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Settings Panel */}
                    <div className="space-y-6">
                        {/* Voice Selection */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Voice Selection</CardTitle>
                                <CardDescription>
                                    Choose your preferred voice
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {voices.map((voice) => (
                                    <Button
                                        key={voice.id}
                                        variant={selectedVoice === voice.id ? 'default' : 'outline'}
                                        className={`w-full justify-start h-auto py-4 ${selectedVoice === voice.id
                                            ? 'bg-purple-600 hover:bg-purple-700'
                                            : ''
                                            }`}
                                        onClick={() => setSelectedVoice(voice.id)}
                                    >
                                        <div className="text-left w-full">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{voice.name}</p>
                                                {voice.recommended && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Recommended
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs opacity-80">
                                                {voice.description}
                                            </p>
                                        </div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Dialect Selection */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Dialect</CardTitle>
                                <CardDescription>
                                    Regional variation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select value={dialect} onValueChange={setDialect}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dialects.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Emotion/Style */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Emotion Style</CardTitle>
                                <CardDescription>
                                    Voice tone and style
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {emotions.map((e) => (
                                    <Button
                                        key={e.id}
                                        variant={emotion === e.id ? 'default' : 'outline'}
                                        className={`w-full justify-start ${emotion === e.id
                                            ? 'bg-purple-600 hover:bg-purple-700'
                                            : ''
                                            }`}
                                        onClick={() => setEmotion(e.id)}
                                    >
                                        <span className="mr-2 text-xl">{e.icon}</span>
                                        {e.name}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ManagementLayout>
    );
}
