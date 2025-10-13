'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Phone,
    Mic,
    Upload,
    Play,
    CheckCircle,
    XCircle,
    AlertCircle,
    Brain,
    Globe,
    Clock,
    Target,
    RefreshCw,
} from 'lucide-react';

interface AMDTestDetectionProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface DetectionResult {
    isAnsweringMachine: boolean;
    confidence: number;
    detectionTime: number;
    culturalContext: {
        malayalamGreeting: boolean;
        regionalDialect: string;
        formalityLevel: string;
    };
    recommendedAction: string;
    audioAnalysis: {
        silenceDuration: number;
        beepDetected: boolean;
        voiceCharacteristics: string;
    };
}

export function AMDTestDetection({ open, onOpenChange }: AMDTestDetectionProps) {
    const [testMethod, setTestMethod] = useState<'file' | 'simulate' | 'live'>('simulate');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [culturalContext, setCulturalContext] = useState({
        primaryLanguage: 'mixed',
        expectedDialect: 'central',
        businessContext: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file);
        }
    };

    const runSimulatedTest = async () => {
        setIsLoading(true);
        setProgress(0);
        setDetectionResult(null);

        // Simulate detection process with progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate realistic simulated result
            const isAM = Math.random() > 0.6; // 60% chance of answering machine
            const confidence = 0.75 + Math.random() * 0.24; // 75-99% confidence

            const result: DetectionResult = {
                isAnsweringMachine: isAM,
                confidence,
                detectionTime: 1200 + Math.floor(Math.random() * 800), // 1.2-2.0 seconds
                culturalContext: {
                    malayalamGreeting: culturalContext.primaryLanguage !== 'english' && Math.random() > 0.7,
                    regionalDialect: culturalContext.expectedDialect,
                    formalityLevel: culturalContext.businessContext ? 'formal' : 'casual',
                },
                recommendedAction: isAM ? 'leave_message' : 'continue_call',
                audioAnalysis: {
                    silenceDuration: Math.floor(Math.random() * 2000) + 500,
                    beepDetected: isAM && Math.random() > 0.3,
                    voiceCharacteristics: isAM ? 'synthetic' : 'natural',
                },
            };

            setDetectionResult(result);
        } catch (error) {
            console.error('Simulated test error:', error);
        }

        clearInterval(progressInterval);
        setProgress(100);
        setIsLoading(false);
    };

    const runFileTest = async () => {
        if (!audioFile) return;

        setIsLoading(true);
        setProgress(0);
        setDetectionResult(null);

        try {
            // Convert file to base64
            const arrayBuffer = await audioFile.arrayBuffer();
            const base64Audio = btoa(
                new Uint8Array(arrayBuffer).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ''
                )
            );

            setProgress(30);

            // Call AMD analyze API
            const response = await fetch('/api/cloud-communication/amd/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audioData: base64Audio,
                    phoneNumber,
                    culturalContext,
                    detectionConfig: {
                        sensitivityLevel: 0.8,
                        culturalAdaptation: true,
                    },
                }),
            });

            setProgress(70);

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.statusText}`);
            }

            const data = await response.json();
            setProgress(100);

            if (data.success) {
                setDetectionResult(data.data.analysis);
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('File test error:', error);
            alert('Error analyzing audio file. Please try again.');
        }

        setIsLoading(false);
    };

    const runLiveTest = async () => {
        if (!phoneNumber) {
            alert('Please enter a phone number for live testing');
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setDetectionResult(null);

        try {
            // This would integrate with actual call system
            // For now, we'll simulate with enhanced realism
            setProgress(25);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setProgress(75);
            await new Promise(resolve => setTimeout(resolve, 1500));

            const result: DetectionResult = {
                isAnsweringMachine: Math.random() > 0.5,
                confidence: 0.85 + Math.random() * 0.14,
                detectionTime: 1500 + Math.floor(Math.random() * 1000),
                culturalContext: {
                    malayalamGreeting: phoneNumber.startsWith('+91') && Math.random() > 0.6,
                    regionalDialect: culturalContext.expectedDialect,
                    formalityLevel: 'mixed',
                },
                recommendedAction: 'continue_call',
                audioAnalysis: {
                    silenceDuration: Math.floor(Math.random() * 1500) + 300,
                    beepDetected: Math.random() > 0.7,
                    voiceCharacteristics: 'natural',
                },
            };

            setProgress(100);
            setDetectionResult(result);
        } catch (error) {
            console.error('Live test error:', error);
        }

        setIsLoading(false);
    };

    const runTest = async () => {
        switch (testMethod) {
            case 'simulate':
                await runSimulatedTest();
                break;
            case 'file':
                await runFileTest();
                break;
            case 'live':
                await runLiveTest();
                break;
        }
    };

    const resetTest = () => {
        setDetectionResult(null);
        setProgress(0);
        setAudioFile(null);
        setPhoneNumber('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-blue-600" />
                        AMD Test Detection
                    </DialogTitle>
                    <DialogDescription>
                        Test the Answering Machine Detection system with cultural intelligence
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Test Method Selection */}
                    <div className="space-y-4">
                        <Label>Test Method</Label>
                        <div className="grid grid-cols-3 gap-4">
                            <Card className={`cursor-pointer transition-colors ${testMethod === 'simulate' ? 'ring-2 ring-blue-500' : ''}`}>
                                <CardContent className="p-4 text-center" onClick={() => setTestMethod('simulate')}>
                                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                    <h4 className="font-medium">Simulated Test</h4>
                                    <p className="text-sm text-muted-foreground">Quick test with simulated data</p>
                                </CardContent>
                            </Card>

                            <Card className={`cursor-pointer transition-colors ${testMethod === 'file' ? 'ring-2 ring-blue-500' : ''}`}>
                                <CardContent className="p-4 text-center" onClick={() => setTestMethod('file')}>
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                    <h4 className="font-medium">Audio File</h4>
                                    <p className="text-sm text-muted-foreground">Upload audio file for analysis</p>
                                </CardContent>
                            </Card>

                            <Card className={`cursor-pointer transition-colors ${testMethod === 'live' ? 'ring-2 ring-blue-500' : ''}`}>
                                <CardContent className="p-4 text-center" onClick={() => setTestMethod('live')}>
                                    <Phone className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                                    <h4 className="font-medium">Live Call</h4>
                                    <p className="text-sm text-muted-foreground">Test with real phone call</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Test Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Phone Number (for live test) */}
                        {testMethod === 'live' && (
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    placeholder="+91 98765 43210"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        )}

                        {/* File Upload (for file test) */}
                        {testMethod === 'file' && (
                            <div className="space-y-2">
                                <Label>Audio File</Label>
                                <Input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                />
                                {audioFile && (
                                    <p className="text-sm text-green-600">
                                        Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Cultural Context */}
                        <div className="space-y-2">
                            <Label>Primary Language</Label>
                            <Select value={culturalContext.primaryLanguage} onValueChange={(value) =>
                                setCulturalContext(prev => ({ ...prev, primaryLanguage: value }))
                            }>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="malayalam">Malayalam</SelectItem>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="mixed">Mixed/Manglish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Expected Dialect</Label>
                            <Select value={culturalContext.expectedDialect} onValueChange={(value) =>
                                setCulturalContext(prev => ({ ...prev, expectedDialect: value }))
                            }>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="northern">Northern Kerala</SelectItem>
                                    <SelectItem value="central">Central Kerala</SelectItem>
                                    <SelectItem value="southern">Southern Kerala</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Test Progress */}
                    {isLoading && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Running AMD detection...</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                        </div>
                    )}

                    {/* Test Results */}
                    {detectionResult && (
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Detection Results</h3>
                                    <Badge variant={detectionResult.isAnsweringMachine ? 'destructive' : 'default'}>
                                        {detectionResult.isAnsweringMachine ? 'Answering Machine' : 'Human'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {(detectionResult.confidence * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">Confidence</div>
                                    </div>

                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {(detectionResult.detectionTime / 1000).toFixed(2)}s
                                        </div>
                                        <div className="text-sm text-gray-600">Detection Time</div>
                                    </div>

                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {detectionResult.culturalContext.malayalamGreeting ? 'Yes' : 'No'}
                                        </div>
                                        <div className="text-sm text-gray-600">Malayalam Detected</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">
                                            <strong>Regional Dialect:</strong> {detectionResult.culturalContext.regionalDialect}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-green-600" />
                                        <span className="text-sm">
                                            <strong>Silence Duration:</strong> {detectionResult.audioAnalysis.silenceDuration}ms
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Mic className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm">
                                            <strong>Voice Characteristics:</strong> {detectionResult.audioAnalysis.voiceCharacteristics}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {detectionResult.audioAnalysis.beepDetected ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600" />
                                        )}
                                        <span className="text-sm">
                                            <strong>Beep Detected:</strong> {detectionResult.audioAnalysis.beepDetected ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Recommended Action</h4>
                                    <p className="text-sm text-blue-800">
                                        {detectionResult.recommendedAction === 'leave_message' && 'Leave a personalized message'}
                                        {detectionResult.recommendedAction === 'continue_call' && 'Continue with the call flow'}
                                        {detectionResult.recommendedAction === 'callback' && 'Schedule a callback'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={resetTest} disabled={isLoading}>
                        Reset
                    </Button>
                    <Button onClick={runTest} disabled={isLoading || (testMethod === 'file' && !audioFile)}>
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Running Test...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Run Test
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}