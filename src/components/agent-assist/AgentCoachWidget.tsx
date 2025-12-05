'use client';

/**
 * Agent Coach Widget
 * Floating real-time coaching overlay with Pusher integration
 */

import React, { useState, useEffect } from 'react';
import {
    X,
    Minimize2,
    Maximize2,
    AlertTriangle,
    MessageSquare,
    Gauge,
    Activity,
    Volume2,
    Wifi,
    WifiOff,
    Shield
} from 'lucide-react';
import { useAgentCoaching, CoachingEvent } from '@/hooks/use-agent-coaching';

interface AgentCoachWidgetProps {
    isCallActive: boolean;
    sentiment?: number; // Optional, can come from Pusher instead
    callDuration: number;
    callId?: string;
    agentId?: string;
}

export default function AgentCoachWidget({
    isCallActive,
    sentiment: propSentiment,
    callDuration,
    callId,
    agentId = 'agent-default'
}: AgentCoachWidgetProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Use real-time Pusher coaching hook
    const {
        isConnected,
        sentiment: pusherSentiment,
        activeEvents,
        cadenceWarning,
        dismissEvent,
        dismissAllEvents,
    } = useAgentCoaching({
        agentId,
        callId,
    });

    // Use pusher sentiment if available, otherwise fall back to prop
    const sentiment = pusherSentiment?.score ?? propSentiment ?? 0.5;
    const sentimentLabel = pusherSentiment?.label ?? 'Neutral';

    // Get icon for event type
    const getEventIcon = (event: CoachingEvent) => {
        switch (event.type) {
            case 'warning':
            case 'sentiment':
                return <AlertTriangle className={`w-4 h-4 ${event.priority === 'urgent' ? 'text-red-400' : 'text-yellow-400'}`} />;
            case 'compliance':
                return <Shield className="w-4 h-4 text-red-400" />;
            case 'cadence':
                return <Gauge className="w-4 h-4 text-orange-400" />;
            default:
                return <MessageSquare className="w-4 h-4 text-blue-400" />;
        }
    };

    // Get event label
    const getEventLabel = (event: CoachingEvent) => {
        switch (event.type) {
            case 'script': return 'Suggested Script';
            case 'warning': return 'Warning';
            case 'sentiment': return 'Sentiment Alert';
            case 'cadence': return 'Cadence';
            case 'compliance': return 'Compliance';
            default: return 'Alert';
        }
    };

    if (!isVisible || !isCallActive) return null;

    return (
        <>
            {/* Floating Widget */}
            <div
                className={`fixed right-4 bottom-4 z-50 transition-all duration-300 ${isMinimized ? 'w-14' : 'w-80'
                    }`}
            >
                <div className="bg-gray-800/95 backdrop-blur rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-700/50 border-b border-gray-600">
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <Wifi className="w-3 h-3 text-green-400" />
                            ) : (
                                <WifiOff className="w-3 h-3 text-red-400" />
                            )}
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            {!isMinimized && <span className="text-sm font-medium">AI Coach</span>}
                        </div>
                        <div className="flex items-center gap-1">
                            {!isMinimized && activeEvents.length > 0 && (
                                <button
                                    onClick={dismissAllEvents}
                                    className="text-xs text-gray-400 hover:text-white px-2"
                                >
                                    Clear all
                                </button>
                            )}
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1 hover:bg-gray-600 rounded"
                            >
                                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                            </button>
                            {!isMinimized && (
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-1 hover:bg-gray-600 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
                            {/* Sentiment Indicator */}
                            <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">Sentiment</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{sentimentLabel}</span>
                                    <div className={`font-semibold ${sentiment < 0.3 ? 'text-red-400' :
                                        sentiment < 0.5 ? 'text-yellow-400' : 'text-green-400'
                                        }`}>
                                        {Math.round(sentiment * 100)}%
                                    </div>
                                </div>
                            </div>

                            {/* Connection Status */}
                            {!isConnected && (
                                <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400 flex items-center gap-2">
                                    <WifiOff className="w-3 h-3" />
                                    Running in offline mode
                                </div>
                            )}

                            {/* Active Coaching Events */}
                            {activeEvents.map(event => (
                                <div
                                    key={event.id}
                                    className={`p-3 rounded-lg border ${event.priority === 'urgent' ? 'bg-red-500/10 border-red-500/30' :
                                        event.priority === 'high' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                            'bg-blue-500/10 border-blue-500/30'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getEventIcon(event)}
                                                <span className="text-xs font-medium uppercase text-gray-400">
                                                    {getEventLabel(event)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-200">{event.message}</p>
                                            {event.data?.triggerWord && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Triggered by: "{event.data.triggerWord}"
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => dismissEvent(event.id)}
                                            className="p-1 hover:bg-gray-600 rounded flex-shrink-0"
                                        >
                                            <X className="w-3 h-3 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {activeEvents.length === 0 && (
                                <div className="text-center text-gray-400 py-4">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Listening for coaching cues...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Minimized badge */}
                    {isMinimized && activeEvents.length > 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                            {activeEvents.length}
                        </div>
                    )}
                </div>
            </div>

            {/* Cadence Warning Flash */}
            {cadenceWarning && (
                <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
                    <div className={`px-12 py-6 rounded-2xl ${cadenceWarning.includes('SLOW') ? 'bg-red-500/90' : 'bg-yellow-500/90'
                        } shadow-2xl animate-pulse`}>
                        <div className="flex items-center gap-4">
                            <Gauge className="w-10 h-10 text-white" />
                            <span className="text-3xl font-bold text-white">{cadenceWarning}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
