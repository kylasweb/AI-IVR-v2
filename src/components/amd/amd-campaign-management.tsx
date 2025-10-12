// AMD Campaign Management - Phase 3 Implementation
// Comprehensive campaign creation and management with Malayalam cultural intelligence

'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Plus,
    Settings,
    Play,
    Play as Pause,
    XCircle as Stop,
    Settings as Edit,
    Trash2,
    Copy,
    Download,
    Upload,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Clock,
    Users,
    MessageSquare,
    Globe,
    Brain,
    Target,
    BarChart3,
    Clock as Calendar,
    Mic,
    Volume2,
    PhoneCall,
    MapPin,
    Star,
    TrendingUp,
    Eye,
    MoreHorizontal,
    Filter,
    Search,
} from 'lucide-react';

interface AMDCampaign {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'draft';
    culturalProfile: {
        primaryLanguage: 'malayalam' | 'english' | 'mixed';
        targetAudience: 'business' | 'personal' | 'healthcare' | 'education';
        culturalSensitivity: 'high' | 'medium' | 'low';
        festivalAdaptation: boolean;
    };
    messageConfiguration: {
        humanMessage: {
            malayalam: string;
            english: string;
            duration: number;
        };
        machineMessage: {
            malayalam: string;
            english: string;
            duration: number;
        };
        callbackSettings: {
            enabled: boolean;
            delayHours: number;
            maxAttempts: number;
        };
    };
    analytics: {
        totalCalls: number;
        amdDetections: number;
        humanConnections: number;
        messagesLeft: number;
        callbackSuccess: number;
        culturalEngagement: number;
    };
    createdAt: string;
    updatedAt: string;
}

