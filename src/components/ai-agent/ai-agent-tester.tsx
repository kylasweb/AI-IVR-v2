'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  ArrowRight as Send,
  Bot,
  User,
  Play,
  X as Pause,
  RotateCcw,
  Settings,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Bot as TestTube,
  MessageSquare,
  BarChart3,
  Globe,
  RotateCcw as Loader
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { AIAgent, AgentExecutionResponse } from '@/types/ai-agent';

interface TestMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    executionTime?: number;
    tokensUsed?: number;
    cost?: number;
    success?: boolean;
  };
}

interface TestSession {
  id: string;
  agentId: string;
  messages: TestMessage[];
  startTime: Date;
  totalTests: number;
  successfulTests: number;
  totalCost: number;
  averageResponseTime: number;
}

interface AIAgentTesterProps {
  agent?: AIAgent;
  agentId?: string;
  onClose?: () => void;
}

export default function AIAgentTester({ agent, agentId, onClose }: AIAgentTesterProps) {
  const [currentAgent, setCurrentAgent] = useState<AIAgent | null>(agent || null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState<'interactive' | 'batch' | 'performance'>('interactive');

  // Test Configuration
  const [testConfig, setTestConfig] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    includeContext: true,
    malayalamMode: false,
    stressTest: false,
    concurrentRequests: 1
  });

  // Batch Testing
  const [batchQueries, setBatchQueries] = useState<string[]>([]);
  const [batchResults, setBatchResults] = useState<any[]>([]);

  // Performance Testing
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageResponseTime: 0,
    successRate: 0,
    errorRate: 0,
    throughput: 0,
    peakResponseTime: 0,
    minResponseTime: 0
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load agent data if agentId is provided
  useEffect(() => {
    if (agentId && !currentAgent) {
      fetchAgent(agentId);
    }
  }, [agentId, currentAgent]);

  // Initialize test session
  useEffect(() => {
    if (currentAgent && !session) {
      initializeSession();
    }
  }, [currentAgent, session]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAgent = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-agents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentAgent(data.agent);
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error);
      toast({
        title: "Error",
        description: "Failed to load agent for testing",
        variant: "destructive"
      });
    }
  };

  const initializeSession = () => {
    if (!currentAgent) return;

    const newSession: TestSession = {
      id: `session_${Date.now()}`,
      agentId: currentAgent.id,
      messages: [{
        id: 'system_welcome',
        type: 'system',
        content: `Testing session started for "${currentAgent.name}". Ready to test!`,
        timestamp: new Date()
      }],
      startTime: new Date(),
      totalTests: 0,
      successfulTests: 0,
      totalCost: 0,
      averageResponseTime: 0
    };

    setSession(newSession);
  };

  const sendTestMessage = async () => {
    if (!currentInput.trim() || !currentAgent || !session) return;

    const userMessage: TestMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    setIsLoading(true);
    setCurrentInput('');

    try {
      const startTime = Date.now();

      const response = await fetch(`/api/ai-agents/${currentAgent.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentInput,
          context: testConfig.includeContext ? { testMode: true } : undefined,
          options: {
            temperature: testConfig.temperature,
            maxTokens: testConfig.maxTokens
          }
        })
      });

      const executionTime = Date.now() - startTime;

      if (response.ok) {
        const result: AgentExecutionResponse = await response.json();

        const agentMessage: TestMessage = {
          id: `msg_${Date.now()}_response`,
          type: 'agent',
          content: result.response,
          timestamp: new Date(),
          metadata: {
            executionTime: result.executionTime,
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            success: true
          }
        };

        setSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, agentMessage],
          totalTests: prev.totalTests + 1,
          successfulTests: prev.successfulTests + 1,
          totalCost: prev.totalCost + result.cost,
          averageResponseTime: ((prev.averageResponseTime * prev.totalTests) + result.executionTime) / (prev.totalTests + 1)
        } : null);

      } else {
        const error = await response.json();

        const errorMessage: TestMessage = {
          id: `msg_${Date.now()}_error`,
          type: 'system',
          content: `Error: ${error.error || 'Failed to execute agent'}`,
          timestamp: new Date(),
          metadata: {
            executionTime,
            success: false
          }
        };

        setSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, errorMessage],
          totalTests: prev.totalTests + 1
        } : null);
      }
    } catch (error) {
      console.error('Test execution failed:', error);

      const errorMessage: TestMessage = {
        id: `msg_${Date.now()}_network_error`,
        type: 'system',
        content: 'Network error: Failed to connect to agent',
        timestamp: new Date(),
        metadata: {
          success: false
        }
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage],
        totalTests: prev.totalTests + 1
      } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const runBatchTests = async () => {
    if (!batchQueries.length || !currentAgent) return;

    setIsLoading(true);
    const results: any[] = [];

    for (const query of batchQueries) {
      try {
        const startTime = Date.now();

        const response = await fetch(`/api/ai-agents/${currentAgent.id}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            context: { batchTest: true }
          })
        });

        const executionTime = Date.now() - startTime;

        if (response.ok) {
          const result = await response.json();
          results.push({
            query,
            response: result.response,
            executionTime: result.executionTime,
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            success: true
          });
        } else {
          const error = await response.json();
          results.push({
            query,
            error: error.error,
            executionTime,
            success: false
          });
        }

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.push({
          query,
          error: 'Network error',
          success: false
        });
      }
    }

    setBatchResults(results);
    setIsLoading(false);

    // Calculate performance metrics
    const successfulResults = results.filter(r => r.success);
    const totalExecutionTime = successfulResults.reduce((sum, r) => sum + r.executionTime, 0);

    setPerformanceMetrics({
      averageResponseTime: successfulResults.length > 0 ? totalExecutionTime / successfulResults.length : 0,
      successRate: (successfulResults.length / results.length) * 100,
      errorRate: ((results.length - successfulResults.length) / results.length) * 100,
      throughput: results.length / (totalExecutionTime / 1000), // requests per second
      peakResponseTime: Math.max(...successfulResults.map(r => r.executionTime), 0),
      minResponseTime: Math.min(...successfulResults.map(r => r.executionTime), 0)
    });

    toast({
      title: "Batch Testing Complete",
      description: `Completed ${results.length} tests with ${successfulResults.length} successes`,
    });
  };

  const resetSession = () => {
    if (currentAgent) {
      initializeSession();
      setBatchResults([]);
      setPerformanceMetrics({
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        throughput: 0,
        peakResponseTime: 0,
        minResponseTime: 0
      });
    }
  };

  const exportResults = () => {
    if (!session) return;

    const exportData = {
      agent: {
        id: currentAgent?.id,
        name: currentAgent?.name,
        version: currentAgent?.version
      },
      session: {
        id: session.id,
        startTime: session.startTime,
        totalTests: session.totalTests,
        successfulTests: session.successfulTests,
        totalCost: session.totalCost,
        averageResponseTime: session.averageResponseTime
      },
      messages: session.messages,
      batchResults,
      performanceMetrics,
      testConfig
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_test_results_${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSampleQueries = () => {
    if (!currentAgent) return [];

    const persona = currentAgent.configuration.persona;

    if (persona.role.toLowerCase().includes('support')) {
      return [
        'How can I reset my password?',
        'What is your return policy?',
        'I need help with my order',
        'എന്റെ അക്കൗണ്ട് എങ്ങനെ അപ്ഡേറ്റ് ചെയ്യാം?'
      ];
    }

    if (persona.role.toLowerCase().includes('tourism')) {
      return [
        'Best places to visit in Kochi',
        'Kerala backwater tour packages',
        'Traditional Kerala food recommendations',
        'കുമരകം റിസോർട്ട് ബുക്കിങ് എങ്ങനെ?'
      ];
    }

    return [
      'Hello, can you help me?',
      'What can you do?',
      'Tell me about yourself',
      'നിങ്ങൾക്ക് മലയാളം അറിയാമോ?'
    ];
  };

  if (!currentAgent) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Agent Selected</h3>
          <p className="text-gray-600">Select an agent to start testing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            Agent Testing Console
          </h2>
          <p className="text-gray-600 mt-1">
            Testing "{currentAgent.name}" • Version {currentAgent.version}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportResults}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline" onClick={resetSession}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Session
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Agent Status & Session Info */}
      {session && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tests Run</p>
                  <p className="text-2xl font-bold">{session.totalTests}</p>
                </div>
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {session.totalTests > 0
                      ? Math.round((session.successfulTests / session.totalTests) * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold">{session.averageResponseTime.toFixed(0)}ms</p>
                </div>
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold">₹{session.totalCost.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Testing Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Test Chat Interface */}
        <div className="lg:col-span-3">
          <Tabs value={testMode} onValueChange={(value: any) => setTestMode(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="interactive">Interactive Test</TabsTrigger>
              <TabsTrigger value="batch">Batch Test</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="interactive" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Interactive Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat Messages */}
                  <div className="border rounded-lg h-96 overflow-y-auto p-4 space-y-4">
                    {session?.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.type === 'system'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-white border'
                            }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.type === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : message.type === 'agent' ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <Settings className="h-4 w-4" />
                            )}
                            <span className="text-xs opacity-75">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.metadata?.success !== undefined && (
                              <Badge
                                variant={message.metadata.success ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {message.metadata.success ? "Success" : "Failed"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{message.content}</p>
                          {message.metadata && (
                            <div className="flex items-center gap-3 mt-2 text-xs opacity-75">
                              {message.metadata.executionTime && (
                                <span>⏱️ {message.metadata.executionTime}ms</span>
                              )}
                              {message.metadata.tokensUsed && (
                                <span>🔤 {message.metadata.tokensUsed}</span>
                              )}
                              {message.metadata.cost && (
                                <span>💰 ₹{message.metadata.cost.toFixed(2)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Agent is thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <Input
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Type your test message..."
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendTestMessage()}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendTestMessage}
                      disabled={!currentInput.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sample Queries */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quick Test Queries:</Label>
                    <div className="flex flex-wrap gap-2">
                      {getSampleQueries().map((query, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentInput(query)}
                          disabled={isLoading}
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Testing</CardTitle>
                  <CardDescription>
                    Test multiple queries at once to evaluate agent performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Queries (one per line)</Label>
                    <Textarea
                      placeholder="Enter test queries, one per line..."
                      value={batchQueries.join('\n')}
                      onChange={(e) => setBatchQueries(e.target.value.split('\n').filter(q => q.trim()))}
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={runBatchTests}
                    disabled={!batchQueries.length || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Running Tests...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Batch Tests ({batchQueries.length} queries)
                      </>
                    )}
                  </Button>

                  {/* Batch Results */}
                  {batchResults.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Test Results</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {batchResults.map((result, index) => (
                          <div key={index} className="border rounded p-3 text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Query {index + 1}</span>
                              <Badge variant={result.success ? "default" : "destructive"}>
                                {result.success ? "Success" : "Failed"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-1">Q: {result.query}</p>
                            {result.success ? (
                              <>
                                <p className="mb-1">A: {result.response}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>⏱️ {result.executionTime}ms</span>
                                  <span>🔤 {result.tokensUsed}</span>
                                  <span>💰 ₹{result.cost.toFixed(2)}</span>
                                </div>
                              </>
                            ) : (
                              <p className="text-red-600">Error: {result.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Detailed performance analysis of your agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceMetrics.averageResponseTime.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {performanceMetrics.successRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-orange-600">
                        {performanceMetrics.throughput.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Requests/sec</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-red-600">
                        {performanceMetrics.peakResponseTime.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-600">Peak Response</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {performanceMetrics.minResponseTime.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-600">Min Response</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-gray-600">
                        {performanceMetrics.errorRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Test Configuration */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Slider
                  value={[testConfig.temperature]}
                  onValueChange={([value]) =>
                    setTestConfig(prev => ({ ...prev, temperature: value }))
                  }
                  max={2}
                  min={0}
                  step={0.1}
                />
                <div className="text-sm text-gray-600">{testConfig.temperature}</div>
              </div>

              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={testConfig.maxTokens}
                  onChange={(e) =>
                    setTestConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))
                  }
                  min={1}
                  max={10000}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Include Context</Label>
                <Switch
                  checked={testConfig.includeContext}
                  onCheckedChange={(checked) =>
                    setTestConfig(prev => ({ ...prev, includeContext: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Malayalam Mode</Label>
                <Switch
                  checked={testConfig.malayalamMode}
                  onCheckedChange={(checked) =>
                    setTestConfig(prev => ({ ...prev, malayalamMode: checked }))
                  }
                />
              </div>

              {currentAgent?.configuration.malayalamSupport.enabled && (
                <div className="p-3 border rounded bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Malayalam Support</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>Dialects: {currentAgent.configuration.malayalamSupport.dialectSupport.join(', ')}</p>
                    <p>Script: {currentAgent.configuration.malayalamSupport.scriptSupport}</p>
                    <p>Cultural Context: {currentAgent.configuration.malayalamSupport.culturalContext ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}

              {/* Agent Capabilities */}
              <div className="space-y-2">
                <Label>Agent Capabilities</Label>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {Object.entries(currentAgent?.configuration.capabilities || {}).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge variant={enabled ? "default" : "secondary"}>
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}