'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal as MoreVertical,
  Settings as Edit,
  Eye,
  Copy,
  Trash2,
  TrendingUp,
  Users,
  Star as DollarSign,
  Activity,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  X as Pause,
  Play,
  Bot,
  Brain,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { AIAgent, AgentStatus, AgentMetrics } from '@/types/ai-agent';
import AIAgentBuilder from './ai-agent-builder';

interface AIAgentManagementProps {
  onCreateAgent?: () => void;
  onEditAgent?: (agentId: string) => void;
}

export default function AIAgentManagement({ onCreateAgent, onEditAgent }: AIAgentManagementProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AIAgent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAgents: AIAgent[] = [
      {
        id: 'agent-1',
        name: 'Malayalam Customer Support Bot',
        description: 'Intelligent customer support agent specialized in Malayalam language and Kerala culture',
        status: 'published',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        creatorId: 'user-1',
        version: '1.2.0',
        configuration: {
          persona: {
            name: 'സപ്പോർട്ട് ബോട്ട്',
            role: 'Customer Support Representative',
            personality: 'Helpful and culturally aware',
            expertise: ['Customer Service', 'Malayalam Culture'],
            communicationStyle: 'friendly',
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
            systemPrompt: 'You are a helpful Malayalam customer support assistant...',
            userPromptTemplate: 'Customer query: {input}',
            fallbackResponses: ['I apologize, could you please rephrase your question?'],
            contextInstructions: 'Always be culturally sensitive'
          },
          capabilities: {
            textGeneration: true,
            questionAnswering: true,
            documentAnalysis: false,
            codeGeneration: false,
            translation: true,
            summarization: true,
            sentiment: true,
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
            dialectSupport: ['central', 'northern'],
            scriptSupport: 'both',
            culturalContext: true,
            regionalVariations: true
          }
        },
        metrics: {
          totalExecutions: 1250,
          successRate: 94.5,
          averageResponseTime: 1.8,
          userRating: 4.7,
          totalRevenue: 8750,
          activeUsers: 340,
          lastExecuted: new Date('2024-01-20T10:30:00'),
          popularQueries: [
            'How to reset password?',
            'Order status check',
            'Product information'
          ],
          errorRate: 5.5,
          tokenUsage: 450000
        },
        pricing: {
          model: 'pay-per-use',
          pricePerExecution: 7,
          currency: 'INR',
          revenueShare: {
            platform: 30,
            creator: 70
          }
        }
      },
      {
        id: 'agent-2',
        name: 'Kerala Tourism Guide',
        description: 'Travel assistant specializing in Kerala tourism and local recommendations',
        status: 'testing',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        creatorId: 'user-1',
        version: '0.9.0',
        configuration: {
          persona: {
            name: 'Kerala Tourism Bot',
            role: 'Tourism Guide',
            personality: 'Enthusiastic and knowledgeable about Kerala',
            expertise: ['Kerala Tourism', 'Local Culture', 'Travel Planning'],
            communicationStyle: 'friendly',
            languagePreference: 'multilingual'
          },
          model: {
            provider: 'openai',
            modelId: 'gpt-4',
            temperature: 0.8,
            maxTokens: 1500,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0
          },
          prompts: {
            systemPrompt: 'You are a knowledgeable Kerala tourism guide...',
            userPromptTemplate: 'Tourist query: {input}',
            fallbackResponses: ['Let me help you explore Kerala better!'],
            contextInstructions: 'Focus on authentic Kerala experiences'
          },
          capabilities: {
            textGeneration: true,
            questionAnswering: true,
            documentAnalysis: true,
            codeGeneration: false,
            translation: true,
            summarization: true,
            sentiment: false,
            voiceProcessing: false
          },
          safety: {
            contentFiltering: true,
            toxicityThreshold: 0.9,
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
        metrics: {
          totalExecutions: 89,
          successRate: 91.0,
          averageResponseTime: 2.1,
          userRating: 4.3,
          totalRevenue: 445,
          activeUsers: 23,
          lastExecuted: new Date('2024-01-18T14:45:00'),
          popularQueries: [
            'Best places to visit in Kochi',
            'Kerala backwater tours',
            'Traditional Kerala food'
          ],
          errorRate: 9.0,
          tokenUsage: 67000
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
      },
      {
        id: 'agent-3',
        name: 'Malayalam Content Creator',
        description: 'AI assistant for creating engaging Malayalam content for social media and marketing',
        status: 'draft',
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19'),
        creatorId: 'user-1',
        version: '0.1.0',
        configuration: {
          persona: {
            name: 'Content Creator Bot',
            role: 'Content Creator',
            personality: 'Creative and trend-aware',
            expertise: ['Content Creation', 'Social Media', 'Malayalam Literature'],
            communicationStyle: 'creative',
            languagePreference: 'malayalam'
          },
          model: {
            provider: 'openai',
            modelId: 'gpt-4-turbo',
            temperature: 0.9,
            maxTokens: 2500,
            topP: 1,
            frequencyPenalty: 0.1,
            presencePenalty: 0.1
          },
          prompts: {
            systemPrompt: 'You are a creative Malayalam content creator...',
            userPromptTemplate: 'Content request: {input}',
            fallbackResponses: ['Let me create something amazing for you!'],
            contextInstructions: 'Keep content culturally relevant and engaging'
          },
          capabilities: {
            textGeneration: true,
            questionAnswering: false,
            documentAnalysis: false,
            codeGeneration: false,
            translation: true,
            summarization: true,
            sentiment: true,
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
            dialectSupport: ['central'],
            scriptSupport: 'malayalam',
            culturalContext: true,
            regionalVariations: false
          }
        },
        metrics: {
          totalExecutions: 0,
          successRate: 0,
          averageResponseTime: 0,
          userRating: 0,
          totalRevenue: 0,
          activeUsers: 0,
          popularQueries: [],
          errorRate: 0,
          tokenUsage: 0
        },
        pricing: {
          model: 'pay-per-use',
          pricePerExecution: 10,
          currency: 'INR',
          revenueShare: {
            platform: 30,
            creator: 70
          }
        }
      }
    ];

    setAgents(mockAgents);
    setFilteredAgents(mockAgents);
    setIsLoading(false);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = agents;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'executions':
          return b.metrics.totalExecutions - a.metrics.totalExecutions;
        case 'revenue':
          return b.metrics.totalRevenue - a.metrics.totalRevenue;
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchQuery, statusFilter, sortBy]);

  const getStatusColor = (status: AgentStatus): string => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      testing: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-3 w-3" />;
      case 'testing':
        return <Play className="h-3 w-3" />;
      case 'suspended':
        return <Pause className="h-3 w-3" />;
      case 'review':
        return <Clock className="h-3 w-3" />;
      default:
        return <Edit className="h-3 w-3" />;
    }
  };

  const handleCreateAgent = () => {
    setShowCreateDialog(true);
    if (onCreateAgent) {
      onCreateAgent();
    }
  };

  const handleEditAgent = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setShowEditDialog(true);
    if (onEditAgent) {
      onEditAgent(agent.id);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      // TODO: Call actual delete API
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
      toast({
        title: "Agent Deleted",
        description: "AI Agent has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete AI Agent",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateAgent = async (agent: AIAgent) => {
    try {
      const duplicatedAgent: AIAgent = {
        ...agent,
        id: `agent_${Date.now()}`,
        name: `${agent.name} (Copy)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '0.1.0',
        metrics: {
          ...agent.metrics,
          totalExecutions: 0,
          totalRevenue: 0,
          activeUsers: 0,
          popularQueries: [],
          userRating: 0
        }
      };

      setAgents(prev => [duplicatedAgent, ...prev]);
      toast({
        title: "Agent Duplicated",
        description: "AI Agent has been successfully duplicated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate AI Agent",
        variant: "destructive"
      });
    }
  };

  const totalMetrics = React.useMemo(() => {
    return agents.reduce((acc, agent) => ({
      totalAgents: acc.totalAgents + 1,
      totalExecutions: acc.totalExecutions + agent.metrics.totalExecutions,
      totalRevenue: acc.totalRevenue + agent.metrics.totalRevenue,
      averageRating: (acc.averageRating + agent.metrics.userRating) / 2
    }), { totalAgents: 0, totalExecutions: 0, totalRevenue: 0, averageRating: 0 });
  }, [agents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your AI agents and monitor their performance
          </p>
        </div>

        <Button onClick={handleCreateAgent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Agent
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agents</p>
                <p className="text-3xl font-bold">{totalMetrics.totalAgents}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-3xl font-bold">{totalMetrics.totalExecutions.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold">₹{totalMetrics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold">{totalMetrics.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="executions">Executions</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAgents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'No agents match your current filters.'
                  : 'Get started by creating your first AI agent.'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={handleCreateAgent}>Create Your First Agent</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                      <Badge className={`${getStatusColor(agent.status)} flex items-center gap-1`}>
                        {getStatusIcon(agent.status)}
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </Badge>
                      {agent.configuration.malayalamSupport.enabled && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Malayalam
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{agent.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Executions</p>
                        <p className="font-semibold">{agent.metrics.totalExecutions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Success Rate</p>
                        <p className="font-semibold">{agent.metrics.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-semibold">₹{agent.metrics.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{agent.metrics.userRating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Version</p>
                        <p className="font-semibold">{agent.version}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Updated {new Date(agent.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAgent(agent)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agent Actions</DialogTitle>
                          <DialogDescription>
                            Choose an action for {agent.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleDuplicateAgent(agent)}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate Agent
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {/* TODO: Export agent */ }}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Agent
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create New AI Agent</DialogTitle>
            <DialogDescription>
              Build a new AI agent for the Malayalam AI ecosystem
            </DialogDescription>
          </DialogHeader>
          <AIAgentBuilder
            mode="create"
            onSave={(agent) => {
              setAgents(prev => [agent, ...prev]);
              setShowCreateDialog(false);
              toast({
                title: "Success!",
                description: "New AI Agent created successfully",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit AI Agent</DialogTitle>
            <DialogDescription>
              Update your AI agent configuration and settings
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <AIAgentBuilder
              agentId={selectedAgent.id}
              mode="edit"
              onSave={(agent) => {
                setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
                setShowEditDialog(false);
                setSelectedAgent(null);
                toast({
                  title: "Success!",
                  description: "AI Agent updated successfully",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}