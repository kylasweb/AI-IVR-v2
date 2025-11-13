import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

// Type definition for Socket
type Socket = any;

export interface WorkflowExecutionStatus {
    workflowId: string;
    status: 'running' | 'completed' | 'failed' | 'paused';
    currentNodeId?: string;
    progress: number;
    startTime: Date;
    endTime?: Date;
    executionLog: {
        nodeId: string;
        timestamp: Date;
        status: 'success' | 'error' | 'running';
        message: string;
        data?: any;
    }[];
    metrics: {
        totalNodes: number;
        completedNodes: number;
        failedNodes: number;
        averageExecutionTime: number;
    };
}

export interface LiveWorkflowData {
    workflows: any[];
    executions: WorkflowExecutionStatus[];
    nodeStatuses: Map<string, {
        status: 'idle' | 'running' | 'success' | 'error';
        lastExecuted?: Date;
        executionCount: number;
        averageTime: number;
    }>;
    systemMetrics: {
        activeWorkflows: number;
        queuedExecutions: number;
        systemLoad: number;
        memoryUsage: number;
    };
}

export function useRealTimeWorkflowData() {
    const [data, setData] = useState<LiveWorkflowData>({
        workflows: [],
        executions: [],
        nodeStatuses: new Map(),
        systemMetrics: {
            activeWorkflows: 0,
            queuedExecutions: 0,
            systemLoad: 0,
            memoryUsage: 0,
        },
    });
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Initialize WebSocket connection to backend
        const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            setError(null);
            console.log('Connected to workflow WebSocket');

            // Subscribe to workflow updates
            socket.emit('subscribe', { room: 'workflows' });
            socket.emit('subscribe', { room: 'executions' });
            socket.emit('subscribe', { room: 'system-metrics' });
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from workflow WebSocket');
        });

        socket.on('connect_error', (err) => {
            setError(`Connection error: ${err.message}`);
            setIsConnected(false);
        });

        // Real-time workflow updates
        socket.on('workflows_updated', (workflows: any[]) => {
            setData(prev => ({ ...prev, workflows }));
        });

        // Real-time execution updates
        socket.on('execution_started', (execution: WorkflowExecutionStatus) => {
            setData(prev => ({
                ...prev,
                executions: [...prev.executions.filter(e => e.workflowId !== execution.workflowId), execution]
            }));
        });

        socket.on('execution_progress', (update: {
            workflowId: string;
            nodeId: string;
            status: 'running' | 'success' | 'error';
            message: string;
            data?: any;
        }) => {
            setData(prev => {
                const updatedExecutions = prev.executions.map(exec => {
                    if (exec.workflowId === update.workflowId) {
                        const newLogEntry = {
                            nodeId: update.nodeId,
                            timestamp: new Date(),
                            status: update.status,
                            message: update.message,
                            data: update.data,
                        };

                        return {
                            ...exec,
                            currentNodeId: update.nodeId,
                            executionLog: [...exec.executionLog, newLogEntry],
                            progress: update.status === 'success' ?
                                Math.min(100, exec.progress + (100 / exec.metrics.totalNodes)) :
                                exec.progress,
                        };
                    }
                    return exec;
                });

                // Update node status
                const updatedNodeStatuses = new Map(prev.nodeStatuses);
                const nodeStatus = updatedNodeStatuses.get(update.nodeId) || {
                    status: 'idle',
                    executionCount: 0,
                    averageTime: 0,
                };

                updatedNodeStatuses.set(update.nodeId, {
                    ...nodeStatus,
                    status: update.status === 'running' ? 'running' :
                        update.status === 'success' ? 'success' : 'error',
                    lastExecuted: new Date(),
                    executionCount: update.status === 'success' ? nodeStatus.executionCount + 1 : nodeStatus.executionCount,
                });

                return {
                    ...prev,
                    executions: updatedExecutions,
                    nodeStatuses: updatedNodeStatuses,
                };
            });
        });

        socket.on('execution_completed', (result: {
            workflowId: string;
            status: 'completed' | 'failed';
            endTime: Date;
            finalMetrics: any;
        }) => {
            setData(prev => ({
                ...prev,
                executions: prev.executions.map(exec =>
                    exec.workflowId === result.workflowId
                        ? {
                            ...exec,
                            status: result.status,
                            endTime: result.endTime,
                            progress: result.status === 'completed' ? 100 : exec.progress,
                            metrics: { ...exec.metrics, ...result.finalMetrics }
                        }
                        : exec
                )
            }));
        });

        // System metrics updates
        socket.on('system_metrics', (metrics: LiveWorkflowData['systemMetrics']) => {
            setData(prev => ({ ...prev, systemMetrics: metrics }));
        });

        // Node performance updates
        socket.on('node_metrics', (nodeMetrics: {
            nodeId: string;
            averageTime: number;
            successRate: number;
            executionCount: number;
        }) => {
            setData(prev => {
                const updatedNodeStatuses = new Map(prev.nodeStatuses);
                const current = updatedNodeStatuses.get(nodeMetrics.nodeId) || {
                    status: 'idle' as const,
                    executionCount: 0,
                    averageTime: 0,
                };

                updatedNodeStatuses.set(nodeMetrics.nodeId, {
                    ...current,
                    averageTime: nodeMetrics.averageTime,
                    executionCount: nodeMetrics.executionCount,
                });

                return { ...prev, nodeStatuses: updatedNodeStatuses };
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Functions to interact with workflows
    const executeWorkflow = async (workflowId: string, inputData?: any) => {
        if (!socketRef.current?.connected) {
            throw new Error('Not connected to server');
        }

        return new Promise((resolve, reject) => {
            socketRef.current?.emit('execute_workflow', { workflowId, inputData }, (response: any) => {
                if (response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    };

    const pauseExecution = (workflowId: string) => {
        socketRef.current?.emit('pause_execution', { workflowId });
    };

    const resumeExecution = (workflowId: string) => {
        socketRef.current?.emit('resume_execution', { workflowId });
    };

    const stopExecution = (workflowId: string) => {
        socketRef.current?.emit('stop_execution', { workflowId });
    };

    const getNodeStatus = (nodeId: string) => {
        return data.nodeStatuses.get(nodeId) || {
            status: 'idle' as const,
            executionCount: 0,
            averageTime: 0,
        };
    };

    return {
        data,
        isConnected,
        error,
        executeWorkflow,
        pauseExecution,
        resumeExecution,
        stopExecution,
        getNodeStatus,
    };
}

export function useLiveWorkflowExecution(workflowId: string) {
    const { data, executeWorkflow, pauseExecution, resumeExecution, stopExecution } = useRealTimeWorkflowData();

    const currentExecution = data.executions.find(exec => exec.workflowId === workflowId);

    return {
        execution: currentExecution,
        nodeStatuses: data.nodeStatuses,
        isRunning: currentExecution?.status === 'running',
        executeWorkflow: (inputData?: any) => executeWorkflow(workflowId, inputData),
        pauseExecution: () => pauseExecution(workflowId),
        resumeExecution: () => resumeExecution(workflowId),
        stopExecution: () => stopExecution(workflowId),
    };
}