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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Brain,
    Plus,
    Upload,
    FileText,
    Bot,
    Mic,
    Database,
    Zap,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertTriangle,
    Settings,
    Download,
    Search,
    Filter,
    Globe,
    Volume2
} from 'lucide-react';

interface KnowledgeItem {
    id: string;
    title: string;
    type: 'document' | 'audio' | 'conversation' | 'training_data';
    content: string;
    language: string;
    tags: string[];
    createdAt: string;
    status: 'active' | 'processing' | 'archived';
    usage: number;
    accuracy: number;
}

export default function AIKnowledgeBasePage() {
    const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([
        {
            id: '1',
            title: 'Malayalam Customer Service Scripts',
            type: 'document',
            content: 'Comprehensive collection of customer service dialogues in Malayalam with cultural context...',
            language: 'malayalam',
            tags: ['customer-service', 'cultural-context', 'scripts'],
            createdAt: '2024-01-15',
            status: 'active',
            usage: 245,
            accuracy: 94.2
        },
        {
            id: '2',
            title: 'Voice Training Dataset - Kerala Dialects',
            type: 'audio',
            content: '500+ hours of voice samples from different Kerala regions for dialect training...',
            language: 'malayalam',
            tags: ['voice-training', 'dialects', 'kerala'],
            createdAt: '2024-01-12',
            status: 'active',
            usage: 189,
            accuracy: 92.8
        }
    ]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        content: '',
        language: '',
        tags: '',
        autoLearn: true,
        culturalContext: true
    });

    const [learningProtocol, setLearningProtocol] = useState({
        enabled: true,
        adaptationRate: [0.7],
        reinforcementThreshold: [0.8],
        forgettingFactor: [0.1]
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'document': return FileText;
            case 'audio': return Volume2;
            case 'conversation': return Bot;
            case 'training_data': return Brain;
            default: return FileText;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAddKnowledgeItem = () => {
        const newItem: KnowledgeItem = {
            id: Date.now().toString(),
            title: formData.title,
            type: formData.type as KnowledgeItem['type'],
            content: formData.content,
            language: formData.language,
            tags: formData.tags.split(',').map(tag => tag.trim()),
            createdAt: new Date().toISOString().split('T')[0],
            status: 'processing',
            usage: 0,
            accuracy: 0
        };

        setKnowledgeItems([...knowledgeItems, newItem]);
        setIsAddDialogOpen(false);
        setFormData({
            title: '',
            type: '',
            content: '',
            language: '',
            tags: '',
            autoLearn: true,
            culturalContext: true
        });
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Knowledge Base</h1>
                        <p className="text-muted-foreground">
                            Comprehensive knowledge management for AI agent training and voice model development
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="secondary">AI Powered</Badge>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Knowledge
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add to Knowledge Base</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Enter knowledge item title..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type *</Label>
                                            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="document">Document</SelectItem>
                                                    <SelectItem value="audio">Audio Training</SelectItem>
                                                    <SelectItem value="conversation">Conversation Scripts</SelectItem>
                                                    <SelectItem value="training_data">Training Dataset</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="language">Language *</Label>
                                            <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="malayalam">Malayalam</SelectItem>
                                                    <SelectItem value="english">English</SelectItem>
                                                    <SelectItem value="hindi">Hindi</SelectItem>
                                                    <SelectItem value="multilingual">Multilingual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content">Content/Description</Label>
                                        <Textarea
                                            id="content"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Enter content or description..."
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags (comma separated)</Label>
                                        <Input
                                            id="tags"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            placeholder="e.g., customer-service, cultural-context, training"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <Label className="font-medium">Auto-Learning</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable continuous learning from interactions
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.autoLearn}
                                                onCheckedChange={(checked) => setFormData({ ...formData, autoLearn: checked })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <Label className="font-medium">Cultural Context</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Include cultural markers and context awareness
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.culturalContext}
                                                onCheckedChange={(checked) => setFormData({ ...formData, culturalContext: checked })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleAddKnowledgeItem}
                                            disabled={!formData.title || !formData.type || !formData.language}
                                            className="flex-1"
                                        >
                                            Add to Knowledge Base
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs defaultValue="knowledge" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="knowledge">Knowledge Items</TabsTrigger>
                        <TabsTrigger value="training">Agent Training</TabsTrigger>
                        <TabsTrigger value="voice">Voice Training</TabsTrigger>
                        <TabsTrigger value="protocol">Learning Protocol</TabsTrigger>
                    </TabsList>

                    <TabsContent value="knowledge" className="space-y-4">
                        {/* Search and Filter */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search knowledge base..."
                                    className="w-full"
                                />
                            </div>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Bulk Upload
                            </Button>
                        </div>

                        {/* Knowledge Items Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {knowledgeItems.map((item) => {
                                const TypeIcon = getTypeIcon(item.type);
                                return (
                                    <Card key={item.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <TypeIcon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{item.title}</CardTitle>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge className={getStatusColor(item.status)} variant="secondary">
                                                                {item.status}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {item.language}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="mb-4 line-clamp-3">
                                                {item.content}
                                            </CardDescription>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Usage:</span>
                                                    <span className="font-medium">{item.usage} times</span>
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Accuracy:</span>
                                                    <span className="font-medium">{item.accuracy}%</span>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button size="sm" variant="outline" className="flex-1">
                                                        Edit
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        Train
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="training" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bot className="h-5 w-5" />
                                    AI Agent Training Hub
                                </CardTitle>
                                <CardDescription>
                                    Train AI agents using knowledge base for improved performance and cultural understanding
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <h4 className="font-medium mb-1">Agentic Training</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Advanced AI agent behavior training
                                            </p>
                                            <Button size="sm" className="mt-3" variant="outline">
                                                Start Training
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <h4 className="font-medium mb-1">Cultural Context</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Malayalam cultural intelligence training
                                            </p>
                                            <Button size="sm" className="mt-3" variant="outline">
                                                Configure
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                            <h4 className="font-medium mb-1">Reinforcement</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Feedback-based learning optimization
                                            </p>
                                            <Button size="sm" className="mt-3" variant="outline">
                                                Review
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="voice" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mic className="h-5 w-5" />
                                    Voice AI Agent Training
                                </CardTitle>
                                <CardDescription>
                                    Specialized training for voice-based AI agents with dialect and accent support
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center py-8">
                                    <Volume2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Voice Training Coming Soon</h3>
                                    <p className="text-muted-foreground">
                                        Advanced voice model training capabilities will be available in the next update.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="protocol" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Self-Learning Protocol Configuration</CardTitle>
                                <CardDescription>
                                    Configure how the AI system learns and adapts from interactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label className="text-base font-medium">Enable Self-Learning</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Allow the system to continuously learn from user interactions
                                            </p>
                                        </div>
                                        <Switch
                                            checked={learningProtocol.enabled}
                                            onCheckedChange={(checked) => setLearningProtocol({ ...learningProtocol, enabled: checked })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Adaptation Rate: {learningProtocol.adaptationRate[0].toFixed(1)}</Label>
                                        <div className="space-y-1">
                                            <div className="w-full h-2 bg-gray-200 rounded"></div>
                                            <p className="text-sm text-muted-foreground">
                                                How quickly the system adapts to new information
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Reinforcement Threshold: {learningProtocol.reinforcementThreshold[0].toFixed(1)}</Label>
                                        <div className="space-y-1">
                                            <div className="w-full h-2 bg-gray-200 rounded"></div>
                                            <p className="text-sm text-muted-foreground">
                                                Minimum confidence required to reinforce learned patterns
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Forgetting Factor: {learningProtocol.forgettingFactor[0].toFixed(1)}</Label>
                                        <div className="space-y-1">
                                            <div className="w-full h-2 bg-gray-200 rounded"></div>
                                            <p className="text-sm text-muted-foreground">
                                                How quickly outdated information is forgotten
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button>Save Protocol Settings</Button>
                                    <Button variant="outline">Reset to Defaults</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <Database className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold">{knowledgeItems.length}</p>
                                <p className="text-sm text-muted-foreground">Knowledge Items</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-2xl font-bold">{knowledgeItems.filter(item => item.status === 'active').length}</p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {(knowledgeItems.reduce((acc, item) => acc + item.accuracy, 0) / knowledgeItems.length).toFixed(1)}%
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <Brain className="h-8 w-8 text-orange-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {knowledgeItems.reduce((acc, item) => acc + item.usage, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Usage</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ManagementLayout>
    );
}