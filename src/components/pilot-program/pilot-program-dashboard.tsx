'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Activity, 
    Users, 
    TrendingUp, 
    Clock, 
    AlertTriangle,
    CheckCircle,
    Target,
    BarChart3,
    MessageSquare,
    Settings
} from 'lucide-react';

interface PilotProgram {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    objectives: Array<{
        id: string;
        description: string;
        priority: string;
    }>;
}

interface PilotClient {
    id: string;
    name: string;
    type: string;
    status: string;
    currentMetrics: {
        customerSatisfaction: { current: number; target: number; status: string };
        waitTimeReduction: { current: number; target: number; status: string };
        culturalAccuracy: { current: number; target: number; status: string };
    };
}

interface PilotReport {
    programOverview: {
        status: string;
        duration: {
            daysElapsed: number;
            daysRemaining: number;
        };
    };
    clientReports: Array<{
        clientId: string;
        clientName: string;
        status: string;
        feedbackSummary: {
            totalFeedback: number;
            averageRating: number;
        };
        recommendations: Array<{
            priority: string;
            title: string;
        }>;
    }>;
    overallProgress: {
        averageSatisfactionImprovement: number;
        averageWaitTimeReduction: number;
        totalFeedbackCollected: number;
        criticalIssues: number;
    };
}

