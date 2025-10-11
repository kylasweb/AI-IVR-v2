import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PhoneCall, 
  Play, 
  XCircle as Pause,
  RotateCcw,
  Settings,
  Clock as Calendar,
  MessageSquare,
  Target,
  Users,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings as Edit,
  Trash2,
  Download,
  Upload,
  BarChart3,
  Activity
} from 'lucide-react';

interface AMDCampaign {
  campaignId: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetAudience: string;
  culturalMode: 'malayalam_formal' | 'malayalam_casual' | 'english_formal' | 'english_casual' | 'mixed';
  messageStrategy: 'personalized' | 'standard' | 'callback_only';
  createdAt: string;
  updatedAt: string;
  statistics: {
    totalCalls: number;
    amdDetections: number;
    humanAnswers: number;
    messagesLeft: number;
    callbacksScheduled: number;
    completionRate: number;
  };
  settings: AMDCampaignSettings;
}

interface AMDCampaignSettings {
  maxDetectionTime: number;
  confidenceThreshold: number;
  culturalAdaptation: boolean;
  personalizedMessages: boolean;
  callbackEnabled: boolean;
  callbackWindowHours: number;
  respectCulturalTiming: boolean;
  languagePreference: 'auto' | 'malayalam' | 'english';
  formalityLevel: 'high' | 'moderate' | 'adaptive';
  messageTemplates: {
    malayalam_formal: string;
    malayalam_casual: string;
    english_formal: string;
    english_casual: string;
  };
  callbackPreferences: {
    morningWindow: string;
    eveningWindow: string;
    avoidMealTimes: boolean;
    respectPrayerTimes: boolean;
  };
}

interface CallbackSchedule {
  callId: string;
  originalCallTime: string;
  scheduledCallbackTime: string;
  customerPhone: string;
  culturalMode: string;
  priority: 'high' | 'medium' | 'low';
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
}

const AMDCampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AMDCampaign[]>([]);
  const [callbackSchedules, setCallbackSchedules] = useState<CallbackSchedule[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<AMDCampaign | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    targetAudience: '',
    culturalMode: 'malayalam_formal' as const,
    messageStrategy: 'personalized' as const,
  });

  // Settings state
  const [settings, setSettings] = useState({
    culturalAdaptation: true,
    personalizedMessages: true,
    enableCallbacks: true,
    respectCulturalTiming: true,
    maxDetectionTime: 5,
    confidenceThreshold: 0.85
  });

  useEffect(() => {
    fetchCampaigns();
    fetchCallbackSchedules();
    const interval = setInterval(() => {
      fetchCampaigns();
      fetchCallbackSchedules();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cloud-communication/amd/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setCampaigns(data.data || []);

    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchCallbackSchedules = async () => {
    try {
      const response = await fetch('/api/cloud-communication/amd/callbacks');
      if (!response.ok) throw new Error('Failed to fetch callback schedules');
      
      const data = await response.json();
      setCallbackSchedules(data.data || []);

    } catch (error) {
      console.error('Error fetching callback schedules:', error);
    }
  };

  const createCampaign = async () => {
    try {
      const response = await fetch('/api/cloud-communication/amd/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaign.name,
          description: newCampaign.description,
          targetAudience: newCampaign.targetAudience,
          culturalMode: newCampaign.culturalMode,
          messageStrategy: newCampaign.messageStrategy,
        }),
      });

      if (!response.ok) throw new Error('Failed to create campaign');

      await fetchCampaigns();
      setShowCreateDialog(false);
      setNewCampaign({
        name: '',
        description: '',
        targetAudience: '',
        culturalMode: 'malayalam_formal',
        messageStrategy: 'personalized',
      });

    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(error instanceof Error ? error.message : 'Failed to create campaign');
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const response = await fetch(`/api/cloud-communication/amd/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update campaign status');

      await fetchCampaigns();

    } catch (error) {
      console.error('Error updating campaign status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update campaign');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'active': return <Activity className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'draft': return <Edit className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatCulturalMode = (mode: string): string => {
    return mode.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateAMDRate = (stats: AMDCampaign['statistics']): number => {
    if (stats.totalCalls === 0) return 0;
    return (stats.amdDetections / stats.totalCalls) * 100;
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading AMD campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AMD Campaign Management</h1>
          <p className="text-gray-600">Manage intelligent answering machine detection campaigns with cultural intelligence</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create AMD Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new intelligent AMD campaign with cultural adaptation
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the campaign purpose"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={newCampaign.targetAudience}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="e.g., Kerala residents, Business owners"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="culturalMode">Cultural Mode</Label>
                  <Select 
                    value={newCampaign.culturalMode} 
                    onValueChange={(value: any) => setNewCampaign(prev => ({ ...prev, culturalMode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="malayalam_formal">Malayalam Formal</SelectItem>
                      <SelectItem value="malayalam_casual">Malayalam Casual</SelectItem>
                      <SelectItem value="english_formal">English Formal</SelectItem>
                      <SelectItem value="english_casual">English Casual</SelectItem>
                      <SelectItem value="mixed">Mixed Language</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messageStrategy">Message Strategy</Label>
                  <Select 
                    value={newCampaign.messageStrategy} 
                    onValueChange={(value: any) => setNewCampaign(prev => ({ ...prev, messageStrategy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personalized">Personalized Messages</SelectItem>
                      <SelectItem value="standard">Standard Messages</SelectItem>
                      <SelectItem value="callback_only">Callback Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createCampaign} disabled={!newCampaign.name.trim()}>
                    Create Campaign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <Card key={campaign.campaignId} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription className="mt-1">{campaign.description}</CardDescription>
                </div>
                
                <Badge className={`ml-2 ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  <span className="ml-1">{campaign.status}</span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Campaign Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>{formatCulturalMode(campaign.culturalMode)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-green-600" />
                  <span>{campaign.targetAudience}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                  <span>{campaign.messageStrategy.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{campaign.statistics.totalCalls.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Total Calls</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{calculateAMDRate(campaign.statistics).toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">AMD Rate</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{campaign.statistics.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={campaign.statistics.completionRate} className="h-2" />
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Human Answers:</span>
                    <span className="font-medium">{campaign.statistics.humanAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages Left:</span>
                    <span className="font-medium">{campaign.statistics.messagesLeft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Callbacks:</span>
                    <span className="font-medium">{campaign.statistics.callbacksScheduled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AMD Detected:</span>
                    <span className="font-medium">{campaign.statistics.amdDetections}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateCampaignStatus(campaign.campaignId, 'active')}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  
                  {campaign.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => updateCampaignStatus(campaign.campaignId, 'paused')}
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  
                  {campaign.status === 'paused' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateCampaignStatus(campaign.campaignId, 'active')}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setShowSettingsDialog(true);
                    }}
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                  
                  <Button size="sm" variant="ghost">
                    <BarChart3 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {campaigns.length === 0 && !loading && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <PhoneCall className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
              <p className="text-gray-600 mb-4">Create your first AMD campaign to get started with intelligent call analysis</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Callback Schedules Section */}
      {callbackSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Callbacks
            </CardTitle>
            <CardDescription>
              Intelligent callback scheduling based on cultural preferences and AMD analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {callbackSchedules.slice(0, 10).map(callback => (
                <div key={callback.callId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      callback.status === 'pending' ? 'bg-yellow-500' : 
                      callback.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    
                    <div>
                      <div className="font-medium">Call {callback.callId}</div>
                      <div className="text-sm text-gray-600">{callback.customerPhone}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {formatCulturalMode(callback.culturalMode)}
                      </Badge>
                      
                      <Badge variant="outline" className={
                        callback.priority === 'high' ? 'border-red-200 text-red-800' :
                        callback.priority === 'medium' ? 'border-yellow-200 text-yellow-800' :
                        'border-gray-200 text-gray-800'
                      }>
                        {callback.priority} priority
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">{new Date(callback.scheduledCallbackTime).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">
                      Attempt {callback.attempts}/{callback.maxAttempts}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Settings</DialogTitle>
            <DialogDescription>
              Configure AMD detection and cultural intelligence settings for {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6">
              {/* Detection Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detection Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Detection Time (seconds)</Label>
                    <Input 
                      type="number" 
                      value={settings.maxDetectionTime}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, maxDetectionTime: parseInt(e.target.value) || 5 }))
                      }
                      min="1" 
                      max="10" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Confidence Threshold</Label>
                    <Input 
                      type="number" 
                      value={settings.confidenceThreshold}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) || 0.85 }))
                      }
                      min="0.1" 
                      max="1.0" 
                      step="0.05" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Cultural Adaptation</Label>
                    <div className="text-sm text-gray-600">Adapt detection for Malayalam cultural patterns</div>
                  </div>
                  <Switch 
                    checked={settings.culturalAdaptation}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, culturalAdaptation: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Personalized Messages</Label>
                    <div className="text-sm text-gray-600">Use customer profile for message personalization</div>
                  </div>
                  <Switch 
                    checked={settings.personalizedMessages}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, personalizedMessages: checked }))
                    }
                  />
                </div>
              </div>

              {/* Callback Settings */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Callback Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Callbacks</Label>
                    <div className="text-sm text-gray-600">Schedule intelligent callbacks for AMD detections</div>
                  </div>
                  <Switch 
                    checked={settings.enableCallbacks}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableCallbacks: checked }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Morning Window</Label>
                    <Input defaultValue="9:00 AM - 11:00 AM" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Evening Window</Label>
                    <Input defaultValue="4:00 PM - 6:00 PM" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Respect Cultural Timing</Label>
                    <div className="text-sm text-gray-600">Avoid meal times and prayer times</div>
                  </div>
                  <Switch 
                    checked={settings.respectCulturalTiming}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, respectCulturalTiming: checked }))
                    }
                  />
                </div>
              </div>

              {/* Message Templates */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Message Templates</h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Malayalam Formal Message</Label>
                    <Textarea 
                      placeholder="Namaste, ith [Company] il ninnu vilikkunnu..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Malayalam Casual Message</Label>
                    <Textarea 
                      placeholder="Hello, njan [Company] il ninnu vilikkunnathaanu..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>English Formal Message</Label>
                    <Textarea 
                      placeholder="Good day, this is a call from [Company]..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                  Cancel
                </Button>
                <Button>
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AMDCampaignManager;