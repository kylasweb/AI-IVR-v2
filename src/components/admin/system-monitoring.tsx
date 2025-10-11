'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Activity as Monitor, 
  Database, 
  Activity as Gauge, 
  Database as HardDisk, 
  Database as HardDrive, 
  Globe as Network, 
  Users, 
  Phone,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ChevronDown as ArrowDown,
  Settings as Minus2,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  url?: string;
}

interface CallMetrics {
  totalCalls: number;
  activeCalls: number;
  completedCalls: number;
  failedCalls: number;
  avgCallDuration: number;
  avgWaitTime: number;
}

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [callMetrics, setCallMetrics] = useState<CallMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchSystemData();
      }, parseInt(refreshInterval) * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: Math.random() * 100,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'healthy',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdated: new Date()
        },
        {
          name: 'Memory Usage',
          value: Math.random() * 100,
          unit: '%',
          status: Math.random() > 0.9 ? 'critical' : 'healthy',
          trend: 'stable',
          lastUpdated: new Date()
        },
        {
          name: 'Disk Usage',
          value: Math.random() * 100,
          unit: '%',
          status: 'healthy',
          trend: 'up',
          lastUpdated: new Date()
        },
        {
          name: 'Network I/O',
          value: Math.random() * 1000,
          unit: 'MB/s',
          status: 'healthy',
          trend: 'stable',
          lastUpdated: new Date()
        },
        {
          name: 'Active Connections',
          value: Math.floor(Math.random() * 500),
          unit: 'connections',
          status: 'healthy',
          trend: 'up',
          lastUpdated: new Date()
        },
        {
          name: 'Response Time',
          value: Math.random() * 1000,
          unit: 'ms',
          status: Math.random() > 0.7 ? 'warning' : 'healthy',
          trend: 'down',
          lastUpdated: new Date()
        }
      ];

      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Memory usage has exceeded 85% for the last 10 minutes',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          acknowledged: false
        },
        {
          id: '2',
          type: 'info',
          title: 'System Backup Completed',
          message: 'Daily backup completed successfully at 2:00 AM',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          acknowledged: true
        },
        {
          id: '3',
          type: 'error',
          title: 'Database Connection Failed',
          message: 'Failed to connect to secondary database server',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          acknowledged: false
        }
      ];

      const mockServices: ServiceStatus[] = [
        {
          name: 'AI Voice Agent',
          status: 'online',
          uptime: 99.9,
          responseTime: Math.random() * 200 + 100,
          lastCheck: new Date(),
          url: '/api/ivr/health'
        },
        {
          name: 'Speech-to-Text Service',
          status: 'online',
          uptime: 98.5,
          responseTime: Math.random() * 300 + 200,
          lastCheck: new Date()
        },
        {
          name: 'Text-to-Speech Service',
          status: 'online',
          uptime: 99.2,
          responseTime: Math.random() * 250 + 150,
          lastCheck: new Date()
        },
        {
          name: 'NLP Processing Service',
          status: 'degraded',
          uptime: 95.8,
          responseTime: Math.random() * 500 + 300,
          lastCheck: new Date()
        },
        {
          name: 'Database Connection',
          status: 'online',
          uptime: 99.99,
          responseTime: Math.random() * 50 + 10,
          lastCheck: new Date()
        },
        {
          name: 'External API Gateway',
          status: 'online',
          uptime: 97.3,
          responseTime: Math.random() * 400 + 200,
          lastCheck: new Date()
        }
      ];

      const mockCallMetrics: CallMetrics = {
        totalCalls: Math.floor(Math.random() * 1000) + 2500,
        activeCalls: Math.floor(Math.random() * 50) + 5,
        completedCalls: Math.floor(Math.random() * 900) + 2200,
        failedCalls: Math.floor(Math.random() * 50) + 10,
        avgCallDuration: Math.floor(Math.random() * 300) + 120,
        avgWaitTime: Math.floor(Math.random() * 30) + 5
      };

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setServices(mockServices);
      setCallMetrics(mockCallMetrics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system monitoring data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'offline':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Minus2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <Badge variant="default">Healthy</Badge>;
      case 'degraded':
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'offline':
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-green-500" />;
      default:
        return <Minus2 className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading && metrics.length === 0) {
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
            <Activity className="h-8 w-8" />
            System Monitoring
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Auto-refresh:</span>
            <Select
              value={refreshInterval}
              onValueChange={setRefreshInterval}
              disabled={!autoRefresh}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
                <SelectItem value="300">5m</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Stop' : 'Start'}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemData}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-green-600">Operational</p>
                <p className="text-xs text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</p>
              </div>
              <Monitor className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => !a.acknowledged && a.type !== 'info').length}
                </p>
                <p className="text-xs text-gray-500">Requires attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Services Online</p>
                <p className="text-2xl font-bold text-blue-600">
                  {services.filter(s => s.status === 'online').length}/{services.length}
                </p>
                <p className="text-xs text-gray-500">All critical services</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{metric.name}</h3>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">
                    {metric.unit === '%' ? Math.round(metric.value) : metric.value.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">{metric.unit}</span>
                </div>
                
                {metric.unit === '%' && (
                  <Progress
                    value={metric.value}
                    className={`h-2 ${
                      metric.status === 'critical' ? 'bg-red-100' : 
                      metric.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}
                  />
                )}
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{getStatusBadge(metric.status)}</span>
                  <span>{metric.lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Metrics */}
        {callMetrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call Center Metrics
              </CardTitle>
              <CardDescription>Real-time call handling statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Total Calls Today</p>
                  <p className="text-2xl font-bold">{callMetrics.totalCalls.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Active Calls</p>
                  <p className="text-2xl font-bold text-green-600">{callMetrics.activeCalls}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{callMetrics.completedCalls.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{callMetrics.failedCalls}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Avg Duration</p>
                  <p className="text-lg font-semibold">{formatDuration(callMetrics.avgCallDuration)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Avg Wait Time</p>
                  <p className="text-lg font-semibold">{callMetrics.avgWaitTime}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Service Health
            </CardTitle>
            <CardDescription>Status of critical system services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-semibold text-sm">{service.name}</p>
                      <p className="text-xs text-gray-600">
                        Uptime: {formatUptime(service.uptime)} | Response: {Math.round(service.responseTime)}ms
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Alerts
          </CardTitle>
          <CardDescription>Recent system notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={`${
                  alert.type === 'error' ? 'border-red-200 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {alert.type === 'error' ? (
                        <XCircle className="h-4 w-4 text-red-600 mt-1" />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-1" />
                      )}
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <AlertDescription className="text-sm">
                          {alert.message}
                        </AlertDescription>
                        <p className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.acknowledged && (
                        <Badge variant="outline" className="text-xs">Acknowledged</Badge>
                      )}
                      {!alert.acknowledged && alert.type !== 'info' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}