'use client';

import React, { useState, useEffect } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    TestTube,
    Play,
    Pause,
    RotateCcw,
    Settings,
    BarChart3,
    Activity,
    Zap,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    TrendingUp,
    Download,
    Upload,
    Filter,
    Search,
    Layers,
    Cpu,
    HardDrive,
    Network,
    Server,
    Workflow,
    GitBranch,
    Eye,
    Edit,
    Trash2,
    Plus,
    RefreshCw,
    Target,
    Gauge,
    Timer,
    Users,
    Globe,
    Headphones,
    Mic,
    Speaker,
    Volume2,
    Radio as Waveform,
    Radio,
    Lightning,
    CheckCircle as CheckCircle2,
    XCircle as XCircleIcon,
    AlertCircle,
    Info,
    TrendingDown,
    TrendingUp as TrendingUpIcon,
    BarChart3 as BarChart,
    LineChart,
    PieChart,
    Activity as ActivityIcon,
    Timer as TimerIcon,
    Target as TargetIcon,
    Gauge as GaugeIcon,
    Zap as ZapIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api-client';
import { useMockData } from '@/hooks/use-mock-data';

interface TestSuite {
    id: string;
    name: string;
    description: string;
    type: 'quality' | 'accuracy' | 'latency' | 'performance' | 'comprehensive';
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    testCases: TestCase[];
    createdAt: string;
    updatedAt: string;
    results: TestResults;
}

interface TestCase {
    id: string;
    name: string;
    type: 'stt' | 'tts' | 'voice_cloning' | 'speech_recognition' | 'audio_quality';
    modelId: string;
    inputData: string;
    expectedOutput?: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    duration?: number;
    error?: string;
    metrics: {
        accuracy?: number;
        latency?: number;
        quality?: number;
        similarity?: number;
    };
}

interface TestResults {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    avgLatency: number;
    avgAccuracy: number;
    avgQuality: number;
    totalDuration: number;
    coverage: number;
}

interface TestConfiguration {
    id: string;
    name: string;
    description: string;
    testTypes: string[];
    models: string[];
    datasets: string[];
    parameters: {
        sampleRate: number;
        channels: number;
        duration: number;
        noiseLevel: number;
        language: string;
    };
}

