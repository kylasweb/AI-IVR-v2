'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Play,
    Save,
    Copy,
    Trash2,
    Settings,
    Zap,
    Clock,
    Users,
    Mail,
    Phone,
    MessageSquare,
    Database,
    FileText,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    GitBranch,
    Target,
    Brain
} from 'lucide-react';
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days';

interface TaskStep {
    id: string;
    type: 'trigger' | 'condition' | 'action' | 'delay';
    name: string;
    description: string;
    config: Record<string, any>;
    position: { x: number; y: number };
}

interface AutomationTask {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'draft';
    steps: TaskStep[];
    triggers: string[];
    lastRun?: Date;
    nextRun?: Date;
    runCount: number;
    successRate: number;
}

export default function AITaskBuilder() {
    const [activeTab, setActiveTab] = useState('builder');
    const [tasks, setTasks] = useState<AutomationTask[]>([]);
    const [currentTask, setCurrentTask] = useState<AutomationTask | null>(null);
    const [selectedStep, setSelectedStep] = useState<TaskStep | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const stepTemplates = [
        {
            category: 'Triggers',
            items: [
                { type: 'trigger', name: 'Incoming Call', icon: Phone, description: 'Triggered when a new call is received' },
                { type: 'trigger', name: 'Call Ended', icon: Phone, description: 'Triggered when a call ends' },
                { type: 'trigger', name: 'Schedule', icon: CalendarDays, description: 'Triggered at specific times/dates' },
                { type: 'trigger', name: 'Webhook', icon: Zap, description: 'Triggered by external API call' },
                { type: 'trigger', name: 'Email Received', icon: Mail, description: 'Triggered when email is received' }
            ]
        },
        {
            category: 'Conditions',
            items: [
                { type: 'condition', name: 'Call Duration', icon: Clock, description: 'Check call duration criteria' },
                { type: 'condition', name: 'Language Detected', icon: MessageSquare, description: 'Check detected language' },
                { type: 'condition', name: 'Customer Type', icon: Users, description: 'Check customer category/type' },
                { type: 'condition', name: 'Time of Day', icon: Clock, description: 'Check current time conditions' },
                { type: 'condition', name: 'Sentiment Analysis', icon: Brain, description: 'Check customer sentiment' }
            ]
        },
        {
            category: 'Actions',
            items: [
                { type: 'action', name: 'Send SMS', icon: MessageSquare, description: 'Send SMS to customer' },
                { type: 'action', name: 'Send Email', icon: Mail, description: 'Send follow-up email' },
                { type: 'action', name: 'Create Ticket', icon: FileText, description: 'Create support ticket' },
                { type: 'action', name: 'Update Database', icon: Database, description: 'Update customer record' },
                { type: 'action', name: 'AI Analysis', icon: Brain, description: 'Run AI analysis on call data' },
                { type: 'action', name: 'Generate Report', icon: BarChart3, description: 'Generate analytics report' }
            ]
        },
        {
            category: 'Utilities',
            items: [
                { type: 'delay', name: 'Delay', icon: Clock, description: 'Wait for specified time' },
                { type: 'action', name: 'Branch', icon: GitBranch, description: 'Split workflow into branches' },
                { type: 'action', name: 'Loop', icon: Target, description: 'Repeat actions for multiple items' }
            ]
        }
    ];

    const mockTasks: AutomationTask[] = [
        {
            id: 'task-1',
            name: 'Post-Call Follow-up',
            description: 'Automatically send follow-up SMS and email after customer service calls',
            status: 'active',
            steps: [],
            triggers: ['call_ended'],
            lastRun: new Date('2024-01-20T10:30:00'),
            nextRun: new Date('2024-01-21T09:00:00'),
            runCount: 1250,
            successRate: 94.2
        },
        {
            id: 'task-2',
            name: 'Malayalam Call Analysis',
            description: 'Analyze Malayalam calls for sentiment and extract key topics',
            status: 'active',
            steps: [],
            triggers: ['call_ended', 'language_malayalam'],
            lastRun: new Date('2024-01-20T14:15:00'),
            runCount: 890,
            successRate: 98.1
        },
        {
            id: 'task-3',
            name: 'Weekly Performance Report',
            description: 'Generate and email weekly performance reports to managers',
            status: 'active',
            steps: [],
            triggers: ['schedule_weekly'],
            nextRun: new Date('2024-01-22T08:00:00'),
            runCount: 52,
            successRate: 100
        }
    ];

    const handleCreateTask = () => {
        const newTask: AutomationTask = {
            id: `task-${Date.now()}`,
            name: 'New Task',
            description: 'Enter task description',
            status: 'draft',
            steps: [],
            triggers: [],
            runCount: 0,
            successRate: 0
        };
        setCurrentTask(newTask);
        setIsCreating(true);
        setActiveTab('builder');
    };

    const handleSaveTask = () => {
        if (currentTask) {
            setTasks([...tasks, currentTask]);
            setCurrentTask(null);
            setIsCreating(false);
            setActiveTab('tasks');
        }
    };

    const renderTaskBuilder = () => (
        <div className="space-y-6">
            {/* Task Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Task Configuration</CardTitle>
                    <CardDescription>Configure your automation task settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="taskName">Task Name</Label>
                            <Input
                                id="taskName"
                                value={currentTask?.name || ''}
                                onChange={(e) => setCurrentTask(prev => prev ? { ...prev, name: e.target.value } : null)}
                                placeholder="Enter task name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taskStatus">Status</Label>
                            <Select
                                value={currentTask?.status || 'draft'}
                                onValueChange={(value) => setCurrentTask(prev => prev ? { ...prev, status: value as any } : null)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taskDescription">Description</Label>
                        <Textarea
                            id="taskDescription"
                            value={currentTask?.description || ''}
                            onChange={(e) => setCurrentTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                            placeholder="Describe what this task does"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Visual Workflow Builder */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Step Templates Panel */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Step Templates</CardTitle>
                        <CardDescription>Drag and drop to build your workflow</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="triggers" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="triggers" className="text-xs">Triggers</TabsTrigger>
                                <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
                            </TabsList>
                            <TabsContent value="triggers" className="space-y-2 mt-4">
                                {stepTemplates.slice(0, 2).map((category) => (
                                    <div key={category.category}>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">{category.category}</h4>
                                        {category.items.map((item) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <div
                                                    key={item.name}
                                                    className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                                                    draggable
                                                >
                                                    <IconComponent className="h-4 w-4 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </TabsContent>
                            <TabsContent value="actions" className="space-y-2 mt-4">
                                {stepTemplates.slice(2).map((category) => (
                                    <div key={category.category}>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">{category.category}</h4>
                                        {category.items.map((item) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <div
                                                    key={item.name}
                                                    className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                                                    draggable
                                                >
                                                    <IconComponent className="h-4 w-4 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Workflow Canvas */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5" />
                            Visual Workflow Builder
                        </CardTitle>
                        <CardDescription>Design your automation workflow</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium">Drag steps here to build your workflow</p>
                                <p className="text-sm">Start with a trigger, add conditions and actions</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">
                                <Play className="h-4 w-4 mr-2" />
                                Test Workflow
                            </Button>
                            <Button onClick={handleSaveTask}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Task
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderTasksList = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Automation Tasks</h2>
                    <p className="text-gray-600">Manage your AI-powered automation workflows</p>
                </div>
                <Button onClick={handleCreateTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Task
                </Button>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{task.name}</CardTitle>
                                    <CardDescription className="mt-1">{task.description}</CardDescription>
                                </div>
                                <Badge
                                    variant={task.status === 'active' ? 'default' : task.status === 'inactive' ? 'secondary' : 'outline'}
                                    className={
                                        task.status === 'active' ? 'bg-green-100 text-green-800' :
                                            task.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                    }
                                >
                                    {task.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{task.runCount}</p>
                                        <p className="text-sm text-blue-600">Total Runs</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{task.successRate}%</p>
                                        <p className="text-sm text-green-600">Success Rate</p>
                                    </div>
                                </div>

                                {/* Last/Next Run */}
                                <div className="space-y-2 text-sm text-gray-600">
                                    {task.lastRun && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Last run: {task.lastRun.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {task.nextRun && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span>Next run: {task.nextRun.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Triggers */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Triggers:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {task.triggers.map((trigger) => (
                                            <Badge key={trigger} variant="outline" className="text-xs">
                                                {trigger.replace('_', ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Settings className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Play className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="builder">Builder</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks">
                    {renderTasksList()}
                </TabsContent>

                <TabsContent value="builder">
                    {isCreating ? renderTaskBuilder() : (
                        <div className="text-center py-12">
                            <GitBranch className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Task Selected</h3>
                            <p className="text-gray-600 mb-4">Create a new task or select an existing one to edit</p>
                            <Button onClick={handleCreateTask}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Task
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                        <p className="text-3xl font-bold">{mockTasks.length}</p>
                                    </div>
                                    <GitBranch className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                                        <p className="text-3xl font-bold">{mockTasks.filter(t => t.status === 'active').length}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Executions</p>
                                        <p className="text-3xl font-bold">{mockTasks.reduce((sum, task) => sum + task.runCount, 0)}</p>
                                    </div>
                                    <Play className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                                        <p className="text-3xl font-bold">
                                            {(mockTasks.reduce((sum, task) => sum + task.successRate, 0) / mockTasks.length).toFixed(1)}%
                                        </p>
                                    </div>
                                    <Target className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}