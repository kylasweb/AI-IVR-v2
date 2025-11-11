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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bot,
  Brain,
  Settings,
  Zap,
  Shield,
  Globe,
  FileText as Code,
  MessageSquare,
  FileText,
  Plus as Hash,
  Mic,
  Eye,
  Save,
  Play,
  Upload,
  Download,
  Info,
  AlertTriangle,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  Star as DollarSign,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type {
  AIAgent,
  AgentConfiguration,
  AgentTemplate,
  AgentMetrics,
  AgentPricing,
  AgentStatus
} from '@/types/ai-agent';

interface AIAgentBuilderProps {
  agentId?: string;
  onSave?: (agent: AIAgent) => void;
  onTest?: (config: AgentConfiguration) => void;
  mode?: 'create' | 'edit' | 'view';
}

export default function AIAgentBuilder({
  agentId,
  onSave,
  onTest,
  mode = 'create'
}: AIAgentBuilderProps) {
  const [activeTab, setActiveTab] = useState('basics');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    responseTime: number;
    confidence: number;
    response: string;
  } | null>(null);

  const [agent, setAgent] = useState<Partial<AIAgent>>({
    name: '',
    description: '',
    status: 'draft' as AgentStatus,
    configuration: {
      persona: {
        name: '',
        role: '',
        personality: '',
        expertise: [],
        communicationStyle: 'professional',
        languagePreference: 'malayalam'
      },
      model: {
        provider: 'openai',
        modelId: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      prompts: {
        systemPrompt: '',
        userPromptTemplate: '',
        fallbackResponses: [],
        contextInstructions: ''
      },
      capabilities: {
        textGeneration: true,
        questionAnswering: true,
        documentAnalysis: false,
        codeGeneration: false,
        translation: false,
        summarization: false,
        sentiment: false,
        voiceProcessing: false
      },
      safety: {
        contentFiltering: true,
        toxicityThreshold: 0.8,
        piiDetection: true,
        biasMonitoring: true,
        adultContentFilter: true
      },
      integrations: {
        apiEndpoints: [],
        externalTools: [],
        databases: []
      },
      malayalamSupport: {
        enabled: true,
        dialectSupport: ['central', 'northern', 'southern'],
        scriptSupport: 'both',
        culturalContext: true,
        regionalVariations: true
      }
    },
    pricing: {
      model: 'pay-per-use',
      pricePerExecution: 5,
      currency: 'INR',
      revenueShare: {
        platform: 30,
        creator: 70
      }
    }
  });

  const [templates, setTemplates] = useState<AgentTemplate[]>([
    {
      id: '1',
      name: 'Malayalam Customer Support Agent',
      description: 'A customer support agent specialized in Malayalam language and Kerala culture',
      category: 'Customer Service',
      configuration: {
        persona: {
          name: 'സപ്പോർട്ട് ബോട്ട്',
          role: 'Customer Support Representative',
          personality: 'Helpful, patient, and culturally aware',
          expertise: ['Customer Service', 'Malayalam Culture', 'Problem Solving'],
          communicationStyle: 'friendly',
          languagePreference: 'malayalam'
        }
      },
      isPopular: true,
      usageCount: 150
    },
    {
      id: '2',
      name: 'Malayalam Content Creator',
      description: 'Creates engaging Malayalam content for social media and marketing',
      category: 'Content Creation',
      configuration: {
        capabilities: {
          textGeneration: true,
          translation: true,
          sentiment: true,
          questionAnswering: false,
          documentAnalysis: false,
          codeGeneration: false,
          summarization: true,
          voiceProcessing: false
        }
      },
      isPopular: true,
      usageCount: 89
    }
  ]);

  const updateConfiguration = (section: keyof AgentConfiguration, updates: any) => {
    setAgent(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration!,
        [section]: {
          ...prev.configuration![section],
          ...updates
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!agent.name || !agent.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Save agent
      const savedAgent = {
        ...agent,
        id: agentId || `agent_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'current-user-id', // TODO: Get from auth context
        version: '1.0.0'
      } as AIAgent;

      if (onSave) {
        onSave(savedAgent);
      }

      toast({
        title: "Success!",
        description: "AI Agent saved successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save AI Agent",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      if (onTest && agent.configuration) {
        await onTest(agent.configuration);
      }

      // Simulate test results
      setTestResults({
        success: true,
        responseTime: 1.2,
        confidence: 0.92,
        response: "Test response generated successfully!"
      });

      toast({
        title: "Test Successful",
        description: "Agent responded correctly to test prompt",
      });

    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Agent test encountered an error",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const applyTemplate = (template: AgentTemplate) => {
    setAgent(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      configuration: {
        ...prev.configuration!,
        ...template.configuration
      }
    }));

    toast({
      title: "Template Applied",
      description: `Applied ${template.name} template successfully`,
    });
  };

  const renderBasicsTab = () => (
    <div className="space-y-6">
      {/* Agent Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Quick Start Templates
          </CardTitle>
          <CardDescription>
            Choose from pre-built templates to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    {template.isPopular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{template.usageCount} uses</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="agent-name">Agent Name *</Label>
            <Input
              id="agent-name"
              placeholder="Enter agent name"
              value={agent.name}
              onChange={(e) => setAgent(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="agent-description">Description *</Label>
            <Textarea
              id="agent-description"
              placeholder="Describe what your agent does and its capabilities"
              value={agent.description}
              onChange={(e) => setAgent(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="agent-status">Status</Label>
            <Select
              value={agent.status}
              onValueChange={(value: AgentStatus) => setAgent(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPersonaTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent Persona
          </CardTitle>
          <CardDescription>
            Define your agent's personality and communication style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="persona-name">Agent Display Name</Label>
            <Input
              id="persona-name"
              placeholder="How should users address your agent?"
              value={agent.configuration?.persona.name}
              onChange={(e) => updateConfiguration('persona', { name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="persona-role">Role</Label>
            <Input
              id="persona-role"
              placeholder="e.g., Customer Support Representative, Content Creator"
              value={agent.configuration?.persona.role}
              onChange={(e) => updateConfiguration('persona', { role: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="persona-personality">Personality</Label>
            <Textarea
              id="persona-personality"
              placeholder="Describe the agent's personality traits"
              value={agent.configuration?.persona.personality}
              onChange={(e) => updateConfiguration('persona', { personality: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="communication-style">Communication Style</Label>
            <Select
              value={agent.configuration?.persona.communicationStyle}
              onValueChange={(value) => updateConfiguration('persona', { communicationStyle: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language-preference">Primary Language</Label>
            <Select
              value={agent.configuration?.persona.languagePreference}
              onValueChange={(value) => updateConfiguration('persona', { languagePreference: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="malayalam">മലയാളം (Malayalam)</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="manglish">Manglish</SelectItem>
                <SelectItem value="multilingual">Multilingual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCapabilitiesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Agent Capabilities
          </CardTitle>
          <CardDescription>
            Select what your agent can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(agent.configuration?.capabilities || {}).map(([capability, enabled]) => {
              const icons = {
                textGeneration: FileText,
                questionAnswering: MessageSquare,
                documentAnalysis: FileText,
                codeGeneration: Code,
                translation: Globe,
                summarization: FileText,
                sentiment: BarChart3,
                voiceProcessing: Mic
              };

              const Icon = icons[capability as keyof typeof icons] || Zap;

              return (
                <div key={capability} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label className="text-sm font-medium capitalize">
                        {capability.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-xs text-gray-500">
                        {getCapabilityDescription(capability)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      updateConfiguration('capabilities', { [capability]: checked })
                    }
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getCapabilityDescription = (capability: string): string => {
    const descriptions = {
      textGeneration: 'Generate creative text content',
      questionAnswering: 'Answer user questions intelligently',
      documentAnalysis: 'Analyze and extract information from documents',
      codeGeneration: 'Generate and review code',
      translation: 'Translate between languages',
      summarization: 'Summarize long texts',
      sentiment: 'Analyze sentiment and emotions',
      voiceProcessing: 'Process voice and audio inputs'
    };

    return descriptions[capability as keyof typeof descriptions] || 'Advanced AI capability';
  };

  const renderModelTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Model Configuration
          </CardTitle>
          <CardDescription>
            Configure the underlying AI model settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model-provider">AI Provider</Label>
              <Select
                value={agent.configuration?.model.provider}
                onValueChange={(value) => updateConfiguration('model', { provider: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI GPT</SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  <SelectItem value="google">Google Gemini</SelectItem>
                  <SelectItem value="local">Local Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model-id">Model Version</Label>
              <Select
                value={agent.configuration?.model.modelId}
                onValueChange={(value) => updateConfiguration('model', { modelId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="temperature">
                Temperature: {agent.configuration?.model.temperature}
              </Label>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500">Conservative</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={agent.configuration?.model.temperature}
                  onChange={(e) => updateConfiguration('model', { temperature: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">Creative</span>
              </div>
            </div>

            <div>
              <Label htmlFor="max-tokens">Max Response Length</Label>
              <Input
                id="max-tokens"
                type="number"
                min="100"
                max="4000"
                value={agent.configuration?.model.maxTokens}
                onChange={(e) => updateConfiguration('model', { maxTokens: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPromptsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Prompt Engineering
          </CardTitle>
          <CardDescription>
            Define how your agent understands and responds to inputs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              placeholder="You are a helpful assistant that..."
              value={agent.configuration?.prompts.systemPrompt}
              onChange={(e) => updateConfiguration('prompts', { systemPrompt: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              This defines your agent's core behavior and personality
            </p>
          </div>

          <div>
            <Label htmlFor="user-template">User Prompt Template</Label>
            <Textarea
              id="user-template"
              placeholder="User query: {input}\n\nPlease respond in {language}..."
              value={agent.configuration?.prompts.userPromptTemplate}
              onChange={(e) => updateConfiguration('prompts', { userPromptTemplate: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Template for processing user inputs. Use {`{input}`} for user query placeholder
            </p>
          </div>

          <div>
            <Label htmlFor="context-instructions">Context Instructions</Label>
            <Textarea
              id="context-instructions"
              placeholder="Always maintain cultural sensitivity when discussing Kerala topics..."
              value={agent.configuration?.prompts.contextInstructions}
              onChange={(e) => updateConfiguration('prompts', { contextInstructions: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMalayalamTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Malayalam & Cultural Configuration
          </CardTitle>
          <CardDescription>
            Configure Malayalam language support and cultural awareness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Malayalam Support</Label>
              <p className="text-sm text-gray-500">
                Allow agent to understand and respond in Malayalam
              </p>
            </div>
            <Switch
              checked={agent.configuration?.malayalamSupport.enabled}
              onCheckedChange={(checked) =>
                updateConfiguration('malayalamSupport', { enabled: checked })
              }
            />
          </div>

          {agent.configuration?.malayalamSupport.enabled && (
            <>
              <div>
                <Label>Script Support</Label>
                <Select
                  value={agent.configuration?.malayalamSupport.scriptSupport}
                  onValueChange={(value) => updateConfiguration('malayalamSupport', { scriptSupport: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="malayalam">Malayalam Script Only</SelectItem>
                    <SelectItem value="latin">Latin Script Only</SelectItem>
                    <SelectItem value="both">Both Scripts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Dialect Support</Label>
                {['central', 'northern', 'southern', 'malabar'].map((dialect) => (
                  <div key={dialect} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`dialect-${dialect}`}
                      checked={agent.configuration?.malayalamSupport.dialectSupport.includes(dialect)}
                      onChange={(e) => {
                        const current = agent.configuration?.malayalamSupport.dialectSupport || [];
                        const updated = e.target.checked
                          ? [...current, dialect]
                          : current.filter(d => d !== dialect);
                        updateConfiguration('malayalamSupport', { dialectSupport: updated });
                      }}
                    />
                    <Label htmlFor={`dialect-${dialect}`} className="capitalize">
                      {dialect} Kerala
                    </Label>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Cultural Context Awareness</Label>
                  <p className="text-sm text-gray-500">
                    Understand Kerala culture, festivals, and traditions
                  </p>
                </div>
                <Switch
                  checked={agent.configuration?.malayalamSupport.culturalContext}
                  onCheckedChange={(checked) =>
                    updateConfiguration('malayalamSupport', { culturalContext: checked })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing & Monetization
          </CardTitle>
          <CardDescription>
            Configure how users will pay for your agent's services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Pricing Model</Label>
            <Select
              value={agent.pricing?.model}
              onValueChange={(value) => setAgent(prev => ({
                ...prev,
                pricing: { ...prev.pricing!, model: value as any }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pay-per-use">Pay Per Use</SelectItem>
                <SelectItem value="subscription">Monthly Subscription</SelectItem>
                <SelectItem value="tiered">Tiered Pricing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {agent.pricing?.model === 'pay-per-use' && (
            <div>
              <Label htmlFor="price-per-execution">Price per Execution (₹)</Label>
              <Input
                id="price-per-execution"
                type="number"
                min="1"
                step="0.5"
                value={agent.pricing?.pricePerExecution}
                onChange={(e) => setAgent(prev => ({
                  ...prev,
                  pricing: {
                    ...prev.pricing!,
                    pricePerExecution: parseFloat(e.target.value)
                  }
                }))}
              />
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Revenue Sharing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform Fee</Label>
                <p className="text-2xl font-bold text-gray-600">
                  {agent.pricing?.revenueShare.platform}%
                </p>
              </div>
              <div>
                <Label>Your Share</Label>
                <p className="text-2xl font-bold text-green-600">
                  {agent.pricing?.revenueShare.creator}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Builder</h1>
          <p className="text-gray-600 mt-1">
            Create and configure intelligent AI agents for the Malayalam AI ecosystem
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isTesting ? 'Testing...' : 'Test Agent'}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Agent'}
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Configuration Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round((Object.values({
                basics: !!(agent.name && agent.description),
                persona: !!agent.configuration?.persona.name,
                capabilities: Object.values(agent.configuration?.capabilities || {}).some(Boolean),
                model: !!agent.configuration?.model.provider,
                prompts: !!agent.configuration?.prompts.systemPrompt,
                pricing: !!agent.pricing?.model
              }).filter(Boolean).length / 6) * 100)}% Complete
            </span>
          </div>
          <Progress value={Math.round((Object.values({
            basics: !!(agent.name && agent.description),
            persona: !!agent.configuration?.persona.name,
            capabilities: Object.values(agent.configuration?.capabilities || {}).some(Boolean),
            model: !!agent.configuration?.model.provider,
            prompts: !!agent.configuration?.prompts.systemPrompt,
            pricing: !!agent.pricing?.model
          }).filter(Boolean).length / 6) * 100)} className="h-2" />
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Test completed successfully! Response time: {testResults.responseTime}s,
            Confidence: {Math.round(testResults.confidence * 100)}%
          </AlertDescription>
        </Alert>
      )}

      {/* Main Configuration Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="basics" className="flex items-center gap-2 text-xs">
                <Bot className="h-3 w-3" />
                Basics
              </TabsTrigger>
              <TabsTrigger value="persona" className="flex items-center gap-2 text-xs">
                <Users className="h-3 w-3" />
                Persona
              </TabsTrigger>
              <TabsTrigger value="capabilities" className="flex items-center gap-2 text-xs">
                <Zap className="h-3 w-3" />
                Capabilities
              </TabsTrigger>
              <TabsTrigger value="model" className="flex items-center gap-2 text-xs">
                <Brain className="h-3 w-3" />
                AI Model
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2 text-xs">
                <MessageSquare className="h-3 w-3" />
                Prompts
              </TabsTrigger>
              <TabsTrigger value="malayalam" className="flex items-center gap-2 text-xs">
                <Globe className="h-3 w-3" />
                Malayalam
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2 text-xs">
                <DollarSign className="h-3 w-3" />
                Pricing
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="basics">{renderBasicsTab()}</TabsContent>
            <TabsContent value="persona">{renderPersonaTab()}</TabsContent>
            <TabsContent value="capabilities">{renderCapabilitiesTab()}</TabsContent>
            <TabsContent value="model">{renderModelTab()}</TabsContent>
            <TabsContent value="prompts">{renderPromptsTab()}</TabsContent>
            <TabsContent value="malayalam">{renderMalayalamTab()}</TabsContent>
            <TabsContent value="pricing">{renderPricingTab()}</TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}