"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  MessageSquare, 
  Phone, 
  Settings, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Brain,
  Mic,
  Volume2,
  Globe,
  Clock,
  TrendingUp,
  Users,
  BarChart3
} from "lucide-react";

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  language: string;
  accuracy: number;
  totalCalls: number;
  avgResponseTime: number;
  lastActive: string;
  capabilities: string[];
}

interface CallMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgCallDuration: number;
  intentsRecognized: number;
  languagesSupported: number;
}

interface IntentPerformance {
  intent: string;
  count: number;
  accuracy: number;
  avgConfidence: number;
}

export default function AIAgentDashboard() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [metrics, setMetrics] = useState<CallMetrics | null>(null);
  const [intentPerformance, setIntentPerformance] = useState<IntentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Simulate API calls - replace with actual API endpoints
      const mockAgents: AIAgent[] = [
        {
          id: '1',
          name: 'Malayalam IVR Agent',
          type: 'Speech Recognition',
          status: 'active',
          language: 'Malayalam',
          accuracy: 92.5,
          totalCalls: 1247,
          avgResponseTime: 1.8,
          lastActive: new Date().toISOString(),
          capabilities: ['Speech-to-Text', 'Intent Recognition', 'Natural Language Processing']
        },
        {
          id: '2',
          name: 'Manglish Processor',
          type: 'Text Processing',
          status: 'active',
          language: 'Manglish',
          accuracy: 88.3,
          totalCalls: 856,
          avgResponseTime: 1.2,
          lastActive: new Date().toISOString(),
          capabilities: ['Text Normalization', 'Translation', 'Intent Detection']
        },
        {
          id: '3',
          name: 'Ride-Hailing Assistant',
          type: 'Domain Specific',
          status: 'training',
          language: 'Malayalam',
          accuracy: 78.9,
          totalCalls: 234,
          avgResponseTime: 2.1,
          lastActive: new Date().toISOString(),
          capabilities: ['Booking Management', 'Driver Matching', 'Fare Calculation']
        },
        {
          id: '4',
          name: 'Emergency Response Bot',
          type: 'Critical Response',
          status: 'active',
          language: 'Malayalam',
          accuracy: 95.2,
          totalCalls: 89,
          avgResponseTime: 0.8,
          lastActive: new Date().toISOString(),
          capabilities: ['Emergency Detection', 'Priority Routing', 'Quick Response']
        }
      ];

      const mockMetrics: CallMetrics = {
        totalCalls: 2426,
        successfulCalls: 2189,
        failedCalls: 237,
        avgCallDuration: 3.2,
        intentsRecognized: 18,
        languagesSupported: 3
      };

      const mockIntentPerformance: IntentPerformance[] = [
        { intent: 'book_ride', count: 423, accuracy: 91.2, avgConfidence: 0.89 },
        { intent: 'ride_status', count: 312, accuracy: 88.7, avgConfidence: 0.85 },
        { intent: 'cancel_ride', count: 156, accuracy: 93.4, avgConfidence: 0.91 },
        { intent: 'emergency', count: 89, accuracy: 95.2, avgConfidence: 0.94 },
        { intent: 'payment_issue', count: 234, accuracy: 86.5, avgConfidence: 0.82 },
        { intent: 'fare_estimate', count: 198, accuracy: 89.1, avgConfidence: 0.87 },
        { intent: 'greeting', count: 567, accuracy: 96.3, avgConfidence: 0.93 },
        { intent: 'help', count: 445, accuracy: 90.8, avgConfidence: 0.88 }
      ];

      setAgents(mockAgents);
      setMetrics(mockMetrics);
      setIntentPerformance(mockIntentPerformance);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: string) => {
    try {
      // Simulate API call
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: currentStatus === 'active' ? 'inactive' : 'active' }
          : agent
      ));
    } catch (error) {
      console.error('Error toggling agent status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'training': return <Brain className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'Malayalam': return '🇮🇳';
      case 'Manglish': return '🌐';
      case 'English': return '🇬🇧';
      default: return '🌐';
    }
  };

  const successRate = metrics ? (metrics.successfulCalls / metrics.totalCalls * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.successfulCalls} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgCallDuration}s</div>
            <p className="text-xs text-muted-foreground">
              -0.3s from average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {agents.filter(a => a.status === 'active').length}/{agents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              AI agents running
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="intents">Intent Analysis</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Agents List */}
            <Card>
              <CardHeader>
                <CardTitle>AI Agents</CardTitle>
                <CardDescription>Manage and monitor AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedAgent?.id === agent.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="h-4 w-4" />
                              <span className="font-medium">{agent.name}</span>
                              <Badge className={getStatusColor(agent.status)}>
                                {getStatusIcon(agent.status)}
                                <span className="ml-1">{agent.status}</span>
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getLanguageIcon(agent.language)}</span>
                                <span className="text-gray-600">{agent.language}</span>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-gray-600">{agent.type}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  <span>Accuracy: {agent.accuracy}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{agent.totalCalls} calls</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{agent.avgResponseTime}s avg response</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={agent.status === 'active'}
                              onCheckedChange={() => toggleAgentStatus(agent.id, agent.status)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Agent Details */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
                <CardDescription>
                  {selectedAgent ? `Configuration for ${selectedAgent.name}` : 'Select an agent to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedAgent ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(selectedAgent.status)}>
                            {getStatusIcon(selectedAgent.status)}
                            <span className="ml-1">{selectedAgent.status}</span>
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Language</label>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-lg">{getLanguageIcon(selectedAgent.language)}</span>
                          <span>{selectedAgent.language}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <div className="mt-1 text-gray-600">{selectedAgent.type}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Total Calls</label>
                        <div className="mt-1 text-gray-600">{selectedAgent.totalCalls.toLocaleString()}</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Performance Metrics</label>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Accuracy</span>
                            <span>{selectedAgent.accuracy}%</span>
                          </div>
                          <Progress value={selectedAgent.accuracy} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Avg Response Time</span>
                            <span>{selectedAgent.avgResponseTime}s</span>
                          </div>
                          <Progress value={(5 - selectedAgent.avgResponseTime) * 20} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Capabilities</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedAgent.capabilities.map((capability, index) => (
                          <Badge key={index} variant="secondary">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    Select an agent to view details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>System-wide metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Total Intents Recognized</span>
                      <span>{metrics?.intentsRecognized}</span>
                    </div>
                    <Progress value={(metrics?.intentsRecognized || 0) * 5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Languages Supported</span>
                      <span>{metrics?.languagesSupported}</span>
                    </div>
                    <Progress value={(metrics?.languagesSupported || 0) * 25} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Call Statistics</CardTitle>
                <CardDescription>Call handling metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Calls</span>
                    <span className="font-medium">{metrics?.totalCalls.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Successful</span>
                    <span className="font-medium text-green-600">{metrics?.successfulCalls.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed</span>
                    <span className="font-medium text-red-600">{metrics?.failedCalls.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Duration</span>
                    <span className="font-medium">{metrics?.avgCallDuration}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intent Performance Analysis</CardTitle>
              <CardDescription>How well the AI recognizes different intents</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {intentPerformance.map((intent, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{intent.intent.replace('_', ' ')}</span>
                        <Badge variant="secondary">{intent.count} calls</Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Accuracy</span>
                            <span>{intent.accuracy.toFixed(1)}%</span>
                          </div>
                          <Progress value={intent.accuracy} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Avg Confidence</span>
                            <span>{(intent.avgConfidence * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={intent.avgConfidence * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Settings</CardTitle>
              <CardDescription>Configure AI agent behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Speech Recognition</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Enable Malayalam Speech</label>
                        <p className="text-sm text-gray-500">Process Malayalam voice inputs</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Enable Manglish Support</label>
                        <p className="text-sm text-gray-500">Process Malayalam in English script</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Noise Reduction</label>
                        <p className="text-sm text-gray-500">Filter background noise</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Natural Language Processing</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Intent Confidence Threshold</label>
                        <p className="text-sm text-gray-500">Minimum confidence for intent recognition</p>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Context Memory</label>
                        <p className="text-sm text-gray-500">Remember context during conversation</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Cultural Context</label>
                        <p className="text-sm text-gray-500">Apply Malayalam cultural context</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Response Generation</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Text-to-Speech</label>
                        <p className="text-sm text-gray-500">Generate voice responses</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Voice Type</label>
                        <p className="text-sm text-gray-500">Natural Malayalam voice</p>
                      </div>
                      <span className="text-sm font-medium">Female</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Response Speed</label>
                        <p className="text-sm text-gray-500">Speech rate</p>
                      </div>
                      <span className="text-sm font-medium">Normal</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button>Save Settings</Button>
                  <Button variant="outline">Reset to Default</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}