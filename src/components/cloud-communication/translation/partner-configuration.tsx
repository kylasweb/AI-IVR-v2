import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Settings as Edit,
  Trash2,
  Zap as TestTube,
  Save,
  X,
  Check,
  AlertTriangle,
  Globe,
  Zap,
  TrendingUp as DollarSign,
  Clock,
  Star,
  Activity,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Types
interface RDPartner {
  partnerId: string;
  name: string;
  apiEndpoint: string;
  specialization: string[];
  languages: string[];
  culturalExpertise: string[];
  qualityThreshold: number;
  maxLatency: number;
  costPerUnit: number;
  priority: number;
  enabled: boolean;
  status: 'active' | 'inactive' | 'degraded' | 'maintenance';
  performance?: {
    qualityScore: number;
    averageLatency: number;
    availability: number;
    successRate: number;
  };
  lastUsed?: string;
  configuredAt?: string;
}

interface PartnerTestResult {
  partnerId: string;
  connectionStatus: 'success' | 'failed' | 'timeout';
  responseTime: number;
  qualityScore: number;
  testTranslation: {
    input: string;
    output: string;
    culturalAdaptation: string;
  };
  timestamp: string;
}

const PartnerConfiguration: React.FC = () => {
  const [partners, setPartners] = useState<RDPartner[]>([]);
  const [editingPartner, setEditingPartner] = useState<RDPartner | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, PartnerTestResult>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const defaultPartner: Omit<RDPartner, 'partnerId'> = {
    name: '',
    apiEndpoint: '',
    specialization: [],
    languages: [],
    culturalExpertise: [],
    qualityThreshold: 0.85,
    maxLatency: 2000,
    costPerUnit: 0.02,
    priority: 5,
    enabled: true,
    status: 'inactive',
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cloud-communication/translation/partners?action=metrics');
      const result = await response.json();
      
      if (result.success) {
        setPartners(Array.isArray(result.data) ? result.data : [result.data]);
      }
    } catch (error) {
      console.error('Failed to load partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePartner = async (partner: RDPartner) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/cloud-communication/translation/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'configure',
          ...partner,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await loadPartners();
        setEditingPartner(null);
        setIsAddingNew(false);
      }
    } catch (error) {
      console.error('Failed to save partner:', error);
    } finally {
      setSaving(false);
    }
  };

  const testPartner = async (partnerId: string) => {
    try {
      setTesting(partnerId);
      
      const response = await fetch('/api/cloud-communication/translation/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          partnerId,
          testTranslation: {
            text: 'Hello, how are you?',
            expected: 'നമസ്കാരം, എങ്ങനെയുണ്ട്?',
          },
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          [partnerId]: result.data,
        }));
      }
    } catch (error) {
      console.error('Failed to test partner:', error);
    } finally {
      setTesting(null);
    }
  };

  const deletePartner = async (partnerId: string) => {
    // In production, this would call a delete API
    setPartners(prev => prev.filter(p => p.partnerId !== partnerId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const PartnerForm: React.FC<{ partner: RDPartner; onSave: (partner: RDPartner) => void; onCancel: () => void }> = ({
    partner,
    onSave,
    onCancel,
  }) => {
    const [formData, setFormData] = useState(partner);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const updateArrayField = (field: keyof RDPartner, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value.split(',').map(item => item.trim()).filter(Boolean),
      }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Partner Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="partnerId">Partner ID</Label>
            <Input
              id="partnerId"
              value={formData.partnerId}
              onChange={(e) => setFormData(prev => ({ ...prev, partnerId: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="apiEndpoint">API Endpoint</Label>
          <Input
            id="apiEndpoint"
            type="url"
            value={formData.apiEndpoint}
            onChange={(e) => setFormData(prev => ({ ...prev, apiEndpoint: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="specialization">Specialization (comma-separated)</Label>
            <Input
              id="specialization"
              value={formData.specialization.join(', ')}
              onChange={(e) => updateArrayField('specialization', e.target.value)}
              placeholder="general, business, formal"
            />
          </div>
          <div>
            <Label htmlFor="languages">Supported Languages (comma-separated)</Label>
            <Input
              id="languages"
              value={formData.languages.join(', ')}
              onChange={(e) => updateArrayField('languages', e.target.value)}
              placeholder="en, ml, hi, ta"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="culturalExpertise">Cultural Expertise (comma-separated)</Label>
          <Input
            id="culturalExpertise"
            value={formData.culturalExpertise.join(', ')}
            onChange={(e) => updateArrayField('culturalExpertise', e.target.value)}
            placeholder="indian, malayalam, business"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="qualityThreshold">Quality Threshold</Label>
            <Input
              id="qualityThreshold"
              type="number"
              min="0.1"
              max="1.0"
              step="0.01"
              value={formData.qualityThreshold}
              onChange={(e) => setFormData(prev => ({ ...prev, qualityThreshold: parseFloat(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="maxLatency">Max Latency (ms)</Label>
            <Input
              id="maxLatency"
              type="number"
              min="100"
              max="5000"
              value={formData.maxLatency}
              onChange={(e) => setFormData(prev => ({ ...prev, maxLatency: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="costPerUnit">Cost per Unit ($)</Label>
            <Input
              id="costPerUnit"
              type="number"
              min="0"
              step="0.001"
              value={formData.costPerUnit}
              onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: parseFloat(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority (1-10)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
          />
          <Label htmlFor="enabled">Enabled</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Partner'}
          </Button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">R&D Partner Configuration</h2>
          <p className="text-gray-600">Manage translation service providers and their settings</p>
        </div>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {isAddingNew && (
        <Card>
          <CardHeader>
            <CardTitle>Add New R&D Partner</CardTitle>
            <CardDescription>Configure a new translation service provider</CardDescription>
          </CardHeader>
          <CardContent>
            <PartnerForm
              partner={{ ...defaultPartner, partnerId: '' } as RDPartner}
              onSave={savePartner}
              onCancel={() => setIsAddingNew(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {partners.map((partner) => (
          <Card key={partner.partnerId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(partner.status)}`} />
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{partner.name}</span>
                      {!partner.enabled && <Badge variant="secondary">Disabled</Badge>}
                    </CardTitle>
                    <CardDescription>
                      {partner.partnerId} • {partner.specialization.join(', ')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testPartner(partner.partnerId)}
                    disabled={testing === partner.partnerId}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing === partner.partnerId ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPartner(partner)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePartner(partner.partnerId)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="configuration">Configuration</TabsTrigger>
                  {testResults[partner.partnerId] && (
                    <TabsTrigger value="test">Test Results</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-sm text-gray-600">Languages</div>
                      <div className="font-semibold">{partner.languages.join(', ')}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-sm text-gray-600">Cost per Unit</div>
                      <div className="font-semibold">${partner.costPerUnit.toFixed(3)}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="text-sm text-gray-600">Max Latency</div>
                      <div className="font-semibold">{partner.maxLatency}ms</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-sm text-gray-600">Priority</div>
                      <div className="font-semibold">{partner.priority}/10</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Cultural Expertise</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {partner.culturalExpertise.map((expertise, index) => (
                        <Badge key={index} variant="secondary">
                          {expertise}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">API Endpoint</Label>
                    <p className="text-sm text-gray-600 mt-1">{partner.apiEndpoint}</p>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  {partner.performance ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Quality Score</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress 
                            value={partner.performance.qualityScore * 100} 
                            className="flex-1"
                          />
                          <span className={`text-sm font-medium ${getPerformanceColor(partner.performance.qualityScore)}`}>
                            {(partner.performance.qualityScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Availability</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress 
                            value={partner.performance.availability * 100} 
                            className="flex-1"
                          />
                          <span className={`text-sm font-medium ${getPerformanceColor(partner.performance.availability)}`}>
                            {(partner.performance.availability * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Average Latency</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">{partner.performance.averageLatency}ms</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Success Rate</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">
                            {(partner.performance.successRate * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No performance data available. Test the partner to see metrics.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="configuration" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Quality Threshold</Label>
                      <Progress value={partner.qualityThreshold * 100} className="mt-1" />
                      <span className="text-sm text-gray-600">{(partner.qualityThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Priority Level</Label>
                      <Progress value={partner.priority * 10} className="mt-1" />
                      <span className="text-sm text-gray-600">{partner.priority}/10</span>
                    </div>
                  </div>
                  
                  {partner.lastUsed && (
                    <div>
                      <Label className="text-sm font-medium">Last Used</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(partner.lastUsed).toLocaleString()}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {testResults[partner.partnerId] && (
                  <TabsContent value="test" className="space-y-4">
                    <Alert>
                      <TestTube className="h-4 w-4" />
                      <AlertTitle>Connection Test Results</AlertTitle>
                      <AlertDescription>
                        Test completed at {new Date(testResults[partner.partnerId].timestamp).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Connection Status</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{testResults[partner.partnerId].connectionStatus}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Response Time</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{testResults[partner.partnerId].responseTime}ms</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Test Translation</Label>
                      <div className="bg-gray-50 p-4 rounded-lg mt-2 space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Input:</span>
                          <p className="text-sm">{testResults[partner.partnerId].testTranslation.input}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Output:</span>
                          <p className="text-sm">{testResults[partner.partnerId].testTranslation.output}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Cultural Adaptation:</span>
                          <p className="text-sm">{testResults[partner.partnerId].testTranslation.culturalAdaptation}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingPartner && (
        <Dialog open={!!editingPartner} onOpenChange={() => setEditingPartner(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Partner Configuration</DialogTitle>
              <DialogDescription>
                Update the configuration for {editingPartner.name}
              </DialogDescription>
            </DialogHeader>
            <PartnerForm
              partner={editingPartner}
              onSave={savePartner}
              onCancel={() => setEditingPartner(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {partners.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Configured</h3>
            <p className="text-gray-600 mb-4">Add your first R&D partner to start using translation services</p>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartnerConfiguration;