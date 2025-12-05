'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, Volume2, Mic, Users, BarChart3, Settings } from 'lucide-react';
import { VoiceCommand } from '@/hooks/useCommandCenter';

interface CommandsListProps {
    commands: VoiceCommand[];
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'critical': return 'text-red-600 bg-red-100';
        case 'high': return 'text-orange-600 bg-orange-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        case 'low': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

const getCommandIcon = (category: string) => {
    switch (category) {
        case 'synthesis': return <Volume2 className="h-4 w-4" />;
        case 'recognition': return <Mic className="h-4 w-4" />;
        case 'cloning': return <Users className="h-4 w-4" />;
        case 'analysis': return <BarChart3 className="h-4 w-4" />;
        case 'management': return <Settings className="h-4 w-4" />;
        default: return <Terminal className="h-4 w-4" />;
    }
};

/**
 * List of active commands in the Voice Command Center.
 */
export function CommandsList({ commands }: CommandsListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Active Commands
                </CardTitle>
                <CardDescription>
                    Currently running voice AI operations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {commands.map((cmd) => (
                    <div key={cmd.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            {getCommandIcon(cmd.category)}
                            <div>
                                <p className="font-medium">{cmd.command}</p>
                                <p className="text-sm text-muted-foreground">{cmd.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(cmd.priority)}>
                                {cmd.priority}
                            </Badge>
                            <Badge variant={cmd.status === 'processing' ? 'default' : 'secondary'}>
                                {cmd.status}
                            </Badge>
                        </div>
                    </div>
                ))}
                {commands.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No active commands
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default CommandsList;
