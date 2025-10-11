'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Volume2, 
  Mic, 
  Globe, 
  Shield, 
  Database,
  Clock,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  isEncrypted: boolean;
}

interface SettingCategory {
  name: string;
  icon: any;
  description: string;
  settings: SystemSetting[];
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SettingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('voice');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - replace with actual API call
      const mockSettings: SettingCategory[] = [
        {
          name: 'Voice Settings',
          icon: Volume2,
          description: 'Configure voice processing and TTS settings',
          settings: [
            {
              id: '1',
              key: 'voice.tts.provider',
              value: 'google',
              type: 'string',
              category: 'voice',
              description: 'Text-to-speech provider (google, azure, aws)',
              isEncrypted: false
            },
            {
              id: '2',
              key: 'voice.tts.malayalam_voice',
              value: 'ml-IN-Standard-A',
              type: 'string',
              category: 'voice',
              description: 'Malayalam voice model for TTS',
              isEncrypted: false
            },
            {
              id: '3',
              key: 'voice.stt.confidence_threshold',
              value: '0.85',
              type: 'number',
              category: 'voice',
              description: 'Minimum confidence for speech recognition',
              isEncrypted: false
            },
            {
              id: '4',
              key: 'voice.noise_reduction',
              value: 'true',
              type: 'boolean',
              category: 'voice',
              description: 'Enable background noise reduction',
              isEncrypted: false
            }
          ]
        },
        {
          name: 'Integration Settings',
          icon: Globe,
          description: 'Manage external service integrations',
          settings: [
            {
              id: '5',
              key: 'integration.gemini.api_key',
              value: 'AIzaSyBW5iYIIHl9x6ZYraRcWzu0TwTe-ihewo8',
              type: 'string',
              category: 'integration',
              description: 'Google Gemini API key for AI processing',
              isEncrypted: true
            },
            {
              id: '6',
              key: 'integration.webhook.timeout',
              value: '30000',
              type: 'number',
              category: 'integration',
              description: 'Webhook timeout in milliseconds',
              isEncrypted: false
            },
            {
              id: '7',
              key: 'integration.retry.max_attempts',
              value: '3',
              type: 'number',
              category: 'integration',
              description: 'Maximum retry attempts for failed requests',
              isEncrypted: false
            }
          ]
        },
        {
          name: 'Security Settings',
          icon: Shield,
          description: 'Security and authentication configuration',
          settings: [
            {
              id: '8',
              key: 'security.jwt.expiry',
              value: '3600',
              type: 'number',
              category: 'security',
              description: 'JWT token expiry time in seconds',
              isEncrypted: false
            },
            {
              id: '9',
              key: 'security.encryption.enabled',
              value: 'true',
              type: 'boolean',
              category: 'security',
              description: 'Enable data encryption at rest',
              isEncrypted: false
            },
            {
              id: '10',
              key: 'security.rate_limit.calls_per_minute',
              value: '100',
              type: 'number',
              category: 'security',
              description: 'Maximum API calls per minute per user',
              isEncrypted: false
            }
          ]
        },
        {
          name: 'System Settings',
          icon: Database,
          description: 'Core system and database configuration',
          settings: [
            {
              id: '11',
              key: 'system.log_level',
              value: 'info',
              type: 'string',
              category: 'system',
              description: 'System logging level (debug, info, warn, error)',
              isEncrypted: false
            },
            {
              id: '12',
              key: 'system.session_timeout',
              value: '1800',
              type: 'number',
              category: 'system',
              description: 'User session timeout in seconds',
              isEncrypted: false
            },
            {
              id: '13',
              key: 'system.auto_backup',
              value: 'true',
              type: 'boolean',
              category: 'system',
              description: 'Enable automatic database backups',
              isEncrypted: false
            }
          ]
        }
      ];

      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingId: string, newValue: string) => {
    try {
      // Update local state
      setSettings(prev => prev.map(category => ({
        ...category,
        settings: category.settings.map(setting => 
          setting.id === settingId 
            ? { ...setting, value: newValue }
            : setting
        )
      })));

      // TODO: Make API call to update setting
      console.log(`Updating setting ${settingId} to ${newValue}`);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      // TODO: Make API call to save all settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Settings Saved',
        description: 'All system settings have been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      try {
        // TODO: Make API call to reset settings
        await fetchSettings();
        toast({
          title: 'Settings Reset',
          description: 'All settings have been reset to default values',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to reset settings',
          variant: 'destructive'
        });
      }
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value === 'true'}
            onCheckedChange={(checked) => 
              updateSetting(setting.id, checked.toString())
            }
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="max-w-xs"
          />
        );
      case 'json':
        return (
          <Textarea
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="font-mono"
            rows={4}
          />
        );
      default:
        return (
          <Input
            type={setting.isEncrypted ? 'password' : 'text'}
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="max-w-xs"
          />
        );
    }
  };

  const filteredCategories = settings.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.settings.some(setting => 
      setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const currentCategory = filteredCategories.find(cat => 
    cat.name.toLowerCase().replace(' settings', '').replace(' ', '') === selectedCategory
  );

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
            <Settings className="h-8 w-8" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure system parameters, integrations, and voice settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={saveAllSettings}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          {settings.reduce((total, cat) => total + cat.settings.length, 0)} settings
        </Badge>
      </div>

      {/* Settings Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredCategories.map((category) => {
                const categoryKey = category.name.toLowerCase().replace(' settings', '').replace(' ', '');
                const Icon = category.icon;
                const isSelected = selectedCategory === categoryKey;
                
                return (
                  <button
                    key={categoryKey}
                    onClick={() => setSelectedCategory(categoryKey)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div>
                      <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.settings.length} settings
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {currentCategory ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <currentCategory.icon className="h-6 w-6" />
                  {currentCategory.name}
                </CardTitle>
                <CardDescription>{currentCategory.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {currentCategory.settings.map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-base font-medium">
                            {setting.key}
                            {setting.isEncrypted && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Encrypted
                              </Badge>
                            )}
                          </Label>
                          {setting.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {setting.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {setting.type}
                          </Badge>
                          {renderSettingInput(setting)}
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Select a Category</h3>
                <p className="text-gray-600">Choose a category from the left to view and edit settings</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}