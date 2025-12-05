'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Volume2, Users, Mic, Database } from 'lucide-react';
import { VoiceSystemStatus } from '@/hooks/useCommandCenter';

interface SystemStatusCardsProps {
    status: VoiceSystemStatus;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'operational': return 'text-green-600 bg-green-100';
        case 'degraded': return 'text-yellow-600 bg-yellow-100';
        case 'down': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

/**
 * Grid of status cards for Voice Command Center.
 */
export function SystemStatusCards({ status }: SystemStatusCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Speech Synthesis</CardTitle>
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(status.speechSynthesis.status)}>
                            {status.speechSynthesis.status}
                        </Badge>
                        <span className="text-2xl font-bold">{status.speechSynthesis.activeModels}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {status.speechSynthesis.totalRequests.toLocaleString()} requests • {status.speechSynthesis.avgResponseTime}s avg
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Voice Cloning</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(status.voiceCloning.status)}>
                            {status.voiceCloning.status}
                        </Badge>
                        <span className="text-2xl font-bold">{status.voiceCloning.trainingJobs}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {status.voiceCloning.completedModels} models • {status.voiceCloning.avgTrainingTime}min avg
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Speech Recognition</CardTitle>
                    <Mic className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(status.speechRecognition.status)}>
                            {status.speechRecognition.status}
                        </Badge>
                        <span className="text-2xl font-bold">{status.speechRecognition.activeSessions}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {status.speechRecognition.accuracy}% accuracy • {status.speechRecognition.languages.length} languages
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Voice Data</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{status.voiceData.totalSamples.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">samples</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {status.voiceData.storageUsed}GB / {status.voiceData.storageLimit}GB used
                    </p>
                    <Progress
                        value={(status.voiceData.storageUsed / status.voiceData.storageLimit) * 100}
                        className="mt-2"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export default SystemStatusCards;
