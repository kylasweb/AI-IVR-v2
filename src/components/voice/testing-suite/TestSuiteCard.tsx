'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestTube, Play, Pause, Eye, Settings, Mic, Speaker, Users, Radio } from 'lucide-react';
import { VoiceStatusBadge } from '@/components/voice/common/VoiceStatusBadge';
import { TestSuite, TestCase } from '@/hooks/useTestSuite';

interface TestSuiteCardProps {
    suite: TestSuite;
    onRun: (suite: TestSuite) => void;
    onPause: (suite: TestSuite) => void;
    onViewDetails: (suite: TestSuite) => void;
    onConfigure?: (suite: TestSuite) => void;
}

const getTestTypeIcon = (type: string) => {
    switch (type) {
        case 'stt': return Mic;
        case 'tts': return Speaker;
        case 'voice_cloning': return Users;
        case 'speech_recognition': return Radio;
        default: return TestTube;
    }
};

/**
 * Card component for displaying a single test suite with its progress,
 * test cases, and action buttons.
 */
export function TestSuiteCard({ suite, onRun, onPause, onViewDetails, onConfigure }: TestSuiteCardProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TestTube className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{suite.name}</h3>
                            <p className="text-sm text-muted-foreground">{suite.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <VoiceStatusBadge status={suite.type} />
                        <VoiceStatusBadge status={suite.status} />
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{suite.progress}%</span>
                    </div>
                    <Progress value={suite.progress} className="w-full" />
                </div>

                {/* Results Summary */}
                <div className="grid grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                        <div className="text-lg font-semibold">{suite.results.totalTests}</div>
                        <div className="text-xs text-muted-foreground">Total Tests</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{suite.results.passedTests}</div>
                        <div className="text-xs text-muted-foreground">Passed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">{suite.results.failedTests}</div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold">{suite.results.avgAccuracy}%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold">{suite.results.avgLatency}s</div>
                        <div className="text-xs text-muted-foreground">Latency</div>
                    </div>
                </div>

                {/* Test Cases Preview */}
                {suite.testCases.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium mb-3">Recent Test Cases</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {suite.testCases.slice(0, 4).map((testCase) => {
                                const TestIcon = getTestTypeIcon(testCase.type);
                                return (
                                    <div key={testCase.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <div className={`p-1 rounded ${testCase.status === 'passed' ? 'bg-green-100' : testCase.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'}`}>
                                            <TestIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{testCase.name}</p>
                                            <p className="text-xs text-muted-foreground">{testCase.type.toUpperCase()}</p>
                                        </div>
                                        <VoiceStatusBadge status={testCase.status} variant="outline" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Updated {new Date(suite.updatedAt).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onViewDetails(suite)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                        </Button>
                        {suite.status === 'idle' && (
                            <Button size="sm" onClick={() => onRun(suite)}>
                                <Play className="h-4 w-4 mr-1" />
                                Run Suite
                            </Button>
                        )}
                        {suite.status === 'running' && (
                            <Button size="sm" variant="outline" onClick={() => onPause(suite)}>
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                            </Button>
                        )}
                        {onConfigure && (
                            <Button size="sm" variant="outline" onClick={() => onConfigure(suite)}>
                                <Settings className="h-4 w-4 mr-1" />
                                Configure
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default TestSuiteCard;
