import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Database as Server,
  Globe as Wifi,
  Activity as Cpu,
  Database as MemoryStick,
  Database as HardDrive,
  Users,
  TrendingUp,
  TrendingUp as TrendingDown,
  RefreshCw,
  Settings,
  AlertCircle as Bell,
  Globe,
  Zap,
  Shield,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Types
interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  endpoint: string;
  details?: Record<string, any>;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
  };
}

interface PhaseStatus {
  phase: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  culturalAiStatus: 'active' | 'inactive' | 'degraded';
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  service?: string;
}

const SystemHealthMonitoring: React.FC = () => {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [phaseStatuses, setPhaseStatuses] = useState<PhaseStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemHealth();
    
    // Set up auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadSystemHealth, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      
      // Load all health data in parallel
      const [servicesData, metricsData, phasesData, alertsData] = await Promise.all([
        fetchServices(),
        fetchSystemMetrics(),
        fetchPhaseStatuses(),
        fetchAlerts(),
      ]);
      
      setServices(servicesData);
      setSystemMetrics(metricsData);
      setPhaseStatuses(phasesData);
      setAlerts(alertsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (): Promise<ServiceHealth[]> => {
    // Mock data - in production, this would fetch from actual monitoring APIs
    return [
      {
        name: 'Saksham Backend API',
        status: 'healthy',
        responseTime: 145,
        uptime: 99.95,
        lastCheck: new Date(Date.now() - 30000).toISOString(),
        endpoint: '/health',
        details: {
          version: '2.0.0',
          database: 'connected',
          redis: 'connected',
          aiServices: 'operational'
        }
      },
      {
        name: 'Frontend Application',
        status: 'healthy',
        responseTime: 85,
        uptime: 99.98,
        lastCheck: new Date(Date.now() - 45000).toISOString(),
        endpoint: '/api/health',
        details: {
          version: '2.0.0',
          buildStatus: 'success'
        }
      },
      {
        name: 'PostgreSQL Database',
        status: 'healthy',
        responseTime: 12,
        uptime: 99.99,
        lastCheck: new Date(Date.now() - 20000).toISOString(),
        endpoint: '/health/db',
        details: {
          connections: 15,
          maxConnections: 100,
          queryTime: 8.5
        }
      },
      {
        name: 'Redis Cache',
        status: 'healthy',
        responseTime: 5,
        uptime: 99.97,
        lastCheck: new Date(Date.now() - 25000).toISOString(),
        endpoint: '/health/redis',
        details: {
          memory: '156MB',
          maxMemory: '512MB',
          connectedClients: 8
        }
      },
      {
        name: 'Malayalam AI Services',
        status: 'healthy',
        responseTime: 320,
        uptime: 99.85,
        lastCheck: new Date(Date.now() - 35000).toISOString(),
        endpoint: '/health/ai',
        details: {
          sttService: 'operational',
          ttsService: 'operational',
          culturalAi: 'operational'
        }
      },
      {
        name: 'Translation Services',
        status: 'degraded',
        responseTime: 850,
        uptime: 98.75,
        lastCheck: new Date(Date.now() - 15000).toISOString(),
        endpoint: '/health/translation',
        details: {
          googleTranslate: 'operational',
          microsoftTranslator: 'degraded',
          awsTranslate: 'operational'
        }
      }
    ];
  };

  const fetchSystemMetrics = async (): Promise<SystemMetrics> => {
    // Mock metrics - in production, this would come from system monitoring
    return {
      cpu: {
        usage: 45.7,
        cores: 4,
        load: [1.2, 1.8, 2.1]
      },
      memory: {
        used: 3.2,
        total: 8.0,
        percentage: 40
      },
      disk: {
        used: 45.8,
        total: 100.0,
        percentage: 45.8
      },
      network: {
        inbound: 2.5, // MB/s
        outbound: 1.8  // MB/s
      }
    };
  };

  const fetchPhaseStatuses = async (): Promise<PhaseStatus[]> => {
    return [
      {
        phase: '1',
        name: 'Cloud Call Recording & Transcription',
        status: 'operational',
        activeUsers: 45,
        requestsPerMinute: 156,
        errorRate: 0.2,
        avgResponseTime: 285,
        culturalAiStatus: 'active'
      },
      {
        phase: '2',
        name: 'Audio Conferencing & Live Transcription',
        status: 'operational',
        activeUsers: 23,
        requestsPerMinute: 87,
        errorRate: 0.1,
        avgResponseTime: 195,
        culturalAiStatus: 'active'
      },
      {
        phase: '3',
        name: 'AMD (Answering Machine Detection)',
        status: 'operational',
        activeUsers: 12,
        requestsPerMinute: 34,
        errorRate: 0.5,
        avgResponseTime: 420,
        culturalAiStatus: 'active'
      },
      {
        phase: '4',
        name: 'Live Translation R&D Partnership',
        status: 'degraded',
        activeUsers: 8,
        requestsPerMinute: 23,
        errorRate: 2.1,
        avgResponseTime: 750,
        culturalAiStatus: 'degraded'
      }
    ];
  };

  const fetchAlerts = async (): Promise<Alert[]> => {
    return [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'Translation Service Degraded Performance',
        description: 'Microsoft Translator API showing increased response times (850ms avg)',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        acknowledged: false,
        service: 'Translation Services'
      },
      {
        id: 'alert-2',
        type: 'error',
        title: 'Phase 4 Error Rate Elevated',
        description: 'Live Translation error rate at 2.1%, above threshold of 1%',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        acknowledged: false,
        service: 'Phase 4'
      },
      {
        id: 'alert-3',
        type: 'info',
        title: 'Scheduled Maintenance Completed',
        description: 'Database maintenance window completed successfully',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledged: true,
        service: 'PostgreSQL Database'
      }
    ];
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'down':
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Settings className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down':
      case 'inactive':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatFileSize = (gb: number) => {
    return `${gb.toFixed(1)} GB`;
  };

  const formatNetworkSpeed = (mbps: number) => {
    return `${mbps.toFixed(1)} MB/s`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitoring</h2>
          <p className="text-gray-600">
            Project Saksham - Real-time system status and performance metrics
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-600' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button onClick={loadSystemHealth}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Overall Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">88</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requests/Min</p>
                <p className="text-2xl font-bold">300</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">285ms</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Status</CardTitle>
              <CardDescription>Real-time status of all system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.endpoint}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Response Time:</span>
                        <p className="font-medium">{service.responseTime}ms</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Uptime:</span>
                        <p className="font-medium">{formatUptime(service.uptime)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Check:</span>
                        <p className="font-medium">
                          {new Date(service.lastCheck).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-medium capitalize">{service.status}</p>
                      </div>
                    </div>

                    {service.details && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium text-gray-600 mb-2">Details:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          {Object.entries(service.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-500">{key}:</span>
                              <span className="ml-1 font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phase Status Overview</CardTitle>
              <CardDescription>Performance metrics for all 4 platform phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {phaseStatuses.map((phase) => (
                  <div key={phase.phase} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(phase.status)}
                        <div>
                          <h3 className="font-medium">Phase {phase.phase}: {phase.name}</h3>
                          <p className="text-sm text-gray-600">
                            Cultural AI: {phase.culturalAiStatus}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(phase.status)}>
                        {phase.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Users className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-sm text-gray-600">Active Users</span>
                        </div>
                        <p className="text-lg font-bold">{phase.activeUsers}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Activity className="w-4 h-4 text-purple-500 mr-1" />
                          <span className="text-sm text-gray-600">Requests/Min</span>
                        </div>
                        <p className="text-lg font-bold">{phase.requestsPerMinute}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm text-gray-600">Error Rate</span>
                        </div>
                        <p className="text-lg font-bold">{phase.errorRate}%</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-600">Avg Response</span>
                        </div>
                        <p className="text-lg font-bold">{phase.avgResponseTime}ms</p>
                      </div>
                    </div>

                    {/* Cultural AI Status */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Malayalam Cultural Intelligence
                        </span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(phase.culturalAiStatus)}
                          <span className="text-sm capitalize">{phase.culturalAiStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5" />
                  <span>CPU Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Usage</span>
                      <span className="font-medium">{systemMetrics.cpu.usage}%</span>
                    </div>
                    <Progress value={systemMetrics.cpu.usage} className="w-full" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cores:</span>
                        <span className="ml-1 font-medium">{systemMetrics.cpu.cores}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Load Avg:</span>
                        <span className="ml-1 font-medium">
                          {systemMetrics.cpu.load.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MemoryStick className="w-5 h-5" />
                  <span>Memory Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Memory Used</span>
                      <span className="font-medium">
                        {formatFileSize(systemMetrics.memory.used)} / {formatFileSize(systemMetrics.memory.total)}
                      </span>
                    </div>
                    <Progress value={systemMetrics.memory.percentage} className="w-full" />
                    
                    <div className="text-sm text-gray-600">
                      {systemMetrics.memory.percentage}% of total memory
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5" />
                  <span>Disk Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Disk Used</span>
                      <span className="font-medium">
                        {formatFileSize(systemMetrics.disk.used)} / {formatFileSize(systemMetrics.disk.total)}
                      </span>
                    </div>
                    <Progress value={systemMetrics.disk.percentage} className="w-full" />
                    
                    <div className="text-sm text-gray-600">
                      {systemMetrics.disk.percentage}% of total disk space
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5" />
                  <span>Network Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemMetrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingDown className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-sm text-gray-600">Inbound</span>
                        </div>
                        <p className="font-medium">{formatNetworkSpeed(systemMetrics.network.inbound)}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-gray-600">Outbound</span>
                        </div>
                        <p className="font-medium">{formatNetworkSpeed(systemMetrics.network.outbound)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>System Alerts</span>
              </CardTitle>
              <CardDescription>
                Recent alerts and notifications from system monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert 
                    key={alert.id}
                    className={`${
                      alert.type === 'error' ? 'border-red-200 bg-red-50' :
                      alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    } ${alert.acknowledged ? 'opacity-60' : ''}`}
                  >
                    {alert.type === 'error' ? (
                      <XCircle className="h-4 w-4" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <AlertTitle className="flex items-center justify-between">
                      <span>{alert.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </AlertTitle>
                    <AlertDescription>
                      {alert.description}
                      {alert.service && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.service}
                          </Badge>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}

                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No alerts at this time</p>
                    <p className="text-sm">System is running smoothly</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthMonitoring;