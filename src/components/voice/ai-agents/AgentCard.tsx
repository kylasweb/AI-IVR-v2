'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Activity, Globe, Mic, Play, Pause, Eye, Edit, Settings } from 'lucide-react';
import { VoiceStatusBadge } from '@/components/voice/common/VoiceStatusBadge';
import { VoiceAgent } from '@/hooks/useVoiceAgents';

interface AgentCardProps {
    agent: VoiceAgent;
    onTest?: (agent: VoiceAgent) => void;
    onView?: (agent: VoiceAgent) => void;
    onEdit?: (agent: VoiceAgent) => void;
    onToggleStatus?: (agent: VoiceAgent) => void;
    testingAgentId?: string | null;
    isPlaying?: boolean;
    ttsLoading?: boolean;
}

/**
 * Card component for displaying a single voice AI agent.
 */
export function AgentCard({
    agent,
    onTest,
    onView,
    onEdit,
    onToggleStatus,
    testingAgentId,
    isPlaying,
    ttsLoading
}: AgentCardProps) {
    const isTestingThisAgent = testingAgentId === agent.id;

    return (
        <Card>
            <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${agent.status === 'active' ? 'bg-green-100' : agent.status === 'training' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground">{agent.description}</p>
                        </div>
                    </div>
                    <VoiceStatusBadge status={agent.status} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            Language
                        </div>
                        <div className="font-medium">{agent.language}</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Mic className="h-3 w-3" />
                            Accuracy
                        </div>
                        <div className="font-medium">{agent.accuracy}%</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            Response
                        </div>
                        <div className="font-medium">{agent.responseTime}s</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground">Daily Calls</div>
                        <div className="font-medium">{agent.dailyCalls}</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Voice: {agent.voice}
                    </div>
                    <div className="flex gap-2">
                        {onTest && agent.status === 'active' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onTest(agent)}
                                disabled={ttsLoading && isTestingThisAgent}
                            >
                                {ttsLoading && isTestingThisAgent ? (
                                    <Activity className="h-4 w-4 animate-spin" />
                                ) : isPlaying && isTestingThisAgent ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                <span className="ml-1">
                                    {isPlaying && isTestingThisAgent ? 'Stop' : 'Test'}
                                </span>
                            </Button>
                        )}
                        {onView && (
                            <Button size="sm" variant="outline" onClick={() => onView(agent)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}
                        {onEdit && (
                            <Button size="sm" variant="outline" onClick={() => onEdit(agent)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {onToggleStatus && (
                            <Button size="sm" variant="outline" onClick={() => onToggleStatus(agent)}>
                                <Settings className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default AgentCard;
