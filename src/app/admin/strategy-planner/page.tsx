'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, Users, Target, TrendingUp, Building2, MapPin, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import MemberManagement from '@/components/cooperative/member-management';
import InitiativeManagement from '@/components/cooperative/initiative-management';
import ManagementLayout from '@/components/layout/management-layout';

interface CooperativeSociety {
    id: string;
    name: string;
    description?: string;
    type: string;
    region: string;
    memberCount: number;
    status: string;
    createdAt: string;
    _count: {
        members: number;
        strategies: number;
        initiatives: number;
    };
}

interface CooperativeStrategy {
    id: string;
    title: string;
    description?: string;
    category: string;
    priority: string;
    status: string;
    targetDate?: string;
    budget?: number;
    createdAt: string;
    society: {
        id: string;
        name: string;
        type: string;
        region: string;
    };
    creator: {
        id: string;
        name: string;
    };
    assignee?: {
        id: string;
        name: string;
    };
    _count: {
        initiatives: number;
    };
}

const StrategyPlannerPage: React.FC = () => {
    const [societies, setSocieties] = useState<CooperativeSociety[]>([]);
    const [strategies, setStrategies] = useState<CooperativeStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('societies');

    // Form states
    const [showSocietyDialog, setShowSocietyDialog] = useState(false);
    const [showStrategyDialog, setShowStrategyDialog] = useState(false);
    const [editingSociety, setEditingSociety] = useState<CooperativeSociety | null>(null);
    const [editingStrategy, setEditingStrategy] = useState<CooperativeStrategy | null>(null);

    // Society form
    const [societyForm, setSocietyForm] = useState({
        name: '',
        description: '',
        type: '',
        region: ''
    });

    // Strategy form
    const [strategyForm, setStrategyForm] = useState({
        societyId: '',
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        targetDate: '',
        budget: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [societiesRes, strategiesRes] = await Promise.all([
                fetch('/api/cooperative/societies'),
                fetch('/api/cooperative/strategies')
            ]);

            if (societiesRes.ok) {
                const societiesData = await societiesRes.json();
                setSocieties(societiesData.data || []);
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

    const handleCreateSociety = async () => {
        try {
            const response = await fetch('/api/cooperative/societies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(societyForm)
            });

            if (response.ok) {
                setShowSocietyDialog(false);
                setSocietyForm({ name: '', description: '', type: '', region: '' });
                loadData();
            }
        } catch (error) {
            console.error('Error creating society:', error);
        }
    };

    const handleCreateStrategy = async () => {
        try {
            const response = await fetch('/api/cooperative/strategies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...strategyForm,
                    budget: strategyForm.budget ? parseFloat(strategyForm.budget) : undefined
                })
            });

            if (response.ok) {
                setShowStrategyDialog(false);
                setStrategyForm({
                    societyId: '',
                    title: '',
                    description: '',
                    category: '',
                    priority: 'medium',
                    targetDate: '',
                    budget: ''
                });
                loadData();
            }
        } catch (error) {
            console.error('Error creating strategy:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-blue-100 text-blue-800';
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

    const getStrategyStatusColor = (status: string) => {
        switch (status) {
            case 'implemented': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'planned': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <ManagementLayout>
                <div className="p-6">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </ManagementLayout>
        );
    }

    return (
        <ManagementLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Target className="h-8 w-8 text-blue-500" />
                            Strategy Planner
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage cooperative societies and workforce development strategies
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Dialog open={showSocietyDialog} onOpenChange={setShowSocietyDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Building2 className="h-4 w-4 mr-2" />
                                    Add Society
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Cooperative Society</DialogTitle>
                                    <DialogDescription>
                                        Add a new cooperative society for workforce management
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="society-name">Society Name</Label>
                                        <Input
                                            id="society-name"
                                            value={societyForm.name}
                                            onChange={(e) => setSocietyForm({ ...societyForm, name: e.target.value })}
                                            placeholder="Enter society name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="society-description">Description</Label>
                                        <Textarea
                                            id="society-description"
                                            value={societyForm.description}
                                            onChange={(e) => setSocietyForm({ ...societyForm, description: e.target.value })}
                                            placeholder="Describe the society"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="society-type">Type</Label>
                                            <Select value={societyForm.type} onValueChange={(value) => setSocietyForm({ ...societyForm, type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ride_hailing">Ride Hailing</SelectItem>
                                                    <SelectItem value="delivery">Delivery</SelectItem>
                                                    <SelectItem value="services">Services</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="society-region">Region</Label>
                                            <Select value={societyForm.region} onValueChange={(value) => setSocietyForm({ ...societyForm, region: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select region" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="kerala">Kerala</SelectItem>
                                                    <SelectItem value="tamil_nadu">Tamil Nadu</SelectItem>
                                                    <SelectItem value="karnataka">Karnataka</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateSociety}>Create Society</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showStrategyDialog} onOpenChange={setShowStrategyDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Target className="h-4 w-4 mr-2" />
                                    Add Strategy
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create Strategy</DialogTitle>
                                    <DialogDescription>
                                        Create a new cooperative strategy for workforce development
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="strategy-society">Society</Label>
                                        <Select value={strategyForm.societyId} onValueChange={(value) => setStrategyForm({ ...strategyForm, societyId: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select society" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {societies.map((society) => (
                                                    <SelectItem key={society.id} value={society.id}>
                                                        {society.name} ({society.region})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="strategy-title">Strategy Title</Label>
                                        <Input
                                            id="strategy-title"
                                            value={strategyForm.title}
                                            onChange={(e) => setStrategyForm({ ...strategyForm, title: e.target.value })}
                                            placeholder="Enter strategy title"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="strategy-description">Description</Label>
                                        <Textarea
                                            id="strategy-description"
                                            value={strategyForm.description}
                                            onChange={(e) => setStrategyForm({ ...strategyForm, description: e.target.value })}
                                            placeholder="Describe the strategy"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="strategy-category">Category</Label>
                                            <Select value={strategyForm.category} onValueChange={(value) => setStrategyForm({ ...strategyForm, category: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="revenue_sharing">Revenue Sharing</SelectItem>
                                                    <SelectItem value="workforce_development">Workforce Development</SelectItem>
                                                    <SelectItem value="technology_adoption">Technology Adoption</SelectItem>
                                                    <SelectItem value="partnership">Partnership</SelectItem>
                                                    <SelectItem value="policy">Policy</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="strategy-priority">Priority</Label>
                                            <Select value={strategyForm.priority} onValueChange={(value) => setStrategyForm({ ...strategyForm, priority: value })}>
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
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="strategy-target-date">Target Date</Label>
                                            <Input
                                                id="strategy-target-date"
                                                type="date"
                                                value={strategyForm.targetDate}
                                                onChange={(e) => setStrategyForm({ ...strategyForm, targetDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="strategy-budget">Budget (₹)</Label>
                                            <Input
                                                id="strategy-budget"
                                                type="number"
                                                value={strategyForm.budget}
                                                onChange={(e) => setStrategyForm({ ...strategyForm, budget: e.target.value })}
                                                placeholder="Enter budget"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateStrategy}>Create Strategy</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="societies">Societies</TabsTrigger>
                        <TabsTrigger value="strategies">Strategies</TabsTrigger>
                        <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                    </TabsList>

                    <TabsContent value="societies" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {societies.map((society) => (
                                <Card key={society.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{society.name}</CardTitle>
                                            <Badge className={getStatusColor(society.status)}>
                                                {society.status}
                                            </Badge>
                                        </div>
                                        <CardDescription>{society.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Building2 className="h-4 w-4 text-blue-500" />
                                                <span>{society.type.replace('_', ' ').toUpperCase()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-green-500" />
                                                <span>{society.region.replace('_', ' ').toUpperCase()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-purple-500" />
                                                <span>{society._count.members} members</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Target className="h-4 w-4 text-orange-500" />
                                                <span>{society._count.strategies} strategies</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="strategies" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {strategies.map((strategy) => (
                                <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{strategy.title}</CardTitle>
                                            <div className="flex gap-2">
                                                <Badge className={getPriorityColor(strategy.priority)}>
                                                    {strategy.priority}
                                                </Badge>
                                                <Badge className={getStrategyStatusColor(strategy.status)}>
                                                    {strategy.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardDescription>{strategy.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Building2 className="h-4 w-4 text-blue-500" />
                                                <span>{strategy.society.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Target className="h-4 w-4 text-green-500" />
                                                <span>{strategy.category.replace('_', ' ').toUpperCase()}</span>
                                            </div>
                                            {strategy.targetDate && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-orange-500" />
                                                    <span>{new Date(strategy.targetDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {strategy.budget && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <DollarSign className="h-4 w-4 text-purple-500" />
                                                    <span>₹{strategy.budget.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm">
                                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                                <span>{strategy._count.initiatives} initiatives</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="initiatives">
                        <InitiativeManagement />
                    </TabsContent>

                    <TabsContent value="members">
                        <MemberManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </ManagementLayout>
    );
};

export default StrategyPlannerPage;