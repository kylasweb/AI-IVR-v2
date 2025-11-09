'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Plus,
  Users,
  TrendingUp,
  Zap,
  Brain,
  Globe,
  Star,
  Bot as TestTube,
  Settings,
  BarChart3,
  MessageSquare,
  Star as Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Star as DollarSign
} from 'lucide-react';
import AIAgentManagement from '@/components/ai-agent/ai-agent-management';
import AIAgentBuilder from '@/components/ai-agent/ai-agent-builder';
import AIAgentTester from '@/components/ai-agent/ai-agent-tester';

export default function AIAgentsPage() {
  const [activeView, setActiveView] = useState<'overview' | 'manage' | 'create' | 'test'>('overview');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const features = [
    {
      icon: Bot,
      title: 'Intelligent Agent Creation',
      description: 'Build sophisticated AI agents with Malayalam language support and cultural awareness',
      color: 'text-blue-600'
    },
    {
      icon: Globe,
      title: 'Malayalam Language Support',
      description: 'Native support for Malayalam script, dialects, and cultural context understanding',
      color: 'text-green-600'
    },
    {
      icon: Brain,
      title: 'Advanced AI Models',
      description: 'Integration with GPT-4, Claude, and other state-of-the-art language models',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Optimized for low latency and high throughput with real-time processing',
      color: 'text-orange-600'
    },
    {
      icon: TestTube,
      title: 'Comprehensive Testing',
      description: 'Interactive testing, batch processing, and performance analytics built-in',
      color: 'text-pink-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Detailed metrics, user feedback analysis, and performance optimization',
      color: 'text-indigo-600'
    }
  ];

  const useCases = [
    {
      title: 'Customer Support',
      description: 'Intelligent customer service with Malayalam language support',
      icon: MessageSquare,
      examples: ['Order inquiries', 'Technical support', 'Complaint handling']
    },
    {
      title: 'Kerala Tourism',
      description: 'Travel assistant with local cultural knowledge',
      icon: Globe,
      examples: ['Destination recommendations', 'Cultural guidance', 'Local experiences']
    },
    {
      title: 'Content Creation',
      description: 'Generate engaging Malayalam content for social media',
      icon: Sparkles,
      examples: ['Social posts', 'Marketing copy', 'Cultural content']
    },
    {
      title: 'Education',
      description: 'Interactive Malayalam language and culture tutoring',
      icon: Brain,
      examples: ['Language learning', 'Cultural studies', 'Literature analysis']
    }
  ];

  const stats = [
    { label: 'Active Agents', value: '24', icon: Bot, color: 'text-blue-600' },
    { label: 'Total Executions', value: '12.5K', icon: Zap, color: 'text-green-600' },
    { label: 'Success Rate', value: '94.2%', icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Avg Response', value: '1.8s', icon: Clock, color: 'text-orange-600' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Agent Builder
            <Badge className="ml-3 bg-green-100 text-green-800">Malayalam Support</Badge>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build intelligent AI agents for the Malayalam-speaking community with cultural awareness and local context understanding
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setActiveView('create')} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Agent
            </Button>
            <Button size="lg" variant="outline" onClick={() => setActiveView('manage')} className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Agents
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Key Features
          </CardTitle>
          <CardDescription>
            Powerful capabilities designed for the Malayalam AI ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <feature.icon className={`h-6 w-6 ${feature.color} flex-shrink-0`} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Popular Use Cases
          </CardTitle>
          <CardDescription>
            Discover how AI agents are transforming Malayalam digital experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <useCase.icon className="h-6 w-6 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">{useCase.title}</h4>
                </div>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.examples.map((example, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Build your first AI agent in just a few minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Choose Template</h4>
              <p className="text-sm text-gray-600">Start with a pre-built template or create from scratch</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Configure Agent</h4>
              <p className="text-sm text-gray-600">Set persona, capabilities, and Malayalam language settings</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Test & Deploy</h4>
              <p className="text-sm text-gray-600">Test your agent and make it available to users</p>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <Button onClick={() => setActiveView('create')} className="flex items-center gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Join our growing community of Malayalam AI developers and creators
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>🚀 500+ Developers</span>
              <span>🤖 1,200+ Agents</span>
              <span>💬 Malayalam Support</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Enterprise Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Scale your AI agents with enterprise-grade security and performance
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>🔒 SOC2 Compliant</span>
              <span>📊 SLA Guarantees</span>
              <span>🛠️ 24/7 Support</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <ManagementLayout>
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600" />
              AI Agents
            </h1>
            <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="manage">Manage</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeView === 'overview' && renderOverview()}

          {activeView === 'manage' && (
            <div className="p-6">
              <AIAgentManagement
                onCreateAgent={() => setActiveView('create')}
                onEditAgent={(agentId) => {
                  setSelectedAgentId(agentId);
                  // Edit functionality is handled within the management component
                }}
              />
            </div>
          )}

          {activeView === 'create' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Create New AI Agent</h2>
                <p className="text-gray-600">
                  Build a new AI agent with Malayalam language support and cultural awareness
                </p>
              </div>
              <AIAgentBuilder
                mode="create"
                onSave={(agent) => {
                  setActiveView('manage');
                  // Handle save success
                }}
              />
            </div>
          )}

          {activeView === 'test' && (
            <div className="p-6">
              <AIAgentTester
                agentId={selectedAgentId || undefined}
                onClose={() => setActiveView('manage')}
              />
            </div>
          )}
        </div>
      </div>
    </ManagementLayout>
  );
}