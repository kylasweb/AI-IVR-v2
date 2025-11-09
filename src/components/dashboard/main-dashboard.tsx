'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Users,
  Phone,
  PhoneCall,
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
  Car,
  FileText,
  Mic
} from 'lucide-react';

// Import feature components
import WorkflowBuilder from '@/components/ivr/workflow-builder';
import IVRManagement from '@/components/ivr/ivr-management';
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard';
import AdvancedAnalyticsDashboard from '@/components/advanced-dashboard/advanced-analytics-dashboard';
import MalayalamIVRAnalytics from '@/components/analytics/malayalam-ivr-analytics';
import RideManagement from '@/components/management/ride-management';
import DriverManagement from '@/components/management/driver-management';
import CustomerManagement from '@/components/management/customer-management';
import AMDDashboard from '@/components/amd/amd-dashboard';
import AgentTemplates from '@/components/ai-agent/agent-templates';
import AITaskBuilder from '@/components/ai-agent/ai-task-builder';
import VoiceCloning from '@/components/voice-cloning/voice-cloning';
import VideoIVR from '@/components/video-ivr/video-ivr';

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    activeCalls: 0,
    totalAgents: 0,
    activeAgents: 0,
    workflows: 0,
    uptime: 0,
    satisfaction: 0,
    revenue: 0
  });

  const [health, setHealth] = useState<SystemHealth>({
    overall: 'healthy',
    services: []
  });

  // Fetch real-time dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard analytics
        const analyticsResponse = await fetch('/api/analytics/dashboard');
        const analyticsData = await analyticsResponse.json();

        // Fetch IVR stats
        const statsResponse = await fetch('/api/ivr/stats');
        const statsData = await statsResponse.json();

        if (analyticsData.success && analyticsData.analytics) {
          const analytics = analyticsData.analytics;

          setStats({
            totalCalls: analytics.totalCalls || statsData.total_calls || 0,
            activeCalls: analytics.realTimeStats?.currentActiveCalls || statsData.active_calls || 0,
            totalAgents: analytics.driverMetrics?.totalDrivers || 12,
            activeAgents: analytics.driverMetrics?.activeDrivers || 9,
            workflows: analytics.activeWorkflows || 8,
            uptime: 99.9, // This would come from system health API
            satisfaction: analytics.driverMetrics?.averageRating || 4.8,
            revenue: Math.floor(analytics.totalCalls * 22.5) || 0 // Estimated revenue
          });

          // Update system health based on real data
          setHealth({
            overall: analytics.realTimeStats?.systemLoad > 80 ? 'critical' :
              analytics.realTimeStats?.systemLoad > 60 ? 'warning' : 'healthy',
            services: [
              {
                name: 'Voice Processing',
                status: analytics.realTimeStats?.responseTime < 500 ? 'online' : 'degraded',
                uptime: 99.9
              },
              {
                name: 'AI Engine',
                status: analytics.amdDetection?.accuracyRate > 0.9 ? 'online' : 'degraded',
                uptime: analytics.amdDetection?.accuracyRate * 100 || 98.7
              },
              {
                name: 'Malayalam TTS',
                status: analytics.culturalIntelligence?.malayalamInteractions > 1000 ? 'online' : 'degraded',
                uptime: 99.5
              },
              {
                name: 'Manglish STT',
                status: analytics.culturalIntelligence?.manglishInteractions > 300 ? 'online' : 'degraded',
                uptime: 95.2
              },
              {
                name: 'Analytics',
                status: 'online',
                uptime: 99.8
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep default/fallback values on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const navigationTabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: BarChart3,
      description: 'System overview and key metrics'
    },
    {
      id: 'ivr',
      name: 'IVR Management',
      icon: PhoneCall,
      description: 'Interactive Voice Response configuration and management'
    },
    {
      id: 'workflows',
      name: 'Workflow Builder',
      icon: Workflow,
      description: 'Visual AI workflow management'
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
      id: 'agents',
      name: 'AI Agents',
      icon: Bot,
      description: 'AI agent management and training'
    },
    {
      id: 'agent-templates',
      name: 'Agent Templates',
      icon: FileText,
      description: 'Pre-built AI agent templates'
    },
    {
      id: 'task-builder',
      name: 'AI Task Builder',
      icon: Zap,
      description: 'Autonomous AI task automation'
    },
    {
      id: 'voice-cloning',
      name: 'Voice Cloning',
      icon: Mic,
      description: 'AI voice synthesis and cloning'
    },
    {
      id: 'video-ivr',
      name: 'Video IVR',
      icon: Video,
      description: 'Video-based IVR management'
    },
    {
      id: 'dispatcher',
      name: 'Dispatcher',
      icon: AudioLines,
      description: 'Real-time call management'
    },
    {
      id: 'call-management',
      name: 'Live Calls',
      icon: PhoneCall,
      description: 'Live call monitoring & control'
    },
    {
      id: 'amd',
      name: 'AMD System',
      icon: Brain,
      description: 'Answering Machine Detection with cultural intelligence'
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
            Enterprise-grade Vertical SaaS Platform designed for world's mobile-first, voice-first economy with advanced AI automation
          </p>
          <div className="flex flex-wrap gap-3 items-center">
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
            <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></div>
              <span>{loading ? 'Loading data...' : 'Live data • Updates every 30s'}</span>
            </div>
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
                {loading ? (
                  <div className="h-9 w-20 bg-blue-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-900">{stats.totalCalls.toLocaleString()}</p>
                )}
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {loading ? 'Loading...' : '+12% from yesterday'}
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
                {loading ? (
                  <div className="h-9 w-16 bg-green-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-900">{stats.activeAgents}/{stats.totalAgents}</p>
                )}
                <p className="text-xs text-green-600">
                  {loading ? 'Loading...' : 'All systems operational'}
                </p>
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
                {loading ? (
                  <div className="h-9 w-16 bg-purple-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-purple-900">{stats.uptime}%</p>
                )}
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
                {loading ? (
                  <div className="h-9 w-20 bg-orange-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-orange-900">₹{(stats.revenue / 1000).toFixed(0)}K</p>
                )}
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-gray-200 animate-pulse rounded-full"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* AI Agents Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            AI Agents Overview
          </CardTitle>
          <CardDescription>Malayalam-enabled AI agents and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAgents}</div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1.2K</div>
              <div className="text-sm text-gray-600">Daily Executions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">94%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-green-600" />
                <span className="font-medium">Malayalam Support</span>
              </div>
              <p className="text-sm text-gray-600">8 agents with native Malayalam capabilities</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium">AI Models</span>
              </div>
              <p className="text-sm text-gray-600">GPT-4, Claude, and local models integrated</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Performance</span>
              </div>
              <p className="text-sm text-gray-600">Average 1.8s response time</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setActiveTab('agents')} className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Manage AI Agents
            </Button>
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
              onClick={() => setActiveTab('ivr')}
            >
              <PhoneCall className="h-6 w-6" />
              Manage IVR
            </Button>
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
      case 'ivr':
        return <IVRManagement />;
      case 'rides':
        return <RideManagement />;
      case 'drivers':
        return <DriverManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'workflows':
        return <WorkflowBuilder />;
      case 'agent-templates':
        return <AgentTemplates />;
      case 'task-builder':
        return <AITaskBuilder />;
      case 'voice-cloning':
        return <VoiceCloning />;
      case 'video-ivr':
        return <VideoIVR />;
      case 'dispatcher':
        return <DispatcherDashboard />;
      case 'amd':
        return <AMDDashboard />;
      case 'analytics':
        return <MalayalamIVRAnalytics />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Vertical Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FairGo IMOS</h1>
              <p className="text-xs text-gray-600">Malayalam AI IVR</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  // Redirect to dedicated pages for features that have them
                  if (tab.id === 'call-management') {
                    router.push('/call-management');
                  } else if (tab.id === 'admin') {
                    router.push('/admin');
                  } else if (tab.id === 'agents') {
                    router.push('/ai-agents');
                  } else if (tab.id === 'monitoring') {
                    router.push('/monitoring');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                title={tab.description}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-gray-200">
          <Badge variant="outline" className="w-full text-green-700 border-green-300 justify-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            All Systems Online
          </Badge>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigationTabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">
                {navigationTabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></div>
                <span>{loading ? 'Loading data...' : 'Live data • Updates every 30s'}</span>
              </div>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>© 2024 FairGo IMOS - World's First Malayalam-Native AI IVR Platform</span>
            <div className="flex items-center gap-4">
              <Badge variant="outline">v2.0.0</Badge>
              <span>Powered by Advanced AI & ML</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}