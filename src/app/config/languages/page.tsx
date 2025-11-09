'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Globe,
    Volume2,
    Upload,
    Download,
    Settings,
    Mic,
    Globe as Languages,
    FileText as FileAudio,
    Brain,
    Zap,
    CheckCircle,
    AlertCircle,
    Play,
    Settings as Square
} from 'lucide-react';

export default function LanguageConfigPage() {
    const [activeLanguage, setActiveLanguage] = useState('malayalam');
    const [dialectConfig, setDialectConfig] = useState({
        pronunciation: [0.8],
        tonality: [0.7],
        culturalContext: [0.9],
        formalityLevel: [0.6]
    });

    const [ttsConfig, setTtsConfig] = useState({
        speed: [1.0],
        pitch: [1.0],
        volume: [0.8],
        pauseDuration: [0.5]
    });

    const [sttConfig, setSttConfig] = useState({
        sensitivity: [0.7],
        noiseReduction: [0.8],
        adaptiveLearning: true,
        dialectRecognition: true
    });

    const languages = {
        malayalam: {
            name: 'Malayalam',
            code: 'ml',
            dialects: [
                { id: 'central_kerala', name: 'Central Kerala', coverage: '95%' },
                { id: 'northern_kerala', name: 'Northern Kerala (Malabar)', coverage: '92%' },
                { id: 'southern_kerala', name: 'Southern Kerala (Travancore)', coverage: '88%' },
                { id: 'standard_malayalam', name: 'Standard Malayalam', coverage: '99%' }
            ],
            culturalMarkers: [
                'Respect honorifics (അവര്‍, താങ്കള്‍)',
                'Traditional greetings integration',
                'Religious context awareness',
                'Age-appropriate language modulation',
                'Regional festival references'
            ],
            ttsModels: 8,
            sttAccuracy: '94.2%'
        },
        english: {
            name: 'English',
            code: 'en',
            dialects: [
                { id: 'indian_english', name: 'Indian English', coverage: '96%' },
                { id: 'american_english', name: 'American English', coverage: '98%' },
                { id: 'british_english', name: 'British English', coverage: '97%' }
            ],
            culturalMarkers: [
                'Formal business language',
                'Casual conversation patterns',
                'Technical terminology',
                'Regional expressions'
            ],
            ttsModels: 12,
            sttAccuracy: '97.8%'
        },
        hindi: {
            name: 'Hindi',
            code: 'hi',
            dialects: [
                { id: 'standard_hindi', name: 'Standard Hindi', coverage: '94%' },
                { id: 'mumbai_hindi', name: 'Mumbai Hindi', coverage: '87%' },
                { id: 'delhi_hindi', name: 'Delhi Hindi', coverage: '91%' }
            ],
            culturalMarkers: [
                'Respectful address forms',
                'Regional variations',
                'Bollywood references',
                'Traditional values integration'
            ],
            ttsModels: 6,
            sttAccuracy: '92.1%'
        }
    };

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = () => {
        setIsProcessing(true);
        setUploadProgress(0);

        // Simulate file processing
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsProcessing(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Language Configuration</h1>
                        <p className="text-muted-foreground">
                            Configure dialectal support, cultural nuances, and voice models for multiple languages
                        </p>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                        New Feature
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Language Selector */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Languages
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.entries(languages).map(([key, lang]) => (
                                <div
                                    key={key}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${activeLanguage === key
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setActiveLanguage(key)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{lang.name}</p>
                                            <p className="text-sm text-muted-foreground">{lang.code}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-green-600">{lang.sttAccuracy}</p>
                                            <p className="text-xs text-muted-foreground">{lang.ttsModels} models</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Configuration Panel */}
                    <div className="lg:col-span-3">
                        <Tabs defaultValue="dialects" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="dialects">Dialects & Culture</TabsTrigger>
                                <TabsTrigger value="tts">TTS Settings</TabsTrigger>
                                <TabsTrigger value="stt">STT Settings</TabsTrigger>
                                <TabsTrigger value="audio">Audio Processing</TabsTrigger>
                            </TabsList>

                            <TabsContent value="dialects" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {languages[activeLanguage as keyof typeof languages]?.name} Dialect Configuration
                                        </CardTitle>
                                        <CardDescription>
                                            Configure regional dialects and cultural context understanding
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Dialect Support */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-medium">Supported Dialects</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {languages[activeLanguage as keyof typeof languages]?.dialects.map((dialect) => (
                                                    <div key={dialect.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <p className="font-medium">{dialect.name}</p>
                                                            <p className="text-sm text-muted-foreground">Coverage: {dialect.coverage}</p>
                                                        </div>
                                                        <Switch defaultChecked />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cultural Context Settings */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-medium">Cultural Context Parameters</Label>

                                            <div className="space-y-3">
                                                <div>
                                                    <Label>Pronunciation Accuracy: {dialectConfig.pronunciation[0].toFixed(1)}</Label>
                                                    <Slider
                                                        value={dialectConfig.pronunciation}
                                                        onValueChange={(value) => setDialectConfig({ ...dialectConfig, pronunciation: value })}
                                                        max={1}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Tonality Recognition: {dialectConfig.tonality[0].toFixed(1)}</Label>
                                                    <Slider
                                                        value={dialectConfig.tonality}
                                                        onValueChange={(value) => setDialectConfig({ ...dialectConfig, tonality: value })}
                                                        max={1}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Cultural Context: {dialectConfig.culturalContext[0].toFixed(1)}</Label>
                                                    <Slider
                                                        value={dialectConfig.culturalContext}
                                                        onValueChange={(value) => setDialectConfig({ ...dialectConfig, culturalContext: value })}
                                                        max={1}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Formality Level: {dialectConfig.formalityLevel[0].toFixed(1)}</Label>
                                                    <Slider
                                                        value={dialectConfig.formalityLevel}
                                                        onValueChange={(value) => setDialectConfig({ ...dialectConfig, formalityLevel: value })}
                                                        max={1}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cultural Markers */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-medium">Cultural Intelligence Features</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {languages[activeLanguage as keyof typeof languages]?.culturalMarkers.map((marker, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <span>{marker}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="tts" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Volume2 className="h-5 w-5" />
                                            Text-to-Speech Configuration
                                        </CardTitle>
                                        <CardDescription>
                                            Fine-tune voice synthesis parameters for natural speech generation
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Speech Speed: {ttsConfig.speed[0].toFixed(1)}x</Label>
                                                    <Slider
                                                        value={ttsConfig.speed}
                                                        onValueChange={(value) => setTtsConfig({ ...ttsConfig, speed: value })}
                                                        max={2}
                                                        min={0.5}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Pitch: {ttsConfig.pitch[0].toFixed(1)}</Label>
                                                    <Slider
                                                        value={ttsConfig.pitch}
                                                        onValueChange={(value) => setTtsConfig({ ...ttsConfig, pitch: value })}
                                                        max={2}
                                                        min={0.5}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Volume: {ttsConfig.volume[0].toFixed(1)}</Label>
                                                    <Slider
                                                        value={ttsConfig.volume}
                                                        onValueChange={(value) => setTtsConfig({ ...ttsConfig, volume: value })}
                                                        max={1}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Pause Duration: {ttsConfig.pauseDuration[0].toFixed(1)}s</Label>
                                                    <Slider
                                                        value={ttsConfig.pauseDuration}
                                                        onValueChange={(value) => setTtsConfig({ ...ttsConfig, pauseDuration: value })}
                                                        max={2}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button className="flex items-center gap-2">
                                                <Play className="h-4 w-4" />
                                                Test Voice
                                            </Button>
                                            <Button variant="outline">
                                                Reset to Defaults
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="stt" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mic className="h-5 w-5" />
                                            Speech-to-Text Configuration
                                        </CardTitle>
                                        <CardDescription>
                                            Configure speech recognition parameters for optimal accuracy
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Sensitivity: {sttConfig.sensitivity[0].toFixed(1)}</Label>
                                                    <Slider
                                                        value={sttConfig.sensitivity}
                                                        onValueChange={(value) => setSttConfig({ ...sttConfig, sensitivity: value })}
                                                        max={1}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                    <p className="text-sm text-muted-foreground">
                                                        Higher sensitivity captures more speech but may include background noise
                                                    </p>
                                                </div>

                                                <div>
                                                    <Label>Noise Reduction: {sttConfig.noiseReduction[0].toFixed(1)}</Label>
                                                    <Slider
                                                        value={sttConfig.noiseReduction}
                                                        onValueChange={(value) => setSttConfig({ ...sttConfig, noiseReduction: value })}
                                                        max={1}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <Label className="font-medium">Adaptive Learning</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Continuously improve based on user interactions
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={sttConfig.adaptiveLearning}
                                                        onCheckedChange={(checked) => setSttConfig({ ...sttConfig, adaptiveLearning: checked })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <Label className="font-medium">Dialect Recognition</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Automatically detect and adapt to regional dialects
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={sttConfig.dialectRecognition}
                                                        onCheckedChange={(checked) => setSttConfig({ ...sttConfig, dialectRecognition: checked })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="audio" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileAudio className="h-5 w-5" />
                                            Audio Processing & Transcription
                                        </CardTitle>
                                        <CardDescription>
                                            Upload and process audio files for AI knowledge base training
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* File Upload Section */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium mb-2">Upload Audio Files</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Supports MP3, WAV, FLAC, M4A files up to 100MB
                                            </p>
                                            <div className="flex gap-2 justify-center">
                                                <Button onClick={handleFileUpload} disabled={isProcessing}>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {isProcessing ? 'Processing...' : 'Upload Audio'}
                                                </Button>
                                                <Button variant="outline">
                                                    <Mic className="h-4 w-4 mr-2" />
                                                    Record Audio
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Processing Progress */}
                                        {isProcessing && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Processing audio file...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <Progress value={uploadProgress} className="h-2" />
                                            </div>
                                        )}

                                        {/* Intelligent Transcription Features */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Brain className="h-5 w-5 text-blue-600" />
                                                        <h4 className="font-medium">AI Transcription</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Intelligent transcription with context awareness and cultural markers
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Zap className="h-5 w-5 text-yellow-600" />
                                                        <h4 className="font-medium">Auto-Enhancement</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Automatic noise reduction, volume normalization, and quality enhancement
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button size="lg" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Save Configuration
                    </Button>
                    <Button size="lg" variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Settings
                    </Button>
                    <Button size="lg" variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Import Settings
                    </Button>
                </div>
            </div>
        </ManagementLayout>
    );
}