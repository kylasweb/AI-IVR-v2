'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import {
    Globe,
    Globe as Languages,
    Star as Heart,
    Users,
    TrendingUp,
    Brain,
    Mic,
    MessageSquare,
    Settings,
    Activity,
    CheckCircle,
    Plus,
    Trash2,
    Edit3,
    Upload,
    FileText,
    Database,
    Zap,
    Target,
    Clock,
    SlidersHorizontal as Sliders
} from 'lucide-react';

export default function CulturalAIPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false);
    const [trainingConfig, setTrainingConfig] = useState({
        learningRate: [0.001],
        batchSize: [32],
        epochs: [100],
        culturalWeight: [0.8],
        dialectAccuracy: [0.9],
        contextDepth: [0.7],
        adaptationSpeed: [0.5]
    });
    const [modelConfig, setModelConfig] = useState({
        name: '',
        language: 'malayalam',
        dialectRegion: 'all',
        culturalContext: 'comprehensive',
        trainingData: '',
        accuracy: [85],
        responseTime: [150]
    });

    const handleStartTraining = async () => {
        try {
            toast({
                title: "Training Started",
                description: `Cultural AI model training initiated with learning rate ${trainingConfig.learningRate[0]}`,
            });
            setIsTrainingDialogOpen(false);
        } catch (error) {
            toast({
                title: "Training Failed",
                description: "Failed to start model training",
                variant: "destructive",
            });
        }
    };

    const handleSaveConfig = async () => {
        try {
            toast({
                title: "Configuration Saved",
                description: `Model "${modelConfig.name}" configuration saved successfully`,
            });
            setIsConfigDialogOpen(false);
        } catch (error) {
            toast({
                title: "Save Failed",
                description: "Failed to save configuration",
                variant: "destructive",
            });
        }
    };

    return (
        <ManagementLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cultural AI</h1>
                        <p className="text-gray-600 mt-2">
                            AI-powered cultural intelligence and localization system
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={() => setIsConfigDialogOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Advanced Configurator
                        </Button>
                        <Button size="sm" onClick={() => setIsTrainingDialogOpen(true)}>
                            <Brain className="mr-2 h-4 w-4" />
                            Train Model
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="models">Cultural Models</TabsTrigger>
                        <TabsTrigger value="training">Training Hub</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Languages</CardTitle>
                                    <Languages className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12</div>
                                    <p className="text-xs text-muted-foreground">
                                        +2 new this month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Cultural Accuracy</CardTitle>
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">94.8%</div>
                                    <p className="text-xs text-muted-foreground">
                                        +3.2% from last month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">4.7/5</div>
                                    <p className="text-xs text-muted-foreground">
                                        +0.3 from last month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">8,542</div>
                                    <p className="text-xs text-muted-foreground">
                                        +15% from last month
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cultural Context Models</CardTitle>
                                    <CardDescription>
                                        Manage and train cultural understanding models
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {['Malayalam', 'Hindi', 'Tamil', 'Bengali'].map((lang) => (
                                            <div key={lang} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{lang}</span>
                                                    <Badge variant="outline">Active</Badge>
                                                </div>
                                                <Progress value={Math.random() * 100} className="w-full" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Real-time Translation</CardTitle>
                                    <CardDescription>
                                        Monitor live translation and cultural adaptation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Translation Quality</span>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm text-green-600">Excellent</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Processing Speed</span>
                                                <span>0.8s avg</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Cultural Adaptation Rate</span>
                                                <span>92.3%</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Context Accuracy</span>
                                                <span>94.8%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="models" className="space-y-6 mt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium">Cultural Intelligence Models</h3>
                                <p className="text-sm text-muted-foreground">Manage and configure AI models for cultural understanding</p>
                            </div>
                            <Button onClick={() => setIsConfigDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Model
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: 'Malayalam Cultural Context', accuracy: 94.2, status: 'Active', type: 'Language Model' },
                                { name: 'Festival Recognition', accuracy: 89.7, status: 'Training', type: 'Cultural Context' },
                                { name: 'Dialect Adaptation', accuracy: 87.1, status: 'Active', type: 'Speech Recognition' }
                            ].map((model, index) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{model.name}</CardTitle>
                                            <Badge variant={model.status === 'Active' ? 'default' : 'secondary'}>
                                                {model.status}
                                            </Badge>
                                        </div>
                                        <CardDescription>{model.type}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Accuracy</span>
                                                <span>{model.accuracy}%</span>
                                            </div>
                                            <Progress value={model.accuracy} className="w-full" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Edit3 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setIsTrainingDialogOpen(true)}>
                                                <Brain className="h-4 w-4 mr-1" />
                                                Train
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="training" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        Training Configuration
                                    </CardTitle>
                                    <CardDescription>
                                        Advanced settings for cultural AI model training
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Learning Rate</Label>
                                            <div className="mt-2">
                                                <Slider
                                                    value={trainingConfig.learningRate}
                                                    onValueChange={(value) => setTrainingConfig({ ...trainingConfig, learningRate: value })}
                                                    max={0.01}
                                                    min={0.0001}
                                                    step={0.0001}
                                                />
                                                <span className="text-sm text-muted-foreground">{trainingConfig.learningRate[0]}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Batch Size</Label>
                                            <div className="mt-2">
                                                <Slider
                                                    value={trainingConfig.batchSize}
                                                    onValueChange={(value) => setTrainingConfig({ ...trainingConfig, batchSize: value })}
                                                    max={128}
                                                    min={8}
                                                    step={8}
                                                />
                                                <span className="text-sm text-muted-foreground">{trainingConfig.batchSize[0]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Cultural Context Weight</Label>
                                        <div className="mt-2">
                                            <Slider
                                                value={trainingConfig.culturalWeight}
                                                onValueChange={(value) => setTrainingConfig({ ...trainingConfig, culturalWeight: value })}
                                                max={1}
                                                min={0}
                                                step={0.1}
                                            />
                                            <span className="text-sm text-muted-foreground">{trainingConfig.culturalWeight[0]}x weight</span>
                                        </div>
                                    </div>
                                    <Button onClick={() => setIsTrainingDialogOpen(true)} className="w-full">
                                        <Brain className="mr-2 h-4 w-4" />
                                        Start Advanced Training
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Training Data Management
                                    </CardTitle>
                                    <CardDescription>
                                        Upload and manage cultural training datasets
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm text-muted-foreground">
                                            Drop cultural training data files here or click to browse
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-2">
                                            Upload Dataset
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Malayalam Festival Data</span>
                                            <Badge variant="outline">2.3 MB</Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Cultural Context Samples</span>
                                            <Badge variant="outline">15.7 MB</Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Dialect Variations</span>
                                            <Badge variant="outline">8.1 MB</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Cultural Interactions</CardTitle>
                                <CardDescription>
                                    Latest AI cultural understanding activities
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { lang: 'Malayalam', context: 'Festival greetings', accuracy: 95.2 },
                                        { lang: 'Hindi', context: 'Business etiquette', accuracy: 87.8 },
                                        { lang: 'Tamil', context: 'Family conversation', accuracy: 92.1 },
                                        { lang: 'Bengali', context: 'Cultural celebration', accuracy: 89.4 }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Globe className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium">{item.lang} - {item.context}</p>
                                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default">Success</Badge>
                                                <span className="text-sm text-gray-500">{item.accuracy}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Advanced Configuration Dialog */}
                <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Advanced Cultural AI Configurator
                            </DialogTitle>
                            <DialogDescription>
                                Configure advanced settings for cultural AI models and training
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="model-name">Model Name</Label>
                                    <Input
                                        id="model-name"
                                        value={modelConfig.name}
                                        onChange={(e) => setModelConfig({ ...modelConfig, name: e.target.value })}
                                        placeholder="e.g., Malayalam Cultural Context v2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="language">Primary Language</Label>
                                    <Select value={modelConfig.language} onValueChange={(value) => setModelConfig({ ...modelConfig, language: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="malayalam">Malayalam</SelectItem>
                                            <SelectItem value="hindi">Hindi</SelectItem>
                                            <SelectItem value="tamil">Tamil</SelectItem>
                                            <SelectItem value="bengali">Bengali</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="dialect-region">Dialect Region</Label>
                                    <Select value={modelConfig.dialectRegion} onValueChange={(value) => setModelConfig({ ...modelConfig, dialectRegion: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Regions</SelectItem>
                                            <SelectItem value="northern">Northern Kerala</SelectItem>
                                            <SelectItem value="central">Central Kerala</SelectItem>
                                            <SelectItem value="southern">Southern Kerala</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="cultural-context">Cultural Context Level</Label>
                                    <Select value={modelConfig.culturalContext} onValueChange={(value) => setModelConfig({ ...modelConfig, culturalContext: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="basic">Basic</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="training-data">Training Data Description</Label>
                                <Textarea
                                    id="training-data"
                                    value={modelConfig.trainingData}
                                    onChange={(e) => setModelConfig({ ...modelConfig, trainingData: e.target.value })}
                                    placeholder="Describe the cultural training data and context..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Target Accuracy (%)</Label>
                                    <div className="mt-2">
                                        <Slider
                                            value={modelConfig.accuracy}
                                            onValueChange={(value) => setModelConfig({ ...modelConfig, accuracy: value })}
                                            max={99}
                                            min={70}
                                            step={1}
                                        />
                                        <span className="text-sm text-muted-foreground">{modelConfig.accuracy[0]}%</span>
                                    </div>
                                </div>
                                <div>
                                    <Label>Max Response Time (ms)</Label>
                                    <div className="mt-2">
                                        <Slider
                                            value={modelConfig.responseTime}
                                            onValueChange={(value) => setModelConfig({ ...modelConfig, responseTime: value })}
                                            max={500}
                                            min={50}
                                            step={10}
                                        />
                                        <span className="text-sm text-muted-foreground">{modelConfig.responseTime[0]}ms</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleSaveConfig} className="flex-1">
                                    <Database className="mr-2 h-4 w-4" />
                                    Save Configuration
                                </Button>
                                <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Training Dialog */}
                <Dialog open={isTrainingDialogOpen} onOpenChange={setIsTrainingDialogOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Start Cultural AI Model Training
                            </DialogTitle>
                            <DialogDescription>
                                Configure and start advanced training for cultural AI models
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-4">
                                <div>
                                    <Label>Learning Rate: {trainingConfig.learningRate[0]}</Label>
                                    <Slider
                                        value={trainingConfig.learningRate}
                                        onValueChange={(value) => setTrainingConfig({ ...trainingConfig, learningRate: value })}
                                        max={0.01}
                                        min={0.0001}
                                        step={0.0001}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Epochs: {trainingConfig.epochs[0]}</Label>
                                    <Slider
                                        value={trainingConfig.epochs}
                                        onValueChange={(value) => setTrainingConfig({ ...trainingConfig, epochs: value })}
                                        max={500}
                                        min={10}
                                        step={10}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Cultural Weight: {trainingConfig.culturalWeight[0]}x</Label>
                                    <Slider
                                        value={trainingConfig.culturalWeight}
                                        onValueChange={(value) => setTrainingConfig({ ...trainingConfig, culturalWeight: value })}
                                        max={2}
                                        min={0.1}
                                        step={0.1}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Dialect Accuracy Target: {trainingConfig.dialectAccuracy[0]}</Label>
                                    <Slider
                                        value={trainingConfig.dialectAccuracy}
                                        onValueChange={(value) => setTrainingConfig({ ...trainingConfig, dialectAccuracy: value })}
                                        max={1}
                                        min={0.5}
                                        step={0.05}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-blue-800">Training Estimate</span>
                                </div>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p>Estimated Duration: ~{Math.round(trainingConfig.epochs[0] / 10)} hours</p>
                                    <p>GPU Memory Required: ~{Math.round(trainingConfig.batchSize[0] * 0.5)}GB</p>
                                    <p>Cultural Accuracy Target: {Math.round(trainingConfig.culturalWeight[0] * 90)}%</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleStartTraining} className="flex-1">
                                    <Target className="mr-2 h-4 w-4" />
                                    Start Training
                                </Button>
                                <Button variant="outline" onClick={() => setIsTrainingDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </ManagementLayout>
    );
}