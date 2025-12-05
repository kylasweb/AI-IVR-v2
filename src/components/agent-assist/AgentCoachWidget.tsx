'use client';

/**
 * Agent Coach Widget
 * Floating real-time coaching overlay for human agents
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
    Volume2
} from 'lucide-react';

interface AgentCoachWidgetProps {
    isCallActive: boolean;
    sentiment: number;
    callDuration: number;
}

interface CoachingEvent {
    id: string;
    type: 'script' | 'warning' | 'cadence' | 'suggestion';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    timestamp: Date;
    dismissed: boolean;
}

export default function AgentCoachWidget({
    isCallActive,
    sentiment,
    callDuration
}: AgentCoachWidgetProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [events, setEvents] = useState<CoachingEvent[]>([]);
    const [cadenceWarning, setCadenceWarning] = useState<string | null>(null);

    // Simulate coaching events based on sentiment and duration
    useEffect(() => {
        if (!isCallActive) return;

        // Low sentiment triggers script suggestion
        if (sentiment < 0.4 && events.filter(e => e.type === 'script' && !e.dismissed).length === 0) {
            setEvents(prev => [...prev, {
                id: `script-${Date.now()}`,
                type: 'script',
                message: "I hear that you're frustrated, and I completely understand. Let me personally ensure we get this resolved for you.",
                priority: 'high',
                timestamp: new Date(),
                dismissed: false,
            }]);
        }

        // Very low sentiment triggers urgent warning
        if (sentiment < 0.25) {
            setEvents(prev => {
                const hasWarning = prev.some(e => e.type === 'warning' && !e.dismissed);
                if (!hasWarning) {
                    return [...prev, {
                        id: `warning-${Date.now()}`,
                        type: 'warning',
                        message: 'Customer sentiment critically low. Consider escalating to supervisor.',
                        priority: 'urgent',
                        timestamp: new Date(),
                        dismissed: false,
                    }];
                }
                return prev;
            });
        }
    }, [sentiment, isCallActive, events]);

    // Simulate cadence warnings
    useEffect(() => {
        if (!isCallActive) return;

        // Random cadence warning every 30 seconds (simulation)
        const interval = setInterval(() => {
            const random = Math.random();
            if (random > 0.7) {
                setCadenceWarning('SLOW DOWN');
                setTimeout(() => setCadenceWarning(null), 3000);
            } else if (random < 0.2) {
                setCadenceWarning('SPEAK UP');
                setTimeout(() => setCadenceWarning(null), 3000);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [isCallActive]);

    // Dismiss event
    const dismissEvent = (id: string) => {
        setEvents(prev => prev.map(e =>
            e.id === id ? { ...e, dismissed: true } : e
        ));
    };

    // Get active events
    const activeEvents = events.filter(e => !e.dismissed);

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
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            {!isMinimized && <span className="text-sm font-medium">AI Coach</span>}
                        </div>
                        <div className="flex items-center gap-1">
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
                                <div className={`font-semibold ${sentiment < 0.3 ? 'text-red-400' :
                                        sentiment < 0.5 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                    {Math.round(sentiment * 100)}%
                                </div>
                            </div>

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
                                                {event.type === 'warning' ? (
                                                    <AlertTriangle className={`w-4 h-4 ${event.priority === 'urgent' ? 'text-red-400' : 'text-yellow-400'
                                                        }`} />
                                                ) : (
                                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                                )}
                                                <span className="text-xs font-medium uppercase text-gray-400">
                                                    {event.type === 'script' ? 'Suggested Script' : 'Warning'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-200">{event.message}</p>
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
                                    <p className="text-sm">No active coaching suggestions</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Cadence Warning Flash */}
            {cadenceWarning && (
                <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
                    <div className={`px-12 py-6 rounded-2xl ${cadenceWarning === 'SLOW DOWN' ? 'bg-red-500/90' : 'bg-yellow-500/90'
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
