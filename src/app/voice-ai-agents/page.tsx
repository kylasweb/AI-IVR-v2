'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Plus, BarChart3, Search, Users, Activity, Mic, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Modular components
import { AgentCard, CreateAgentDialog } from '@/components/voice/ai-agents';

// Custom hooks
import { useVoiceAgents, AgentFormData, VoiceAgent } from '@/hooks/useVoiceAgents';
import { useTTS } from '@/lib/tts/hooks/useTTS';

/**
 * Voice AI Agents Page
 * Manage intelligent voice AI agents for automated customer interactions.
 * 
 * Refactored from 590 lines to ~180 lines using modular components.
 */
export default function VoiceAIAgentsPage() {
    const {
        agents,
        metrics,
        createAgent,
        deleteAgent,
        toggleAgentStatus
    } = useVoiceAgents();

    const { synthesize, loading: ttsLoading, isPlaying, play, stop, error: ttsError } = useTTS();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedTab, setSelectedTab] = useState('agents');
    const [searchQuery, setSearchQuery] = useState('');
    const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
    const [previewingModel, setPreviewingModel] = useState<string | null>(null);

    // Filter agents based on search
    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateAgent = (formData: AgentFormData) => {
        createAgent(formData);
    };

    const handleTestAgent = async (agent: VoiceAgent) => {
        if (isPlaying && testingAgentId === agent.id) {
            stop();
            setTestingAgentId(null);
            return;
        }

        setTestingAgentId(agent.id);

        // Language-specific test phrases
        const testPhrases: Record<string, string> = {
            'Malayalam': 'നമസ്കാരം! എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാൻ കഴിയും?',
            'Hindi': 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
            'English': 'Hello! How may I assist you today?',
            'Tamil': 'வணக்கம்! நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
            'Telugu': 'నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?'
        };

        const langCodeMap: Record<string, string> = {
            'Malayalam': 'ml-IN',
            'Hindi': 'hi-IN',
            'English': 'en-US',
            'Tamil': 'ta-IN',
            'Telugu': 'te-IN'
        };

        const testPhrase = testPhrases[agent.language] || testPhrases['English'];
        const languageCode = langCodeMap[agent.language] || 'en-US';

        try {
            const result = await synthesize(testPhrase, { languageCode, speed: 1.0 });
            if (result?.audio_url) {
                play(result.audio_url);
            }
        } catch (error) {
            toast({
                title: "Test Failed",
                description: ttsError || "Could not generate test audio.",
                variant: "destructive",
            });
            setTestingAgentId(null);
        }
    };

    const handlePreviewVoice = async (voiceModel: string, language: string, speed: number) => {
        if (isPlaying && previewingModel === voiceModel) {
            stop();
            setPreviewingModel(null);
            return;
        }

        setPreviewingModel(voiceModel);

        const previewTexts: Record<string, string> = {
            'Malayalam': 'ഹായ്! ഞാൻ നിങ്ങളുടെ വോയ്സ് AI അസിസ്റ്റന്റ് ആണ്.',
            'Hindi': 'नमस्ते! मैं आपका वॉइस AI असिस्टेंट हूँ।',
            'English': 'Hello! I am your voice AI assistant.'
        };

        const langCodeMap: Record<string, string> = {
            'Malayalam': 'ml-IN',
            'Hindi': 'hi-IN',
            'English': 'en-US'
        };

        const previewText = previewTexts[language] || previewTexts['English'];
        const languageCode = langCodeMap[language] || 'en-US';

        try {
            const result = await synthesize(previewText, { languageCode, speed });
            if (result?.audio_url) {
                play(result.audio_url);
            }
        } catch (error) {
            toast({
                title: "Preview Failed",
                description: "Could not preview voice model.",
                variant: "destructive",
            });
            setPreviewingModel(null);
        }
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Bot className="h-8 w-8 text-purple-600" />
                            Voice AI Agents
                        </h1>
                        <p className="text-muted-foreground">
                            Intelligent voice agents for automated customer interactions
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Agent
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalAgents}</div>
                            <p className="text-xs text-muted-foreground">{metrics.activeAgents} active</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Training</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.trainingAgents}</div>
                            <p className="text-xs text-muted-foreground">In progress</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
                            <Mic className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.avgAccuracy}%</div>
                            <p className="text-xs text-muted-foreground">Across all agents</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Calls</CardTitle>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalDailyCalls}</div>
                            <p className="text-xs text-muted-foreground">Total today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="agents" className="space-y-6">
                        {/* Search */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search agents..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Agent Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredAgents.map((agent) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onTest={handleTestAgent}
                                    onToggleStatus={toggleAgentStatus}
                                    testingAgentId={testingAgentId}
                                    isPlaying={isPlaying}
                                    ttsLoading={ttsLoading}
                                />
                            ))}
                        </div>

                        {filteredAgents.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Agents Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchQuery ? 'No agents match your search.' : 'Create your first voice AI agent.'}
                                    </p>
                                    <Button onClick={() => setShowCreateDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Agent
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Agent Analytics</CardTitle>
                                <CardDescription>Performance metrics and insights</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center py-12">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Analytics coming soon...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Agent Settings</CardTitle>
                                <CardDescription>Configure default agent settings</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center py-12">
                                <p className="text-muted-foreground">Settings coming soon...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Create Agent Dialog */}
                <CreateAgentDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    onCreate={handleCreateAgent}
                    onPreviewVoice={handlePreviewVoice}
                    previewingModel={previewingModel}
                    isPlaying={isPlaying}
                    ttsLoading={ttsLoading}
                />
            </div>
        </ManagementLayout>
    );
}