export function AMDCampaignManagement() {
    const [campaigns, setCampaigns] = useState<AMDCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState<AMDCampaign | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');

    // Form state for campaign creation/editing
    const [formData, setFormData] = useState({
        name: '',
        culturalProfile: {
            primaryLanguage: 'malayalam' as 'malayalam' | 'english' | 'mixed',
            targetAudience: 'business' as 'business' | 'personal' | 'healthcare' | 'education',
            culturalSensitivity: 'high' as 'high' | 'medium' | 'low',
            festivalAdaptation: true,
        },
        messageConfiguration: {
            humanMessage: {
                malayalam: '',
                english: '',
                duration: 30,
            },
            machineMessage: {
                malayalam: '',
                english: '',
                duration: 45,
            },
            callbackSettings: {
                enabled: true,
                delayHours: 4,
                maxAttempts: 3,
            },
        },
    });

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/cloud-communication/amd/campaigns');
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.data.campaigns);
            }
        } catch (error) {
            console.error('Failed to load campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const createCampaign = async () => {
        try {
            const response = await fetch('/api/cloud-communication/amd/campaigns?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setCampaigns(prev => [...prev, data.data.campaign]);
                setShowCreateDialog(false);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to create campaign:', error);
        }
    };

    const updateCampaign = async (campaignId: string) => {
        try {
            const response = await fetch(`/api/cloud-communication/amd/campaigns?action=update&campaignId=${campaignId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setCampaigns(prev => prev.map(c => c.id === campaignId ? data.data.campaign : c));
                setShowEditDialog(false);
                setSelectedCampaign(null);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to update campaign:', error);
        }
    };

    const deleteCampaign = async (campaignId: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            const response = await fetch(`/api/cloud-communication/amd/campaigns?campaignId=${campaignId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCampaigns(prev => prev.filter(c => c.id !== campaignId));
            }
        } catch (error) {
            console.error('Failed to delete campaign:', error);
        }
    };

    const toggleCampaignStatus = async (campaign: AMDCampaign) => {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';

        try {
            const response = await fetch(`/api/cloud-communication/amd/campaigns?action=update&campaignId=${campaign.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setCampaigns(prev => prev.map(c =>
                    c.id === campaign.id ? { ...c, status: newStatus } : c
                ));
            }
        } catch (error) {
            console.error('Failed to toggle campaign status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            culturalProfile: {
                primaryLanguage: 'malayalam' as 'malayalam' | 'english' | 'mixed',
                targetAudience: 'business' as 'business' | 'personal' | 'healthcare' | 'education',
                culturalSensitivity: 'high' as 'high' | 'medium' | 'low',
                festivalAdaptation: true,
            },
            messageConfiguration: {
                humanMessage: {
                    malayalam: '',
                    english: '',
                    duration: 30,
                },
                machineMessage: {
                    malayalam: '',
                    english: '',
                    duration: 45,
                },
                callbackSettings: {
                    enabled: true,
                    delayHours: 4,
                    maxAttempts: 3,
                },
            },
        });
    };

    const openEditDialog = (campaign: AMDCampaign) => {
        setSelectedCampaign(campaign);
        setFormData({
            name: campaign.name,
            culturalProfile: {
                primaryLanguage: campaign.culturalProfile.primaryLanguage,
                targetAudience: campaign.culturalProfile.targetAudience,
                culturalSensitivity: campaign.culturalProfile.culturalSensitivity,
                festivalAdaptation: campaign.culturalProfile.festivalAdaptation,
            },
            messageConfiguration: campaign.messageConfiguration,
        });
        setShowEditDialog(true);
    }; const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'paused': return 'bg-yellow-500';
            case 'completed': return 'bg-blue-500';
            case 'draft': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getLanguageIcon = (language: string) => {
        switch (language) {
            case 'malayalam': return <Globe className="w-4 h-4 text-green-600" />;
            case 'english': return <Globe className="w-4 h-4 text-blue-600" />;
            case 'mixed': return <Globe className="w-4 h-4 text-purple-600" />;
            default: return <Globe className="w-4 h-4 text-gray-600" />;
        }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        const matchesLanguage = languageFilter === 'all' || campaign.culturalProfile.primaryLanguage === languageFilter;
        return matchesSearch && matchesStatus && matchesLanguage;
    });

    const CampaignFormDialog = ({
        isOpen,
        onClose,
        onSubmit,
        title,
        description
    }: {
        isOpen: boolean;
        onClose: () => void;
        onSubmit: () => void;
        title: string;
        description: string;
    }) => (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="cultural">Cultural Profile</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Campaign Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter campaign name"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="cultural" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Primary Language</Label>
                                <Select
                                    value={formData.culturalProfile.primaryLanguage}
                                    onValueChange={(value) => setFormData(prev => ({
                                        ...prev,
                                        culturalProfile: { ...prev.culturalProfile, primaryLanguage: value as any }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="malayalam">Malayalam</SelectItem>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="mixed">Mixed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Target Audience</Label>
                                <Select
                                    value={formData.culturalProfile.targetAudience}
                                    onValueChange={(value) => setFormData(prev => ({
                                        ...prev,
                                        culturalProfile: { ...prev.culturalProfile, targetAudience: value as any }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="personal">Personal</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="education">Education</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Cultural Sensitivity</Label>
                                <Select
                                    value={formData.culturalProfile.culturalSensitivity}
                                    onValueChange={(value) => setFormData(prev => ({
                                        ...prev,
                                        culturalProfile: { ...prev.culturalProfile, culturalSensitivity: value as any }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="festival-adaptation"
                                    checked={formData.culturalProfile.festivalAdaptation}
                                    onCheckedChange={(checked) => setFormData(prev => ({
                                        ...prev,
                                        culturalProfile: { ...prev.culturalProfile, festivalAdaptation: checked }
                                    }))}
                                />
                                <Label htmlFor="festival-adaptation">Festival Adaptation</Label>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="messages" className="space-y-4">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium mb-4">Human Message</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Malayalam</Label>
                                        <Textarea
                                            value={formData.messageConfiguration.humanMessage.malayalam}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                messageConfiguration: {
                                                    ...prev.messageConfiguration,
                                                    humanMessage: { ...prev.messageConfiguration.humanMessage, malayalam: e.target.value }
                                                }
                                            }))}
                                            placeholder="നമസ്കാരം, ഞാൻ..."
                                        />
                                    </div>
                                    <div>
                                        <Label>English</Label>
                                        <Textarea
                                            value={formData.messageConfiguration.humanMessage.english}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                messageConfiguration: {
                                                    ...prev.messageConfiguration,
                                                    humanMessage: { ...prev.messageConfiguration.humanMessage, english: e.target.value }
                                                }
                                            }))}
                                            placeholder="Hello, I am calling from..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-medium mb-4">Machine Message</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Malayalam</Label>
                                        <Textarea
                                            value={formData.messageConfiguration.machineMessage.malayalam}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                messageConfiguration: {
                                                    ...prev.messageConfiguration,
                                                    machineMessage: { ...prev.messageConfiguration.machineMessage, malayalam: e.target.value }
                                                }
                                            }))}
                                            placeholder="നമസ്കാരം, ദയവായി സന്ദേശം രേഖപ്പെടുത്തുക..."
                                        />
                                    </div>
                                    <div>
                                        <Label>English</Label>
                                        <Textarea
                                            value={formData.messageConfiguration.machineMessage.english}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                messageConfiguration: {
                                                    ...prev.messageConfiguration,
                                                    machineMessage: { ...prev.messageConfiguration.machineMessage, english: e.target.value }
                                                }
                                            }))}
                                            placeholder="Hello, please leave a message after the beep..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-medium mb-4">Callback Settings</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="callback-enabled"
                                            checked={formData.messageConfiguration.callbackSettings.enabled}
                                            onCheckedChange={(checked) => setFormData(prev => ({
                                                ...prev,
                                                messageConfiguration: {
                                                    ...prev.messageConfiguration,
                                                    callbackSettings: { ...prev.messageConfiguration.callbackSettings, enabled: checked }
                                                }
                                            }))}
                                        />
                                        <Label htmlFor="callback-enabled">Enable Callbacks</Label>
                                    </div>
                                    <div>
                                        <Label>Delay Hours</Label>
                                        <Input
                                            type="number"
                                            value={formData.messageConfiguration.callbackSettings.delayHours}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                messageConfiguration: {
                                                    ...prev.messageConfiguration,
                                                    callbackSettings: { ...prev.messageConfiguration.callbackSettings, delayHours: parseInt(e.target.value) || 0 }
                                                }
                                            }))}
                                            min="1"
                                            max="168"
                                        />
                                    </div>
                                    <div>
                                        <Label>Max Attempts</Label>
                                        <Input
                                            type="number"
                                            value={formData.messageConfiguration.callbackSettings.maxAttempts}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                messageConfiguration: {
                                                    ...prev.messageConfiguration,
                                                    callbackSettings: { ...prev.messageConfiguration.callbackSettings, maxAttempts: parseInt(e.target.value) || 0 }
                                                }
                                            }))}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit}>
                        {selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AMD Campaign Management</h2>
                    <p className="text-muted-foreground">
                        Create and manage answering machine detection campaigns with cultural intelligence
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search campaigns..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={languageFilter} onValueChange={setLanguageFilter}>
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Languages</SelectItem>
                                <SelectItem value="malayalam">Malayalam</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={loadCampaigns}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Campaigns List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Loading campaigns...
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm || statusFilter !== 'all' || languageFilter !== 'all'
                                        ? 'Try adjusting your filters or search terms.'
                                        : 'Create your first AMD campaign to get started with intelligent call handling.'
                                    }
                                </p>
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Campaign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-4 h-4 rounded-full ${getStatusColor(campaign.status)}`}></div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                <div className="flex items-center space-x-1">
                                                    {getLanguageIcon(campaign.culturalProfile.primaryLanguage)}
                                                    <span className="capitalize">{campaign.culturalProfile.primaryLanguage}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="w-4 h-4" />
                                                    <span className="capitalize">{campaign.culturalProfile.targetAudience}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Brain className="w-4 h-4" />
                                                    <span className="capitalize">{campaign.culturalProfile.culturalSensitivity} sensitivity</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{campaign.analytics.totalCalls}</div>
                                            <div className="text-sm text-muted-foreground">Total Calls</div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xl font-semibold text-green-600">{campaign.analytics.humanConnections}</div>
                                            <div className="text-sm text-muted-foreground">Human</div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xl font-semibold text-blue-600">{campaign.analytics.amdDetections}</div>
                                            <div className="text-sm text-muted-foreground">Machine</div>
                                        </div>

                                        <Badge variant="outline" className="capitalize">
                                            {campaign.status}
                                        </Badge>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleCampaignStatus(campaign)}
                                            >
                                                {campaign.status === 'active' ? (
                                                    <><Play as Pause className="w-4 h-4 mr-1" /> Pause</>
                                                ) : (
                                                    <><Play className="w-4 h-4 mr-1" /> Start</>
                                                )}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(campaign)}
                                            >
                                                <Settings as Edit className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => deleteCampaign(campaign.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold">{campaign.analytics.culturalEngagement}</div>
                                        <div className="text-sm text-muted-foreground">Cultural Engagement</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold">{campaign.analytics.messagesLeft}</div>
                                        <div className="text-sm text-muted-foreground">Messages Left</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold">{campaign.analytics.callbackSuccess}</div>
                                        <div className="text-sm text-muted-foreground">Callback Success</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold">
                                            {campaign.analytics.totalCalls > 0
                                                ? ((campaign.analytics.humanConnections / campaign.analytics.totalCalls) * 100).toFixed(1)
                                                : 0}%
                                        </div>
                                        <div className="text-sm text-muted-foreground">Success Rate</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Campaign Dialog */}
            <CampaignFormDialog
                isOpen={showCreateDialog}
                onClose={() => {
                    setShowCreateDialog(false);
                    resetForm();
                }}
                onSubmit={createCampaign}
                title="Create New AMD Campaign"
                description="Set up an intelligent answering machine detection campaign with Malayalam cultural adaptation."
            />

            {/* Edit Campaign Dialog */}
            <CampaignFormDialog
                isOpen={showEditDialog}
                onClose={() => {
                    setShowEditDialog(false);
                    setSelectedCampaign(null);
                    resetForm();
                }}
                onSubmit={() => selectedCampaign && updateCampaign(selectedCampaign.id)}
                title="Edit AMD Campaign"
                description="Update campaign settings and cultural configurations."
            />
        </div>
    );
}