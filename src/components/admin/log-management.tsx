'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Database,
  Activity,
  Settings,
  Eye,
  Play,
  Settings as Square
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  duration?: number;
}

interface LogFilter {
  level?: string;
  source?: string;
  dateRange?: { from: Date; to: Date };
  search?: string;
  userId?: string;
}

export default function LogManagement() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  const [filters, setFilters] = useState<LogFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const logSources = [
    'ivr-backend',
    'speech-to-text',
    'text-to-speech',
    'nlp-service',
    'conversation-manager',
    'database',
    'api-gateway',
    'auth-service',
    'webhook-handler'
  ];

  const logLevels = ['debug', 'info', 'warn', 'error'];

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters, searchTerm]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (realTimeEnabled) {
      interval = setInterval(() => {
        fetchNewLogs();
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeEnabled]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API calls
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          level: 'info',
          source: 'ivr-backend',
          message: 'New call session initiated successfully',
          userId: 'user_123',
          sessionId: 'session_abc123',
          metadata: {
            callId: 'call_456',
            phoneNumber: '+91XXXXXXXXXX',
            language: 'malayalam'
          },
          duration: 150
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          level: 'error',
          source: 'speech-to-text',
          message: 'Failed to process audio chunk: timeout exceeded',
          sessionId: 'session_def456',
          metadata: {
            error: 'TimeoutError',
            audioLength: 5.2,
            retryCount: 3
          }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          level: 'warn',
          source: 'nlp-service',
          message: 'High response time detected for intent classification',
          sessionId: 'session_ghi789',
          metadata: {
            responseTime: 2.8,
            intent: 'book_ride',
            confidence: 0.85
          },
          duration: 2800
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          level: 'info',
          source: 'database',
          message: 'Database connection pool refreshed',
          metadata: {
            activeConnections: 25,
            maxConnections: 50,
            poolHealth: 'good'
          }
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          level: 'debug',
          source: 'conversation-manager',
          message: 'Context updated for ongoing conversation',
          userId: 'user_456',
          sessionId: 'session_jkl012',
          metadata: {
            contextSize: 1024,
            turnCount: 5,
            conversationState: 'active'
          }
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          level: 'error',
          source: 'api-gateway',
          message: 'Rate limit exceeded for client IP',
          metadata: {
            clientIp: '192.168.1.100',
            endpoint: '/api/ivr/process',
            requestCount: 1000,
            timeWindow: '1hour'
          }
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          level: 'info',
          source: 'webhook-handler',
          message: 'Webhook delivered successfully to external service',
          metadata: {
            webhookId: 'webhook_789',
            url: 'https://client.example.com/callback',
            statusCode: 200,
            responseTime: 245
          },
          duration: 245
        }
      ];

      // Generate more mock logs for testing
      const additionalLogs = Array.from({ length: 100 }, (_, index) => ({
        id: `log_${index + 8}`,
        timestamp: new Date(Date.now() - (index + 35) * 60 * 1000),
        level: logLevels[Math.floor(Math.random() * logLevels.length)] as any,
        source: logSources[Math.floor(Math.random() * logSources.length)],
        message: `Sample log message ${index + 8} - ${Math.random() > 0.5 ? 'Operation completed' : 'Processing request'}`,
        userId: Math.random() > 0.7 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          randomData: Math.random() * 100,
          status: Math.random() > 0.8 ? 'success' : 'processing'
        },
        duration: Math.floor(Math.random() * 2000) + 100
      }));

      const allLogs = [...mockLogs, ...additionalLogs].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setLogs(allLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNewLogs = async () => {
    // Simulate new logs coming in
    const newLog: LogEntry = {
      id: `realtime_${Date.now()}`,
      timestamp: new Date(),
      level: logLevels[Math.floor(Math.random() * logLevels.length)] as any,
      source: logSources[Math.floor(Math.random() * logSources.length)],
      message: `Real-time log entry - ${new Date().toLocaleTimeString()}`,
      sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        realtime: true,
        randomValue: Math.random()
      }
    };

    setLogs(prev => [newLog, ...prev]);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.sessionId && log.sessionId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply level filter
    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    // Apply source filter
    if (filters.source) {
      filtered = filtered.filter(log => log.source === filters.source);
    }

    // Apply date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= filters.dateRange!.from && logDate <= filters.dateRange!.to;
      });
    }

    // Apply user filter
    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const exportLogs = () => {
    const logsToExport = filteredLogs.slice(0, 1000); // Limit export size
    const csvContent = [
      'Timestamp,Level,Source,Message,User ID,Session ID,Duration,Metadata',
      ...logsToExport.map(log => [
        log.timestamp.toISOString(),
        log.level,
        log.source,
        `"${log.message}"`,
        log.userId || '',
        log.sessionId || '',
        log.duration || '',
        `"${JSON.stringify(log.metadata || {})}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      setLogs([]);
      toast({
        title: 'Logs Cleared',
        description: 'All system logs have been cleared successfully',
      });
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'debug':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warn':
        return <Badge variant="secondary">Warning</Badge>;
      case 'info':
        return <Badge variant="default">Info</Badge>;
      case 'debug':
        return <Badge variant="outline">Debug</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    return `${duration}ms`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
            <FileText className="h-8 w-8" />
            Log Management
          </h1>
          <p className="text-gray-600 mt-1">
            System logs and real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Real-time:</span>
            <Switch
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
            {realTimeEnabled ? (
              <Play className="h-4 w-4 text-green-600" />
            ) : (
              <Square className="h-4 w-4 text-gray-600" />
            )}
          </div>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Log Level</Label>
              <Select
                value={filters.level || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, level: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  {logLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={filters.source || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, source: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sources</SelectItem>
                  {logSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 logs</SelectItem>
                  <SelectItem value="50">50 logs</SelectItem>
                  <SelectItem value="100">100 logs</SelectItem>
                  <SelectItem value="200">200 logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <div className="text-sm text-gray-600">
              Showing {paginatedLogs.length} of {filteredLogs.length} logs
              {filteredLogs.length !== logs.length && ` (${logs.length} total)`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>
            Recent system activity and events
            {realTimeEnabled && (
              <Badge variant="outline" className="ml-2">Live</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${log.level === 'error' ? 'border-red-200 bg-red-50' :
                    log.level === 'warn' ? 'border-yellow-200 bg-yellow-50' :
                      ''
                    }`}
                  onClick={() => {
                    setSelectedLog(log);
                    setShowLogDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getLevelIcon(log.level)}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          {getLevelBadge(log.level)}
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                          {log.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {formatDuration(log.duration)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {(log.userId || log.sessionId) && (
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            {log.userId && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.userId}
                              </span>
                            )}
                            {log.sessionId && (
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {log.sessionId}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timestamp</Label>
                  <div className="font-mono text-sm p-2 bg-gray-100 rounded">
                    {formatTimestamp(selectedLog.timestamp)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <div className="flex items-center gap-2">
                    {getLevelIcon(selectedLog.level)}
                    {getLevelBadge(selectedLog.level)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <div className="font-mono text-sm p-2 bg-gray-100 rounded">
                    {selectedLog.source}
                  </div>
                </div>
                {selectedLog.duration && (
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="font-mono text-sm p-2 bg-gray-100 rounded">
                      {formatDuration(selectedLog.duration)}
                    </div>
                  </div>
                )}
                {selectedLog.userId && (
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <div className="font-mono text-sm p-2 bg-gray-100 rounded">
                      {selectedLog.userId}
                    </div>
                  </div>
                )}
                {selectedLog.sessionId && (
                  <div className="space-y-2">
                    <Label>Session ID</Label>
                    <div className="font-mono text-sm p-2 bg-gray-100 rounded">
                      {selectedLog.sessionId}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <div className="p-3 bg-gray-100 rounded text-sm">
                  {selectedLog.message}
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-2">
                  <Label>Metadata</Label>
                  <ScrollArea className="h-32">
                    <pre className="text-xs p-3 bg-gray-100 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}