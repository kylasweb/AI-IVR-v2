import { useEffect, useState, useRef, useCallback } from 'react';
import Pusher from 'pusher-js';

// Type definition for Pusher
type PusherInstance = any;

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
    const [isPolling, setIsPolling] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [notification, setNotification] = useState<string | null>(null);
    const pusherRef = useRef<PusherInstance | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const maxReconnectAttempts = 3;

    const startPolling = useCallback(() => {
        setIsPolling(true);
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch('/api/workflow/live-data');
                if (response.ok) {
                    const data = await response.json();
                    setData(data);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 5000);
    }, []);

    const attemptReconnect = useCallback(() => {
        setReconnectAttempts(prev => prev + 1);
        if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(() => {
                if (pusherRef.current) {
                    pusherRef.current.connect();
                }
            }, 2000 * (reconnectAttempts + 1)); // Exponential backoff
        } else {
            startPolling();
            setNotification('Connection lost. Switching to polling mode.');
        }
    }, [reconnectAttempts, maxReconnectAttempts, startPolling]);

    useEffect(() => {
        // Initialize Pusher connection
        const pusher = new Pusher('598aeab4b16c7e656997', {
            cluster: 'ap2',
        });

        pusherRef.current = pusher;

        pusher.connection.bind('connected', () => {
            setIsConnected(true);
            setError(null);
            setReconnectAttempts(0);
            setIsPolling(false);
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            setNotification(null);
            console.log('Connected to Pusher');
        });

        pusher.connection.bind('disconnected', () => {
            setIsConnected(false);
            attemptReconnect();
            console.log('Disconnected from Pusher');
        });

        pusher.connection.bind('error', (err: any) => {
            setError(`Connection error: ${err.message}`);
            setIsConnected(false);
            attemptReconnect();
        });

        // Subscribe to channels
        const workflowsChannel = pusher.subscribe('workflows');
        const executionsChannel = pusher.subscribe('executions');
        const systemMetricsChannel = pusher.subscribe('system-metrics');

        // Real-time workflow updates
        workflowsChannel.bind('workflows_updated', (workflows: any[]) => {
            setData(prev => ({ ...prev, workflows }));
        });

        // Real-time execution updates
        executionsChannel.bind('execution_started', (execution: WorkflowExecutionStatus) => {
            setData(prev => ({
                ...prev,
                executions: [...prev.executions.filter(e => e.workflowId !== execution.workflowId), execution]
            }));
        });

        executionsChannel.bind('execution_progress', (update: {
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

        executionsChannel.bind('execution_completed', (result: {
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
        systemMetricsChannel.bind('system_metrics', (metrics: LiveWorkflowData['systemMetrics']) => {
            setData(prev => ({ ...prev, systemMetrics: metrics }));
        });

        // Node performance updates
        systemMetricsChannel.bind('node_metrics', (nodeMetrics: {
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
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            pusher.disconnect();
        };
    }, []);

    // Functions to interact with workflows
    const executeWorkflow = async (workflowId: string, inputData?: any) => {
        const response = await fetch('/api/workflow/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workflowId, inputData }),
        });
        if (!response.ok) {
            throw new Error('Failed to execute workflow');
        }
        const result = await response.json();
        return result.data;
    };

    const pauseExecution = async (workflowId: string) => {
        await fetch('/api/workflow/pause', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workflowId }),
        });
    };

    const resumeExecution = async (workflowId: string) => {
        await fetch('/api/workflow/resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workflowId }),
        });
    };

    const stopExecution = async (workflowId: string) => {
        await fetch('/api/workflow/stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workflowId }),
        });
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
        notification,
        isPolling,
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