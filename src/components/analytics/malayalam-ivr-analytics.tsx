'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingUp as TrendingDown,
  Users, 
  Phone, 
  Star,
  Clock,
  TrendingUp as DollarSign,
  Activity,
  Globe,
  Brain,
  MessageSquare,
  Car,
  Eye,
  Clock as Calendar,
  Download,
  RefreshCw,
  Filter,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  MapPin,
  Clock as Timer
} from 'lucide-react';

interface AnalyticsData {
  dailyRides: Array<{date: string, rides: number, revenue: number}>;
  languageDistribution: Array<{language: string, calls: number, percentage: number}>;
  cityWiseData: Array<{city: string, rides: number, revenue: number, growth: number}>;
  customerSatisfaction: Array<{period: string, rating: number, total: number}>;
  driverPerformance: Array<{name: string, rides: number, rating: number, earnings: number}>;
  aiMetrics: Array<{metric: string, value: number, target: number, trend: string}>;
  realtimeData: {
    activeCalls: number;
    queuedCalls: number;
    avgWaitTime: number;
    resolutionRate: number;
  };
}

export default function MalayalamIVRAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('rides');
  const [data, setData] = useState<AnalyticsData>({
    dailyRides: [
      {date: '2024-01-10', rides: 145, revenue: 28500},
      {date: '2024-01-11', rides: 167, revenue: 32400},
      {date: '2024-01-12', rides: 189, revenue: 36800},
      {date: '2024-01-13', rides: 201, revenue: 41200},
      {date: '2024-01-14', rides: 234, revenue: 45600},
      {date: '2024-01-15', rides: 256, revenue: 52300},
      {date: '2024-01-16', rides: 278, revenue: 58900}
    ],
    languageDistribution: [
      {language: 'Malayalam', calls: 1247, percentage: 62.3},
      {language: 'Manglish', calls: 567, percentage: 28.4},
      {language: 'English', calls: 186, percentage: 9.3}
    ],
    cityWiseData: [
      {city: 'Kochi', rides: 567, revenue: 125000, growth: 15.6},
      {city: 'Thiruvananthapuram', rides: 423, revenue: 98500, growth: 12.3},
      {city: 'Calicut', rides: 345, revenue: 76200, growth: 18.9},
      {city: 'Kottayam', rides: 234, revenue: 52300, growth: 8.7},
      {city: 'Thrissur', rides: 189, revenue: 41800, growth: 22.1}
    ],
    customerSatisfaction: [
      {period: 'Week 1', rating: 4.2, total: 234},
      {period: 'Week 2', rating: 4.5, total: 345},
      {period: 'Week 3', rating: 4.7, total: 456},
      {period: 'Week 4', rating: 4.8, total: 567}
    ],
    driverPerformance: [
      {name: 'Suresh Babu', rides: 89, rating: 4.9, earnings: 18500},
      {name: 'Anil Krishnan', rides: 76, rating: 4.7, earnings: 16200},
      {name: 'Rajesh P', rides: 72, rating: 4.8, earnings: 15800},
      {name: 'Mohammed Salim', rides: 68, rating: 4.6, earnings: 14900},
      {name: 'Vinod Kumar', rides: 65, rating: 4.5, earnings: 14200}
    ],
    aiMetrics: [
      {metric: 'Intent Recognition', value: 94.5, target: 95, trend: 'up'},
      {metric: 'Malayalam TTS Quality', value: 96.8, target: 95, trend: 'up'},
      {metric: 'Manglish STT Accuracy', value: 92.1, target: 95, trend: 'down'},
      {metric: 'Call Resolution Rate', value: 87.3, target: 90, trend: 'up'},
      {metric: 'Response Time (ms)', value: 245, target: 200, trend: 'down'}
    ],
    realtimeData: {
      activeCalls: 23,
      queuedCalls: 7,
      avgWaitTime: 45,
      resolutionRate: 94.2
    }
  });

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
  
  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
  
  const getMetricColor = (value: number, target: number, reverse = false) => {
    if (reverse) {
      return value <= target ? 'text-green-600' : 'text-red-600';
    }
    return value >= target ? 'text-green-600' : 'text-red-600';
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Calls Today</p>
              <p className="text-3xl font-bold text-blue-900">1,247</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+15.3%</span>
              </div>
            </div>
            <Phone className="h-10 w-10 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Malayalam Calls</p>
              <p className="text-3xl font-bold text-green-900">777</p>
              <p className="text-xs text-green-600">62.3% of total</p>
            </div>
            <Globe className="h-10 w-10 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">AI Resolution Rate</p>
              <p className="text-3xl font-bold text-purple-900">87.3%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+2.1%</span>
              </div>
            </div>
            <Brain className="h-10 w-10 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Avg Response Time</p>
              <p className="text-3xl font-bold text-orange-900">245ms</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">-12ms</span>
              </div>
            </div>
            <Zap className="h-10 w-10 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCallVolumeChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Call Volume & Revenue Trends
        </CardTitle>
        <CardDescription>Daily call volume and revenue generation over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.dailyRides.map((day, index) => (
            <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{new Date(day.date).toLocaleDateString('en-IN')}</p>
                <p className="text-sm text-gray-600">{day.rides} rides</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(day.revenue)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
                <div 
                  className="bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm px-3 py-2"
                  style={{minWidth: `${(day.rides / Math.max(...data.dailyRides.map(d => d.rides))) * 100}px`}}
                >
                  {day.rides}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderLanguageDistribution = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language Distribution
        </CardTitle>
        <CardDescription>Call distribution by preferred language</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.languageDistribution.map((item, index) => (
            <div key={item.language} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: colors[index]}} />
                  <span className="font-medium">
                    {item.language === 'Malayalam' ? '🇮🇳 മലയാളം' : 
                     item.language === 'Manglish' ? '🔄 Manglish' : '🇺🇸 English'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.calls}</p>
                  <p className="text-sm text-gray-600">{item.percentage}%</p>
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Language Insights</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Malayalam dominates with 62.3% of all calls</li>
            <li>• Manglish usage increasing by 8% monthly</li>
            <li>• English primarily used for premium services</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderCityPerformance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          City-wise Performance
        </CardTitle>
        <CardDescription>Revenue and growth metrics by city</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.cityWiseData.map((city, index) => (
            <div key={city.city} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {city.city.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{city.city}</p>
                  <p className="text-sm text-gray-600">{city.rides} rides this month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(city.revenue)}</p>
                <div className="flex items-center gap-1">
                  {city.growth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${city.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {city.growth > 0 ? '+' : ''}{city.growth}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAIMetrics = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Performance Metrics
        </CardTitle>
        <CardDescription>Real-time AI system performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.aiMetrics.map((metric, index) => (
            <div key={metric.metric} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{metric.metric}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getMetricColor(metric.value, metric.target, metric.metric.includes('Time'))}`}>
                    {metric.metric.includes('Time') ? `${metric.value}ms` : `${metric.value}%`}
                  </span>
                  <Badge variant={metric.value >= metric.target ? 'default' : 'secondary'}>
                    Target: {metric.metric.includes('Time') ? `${metric.target}ms` : `${metric.target}%`}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={metric.metric.includes('Time') ? 
                  Math.max(0, 100 - (metric.value / metric.target) * 100) : 
                  (metric.value / metric.target) * 100
                } 
                className="h-2" 
              />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Current Performance</span>
                <span className={metric.value >= metric.target ? 'text-green-600' : 'text-orange-600'}>
                  {metric.value >= metric.target ? '✓ Target Met' : '⚠ Below Target'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">AI Insights</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Malayalam TTS quality exceeds industry standards</li>
            <li>• Intent recognition improving with Kerala-specific training</li>
            <li>• Manglish processing needs optimization focus</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderRealTimeMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Active Calls</p>
              <p className="text-2xl font-bold text-green-900">{data.realtimeData.activeCalls}</p>
            </div>
            <Activity className="h-6 w-6 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Queued Calls</p>
              <p className="text-2xl font-bold text-yellow-900">{data.realtimeData.queuedCalls}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Avg Wait Time</p>
              <p className="text-2xl font-bold text-blue-900">{data.realtimeData.avgWaitTime}s</p>
            </div>
            <Timer className="h-6 w-6 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Resolution Rate</p>
              <p className="text-2xl font-bold text-purple-900">{data.realtimeData.resolutionRate}%</p>
            </div>
            <CheckCircle className="h-6 w-6 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Malayalam AI IVR Analytics</h1>
          <p className="text-gray-600">Comprehensive analytics for world's first AI-powered IVR platform</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {renderOverviewCards()}

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time System Status
          </CardTitle>
          <CardDescription>Live metrics from the AI IVR system</CardDescription>
        </CardHeader>
        <CardContent>
          {renderRealTimeMetrics()}
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="language">Language Analytics</TabsTrigger>
          <TabsTrigger value="geography">Geographic Insights</TabsTrigger>
          <TabsTrigger value="ai">AI Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {renderCallVolumeChart()}
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderLanguageDistribution()}
            <Card>
              <CardHeader>
                <CardTitle>Language Performance Trends</CardTitle>
                <CardDescription>Call success rates by language preference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">96.8%</p>
                      <p className="text-sm text-blue-700">Malayalam Success</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">92.1%</p>
                      <p className="text-sm text-green-700">Manglish Success</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">94.5%</p>
                      <p className="text-sm text-purple-700">English Success</p>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Recent Improvements</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Malayalam TTS quality increased by 3.2%</li>
                      <li>• Manglish context understanding improved</li>
                      <li>• Code-switching detection accuracy: 89%</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          {renderCityPerformance()}
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {renderAIMetrics()}
        </TabsContent>
      </Tabs>
    </div>
  );
}