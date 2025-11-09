'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
    Bot,
    Plus,
    Settings as Edit,
    Trash2,
    Play,
    Settings,
    Mic,
    Volume2,
    Brain,
    Zap,
    Globe,
    Star,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface VoiceAgent {
    id: string;
    name: string;
    description: string;
    voiceModel: string;
    language: string;
    trainingProgress: number;
    status: 'active' | 'training' | 'inactive';
    accuracy: number;
    createdAt: string;
}

export default function VoiceAIAgentsPage() {
    const [agents, setAgents] = useState<VoiceAgent[]>([
        {
            id: '1',
            name: 'Malayalam Customer Service Agent',
            description: 'Specialized agent for customer service in Malayalam with cultural awareness',
            voiceModel: 'azure-neural-ml-female',
            language: 'ml',
            trainingProgress: 95,
            status: 'active',
            accuracy: 94.2,
            createdAt: '2024-01-15'
        },
        {
            id: '2',
            name: 'English Support Agent',
            description: 'General purpose English support agent with emotion detection',
            voiceModel: 'elevenlabs-sarah',
            language: 'en',
            trainingProgress: 100,
            status: 'active',
            accuracy: 97.1,
            createdAt: '2024-01-10'
        }
    ]);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        voiceModel: '',
        language: '',
        fineTuningLevel: [0.5],
        temperature: [0.7],
        responseSpeed: [0.8]
    });

    const voiceModels = {
        malayalam: [
            { id: 'azure-neural-ml-female', name: 'Azure Neural - Malayalam Female', provider: 'Azure' },
            { id: 'azure-neural-ml-male', name: 'Azure Neural - Malayalam Male', provider: 'Azure' },
            { id: 'google-wavenet-ml', name: 'Google WaveNet - Malayalam', provider: 'Google' },
            { id: 'custom-ml-voice-1', name: 'Custom Malayalam Voice Model', provider: 'Custom' }
        ],
        english: [
            { id: 'elevenlabs-sarah', name: 'ElevenLabs - Sarah (Professional)', provider: 'ElevenLabs' },
            { id: 'azure-neural-en-jenny', name: 'Azure Neural - Jenny', provider: 'Azure' },
            { id: 'openai-tts-alloy', name: 'OpenAI TTS - Alloy', provider: 'OpenAI' },
            { id: 'google-wavenet-en', name: 'Google WaveNet - English', provider: 'Google' }
        ],
        hindi: [
            { id: 'azure-neural-hi-female', name: 'Azure Neural - Hindi Female', provider: 'Azure' },
            { id: 'google-wavenet-hi', name: 'Google WaveNet - Hindi', provider: 'Google' }
        ]
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'training': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAvailableVoiceModels = () => {
        if (!formData.language) return [];
        return voiceModels[formData.language as keyof typeof voiceModels] || [];
    };

    const handleCreateAgent = () => {
        const newAgent: VoiceAgent = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            voiceModel: formData.voiceModel,
            language: formData.language,
            trainingProgress: 0,
            status: 'training',
            accuracy: 0,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setAgents([...agents, newAgent]);
        setIsCreateDialogOpen(false);
        setFormData({
            name: '',
            description: '',
            voiceModel: '',
            language: '',
            fineTuningLevel: [0.5],
            temperature: [0.7],
            responseSpeed: [0.8]
        });
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Voice AI Agents</h1>
                        <p className="text-muted-foreground">
                            Create, train, and manage intelligent voice agents with advanced language capabilities
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="secondary">New Feature</Badge>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Agent
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
                                <DialogHeader className="border-b pb-4 mb-6">
                                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Create New Voice AI Agent
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 overflow-y-auto max-h-[calc(95vh-120px)] pr-2">
                                    <Tabs defaultValue="basic" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-lg">
                                            <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                                Basic Info
                                            </TabsTrigger>
                                            <TabsTrigger value="voice" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                                Voice Model
                                            </TabsTrigger>
                                            <TabsTrigger value="training" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                                Training
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="basic" className="space-y-6 mt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="agentName" className="text-sm font-medium text-gray-700">
                                                        Agent Name *
                                                    </Label>
                                                    <Input
                                                        id="agentName"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="e.g., Malayalam Customer Service Agent"
                                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                                                        Primary Language *
                                                    </Label>
                                                    <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value, voiceModel: '' })}>
                                                        <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                                            <SelectValue placeholder="Select language" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ml">Malayalam</SelectItem>
                                                            <SelectItem value="en">English</SelectItem>
                                                            <SelectItem value="hi">Hindi</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                                    Description
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Describe the agent's purpose and capabilities..."
                                                    rows={4}
                                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="voice" className="space-y-6 mt-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Volume2 className="h-5 w-5 text-blue-600" />
                                                    <Label className="text-lg font-semibold text-gray-800">Voice Model Selection *</Label>
                                                </div>

                                                <div className="grid gap-4">
                                                    {getAvailableVoiceModels().map((model) => (
                                                        <Card
                                                            key={model.id}
                                                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${formData.voiceModel === model.id
                                                                ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            onClick={() => setFormData({ ...formData, voiceModel: model.id })}
                                                        >
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="space-y-1">
                                                                        <h4 className="font-semibold text-gray-900">{model.name}</h4>
                                                                        <p className="text-sm text-gray-600">Provider: {model.provider}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                // Play voice sample
                                                                            }}
                                                                            className="h-8 px-3"
                                                                        >
                                                                            <Play className="h-3 w-3 mr-1" />
                                                                            Preview
                                                                        </Button>
                                                                        {formData.voiceModel === model.id && (
                                                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                                                <div className="w-2 h-2 bg-white rounded-full" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>

                                                {formData.language && getAvailableVoiceModels().length === 0 && (
                                                    <div className="text-center py-8">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <Volume2 className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            No voice models available for the selected language.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="training" className="space-y-6 mt-6">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Brain className="h-5 w-5 text-purple-600" />
                                                    <Label className="text-lg font-semibold text-gray-800">Advanced Configuration</Label>
                                                </div>

                                                <div className="grid gap-6">
                                                    <Card>
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-lg">Fine-Tuning Level</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-sm font-medium">Specialization: {formData.fineTuningLevel[0].toFixed(1)}</Label>
                                                                    <Badge variant="outline">{formData.fineTuningLevel[0] < 0.3 ? 'General' : formData.fineTuningLevel[0] < 0.7 ? 'Specialized' : 'Expert'}</Badge>
                                                                </div>
                                                                <Slider
                                                                    value={formData.fineTuningLevel}
                                                                    onValueChange={(value) => setFormData({ ...formData, fineTuningLevel: value })}
                                                                    max={1}
                                                                    min={0}
                                                                    step={0.1}
                                                                    className="w-full"
                                                                />
                                                                <p className="text-sm text-gray-600">
                                                                    Higher values mean more specialized training for your specific use case
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-lg">Response Behavior</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-6">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-sm font-medium">Temperature: {formData.temperature[0].toFixed(1)}</Label>
                                                                    <Badge variant="outline">{formData.temperature[0] < 0.3 ? 'Conservative' : formData.temperature[0] < 0.7 ? 'Balanced' : 'Creative'}</Badge>
                                                                </div>
                                                                <Slider
                                                                    value={formData.temperature}
                                                                    onValueChange={(value) => setFormData({ ...formData, temperature: value })}
                                                                    max={1}
                                                                    min={0}
                                                                    step={0.1}
                                                                    className="w-full"
                                                                />
                                                                <p className="text-sm text-gray-600">
                                                                    Controls creativity vs consistency in responses
                                                                </p>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-sm font-medium">Response Speed: {formData.responseSpeed[0].toFixed(1)}</Label>
                                                                    <Badge variant="outline">{formData.responseSpeed[0] < 0.4 ? 'Detailed' : formData.responseSpeed[0] < 0.7 ? 'Balanced' : 'Fast'}</Badge>
                                                                </div>
                                                                <Slider
                                                                    value={formData.responseSpeed}
                                                                    onValueChange={(value) => setFormData({ ...formData, responseSpeed: value })}
                                                                    max={1}
                                                                    min={0.1}
                                                                    step={0.1}
                                                                    className="w-full"
                                                                />
                                                                <p className="text-sm text-gray-600">
                                                                    Balance between response speed and quality
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex gap-3 pt-6 border-t mt-6">
                                        <Button
                                            onClick={handleCreateAgent}
                                            disabled={!formData.name || !formData.language || !formData.voiceModel}
                                            className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Agent
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsCreateDialogOpen(false)}
                                            className="h-11 px-6 border-gray-300 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {agents.map((agent) => (
                        <Card key={agent.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                                            <Badge className={getStatusColor(agent.status)} variant="secondary">
                                                {agent.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="ghost">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">{agent.description}</CardDescription>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Language:</span>
                                        <Badge variant="outline">
                                            {agent.language === 'ml' ? 'Malayalam' : agent.language === 'en' ? 'English' : 'Hindi'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Accuracy:</span>
                                        <span className="font-medium">{agent.accuracy}%</span>
                                    </div>

                                    {agent.status === 'training' && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Training Progress:</span>
                                                <span className="font-medium">{agent.trainingProgress}%</span>
                                            </div>
                                            <Progress value={agent.trainingProgress} className="h-2" />
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            <Play className="h-3 w-3 mr-1" />
                                            Test
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Settings className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <Bot className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold">{agents.length}</p>
                                <p className="text-sm text-muted-foreground">Total Agents</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <Clock className="h-8 w-8 text-yellow-600" />
                            <div>
                                <p className="text-2xl font-bold">{agents.filter(a => a.status === 'training').length}</p>
                                <p className="text-sm text-muted-foreground">Training</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {agents.reduce((acc, agent) => acc + agent.accuracy, 0) / agents.length || 0}%
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ManagementLayout>
    );
}