export default function PilotProgramDashboard() {
    const [program, setProgram] = useState<PilotProgram | null>(null);
    const [clients, setClients] = useState<PilotClient[]>([]);
    const [report, setReport] = useState<PilotReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState<string | null>(null);

    useEffect(() => {
        loadPilotData();
    }, []);

    const loadPilotData = async () => {
        try {
            setLoading(true);
            
            // Load pilot program with clients and report
            const response = await fetch('/api/pilot-program?includeClients=true&includeReport=true');
            const data = await response.json();
            
            if (data.program) {
                setProgram(data.program);
                setClients(data.clients || []);
                setReport(data.report);
            }
        } catch (error) {
            console.error('Error loading pilot data:', error);
        } finally {
            setLoading(false);
        }
    };

    const initializePilot = async () => {
        try {
            setLoading(true);
            
            // Select clients
            await fetch('/api/pilot-program', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'select-clients' })
            });
            
            // Start metrics collection
            await fetch('/api/pilot-program', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start-metrics-collection' })
            });
            
            // Reload data
            await loadPilotData();
        } catch (error) {
            console.error('Error initializing pilot:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'above_target': return 'bg-green-500';
            case 'on_target': return 'bg-blue-500';
            case 'below_target': return 'bg-yellow-500';
            case 'active': case 'completed': return 'bg-green-500';
            case 'onboarding': return 'bg-blue-500';
            case 'pending': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!program || clients.length === 0) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Pilot Client Program Setup</h2>
                    <p className="text-gray-600 mb-6">
                        Ready to begin the Strategic Engines validation with Kerala-based clients
                    </p>
                    <Button onClick={initializePilot} size="lg" className="mb-4">
                        <Users className="mr-2 h-5 w-5" />
                        Initialize Pilot Program
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="mr-2 h-5 w-5" />
                                Target Clients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li>• Kerala State Taxi Operators Union</li>
                                <li>• Metro Rides Kerala</li>
                                <li>• Spice Coast Logistics</li>
                            </ul>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5" />
                                Success Targets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li>• 30% Satisfaction Increase</li>
                                <li>• 25% Wait Time Reduction</li>
                                <li>• 95% Cultural Accuracy</li>
                            </ul>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="mr-2 h-5 w-5" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li>• 60-day pilot duration</li>
                                <li>• Weekly progress reviews</li>
                                <li>• Real-time monitoring</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Program Overview Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{program.name}</h1>
                    <p className="text-gray-600">Strategic Engines Pilot Program</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(program.status)}>
                        {program.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Button variant="outline" onClick={loadPilotData}>
                        <Activity className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics Summary */}
            {report && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Satisfaction Improvement</p>
                                    <p className="text-2xl font-bold">
                                        {Math.round(report.overallProgress.averageSatisfactionImprovement - 65)}%
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-pink-500" />
                            </div>
                            <Progress 
                                value={(Math.round(report.overallProgress.averageSatisfactionImprovement - 65) / 30) * 100} 
                                className="mt-2" 
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Wait Time Reduction</p>
                                    <p className="text-2xl font-bold">
                                        {Math.round(report.overallProgress.averageWaitTimeReduction)}%
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-500" />
                            </div>
                            <Progress 
                                value={(report.overallProgress.averageWaitTimeReduction / 25) * 100} 
                                className="mt-2" 
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Feedback Collected</p>
                                    <p className="text-2xl font-bold">{report.overallProgress.totalFeedbackCollected}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                                    <p className="text-2xl font-bold">{report.overallProgress.criticalIssues}</p>
                                </div>
                                {report.overallProgress.criticalIssues > 0 ? 
                                    <AlertTriangle className="h-8 w-8 text-red-500" /> :
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Program Objectives */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Program Objectives</CardTitle>
                                <CardDescription>Key goals for the pilot program</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {program.objectives.map((objective) => (
                                        <div key={objective.id} className="flex items-start space-x-2">
                                            <Badge variant={objective.priority === 'high' ? 'destructive' : 'secondary'}>
                                                {objective.priority}
                                            </Badge>
                                            <p className="text-sm flex-1">{objective.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Program Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Program Progress</CardTitle>
                                <CardDescription>
                                    {report ? 
                                        `${report.programOverview.duration.daysElapsed} days elapsed, ${report.programOverview.duration.daysRemaining} days remaining` :
                                        'Timeline information'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {report && (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Program Progress</span>
                                                <span>
                                                    {Math.round((report.programOverview.duration.daysElapsed / 
                                                        (report.programOverview.duration.daysElapsed + report.programOverview.duration.daysRemaining)) * 100)}%
                                                </span>
                                            </div>
                                            <Progress 
                                                value={(report.programOverview.duration.daysElapsed / 
                                                    (report.programOverview.duration.daysElapsed + report.programOverview.duration.daysRemaining)) * 100} 
                                            />
                                        </div>
                                        
                                        <Alert>
                                            <Activity className="h-4 w-4" />
                                            <AlertDescription>
                                                Pilot program is on track with active client engagement and positive initial results.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="clients">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clients.map((client) => (
                            <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow"
                                  onClick={() => setSelectedClient(client.id)}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{client.name}</CardTitle>
                                            <CardDescription>{client.type.replace('_', ' ')}</CardDescription>
                                        </div>
                                        <Badge className={getStatusColor(client.status)}>
                                            {client.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Satisfaction</span>
                                                <span>{Math.round(client.currentMetrics.customerSatisfaction.current)}%</span>
                                            </div>
                                            <Progress 
                                                value={(client.currentMetrics.customerSatisfaction.current / client.currentMetrics.customerSatisfaction.target) * 100} 
                                            />
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Wait Time Reduction</span>
                                                <span>{Math.round(client.currentMetrics.waitTimeReduction.current)}%</span>
                                            </div>
                                            <Progress 
                                                value={(client.currentMetrics.waitTimeReduction.current / client.currentMetrics.waitTimeReduction.target) * 100} 
                                            />
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Cultural Accuracy</span>
                                                <span>{Math.round(client.currentMetrics.culturalAccuracy.current)}%</span>
                                            </div>
                                            <Progress 
                                                value={(client.currentMetrics.culturalAccuracy.current / client.currentMetrics.culturalAccuracy.target) * 100} 
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="metrics">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5" />
                                Performance Metrics
                            </CardTitle>
                            <CardDescription>
                                Real-time performance tracking across all pilot clients
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {report && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Satisfaction Progress</h4>
                                            {report.clientReports.map((client) => (
                                                <div key={client.clientId} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>{client.clientName}</span>
                                                        <span>Rating: {client.feedbackSummary.averageRating.toFixed(1)}/5</span>
                                                    </div>
                                                    <Progress value={client.feedbackSummary.averageRating * 20} />
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Recommendations</h4>
                                            {report.clientReports.map((client) => (
                                                <div key={client.clientId} className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium">{client.clientName}</span>
                                                        <Badge variant="outline">
                                                            {client.recommendations.length} recommendations
                                                        </Badge>
                                                    </div>
                                                    {client.recommendations.slice(0, 2).map((rec, idx) => (
                                                        <div key={idx} className="text-xs text-gray-600 ml-4">
                                                            • {rec.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="feedback">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Client Feedback Overview
                            </CardTitle>
                            <CardDescription>
                                Consolidated feedback from all pilot clients
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {report && (
                                <div className="space-y-4">
                                    {report.clientReports.map((client) => (
                                        <div key={client.clientId} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold">{client.clientName}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="outline">
                                                        {client.feedbackSummary.totalFeedback} feedback items
                                                    </Badge>
                                                    <Badge className={client.feedbackSummary.averageRating >= 4 ? 'bg-green-500' : 
                                                                   client.feedbackSummary.averageRating >= 3 ? 'bg-yellow-500' : 'bg-red-500'}>
                                                        {client.feedbackSummary.averageRating.toFixed(1)}/5
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Engagement level: {client.feedbackSummary.totalFeedback > 10 ? 'High' : 
                                                                   client.feedbackSummary.totalFeedback > 5 ? 'Medium' : 'Low'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="mr-2 h-5 w-5" />
                                Program Timeline
                            </CardTitle>
                            <CardDescription>
                                Milestones and progress tracking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Pilot program successfully initiated with all 3 target clients onboarded.
                                    </AlertDescription>
                                </Alert>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">Client Selection Complete</span>
                                        <Badge variant="outline">Completed</Badge>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm">Baseline Measurement</span>
                                        <Badge variant="outline">In Progress</Badge>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        <span className="text-sm">Strategic Engines Deployment</span>
                                        <Badge variant="outline">Upcoming</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}