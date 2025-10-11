import { Server } from 'socket.io';

export interface RealTimeMetrics {
  activeCalls: number;
  totalCallsToday: number;
  averageCallDuration: number;
  successRate: number;
  currentWaitTime: number;
  agentUtilization: number;
  systemLoad: number;
  responseTime: number;
}

export interface CallEvent {
  id: string;
  type: 'call_started' | 'call_ended' | 'agent_assigned' | 'call_transferred';
  timestamp: Date;
  data: any;
}

export interface AgentMetrics {
  agentId: string;
  name: string;
  status: 'available' | 'busy' | 'offline' | 'break';
  activeCalls: number;
  totalCallsToday: number;
  averageCallDuration: number;
  satisfaction: number;
  lastActivity: Date;
}

export class RealTimeAnalyticsService {
  private io: Server;
  private metrics: RealTimeMetrics;
  private activeCalls: Map<string, any> = new Map();
  private agentMetrics: Map<string, AgentMetrics> = new Map();
  private callHistory: CallEvent[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
    this.metrics = this.initializeMetrics();
    this.startRealTimeUpdates();
  }

  private initializeMetrics(): RealTimeMetrics {
    return {
      activeCalls: 0,
      totalCallsToday: 0,
      averageCallDuration: 0,
      successRate: 0,
      currentWaitTime: 0,
      agentUtilization: 0,
      systemLoad: 0,
      responseTime: 0
    };
  }

