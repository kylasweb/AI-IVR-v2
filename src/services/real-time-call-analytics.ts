import { callManager, CallSession, CallMetrics } from './call-management-service';

export interface RealTimeCallAnalytics {
    // Current snapshot
    activeCalls: number;
    totalCallsToday: number;
    completedCalls: number;
    failedCalls: number;

    // Performance metrics
    averageCallDuration: number; // in milliseconds
    averageWaitTime: number; // in milliseconds
    averageResponseTime: number; // in milliseconds
    successRate: number; // percentage

    // Quality metrics
    customerSatisfaction: number; // 1-5 scale
    callQualityScore: number; // 1-10 scale
    transcriptionAccuracy: number; // percentage

    // AI/Voice metrics
    voiceModelAccuracy: number; // percentage
    intentRecognitionRate: number; // percentage
    malayalamProcessingSuccess: number; // percentage
    manglishDetectionRate: number; // percentage

    // System performance
    systemLoad: number; // percentage
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
    networkLatency: number; // milliseconds

    // Real-time trends (last hour)
    callVolumeHourly: Array<{ timestamp: Date; count: number }>;
    responseTimeHourly: Array<{ timestamp: Date; avgTime: number }>;
    errorRateHourly: Array<{ timestamp: Date; rate: number }>;

    // Language distribution
    languageDistribution: {
        english: number;
        malayalam: number;
        manglish: number;
    };

    // Agent performance
    agentMetrics: Array<{
        agentId: string;
        type: 'ai' | 'human';
        activeCalls: number;
        totalCalls: number;
        averageHandlingTime: number;
        customerSatisfaction: number;
        successRate: number;
    }>;

    // Alerts and issues
    activeAlerts: Array<{
        id: string;
        type: 'error' | 'warning' | 'info';
        message: string;
        timestamp: Date;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
}

export interface CallAnalyticsEvent {
    type: 'metrics_update' | 'alert_created' | 'performance_change' | 'call_pattern_detected';
    data: any;
    timestamp: Date;
}

export class RealTimeCallAnalyticsService {
    private static instance: RealTimeCallAnalyticsService;
    private analytics: RealTimeCallAnalytics;
    private eventListeners: Map<string, Array<(event: CallAnalyticsEvent) => void>> = new Map();
    private updateInterval: NodeJS.Timeout | null = null;
    private hourlyDataCollection: Map<string, any[]> = new Map();
    private alertIdCounter = 1;

    private constructor() {
        this.analytics = this.initializeAnalytics();
        this.startRealTimeUpdates();
        this.setupCallManagerListeners();
    }

    public static getInstance(): RealTimeCallAnalyticsService {
        if (!RealTimeCallAnalyticsService.instance) {
            RealTimeCallAnalyticsService.instance = new RealTimeCallAnalyticsService();
        }
        return RealTimeCallAnalyticsService.instance;
    }

    private initializeAnalytics(): RealTimeCallAnalytics {
        return {
            activeCalls: 0,
            totalCallsToday: 0,
            completedCalls: 0,
            failedCalls: 0,
            averageCallDuration: 0,
            averageWaitTime: 0,
            averageResponseTime: 0,
            successRate: 0,
            customerSatisfaction: 4.2,
            callQualityScore: 8.5,
            transcriptionAccuracy: 94.2,
            voiceModelAccuracy: 96.8,
            intentRecognitionRate: 89.3,
            malayalamProcessingSuccess: 92.1,
            manglishDetectionRate: 87.6,
            systemLoad: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            networkLatency: 0,
            callVolumeHourly: [],
            responseTimeHourly: [],
            errorRateHourly: [],
            languageDistribution: {
                english: 0,
                malayalam: 0,
                manglish: 0,
            },
            agentMetrics: [],
            activeAlerts: []
        };
    }

    private startRealTimeUpdates(): void {
        // Update analytics every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateAnalytics();
        }, 30000);

        // Update hourly data every minute
        setInterval(() => {
            this.updateHourlyData();
        }, 60000);

