// Real-time WebSocket hook

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../stores/auth.store';
import { WebSocketEvent, Alert, DefconStatus } from '../../types/security';

export function useSocket() {
    const { isAuthenticated, user } = useAuthStore();
    const socketRef = useRef<ReturnType<typeof io> | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize socket connection
            const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001', {
                auth: {
                    token: localStorage.getItem('accessToken'),
                    userId: user.id,
                },
                transports: ['websocket', 'polling'],
            });

            socketRef.current = socket;

            // Connection events
            socket.on('connect', () => {
                setIsConnected(true);
                setConnectionError(null);
                console.log('Connected to Sentinel Command WebSocket');
            });

            socket.on('disconnect', (reason) => {
                setIsConnected(false);
                console.log('Disconnected from Sentinel Command WebSocket:', reason);
            });

            socket.on('connect_error', (error) => {
                setConnectionError(error.message);
                console.error('WebSocket connection error:', error);
            });

            // Security events
            socket.on('alert:new', (alert: Alert) => {
                // Handle new alert - this will be managed by alert store
                console.log('New alert received:', alert);
            });

            socket.on('alert:updated', (alert: Alert) => {
                // Handle alert update
                console.log('Alert updated:', alert);
            });

            socket.on('defcon:changed', (defcon: DefconStatus) => {
                // Handle DEFCON status change
                console.log('DEFCON status changed:', defcon);
            });

            socket.on('service:isolated', (data: { serviceId: string; reason: string }) => {
                // Handle service isolation
                console.log('Service isolated:', data);
            });

            socket.on('playbook:executed', (data: { playbookId: string; result: string }) => {
                // Handle playbook execution
                console.log('Playbook executed:', data);
            });

            return () => {
                socket.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            };
        } else {
            // Disconnect if not authenticated
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, user]);

    // Emit events
    const emit = (event: string, data: any) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit event:', event);
        }
    };    // Subscribe to custom events
    const on = (event: string, callback: (...args: any[]) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    };

    const off = (event: string, callback?: (...args: any[]) => void) => {
        if (socketRef.current) {
            if (callback) {
                socketRef.current.off(event, callback);
            } else {
                socketRef.current.off(event);
            }
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        connectionError,
        emit,
        on,
        off,
    };
}

// Hook for real-time alert updates
export function useRealTimeAlerts() {
    const { emit, on, off } = useSocket();
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const handleNewAlert = (alert: Alert) => {
            setAlerts(prev => [alert, ...prev]);
        };

        const handleAlertUpdate = (updatedAlert: Alert) => {
            setAlerts(prev => prev.map(alert =>
                alert.id === updatedAlert.id ? updatedAlert : alert
            ));
        };

        on('alert:new', handleNewAlert);
        on('alert:updated', handleAlertUpdate);

        return () => {
            off('alert:new', handleNewAlert);
            off('alert:updated', handleAlertUpdate);
        };
    }, [on, off]);

    const acknowledgeAlert = (alertId: string) => {
        emit('alert:acknowledge', { alertId });
    };

    const escalateAlert = (alertId: string, level: number) => {
        emit('alert:escalate', { alertId, level });
    };

    return {
        alerts,
        acknowledgeAlert,
        escalateAlert,
    };
}

// Hook for DEFCON status updates
export function useDefconUpdates() {
    const { on, off } = useSocket();
    const [defconStatus, setDefconStatus] = useState<DefconStatus | null>(null);

    useEffect(() => {
        const handleDefconChange = (status: DefconStatus) => {
            setDefconStatus(status);
        };

        on('defcon:changed', handleDefconChange);

        return () => {
            off('defcon:changed', handleDefconChange);
        };
    }, [on, off]);

    return defconStatus;
}