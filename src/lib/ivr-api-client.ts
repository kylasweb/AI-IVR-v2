/**
 * Extended API Client for AI IVR Backend
 * Additional methods for new API endpoints
 */

import { api as baseApi, apiClient, ApiResponse } from './api-client';

// Extended API with new IVR endpoints
export const ivrApi = {
    ...baseApi,

    // ===========================================
    // Dashboard Analytics
    // ===========================================

    /**
     * Get comprehensive dashboard statistics
     */
    getDashboardAnalytics: async (timeframe: 'today' | 'week' | 'month' = 'today'): Promise<ApiResponse> => {
        try {
            const response = await fetch(`/api/dashboard/stats?timeframe=${timeframe}`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' };
        }
    },

    /**
     * Query specific dashboard analytics
     */
    queryDashboardAnalytics: async (
        queryType: 'call_breakdown' | 'agent_performance' | 'language_analytics' | 'customer_journey' | 'voice_quality',
        filters?: Record<string, any>
    ): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/dashboard/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query_type: queryType, filters }),
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to query analytics' };
        }
    },

    // ===========================================
    // Real-Time Voice Processing
    // ===========================================

    /**
     * Process voice input with full NLU pipeline
     */
    processVoiceRealTime: async (
        audioData: string,
        sessionId: string,
        options?: {
            language?: string;
            dialect?: string;
            transcribe?: boolean;
            detect_intent?: boolean;
            analyze_emotion?: boolean;
            detect_entities?: boolean;
            generate_response?: boolean;
        }
    ): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/voice/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio_data: audioData,
                    session_id: sessionId,
                    language: options?.language,
                    dialect: options?.dialect,
                    processing_options: {
                        transcribe: options?.transcribe ?? true,
                        detect_intent: options?.detect_intent ?? true,
                        analyze_emotion: options?.analyze_emotion ?? true,
                        detect_entities: options?.detect_entities ?? true,
                        generate_response: options?.generate_response ?? true,
                    },
                }),
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Voice processing failed' };
        }
    },

    /**
     * Get voice processing capabilities
     */
    getVoiceCapabilities: async (): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/voice/process');
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get capabilities' };
        }
    },

    // ===========================================
    // Video IVR Call Management
    // ===========================================

    /**
     * End an active video call
     */
    endVideoCall: async (
        callId: string,
        options?: {
            reason?: string;
            outcome?: 'completed' | 'transferred' | 'abandoned' | 'error';
            satisfaction_score?: number;
            recording_action?: 'save' | 'delete' | 'archive';
        }
    ): Promise<ApiResponse> => {
        try {
            const response = await fetch(`/api/video-ivr/calls/${callId}/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options || {}),
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to end video call' };
        }
    },

    /**
     * Get video call status
     */
    getVideoCallStatus: async (callId: string): Promise<ApiResponse> => {
        try {
            const response = await fetch(`/api/video-ivr/calls/${callId}/end`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get call status' };
        }
    },

    // ===========================================
    // Video IVR Recordings
    // ===========================================

    /**
     * List video recordings with filters
     */
    getVideoRecordings: async (filters?: {
        call_id?: string;
        status?: 'processing' | 'ready' | 'archived';
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse> => {
        try {
            const params = new URLSearchParams();
            if (filters?.call_id) params.append('call_id', filters.call_id);
            if (filters?.status) params.append('status', filters.status);
            if (filters?.limit) params.append('limit', filters.limit.toString());
            if (filters?.offset) params.append('offset', filters.offset.toString());

            const response = await fetch(`/api/video-ivr/recordings?${params.toString()}`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get recordings' };
        }
    },

    /**
     * Get specific recording details
     */
    getVideoRecording: async (recordingId: string): Promise<ApiResponse> => {
        try {
            const response = await fetch(`/api/video-ivr/recordings?id=${recordingId}`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get recording' };
        }
    },

    /**
     * Get download URL for recording
     */
    getRecordingDownloadUrl: async (recordingId: string): Promise<ApiResponse> => {
        try {
            const response = await fetch(`/api/video-ivr/recordings?id=${recordingId}&action=download`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get download URL' };
        }
    },

    /**
     * Start recording for a video call
     */
    startVideoRecording: async (callId: string, settings?: {
        resolution?: '720p' | '1080p';
        format?: 'webm' | 'mp4';
        include_audio?: boolean;
        include_screen?: boolean;
    }): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/video-ivr/recordings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start', call_id: callId, recording_settings: settings }),
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to start recording' };
        }
    },

    /**
     * Stop recording for a video call
     */
    stopVideoRecording: async (callId: string): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/video-ivr/recordings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'stop', call_id: callId }),
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to stop recording' };
        }
    },

    /**
     * Delete a recording
     */
    deleteVideoRecording: async (recordingId: string, permanent: boolean = false): Promise<ApiResponse> => {
        try {
            const response = await fetch(`/api/video-ivr/recordings?id=${recordingId}&permanent=${permanent}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to delete recording' };
        }
    },

    // ===========================================
    // WebSocket IVR Management
    // ===========================================

    /**
     * Get WebSocket configuration and endpoints
     */
    getWebSocketConfig: async (): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/websocket/ivr?action=config');
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get WebSocket config' };
        }
    },

    /**
     * Create a new WebSocket session
     */
    createWebSocketSession: async (sessionId?: string, options?: {
        language?: string;
        dialect?: string;
        workflow_id?: string;
    }): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/websocket/ivr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_session', session_id: sessionId, options }),
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to create WebSocket session' };
        }
    },

    /**
     * Get WebSocket session status
     */
    getWebSocketStatus: async (sessionId: string): Promise<ApiResponse> => {
        try {
            const response = await fetch(`/api/websocket/ivr?action=status&session_id=${sessionId}`);
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get session status' };
        }
    },

    /**
     * Get WebSocket server statistics
     */
    getWebSocketStats: async (): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/websocket/ivr?action=stats');
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get WebSocket stats' };
        }
    },

    /**
     * Close a WebSocket session
     */
    closeWebSocketSession: async (sessionId: string): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/websocket/ivr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'close_session', session_id: sessionId }),
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to close session' };
        }
    },

    // ===========================================
    // Call Transfer (from call-transfer route)
    // ===========================================

    /**
     * Get available transfer destinations
     */
    getTransferDestinations: async (): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/call-transfer');
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get destinations' };
        }
    },

    /**
     * Initiate a call transfer
     */
    initiateTransfer: async (request: {
        session_id: string;
        destination_id: string;
        transfer_type: 'video_ivr' | 'agent' | 'queue' | 'callback' | 'ivr_flow';
        reason?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        notes?: string;
        caller_info?: Record<string, any>;
        context?: Record<string, any>;
    }): Promise<ApiResponse> => {
        try {
            const response = await fetch('/api/call-transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to initiate transfer' };
        }
    },
};

// Re-export base api for backward compatibility
export { api, apiClient, ApiResponse } from './api-client';

// Default export
export default ivrApi;