        // System monitoring every 10 seconds
        setInterval(() => {
            this.updateSystemMetrics();
        }, 10000);
    }

    private setupCallManagerListeners(): void {
        callManager.addEventListener('call_started', (event) => {
            this.handleCallStarted(event.data);
        });

        callManager.addEventListener('call_ended', (event) => {
            this.handleCallEnded(event.data);
        });

        callManager.addEventListener('transcript_update', (event) => {
            this.handleTranscriptUpdate(event.data);
        });

        callManager.addEventListener('status_change', (event) => {
            this.handleStatusChange(event.data);
        });
    }

    private updateAnalytics(): void {
        const activeCalls = callManager.getActiveCalls();
        const metrics = callManager.getMetrics();

        // Update basic metrics
        this.analytics.activeCalls = activeCalls.length;
        this.analytics.totalCallsToday = metrics.totalCalls;
        this.analytics.completedCalls = metrics.completedCalls;
        this.analytics.failedCalls = metrics.failedCalls;
        this.analytics.averageCallDuration = metrics.averageCallDuration;
        this.analytics.averageWaitTime = metrics.averageWaitTime;
        this.analytics.successRate = metrics.successRate;

        // Update language distribution
        this.updateLanguageDistribution(activeCalls);

        // Update agent metrics
        this.updateAgentMetrics(activeCalls);

        // Check for performance alerts
        this.checkPerformanceAlerts();

        // Emit update event
        this.emitEvent('metrics_update', this.analytics);
    }

    private updateLanguageDistribution(calls: CallSession[]): void {
        const distribution = { english: 0, malayalam: 0, manglish: 0 };

        calls.forEach(call => {
            switch (call.language) {
                case 'en':
                    distribution.english++;
                    break;
                case 'ml':
                    distribution.malayalam++;
                    break;
                case 'manglish':
                    distribution.manglish++;
                    break;
            }
        });

        this.analytics.languageDistribution = distribution;
    }

    private updateAgentMetrics(calls: CallSession[]): void {
        const agentMap = new Map();

        calls.forEach(call => {
            if (call.agent) {
                const agentId = call.agent.id;
                if (!agentMap.has(agentId)) {
                    agentMap.set(agentId, {
                        agentId,
                        type: call.agent.type,
                        activeCalls: 0,
                        totalCalls: 0,
                        totalDuration: 0,
                        successfulCalls: 0,
                        satisfactionSum: 0,
                        satisfactionCount: 0
                    });
                }

                const agent = agentMap.get(agentId);
                agent.activeCalls++;

                if (call.status === 'ended' && call.duration) {
                    agent.totalCalls++;
                    agent.totalDuration += call.duration;

                    if (call.status === 'ended') {
                        agent.successfulCalls++;
                    }
                }
            }
        });

        this.analytics.agentMetrics = Array.from(agentMap.values()).map(agent => ({
            agentId: agent.agentId,
            type: agent.type,
            activeCalls: agent.activeCalls,
            totalCalls: agent.totalCalls,
            averageHandlingTime: agent.totalCalls > 0 ? agent.totalDuration / agent.totalCalls : 0,
            customerSatisfaction: agent.satisfactionCount > 0 ? agent.satisfactionSum / agent.satisfactionCount : 4.2,
            successRate: agent.totalCalls > 0 ? (agent.successfulCalls / agent.totalCalls) * 100 : 0
        }));
    }

    private updateHourlyData(): void {
        const now = new Date();
        const timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), Math.floor(now.getMinutes() / 5) * 5);

        // Update call volume
        if (!this.hourlyDataCollection.has('callVolume')) {
            this.hourlyDataCollection.set('callVolume', []);
        }
        const callVolumeData = this.hourlyDataCollection.get('callVolume')!;
        callVolumeData.push({ timestamp, count: this.analytics.activeCalls });

        // Keep only last 12 hours (144 data points at 5-minute intervals)
        if (callVolumeData.length > 144) {
            callVolumeData.shift();
        }
        this.analytics.callVolumeHourly = callVolumeData;

        // Update response time
        if (!this.hourlyDataCollection.has('responseTime')) {
            this.hourlyDataCollection.set('responseTime', []);
        }
        const responseTimeData = this.hourlyDataCollection.get('responseTime')!;
        responseTimeData.push({ timestamp, avgTime: this.analytics.averageResponseTime });

        if (responseTimeData.length > 144) {
            responseTimeData.shift();
        }
        this.analytics.responseTimeHourly = responseTimeData;

        // Update error rate
        if (!this.hourlyDataCollection.has('errorRate')) {
            this.hourlyDataCollection.set('errorRate', []);
        }
        const errorRateData = this.hourlyDataCollection.get('errorRate')!;
        const errorRate = this.analytics.totalCallsToday > 0 ?
            (this.analytics.failedCalls / this.analytics.totalCallsToday) * 100 : 0;
        errorRateData.push({ timestamp, rate: errorRate });

        if (errorRateData.length > 144) {
            errorRateData.shift();
        }
        this.analytics.errorRateHourly = errorRateData;
    }

    private updateSystemMetrics(): void {
        // Simulate system metrics (in production, get from actual monitoring)
        this.analytics.systemLoad = Math.random() * 100;
        this.analytics.memoryUsage = Math.random() * 80 + 10; // 10-90%
        this.analytics.cpuUsage = Math.random() * 70 + 15; // 15-85%
        this.analytics.networkLatency = Math.random() * 100 + 50; // 50-150ms

        // Update AI-specific metrics
        this.analytics.voiceModelAccuracy = 95 + Math.random() * 4; // 95-99%
        this.analytics.intentRecognitionRate = 85 + Math.random() * 10; // 85-95%
        this.analytics.transcriptionAccuracy = 90 + Math.random() * 8; // 90-98%
        this.analytics.malayalamProcessingSuccess = 88 + Math.random() * 10; // 88-98%
        this.analytics.manglishDetectionRate = 82 + Math.random() * 15; // 82-97%
    }

    private checkPerformanceAlerts(): void {
        const now = new Date();

        // Remove old alerts (older than 1 hour)
        this.analytics.activeAlerts = this.analytics.activeAlerts.filter(
            alert => now.getTime() - alert.timestamp.getTime() < 3600000
        );

        // Check for high system load
        if (this.analytics.systemLoad > 90) {
            this.createAlert('error', 'High System Load', `System load at ${this.analytics.systemLoad.toFixed(1)}%`, 'high');
        }

        // Check for high error rate
        const errorRate = this.analytics.totalCallsToday > 0 ?
            (this.analytics.failedCalls / this.analytics.totalCallsToday) * 100 : 0;
        if (errorRate > 5) {
            this.createAlert('warning', 'High Error Rate', `Call failure rate at ${errorRate.toFixed(1)}%`, 'medium');
        }

        // Check for low voice model accuracy
        if (this.analytics.voiceModelAccuracy < 90) {
            this.createAlert('warning', 'Voice Model Performance', `Voice accuracy dropped to ${this.analytics.voiceModelAccuracy.toFixed(1)}%`, 'medium');
        }

        // Check for high response time
        if (this.analytics.averageResponseTime > 5000) { // 5 seconds
            this.createAlert('warning', 'High Response Time', `Average response time: ${(this.analytics.averageResponseTime / 1000).toFixed(1)}s`, 'medium');
        }

        // Check for low Malayalam processing success
        if (this.analytics.malayalamProcessingSuccess < 85) {
            this.createAlert('warning', 'Malayalam Processing Issues', `Malayalam processing success: ${this.analytics.malayalamProcessingSuccess.toFixed(1)}%`, 'medium');
        }
    }

    private createAlert(type: 'error' | 'warning' | 'info', message: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
        // Check if similar alert already exists
        const existingAlert = this.analytics.activeAlerts.find(
            alert => alert.message === message && alert.type === type
        );

        if (!existingAlert) {
            const alert = {
                id: `alert_${this.alertIdCounter++}`,
                type,
                message: `${message}: ${details}`,
                timestamp: new Date(),
                severity
            };

            this.analytics.activeAlerts.push(alert);
            this.emitEvent('alert_created', alert);
        }
    }

    // Event handlers for call manager events
    private handleCallStarted(callData: CallSession): void {
        // Update real-time metrics
        this.updateAnalytics();

        // Check for unusual call patterns
        this.detectCallPatterns();
    }

    private handleCallEnded(callData: CallSession): void {
        // Update completion metrics
        if (callData.duration) {
            // Update satisfaction based on call duration and outcome
            const satisfaction = this.calculateCallSatisfaction(callData);
            this.updateCustomerSatisfaction(satisfaction);
        }

        this.updateAnalytics();
    }

    private handleTranscriptUpdate(callData: CallSession): void {
        // Update transcription accuracy based on confidence scores
        if (callData.transcript && callData.transcript.length > 0) {
            const latestTranscript = callData.transcript[callData.transcript.length - 1];
            if (latestTranscript.confidence) {
                this.updateTranscriptionAccuracy(latestTranscript.confidence);
            }
        }
    }

    private handleStatusChange(callData: CallSession): void {
        this.updateAnalytics();
    }

    private calculateCallSatisfaction(call: CallSession): number {
        // Simple satisfaction calculation based on call characteristics
        let satisfaction = 5.0; // Start with perfect score

        // Reduce satisfaction for long calls (might indicate issues)
        if (call.duration && call.duration > 600000) { // 10 minutes
            satisfaction -= 0.5;
        }

        // Reduce satisfaction for failed calls
        if (call.status === 'failed') {
            satisfaction -= 2.0;
        }

        // Increase satisfaction for quick resolution
        if (call.duration && call.duration < 120000) { // 2 minutes
            satisfaction += 0.3;
        }

        // Consider voice analysis if available
        if (call.voiceAnalysis) {
            if (call.voiceAnalysis.sentiment === 'positive') {
                satisfaction += 0.5;
            } else if (call.voiceAnalysis.sentiment === 'negative') {
                satisfaction -= 1.0;
            }

            // High stress indicates poor experience
            if (call.voiceAnalysis.stressLevel > 0.7) {
                satisfaction -= 0.5;
            }
        }

        return Math.max(1.0, Math.min(5.0, satisfaction));
    }

    private updateCustomerSatisfaction(newSatisfaction: number): void {
        // Weighted average update
        const weight = 0.1; // 10% weight for new sample
        this.analytics.customerSatisfaction =
            (this.analytics.customerSatisfaction * (1 - weight)) + (newSatisfaction * weight);
    }

    private updateTranscriptionAccuracy(confidence: number): void {
        // Update transcription accuracy with exponential moving average
        const alpha = 0.1;
        const newAccuracy = confidence * 100;
        this.analytics.transcriptionAccuracy =
            (alpha * newAccuracy) + ((1 - alpha) * this.analytics.transcriptionAccuracy);
    }

    private detectCallPatterns(): void {
        const recentCalls = callManager.getActiveCalls();

        // Detect spike in call volume
        if (recentCalls.length > 20) { // Threshold for high volume
            this.emitEvent('call_pattern_detected', {
                type: 'high_volume',
                count: recentCalls.length,
                threshold: 20,
                timestamp: new Date()
            });
        }

        // Detect language pattern changes
        const languageChanges = this.detectLanguagePatternChanges(recentCalls);
        if (languageChanges) {
            this.emitEvent('call_pattern_detected', languageChanges);
        }
    }

    private detectLanguagePatternChanges(calls: CallSession[]): any {
        const currentDistribution = this.analytics.languageDistribution;
        const total = currentDistribution.english + currentDistribution.malayalam + currentDistribution.manglish;

        if (total > 10) { // Only analyze if we have sufficient data
            const malayalamPercentage = (currentDistribution.malayalam / total) * 100;

            // If Malayalam usage is unusually high (>60%), it might indicate regional campaign
            if (malayalamPercentage > 60) {
                return {
                    type: 'language_pattern_change',
                    language: 'malayalam',
                    percentage: malayalamPercentage,
                    timestamp: new Date()
                };
            }
        }

        return null;
    }

    // Event management
    addEventListener(eventType: string, callback: (event: CallAnalyticsEvent) => void): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)?.push(callback);
    }

    removeEventListener(eventType: string, callback: (event: CallAnalyticsEvent) => void): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    private emitEvent(eventType: string, data: any): void {
        const event: CallAnalyticsEvent = {
            type: eventType as any,
            data,
            timestamp: new Date()
        };

        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(callback => callback(event));
        }
    }

    // Public getters
    getAnalytics(): RealTimeCallAnalytics {
        return { ...this.analytics };
    }

    getCallVolumeData(hours: number = 12): Array<{ timestamp: Date; count: number }> {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.analytics.callVolumeHourly.filter(item => item.timestamp >= cutoff);
    }

    getResponseTimeData(hours: number = 12): Array<{ timestamp: Date; avgTime: number }> {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.analytics.responseTimeHourly.filter(item => item.timestamp >= cutoff);
    }

    getErrorRateData(hours: number = 12): Array<{ timestamp: Date; rate: number }> {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.analytics.errorRateHourly.filter(item => item.timestamp >= cutoff);
    }

    // Performance insights
    getPerformanceInsights(): Array<{ type: 'positive' | 'negative' | 'neutral'; message: string; metric: string; value: number }> {
        const insights: Array<{ type: 'positive' | 'negative' | 'neutral'; message: string; metric: string; value: number }> = [];        // Voice model performance
        if (this.analytics.voiceModelAccuracy > 95) {
            insights.push({
                type: 'positive' as const,
                message: 'Voice model performing excellently',
                metric: 'Voice Accuracy',
                value: this.analytics.voiceModelAccuracy
            });
        } else if (this.analytics.voiceModelAccuracy < 90) {
            insights.push({
                type: 'negative' as const,
                message: 'Voice model accuracy below optimal',
                metric: 'Voice Accuracy',
                value: this.analytics.voiceModelAccuracy
            });
        }

        // Malayalam processing
        if (this.analytics.malayalamProcessingSuccess > 95) {
            insights.push({
                type: 'positive' as const,
                message: 'Malayalam processing highly successful',
                metric: 'Malayalam Success',
                value: this.analytics.malayalamProcessingSuccess
            });
        }

        // Success rate analysis
        if (this.analytics.successRate > 95) {
            insights.push({
                type: 'positive' as const,
                message: 'Call success rate excellent',
                metric: 'Success Rate',
                value: this.analytics.successRate
            });
        } else if (this.analytics.successRate < 85) {
            insights.push({
                type: 'negative' as const,
                message: 'Call success rate needs improvement',
                metric: 'Success Rate',
                value: this.analytics.successRate
            });
        }

        return insights;
    }

    // Cleanup
    destroy(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.eventListeners.clear();
    }
}

// Export singleton instance
export const callAnalytics = RealTimeCallAnalyticsService.getInstance();