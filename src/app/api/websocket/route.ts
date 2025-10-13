import { NextRequest } from 'next/server';
import { createServer } from 'http';

// Dynamic import for Socket.IO to avoid type issues
const initSocketIO = async () => {
    try {
        const socketio = await import('socket.io');
        return (socketio as any).Server || (socketio as any).default?.Server;
    } catch (error) {
        console.error('Failed to import Socket.IO:', error);
        return null;
    }
};

// WebSocket server instance (singleton)
let io: any | null = null;

// In-memory storage for active executions and real-time data
const activeExecutions = new Map();
const nodeMetrics = new Map();
const systemMetrics = {
    activeWorkflows: 0,
    queuedExecutions: 0,
    systemLoad: 0,
    memoryUsage: 0,
};

export async function GET(request: NextRequest) {
    if (!io) {
        console.log('Initializing Socket.IO server...');

        // Create HTTP server for Socket.IO
        const httpServer = createServer();
        const SocketIOServer = await initSocketIO();
        io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.NODE_ENV === 'production'
                    ? process.env.NEXTAUTH_URL
                    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
                methods: ['GET', 'POST'],
            },
            transports: ['websocket', 'polling'],
        });

        // Socket.IO connection handling
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Handle subscription to different data streams
            socket.on('subscribe', ({ room }) => {
                socket.join(room);
                console.log(`Client ${socket.id} subscribed to ${room}`);

                // Send initial data based on room
                switch (room) {
                    case 'workflows':
                        sendWorkflowsData(socket);
                        break;
                    case 'executions':
                        sendExecutionData(socket);
                        break;
                    case 'system-metrics':
                        sendSystemMetrics(socket);
                        break;
                }
            });

            // Handle workflow execution requests
            socket.on('execute_workflow', async ({ workflowId, inputData }, callback) => {
                try {
                    // Mock workflow for now - replace with actual database call
                    const workflow = {
                        id: workflowId,
                        nodes: [
                            { id: '1', type: 'trigger', label: 'Start', position: 1 },
                            { id: '2', type: 'stt', label: 'Speech Recognition', position: 2 },
                            { id: '3', type: 'nlu', label: 'Language Understanding', position: 3 },
                            { id: '4', type: 'agent', label: 'AI Agent', position: 4 },
                            { id: '5', type: 'tts', label: 'Text to Speech', position: 5 },
                            { id: '6', type: 'end', label: 'End', position: 6 },
                        ],
                    };

                    // Create execution record
                    const execution = {
                        workflowId,
                        status: 'running',
                        progress: 0,
                        startTime: new Date(),
                        executionLog: [],
                        metrics: {
                            totalNodes: workflow.nodes.length,
                            completedNodes: 0,
                            failedNodes: 0,
                            averageExecutionTime: 0,
                        },
                    };

                    activeExecutions.set(workflowId, execution);
                    systemMetrics.activeWorkflows++;

                    // Broadcast execution started
                    io?.to('executions').emit('execution_started', execution);

                    // Start workflow execution simulation
                    executeWorkflowSimulation(workflowId, workflow, inputData);

                    callback({ success: true, data: { executionId: workflowId } });
                } catch (error) {
                    console.error('Workflow execution error:', error);
                    callback({ success: false, error: 'Failed to start workflow execution' });
                }
            });

            // Handle execution control
            socket.on('pause_execution', ({ workflowId }) => {
                const execution = activeExecutions.get(workflowId);
                if (execution) {
                    execution.status = 'paused';
                    io?.to('executions').emit('execution_progress', {
                        workflowId,
                        nodeId: execution.currentNodeId,
                        status: 'paused',
                        message: 'Execution paused by user',
                    });
                }
            });

            socket.on('resume_execution', ({ workflowId }) => {
                const execution = activeExecutions.get(workflowId);
                if (execution && execution.status === 'paused') {
                    execution.status = 'running';
                    io?.to('executions').emit('execution_progress', {
                        workflowId,
                        nodeId: execution.currentNodeId,
                        status: 'running',
                        message: 'Execution resumed',
                    });
                }
            });

            socket.on('stop_execution', ({ workflowId }) => {
                const execution = activeExecutions.get(workflowId);
                if (execution) {
                    execution.status = 'failed';
                    execution.endTime = new Date();
                    systemMetrics.activeWorkflows = Math.max(0, systemMetrics.activeWorkflows - 1);

                    io?.to('executions').emit('execution_completed', {
                        workflowId,
                        status: 'failed',
                        endTime: execution.endTime,
                        finalMetrics: execution.metrics,
                    });

                    activeExecutions.delete(workflowId);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        // Start system metrics broadcasting
        setInterval(() => {
            updateSystemMetrics();
            io?.to('system-metrics').emit('system_metrics', systemMetrics);
        }, 5000);

        // Start the HTTP server
        const port = process.env.WS_PORT || 3001;
        httpServer.listen(port, () => {
            console.log(`WebSocket server running on port ${port}`);
        });
    }

    return new Response(JSON.stringify({
        message: 'WebSocket server initialized',
        port: process.env.WS_PORT || 3001
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
}

// Helper functions
async function sendWorkflowsData(socket: any) {
    try {
        // Mock workflows data - replace with actual database call
        const workflows = [
            {
                id: 'workflow-1',
                name: 'Customer Support Flow',
                description: 'Malayalam customer support with AI agent',
                category: 'CUSTOMER_SERVICE',
                isActive: true,
                nodes: 6,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'workflow-2',
                name: 'Appointment Booking',
                description: 'Healthcare appointment booking system',
                category: 'HEALTHCARE',
                isActive: true,
                nodes: 8,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        socket.emit('workflows_updated', workflows);
    } catch (error) {
        console.error('Error fetching workflows:', error);
    }
}

function sendExecutionData(socket: any) {
    const executions = Array.from(activeExecutions.values());
    socket.emit('executions_updated', executions);
}

function sendSystemMetrics(socket: any) {
    socket.emit('system_metrics', systemMetrics);
}

function updateSystemMetrics() {
    systemMetrics.activeWorkflows = activeExecutions.size;
    systemMetrics.queuedExecutions = 0;
    systemMetrics.systemLoad = Math.random() * 100;
    systemMetrics.memoryUsage = Math.random() * 100;
}

async function executeWorkflowSimulation(workflowId: string, workflow: any, inputData: any) {
    const execution = activeExecutions.get(workflowId);
    if (!execution) return;

    try {
        const nodes = workflow.nodes.sort((a: any, b: any) => a.position - b.position);

        for (const node of nodes) {
            if (execution.status !== 'running') break;

            execution.currentNodeId = node.id;

            // Simulate node execution
            io?.to('executions').emit('execution_progress', {
                workflowId,
                nodeId: node.id,
                status: 'running',
                message: `Executing ${node.type} node: ${node.label}`,
            });

            // Simulate processing time based on node type
            const processingTime = getNodeProcessingTime(node.type);
            await new Promise(resolve => setTimeout(resolve, processingTime));

            // Simulate success/failure (95% success rate)
            const success = Math.random() > 0.05;

            if (success) {
                execution.metrics.completedNodes++;
                execution.progress = (execution.metrics.completedNodes / execution.metrics.totalNodes) * 100;

                // Update node metrics
                updateNodeMetrics(node.id, processingTime, true);

                io?.to('executions').emit('execution_progress', {
                    workflowId,
                    nodeId: node.id,
                    status: 'success',
                    message: `Successfully executed ${node.type} node`,
                    data: generateMockNodeOutput(node.type),
                });

                // Broadcast node metrics
                io?.to('executions').emit('node_metrics', {
                    nodeId: node.id,
                    ...nodeMetrics.get(node.id),
                });
            } else {
                execution.metrics.failedNodes++;
                execution.status = 'failed';

                updateNodeMetrics(node.id, processingTime, false);

                io?.to('executions').emit('execution_progress', {
                    workflowId,
                    nodeId: node.id,
                    status: 'error',
                    message: `Failed to execute ${node.type} node: Simulated error`,
                });

                break;
            }
        }

        // Complete execution
        if (execution.status === 'running') {
            execution.status = 'completed';
            execution.progress = 100;
        }

        execution.endTime = new Date();
        systemMetrics.activeWorkflows = Math.max(0, systemMetrics.activeWorkflows - 1);

        io?.to('executions').emit('execution_completed', {
            workflowId,
            status: execution.status,
            endTime: execution.endTime,
            finalMetrics: execution.metrics,
        });

        // Clean up
        setTimeout(() => {
            activeExecutions.delete(workflowId);
        }, 30000);

    } catch (error) {
        console.error('Workflow execution simulation error:', error);
        execution.status = 'failed';
        execution.endTime = new Date();
        systemMetrics.activeWorkflows = Math.max(0, systemMetrics.activeWorkflows - 1);

        io?.to('executions').emit('execution_completed', {
            workflowId,
            status: 'failed',
            endTime: execution.endTime,
            finalMetrics: execution.metrics,
        });

        activeExecutions.delete(workflowId);
    }
}

function getNodeProcessingTime(nodeType: string): number {
    const baseTimes: Record<string, number> = {
        trigger: 100,
        stt: 2000,
        nlu: 1500,
        agent: 3000,
        malayalam_cultural: 1000,
        amd_detection: 2500,
        condition: 200,
        api: 1500,
        tts: 2000,
        sms: 800,
        email: 1200,
        whatsapp: 1000,
        data: 800,
        transform: 300,
        analytics: 500,
        delay: 1000,
        end: 100,
    };

    return baseTimes[nodeType] || 1000;
}

function updateNodeMetrics(nodeId: string, executionTime: number, success: boolean) {
    const current = nodeMetrics.get(nodeId) || {
        executionCount: 0,
        averageTime: 0,
        successRate: 100,
        totalTime: 0,
        successCount: 0,
    };

    current.executionCount++;
    current.totalTime += executionTime;
    current.averageTime = current.totalTime / current.executionCount;

    if (success) {
        current.successCount++;
    }
    current.successRate = (current.successCount / current.executionCount) * 100;

    nodeMetrics.set(nodeId, current);
}

function generateMockNodeOutput(nodeType: string) {
    switch (nodeType) {
        case 'stt':
            return {
                transcript: 'नमस्ते, मुझे अपॉइंटमेंट बुक करना है',
                confidence: 0.95,
                language: 'malayalam',
                dialect: 'central',
            };
        case 'nlu':
            return {
                intent: 'book_appointment',
                entities: {
                    service_type: 'consultation',
                    preferred_time: 'morning',
                    language: 'malayalam',
                },
                confidence: 0.87,
                culturalContext: {
                    formalityLevel: 'respectful',
                    regionalPattern: 'kerala_central',
                },
            };
        case 'agent':
            return {
                response: 'നമസ്കാരം! ഞാൻ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്. ഏത് സേവനമാണ് നിങ്ങൾക്ക് വേണ്ടത്?',
                confidence: 0.92,
                tokens_used: 45,
                culturalAdaptation: true,
                emotionalTone: 'helpful',
            };
        case 'malayalam_cultural':
            return {
                culturalContext: 'kerala_traditional',
                festivalAwareness: 'onam_season',
                dialectDetected: 'central_kerala',
                formalityLevel: 'respectful',
                suggestedGreeting: 'നമസ്കാരം',
            };
        case 'amd_detection':
            return {
                isAnsweringMachine: false,
                confidence: 0.89,
                humanLikelihood: 0.91,
                malayalamGreetingDetected: true,
                voiceCharacteristics: {
                    naturalness: 0.94,
                    emotionalIndicators: ['politeness', 'curiosity'],
                },
            };
        case 'api':
            return {
                status: 200,
                data: { result: 'success', appointmentId: 'APT-' + Date.now() },
                responseTime: 245,
                endpoint: '/api/appointments',
            };
        case 'tts':
            return {
                audioGenerated: true,
                voice: 'malayalam-female-natural',
                duration: 3.2,
                culturalPronunciation: true,
                ssmlUsed: true,
            };
        default:
            return {
                processed: true,
                timestamp: new Date().toISOString(),
                culturalIntelligence: true,
            };
    }
}