export default function VoiceTestingSuitePage() {
    const { isDemoMode } = useMockData();
    const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
    const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
    const [showCreateSuiteDialog, setShowCreateSuiteDialog] = useState(false);
    const [showTestDetails, setShowTestDetails] = useState(false);
    const [showRunTestDialog, setShowRunTestDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    const [suiteForm, setSuiteForm] = useState({
        name: '',
        description: '',
        type: 'comprehensive' as 'quality' | 'accuracy' | 'latency' | 'performance' | 'comprehensive'
    });

    const [selectedTab, setSelectedTab] = useState('suites');

    // Load test suites data
    useEffect(() => {
        loadTestSuites();
    }, [isDemoMode]);

    const loadTestSuites = async () => {
        try {
            setLoading(true);

            if (isDemoMode) {
                // Mock data for demonstration
                const mockTestSuites: TestSuite[] = [
                    {
                        id: 'suite-1',
                        name: 'Malayalam STT Quality Test Suite',
                        description: 'Comprehensive quality testing for Malayalam speech-to-text models',
                        type: 'quality',
                        status: 'completed',
                        progress: 100,
                        testCases: [
                            {
                                id: 'test-1',
                                name: 'Clean Audio STT Test',
                                type: 'stt',
                                modelId: 'vertex-ai-chirp2',
                                inputData: 'malayalam_clean_audio.wav',
                                expectedOutput: 'Expected Malayalam transcription',
                                status: 'passed',
                                duration: 2.3,
                                metrics: {
                                    accuracy: 94.2,
                                    latency: 1.8,
                                    quality: 92.1
                                }
                            },
                            {
                                id: 'test-2',
                                name: 'Noisy Audio STT Test',
                                type: 'stt',
                                modelId: 'assembly-ai',
                                inputData: 'malayalam_noisy_audio.wav',
                                expectedOutput: 'Expected Malayalam transcription',
                                status: 'passed',
                                duration: 3.1,
                                metrics: {
                                    accuracy: 87.6,
                                    latency: 2.2,
                                    quality: 85.4
                                }
                            },
                            {
                                id: 'test-3',
                                name: 'Long Audio STT Test',
                                type: 'stt',
                                modelId: 'ai4bharat-whisper',
                                inputData: 'malayalam_long_audio.wav',
                                expectedOutput: 'Expected Malayalam transcription',
                                status: 'failed',
                                duration: 15.7,
                                error: 'Timeout exceeded',
                                metrics: {
                                    accuracy: 0,
                                    latency: 15.7,
                                    quality: 0
                                }
                            }
                        ],
                        createdAt: '2024-11-01T10:00:00Z',
                        updatedAt: '2024-11-08T15:30:00Z',
                        results: {
                            totalTests: 3,
                            passedTests: 2,
                            failedTests: 1,
                            avgLatency: 7.2,
                            avgAccuracy: 60.6,
                            avgQuality: 59.2,
                            totalDuration: 21.1,
                            coverage: 85.3
                        }
                    },
                    {
                        id: 'suite-2',
                        name: 'Voice Synthesis Performance Test',
                        description: 'Performance testing for voice synthesis models',
                        type: 'performance',
                        status: 'running',
                        progress: 67,
                        testCases: [
                            {
                                id: 'test-4',
                                name: 'TTS Speed Test',
                                type: 'tts',
                                modelId: 'elevenlabs-voice-1',
                                inputData: 'Hello world in Malayalam',
                                expectedOutput: 'synthesized_audio.wav',
                                status: 'running',
                                duration: 1.2,
                                metrics: {
                                    latency: 1.2,
                                    quality: 88.5,
                                    similarity: 92.1
                                }
                            },
                            {
                                id: 'test-5',
                                name: 'TTS Quality Test',
                                type: 'tts',
                                modelId: 'elevenlabs-voice-2',
                                inputData: 'Complex Malayalam sentence',
                                expectedOutput: 'synthesized_audio.wav',
                                status: 'pending',
                                metrics: {}
                            }
                        ],
                        createdAt: '2024-11-02T14:20:00Z',
                        updatedAt: '2024-11-08T16:45:00Z',
                        results: {
                            totalTests: 2,
                            passedTests: 0,
                            failedTests: 0,
                            avgLatency: 1.2,
                            avgAccuracy: 0,
                            avgQuality: 88.5,
                            totalDuration: 1.2,
                            coverage: 50.0
                        }
                    }
                ];

                setTestSuites(mockTestSuites);
            } else {
                // Real API call
                const response = await api.getVoiceTestingSuites();
                setTestSuites(response.data);
            }
        } catch (error) {
            console.error('Error loading test suites:', error);
            toast({
                title: 'Error',
                description: 'Failed to load voice testing suites',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'idle': return 'bg-gray-100 text-gray-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-slate-100 text-slate-800';
            case 'passed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTestTypeIcon = (type: string) => {
        switch (type) {
            case 'stt': return Mic;
            case 'tts': return Speaker;
            case 'voice_cloning': return Users;
            case 'speech_recognition': return Radio;
            case 'audio_quality': return Waveform;
            default: return Activity;
        }
    };

    const handleCreateSuite = () => {
        if (!suiteForm.name) {
            toast({
                title: "Validation Error",
                description: "Test suite name is required.",
                variant: "destructive"
            });
            return;
        }

        const newSuite: TestSuite = {
            id: `suite-${Date.now()}`,
            name: suiteForm.name,
            description: suiteForm.description,
            type: suiteForm.type,
            status: 'idle',
            progress: 0,
            testCases: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            results: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                avgLatency: 0,
                avgAccuracy: 0,
                avgQuality: 0,
                totalDuration: 0,
                coverage: 0
            }
        };

        setTestSuites([...testSuites, newSuite]);
        setSuiteForm({
            name: '',
            description: '',
            type: 'comprehensive'
        });
        setShowCreateSuiteDialog(false);

        toast({
            title: "Test Suite Created",
            description: `Test suite "${newSuite.name}" has been created.`,
        });
    };

    const handleRunSuite = (suite: TestSuite) => {
        setTestSuites(testSuites.map(s =>
            s.id === suite.id
                ? { ...s, status: 'running' as const, updatedAt: new Date().toISOString() }
                : s
        ));

        // Simulate test suite execution
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTestSuites(testSuites.map(s =>
                    s.id === suite.id
                        ? {
                            ...s,
                            status: 'completed' as const,
                            progress: 100,
                            updatedAt: new Date().toISOString(),
                            results: {
                                ...s.results,
                                passedTests: Math.floor(s.results.totalTests * 0.85),
                                failedTests: Math.floor(s.results.totalTests * 0.15),
                                avgAccuracy: 87.3,
                                avgQuality: 84.6,
                                coverage: 92.1
                            }
                        }
                        : s
                ));
            } else {
                setTestSuites(testSuites.map(s =>
                    s.id === suite.id
                        ? { ...s, progress: Math.round(progress) }
                        : s
                ));
            }
        }, 1500);

        toast({
            title: "Test Suite Started",
            description: `Test suite "${suite.name}" is now running.`,
        });
    };

    const handlePauseSuite = (suite: TestSuite) => {
        setTestSuites(testSuites.map(s =>
            s.id === suite.id
                ? { ...s, status: 'idle' as const, updatedAt: new Date().toISOString() }
                : s
        ));

        toast({
            title: "Test Suite Paused",
            description: `Test suite "${suite.name}" has been paused.`,
        });
    };

    const calculateSuiteMetrics = () => {
        const totalSuites = testSuites.length;
        const runningSuites = testSuites.filter(s => s.status === 'running').length;
        const completedSuites = testSuites.filter(s => s.status === 'completed').length;
        const avgAccuracy = testSuites.length > 0
            ? testSuites.reduce((sum, s) => sum + s.results.avgAccuracy, 0) / testSuites.length
            : 0;
        const avgQuality = testSuites.length > 0
            ? testSuites.reduce((sum, s) => sum + s.results.avgQuality, 0) / testSuites.length
            : 0;
        const totalTests = testSuites.reduce((sum, s) => sum + s.results.totalTests, 0);
        const passedTests = testSuites.reduce((sum, s) => sum + s.results.passedTests, 0);

        return {
            totalSuites,
            runningSuites,
            completedSuites,
            avgAccuracy: Math.round(avgAccuracy * 10) / 10,
            avgQuality: Math.round(avgQuality * 10) / 10,
            totalTests,
            passedTests,
            successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 1000) / 10 : 0
        };
    };

    const suiteMetrics = calculateSuiteMetrics();

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <TestTube className="h-8 w-8 text-purple-600" />
                            Voice Testing Suite
                        </h1>
                        <p className="text-muted-foreground">
                            Comprehensive testing framework for voice AI models and pipelines
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                        <Button size="sm" onClick={() => setShowCreateSuiteDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Test Suite
                        </Button>
                    </div>
                </div>

                {/* Suite Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Suites</p>
                                    <p className="text-2xl font-bold">{suiteMetrics.runningSuites}/{suiteMetrics.totalSuites}</p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                                    <p className="text-2xl font-bold">{suiteMetrics.successRate}%</p>
                                </div>
                                <Target className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Accuracy</p>
                                    <p className="text-2xl font-bold">{suiteMetrics.avgAccuracy}%</p>
                                </div>
                                <Gauge className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                                    <p className="text-2xl font-bold">{suiteMetrics.totalTests}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="suites">Test Suites</TabsTrigger>
                        <TabsTrigger value="results">Test Results</TabsTrigger>
                        <TabsTrigger value="configurations">Configurations</TabsTrigger>
                        <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                    </TabsList>

                    <TabsContent value="suites" className="space-y-6">
                        {/* Suite Controls */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search test suites..."
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="quality">Quality</SelectItem>
                                            <SelectItem value="accuracy">Accuracy</SelectItem>
                                            <SelectItem value="latency">Latency</SelectItem>
                                            <SelectItem value="performance">Performance</SelectItem>
                                            <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="running">Running</SelectItem>
                                            <SelectItem value="idle">Idle</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Test Suites List */}
                        <div className="grid grid-cols-1 gap-4">
                            {testSuites.map((suite) => (
                                <Card key={suite.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <TestTube className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{suite.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{suite.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={getStatusColor(suite.type)}>
                                                    {suite.type}
                                                </Badge>
                                                <Badge className={getStatusColor(suite.status)}>
                                                    {suite.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">Progress</span>
                                                <span className="text-sm text-muted-foreground">{suite.progress}%</span>
                                            </div>
                                            <Progress value={suite.progress} className="w-full" />
                                        </div>

                                        {/* Test Results Summary */}
                                        <div className="grid grid-cols-5 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">{suite.results.totalTests}</div>
                                                <div className="text-xs text-muted-foreground">Total Tests</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-green-600">{suite.results.passedTests}</div>
                                                <div className="text-xs text-muted-foreground">Passed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-red-600">{suite.results.failedTests}</div>
                                                <div className="text-xs text-muted-foreground">Failed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">{suite.results.avgAccuracy}%</div>
                                                <div className="text-xs text-muted-foreground">Accuracy</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold">{suite.results.avgLatency}s</div>
                                                <div className="text-xs text-muted-foreground">Latency</div>
                                            </div>
                                        </div>

                                        {/* Test Cases Preview */}
                                        <div className="mb-4">
                                            <h4 className="font-medium mb-3">Recent Test Cases</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {suite.testCases.slice(0, 4).map((testCase) => {
                                                    const TestIcon = getTestTypeIcon(testCase.type);
                                                    return (
                                                        <div key={testCase.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                                            <div className={`p-1 rounded ${testCase.status === 'passed' ? 'bg-green-100' : testCase.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'}`}>
                                                                <TestIcon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{testCase.name}</p>
                                                                <p className="text-xs text-muted-foreground">{testCase.type.toUpperCase()}</p>
                                                            </div>
                                                            <Badge className={getStatusColor(testCase.status)} variant="outline">
                                                                {testCase.status}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                Updated {new Date(suite.updatedAt).toLocaleString()}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedSuite(suite);
                                                        setShowTestDetails(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Details
                                                </Button>
                                                {suite.status === 'idle' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleRunSuite(suite)}
                                                    >
                                                        <Play className="h-4 w-4 mr-1" />
                                                        Run Suite
                                                    </Button>
                                                )}
                                                {suite.status === 'running' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handlePauseSuite(suite)}
                                                    >
                                                        <Pause className="h-4 w-4 mr-1" />
                                                        Pause
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline">
                                                    <Settings className="h-4 w-4 mr-1" />
                                                    Configure
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="results">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Results Analysis</CardTitle>
                                <CardDescription>
                                    Detailed analysis of test suite results and performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Results Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-green-600">{suiteMetrics.passedTests}</div>
                                                    <div className="text-sm text-muted-foreground">Tests Passed</div>
                                                    <div className="mt-2">
                                                        <Progress value={(suiteMetrics.passedTests / suiteMetrics.totalTests) * 100} className="h-2" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-blue-600">{suiteMetrics.avgAccuracy}%</div>
                                                    <div className="text-sm text-muted-foreground">Average Accuracy</div>
                                                    <div className="mt-2">
                                                        <Progress value={suiteMetrics.avgAccuracy} className="h-2" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-purple-600">{suiteMetrics.avgQuality}%</div>
                                                    <div className="text-sm text-muted-foreground">Average Quality</div>
                                                    <div className="mt-2">
                                                        <Progress value={suiteMetrics.avgQuality} className="h-2" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Detailed Results Table */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Recent Test Results</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Test Case</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Model</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Accuracy</TableHead>
                                                        <TableHead>Latency</TableHead>
                                                        <TableHead>Quality</TableHead>
                                                        <TableHead>Duration</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {testSuites.flatMap(suite =>
                                                        suite.testCases.map(testCase => (
                                                            <TableRow key={testCase.id}>
                                                                <TableCell className="font-medium">{testCase.name}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{testCase.type.toUpperCase()}</Badge>
                                                                </TableCell>
                                                                <TableCell>{testCase.modelId}</TableCell>
                                                                <TableCell>
                                                                    <Badge className={getStatusColor(testCase.status)}>
                                                                        {testCase.status}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>{testCase.metrics.accuracy || 0}%</TableCell>
                                                                <TableCell>{testCase.metrics.latency || 0}s</TableCell>
                                                                <TableCell>{testCase.metrics.quality || 0}%</TableCell>
                                                                <TableCell>{testCase.duration || 0}s</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="configurations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Configurations</CardTitle>
                                <CardDescription>
                                    Manage test configurations and parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Test Configurations</h3>
                                    <p className="text-muted-foreground">
                                        Advanced test configuration management will appear here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="monitoring">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Real-time Test Monitoring</CardTitle>
                                    <CardDescription>
                                        Live monitoring of running test suites and performance metrics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Active Tests</span>
                                            <span className="font-medium">{suiteMetrics.runningSuites}</span>
                                        </div>
                                        <Progress value={(suiteMetrics.runningSuites / suiteMetrics.totalSuites) * 100} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Test Throughput</span>
                                            <span className="font-medium">12.5 tests/min</span>
                                        </div>
                                        <Progress value={75} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Resource Usage</span>
                                            <span className="font-medium">68%</span>
                                        </div>
                                        <Progress value={68} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span>Error Rate</span>
                                            <span className="font-medium">2.3%</span>
                                        </div>
                                        <Progress value={23} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Trends</CardTitle>
                                    <CardDescription>
                                        Historical performance trends and analytics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">+5.2%</div>
                                            <div className="text-sm text-muted-foreground">Accuracy Improvement</div>
                                            <TrendingUpIcon className="h-6 w-6 text-green-600 mx-auto mt-2" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-xl font-semibold">-0.3s</div>
                                                <div className="text-xs text-muted-foreground">Latency Reduction</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-semibold">+8.1%</div>
                                                <div className="text-xs text-muted-foreground">Quality Score</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Create Test Suite Dialog */}
                <Dialog open={showCreateSuiteDialog} onOpenChange={setShowCreateSuiteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Test Suite</DialogTitle>
                            <DialogDescription>
                                Set up a new test suite for voice AI model evaluation
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="suiteName">Suite Name</Label>
                                <Input
                                    id="suiteName"
                                    value={suiteForm.name}
                                    onChange={(e) => setSuiteForm({ ...suiteForm, name: e.target.value })}
                                    placeholder="e.g., Malayalam STT Comprehensive Test Suite"
                                />
                            </div>

                            <div>
                                <Label htmlFor="suiteDescription">Description</Label>
                                <Textarea
                                    id="suiteDescription"
                                    value={suiteForm.description}
                                    onChange={(e) => setSuiteForm({ ...suiteForm, description: e.target.value })}
                                    placeholder="Describe the test suite's purpose and scope"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="suiteType">Test Type</Label>
                                <Select
                                    value={suiteForm.type}
                                    onValueChange={(value: 'quality' | 'accuracy' | 'latency' | 'performance' | 'comprehensive') =>
                                        setSuiteForm({ ...suiteForm, type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quality">Quality Testing</SelectItem>
                                        <SelectItem value="accuracy">Accuracy Testing</SelectItem>
                                        <SelectItem value="latency">Latency Testing</SelectItem>
                                        <SelectItem value="performance">Performance Testing</SelectItem>
                                        <SelectItem value="comprehensive">Comprehensive Testing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateSuiteDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateSuite}>
                                Create Suite
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Test Suite Details Dialog */}
                <Dialog open={showTestDetails} onOpenChange={setShowTestDetails}>
                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Test Suite Details</DialogTitle>
                            <DialogDescription>
                                Detailed view of test suite configuration and results
                            </DialogDescription>
                        </DialogHeader>

                        {selectedSuite && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Suite Name</Label>
                                        <p className="text-sm">{selectedSuite.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Type</Label>
                                        <Badge className={getStatusColor(selectedSuite.type)}>
                                            {selectedSuite.type}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <Badge className={getStatusColor(selectedSuite.status)}>
                                            {selectedSuite.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Progress</Label>
                                        <p className="text-sm">{selectedSuite.progress}%</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Description</Label>
                                    <p className="text-sm text-muted-foreground">{selectedSuite.description}</p>
                                </div>

                                {/* Test Results Summary */}
                                <div className="grid grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">{selectedSuite.results.totalTests}</div>
                                                <div className="text-xs text-muted-foreground">Total Tests</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">{selectedSuite.results.passedTests}</div>
                                                <div className="text-xs text-muted-foreground">Passed</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">{selectedSuite.results.avgAccuracy}%</div>
                                                <div className="text-xs text-muted-foreground">Avg Accuracy</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">{selectedSuite.results.totalDuration}s</div>
                                                <div className="text-xs text-muted-foreground">Total Duration</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Test Cases Table */}
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">Test Cases</Label>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Test Case</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Model</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Accuracy</TableHead>
                                                <TableHead>Latency</TableHead>
                                                <TableHead>Quality</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedSuite.testCases.map((testCase) => {
                                                const TestIcon = getTestTypeIcon(testCase.type);
                                                return (
                                                    <TableRow key={testCase.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <TestIcon className="h-4 w-4" />
                                                                <span className="font-medium">{testCase.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{testCase.type.toUpperCase()}</Badge>
                                                        </TableCell>
                                                        <TableCell>{testCase.modelId}</TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor(testCase.status)}>
                                                                {testCase.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{testCase.metrics.accuracy || 0}%</TableCell>
                                                        <TableCell>{testCase.metrics.latency || 0}s</TableCell>
                                                        <TableCell>{testCase.metrics.quality || 0}%</TableCell>
                                                        <TableCell>{testCase.duration || 0}s</TableCell>
                                                        <TableCell>
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Details
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-sm font-medium mb-3 block">Timestamps</Label>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Created:</span>
                                                <span className="text-sm font-medium">
                                                    {new Date(selectedSuite.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Updated:</span>
                                                <span className="text-sm font-medium">
                                                    {new Date(selectedSuite.updatedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium mb-3 block">Coverage</Label>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Test Coverage:</span>
                                                <span className="text-sm font-medium">{selectedSuite.results.coverage}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Models Tested:</span>
                                                <span className="text-sm font-medium">
                                                    {new Set(selectedSuite.testCases.map(tc => tc.modelId)).size}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowTestDetails(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ManagementLayout>
    );
}