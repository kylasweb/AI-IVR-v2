'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Plus, Activity, TrendingUp, HardDrive, RefreshCw, Volume2, Mic, Users } from 'lucide-react';

// Modular components
import { ModelTable, TrainingJobsList, CreateModelDialog } from '@/components/voice/model-management';

// Custom hook for state management
import { useVoiceModels, VoiceModel } from '@/hooks/useVoiceModels';

/**
 * Voice Model Management Page
 * Manage voice models, training jobs, and performance monitoring.
 * 
 * Refactored from 654 lines to ~200 lines using modular components.
 */
export default function VoiceModelManagementPage() {
    const {
        models,
        trainingJobs,
        metrics,
        createModel,
        startTraining,
        deleteModel
    } = useVoiceModels();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('models');

    const handleCreateModel = (modelData: {
        name: string;
        type: VoiceModel['type'];
        provider: string;
        language: string;
        description: string;
    }) => {
        createModel(modelData);
    };

    const handleStartTraining = (model: VoiceModel) => {
        startTraining(model.id);
    };

    const handleDeleteModel = (model: VoiceModel) => {
        deleteModel(model.id);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'synthesis': return <Volume2 className="h-4 w-4" />;
            case 'recognition': return <Mic className="h-4 w-4" />;
            case 'cloning': return <Users className="h-4 w-4" />;
            default: return <Brain className="h-4 w-4" />;
        }
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Brain className="h-8 w-8 text-blue-600" />
                            Voice Model Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage voice models, training jobs, and performance monitoring
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Model
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                            <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalModels}</div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.activeModels} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{trainingJobs.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.runningJobs} running
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.avgAccuracy}%</div>
                            <p className="text-xs text-muted-foreground">
                                Across all models
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalStorage}MB</div>
                            <p className="text-xs text-muted-foreground">
                                Total model size
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="models">Voice Models</TabsTrigger>
                        <TabsTrigger value="training">Training Jobs</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="models" className="space-y-6">
                        <ModelTable
                            models={models}
                            onTrain={handleStartTraining}
                            onDelete={handleDeleteModel}
                        />
                    </TabsContent>

                    <TabsContent value="training" className="space-y-6">
                        <TrainingJobsList jobs={trainingJobs} />
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Model Performance</CardTitle>
                                    <CardDescription>
                                        Accuracy and latency metrics across all models
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {models.filter(m => m.accuracy).map((model) => (
                                            <div key={model.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getTypeIcon(model.type)}
                                                    <div>
                                                        <div className="font-medium">{model.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {model.accuracy}% accuracy
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{model.latency}s</div>
                                                    <div className="text-sm text-muted-foreground">latency</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage Statistics</CardTitle>
                                    <CardDescription>
                                        Model usage patterns and trends
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {models.map((model) => (
                                            <div key={model.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getTypeIcon(model.type)}
                                                    <div>
                                                        <div className="font-medium">{model.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {model.usageCount.toLocaleString()} requests
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{model.size}MB</div>
                                                    <div className="text-sm text-muted-foreground">size</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Create Model Dialog */}
                <CreateModelDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onCreate={handleCreateModel}
                />
            </div>
        </ManagementLayout>
    );
}