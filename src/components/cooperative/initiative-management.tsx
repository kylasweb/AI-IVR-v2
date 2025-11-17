'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Plus, Target, CheckCircle, Clock, TrendingUp, Calendar, TrendingUp as DollarSign, Users } from 'lucide-react';

interface CooperativeInitiative {
    id: string;
    title: string;
    description?: string;
    strategyId: string;
    status: string;
    priority: string;
    progress: number;
    startDate?: string;
    endDate?: string;
    budget?: number;
    assignedTo?: string;
    createdAt: string;
    strategy: {
        id: string;
        title: string;
        society: {
            id: string;
            name: string;
        };
    };
    _count: {
        milestones: number;
    };
}

interface CooperativeStrategy {
    id: string;
    title: string;
    society: {
        id: string;
        name: string;
    };
}

const InitiativeManagement: React.FC = () => {
    const [initiatives, setInitiatives] = useState<CooperativeInitiative[]>([]);
    const [strategies, setStrategies] = useState<CooperativeStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInitiativeDialog, setShowInitiativeDialog] = useState(false);
    const [editingInitiative, setEditingInitiative] = useState<CooperativeInitiative | null>(null);

    // Initiative form
    const [initiativeForm, setInitiativeForm] = useState({
        strategyId: '',
        title: '',
        description: '',
        priority: 'medium',
        startDate: '',
        endDate: '',
        budget: '',
        assignedTo: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [initiativesRes, strategiesRes] = await Promise.all([
                fetch('/api/cooperative/initiatives'),
                fetch('/api/cooperative/strategies')
            ]);

            if (initiativesRes.ok) {
                const initiativesData = await initiativesRes.json();
                setInitiatives(initiativesData.data || []);
            }

            if (strategiesRes.ok) {
                const strategiesData = await strategiesRes.json();
                setStrategies(strategiesData.data || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInitiative = async () => {
        try {
            const response = await fetch('/api/cooperative/initiatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...initiativeForm,
                    budget: initiativeForm.budget ? parseFloat(initiativeForm.budget) : undefined
                })
            });

            if (response.ok) {
                setShowInitiativeDialog(false);
                setInitiativeForm({
                    strategyId: '',
                    title: '',
                    description: '',
                    priority: 'medium',
                    startDate: '',
                    endDate: '',
                    budget: '',
                    assignedTo: ''
                });
                loadData();
            }
        } catch (error) {
            console.error('Error creating initiative:', error);
        }
    };

    const handleUpdateProgress = async (initiativeId: string, progress: number) => {
        try {
            const response = await fetch(`/api/cooperative/initiatives/${initiativeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress })
            });

            if (response.ok) {
                loadData();
            }
        } catch (error) {
            console.error('Error updating initiative progress:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'planned': return 'bg-yellow-100 text-yellow-800';
            case 'on_hold': return 'bg-orange-100 text-orange-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Target className="h-6 w-6 text-blue-500" />
                        Initiative Management
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Track and manage cooperative initiatives and their progress
                    </p>
                </div>

                <Dialog open={showInitiativeDialog} onOpenChange={setShowInitiativeDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Initiative
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Initiative</DialogTitle>
                            <DialogDescription>
                                Create a new initiative for a cooperative strategy
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="initiative-strategy">Strategy</Label>
                                <Select value={initiativeForm.strategyId} onValueChange={(value) => setInitiativeForm({ ...initiativeForm, strategyId: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select strategy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {strategies.map((strategy) => (
                                            <SelectItem key={strategy.id} value={strategy.id}>
                                                {strategy.title} ({strategy.society.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="initiative-title">Initiative Title</Label>
                                <Input
                                    id="initiative-title"
                                    value={initiativeForm.title}
                                    onChange={(e) => setInitiativeForm({ ...initiativeForm, title: e.target.value })}
                                    placeholder="Enter initiative title"
                                />
                            </div>
                            <div>
                                <Label htmlFor="initiative-description">Description</Label>
                                <Textarea
                                    id="initiative-description"
                                    value={initiativeForm.description}
                                    onChange={(e) => setInitiativeForm({ ...initiativeForm, description: e.target.value })}
                                    placeholder="Describe the initiative"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="initiative-priority">Priority</Label>
                                    <Select value={initiativeForm.priority} onValueChange={(value) => setInitiativeForm({ ...initiativeForm, priority: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="initiative-budget">Budget (₹)</Label>
                                    <Input
                                        id="initiative-budget"
                                        type="number"
                                        value={initiativeForm.budget}
                                        onChange={(e) => setInitiativeForm({ ...initiativeForm, budget: e.target.value })}
                                        placeholder="Enter budget"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="initiative-start-date">Start Date</Label>
                                    <Input
                                        id="initiative-start-date"
                                        type="date"
                                        value={initiativeForm.startDate}
                                        onChange={(e) => setInitiativeForm({ ...initiativeForm, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="initiative-end-date">End Date</Label>
                                    <Input
                                        id="initiative-end-date"
                                        type="date"
                                        value={initiativeForm.endDate}
                                        onChange={(e) => setInitiativeForm({ ...initiativeForm, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="initiative-assigned">Assigned To</Label>
                                <Input
                                    id="initiative-assigned"
                                    value={initiativeForm.assignedTo}
                                    onChange={(e) => setInitiativeForm({ ...initiativeForm, assignedTo: e.target.value })}
                                    placeholder="Enter assignee name or ID"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateInitiative}>Create Initiative</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {initiatives.map((initiative) => (
                    <Card key={initiative.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{initiative.title}</CardTitle>
                                <div className="flex gap-2">
                                    <Badge className={getPriorityColor(initiative.priority)}>
                                        {initiative.priority}
                                    </Badge>
                                    <Badge className={getStatusColor(initiative.status)}>
                                        {initiative.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <CardDescription>{initiative.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Target className="h-4 w-4 text-blue-500" />
                                    <span>{initiative.strategy.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-green-500" />
                                    <span>{initiative.strategy.society.name}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{initiative.progress}%</span>
                                    </div>
                                    <Progress value={initiative.progress} className="w-full" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {initiative.startDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-orange-500" />
                                            <span>Start: {new Date(initiative.startDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {initiative.endDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-red-500" />
                                            <span>End: {new Date(initiative.endDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {initiative.budget && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-purple-500" />
                                            <span>₹{initiative.budget.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                                        <span>{initiative._count.milestones} milestones</span>
                                    </div>
                                </div>

                                {initiative.assignedTo && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>Assigned to: {initiative.assignedTo}</span>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateProgress(initiative.id, Math.min(100, initiative.progress + 10))}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Update Progress
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default InitiativeManagement;