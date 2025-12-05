'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTTS } from '@/lib/tts/hooks/useTTS';
import { toast } from '@/hooks/use-toast';
import {
    Phone as Headphones,
    Shield,
    Users,
    Mic,
    Activity,
    CheckCircle,
    AlertCircle,
    Settings,
    Play,
    Square,
    RotateCcw,
    Loader2
} from 'lucide-react';

export default function VoiceBiometricsPage() {
    // TTS integration for voice verification prompts
    const {
        synthesize,
        loading: ttsLoading,
        isPlaying,
        play,
        stop,
        error: ttsError
    } = useTTS();

    const [isRecording, setIsRecording] = useState(false);
    const [recordingProgress, setRecordingProgress] = useState(75);

    // Play verification prompt using TTS
    const playVerificationPrompt = async () => {
        try {
            const result = await synthesize(
                "Please say: My voice is my password. Verify me.",
                { languageCode: 'en-US', speed: 1.0 }
            );
            if (result?.audio_url) {
                play(result.audio_url);
            }
        } catch (error) {
            toast({
                title: "TTS Error",
                description: ttsError || "Could not generate voice prompt",
                variant: "destructive",
            });
        }
    };

    const handleStartSession = () => {
        playVerificationPrompt();
        toast({
            title: "Session Started",
            description: "Voice biometric session is now active",
        });
    };

    return (
        <ManagementLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Voice Biometrics</h1>
                        <p className="text-gray-600 mt-2">
                            Advanced voice authentication and identity verification system
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                        </Button>
                        <Button size="sm" onClick={handleStartSession} disabled={ttsLoading}>
                            {ttsLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : isPlaying ? (
                                <Square className="mr-2 h-4 w-4" />
                            ) : (
                                <Play className="mr-2 h-4 w-4" />
                            )}
                            {isPlaying ? 'Stop' : 'Start Session'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2,345</div>
                            <p className="text-xs text-muted-foreground">
                                +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Authentication Rate</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">98.7%</div>
                            <p className="text-xs text-muted-foreground">
                                +2.1% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fraud Prevention</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">99.2%</div>
                            <p className="text-xs text-muted-foreground">
                                +0.8% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Voice Print Registration</CardTitle>
                            <CardDescription>
                                Register and manage user voice biometric profiles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Registration Progress</span>
                                    <Badge variant="outline">Active</Badge>
                                </div>
                                <Progress value={recordingProgress} className="w-full" />
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Mic className="mr-2 h-4 w-4" />
                                        Start Recording
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Play className="mr-2 h-4 w-4" />
                                        Pause
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Real-time Authentication</CardTitle>
                            <CardDescription>
                                Monitor live voice authentication sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">System Status</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">Online</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Processing Speed</span>
                                        <span>1.2s avg</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Queue Length</span>
                                        <span>3 pending</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Success Rate</span>
                                        <span>98.7%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Authentication Logs</CardTitle>
                        <CardDescription>
                            Latest voice biometric authentication attempts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Headphones className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium">User {i}234567</p>
                                            <p className="text-xs text-gray-500">2 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={i % 3 === 0 ? "destructive" : "default"}>
                                            {i % 3 === 0 ? "Failed" : "Success"}
                                        </Badge>
                                        <span className="text-sm text-gray-500">95.{i}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ManagementLayout>
    );
}