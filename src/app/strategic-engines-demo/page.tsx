'use client';

// Strategic Engines Demo Page
// Project Saksham - Live Demo and Testing Interface

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, Zap, Target, Brain, Play, BarChart3, Settings } from 'lucide-react';

// Import strategic engine utilities
import {
  initializeStrategicEngines,
  getEngineHealthStatus,
  executeHyperPersonalization,
  executeAutonomousDispatch,
  createDefaultCulturalContext,
  PHASE_1_ENGINES,
  IMPLEMENTATION_PHASES
} from '@/features/strategic-engines';

import ManagementLayout from '@/components/layout/management-layout';

interface EngineStatus {
  overall: string;
  engines?: Record<string, string>;
  timestamp: Date;
  systemMetrics?: any;
  error?: string;
}

interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

const StrategicEnginesDemo: React.FC = () => {
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [executionResults, setExecutionResults] = useState<Record<string, ExecutionResult>>({});

  // Hyper-Personalization Demo State
  const [personalizationInput, setPersonalizationInput] = useState({
    userId: 'demo_user_001',
    messageContent: 'I need help with my ride booking',
    requestType: 'support',
    language: 'ml',
    region: 'kerala-central'
  });

  // Autonomous Dispatch Demo State
  const [dispatchInput, setDispatchInput] = useState({
    requestId: 'dispatch_demo_001',
    serviceType: 'ride',
    priority: 'medium',
    customerLocation: {
      latitude: 9.9312,
      longitude: 76.2673,
      address: 'Kochi, Kerala'
    }
  });

  // Initialize engines on component mount
  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      try {
        await initializeStrategicEngines();
        await checkEngineHealth();
      } catch (error) {
        console.error('Failed to initialize engines:', error);
      }
      setIsInitializing(false);
    };

    initialize();

    // Check health every 30 seconds
    const interval = setInterval(checkEngineHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkEngineHealth = async () => {
    try {
      const health = await getEngineHealthStatus();
      setEngineStatus(health);
    } catch (error) {
      setEngineStatus({
        overall: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  };

  const executePersonalizationDemo = async () => {
    try {
      const startTime = Date.now();

      const inputData = {
        userId: personalizationInput.userId,
        interactionHistory: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
            channel: 'voice',
            interaction: 'Previous booking inquiry',
            outcome: 'resolved',
            satisfaction: 8,
            culturalMarkers: ['kerala_native', 'malayalam_speaker'],
            personalityIndicators: ['patient', 'detailed_oriented']
          }
        ],
        currentContext: {
          channel: 'chat',
          timestamp: new Date(),
          deviceType: 'mobile'
        },
        requestType: personalizationInput.requestType,
        messageContent: personalizationInput.messageContent
      };

      const culturalContext = createDefaultCulturalContext(
        personalizationInput.language as any,
        personalizationInput.region
      );

      const result = await executeHyperPersonalization(inputData, culturalContext);
      const executionTime = Date.now() - startTime;

      setExecutionResults(prev => ({
        ...prev,
        personalization: {
          success: true,
          data: result,
          executionTime
        }
      }));
    } catch (error) {
      setExecutionResults(prev => ({
        ...prev,
        personalization: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const executeDispatchDemo = async () => {
    try {
      const startTime = Date.now();

      const inputData = {
        requestId: dispatchInput.requestId,
        customerLocation: dispatchInput.customerLocation,
        serviceType: dispatchInput.serviceType,
        priority: dispatchInput.priority,
        requestTime: new Date(),
        estimatedDuration: 30,
        specialRequirements: [],
        customerProfile: {
          id: 'demo_customer_001',
          tier: 'regular',
          history: [],
          preferences: {
            languagePreference: 'ml',
            communicationStyle: 'informative'
          },
          satisfaction: 8.5,
          lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        culturalContext: createDefaultCulturalContext('ml', 'kerala-central')
      };

      const result = await executeAutonomousDispatch(inputData);
      const executionTime = Date.now() - startTime;

      setExecutionResults(prev => ({
        ...prev,
        dispatch: {
          success: true,
          data: result,
          executionTime
        }
      }));
    } catch (error) {
      setExecutionResults(prev => ({
        ...prev,
        dispatch: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ManagementLayout title="Strategic Engines Demo" subtitle="Project Saksham - Live Demo & Testing">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Status and Controls */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {engineStatus && (
                  <Badge className={`px-3 py-1 ${getStatusColor(engineStatus.overall)}`}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(engineStatus.overall)}
                      <span className="capitalize">{engineStatus.overall}</span>
                    </div>
                  </Badge>
                )}
                <Button
                  onClick={checkEngineHealth}
                  variant="outline"
                  size="sm"
                  disabled={isInitializing}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isInitializing ? 'Initializing...' : 'Refresh Status'}
                </Button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-500" />
                  Hyper-Personalization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target Improvement:</span>
                    <span className="font-medium">+30% Satisfaction</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge className="text-xs bg-green-100 text-green-800">Production Ready</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cultural Context:</span>
                    <span className="font-medium">Malayalam Native</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Autonomous Dispatch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target Improvement:</span>
                    <span className="font-medium">-25% Wait Time</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge className="text-xs bg-green-100 text-green-800">Production Ready</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Optimization:</span>
                    <span className="font-medium">Cultural Routing</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Status:</span>
                    <Badge className={`text-xs ${getStatusColor(engineStatus?.overall || 'unknown')}`}>
                      {engineStatus?.overall || 'Checking...'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Engines:</span>
                    <span className="font-medium">{PHASE_1_ENGINES.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Check:</span>
                    <span className="font-medium">
                      {engineStatus?.timestamp ?
                        engineStatus.timestamp.toLocaleTimeString() :
                        'Pending...'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Interfaces */}
          <Tabs defaultValue="personalization" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personalization">
                <Brain className="w-4 h-4 mr-2" />
                Personalization Demo
              </TabsTrigger>
              <TabsTrigger value="dispatch">
                <Target className="w-4 h-4 mr-2" />
                Dispatch Demo
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personalization" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hyper-Personalization Input</CardTitle>
                    <p className="text-sm text-gray-600">
                      Configure customer context and test personalized responses
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                          id="userId"
                          value={personalizationInput.userId}
                          onChange={(e) => setPersonalizationInput(prev => ({
                            ...prev,
                            userId: e.target.value
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="requestType">Request Type</Label>
                        <Select
                          value={personalizationInput.requestType}
                          onValueChange={(value) => setPersonalizationInput(prev => ({
                            ...prev,
                            requestType: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="booking">Booking</SelectItem>
                            <SelectItem value="complaint">Complaint</SelectItem>
                            <SelectItem value="greeting">Greeting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={personalizationInput.language}
                          onValueChange={(value) => setPersonalizationInput(prev => ({
                            ...prev,
                            language: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ml">Malayalam</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="manglish">Manglish</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="region">Region</Label>
                        <Select
                          value={personalizationInput.region}
                          onValueChange={(value) => setPersonalizationInput(prev => ({
                            ...prev,
                            region: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kerala-north">Kerala North</SelectItem>
                            <SelectItem value="kerala-central">Kerala Central</SelectItem>
                            <SelectItem value="kerala-south">Kerala South</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="messageContent">Message Content</Label>
                      <Textarea
                        id="messageContent"
                        value={personalizationInput.messageContent}
                        onChange={(e) => setPersonalizationInput(prev => ({
                          ...prev,
                          messageContent: e.target.value
                        }))}
                        placeholder="Enter customer message..."
                      />
                    </div>

                    <Button
                      onClick={executePersonalizationDemo}
                      className="w-full"
                      disabled={isInitializing}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Personalization Engine
                    </Button>
                  </CardContent>
                </Card>

                {/* Output Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personalization Result</CardTitle>
                    <p className="text-sm text-gray-600">
                      AI-generated personalized response with cultural context
                    </p>
                  </CardHeader>
                  <CardContent>
                    {executionResults.personalization ? (
                      <div className="space-y-4">
                        {executionResults.personalization.success ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Success
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {executionResults.personalization.executionTime}ms
                              </span>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Personalized Response:</h4>
                              <p className="text-sm">
                                {executionResults.personalization.data?.outputData?.personalizedResponse ||
                                  'Personalized response generated successfully'}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Communication Style:</span>
                                <span className="ml-2 font-medium">
                                  {executionResults.personalization.data?.outputData?.communicationStyle || 'Professional'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Confidence:</span>
                                <span className="ml-2 font-medium">
                                  {executionResults.personalization.data?.outputData?.confidenceScore || 85}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>Error: {executionResults.personalization.error}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Execute" to test personalization engine</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dispatch" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dispatch Input Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Autonomous Dispatch Input</CardTitle>
                    <p className="text-sm text-gray-600">
                      Configure dispatch request and test optimization
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="requestId">Request ID</Label>
                        <Input
                          id="requestId"
                          value={dispatchInput.requestId}
                          onChange={(e) => setDispatchInput(prev => ({
                            ...prev,
                            requestId: e.target.value
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Select
                          value={dispatchInput.serviceType}
                          onValueChange={(value) => setDispatchInput(prev => ({
                            ...prev,
                            serviceType: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ride">Ride</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={dispatchInput.priority}
                          onValueChange={(value) => setDispatchInput(prev => ({
                            ...prev,
                            priority: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="address">Customer Location</Label>
                        <Input
                          id="address"
                          value={dispatchInput.customerLocation.address}
                          onChange={(e) => setDispatchInput(prev => ({
                            ...prev,
                            customerLocation: {
                              ...prev.customerLocation,
                              address: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={executeDispatchDemo}
                      className="w-full"
                      disabled={isInitializing}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Dispatch Engine
                    </Button>
                  </CardContent>
                </Card>

                {/* Dispatch Output Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dispatch Optimization Result</CardTitle>
                    <p className="text-sm text-gray-600">
                      Optimized resource assignment with cultural considerations
                    </p>
                  </CardHeader>
                  <CardContent>
                    {executionResults.dispatch ? (
                      <div className="space-y-4">
                        {executionResults.dispatch.success ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Optimized
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {executionResults.dispatch.executionTime}ms
                              </span>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Optimization Result:</h4>
                              <p className="text-sm">
                                Resource assigned with {executionResults.dispatch.data?.outputData?.confidenceScore || 92}% confidence
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Estimated Arrival:</span>
                                <span className="ml-2 font-medium">
                                  {executionResults.dispatch.data?.outputData?.estimatedArrival ?
                                    new Date(executionResults.dispatch.data.outputData.estimatedArrival).toLocaleTimeString() :
                                    '12 minutes'
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Cultural Optimizations:</span>
                                <span className="ml-2 font-medium">
                                  {executionResults.dispatch.data?.outputData?.culturalConsiderations?.length || 2} applied
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>Error: {executionResults.dispatch.error}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Execute" to test dispatch optimization</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Saksham Analytics</CardTitle>
                  <p className="text-sm text-gray-600">
                    Implementation phases and strategic engine roadmap
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(IMPLEMENTATION_PHASES).map(([phaseKey, phase]) => (
                      <div key={phaseKey} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">{phase.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {phase.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{phase.target}</p>
                        <div className="space-y-2">
                          {phase.engines.map((engine, index) => (
                            <div
                              key={index}
                              className={`text-xs px-2 py-1 rounded ${PHASE_1_ENGINES.some(e => engine.toLowerCase().includes(e.split('_')[0]))
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                              {engine}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Project Saksham v1.0.0 - Strategic Engine Architecture by AI IVR v2 Platform</p>
            <p>Transforming Business Intelligence through Autonomous AI Systems</p>
          </div>
        </div>
      </div>
    </ManagementLayout>
  );
};

export default StrategicEnginesDemo;