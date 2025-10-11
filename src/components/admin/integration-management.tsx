'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Plus, 
  Settings, 
  Trash2, 
  Settings as EditIcon, 
  Activity as Flask,
  RefreshCw,
  Globe as WebhookIcon,
  Settings as KeyIcon,
  Database,
  Globe as CloudIcon,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Settings as LinkIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'service';
  endpoint?: string;
  isActive: boolean;
  lastSync?: Date;
  configuration: Record<string, any>;
  status: 'connected' | 'disconnected' | 'error';
  createdAt: Date;
}

interface IntegrationLog {
  id: string;
  integrationId: string;
  method: string;
  endpoint: string;
  statusCode: number;
  success: boolean;
  duration: number;
  errorMessage?: string;
  createdAt: Date;
}

interface IntegrationType {
  id: string;
  name: string;
  description: string;
  icon: any;
  fields: IntegrationField[];
}

interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'json' | 'number' | 'select';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export default function IntegrationManagement() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'webhook' as const,
    endpoint: '',
    configuration: {} as Record<string, any>
  });

  const integrationTypes: IntegrationType[] = [
    {
      id: 'gemini',
      name: 'Google Gemini AI',
      description: 'AI-powered conversation processing',
      icon: Zap,
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'AIzaSy...' },
        { key: 'model', label: 'Model', type: 'select', required: true, options: ['gemini-pro', 'gemini-pro-vision'] },
        { key: 'temperature', label: 'Temperature', type: 'number', required: false, placeholder: '0.7' }
      ]
    },
    {
      id: 'webhook',
      name: 'Generic Webhook',
      description: 'HTTP webhook for external integrations',
      icon: WebhookIcon,
      fields: [
        { key: 'url', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://api.example.com/webhook' },
        { key: 'secret', label: 'Secret Key', type: 'password', required: false, placeholder: 'Optional webhook secret' },
        { key: 'method', label: 'HTTP Method', type: 'select', required: true, options: ['POST', 'PUT', 'PATCH'] }
      ]
    },
    {
      id: 'sms',
      name: 'SMS Gateway',
      description: 'Send SMS notifications and alerts',
      icon: CloudIcon,
      fields: [
        { key: 'provider', label: 'Provider', type: 'select', required: true, options: ['twilio', 'nexmo', 'aws-sns'] },
        { key: 'accountSid', label: 'Account SID', type: 'text', required: true, placeholder: 'Account identifier' },
        { key: 'authToken', label: 'Auth Token', type: 'password', required: true, placeholder: 'Authentication token' },
        { key: 'fromNumber', label: 'From Number', type: 'text', required: true, placeholder: '+1234567890' }
      ]
    },
    {
      id: 'database',
      name: 'External Database',
      description: 'Connect to external databases',
      icon: Database,
      fields: [
        { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
        { key: 'port', label: 'Port', type: 'number', required: true, placeholder: '5432' },
        { key: 'database', label: 'Database Name', type: 'text', required: true, placeholder: 'production_db' },
        { key: 'username', label: 'Username', type: 'text', required: true, placeholder: 'db_user' },
        { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Database password' }
      ]
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          name: 'Google Gemini AI',
          type: 'api',
          endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          isActive: true,
          lastSync: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          configuration: {
            apiKey: 'AIzaSyBW5iYIIHl9x6ZYraRcWzu0TwTe-ihewo8',
            model: 'gemini-pro',
            temperature: 0.7
          },
          status: 'connected',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Call Analytics Webhook',
          type: 'webhook',
          endpoint: 'https://api.fairgo-imos.com/webhooks/call-analytics',
          isActive: true,
          lastSync: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          configuration: {
            url: 'https://api.fairgo-imos.com/webhooks/call-analytics',
            secret: 'webhook_secret_key',
            method: 'POST'
          },
          status: 'connected',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          name: 'SMS Notification Service',
          type: 'service',
          endpoint: 'https://api.twilio.com/2010-04-01/Accounts',
          isActive: false,
          configuration: {
            provider: 'twilio',
            accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            authToken: 'auth_token_hidden',
            fromNumber: '+1234567890'
          },
          status: 'disconnected',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ];

      const mockLogs: IntegrationLog[] = [
        {
          id: '1',
          integrationId: '1',
          method: 'POST',
          endpoint: '/v1beta/models/gemini-pro:generateContent',
          statusCode: 200,
          success: true,
          duration: 1250,
          createdAt: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: '2',
          integrationId: '2',
          method: 'POST',
          endpoint: '/webhooks/call-analytics',
          statusCode: 200,
          success: true,
          duration: 345,
          createdAt: new Date(Date.now() - 2 * 60 * 1000)
        },
        {
          id: '3',
          integrationId: '1',
          method: 'POST',
          endpoint: '/v1beta/models/gemini-pro:generateContent',
          statusCode: 429,
          success: false,
          duration: 180,
          errorMessage: 'Rate limit exceeded',
          createdAt: new Date(Date.now() - 15 * 60 * 1000)
        }
      ];

      setIntegrations(mockIntegrations);
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integration data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async () => {
    try {
      if (!newIntegration.name) {
        toast({
          title: 'Error',
          description: 'Integration name is required',
          variant: 'destructive'
        });
        return;
      }

      const integration: Integration = {
        id: Date.now().toString(),
        name: newIntegration.name,
        type: newIntegration.type,
        endpoint: newIntegration.endpoint,
        isActive: true,
        configuration: newIntegration.configuration,
        status: 'disconnected',
        createdAt: new Date()
      };

      setIntegrations(prev => [...prev, integration]);
      setNewIntegration({ name: '', type: 'webhook', endpoint: '', configuration: {} });
      setShowCreateDialog(false);

      toast({
        title: 'Integration Created',
        description: `Integration ${integration.name} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create integration',
        variant: 'destructive'
      });
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      setTestingIntegration(integrationId);
      
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'connected', lastSync: new Date() }
          : integration
      ));

      toast({
        title: 'Test Successful',
        description: 'Integration test completed successfully',
      });
    } catch (error) {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'error' }
          : integration
      ));

      toast({
        title: 'Test Failed',
        description: 'Integration test failed. Please check your configuration.',
        variant: 'destructive'
      });
    } finally {
      setTestingIntegration(null);
    }
  };

  const toggleIntegration = async (integrationId: string) => {
    try {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              isActive: !integration.isActive,
              status: !integration.isActive ? integration.status : 'disconnected'
            }
          : integration
      ));

      const integration = integrations.find(i => i.id === integrationId);
      toast({
        title: 'Integration Updated',
        description: `Integration ${integration?.name} has been ${integration?.isActive ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update integration',
        variant: 'destructive'
      });
    }
  };

  const deleteIntegration = async (integrationId: string) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      try {
        setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
        setLogs(prev => prev.filter(log => log.integrationId !== integrationId));
        
        toast({
          title: 'Integration Deleted',
          description: 'Integration has been deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete integration',
          variant: 'destructive'
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Integration Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage external integrations, APIs, and webhooks
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Connect a new external service or API
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="integration-name">Integration Name</Label>
                  <Input
                    id="integration-name"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Integration"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="integration-type">Type</Label>
                  <Select
                    value={newIntegration.type}
                    onValueChange={(value: any) => setNewIntegration(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="api">API Service</SelectItem>
                      <SelectItem value="service">External Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Integration Template</Label>
                <div className="grid grid-cols-1 gap-2">
                  {integrationTypes.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 text-left"
                        onClick={() => {
                          setNewIntegration(prev => ({
                            ...prev,
                            name: template.name,
                            configuration: template.fields.reduce((acc, field) => ({
                              ...acc,
                              [field.key]: ''
                            }), {})
                          }));
                        }}
                      >
                        <Icon className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">{template.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="integration-endpoint">Endpoint URL (Optional)</Label>
                <Input
                  id="integration-endpoint"
                  value={newIntegration.endpoint}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="https://api.example.com/endpoint"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createIntegration}>Create Integration</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {integrations.filter(i => i.isActive && i.status === 'connected').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {integrations.filter(i => i.status === 'error').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Logs</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Integrations</CardTitle>
            <CardDescription>Manage your external connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        <h3 className="font-semibold">{integration.name}</h3>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline">{integration.type}</Badge>
                    </div>
                    {integration.endpoint && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Endpoint:</span>
                        <span className="font-mono text-xs truncate max-w-48">
                          {integration.endpoint}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Sync:</span>
                      <span>{formatLastSync(integration.lastSync)}</span>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testIntegration(integration.id)}
                        disabled={testingIntegration === integration.id}
                      >
                        {testingIntegration === integration.id ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Flask className="h-3 w-3 mr-1" />
                        )}
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <EditIcon className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteIntegration(integration.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Integration logs and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {logs.map((log) => {
                  const integration = integrations.find(i => i.id === log.integrationId);
                  return (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium text-sm">{integration?.name}</span>
                        </div>
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.statusCode}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>{log.method} {log.endpoint}</div>
                        <div>Duration: {log.duration}ms</div>
                        {log.errorMessage && (
                          <div className="text-red-600">{log.errorMessage}</div>
                        )}
                        <div>{formatLastSync(log.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}