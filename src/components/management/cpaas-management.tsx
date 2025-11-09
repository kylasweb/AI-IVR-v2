'use client';

import React, { useState, useEffect } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Zap as Cloud,
    Phone,
    MessageSquare,
    Settings,
    Plus,
    Settings as Edit,
    Trash2,
    Eye,
    Activity as TestTube,
    Activity,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Zap,
    Globe,
    Shield as Lock,
    Activity as Wifi,
    XCircle as WifiOff,
    Save,
    RotateCcw,
    Copy,
    Globe as ExternalLink,
    BarChart3,
    TrendingUp as DollarSign,
    Clock,
    Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CPaaSProvider {
    id: string;
    name: string;
    type: 'voice' | 'sms' | 'whatsapp' | 'email' | 'multi';
    provider: 'twilio' | 'exotel' | 'knowlarity' | 'msg91' | 'aws_sns' | 'azure_communication' | 'custom';
    status: 'active' | 'inactive' | 'testing' | 'error';
    configuration: {
        accountSid?: string;
        authToken?: string;
        apiKey?: string;
        apiSecret?: string;
        webhookUrl?: string;
        region?: string;
        environment?: 'production' | 'sandbox';
    };
    features: string[];
    pricing: {
        voiceRate?: number;
        smsRate?: number;
        whatsappRate?: number;
        currency: string;
    };
    usage: {
        voiceCalls: number;
        smsCount: number;
        whatsappMessages: number;
        monthlyCost: number;
    };
    limits: {
        dailyLimit?: number;
        monthlyLimit?: number;
        rateLimit?: number;
    };
    createdAt: string;
    updatedAt: string;
}

interface CPaaSStats {
    totalProviders: number;
    activeProviders: number;
    totalCalls: number;
    totalSMS: number;
    totalCost: number;
    avgResponseTime: number;
}

