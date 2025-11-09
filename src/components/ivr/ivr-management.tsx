'use client';

import React, { useState, useEffect } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
} from 'lucide-react';

interface IVRConfig {
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
        flow_data: { nodes: [], connections: [] },
        // Advanced Configuration Settings
        advanced_settings: {
            max_call_duration: 1800, // 30 minutes
            call_timeout: 30,
            retry_attempts: 3,
            silence_detection: true,
            dtmf_timeout: 5,
            speech_recognition: true,
            voice_biometrics: false,
            call_recording: true,
            sentiment_analysis: true,
            real_time_analytics: true,
            ai_powered_routing: true,
            cultural_adaptation: true,
            multilingual_support: false,
            background_music: true,
            hold_music_url: '',
            escalation_rules: {
                max_transfers: 3,
                escalation_timeout: 300,
                priority_routing: false
            },
            security_settings: {
                pci_compliance: false,
                data_encryption: true,
                audit_logging: true,
                access_control: 'standard'
            },
            integration_settings: {
                crm_integration: false,
                crm_provider: '',
                webhook_url: '',
                api_key: '',
                callback_urls: []
            },
            ai_configuration: {
                llm_provider: 'openai',
                model_version: 'gpt-4',
                temperature: 0.7,
                max_tokens: 2000,
                cultural_context: true,
                learning_enabled: true,
                personalization: true
            },
            voice_settings: {
                voice_provider: 'azure',
                voice_model: 'neural',
                voice_speed: 1.0,
                voice_pitch: 0.0,
                voice_volume: 1.0,
                ssml_support: true
            },
            analytics_config: {
                real_time_dashboard: true,
                performance_monitoring: true,
                cost_tracking: true,
                usage_alerts: true,
                custom_metrics: []
            }
        }
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
            flow_data: { nodes: [], connections: [] },
            // Reset advanced settings to defaults
            advanced_settings: {
                max_call_duration: 1800,
                call_timeout: 30,
                retry_attempts: 3,
                silence_detection: true,
                dtmf_timeout: 5,
                speech_recognition: true,
                voice_biometrics: false,
                call_recording: true,
                sentiment_analysis: true,
                real_time_analytics: true,
                ai_powered_routing: true,
                cultural_adaptation: true,
                multilingual_support: false,
                background_music: true,
                hold_music_url: '',
                escalation_rules: {
                    max_transfers: 3,
                    escalation_timeout: 300,
                    priority_routing: false
                },
                security_settings: {
                    pci_compliance: false,
                    data_encryption: true,
                    audit_logging: true,
                    access_control: 'standard'
                },
                integration_settings: {
                    crm_integration: false,
                    crm_provider: '',
                    webhook_url: '',
                    api_key: '',
                    callback_urls: []
                },
                ai_configuration: {
                    llm_provider: 'openai',
                    model_version: 'gpt-4',
                    temperature: 0.7,
                    max_tokens: 2000,
                    cultural_context: true,
                    learning_enabled: true,
                    personalization: true
                },
                voice_settings: {
                    voice_provider: 'azure',
                    voice_model: 'neural',
                    voice_speed: 1.0,
                    voice_pitch: 0.0,
                    voice_volume: 1.0,
                    ssml_support: true
                },
                analytics_config: {
                    real_time_dashboard: true,
                    performance_monitoring: true,
                    cost_tracking: true,
                    usage_alerts: true,
                    custom_metrics: []
                }
            }
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
            flow_data: { nodes: [], connections: [] },
            // Load or default advanced settings
            advanced_settings: {
                max_call_duration: 1800,
                call_timeout: 30,
                retry_attempts: 3,
                silence_detection: true,
                dtmf_timeout: 5,
                speech_recognition: true,
                voice_biometrics: false,
                call_recording: true,
                sentiment_analysis: true,
                real_time_analytics: true,
                ai_powered_routing: true,
                cultural_adaptation: true,
                multilingual_support: false,
                background_music: true,
                hold_music_url: '',
                escalation_rules: {
                    max_transfers: 3,
                    escalation_timeout: 300,
                    priority_routing: false
                },
                security_settings: {
                    pci_compliance: false,
                    data_encryption: true,
                    audit_logging: true,
                    access_control: 'standard'
                },
                integration_settings: {
                    crm_integration: false,
                    crm_provider: '',
                    webhook_url: '',
                    api_key: '',
                    callback_urls: []
                },
                ai_configuration: {
                    llm_provider: 'openai',
                    model_version: 'gpt-4',
                    temperature: 0.7,
                    max_tokens: 2000,
                    cultural_context: true,
                    learning_enabled: true,
                    personalization: true
                },
                voice_settings: {
                    voice_provider: 'azure',
                    voice_model: 'neural',
                    voice_speed: 1.0,
                    voice_pitch: 0.0,
                    voice_volume: 1.0,
                    ssml_support: true
                },
                analytics_config: {
                    real_time_dashboard: true,
                    performance_monitoring: true,
                    cost_tracking: true,
                    usage_alerts: true,
                    custom_metrics: []
                }
            }
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <Card key={index} className="animate-pulse border-gray-200">
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="flex gap-2 mt-4">
                                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configs.map((config) => (
                        <Card key={config.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300 bg-white">
                            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg font-semibold text-gray-900 truncate">{config.name}</CardTitle>
                                        <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {config.description || 'No description provided'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col gap-1 ml-3">
                                        <Badge variant={config.is_active ? "default" : "secondary"} className="text-xs">
                                            {config.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        {config.cultural_enabled && (
                                            <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                                                Cultural AI
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 pb-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</span>
                                        <p className="text-gray-900 font-medium capitalize">{config.flow_type.replace('_', ' ')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Language</span>
                                        <div className="flex items-center gap-1">
                                            <p className="text-gray-900 font-medium uppercase">{config.language}</p>
                                            {config.language === 'ml' && <Globe className="h-3 w-3 text-green-600" />}
                                        </div>
                                    </div>
                                </div>

                                {config.usage_stats && (
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Statistics</span>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <p className="text-lg font-bold text-blue-600">{config.usage_stats.total_calls}</p>
                                                <p className="text-xs text-gray-600">Calls</p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-green-600">{config.usage_stats.success_rate}%</p>
                                                <p className="text-xs text-gray-600">Success</p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-purple-600">{config.usage_stats.avg_duration}s</p>
                                                <p className="text-xs text-gray-600">Avg Duration</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <Button
                                        onClick={() => toggleConfigurationStatus(config)}
                                        variant="outline"
                                        size="sm"
                                        className={`flex-1 ${config.is_active
                                            ? 'border-red-300 text-red-700 hover:bg-red-50'
                                            : 'border-green-300 text-green-700 hover:bg-green-50'
                                            }`}
                                    >
                                        {config.is_active ? (
                                            <Pause className="h-3 w-3 mr-1" />
                                        ) : (
                                            <Play className="h-3 w-3 mr-1" />
                                        )}
                                        {config.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        onClick={() => startEditing(config)}
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        onClick={() => testConfiguration(config.id)}
                                        variant="outline"
                                        size="sm"
                                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                    >
                                        <TestTube className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        onClick={() => deleteConfiguration(config.id)}
                                        variant="outline"
                                        size="sm"
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-3 w-3" />
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">IVR Templates</h3>
                    <p className="text-sm text-gray-600 mt-1">Ready-to-use IVR flow templates with cultural intelligence</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    {templates.length} Templates Available
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300 bg-white">
                        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                            <div className="space-y-2">
                                <CardTitle className="text-lg font-semibold text-gray-900">{template.name}</CardTitle>
                                <CardDescription className="text-sm text-gray-600 line-clamp-2">
                                    {template.description}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-medium bg-gray-100 text-gray-800">
                                        {template.flow_type.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-800">
                                        {template.language.toUpperCase()}
                                    </Badge>
                                </div>

                                <div>
                                    <span className="text-sm font-medium text-gray-700">Cultural Features:</span>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {template.cultural_features.slice(0, 3).map((feature, index) => (
                                            <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                {feature}
                                            </Badge>
                                        ))}
                                        {template.cultural_features.length > 3 && (
                                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                                                +{template.cultural_features.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => createFromTemplate(template.id)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300"
                                size="lg"
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        {editingConfig ? 'Edit Configuration' : 'Create New IVR Configuration'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {editingConfig ? 'Modify the configuration settings below' : 'Configure your new IVR flow with Malayalam cultural intelligence'}
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setShowCreateForm(false);
                        setEditingConfig(null);
                        resetForm();
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <XCircle className="h-4 w-4" />
                    Cancel
                </Button>
            </div>

            <Card className="border-2 border-gray-100 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        Advanced IVR Configuration
                    </CardTitle>
                    <CardDescription>
                        Comprehensive configuration with AI-powered features and cultural intelligence
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            <TabsTrigger value="ai">AI & NLP</TabsTrigger>
                            <TabsTrigger value="voice">Voice</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="integrations">Integrations</TabsTrigger>
                        </TabsList>

                        {/* Basic Configuration Tab */}
                        <TabsContent value="basic" className="space-y-6 mt-6">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            Configuration Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Customer Service IVR"
                                            className="w-full focus:ring-2 focus:ring-blue-500 border-gray-300"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="flow_type" className="text-sm font-medium text-gray-700">
                                            Flow Type *
                                        </Label>
                                        <Select value={formData.flow_type} onValueChange={(value) => setFormData({ ...formData, flow_type: value })}>
                                            <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 border-gray-300">
                                                <SelectValue placeholder="Select flow type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="customer_service">Customer Service</SelectItem>
                                                <SelectItem value="sales">Sales & Lead Generation</SelectItem>
                                                <SelectItem value="support">Technical Support</SelectItem>
                                                <SelectItem value="survey">Survey & Feedback</SelectItem>
                                                <SelectItem value="appointment">Appointment Booking</SelectItem>
                                                <SelectItem value="payment">Payment Processing</SelectItem>
                                                <SelectItem value="emergency">Emergency Response</SelectItem>
                                                <SelectItem value="custom">Custom Workflow</SelectItem>
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
                                        placeholder="Describe the purpose of this IVR configuration..."
                                        rows={3}
                                        className="w-full focus:ring-2 focus:ring-blue-500 border-gray-300 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Language & Cultural Settings */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Language & Cultural Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                                            Primary Language *
                                        </Label>
                                        <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                                            <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 border-gray-300">
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ml">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-green-600" />
                                                        Malayalam
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="hi">Hindi</SelectItem>
                                                <SelectItem value="ta">Tamil</SelectItem>
                                                <SelectItem value="te">Telugu</SelectItem>
                                                <SelectItem value="kn">Kannada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dialect" className="text-sm font-medium text-gray-700">
                                            Dialect (Malayalam only)
                                        </Label>
                                        <Select
                                            value={formData.dialect}
                                            onValueChange={(value) => setFormData({ ...formData, dialect: value })}
                                            disabled={formData.language !== 'ml'}
                                        >
                                            <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 border-gray-300">
                                                <SelectValue placeholder="Select dialect" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="central_kerala">Central Kerala</SelectItem>
                                                <SelectItem value="northern_kerala">Northern Kerala (Malabar)</SelectItem>
                                                <SelectItem value="southern_kerala">Southern Kerala (Travancore)</SelectItem>
                                                <SelectItem value="kochi_urban">Kochi Urban</SelectItem>
                                                <SelectItem value="rural_kerala">Rural Kerala</SelectItem>
                                                <SelectItem value="standard">Standard Malayalam</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Multilingual Support */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <Switch
                                                    id="multilingual_support"
                                                    checked={formData.advanced_settings.multilingual_support}
                                                    onCheckedChange={(checked) => setFormData({
                                                        ...formData,
                                                        advanced_settings: {
                                                            ...formData.advanced_settings,
                                                            multilingual_support: checked
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="multilingual_support" className="text-sm font-medium text-gray-800 cursor-pointer">
                                                    Enable Multilingual Support
                                                </Label>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Allow callers to switch between languages during the call
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {formData.language === 'ml' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">Cultural Intelligence Enabled</p>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    This configuration will include Malayalam cultural markers, respectful greetings,
                                                    and context-aware responses suitable for Kerala's business environment.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Activation Settings */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Activation Settings</h4>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <Switch
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="is_active" className="text-sm font-medium text-gray-800 cursor-pointer">
                                                Activate immediately after creation
                                            </Label>
                                            <p className="text-xs text-gray-600 mt-1">
                                                When enabled, this configuration will be available for use immediately after creation
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={formData.is_active ? "default" : "secondary"} className="ml-2">
                                        {formData.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Advanced Configuration Tab */}
                        <TabsContent value="advanced" className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Call Management</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Maximum Call Duration (seconds)</Label>
                                        <Slider
                                            value={[formData.advanced_settings.max_call_duration]}
                                            onValueChange={([value]) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    max_call_duration: value
                                                }
                                            })}
                                            max={3600}
                                            min={60}
                                            step={30}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500">{formData.advanced_settings.max_call_duration} seconds ({Math.floor(formData.advanced_settings.max_call_duration / 60)} minutes)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Call Timeout (seconds)</Label>
                                        <Slider
                                            value={[formData.advanced_settings.call_timeout]}
                                            onValueChange={([value]) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    call_timeout: value
                                                }
                                            })}
                                            max={120}
                                            min={10}
                                            step={5}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500">{formData.advanced_settings.call_timeout} seconds</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Advanced Features</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label className="text-sm font-medium">Call Recording</Label>
                                            <p className="text-xs text-gray-600">Record calls for quality assurance</p>
                                        </div>
                                        <Switch
                                            checked={formData.advanced_settings.call_recording}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    call_recording: checked
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label className="text-sm font-medium">Real-time Analytics</Label>
                                            <p className="text-xs text-gray-600">Live performance monitoring</p>
                                        </div>
                                        <Switch
                                            checked={formData.advanced_settings.real_time_analytics}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    real_time_analytics: checked
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* AI & NLP Tab */}
                        <TabsContent value="ai" className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">AI Configuration</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>LLM Provider</Label>
                                        <Select
                                            value={formData.advanced_settings.ai_configuration.llm_provider}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    ai_configuration: {
                                                        ...formData.advanced_settings.ai_configuration,
                                                        llm_provider: value
                                                    }
                                                }
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="openai">OpenAI</SelectItem>
                                                <SelectItem value="azure">Azure OpenAI</SelectItem>
                                                <SelectItem value="anthropic">Anthropic</SelectItem>
                                                <SelectItem value="google">Google Gemini</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Model Version</Label>
                                        <Select
                                            value={formData.advanced_settings.ai_configuration.model_version}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    ai_configuration: {
                                                        ...formData.advanced_settings.ai_configuration,
                                                        model_version: value
                                                    }
                                                }
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Temperature</Label>
                                        <Slider
                                            value={[formData.advanced_settings.ai_configuration.temperature]}
                                            onValueChange={([value]) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    ai_configuration: {
                                                        ...formData.advanced_settings.ai_configuration,
                                                        temperature: value
                                                    }
                                                }
                                            })}
                                            max={2}
                                            min={0}
                                            step={0.1}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500">{formData.advanced_settings.ai_configuration.temperature}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Intelligence Features</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label className="text-sm font-medium">Speech Recognition</Label>
                                            <p className="text-xs text-gray-600">Convert speech to text</p>
                                        </div>
                                        <Switch
                                            checked={formData.advanced_settings.speech_recognition}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    speech_recognition: checked
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label className="text-sm font-medium">Sentiment Analysis</Label>
                                            <p className="text-xs text-gray-600">Analyze caller emotions</p>
                                        </div>
                                        <Switch
                                            checked={formData.advanced_settings.sentiment_analysis}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    sentiment_analysis: checked
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Voice Settings Tab */}
                        <TabsContent value="voice" className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Voice Configuration</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Voice Provider</Label>
                                        <Select
                                            value={formData.advanced_settings.voice_settings.voice_provider}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    voice_settings: {
                                                        ...formData.advanced_settings.voice_settings,
                                                        voice_provider: value
                                                    }
                                                }
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="azure">Azure Cognitive Services</SelectItem>
                                                <SelectItem value="google">Google Cloud TTS</SelectItem>
                                                <SelectItem value="amazon">Amazon Polly</SelectItem>
                                                <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Voice Model</Label>
                                        <Select
                                            value={formData.advanced_settings.voice_settings.voice_model}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    voice_settings: {
                                                        ...formData.advanced_settings.voice_settings,
                                                        voice_model: value
                                                    }
                                                }
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="neural">Neural Voice</SelectItem>
                                                <SelectItem value="standard">Standard Voice</SelectItem>
                                                <SelectItem value="premium">Premium Voice</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Security & Compliance</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label className="text-sm font-medium">Data Encryption</Label>
                                            <p className="text-xs text-gray-600">Encrypt call data and recordings</p>
                                        </div>
                                        <Switch
                                            checked={formData.advanced_settings.security_settings.data_encryption}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    security_settings: {
                                                        ...formData.advanced_settings.security_settings,
                                                        data_encryption: checked
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label className="text-sm font-medium">Audit Logging</Label>
                                            <p className="text-xs text-gray-600">Comprehensive activity logs</p>
                                        </div>
                                        <Switch
                                            checked={formData.advanced_settings.security_settings.audit_logging}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                advanced_settings: {
                                                    ...formData.advanced_settings,
                                                    security_settings: {
                                                        ...formData.advanced_settings.security_settings,
                                                        audit_logging: checked
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Integrations Tab */}
                        <TabsContent value="integrations" className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-800 border-b pb-2">CRM Integration</h4>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <Label className="text-sm font-medium">Enable CRM Integration</Label>
                                        <p className="text-xs text-gray-600">Connect with customer management systems</p>
                                    </div>
                                    <Switch
                                        checked={formData.advanced_settings.integration_settings.crm_integration}
                                        onCheckedChange={(checked) => setFormData({
                                            ...formData,
                                            advanced_settings: {
                                                ...formData.advanced_settings,
                                                integration_settings: {
                                                    ...formData.advanced_settings.integration_settings,
                                                    crm_integration: checked
                                                }
                                            }
                                        })}
                                    />
                                </div>

                                {formData.advanced_settings.integration_settings.crm_integration && (
                                    <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                                        <div className="space-y-2">
                                            <Label>CRM Provider</Label>
                                            <Select
                                                value={formData.advanced_settings.integration_settings.crm_provider}
                                                onValueChange={(value) => setFormData({
                                                    ...formData,
                                                    advanced_settings: {
                                                        ...formData.advanced_settings,
                                                        integration_settings: {
                                                            ...formData.advanced_settings.integration_settings,
                                                            crm_provider: value
                                                        }
                                                    }
                                                })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select CRM provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="salesforce">Salesforce</SelectItem>
                                                    <SelectItem value="hubspot">HubSpot</SelectItem>
                                                    <SelectItem value="zoho">Zoho CRM</SelectItem>
                                                    <SelectItem value="custom">Custom Integration</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Webhook URL</Label>
                                            <Input
                                                value={formData.advanced_settings.integration_settings.webhook_url}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    advanced_settings: {
                                                        ...formData.advanced_settings,
                                                        integration_settings: {
                                                            ...formData.advanced_settings.integration_settings,
                                                            webhook_url: e.target.value
                                                        }
                                                    }
                                                })}
                                                placeholder="https://your-crm.com/webhook"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <Button
                            onClick={() => editingConfig ? updateConfiguration(editingConfig.id) : createConfiguration()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            size="lg"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {editingConfig ? 'Update Configuration' : 'Create Configuration'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Open workflow builder with this configuration
                                window.open(`/workflows?config=${encodeURIComponent(formData.name)}`, '_blank');
                            }}
                            className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50"
                            size="lg"
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
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">IVR Analytics & Performance</h3>
                    <p className="text-sm text-gray-600 mt-1">Real-time insights and performance metrics</p>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-blue-900">{configs.length}</p>
                                <p className="text-sm font-medium text-blue-700">Total Configurations</p>
                                <p className="text-xs text-blue-600 mt-1">All IVR configs</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-full">
                                <Phone className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-green-900">{configs.filter(c => c.is_active).length}</p>
                                <p className="text-sm font-medium text-green-700">Active Configurations</p>
                                <p className="text-xs text-green-600 mt-1">Currently running</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-purple-900">{configs.filter(c => c.cultural_enabled).length}</p>
                                <p className="text-sm font-medium text-purple-700">Cultural AI Enabled</p>
                                <p className="text-xs text-purple-600 mt-1">Malayalam intelligence</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-full">
                                <Globe className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-orange-900">94%</p>
                                <p className="text-sm font-medium text-orange-700">Average Success Rate</p>
                                <p className="text-xs text-orange-600 mt-1">Last 30 days</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-full">
                                <TrendingUp className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <Card className="border-2 border-gray-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Configuration Performance Dashboard
                    </CardTitle>
                    <CardDescription>
                        Detailed performance metrics and usage statistics for each IVR configuration
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {configs.length === 0 ? (
                            <div className="text-center py-12">
                                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Configurations Yet</h3>
                                <p className="text-gray-600 mb-4">Create your first IVR configuration to see analytics here</p>
                                <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Configuration
                                </Button>
                            </div>
                        ) : (
                            configs.map((config, index) => (
                                <div key={config.id} className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all duration-200 hover:border-blue-300 ${config.is_active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${config.is_active ? 'bg-green-500' : 'bg-gray-400'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${config.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-gray-900 truncate">{config.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {config.flow_type.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-xs text-gray-500">•</span>
                                                <span className="text-xs text-gray-600">{config.language.toUpperCase()}</span>
                                                {config.cultural_enabled && (
                                                    <>
                                                        <span className="text-xs text-gray-500">•</span>
                                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                                            Cultural AI
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 text-sm">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-blue-600">{config.usage_stats?.total_calls || 0}</p>
                                            <p className="text-xs text-gray-600">Total Calls</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-green-600">{config.usage_stats?.success_rate || 0}%</p>
                                            <p className="text-xs text-gray-600">Success Rate</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-purple-600">{config.usage_stats?.avg_duration || 0}s</p>
                                            <p className="text-xs text-gray-600">Avg Duration</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => startEditing(config)}
                                                className="h-8 w-8 p-0 border-blue-300 text-blue-700 hover:bg-blue-50"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => testConfiguration(config.id)}
                                                className="h-8 w-8 p-0 border-purple-300 text-purple-700 hover:bg-purple-50"
                                            >
                                                <TestTube className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ManagementLayout
            title="IVR Management"
            subtitle="Manage Interactive Voice Response configurations and intelligent workflows"
        >
            <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => window.open('/workflows', '_blank')}
                        className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        <Workflow className="h-4 w-4 mr-2" />
                        Workflow Builder
                    </Button>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Configuration
                    </Button>
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
        </ManagementLayout>
    );
}