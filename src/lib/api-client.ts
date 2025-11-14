// API utilities for connecting to Python FastAPI backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    // Health check
    async health(): Promise<ApiResponse> {
        return this.request('/health');
    }

    // Call management
    async startCall(phoneNumber: string, language: string = 'en', ivrFlowId?: string): Promise<ApiResponse> {
        return this.request('/api/call/start', {
            method: 'POST',
            body: JSON.stringify({
                phone_number: phoneNumber,
                language,
                ivr_flow_id: ivrFlowId,
            }),
        });
    }

    async getSessions(): Promise<ApiResponse> {
        return this.request('/api/sessions');
    }

    async getSession(sessionId: string): Promise<ApiResponse> {
        return this.request(`/api/sessions/${sessionId}`);
    }

    async endSession(sessionId: string): Promise<ApiResponse> {
        return this.request(`/api/sessions/${sessionId}/end`, {
            method: 'POST',
        });
    }

    // Voice processing
    async processVoice(audioData: string, sessionId: string): Promise<ApiResponse> {
        return this.request('/api/voice/process', {
            method: 'POST',
            body: JSON.stringify({
                audio_data: audioData,
                session_id: sessionId,
            }),
        });
    }

    // WebSocket connection for real-time communication
    createWebSocketConnection(sessionId: string): WebSocket | null {
        try {
            const wsUrl = `${WS_BASE_URL}/ws/call/${sessionId}`;
            return new WebSocket(wsUrl);
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            return null;
        }
    }

    // Dashboard and analytics
    async getDashboardStats(): Promise<ApiResponse> {
        return this.request('/api/dashboard/stats');
    }

    async getSystemHealth(): Promise<ApiResponse> {
        return this.request('/api/system/health');
    }

    // Workflows
    async getWorkflows(): Promise<ApiResponse> {
        return this.request('/api/workflows');
    }

    async createWorkflow(workflowData: any): Promise<ApiResponse> {
        return this.request('/api/workflows', {
            method: 'POST',
            body: JSON.stringify(workflowData),
        });
    }

    async updateWorkflow(workflowId: string, workflowData: any): Promise<ApiResponse> {
        return this.request(`/api/workflows/${workflowId}`, {
            method: 'PUT',
            body: JSON.stringify(workflowData),
        });
    }

    async deleteWorkflow(workflowId: string): Promise<ApiResponse> {
        return this.request(`/api/workflows/${workflowId}`, {
            method: 'DELETE',
        });
    }

    // Voice profiles
    async getVoiceProfiles(): Promise<ApiResponse> {
        return this.request('/api/voice-profiles');
    }

    async createVoiceProfile(profileData: any): Promise<ApiResponse> {
        return this.request('/api/voice-profiles', {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    }

    // System settings
    async getSystemSettings(): Promise<ApiResponse> {
        return this.request('/api/system/settings');
    }

    async updateSystemSetting(key: string, value: any): Promise<ApiResponse> {
        return this.request('/api/system/settings', {
            method: 'POST',
            body: JSON.stringify({ key, value }),
        });
    }

    // Settings (for Vocode API configuration)
    async getSettings(): Promise<ApiResponse> {
        return this.request('/settings');
    }

    async updateSettings(settings: any): Promise<ApiResponse> {
        return this.request('/settings', {
            method: 'POST',
            body: JSON.stringify({ settings }),
        });
    }

    // Voice testing suites
    async getVoiceTestingSuites(): Promise<ApiResponse> {
        return this.request('/api/voice-testing-suite');
    }

    // Video IVR
    async getVideoCalls(): Promise<ApiResponse> {
        return this.request('/api/video-ivr/calls');
    }

    async getVideoWorkflows(): Promise<ApiResponse> {
        return this.request('/api/video-ivr/workflows');
    }

    // Voice data processing pipelines
    async getVoiceDataProcessingPipelines(): Promise<ApiResponse> {
        return this.request('/api/voice-data-processing-pipeline');
    }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export utility functions for common operations
export const api = {
    health: () => apiClient.health(),
    startCall: (phoneNumber: string, language?: string, ivrFlowId?: string) =>
        apiClient.startCall(phoneNumber, language, ivrFlowId),
    getSessions: () => apiClient.getSessions(),
    getSession: (sessionId: string) => apiClient.getSession(sessionId),
    endSession: (sessionId: string) => apiClient.endSession(sessionId),
    processVoice: (audioData: string, sessionId: string) =>
        apiClient.processVoice(audioData, sessionId),
    createWebSocket: (sessionId: string) => apiClient.createWebSocketConnection(sessionId),
    getDashboardStats: () => apiClient.getDashboardStats(),
    getSystemHealth: () => apiClient.getSystemHealth(),
    getWorkflows: () => apiClient.getWorkflows(),
    createWorkflow: (workflowData: any) => apiClient.createWorkflow(workflowData),
    updateWorkflow: (workflowId: string, workflowData: any) => apiClient.updateWorkflow(workflowId, workflowData),
    deleteWorkflow: (workflowId: string) => apiClient.deleteWorkflow(workflowId),
    getVoiceProfiles: () => apiClient.getVoiceProfiles(),
    createVoiceProfile: (profileData: any) => apiClient.createVoiceProfile(profileData),
    getSystemSettings: () => apiClient.getSystemSettings(),
    updateSystemSetting: (key: string, value: any) => apiClient.updateSystemSetting(key, value),
    getSettings: () => apiClient.getSettings(),
    updateSettings: (settings: any) => apiClient.updateSettings(settings),
    getVoiceTestingSuites: () => apiClient.getVoiceTestingSuites(),
    getVideoCalls: () => apiClient.getVideoCalls(),
    getVideoWorkflows: () => apiClient.getVideoWorkflows(),
    getVoiceDataProcessingPipelines: () => apiClient.getVoiceDataProcessingPipelines(),
};