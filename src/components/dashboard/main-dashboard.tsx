'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Mic,
  CreditCard,
  Receipt,
  UserCheck,
  Server,
  Network,
  Router
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
import { useMockData, mockDataGenerators } from '@/hooks/use-mock-data';
import { useUser, UserRole } from '@/hooks/use-user';

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
  const { user } = useUser();
  const { isDemoMode } = useMockData();
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

  // Get role-specific navigation tabs
  const getNavigationTabs = (role: UserRole) => {
    const baseTabs = [
      {
        id: 'overview',
        name: 'Overview',
        icon: BarChart3,
        description: 'System overview and key metrics'
      }
    ];

    switch (role) {
      case 'client_admin':
        return [
          ...baseTabs,
          {
            id: 'billing',
            name: 'Billing & Usage',
            icon: CreditCard,
            description: 'Subscription management and billing'
          },
          {
            id: 'ivr',
            name: 'IVR Management',
            icon: PhoneCall,
            description: 'Interactive Voice Response configuration'
          },
          {
            id: 'analytics',
            name: 'Analytics',
            icon: TrendingUp,
            description: 'Usage analytics and insights'
          }
        ];

      case 'fairgo_admin':
        return [
          ...baseTabs,
          {
            id: 'training',
            name: 'Training Hub',
            icon: UserCheck,
            description: 'Operator training and SOP management'
          },
          {
            id: 'clients',
            name: 'Client Management',
            icon: Users,
            description: 'Manage client accounts and subscriptions'
          },
          {
            id: 'operations',
            name: 'Operations',
            icon: Settings,
            description: 'Operational oversight and management'
          },
          {
            id: 'analytics',
            name: 'Analytics',
            icon: TrendingUp,
            description: 'Advanced analytics and insights'
          }
        ];

      case 'sysadmin':
        return [
          ...baseTabs,
          {
            id: 'telephony',
            name: 'Telephony Gateway',
            icon: Router,
            description: 'SIP trunk and call routing management'
          },
          {
            id: 'infrastructure',
            name: 'Infrastructure',
            icon: Server,
            description: 'System infrastructure monitoring'
          },
          {
            id: 'tenants',
            name: 'Tenant Billing',
            icon: Database,
            description: 'Multi-tenant billing management'
          },
          {
            id: 'monitoring',
            name: 'System Monitor',
            icon: Activity,
            description: 'Real-time system health'
          }
        ];

      default:
        return baseTabs;
    }
  };

  const navigationTabs = getNavigationTabs(user?.role || 'client_admin');

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

  const renderClientAdminOverview = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-lg p-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to FairGo AI IVR</h1>
          <p className="text-xl mb-6 opacity-90">
            Manage your AI-powered dispatch operations with advanced voice automation and real-time insights
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              Professional Plan
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              Active
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              99.9% Uptime
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
                <p className="text-sm font-medium text-blue-700">Calls This Month</p>
                {loading ? (
                  <div className="h-9 w-20 bg-blue-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-900">{stats.totalCalls.toLocaleString()}</p>
                )}
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {loading ? 'Loading...' : '+12% from last month'}
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
                <p className="text-sm font-medium text-green-700">Active Operators</p>
                {loading ? (
                  <div className="h-9 w-16 bg-green-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-900">{stats.activeAgents}</p>
                )}
                <p className="text-xs text-green-600">
                  {loading ? 'Loading...' : 'Out of 25 licensed'}
                </p>
              </div>
              <Users className="h-10 w-10 text-green-600" />
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
                <p className="text-sm font-medium text-orange-700">Monthly Cost</p>
                {loading ? (
                  <div className="h-9 w-20 bg-orange-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-orange-900">₹9,999</p>
                )}
                <p className="text-xs text-orange-600">Next billing: Dec 15</p>
              </div>
              <CreditCard className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing & Usage Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Professional Plan</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="text-2xl font-bold">₹9,999/month</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Operators</span>
                  <span>18 / 25</span>
                </div>
                <Progress value={72} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Monthly Calls</span>
                  <span>7,250 / 10,000</span>
                </div>
                <Progress value={72.5} className="h-2" />
              </div>
              <Button className="w-full" variant="outline">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Nov 15, 2024</div>
                  <div className="text-sm text-gray-600">Professional Plan</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹9,999</div>
                  <Button size="sm" variant="ghost">Download</Button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Oct 15, 2024</div>
                  <div className="text-sm text-gray-600">Professional Plan</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹9,999</div>
                  <Button size="sm" variant="ghost">Download</Button>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFairGoAdminOverview = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white rounded-lg p-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">FairGo Operations Hub</h1>
          <p className="text-xl mb-6 opacity-90">
            Manage client operations, operator training, and system performance across all tenants
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              Operations Manager
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              50+ Active Clients
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              Training Hub
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
                <p className="text-sm font-medium text-blue-700">Total Clients</p>
                {loading ? (
                  <div className="h-9 w-16 bg-blue-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-900">52</p>
                )}
                <p className="text-xs text-blue-600">+3 this month</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Operators</p>
                {loading ? (
                  <div className="h-9 w-20 bg-green-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-900">1,247</p>
                )}
                <p className="text-xs text-green-600">Across all clients</p>
              </div>
              <UserCheck className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Training Sessions</p>
                {loading ? (
                  <div className="h-9 w-16 bg-purple-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-purple-900">89</p>
                )}
                <p className="text-xs text-purple-600">This week</p>
              </div>
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Monthly Revenue</p>
                {loading ? (
                  <div className="h-9 w-24 bg-orange-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-orange-900">₹4.2L</p>
                )}
                <p className="text-xs text-orange-600">+15% from last month</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Hub & Client Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6" />
              Training Hub Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Active Trainees</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed Sessions</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Score</span>
                <span className="font-medium">87%</span>
              </div>
              <Button className="w-full">
                Access Training Hub
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Client Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Active Subscriptions</span>
                <span className="font-medium">48</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending Onboarding</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Support Tickets</span>
                <span className="font-medium">12</span>
              </div>
              <Button className="w-full" variant="outline">
                Manage Clients
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSysAdminOverview = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white rounded-lg p-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">System Administration</h1>
          <p className="text-xl mb-6 opacity-90">
            Monitor infrastructure, manage telephony gateway, and oversee system operations
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              SysAdmin
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              Infrastructure
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
              Telephony Gateway
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
                <p className="text-sm font-medium text-blue-700">Active Calls</p>
                {loading ? (
                  <div className="h-9 w-16 bg-blue-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-900">{stats.activeCalls}</p>
                )}
                <p className="text-xs text-blue-600">Across all trunks</p>
              </div>
              <PhoneCall className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">SIP Trunks</p>
                {loading ? (
                  <div className="h-9 w-12 bg-green-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-900">8/8</p>
                )}
                <p className="text-xs text-green-600">All operational</p>
              </div>
              <Router className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">System Load</p>
                {loading ? (
                  <div className="h-9 w-12 bg-purple-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-purple-900">67%</p>
                )}
                <p className="text-xs text-purple-600">Normal range</p>
              </div>
              <Server className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Revenue</p>
                {loading ? (
                  <div className="h-9 w-20 bg-orange-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold text-orange-900">₹4.2L</p>
                )}
                <p className="text-xs text-orange-600">Monthly recurring</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Telephony Gateway & Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Router className="h-6 w-6" />
              Telephony Gateway Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Jio SIP Trunk 1</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Jio SIP Trunk 2</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>FreeSWITCH Cluster</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Call Routing Engine</span>
                <Badge variant="default">Active</Badge>
              </div>
              <Button className="w-full">
                Telephony Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-6 w-6" />
              Infrastructure Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Application Servers</span>
                <Badge variant="default">3/3 Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Database Cluster</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Load Balancers</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>CDN Status</span>
                <Badge variant="default">Optimal</Badge>
              </div>
              <Button className="w-full" variant="outline">
                Infrastructure Monitor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOverview = () => {
    if (!user) return null;

    switch (user.role) {
      case 'client_admin':
        return renderClientAdminOverview();
      case 'fairgo_admin':
        return renderFairGoAdminOverview();
      case 'sysadmin':
        return renderSysAdminOverview();
      default:
        return renderClientAdminOverview();
    }
  };

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

        {/* Role Switcher (Demo) */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Demo Role Switcher
            </label>
            <Select
              value={user?.role || 'client_admin'}
              onValueChange={(value: UserRole) => {
                // Dispatch custom event to switch role
                const event = new CustomEvent('switch-user-role', { detail: { role: value } });
                window.dispatchEvent(event);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {user?.role === 'client_admin' && 'Client Admin'}
                  {user?.role === 'fairgo_admin' && 'FairGo Admin'}
                  {user?.role === 'sysadmin' && 'System Admin'}
                  {!user?.role && 'Client Admin'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_admin">Client Admin</SelectItem>
                <SelectItem value="fairgo_admin">FairGo Admin</SelectItem>
                <SelectItem value="sysadmin">System Admin</SelectItem>
              </SelectContent>
            </Select>
            {user && (
              <div className="text-xs text-gray-500">
                Logged in as: <span className="font-medium">{user.name}</span>
              </div>
            )}
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
                  } else if (tab.id === 'ivr') {
                    router.push('/ivr-management');
                  } else if (tab.id === 'training') {
                    router.push('/strategic-engines-demo');
                  } else if (tab.id === 'clients') {
                    router.push('/customers');
                  } else if (tab.id === 'operations') {
                    router.push('/workflows');
                  } else if (tab.id === 'telephony') {
                    router.push('/cpaas');
                  } else if (tab.id === 'infrastructure') {
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