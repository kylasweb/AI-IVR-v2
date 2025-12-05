'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Upload } from 'lucide-react';
import { RecordingState } from '@/hooks/useVoiceCloning';

interface RecordingInterfaceProps {
    recordingState: RecordingState;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onUpload?: () => void;
}

/**
 * Recording interface for capturing voice samples.
 */
export function RecordingInterface({
    recordingState,
    onStartRecording,
    onStopRecording,
    onUpload
}: RecordingInterfaceProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Record Voice Samples</CardTitle>
                <CardDescription>
                    Record at least 10 samples to create a high-quality voice clone
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Recording Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span>Samples Recorded</span>
                        <span>{recordingState.recordedChunks} / {recordingState.totalChunks}</span>
                    </div>
                    <Progress
                        value={(recordingState.recordedChunks / recordingState.totalChunks) * 100}
                        className="h-3"
                    />
                </div>

                {/* Current Recording */}
                {recordingState.isRecording && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="font-medium text-red-600">Recording...</span>
                        </div>
                        <Progress value={recordingState.recordingProgress} className="h-2" />
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-3">
                    {!recordingState.isRecording ? (
                        <Button className="flex-1" onClick={onStartRecording}>
                            <Mic className="h-4 w-4 mr-2" />
                            Start Recording
                        </Button>
                    ) : (
                        <Button variant="destructive" className="flex-1" onClick={onStopRecording}>
                            <Square className="h-4 w-4 mr-2" />
                            Stop Recording
                        </Button>
                    )}
                    {onUpload && (
                        <Button variant="outline" onClick={onUpload}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                        </Button>
                    )}
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="font-medium text-blue-800 mb-1">Tips for best results:</p>
                    <ul className="text-blue-700 list-disc list-inside space-y-1">
                        <li>Use a quiet environment</li>
                        <li>Speak clearly and naturally</li>
                        <li>Record varied sentences</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}

export default RecordingInterface;
