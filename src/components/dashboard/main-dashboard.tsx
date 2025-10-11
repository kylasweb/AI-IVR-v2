'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Phone, 
  Settings, 
  BarChart3,
  Bot,
  GitBranch as Workflow,
  Shield,
  Globe,
  Zap,
  TrendingUp,
  Clock,
  Database,
  Phone as AudioLines,
  MessageSquare,
  Eye as Video,
  Phone as Smartphone,
  Brain,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Car
} from 'lucide-react';

// Import feature components
import WorkflowBuilder from '@/components/ivr/workflow-builder';
import { AdminDashboard } from '@/components/admin';
import { SystemMonitoring } from '@/components/admin';
import AIAgentDashboard from '@/components/ai-agent/ai-agent-dashboard';
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard';
import AdvancedAnalyticsDashboard from '@/components/advanced-dashboard/advanced-analytics-dashboard';
import MalayalamIVRAnalytics from '@/components/analytics/malayalam-ivr-analytics';
import RideManagement from '@/components/management/ride-management';
import DriverManagement from '@/components/management/driver-management';
import CustomerManagement from '@/components/management/customer-management';

interface DashboardStats {
  totalCalls: number;
  activeCalls: number;
  totalAgents: number;
  activeAgents: number;
  workflows: number;
  uptime: number;
  satisfaction: number;
  revenue: number;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    name: string;
    status: 'online' | 'offline' | 'degraded';
    uptime: number;
  }[];
}

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 12847,
    activeCalls: 23,
    totalAgents: 12,
    activeAgents: 9,
    workflows: 8,
    uptime: 99.9,
    satisfaction: 4.8,
    revenue: 285670
  });

  const [health, setHealth] = useState<SystemHealth>({
    overall: 'healthy',
    services: [
      { name: 'Voice Processing', status: 'online', uptime: 99.9 },
      { name: 'AI Engine', status: 'online', uptime: 98.7 },
      { name: 'Malayalam TTS', status: 'online', uptime: 99.5 },
      { name: 'Manglish STT', status: 'degraded', uptime: 95.2 },
      { name: 'Analytics', status: 'online', uptime: 99.8 }
    ]
  });

  const navigationTabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: BarChart3,
      description: 'System overview and key metrics'
    },
    {
      id: 'rides',
      name: 'Ride Management',
      icon: Car,
      description: 'Manage rides and bookings'
    },
    {
      id: 'drivers',
      name: 'Driver Management',
      icon: Users,
      description: 'Manage drivers and vehicles'
    },
    {
      id: 'customers',
      name: 'Customer Management',
      icon: Phone,
      description: 'Manage customers and loyalty'
    },
    {
      id: 'workflows',
      name: 'Workflow Builder',
      icon: Workflow,
      description: 'Visual AI workflow management'
    },
    {
      id: 'agents',
      name: 'AI Agents',
      icon: Bot,
      description: 'AI agent management and training'
    },
    {
      id: 'dispatcher',
      name: 'Dispatcher',
      icon: AudioLines,
      description: 'Real-time call management'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      description: 'Advanced analytics and insights'
    },
    {
      id: 'admin',
      name: 'Administration',
      icon: Settings,
      description: 'System administration'
    },
    {
      id: 'monitoring',
      name: 'System Monitor',
      icon: Activity,
      description: 'Real-time system health'
    }
  ];

  const featureCards = [
    {
      title: 'AI/ML Capabilities',
      features: ['Sentiment Analysis', 'Voice Biometrics', 'Predictive Analytics', 'Intent Scoring'],
      icon: Brain,
      status: 'active',
      color: 'bg-blue-500'
    },
    {
      title: 'Multi-Channel Support',
      features: ['WhatsApp', 'Facebook Messenger', 'SMS', 'Email'],
      icon: MessageSquare,
      status: 'active',
      color: 'bg-green-500'
    },
    {
      title: 'Security & Compliance',
      features: ['End-to-End Encryption', 'GDPR Compliance', 'RBAC', 'Audit Logging'],
      icon: Shield,
      status: 'active',
      color: 'bg-red-500'
    },
    {
      title: 'Global Deployment',
      features: ['Multi-Region', 'Disaster Recovery', 'CDN', 'Auto-Scaling'],
      icon: Globe,
      status: 'active',
      color: 'bg-purple-500'
    },
    {
      title: 'Mobile Applications',
      features: ['Native iOS', 'Native Android', 'React Native', 'Push Notifications'],
      icon: Smartphone,
      status: 'active',
      color: 'bg-orange-500'
    },
    {
      title: 'Video Integration',
      features: ['Video IVR', 'Screen Sharing', 'Video Analytics', 'Transcription'],
      icon: Video,
      status: 'active',
      color: 'bg-teal-500'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-lg p-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">World's First Malayalam-Native AI IVR Platform</h1>
          <p className="text-xl mb-6 opacity-90">
            Enterprise-grade Vertical SaaS Platform designed for Kerala's mobile-first, voice-first economy with advanced AI automation
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              മലയാളം Native
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              Manglish Support
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              69+ Features
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              Enterprise Ready
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Calls Today</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalCalls.toLocaleString()}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from yesterday
                </p>
              </div>
              <Phone className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active AI Agents</p>
                <p className="text-3xl font-bold text-green-900">{stats.activeAgents}/{stats.totalAgents}</p>
                <p className="text-xs text-green-600">All systems operational</p>
              </div>
              <Bot className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">System Uptime</p>
                <p className="text-3xl font-bold text-purple-900">{stats.uptime}%</p>
                <p className="text-xs text-purple-600">Last 30 days</p>
              </div>
              <Activity className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Revenue (₹)</p>
                <p className="text-3xl font-bold text-orange-900">₹{(stats.revenue/1000).toFixed(0)}K</p>
                <p className="text-xs text-orange-600">Monthly target: ₹500K</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            System Health Overview
          </CardTitle>
          <CardDescription>Real-time status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {health.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {service.status === 'online' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : service.status === 'degraded' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.uptime}% uptime</p>
                  </div>
                </div>
                <Badge variant={
                  service.status === 'online' ? 'default' : 
                  service.status === 'degraded' ? 'secondary' : 'destructive'
                }>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Advanced Features & Capabilities
          </CardTitle>
          <CardDescription>Enterprise-grade features powering your AI IVR platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${card.color} text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{card.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {card.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {card.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and system management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab('rides')}
            >
              <Car className="h-6 w-6" />
              Manage Rides
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab('drivers')}
            >
              <Users className="h-6 w-6" />
              Manage Drivers
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab('customers')}
            >
              <Phone className="h-6 w-6" />
              Manage Customers
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab('workflows')}
            >
              <Workflow className="h-6 w-6" />
              Create Workflow
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab('agents')}
            >
              <Bot className="h-6 w-6" />
              AI Agents
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              Analytics
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab('dispatcher')}
            >
              <AudioLines className="h-6 w-6" />
              Dispatcher
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab('admin')}
            >
              <Settings className="h-6 w-6" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rides':
        return <RideManagement />;
      case 'drivers':
        return <DriverManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'workflows':
        return <WorkflowBuilder />;
      case 'agents':
        return <AIAgentDashboard />;
      case 'dispatcher':
        return <DispatcherDashboard />;
      case 'analytics':
        return <MalayalamIVRAnalytics />;
      case 'admin':
        return <AdminDashboard />;
      case 'monitoring':
        return <SystemMonitoring />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FairGo IMOS</h1>
                <p className="text-sm text-gray-600">Malayalam AI IVR Platform</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-700 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>© 2024 FairGo IMOS - World's First Malayalam-Native AI IVR Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">v2.0.0</Badge>
            <span>Powered by Advanced AI & ML</span>
          </div>
        </div>
      </footer>
    </div>
  );
}