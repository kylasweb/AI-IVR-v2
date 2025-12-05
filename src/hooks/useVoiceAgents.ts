'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface VoiceAgent {
    id: string;
    name: string;
    description: string;
    language: 'Malayalam' | 'English' | 'Hindi' | 'Tamil' | 'Telugu' | string;
    voice: string;
    voiceModel: string;
    status: 'active' | 'training' | 'inactive';
    accuracy: number;
    responseTime: number;
    dailyCalls: number;
    createdAt: string;
    personality?: string;
    emotion?: string;
    speed?: number;
}

export interface AgentFormData {
    name: string;
    description: string;
    language: string;
    voice: string;
    voiceModel: string;
    personality: string;
    emotion: string;
    speed: number;
}

export interface AgentMetrics {
    totalAgents: number;
    activeAgents: number;
    trainingAgents: number;
    avgAccuracy: number;
    totalDailyCalls: number;
}

export function useVoiceAgents() {
    const [agents, setAgents] = useState<VoiceAgent[]>([
        {
            id: 'agent-1',
            name: 'ശ്രീ - Customer Support',
            description: 'Malayalam customer support agent for general inquiries',
            language: 'Malayalam',
            voice: 'Female Professional',
            voiceModel: 'ml-IN-Wavenet-A',
            status: 'active',
            accuracy: 94.2,
            responseTime: 1.2,
            dailyCalls: 245,
            createdAt: '2025-10-15T08:00:00Z'
        },
        {
            id: 'agent-2',
            name: 'കൃഷ്ണ - Technical Support',
            description: 'Malayalam technical support agent for product issues',
            language: 'Malayalam',
            voice: 'Male Professional',
            voiceModel: 'ml-IN-Wavenet-B',
            status: 'active',
            accuracy: 91.8,
            responseTime: 1.5,
            dailyCalls: 189,
            createdAt: '2025-10-20T10:30:00Z'
        },
        {
            id: 'agent-3',
            name: 'Priya - Hindi Support',
            description: 'Hindi customer support agent',
            language: 'Hindi',
            voice: 'Female Friendly',
            voiceModel: 'hi-IN-Wavenet-A',
            status: 'training',
            accuracy: 0,
            responseTime: 0,
            dailyCalls: 0,
            createdAt: '2025-11-01T14:00:00Z'
        }
    ]);

    const [selectedAgent, setSelectedAgent] = useState<VoiceAgent | null>(null);

    const createAgent = (formData: AgentFormData): VoiceAgent => {
        const newAgent: VoiceAgent = {
            id: `agent-${Date.now()}`,
            name: formData.name,
            description: formData.description,
            language: formData.language,
            voice: formData.voice,
            voiceModel: formData.voiceModel,
            status: 'training',
            accuracy: 0,
            responseTime: 0,
            dailyCalls: 0,
            createdAt: new Date().toISOString(),
            personality: formData.personality,
            emotion: formData.emotion,
            speed: formData.speed
        };

        setAgents(prev => [...prev, newAgent]);

        toast({
            title: "Agent Created",
            description: `Voice AI agent "${newAgent.name}" has been created and is now training.`,
        });

        return newAgent;
    };

    const updateAgent = (id: string, updates: Partial<VoiceAgent>) => {
        setAgents(prev => prev.map(agent =>
            agent.id === id ? { ...agent, ...updates } : agent
        ));
    };

    const deleteAgent = (id: string) => {
        const agent = agents.find(a => a.id === id);
        if (!agent) return;

        setAgents(prev => prev.filter(a => a.id !== id));

        toast({
            title: "Agent Deleted",
            description: `Voice AI agent "${agent.name}" has been deleted.`,
        });
    };

    const toggleAgentStatus = (id: string) => {
        setAgents(prev => prev.map(agent =>
            agent.id === id
                ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
                : agent
        ));
    };

    const calculateMetrics = (): AgentMetrics => {
        const activeAgents = agents.filter(a => a.status === 'active');
        return {
            totalAgents: agents.length,
            activeAgents: activeAgents.length,
            trainingAgents: agents.filter(a => a.status === 'training').length,
            avgAccuracy: activeAgents.length > 0
                ? Math.round(activeAgents.reduce((sum, a) => sum + a.accuracy, 0) / activeAgents.length * 10) / 10
                : 0,
            totalDailyCalls: agents.reduce((sum, a) => sum + a.dailyCalls, 0)
        };
    };

    return {
        agents,
        selectedAgent,
        setSelectedAgent,
        metrics: calculateMetrics(),
        createAgent,
        updateAgent,
        deleteAgent,
        toggleAgentStatus
    };
}

export default useVoiceAgents;
