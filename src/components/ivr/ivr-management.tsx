'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Phone,
    PhoneCall,
    Settings,
    Play,
    X as Pause,
    Settings as Edit,
    Trash2,
    Plus,
    Copy,
    Download,
    Upload,
    Globe,
    BarChart3,
    Clock,
    Users,
    Mic,
    MessageSquare,
    GitBranch as Workflow,
    Activity as TestTube,
    CheckCircle,
    AlertCircle,
    XCircle,
    Activity,
    TrendingUp,
    RefreshCw,
    Eye,
    Bot
} from 'lucide-react'; interface IVRConfig {
    id: string;
    name: string;
    description: string;
    flow_type: string;
    language: string;
    dialect?: string;
    status: string;
    is_active: boolean;
    is_default: boolean;
    is_template: boolean;
    cultural_enabled: boolean;
    malayalam_priority?: boolean;
    created_at: string;
    updated_at: string;
    workflow?: {
        id: string;
        name: string;
        node_count: number;
    };
    usage_stats?: {
        total_calls: number;
        success_rate: number;
        avg_duration: number;
    };
}

interface IVRTemplate {
    id: string;
    name: string;
    description: string;
    flow_type: string;
    language: string;
    cultural_features: string[];
}

export default function IVRManagement() {
    const [configs, setConfigs] = useState<IVRConfig[]>([]);
    const [templates, setTemplates] = useState<IVRTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConfig, setSelectedConfig] = useState<IVRConfig | null>(null);
    const [activeTab, setActiveTab] = useState('configurations');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingConfig, setEditingConfig] = useState<IVRConfig | null>(null);

    // Form state for creating/editing configurations
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        flow_type: 'customer_service',
        language: 'ml',
        dialect: 'central_kerala',
        is_active: true,
        cultural_settings: {},
        flow_data: { nodes: [], connections: [] }
    });

    useEffect(() => {
        loadConfigurations();
        loadTemplates();
    }, []);

    const loadConfigurations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ivr/configurations');
            if (response.ok) {
                const data = await response.json();
                setConfigs(data.configs || []);
            }
        } catch (error) {
            console.error('Error loading IVR configurations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTemplates = async () => {
        try {
            const response = await fetch('/api/ivr/configurations?action=templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates || []);
            }
        } catch (error) {
            console.error('Error loading IVR templates:', error);
        }
    };

    const createConfiguration = async () => {
        try {
            const response = await fetch('/api/ivr/configurations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                await loadConfigurations();
                setShowCreateForm(false);
                resetForm();
                console.log('Configuration created successfully:', result);
            }
        } catch (error) {
            console.error('Error creating configuration:', error);
        }
    };

    const updateConfiguration = async (configId: string) => {
        try {
            const response = await fetch(`/api/ivr/configurations?config_id=${configId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await loadConfigurations();
                setEditingConfig(null);
                resetForm();
            }
        } catch (error) {
            console.error('Error updating configuration:', error);
        }
    };

    const deleteConfiguration = async (configId: string) => {
        if (!confirm('Are you sure you want to delete this IVR configuration?')) {
            return;
        }

        try {
            const response = await fetch(`/api/ivr/configurations?config_id=${configId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await loadConfigurations();
            }
        } catch (error) {
            console.error('Error deleting configuration:', error);
        }
    };

    const toggleConfigurationStatus = async (config: IVRConfig) => {
        try {
            const response = await fetch(`/api/ivr/configurations?config_id=${config.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !config.is_active })
            });

            if (response.ok) {
                await loadConfigurations();
            }
        } catch (error) {
            console.error('Error toggling configuration status:', error);
        }
    };

    const createFromTemplate = async (templateId: string) => {
        try {
            const response = await fetch('/api/ivr/configurations?action=template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: templateId,
                    name: `New Config from ${templates.find(t => t.id === templateId)?.name}`,
                    customizations: {}
                })
            });

            if (response.ok) {
                await loadConfigurations();
            }
        } catch (error) {
            console.error('Error creating from template:', error);
        }
    };

    const testConfiguration = async (configId: string) => {
        try {
            const response = await fetch('/api/ivr/configurations?action=test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config_id: configId })
            });

            if (response.ok) {
                const results = await response.json();
                console.log('Test results:', results);
                // You can show test results in a modal or alert
                alert(`Test completed. ${results.test_results.results.passed} passed, ${results.test_results.results.failed} failed.`);
            }
        } catch (error) {
            console.error('Error testing configuration:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            flow_type: 'customer_service',
            language: 'ml',
            dialect: 'central_kerala',
            is_active: true,
            cultural_settings: {},
            flow_data: { nodes: [], connections: [] }
        });
    };

    const startEditing = (config: IVRConfig) => {
        setEditingConfig(config);
        setFormData({
            name: config.name,
            description: config.description,
            flow_type: config.flow_type,
            language: config.language,
            dialect: config.dialect || 'central_kerala',
            is_active: config.is_active,
            cultural_settings: {},
            flow_data: { nodes: [], connections: [] }
        });
        setShowCreateForm(true);
    };

    const renderConfigurationsList = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">IVR Configurations</h3>
                <div className="flex gap-2">
                    <Button onClick={() => loadConfigurations()} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Configuration
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="border rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-4"></div>
                            <div className="flex gap-2">
                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {configs.map((config) => (
                        <Card key={config.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{config.name}</CardTitle>
                                    <div className="flex gap-1">
                                        <Badge variant={config.is_active ? "default" : "secondary"}>
                                            {config.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        {config.cultural_enabled && (
                                            <Badge variant="outline" className="text-xs">
                                                Cultural
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <CardDescription className="text-xs">
                                    {config.description || 'No description'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium">Type:</span>
                                        <p className="text-gray-600 capitalize">{config.flow_type.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Language:</span>
                                        <p className="text-gray-600 uppercase">{config.language}</p>
                                    </div>
                                    {config.usage_stats && (
                                        <div className="col-span-2">
                                            <span className="font-medium">Usage:</span>
                                            <p className="text-gray-600">
                                                {config.usage_stats.total_calls} calls, {config.usage_stats.success_rate}% success
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                        onClick={() => toggleConfigurationStatus(config)}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        {config.is_active ? (
                                            <Pause className="h-4 w-4 mr-1" />
                                        ) : (
                                            <Play className="h-4 w-4 mr-1" />
                                        )}
                                        {config.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        onClick={() => startEditing(config)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => testConfiguration(config.id)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <TestTube className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => deleteConfiguration(config.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const renderTemplatesList = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">IVR Templates</h3>
                <p className="text-sm text-gray-600">Ready-to-use IVR flow templates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-xs">
                                {template.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div>
                                    <Badge variant="outline" className="text-xs mr-2">
                                        {template.flow_type.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {template.language.toUpperCase()}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-sm font-medium">Features:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {template.cultural_features.slice(0, 3).map((feature, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {feature}
                                            </Badge>
                                        ))}
                                        {template.cultural_features.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{template.cultural_features.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => createFromTemplate(template.id)}
                                className="w-full"
                                size="sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Use Template
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderCreateForm = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    {editingConfig ? 'Edit Configuration' : 'Create New IVR Configuration'}
                </h3>
                <Button
                    onClick={() => {
                        setShowCreateForm(false);
                        setEditingConfig(null);
                        resetForm();
                    }}
                    variant="outline"
                >
                    Cancel
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Configuration Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Customer Service IVR"
                            />
                        </div>
                        <div>
                            <Label htmlFor="flow_type">Flow Type</Label>
                            <Select value={formData.flow_type} onValueChange={(value) => setFormData({ ...formData, flow_type: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer_service">Customer Service</SelectItem>
                                    <SelectItem value="sales">Sales</SelectItem>
                                    <SelectItem value="support">Support</SelectItem>
                                    <SelectItem value="survey">Survey</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the purpose of this IVR configuration..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="language">Language</Label>
                            <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ml">Malayalam</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                    <SelectItem value="ta">Tamil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="dialect">Dialect</Label>
                            <Select value={formData.dialect} onValueChange={(value) => setFormData({ ...formData, dialect: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="central_kerala">Central Kerala</SelectItem>
                                    <SelectItem value="northern_kerala">Northern Kerala</SelectItem>
                                    <SelectItem value="southern_kerala">Southern Kerala</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label htmlFor="is_active">Activate immediately after creation</Label>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            onClick={() => editingConfig ? updateConfiguration(editingConfig.id) : createConfiguration()}
                            className="flex-1"
                        >
                            {editingConfig ? 'Update Configuration' : 'Create Configuration'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Open workflow builder with this configuration
                                window.open(`/workflows?config=${formData.name}`, '_blank');
                            }}
                        >
                            <Workflow className="h-4 w-4 mr-2" />
                            Design Flow
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">IVR Analytics & Performance</h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Phone className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{configs.length}</p>
                                <p className="text-sm text-gray-600">Total Configs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{configs.filter(c => c.is_active).length}</p>
                                <p className="text-sm text-gray-600">Active Configs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Globe className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{configs.filter(c => c.cultural_enabled).length}</p>
                                <p className="text-sm text-gray-600">Cultural Enabled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">94%</p>
                                <p className="text-sm text-gray-600">Avg Success Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuration Performance</CardTitle>
                    <CardDescription>Performance metrics for each IVR configuration</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {configs.map((config) => (
                            <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${config.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <div>
                                        <p className="font-medium">{config.name}</p>
                                        <p className="text-sm text-gray-600">{config.flow_type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <p className="font-medium">{config.usage_stats?.total_calls || 0}</p>
                                        <p className="text-gray-600">Calls</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">{config.usage_stats?.success_rate || 0}%</p>
                                        <p className="text-gray-600">Success</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">{config.usage_stats?.avg_duration || 0}s</p>
                                        <p className="text-gray-600">Avg Duration</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Phone className="h-8 w-8 text-blue-600" />
                        IVR Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage Interactive Voice Response configurations and workflows
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.open('/workflows', '_blank')}>
                        <Workflow className="h-4 w-4 mr-2" />
                        Workflow Builder
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/analytics', '_blank')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            {showCreateForm ? (
                renderCreateForm()
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="configurations">Configurations</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="configurations" className="space-y-6">
                        {renderConfigurationsList()}
                    </TabsContent>

                    <TabsContent value="templates" className="space-y-6">
                        {renderTemplatesList()}
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        {renderAnalytics()}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}