const CPaaSManagement: React.FC = () => {
    const [providers, setProviders] = useState<CPaaSProvider[]>([]);
    const [stats, setStats] = useState<CPaaSStats>({
        totalProviders: 0,
        activeProviders: 0,
        totalCalls: 0,
        totalSMS: 0,
        totalCost: 0,
        avgResponseTime: 0
    });
    const [selectedProvider, setSelectedProvider] = useState<CPaaSProvider | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [loading, setLoading] = useState(false);

    // Mock data
    const mockProviders: CPaaSProvider[] = [
        {
            id: '1',
            name: 'Twilio Production',
            type: 'multi',
            provider: 'twilio',
            status: 'active',
            configuration: {
                accountSid: 'ACxxxxxxxxxx',
                authToken: '****',
                region: 'us1',
                environment: 'production',
                webhookUrl: 'https://your-app.com/webhook/twilio'
            },
            features: ['Voice', 'SMS', 'WhatsApp', 'Video'],
            pricing: {
                voiceRate: 0.0085,
                smsRate: 0.0075,
                whatsappRate: 0.0055,
                currency: 'USD'
            },
            usage: {
                voiceCalls: 15420,
                smsCount: 28540,
                whatsappMessages: 8930,
                monthlyCost: 1245.67
            },
            limits: {
                dailyLimit: 10000,
                monthlyLimit: 300000,
                rateLimit: 100
            },
            createdAt: '2024-01-15',
            updatedAt: '2024-11-08'
        },
        {
            id: '2',
            name: 'Exotel India',
            type: 'voice',
            provider: 'exotel',
            status: 'active',
            configuration: {
                apiKey: 'EXxxxxxxxxxx',
                apiSecret: '****',
                region: 'mumbai',
                environment: 'production'
            },
            features: ['Voice', 'IVR', 'Call Recording'],
            pricing: {
                voiceRate: 0.012,
                currency: 'INR'
            },
            usage: {
                voiceCalls: 8750,
                smsCount: 0,
                whatsappMessages: 0,
                monthlyCost: 890.45
            },
            limits: {
                dailyLimit: 5000,
                monthlyLimit: 150000
            },
            createdAt: '2024-02-20',
            updatedAt: '2024-11-07'
        },
        {
            id: '3',
            name: 'Knowlarity Enterprise',
            type: 'voice',
            provider: 'knowlarity',
            status: 'testing',
            configuration: {
                apiKey: 'KNxxxxxxxxxx',
                apiSecret: '****',
                environment: 'sandbox'
            },
            features: ['Voice', 'Virtual Number', 'Call Analytics'],
            pricing: {
                voiceRate: 0.015,
                currency: 'INR'
            },
            usage: {
                voiceCalls: 245,
                smsCount: 0,
                whatsappMessages: 0,
                monthlyCost: 45.30
            },
            limits: {
                dailyLimit: 1000,
                monthlyLimit: 30000
            },
            createdAt: '2024-11-01',
            updatedAt: '2024-11-08'
        }
    ];

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setProviders(mockProviders);

            // Calculate stats
            const activeCount = mockProviders.filter(p => p.status === 'active').length;
            const totalCalls = mockProviders.reduce((sum, p) => sum + p.usage.voiceCalls, 0);
            const totalSMS = mockProviders.reduce((sum, p) => sum + p.usage.smsCount, 0);
            const totalCost = mockProviders.reduce((sum, p) => sum + p.usage.monthlyCost, 0);

            setStats({
                totalProviders: mockProviders.length,
                activeProviders: activeCount,
                totalCalls,
                totalSMS,
                totalCost,
                avgResponseTime: 1.2
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load CPaaS providers",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProvider = () => {
        setSelectedProvider(null);
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEditProvider = (provider: CPaaSProvider) => {
        setSelectedProvider(provider);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleDeleteProvider = async (providerId: string) => {
        if (confirm('Are you sure you want to delete this provider?')) {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));
                setProviders(prev => prev.filter(p => p.id !== providerId));
                toast({
                    title: "Success",
                    description: "Provider deleted successfully",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete provider",
                    variant: "destructive",
                });
            }
        }
    };

    const handleTestProvider = async (providerId: string) => {
        try {
            setLoading(true);
            // Simulate API test call
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast({
                title: "Test Successful",
                description: "Connection test passed successfully",
            });
        } catch (error) {
            toast({
                title: "Test Failed",
                description: "Connection test failed. Please check configuration.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (providerId: string) => {
        try {
            setProviders(prev => prev.map(p =>
                p.id === providerId
                    ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
                    : p
            ));

            toast({
                title: "Status Updated",
                description: "Provider status updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update provider status",
                variant: "destructive",
            });
        }
    };

    const filteredProviders = providers.filter(provider => {
        const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.provider.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
        const matchesType = filterType === 'all' || provider.type === filterType;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'twilio': return <Cloud className="h-5 w-5 text-red-500" />;
            case 'exotel': return <Phone className="h-5 w-5 text-blue-500" />;
            case 'knowlarity': return <MessageSquare className="h-5 w-5 text-green-500" />;
            case 'aws_sns': return <Zap className="h-5 w-5 text-orange-500" />;
            case 'azure_communication': return <Globe className="h-5 w-5 text-blue-600" />;
            default: return <Settings className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'inactive': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'testing': return <TestTube className="h-4 w-4 text-yellow-500" />;
            case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default: return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            case 'testing': return 'outline';
            case 'error': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <ManagementLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">CPaaS Management</h1>
                        <p className="text-gray-600 mt-2">
                            Manage Communication Platform as a Service providers and their configurations
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => loadProviders()}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button onClick={handleCreateProvider}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Provider
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProviders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.activeProviders}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Voice Calls</CardTitle>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">SMS Count</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSMS.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgResponseTime}s</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters & Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-64">
                                <Input
                                    placeholder="Search providers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="testing">Testing</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="voice">Voice</SelectItem>
                                    <SelectItem value="sms">SMS</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="multi">Multi-channel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Providers List */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
                                <p>Loading providers...</p>
                            </div>
                        </div>
                    ) : filteredProviders.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center p-8">
                                <div className="text-center">
                                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
                                    <p className="text-gray-500 mb-4">Get started by adding your first CPaaS provider.</p>
                                    <Button onClick={handleCreateProvider}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Provider
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredProviders.map((provider) => (
                            <Card key={provider.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="mt-1">
                                                {getProviderIcon(provider.provider)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                                                    <Badge variant={getStatusBadgeVariant(provider.status)}>
                                                        {getStatusIcon(provider.status)}
                                                        <span className="ml-1 capitalize">{provider.status}</span>
                                                    </Badge>
                                                    <Badge variant="outline" className="capitalize">
                                                        {provider.type}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Provider</p>
                                                        <p className="font-medium capitalize">{provider.provider}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Voice Calls</p>
                                                        <p className="font-medium">{provider.usage.voiceCalls.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Monthly Cost</p>
                                                        <p className="font-medium">{provider.pricing.currency} {provider.usage.monthlyCost.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Last Updated</p>
                                                        <p className="font-medium">{provider.updatedAt}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {provider.features.map((feature, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleTestProvider(provider.id)}
                                            >
                                                <TestTube className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditProvider(provider)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={provider.status === 'active' ? 'destructive' : 'default'}
                                                onClick={() => handleToggleStatus(provider.id)}
                                            >
                                                {provider.status === 'active' ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteProvider(provider.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Add/Edit Provider Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isEditing ? 'Edit CPaaS Provider' : 'Add New CPaaS Provider'}
                            </DialogTitle>
                            <DialogDescription>
                                Configure your communication platform service provider settings.
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                <TabsTrigger value="config">Configuration</TabsTrigger>
                                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                <TabsTrigger value="limits">Limits</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Provider Name</Label>
                                        <Input id="name" placeholder="Enter provider name" />
                                    </div>
                                    <div>
                                        <Label htmlFor="provider">Provider Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select provider" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="twilio">Twilio</SelectItem>
                                                <SelectItem value="exotel">Exotel</SelectItem>
                                                <SelectItem value="knowlarity">Knowlarity</SelectItem>
                                                <SelectItem value="msg91">MSG91</SelectItem>
                                                <SelectItem value="aws_sns">AWS SNS</SelectItem>
                                                <SelectItem value="azure_communication">Azure Communication</SelectItem>
                                                <SelectItem value="custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="type">Communication Type</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="voice">Voice Only</SelectItem>
                                                <SelectItem value="sms">SMS Only</SelectItem>
                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="multi">Multi-channel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="environment">Environment</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select environment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="production">Production</SelectItem>
                                                <SelectItem value="sandbox">Sandbox</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="config" className="space-y-4">
                                <Alert>
                                    <Lock className="h-4 w-4" />
                                    <AlertTitle>Security Notice</AlertTitle>
                                    <AlertDescription>
                                        API credentials are encrypted and stored securely. Never share your credentials.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="account-sid">Account SID / API Key</Label>
                                        <Input id="account-sid" type="password" placeholder="Enter account SID or API key" />
                                    </div>
                                    <div>
                                        <Label htmlFor="auth-token">Auth Token / API Secret</Label>
                                        <Input id="auth-token" type="password" placeholder="Enter auth token or API secret" />
                                    </div>
                                    <div>
                                        <Label htmlFor="webhook-url">Webhook URL</Label>
                                        <Input id="webhook-url" placeholder="https://your-app.com/webhook" />
                                    </div>
                                    <div>
                                        <Label htmlFor="region">Region</Label>
                                        <Input id="region" placeholder="e.g., us1, mumbai, singapore" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="pricing" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="voice-rate">Voice Rate (per minute)</Label>
                                        <Input id="voice-rate" type="number" step="0.001" placeholder="0.0085" />
                                    </div>
                                    <div>
                                        <Label htmlFor="sms-rate">SMS Rate (per message)</Label>
                                        <Input id="sms-rate" type="number" step="0.001" placeholder="0.0075" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="whatsapp-rate">WhatsApp Rate (per message)</Label>
                                        <Input id="whatsapp-rate" type="number" step="0.001" placeholder="0.0055" />
                                    </div>
                                    <div>
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="INR">INR</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="limits" className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="daily-limit">Daily Limit</Label>
                                        <Input id="daily-limit" type="number" placeholder="10000" />
                                    </div>
                                    <div>
                                        <Label htmlFor="monthly-limit">Monthly Limit</Label>
                                        <Input id="monthly-limit" type="number" placeholder="300000" />
                                    </div>
                                    <div>
                                        <Label htmlFor="rate-limit">Rate Limit (per second)</Label>
                                        <Input id="rate-limit" type="number" placeholder="100" />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsDialogOpen(false)}>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing ? 'Update Provider' : 'Create Provider'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ManagementLayout>
    );
};

export default CPaaSManagement;