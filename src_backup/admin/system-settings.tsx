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
  Info,
  GitBranch,
  Tag
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api-client';
import { useMockData } from '@/hooks/use-mock-data';

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
  const { isDemoMode } = useMockData();
  const [settings, setSettings] = useState<SettingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('voice');
  const [commits, setCommits] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingReleases, setLoadingReleases] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [isDemoMode]);

  useEffect(() => {
    if (selectedCategory === 'versioncontrol' && settings.length > 0) {
      fetchCommits();
      fetchReleases();
    }
  }, [selectedCategory, settings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      if (isDemoMode) {
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
                key: 'integration.vocode.api_key',
                value: '',
                type: 'string',
                category: 'integration',
                description: 'Vocode API key for voice AI processing',
                isEncrypted: true
              },
              {
                id: '7',
                key: 'integration.openai.api_key',
                value: '',
                type: 'string',
                category: 'integration',
                description: 'OpenAI API key for Vocode ChatGPT agent',
                isEncrypted: true
              },
              {
                id: '8',
                key: 'integration.azure.speech_key',
                value: '',
                type: 'string',
                category: 'integration',
                description: 'Azure Cognitive Services Speech API key',
                isEncrypted: true
              },
              {
                id: '9',
                key: 'integration.azure.speech_region',
                value: 'eastus',
                type: 'string',
                category: 'integration',
                description: 'Azure Speech Services region',
                isEncrypted: false
              },
              {
                id: '10',
                key: 'integration.deepgram.api_key',
                value: '',
                type: 'string',
                category: 'integration',
                description: 'Deepgram API key for speech transcription',
                isEncrypted: true
              },
              {
                id: '11',
                key: 'integration.webhook.timeout',
                value: '30000',
                type: 'number',
                category: 'integration',
                description: 'Webhook timeout in milliseconds',
                isEncrypted: false
              },
              {
                id: '12',
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
                id: '13',
                key: 'security.jwt.expiry',
                value: '3600',
                type: 'number',
                category: 'security',
                description: 'JWT token expiry time in seconds',
                isEncrypted: false
              },
              {
                id: '14',
                key: 'security.encryption.enabled',
                value: 'true',
                type: 'boolean',
                category: 'security',
                description: 'Enable data encryption at rest',
                isEncrypted: false
              },
              {
                id: '15',
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
                id: '16',
                key: 'system.log_level',
                value: 'info',
                type: 'string',
                category: 'system',
                description: 'System logging level (debug, info, warn, error)',
                isEncrypted: false
              },
              {
                id: '17',
                key: 'system.session_timeout',
                value: '1800',
                type: 'number',
                category: 'system',
                description: 'User session timeout in seconds',
                isEncrypted: false
              },
              {
                id: '18',
                key: 'system.auto_backup',
                value: 'true',
                type: 'boolean',
                category: 'system',
                description: 'Enable automatic database backups',
                isEncrypted: false
              }
            ]
          },
          {
            name: 'Version Control',
            icon: GitBranch,
            description: 'GitHub repository commits and releases',
            settings: [
              {
                id: '19',
                key: 'version_control.github_owner',
                value: 'your-github-username',
                type: 'string',
                category: 'version_control',
                description: 'GitHub repository owner/username',
                isEncrypted: false
              },
              {
                id: '20',
                key: 'version_control.github_repo',
                value: 'ai-ivr-v2',
                type: 'string',
                category: 'version_control',
                description: 'GitHub repository name',
                isEncrypted: false
              },
              {
                id: '21',
                key: 'version_control.commit_limit',
                value: '10',
                type: 'number',
                category: 'version_control',
                description: 'Number of recent commits to display',
                isEncrypted: false
              }
            ]
          }
        ];

        setSettings(mockSettings);
      } else {
        // Real API call
        const response = await api.getSystemSettings();
        setSettings(response.data);
      }
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

  const fetchCommits = async () => {
    try {
      setLoadingCommits(true);
      const owner = settings.find(cat => cat.name === 'Version Control')?.settings.find(s => s.key === 'version_control.github_owner')?.value || 'your-github-username';
      const repo = settings.find(cat => cat.name === 'Version Control')?.settings.find(s => s.key === 'version_control.github_repo')?.value || 'ai-ivr-v2';
      const limit = settings.find(cat => cat.name === 'Version Control')?.settings.find(s => s.key === 'version_control.commit_limit')?.value || '10';

      const response = await fetch(`/api/github/commits?owner=${owner}&repo=${repo}&limit=${limit}`);
      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch commits',
          variant: 'destructive'
        });
        setCommits([]);
      } else {
        setCommits(data.commits || []);
      }
    } catch (error) {
      console.error('Error fetching commits:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch GitHub commits',
        variant: 'destructive'
      });
      setCommits([]);
    } finally {
      setLoadingCommits(false);
    }
  };

  const fetchReleases = async () => {
    try {
      setLoadingReleases(true);
      const owner = settings.find(cat => cat.name === 'Version Control')?.settings.find(s => s.key === 'version_control.github_owner')?.value || 'your-github-username';
      const repo = settings.find(cat => cat.name === 'Version Control')?.settings.find(s => s.key === 'version_control.github_repo')?.value || 'ai-ivr-v2';

      const response = await fetch(`/api/github/releases?owner=${owner}&repo=${repo}&limit=5`);
      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch releases',
          variant: 'destructive'
        });
        setReleases([]);
      } else {
        setReleases(data.releases || []);
      }
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch GitHub releases',
        variant: 'destructive'
      });
      setReleases([]);
    } finally {
      setLoadingReleases(false);
    }
  }; const updateSetting = async (settingId: string, newValue: string) => {
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

      // Prepare settings data for API
      const settingsData = {
        integration: {
          vocode: {
            api_key: settings.find(cat => cat.name === 'Integration Settings')?.settings.find(s => s.key === 'integration.vocode.api_key')?.value || '',
            base_url: 'api.vocode.dev',
            organization_id: ''
          },
          openai: {
            api_key: settings.find(cat => cat.name === 'Integration Settings')?.settings.find(s => s.key === 'integration.openai.api_key')?.value || ''
          },
          azure: {
            speech_key: settings.find(cat => cat.name === 'Integration Settings')?.settings.find(s => s.key === 'integration.azure.speech_key')?.value || '',
            speech_region: settings.find(cat => cat.name === 'Integration Settings')?.settings.find(s => s.key === 'integration.azure.speech_region')?.value || 'eastus'
          },
          deepgram: {
            api_key: settings.find(cat => cat.name === 'Integration Settings')?.settings.find(s => s.key === 'integration.deepgram.api_key')?.value || ''
          }
        }
      };

      // Make API call to save settings to backend
      const result = await api.updateSettings(settingsData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save settings to backend');
      }

      toast({
        title: 'Settings Saved',
        description: 'All system settings have been updated successfully. API keys are now configured for Vocode integration.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please check your API keys and try again.',
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
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
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
            currentCategory.name === 'Version Control' ? (
              <div className="space-y-6">
                {/* Version Control Settings */}
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

                {/* Recent Commits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      Recent Commits
                    </CardTitle>
                    <CardDescription>Latest commits from the GitHub repository</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingCommits ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading commits...</span>
                      </div>
                    ) : commits.length > 0 ? (
                      <div className="space-y-4">
                        {commits.map((commit) => (
                          <div key={commit.sha} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="flex-shrink-0">
                              {commit.author.avatar_url ? (
                                <img
                                  src={commit.author.avatar_url}
                                  alt={commit.author.login}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {commit.author.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {commit.short_sha}
                                </code>
                                <span className="text-sm font-medium text-gray-900">
                                  {commit.author.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(commit.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                {commit.message.split('\n')[0]}
                              </p>
                              <a
                                href={commit.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                View on GitHub →
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No commits found or repository not accessible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Releases */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Recent Releases
                    </CardTitle>
                    <CardDescription>Latest releases and tags from the GitHub repository</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingReleases ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading releases...</span>
                      </div>
                    ) : releases.length > 0 ? (
                      <div className="space-y-4">
                        {releases.map((release) => (
                          <div key={release.id} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-lg">{release.name}</h4>
                                <Badge variant={release.prerelease ? "secondary" : "default"}>
                                  {release.tag_name}
                                </Badge>
                                {release.prerelease && (
                                  <Badge variant="outline">Pre-release</Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(release.published_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">
                              {release.body.length > 200
                                ? `${release.body.substring(0, 200)}...`
                                : release.body
                              }
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {release.author.avatar_url && (
                                  <img
                                    src={release.author.avatar_url}
                                    alt={release.author.login}
                                    className="w-6 h-6 rounded-full"
                                  />
                                )}
                                <span className="text-sm text-gray-600">
                                  {release.author.login}
                                </span>
                              </div>
                              <a
                                href={release.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                View Release →
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No releases found or repository not accessible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
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
            )
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