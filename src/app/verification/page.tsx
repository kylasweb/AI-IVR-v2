'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CheckCircle,
    XCircle,
    Clock,
    Play,
    X,
    Mic,
    Phone,
    Database,
    MessageSquare,
    Brain,
    Settings,
    Activity,
    Users,
    Car,
    FileText,
    GitBranch,
    Bot
} from 'lucide-react';
import { useRealTimeWorkflowData } from '@/hooks/use-realtime-workflows';
import { AMDDetectionService, DEFAULT_AMD_CONFIG } from '@/services/amd-detection-service';

interface TestResult {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    duration?: number;
    error?: string;
    details?: any;
    timestamp?: Date;
}

interface TestSuite {
    name: string;
    description: string;
    icon: React.ReactNode;
    tests: TestResult[];
    progress: number;
}

export default function VerificationPage() {
    const [currentTest, setCurrentTest] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
    const [overallProgress, setOverallProgress] = useState(0);
    const [isRunningAll, setIsRunningAll] = useState(false);
    const [selectedSuite, setSelectedSuite] = useState('workflow');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [testPhoneNumber, setTestPhoneNumber] = useState('+918888888888');
    const [testMessage, setTestMessage] = useState('Test message for verification');
    const [testLanguage, setTestLanguage] = useState('malayalam');

    const audioRef = useRef<HTMLAudioElement>(null);
    const amdService = useRef<AMDDetectionService>(new AMDDetectionService(DEFAULT_AMD_CONFIG));

    // Real-time data hooks
    const {
        data,
        isConnected: wsConnected,
        executeWorkflow,
        stopExecution
    } = useRealTimeWorkflowData(); const testSuites: TestSuite[] = [
        {
            name: 'IVR Workflows',
            description: 'Test workflow execution, node processing, and real-time monitoring',
            icon: <GitBranch className="h-5 w-5" />,
            tests: [
                { id: 'workflow_load', name: 'Load Workflow Templates', status: 'pending' },
                { id: 'workflow_validate', name: 'Validate Node Connections', status: 'pending' },
                { id: 'workflow_execute', name: 'Execute Sample Workflow', status: 'pending' },
                { id: 'workflow_realtime', name: 'Real-time Status Updates', status: 'pending' },
                { id: 'workflow_cultural', name: 'Cultural Intelligence Nodes', status: 'pending' },
            ],
            progress: 0,
        },
        {
            name: 'AI Agents',
            description: 'Test AI agent templates, conversation management, and Malayalam support',
            icon: <Bot className="h-5 w-5" />,
            tests: [
                { id: 'agent_templates', name: 'Load Agent Templates', status: 'pending' },
                { id: 'agent_healthcare', name: 'Healthcare Agent Response', status: 'pending' },
                { id: 'agent_legal', name: 'Legal Advisory Agent', status: 'pending' },
                { id: 'agent_malayalam', name: 'Malayalam Conversation', status: 'pending' },
                { id: 'agent_cultural', name: 'Cultural Context Awareness', status: 'pending' },
            ],
            progress: 0,
        },
        {
            name: 'AMD Detection',
            description: 'Test answering machine detection, audio analysis, and cultural patterns',
            icon: <Phone className="h-5 w-5" />,
            tests: [
                { id: 'amd_init', name: 'Initialize AMD Service', status: 'pending' },
                { id: 'amd_audio', name: 'Audio Feature Extraction', status: 'pending' },
                { id: 'amd_ml', name: 'ML-based Detection', status: 'pending' },
                { id: 'amd_cultural', name: 'Malayalam Pattern Recognition', status: 'pending' },
                { id: 'amd_beep', name: 'Beep Detection', status: 'pending' },
            ],
            progress: 0,
        },
        {
            name: 'Speech Services',
            description: 'Test speech-to-text, text-to-speech, and Malayalam language support',
            icon: <Mic className="h-5 w-5" />,
            tests: [
                { id: 'stt_english', name: 'English Speech Recognition', status: 'pending' },
                { id: 'stt_malayalam', name: 'Malayalam Speech Recognition', status: 'pending' },
                { id: 'tts_english', name: 'English Text-to-Speech', status: 'pending' },
                { id: 'tts_malayalam', name: 'Malayalam Text-to-Speech', status: 'pending' },
                { id: 'voice_quality', name: 'Voice Quality Analysis', status: 'pending' },
            ],
            progress: 0,
        },
        {
            name: 'Database Operations',
            description: 'Test database connectivity, CRUD operations, and data integrity',
            icon: <Database className="h-5 w-5" />,
            tests: [
                { id: 'db_connect', name: 'Database Connection', status: 'pending' },
                { id: 'db_drivers', name: 'Driver Management', status: 'pending' },
                { id: 'db_rides', name: 'Ride Operations', status: 'pending' },
                { id: 'db_workflows', name: 'Workflow Persistence', status: 'pending' },
                { id: 'db_analytics', name: 'Analytics Data', status: 'pending' },
            ],
            progress: 0,
        },
        {
            name: 'API Integrations',
            description: 'Test REST APIs, WebSocket connections, and external service integrations',
            icon: <Activity className="h-5 w-5" />,
            tests: [
                { id: 'api_health', name: 'Health Check Endpoint', status: 'pending' },
                { id: 'api_websocket', name: 'WebSocket Connection', status: 'pending' },
                { id: 'api_drivers', name: 'Driver Management API', status: 'pending' },
                { id: 'api_ivr', name: 'IVR Workflow API', status: 'pending' },
                { id: 'api_analytics', name: 'Analytics API', status: 'pending' },
            ],
            progress: 0,
        },
    ];

    // Update test result
    const updateTestResult = (testId: string, result: Partial<TestResult>) => {
        setTestResults(prev => {
            const newResults = new Map(prev);
            const existing = newResults.get(testId) || { id: testId, name: '', status: 'pending' };
            newResults.set(testId, { ...existing, ...result, timestamp: new Date() });
            return newResults;
        });
    };

    // Run individual test
    const runTest = async (testId: string, testName: string) => {
        setCurrentTest(testId);
        updateTestResult(testId, { status: 'running' });

        const startTime = Date.now();

        try {
            let result: any;

            switch (testId) {
                // Workflow Tests
                case 'workflow_load':
                    result = await testWorkflowLoad();
                    break;
                case 'workflow_validate':
                    result = await testWorkflowValidation();
                    break;
                case 'workflow_execute':
                    result = await testWorkflowExecution();
                    break;
                case 'workflow_realtime':
                    result = await testRealtimeUpdates();
                    break;
                case 'workflow_cultural':
                    result = await testCulturalIntelligence();
                    break;

                // AI Agent Tests
                case 'agent_templates':
                    result = await testAgentTemplates();
                    break;
                case 'agent_healthcare':
                    result = await testHealthcareAgent();
                    break;
                case 'agent_legal':
                    result = await testLegalAgent();
                    break;
                case 'agent_malayalam':
                    result = await testMalayalamConversation();
                    break;
                case 'agent_cultural':
                    result = await testCulturalContext();
                    break;

                // AMD Detection Tests
                case 'amd_init':
                    result = await testAMDInitialization();
                    break;
                case 'amd_audio':
                    result = await testAudioFeatureExtraction();
                    break;
                case 'amd_ml':
                    result = await testMLDetection();
                    break;
                case 'amd_cultural':
                    result = await testMalayalamPatterns();
                    break;
                case 'amd_beep':
                    result = await testBeepDetection();
                    break;

                // Speech Service Tests
                case 'stt_english':
                    result = await testEnglishSTT();
                    break;
                case 'stt_malayalam':
                    result = await testMalayalamSTT();
                    break;
                case 'tts_english':
                    result = await testEnglishTTS();
                    break;
                case 'tts_malayalam':
                    result = await testMalayalamTTS();
                    break;
                case 'voice_quality':
                    result = await testVoiceQuality();
                    break;

                // Database Tests
                case 'db_connect':
                    result = await testDatabaseConnection();
                    break;
                case 'db_drivers':
                    result = await testDriverOperations();
                    break;
                case 'db_rides':
                    result = await testRideOperations();
                    break;
                case 'db_workflows':
                    result = await testWorkflowPersistence();
                    break;
                case 'db_analytics':
                    result = await testAnalyticsData();
                    break;

                // API Tests
                case 'api_health':
                    result = await testHealthEndpoint();
                    break;
                case 'api_websocket':
                    result = await testWebSocketConnection();
                    break;
                case 'api_drivers':
                    result = await testDriverAPI();
                    break;
                case 'api_ivr':
                    result = await testIVRAPI();
                    break;
                case 'api_analytics':
                    result = await testAnalyticsAPI();
                    break;

                default:
                    throw new Error(`Unknown test: ${testId}`);
            }

            const duration = Date.now() - startTime;
            updateTestResult(testId, {
                status: 'passed',
                duration,
                details: result
            });

        } catch (error) {
            const duration = Date.now() - startTime;
            updateTestResult(testId, {
                status: 'failed',
                duration,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setCurrentTest(null);
        }
    };

    // Test implementations
    const testWorkflowLoad = async () => {
        const response = await fetch('/api/workflows');
        if (!response.ok) throw new Error('Failed to load workflows');
        const workflows = await response.json();
        return { count: workflows.length, workflows: workflows.slice(0, 3) };
    };

    const testWorkflowValidation = async () => {
        // Test node connection validation
        const testWorkflow = {
            nodes: [
                { id: '1', type: 'start', data: {} },
                { id: '2', type: 'culturalGreeting', data: { language: 'malayalam' } },
                { id: '3', type: 'end', data: {} }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2' },
                { id: 'e2-3', source: '2', target: '3' }
            ]
        };

        // Validate connections
        const validation = validateWorkflowConnections(testWorkflow);
        if (!validation.isValid) throw new Error(validation.errors.join(', '));

        return validation;
    };

    const testWorkflowExecution = async () => {
        if (!wsConnected) throw new Error('WebSocket not connected');

        const workflowId = 'test-workflow-' + Date.now();
        await executeWorkflow(workflowId, { test: true });

        // Wait for execution to start
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            workflowId,
            status: 'executing',
            metrics: data.systemMetrics || {}
        };
    };

    const testRealtimeUpdates = async () => {
        if (!wsConnected) throw new Error('WebSocket not connected');

        const initialMetrics = { ...data.systemMetrics };

        // Wait for metrics to update
        await new Promise(resolve => setTimeout(resolve, 3000));

        const currentMetrics = data.systemMetrics || {};
        const updated = JSON.stringify(currentMetrics) !== JSON.stringify(initialMetrics);
        if (!updated) throw new Error('Real-time updates not working');

        return {
            updated: true,
            initialMetrics,
            currentMetrics
        };
    };

    const testCulturalIntelligence = async () => {
        const culturalData = {
            greeting: 'നമസ്കാരം',
            context: 'kerala',
            festival: 'onam'
        };

        const response = await fetch('/api/cultural-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(culturalData)
        });

        if (!response.ok) throw new Error('Cultural intelligence test failed');
        const result = await response.json();

        return result;
    };

    const testAgentTemplates = async () => {
        const response = await fetch('/api/ai-agents/templates');
        if (!response.ok) throw new Error('Failed to load agent templates');
        const templates = await response.json();

        if (templates.length < 10) {
            throw new Error(`Expected 10+ templates, got ${templates.length}`);
        }

        return { count: templates.length, templates: templates.slice(0, 5) };
    };

    const testHealthcareAgent = async () => {
        const testQuery = {
            message: "I have a headache and fever",
            language: "english",
            context: { location: "kerala", urgency: "medium" }
        };

        const response = await fetch('/api/ai-agents/healthcare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testQuery)
        });

        if (!response.ok) throw new Error('Healthcare agent test failed');
        const result = await response.json();

        return result;
    };

    const testLegalAgent = async () => {
        const testQuery = {
            message: "What are the property registration procedures in Kerala?",
            language: "english",
            context: { location: "kerala", domain: "property" }
        };

        const response = await fetch('/api/ai-agents/legal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testQuery)
        });

        if (!response.ok) throw new Error('Legal agent test failed');
        const result = await response.json();

        return result;
    };

    const testMalayalamConversation = async () => {
        const testQuery = {
            message: "എന്റെ വീട്ടിൽ നിന്ന് ആശുപത്രിയിലേക്ക് ഒരു റൈഡ് വേണം",
            language: "malayalam",
            context: { location: "kochi", service: "ride" }
        };

        const response = await fetch('/api/ai-agents/conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testQuery)
        });

        if (!response.ok) throw new Error('Malayalam conversation test failed');
        const result = await response.json();

        return result;
    };

    const testCulturalContext = async () => {
        const testScenarios = [
            { context: 'onam_festival', expected: 'festive_greeting' },
            { context: 'monsoon_season', expected: 'weather_awareness' },
            { context: 'business_hours', expected: 'time_sensitivity' }
        ];

        const results: any[] = [];
        for (const scenario of testScenarios) {
            const response = await fetch('/api/cultural-context', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scenario)
            });

            if (!response.ok) throw new Error(`Cultural context test failed for ${scenario.context}`);
            const result = await response.json();
            results.push({ scenario: scenario.context, result });
        }

        return results;
    };

    const testAMDInitialization = async () => {
        try {
            const service = amdService.current;
            if (!service) throw new Error('AMD service not initialized');

            const metrics = service.getPerformanceMetrics();

            // Test configuration
            service.updateConfiguration({
                detection: {
                    algorithm: 'hybrid',
                    sensitivityLevel: 0.8,
                    malayalamPatterns: true,
                    culturalAdaptation: true,
                    realTimeProcessing: true
                }
            });

            return {
                initialized: true,
                metrics,
                configUpdated: true
            };
        } catch (error) {
            throw new Error('AMD service initialization failed');
        }
    }; const testAudioFeatureExtraction = async () => {
        if (!audioFile) {
            // Create a test audio buffer
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const buffer = audioContext.createBuffer(1, 44100, 44100);
            const data = buffer.getChannelData(0);

            // Generate test tone
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.5;
            }

            const arrayBuffer = new ArrayBuffer(data.length * 4);
            const view = new Float32Array(arrayBuffer);
            view.set(data);

            const service = amdService.current;
            if (!service) throw new Error('AMD service not available');
            const result = await service.analyzeAudio(arrayBuffer, testPhoneNumber);
            return {
                testAudio: true,
                features: result.audioAnalysis,
                duration: result.detectionTime
            };
        } else {
            const arrayBuffer = await audioFile.arrayBuffer();
            const service = amdService.current;
            if (!service) throw new Error('AMD service not available');
            const result = await service.analyzeAudio(arrayBuffer, testPhoneNumber);
            return {
                realAudio: true,
                fileName: audioFile.name,
                features: result.audioAnalysis,
                duration: result.detectionTime
            };
        }
    };

    const testMLDetection = async () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, 44100 * 3, 44100); // 3 second buffer
        const data = buffer.getChannelData(0);

        // Generate robotic-sounding test audio
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.sin(2 * Math.PI * 800 * i / 44100) * 0.3; // Consistent 800Hz tone
        }

        const arrayBuffer = new ArrayBuffer(data.length * 4);
        const view = new Float32Array(arrayBuffer);
        view.set(data);

        const service = amdService.current;
        if (!service) throw new Error('AMD service not available');
        const result = await service.analyzeAudio(arrayBuffer, testPhoneNumber);

        return {
            isAnsweringMachine: result.isAnsweringMachine,
            confidence: result.confidence,
            indicators: result.audioAnalysis.voiceCharacteristics.machineIndicators,
            recommendation: result.recommendedAction
        };
    };

    const testMalayalamPatterns = async () => {
        // Test with Malayalam greeting audio simulation
        const malayalamTest = {
            text: "നമസ്കാരം, ഞാൻ ഇപ്പോൾ ലഭ്യമല്ല. ദയവായി സന്ദേശം വിടുക.",
            cultural: true
        };

        // Simulate AMD detection with Malayalam context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, 44100 * 2, 44100);
        const arrayBuffer = new ArrayBuffer(buffer.length * 4);

        const service = amdService.current;
        if (!service) throw new Error('AMD service not available');
        const result = await service.analyzeAudio(arrayBuffer, testPhoneNumber);

        return {
            malayalamDetected: result.culturalContext.malayalamGreeting,
            formalityLevel: result.culturalContext.formalityLevel,
            regionalDialect: result.culturalContext.regionalDialect,
            culturalMarkers: result.audioAnalysis.voiceCharacteristics.culturalMarkers
        };
    };

    const testBeepDetection = async () => {
        // Generate test beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, 44100, 44100); // 1 second
        const data = buffer.getChannelData(0);

        // Generate beep at 900Hz for 0.5 seconds
        const beepDuration = 0.5 * 44100;
        for (let i = 0; i < beepDuration; i++) {
            data[i] = Math.sin(2 * Math.PI * 900 * i / 44100) * 0.8;
        }

        const arrayBuffer = new ArrayBuffer(data.length * 4);
        const view = new Float32Array(arrayBuffer);
        view.set(data);

        const service = amdService.current;
        if (!service) throw new Error('AMD service not available');
        const result = await service.analyzeAudio(arrayBuffer, testPhoneNumber);

        return {
            beepDetected: result.audioAnalysis.beepDetection.detected,
            timing: result.audioAnalysis.beepDetection.timing,
            confidence: result.audioAnalysis.beepDetection.confidence,
            frequency: (result.audioAnalysis.beepDetection as any).frequency
        };
    };

    // Speech service tests
    const testEnglishSTT = async () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            throw new Error('Speech Recognition not supported');
        }

        const response = await fetch('/api/speech/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "Hello, this is a test message",
                language: "en-US"
            })
        });

        if (!response.ok) throw new Error('English STT test failed');
        const result = await response.json();
        return result;
    };

    const testMalayalamSTT = async () => {
        const response = await fetch('/api/speech/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "നമസ്കാരം, ഇത് ഒരു പരീക്ഷണ സന്ദേശമാണ്",
                language: "ml-IN"
            })
        });

        if (!response.ok) throw new Error('Malayalam STT test failed');
        const result = await response.json();
        return result;
    };

    const testEnglishTTS = async () => {
        const response = await fetch('/api/speech/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "Hello, this is a test of English text-to-speech",
                language: "en-US",
                voice: "neural"
            })
        });

        if (!response.ok) throw new Error('English TTS test failed');
        const result = await response.json();
        return result;
    };

    const testMalayalamTTS = async () => {
        const response = await fetch('/api/speech/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "നമസ്കാരം! ഇത് മലയാളം വോയ്സ് സിന്തസിസ് പരീക്ഷണമാണ്",
                language: "ml-IN",
                voice: "neural"
            })
        });

        if (!response.ok) throw new Error('Malayalam TTS test failed');
        const result = await response.json();
        return result;
    };

    const testVoiceQuality = async () => {
        const response = await fetch('/api/speech/voice-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                audioData: "test_audio_data",
                analysisType: "quality"
            })
        });

        if (!response.ok) throw new Error('Voice quality test failed');
        const result = await response.json();
        return result;
    };

    // Database tests
    const testDatabaseConnection = async () => {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Database connection failed');
        const health = await response.json();

        if (!health.database) throw new Error('Database not healthy');
        return health;
    };

    const testDriverOperations = async () => {
        // Test driver CRUD operations
        const testDriver = {
            name: "Test Driver",
            phone: "+918888888888",
            vehicle: "KL-01-AB-1234",
            status: "active"
        };

        // Create
        const createResponse = await fetch('/api/drivers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testDriver)
        });

        if (!createResponse.ok) throw new Error('Driver creation failed');
        const driver = await createResponse.json();

        // Read
        const readResponse = await fetch(`/api/drivers/${driver.id}`);
        if (!readResponse.ok) throw new Error('Driver read failed');

        // Update
        const updateResponse = await fetch(`/api/drivers/${driver.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...testDriver, status: "offline" })
        });

        if (!updateResponse.ok) throw new Error('Driver update failed');

        // Delete
        const deleteResponse = await fetch(`/api/drivers/${driver.id}`, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) throw new Error('Driver deletion failed');

        return {
            created: driver.id,
            operations: ['create', 'read', 'update', 'delete']
        };
    };

    const testRideOperations = async () => {
        const testRide = {
            driverId: "test-driver-123",
            pickup: "Kochi Airport",
            destination: "Marine Drive",
            passenger: {
                name: "Test Passenger",
                phone: "+919999999999"
            },
            status: "requested"
        };

        const response = await fetch('/api/rides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testRide)
        });

        if (!response.ok) throw new Error('Ride operations test failed');
        const result = await response.json();
        return result;
    };

    const testWorkflowPersistence = async () => {
        const testWorkflow = {
            name: "Test Verification Workflow",
            nodes: [
                { id: '1', type: 'start', data: {} },
                { id: '2', type: 'culturalGreeting', data: { language: 'malayalam' } }
            ],
            edges: [{ id: 'e1-2', source: '1', target: '2' }]
        };

        const response = await fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testWorkflow)
        });

        if (!response.ok) throw new Error('Workflow persistence test failed');
        const result = await response.json();
        return result;
    };

    const testAnalyticsData = async () => {
        const response = await fetch('/api/analytics/dashboard');
        if (!response.ok) throw new Error('Analytics data test failed');
        const analytics = await response.json();

        // Verify essential analytics are present
        const requiredFields = ['totalCalls', 'activeWorkflows', 'driverMetrics'];
        for (const field of requiredFields) {
            if (!(field in analytics)) {
                throw new Error(`Missing analytics field: ${field}`);
            }
        }

        return analytics;
    };

    // API tests
    const testHealthEndpoint = async () => {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Health endpoint failed');

        const health = await response.json();
        const requiredServices = ['database', 'websocket', 'speech'];

        for (const service of requiredServices) {
            if (!health[service]) {
                throw new Error(`Service not healthy: ${service}`);
            }
        }

        return health;
    };

    const testWebSocketConnection = async () => {
        if (!wsConnected) {
            throw new Error('WebSocket not connected');
        }

        return {
            connected: wsConnected,
            workflows: data.systemMetrics?.activeWorkflows || 0,
            metrics: data.systemMetrics || {}
        };
    };

    const testDriverAPI = async () => {
        const response = await fetch('/api/drivers');
        if (!response.ok) throw new Error('Driver API test failed');

        const drivers = await response.json();
        return { count: drivers.length, sample: drivers.slice(0, 2) };
    };

    const testIVRAPI = async () => {
        const testIVRData = {
            callId: "test-call-123",
            phoneNumber: testPhoneNumber,
            workflow: "greeting_workflow",
            language: testLanguage
        };

        const response = await fetch('/api/ivr/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testIVRData)
        });

        if (!response.ok) throw new Error('IVR API test failed');
        const result = await response.json();
        return result;
    };

    const testAnalyticsAPI = async () => {
        const endpoints = [
            '/api/analytics/calls',
            '/api/analytics/drivers',
            '/api/analytics/workflows'
        ];

        const results: any[] = [];
        for (const endpoint of endpoints) {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`Analytics API failed: ${endpoint}`);
            const data = await response.json();
            results.push({ endpoint, data });
        }

        return results;
    };

    // Helper function to validate workflow connections
    const validateWorkflowConnections = (workflow: any) => {
        const errors: string[] = [];
        const nodeIds = new Set(workflow.nodes.map((n: any) => n.id));

        // Check if all edge sources and targets exist
        for (const edge of workflow.edges) {
            if (!nodeIds.has(edge.source)) {
                errors.push(`Edge source not found: ${edge.source}`);
            }
            if (!nodeIds.has(edge.target)) {
                errors.push(`Edge target not found: ${edge.target}`);
            }
        }

        // Check for start and end nodes
        const hasStart = workflow.nodes.some((n: any) => n.type === 'start');
        const hasEnd = workflow.nodes.some((n: any) => n.type === 'end');

        if (!hasStart) errors.push('Missing start node');
        if (!hasEnd) errors.push('Missing end node');

        return {
            isValid: errors.length === 0,
            errors,
            nodeCount: workflow.nodes.length,
            edgeCount: workflow.edges.length
        };
    };

    // Run all tests in a suite
    const runTestSuite = async (suiteName: string) => {
        const suite = testSuites.find(s => s.name === suiteName);
        if (!suite) return;

        setIsRunningAll(true);

        for (const test of suite.tests) {
            await runTest(test.id, test.name);

            // Update suite progress
            const completed = suite.tests.filter(t => {
                const result = testResults.get(t.id);
                return result && (result.status === 'passed' || result.status === 'failed');
            }).length;

            suite.progress = (completed / suite.tests.length) * 100;
        }

        setIsRunningAll(false);
    };

    // Calculate overall progress
    useEffect(() => {
        const allTests = testSuites.flatMap(suite => suite.tests);
        const completedTests = allTests.filter(test => {
            const result = testResults.get(test.id);
            return result && (result.status === 'passed' || result.status === 'failed');
        });

        setOverallProgress((completedTests.length / allTests.length) * 100);
    }, [testResults]);

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'passed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'running':
                return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'passed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'running':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">🔒 System Verification</h1>
                            <p className="text-gray-600 mt-2">
                                Comprehensive real-time testing of all system modules and features
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Badge variant={wsConnected ? "default" : "destructive"}>
                                {wsConnected ? "🟢 Connected" : "🔴 Disconnected"}
                            </Badge>
                            <Button
                                onClick={() => runTestSuite('IVR Workflows')}
                                disabled={isRunningAll}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isRunningAll ? (
                                    <>
                                        <X className="mr-2 h-4 w-4" />
                                        Running Tests...
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Run All Tests
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                            <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-2" />
                    </div>
                </div>

                {/* Test Configuration */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Test Phone Number</Label>
                            <Input
                                id="phone"
                                value={testPhoneNumber}
                                onChange={(e) => setTestPhoneNumber(e.target.value)}
                                placeholder="+918888888888"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language">Test Language</Label>
                            <Select value={testLanguage} onValueChange={setTestLanguage}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="malayalam">മലയാളം (Malayalam)</SelectItem>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="mixed">Mixed (Manglish)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="audio">Test Audio File (Optional)</Label>
                            <Input
                                id="audio"
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                </div>

                {/* Test Suites */}
                <Tabs value={selectedSuite} onValueChange={setSelectedSuite} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                        {testSuites.map((suite, index) => (
                            <TabsTrigger key={index} value={suite.name.toLowerCase().replace(/\s+/g, '-')}>
                                {suite.icon}
                                <span className="ml-2 hidden sm:inline">{suite.name}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {testSuites.map((suite, suiteIndex) => (
                        <TabsContent
                            key={suiteIndex}
                            value={suite.name.toLowerCase().replace(/\s+/g, '-')}
                            className="space-y-4"
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {suite.icon}
                                            <div>
                                                <CardTitle>{suite.name}</CardTitle>
                                                <CardDescription>{suite.description}</CardDescription>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => runTestSuite(suite.name)}
                                            disabled={isRunningAll}
                                            variant="outline"
                                        >
                                            {isRunningAll ? "Running..." : "Run Suite"}
                                        </Button>
                                    </div>
                                    <Progress value={suite.progress} className="h-2 mt-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {suite.tests.map((test) => {
                                            const result = testResults.get(test.id);
                                            const status = result?.status || test.status;

                                            return (
                                                <div
                                                    key={test.id}
                                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {getStatusIcon(status)}
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{test.name}</h3>
                                                            {result?.error && (
                                                                <p className="text-sm text-red-600 mt-1">{result.error}</p>
                                                            )}
                                                            {result?.duration && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Completed in {result.duration}ms
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Badge className={getStatusColor(status)}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </Badge>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => runTest(test.id, test.name)}
                                                            disabled={currentTest === test.id || isRunningAll}
                                                        >
                                                            {currentTest === test.id ? "Running..." : "Run"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Test Results Details */}
                            {suite.tests.some(test => testResults.has(test.id)) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Test Results Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {suite.tests
                                                .filter(test => testResults.has(test.id))
                                                .map(test => {
                                                    const result = testResults.get(test.id)!;
                                                    return (
                                                        <div key={test.id} className="border rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium">{test.name}</h4>
                                                                <Badge className={getStatusColor(result.status)}>
                                                                    {result.status}
                                                                </Badge>
                                                            </div>
                                                            {result.details && (
                                                                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                                                                    {JSON.stringify(result.details, null, 2)}
                                                                </pre>
                                                            )}
                                                            {result.timestamp && (
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    {result.timestamp.toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>

                {/* Real-time System Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">WebSocket Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm">{wsConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Active Workflows: {data.systemMetrics?.activeWorkflows || 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">System Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <p className="text-xs">System Load: {data.systemMetrics?.systemLoad || 0}%</p>
                                <p className="text-xs">Memory: {data.systemMetrics?.memoryUsage || 0}%</p>
                                <p className="text-xs">Queued: {data.systemMetrics?.queuedExecutions || 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Test Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {(() => {
                                    const allTests = testSuites.flatMap(suite => suite.tests);
                                    const passed = allTests.filter(test => testResults.get(test.id)?.status === 'passed').length;
                                    const failed = allTests.filter(test => testResults.get(test.id)?.status === 'failed').length;
                                    const total = allTests.length;

                                    return (
                                        <>
                                            <p className="text-xs text-green-600">Passed: {passed}</p>
                                            <p className="text-xs text-red-600">Failed: {failed}</p>
                                            <p className="text-xs text-gray-500">Total: {total}</p>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}