  private startRealTimeUpdates(): void {
    // Update metrics every 5 seconds
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
      this.broadcastMetrics();
    }, 5000);
  }

  async onCallStarted(callData: any): Promise<void> {
    const call = {
      id: callData.id,
      startTime: new Date(),
      ...callData
    };

    this.activeCalls.set(call.id, call);
    this.metrics.activeCalls++;
    this.metrics.totalCallsToday++;

    const event: CallEvent = {
      id: crypto.randomUUID(),
      type: 'call_started',
      timestamp: new Date(),
      data: call
    };

    this.callHistory.push(event);
    this.emitCallEvent(event);
  }

  async onCallEnded(callId: string, callData: any): Promise<void> {
    const call = this.activeCalls.get(callId);
    if (!call) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - call.startTime.getTime()) / 1000;

    this.activeCalls.delete(callId);
    this.metrics.activeCalls--;

    // Update average call duration
    this.updateAverageCallDuration(duration);

    const event: CallEvent = {
      id: crypto.randomUUID(),
      type: 'call_ended',
      timestamp: endTime,
      data: {
        callId,
        duration,
        success: callData.success,
        ...callData
      }
    };

    this.callHistory.push(event);
    this.emitCallEvent(event);
  }

  async onAgentAssigned(agentId: string, callId: string): Promise<void> {
    const agent = this.agentMetrics.get(agentId);
    if (agent) {
      agent.activeCalls++;
      agent.totalCallsToday++;
      agent.lastActivity = new Date();
    }

    const event: CallEvent = {
      id: crypto.randomUUID(),
      type: 'agent_assigned',
      timestamp: new Date(),
      data: { agentId, callId }
    };

    this.callHistory.push(event);
    this.emitCallEvent(event);
  }

  async updateAgentStatus(agentId: string, status: AgentMetrics['status']): Promise<void> {
    const agent = this.agentMetrics.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date();
    }

    this.io.emit('agent_status_update', {
      agentId,
      status,
      timestamp: new Date()
    });
  }

  private updateMetrics(): void {
    // Update system load
    this.metrics.systemLoad = this.calculateSystemLoad();
    
    // Update response time
    this.metrics.responseTime = this.calculateAverageResponseTime();
    
    // Update agent utilization
    this.metrics.agentUtilization = this.calculateAgentUtilization();
    
    // Update current wait time
    this.metrics.currentWaitTime = this.calculateCurrentWaitTime();
    
    // Update success rate
    this.metrics.successRate = this.calculateSuccessRate();
  }

  private calculateSystemLoad(): number {
    // Calculate system load based on active calls and available agents
    const totalAgents = this.agentMetrics.size;
    const availableAgents = Array.from(this.agentMetrics.values())
      .filter(agent => agent.status === 'available').length;
    
    if (totalAgents === 0) return 1.0;
    
    const agentLoad = (totalAgents - availableAgents) / totalAgents;
    const callLoad = Math.min(this.metrics.activeCalls / 10, 1); // Assume 10 calls is full load
    
    return (agentLoad + callLoad) / 2;
  }

  private calculateAverageResponseTime(): number {
    // Calculate average time to answer calls
    const recentCalls = this.callHistory
      .filter(event => event.type === 'call_started')
      .slice(-20); // Last 20 calls

    if (recentCalls.length === 0) return 0;

    const totalResponseTime = recentCalls.reduce((sum, event) => {
      return sum + (event.data.responseTime || 0);
    }, 0);

    return totalResponseTime / recentCalls.length;
  }

  private calculateAgentUtilization(): number {
    const agents = Array.from(this.agentMetrics.values());
    if (agents.length === 0) return 0;

    const busyAgents = agents.filter(agent => agent.status === 'busy').length;
    return busyAgents / agents.length;
  }

  private calculateCurrentWaitTime(): number {
    // Calculate current average wait time for calls in queue
    const queuedCalls = Array.from(this.activeCalls.values())
      .filter(call => call.status === 'queued');

    if (queuedCalls.length === 0) return 0;

    const totalWaitTime = queuedCalls.reduce((sum, call) => {
      return sum + (Date.now() - call.queueStartTime.getTime());
    }, 0);

    return totalWaitTime / queuedCalls.length / 1000; // Convert to seconds
  }

  private calculateSuccessRate(): number {
    const recentEndedCalls = this.callHistory
      .filter(event => event.type === 'call_ended')
      .slice(-50); // Last 50 calls

    if (recentEndedCalls.length === 0) return 0;

    const successfulCalls = recentEndedCalls.filter(event => event.data.success).length;
    return successfulCalls / recentEndedCalls.length;
  }

  private updateAverageCallDuration(duration: number): void {
    const totalCalls = this.metrics.totalCallsToday;
    if (totalCalls === 1) {
      this.metrics.averageCallDuration = duration;
    } else {
      this.metrics.averageCallDuration = 
        (this.metrics.averageCallDuration * (totalCalls - 1) + duration) / totalCalls;
    }
  }

  private emitCallEvent(event: CallEvent): void {
    this.io.emit('call_event', event);
  }

  private broadcastMetrics(): void {
    this.io.emit('metrics_update', {
      metrics: this.metrics,
      timestamp: new Date(),
      activeCallsCount: this.activeCalls.size,
      agentsCount: this.agentMetrics.size
    });
  }

  // Agent management
  async registerAgent(agentData: any): Promise<void> {
    const agent: AgentMetrics = {
      agentId: agentData.id,
      name: agentData.name,
      status: 'offline',
      activeCalls: 0,
      totalCallsToday: 0,
      averageCallDuration: 0,
      satisfaction: 0,
      lastActivity: new Date()
    };

    this.agentMetrics.set(agentData.id, agent);
    
    this.io.emit('agent_registered', agent);
  }

  async unregisterAgent(agentId: string): Promise<void> {
    this.agentMetrics.delete(agentId);
    
    this.io.emit('agent_unregistered', { agentId, timestamp: new Date() });
  }

  // Getters for current state
  getMetrics(): RealTimeMetrics {
    return { ...this.metrics };
  }

  getActiveCalls(): any[] {
    return Array.from(this.activeCalls.values());
  }

  getAgentMetrics(): AgentMetrics[] {
    return Array.from(this.agentMetrics.values());
  }

  getCallHistory(limit: number = 100): CallEvent[] {
    return this.callHistory.slice(-limit);
  }

  // Analytics methods
  async getHourlyStats(): Promise<any[]> {
    const hourlyStats: any[] = [];
    const now = new Date();
    
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(now);
      hourStart.setHours(hour, 0, 0, 0);
      
      const hourEnd = new Date(now);
      hourEnd.setHours(hour, 59, 59, 999);
      
      const callsInHour = this.callHistory.filter(event => {
        return event.timestamp >= hourStart && event.timestamp <= hourEnd;
      });

      hourlyStats.push({
        hour,
        calls: callsInHour.length,
        successful: callsInHour.filter(e => e.data.success).length,
        averageDuration: this.calculateAverageDurationForHour(callsInHour)
      });
    }
    
    return hourlyStats;
  }

  private calculateAverageDurationForHour(events: CallEvent[]): number {
    const endedCalls = events.filter(e => e.type === 'call_ended' && e.data.duration);
    if (endedCalls.length === 0) return 0;
    
    const totalDuration = endedCalls.reduce((sum, event) => sum + event.data.duration, 0);
    return totalDuration / endedCalls.length;
  }

  async getTopIntents(): Promise<any[]> {
    const intentCounts: { [intent: string]: number } = {};
    
    this.callHistory.forEach(event => {
      if (event.data.intent) {
        intentCounts[event.data.intent] = (intentCounts[event.data.intent] || 0) + 1;
      }
    });

    return Object.entries(intentCounts)
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async getAgentPerformance(): Promise<any[]> {
    return Array.from(this.agentMetrics.values())
      .map(agent => ({
        agentId: agent.agentId,
        name: agent.name,
        totalCalls: agent.totalCallsToday,
        averageCallDuration: agent.averageCallDuration,
        satisfaction: agent.satisfaction,
        utilization: this.calculateAgentUtilizationForAgent(agent)
      }))
      .sort((a, b) => b.totalCalls - a.totalCalls);
  }

  private calculateAgentUtilizationForAgent(agent: AgentMetrics): number {
    const totalShiftTime = 8 * 60 * 60; // 8 hours in seconds
    const totalCallTime = agent.averageCallDuration * agent.totalCallsToday;
    return Math.min(totalCallTime / totalShiftTime, 1);
  }

  // Cleanup
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}