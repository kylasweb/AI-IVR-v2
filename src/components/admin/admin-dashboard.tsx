'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Users,
  Globe,
  Activity,
  FileText,
  Shield,
  Activity as Monitor,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Phone,
  MessageSquare,
  TrendingUp,
  Clock,
  Activity as Gauge,
  Database as HardDrive,
  Database as Memory
} from 'lucide-react';

// Import admin components
import SystemSettings from './system-settings';
import UserManagement from './user-management';
import IntegrationManagement from './integration-management';
import SystemMonitoring from './system-monitoring';
import LogManagement from './log-management';
import MockDataManager from './mock-data-manager';

interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  callsToday: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  activeIntegrations: number;
  errorRate: number;
  avgResponseTime: number;
  uptime: number;
}

type AdminTab = 'overview' | 'settings' | 'users' | 'integrations' | 'monitoring' | 'logs' | 'mock-data';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats] = useState<DashboardStats>({
    totalUsers: 1247,
    activeSessions: 34,
    callsToday: 892,
    systemHealth: 'healthy',
    activeIntegrations: 6,
    errorRate: 0.2,
    avgResponseTime: 245,
    uptime: 99.9
  });

  const navigationItems = [
    {
      id: 'overview' as AdminTab,
      name: 'Overview',
      icon: BarChart3,
      description: 'System overview and key metrics'
    },
    {
      id: 'settings' as AdminTab,
      name: 'System Settings',
      icon: Settings,
      description: 'Configure system parameters'
    },
    {
      id: 'users' as AdminTab,
      name: 'User Management',
      icon: Users,
      description: 'Manage users and permissions'
    },
    {
      id: 'integrations' as AdminTab,
      name: 'Integrations',
      icon: Globe,
      description: 'External services and APIs'
    },
    {
      id: 'monitoring' as AdminTab,
      name: 'System Monitor',
      icon: Activity,
      description: 'Real-time system health'
    },
    {
      id: 'logs' as AdminTab,
      name: 'Log Management',
      icon: FileText,
      description: 'System logs and debugging'
    },
    {
      id: 'mock-data' as AdminTab,
      name: 'Mock Data Manager',
      icon: Database,
      description: 'Manage demo data and scenarios'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SystemSettings />;
      case 'users':
        return <UserManagement />;
      case 'integrations':
        return <IntegrationManagement />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'logs':
        return <LogManagement />;
      case 'mock-data':
        return <MockDataManager />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Complete system administration and management
        </p>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-xl font-bold text-green-600">Healthy</span>
                </div>
              </div>
              <Monitor className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stats.activeSessions} active sessions</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calls Today</p>
                <p className="text-2xl font-bold">{stats.callsToday.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from yesterday
                </p>
              </div>
              <Phone className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">{stats.uptime}%</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and system management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navigationItems.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold">{item.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">CPU Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/3 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">32%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Memory className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Memory Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-3/5 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">58%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Disk Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-4/5 h-2 bg-yellow-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Database Connections</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">25/50</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Google Gemini AI', status: 'connected', responseTime: '120ms' },
                { name: 'Speech-to-Text Service', status: 'connected', responseTime: '89ms' },
                { name: 'Text-to-Speech Service', status: 'connected', responseTime: '156ms' },
                { name: 'SMS Gateway', status: 'disconnected', responseTime: '-' },
                { name: 'Webhook Processor', status: 'connected', responseTime: '67ms' },
                { name: 'Analytics API', status: 'warning', responseTime: '892ms' }
              ].map((integration, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : integration.status === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">{integration.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      integration.status === 'connected' ? 'default' :
                        integration.status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {integration.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{integration.responseTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                time: '2 minutes ago',
                event: 'New user registration completed',
                type: 'info',
                details: 'User ID: user_892456'
              },
              {
                time: '5 minutes ago',
                event: 'System backup completed successfully',
                type: 'success',
                details: 'Size: 2.4 GB, Duration: 3m 21s'
              },
              {
                time: '12 minutes ago',
                event: 'High memory usage detected',
                type: 'warning',
                details: 'Memory usage exceeded 85% threshold'
              },
              {
                time: '18 minutes ago',
                event: 'Integration test completed',
                type: 'info',
                details: 'All 6 integrations responding normally'
              },
              {
                time: '25 minutes ago',
                event: 'Database optimization task started',
                type: 'info',
                details: 'Optimizing table indexes and queries'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-l-blue-200 bg-blue-50 rounded-r">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-600' :
                  activity.type === 'warning' ? 'bg-yellow-600' :
                    activity.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                  }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.event}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-600">FairGo IMOS System</p>
          </div>
          <nav className="mt-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600' : 'text-gray-700'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}