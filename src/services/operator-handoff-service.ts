/**
 * Enhanced Operator Handoff Service
 * Implements comprehensive handoff workflows with cultural intelligence
 * Complies with IMOS AI IVR Platform PRD requirements
 */

export interface OperatorProfile {
    id: string;
    operatorId: string;
    displayName: string;
    languages: string[];
    specialization: string[];
    skillLevel: 'junior' | 'senior' | 'expert' | 'specialist';
    malayalamFluency: number;
    culturalKnowledge: number;
    dialectSupport: string[];
    isOnline: boolean;
    currentStatus: 'offline' | 'available' | 'busy' | 'break';
    maxConcurrentCalls: number;
    currentCallCount: number;
    averageHandleTime: number;
    customerSatisfaction: number;
    escalationRate: number;
    resolutionRate: number;
}

export interface HandoffRequest {
    callRecordId: string;
    sessionId: string;
    fromOperatorId?: string; // null for AI handoff
    handoffType: 'escalation' | 'transfer' | 'specialty_required' | 'cultural_assistance';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    reason: string;
    customerIssue?: string;
    aiContext?: any;
    culturalContext?: {
        language: string;
        dialect?: string;
        culturalSensitivity: boolean;
        respectLevel: string;
        familyContext?: any;
        festivalContext?: any;
    };
    languageRequirement?: string;
    customerPreferences?: {
        preferredLanguage: string;
        culturalBackground: string;
        communicationStyle: string;
    };
}

export interface HandoffResult {
    success: boolean;
    handoffId: string;
    assignedOperatorId?: string;
    estimatedWaitTime?: number;
    reason?: string;
    alternativeOptions?: {
        callbackOption: boolean;
        escalationAvailable: boolean;
        culturalSpecialistAvailable: boolean;
    };
}

export interface HandoffMetrics {
    totalHandoffs: number;
    successfulHandoffs: number;
    averageResponseTime: number;
    customerSatisfactionScore: number;
    culturalHandoffSuccess: number;
    malayalamHandoffSuccess: number;
    escalationResolutionRate: number;
}

export class OperatorHandoffService {
    private availableOperators: Map<string, OperatorProfile> = new Map();
    private activeHandoffs: Map<string, HandoffRequest> = new Map();
    private handoffQueue: HandoffRequest[] = [];
    private handoffMetrics: HandoffMetrics;

    constructor() {
        this.handoffMetrics = {
            totalHandoffs: 0,
            successfulHandoffs: 0,
            averageResponseTime: 0,
            customerSatisfactionScore: 0,
            culturalHandoffSuccess: 0,
            malayalamHandoffSuccess: 0,
            escalationResolutionRate: 0
        };
        this.initializeOperatorProfiles();
        this.startHandoffProcessing();
    }

    /**
     * Request handoff to human operator with cultural intelligence
     */
    async requestHandoff(request: HandoffRequest): Promise<HandoffResult> {
        try {
            console.log(`🔄 Processing handoff request for session: ${request.sessionId}`);

            // Validate handoff request
            const validation = await this.validateHandoffRequest(request);
            if (!validation.isValid) {
                return {
                    success: false,
                    handoffId: '',
                    reason: validation.reason
                };
            }

            // Find best operator match
            const bestOperator = await this.findBestOperatorMatch(request);

            if (!bestOperator) {
                // Add to queue if no operator available
                this.handoffQueue.push(request);

                return {
                    success: false,
                    handoffId: crypto.randomUUID(),
                    estimatedWaitTime: this.calculateEstimatedWaitTime(),
                    reason: 'No operators currently available',
                    alternativeOptions: {
                        callbackOption: true,
                        escalationAvailable: this.hasEscalationOptions(request),
                        culturalSpecialistAvailable: this.hasCulturalSpecialists(request)
                    }
                };
            }

            // Create handoff record
            const handoffId = crypto.randomUUID();
            const handoff = {
                ...request,
                id: handoffId,
                toOperatorId: bestOperator.id,
                status: 'pending',
                requestedAt: new Date(),
                responseTime: 0
            };

            this.activeHandoffs.set(handoffId, request);

            // Notify operator
            await this.notifyOperator(bestOperator, handoff);

            // Update operator status
            bestOperator.currentCallCount++;
            if (bestOperator.currentCallCount >= bestOperator.maxConcurrentCalls) {
                bestOperator.currentStatus = 'busy';
            }

            this.handoffMetrics.totalHandoffs++;

            return {
                success: true,
                handoffId,
                assignedOperatorId: bestOperator.id,
                estimatedWaitTime: 0
            };

        } catch (error) {
            console.error('❌ Handoff request failed:', error);
            return {
                success: false,
                handoffId: '',
                reason: 'Internal handoff service error'
            };
        }
    }

    /**
     * Find best operator match based on cultural intelligence and availability
     */
    private async findBestOperatorMatch(request: HandoffRequest): Promise<OperatorProfile | null> {
        const availableOps = Array.from(this.availableOperators.values())
            .filter(op => op.isOnline && op.currentStatus === 'available');

        if (availableOps.length === 0) {
            return null;
        }

        // Score operators based on request requirements
        const scoredOperators = availableOps.map(operator => ({
            operator,
            score: this.calculateOperatorMatchScore(operator, request)
        }));

        // Sort by score (highest first)
        scoredOperators.sort((a, b) => b.score - a.score);

        return scoredOperators[0].score > 0 ? scoredOperators[0].operator : null;
    }

    /**
     * Calculate operator match score based on cultural and technical requirements
     */
    private calculateOperatorMatchScore(operator: OperatorProfile, request: HandoffRequest): number {
        let score = 0;

        // Base availability score
        if (operator.currentCallCount < operator.maxConcurrentCalls) {
            score += 100;
        }

        // Language requirements
        if (request.languageRequirement) {
            if (operator.languages.includes(request.languageRequirement)) {
                score += 50;
            } else {
                return 0; // Must have required language
            }
        }

        // Malayalam fluency (critical for Malayalam speakers)
        if (request.culturalContext?.language === 'ml' || request.languageRequirement === 'ml') {
            score += operator.malayalamFluency * 30;
        }

        // Cultural knowledge score
        if (request.culturalContext?.culturalSensitivity) {
            score += operator.culturalKnowledge * 25;
        }

        // Dialect support
        if (request.culturalContext?.dialect && operator.dialectSupport.includes(request.culturalContext.dialect)) {
            score += 20;
        }

        // Specialization match
        if (request.handoffType === 'specialty_required') {
            const hasSpecialization = request.customerIssue ?
                operator.specialization.some(spec => request.customerIssue!.toLowerCase().includes(spec.toLowerCase())) :
                false;
            if (hasSpecialization) {
                score += 40;
            }
        }

        // Performance metrics
        score += operator.customerSatisfaction * 10;
        score += operator.resolutionRate * 15;
        score -= operator.escalationRate * 10;

        // Skill level bonus
        const skillBonus = {
            'junior': 0,
            'senior': 10,
            'expert': 20,
            'specialist': 30
        };
        score += skillBonus[operator.skillLevel];

        // Priority handling
        if (request.priority === 'urgent' && operator.skillLevel === 'expert') {
            score += 25;
        }

        return Math.max(0, score);
    }

    /**
     * Handle operator acceptance/rejection of handoff
     */
    async handleOperatorResponse(handoffId: string, accepted: boolean, operatorId: string, notes?: string): Promise<void> {
        const handoff = this.activeHandoffs.get(handoffId);
        if (!handoff) {
            throw new Error('Handoff not found');
        }

        const operator = this.availableOperators.get(operatorId);
        if (!operator) {
            throw new Error('Operator not found');
        }

        if (accepted) {
            // Mark handoff as accepted
            console.log(`✅ Handoff ${handoffId} accepted by operator ${operatorId}`);

            // Update operator status
            operator.currentStatus = 'busy';

            // Notify caller about successful handoff
            await this.notifyCallerHandoffSuccess(handoff.sessionId, operatorId);

            // Update metrics
            this.handoffMetrics.successfulHandoffs++;

            // Remove from active handoffs
            this.activeHandoffs.delete(handoffId);

            // Save handoff record to database
            await this.saveHandoffRecord(handoffId, handoff, 'accepted', operatorId, notes);

        } else {
            // Find alternative operator
            console.log(`❌ Handoff ${handoffId} rejected by operator ${operatorId}. Finding alternative...`);

            // Free up operator
            operator.currentCallCount--;
            if (operator.currentCallCount < operator.maxConcurrentCalls) {
                operator.currentStatus = 'available';
            }

            // Try to find alternative operator
            const alternativeOperator = await this.findBestOperatorMatch(handoff);

            if (alternativeOperator) {
                // Assign to alternative operator
                await this.notifyOperator(alternativeOperator, { ...handoff, toOperatorId: alternativeOperator.id });
            } else {
                // Add back to queue or escalate
                this.handoffQueue.push(handoff);
                await this.notifyCallerHandoffDelay(handoff.sessionId);
            }

            await this.saveHandoffRecord(handoffId, handoff, 'rejected', operatorId, notes);
        }
    }

    /**
     * Get real-time handoff metrics
     */
    getHandoffMetrics(): HandoffMetrics & {
        queueLength: number;
        activeHandoffs: number;
        availableOperators: number;
    } {
        return {
            ...this.handoffMetrics,
            queueLength: this.handoffQueue.length,
            activeHandoffs: this.activeHandoffs.size,
            availableOperators: Array.from(this.availableOperators.values())
                .filter(op => op.isOnline && op.currentStatus === 'available').length
        };
    }

    /**
     * Get operator performance analytics
     */
    async getOperatorAnalytics(operatorId?: string): Promise<any> {
        if (operatorId) {
            const operator = this.availableOperators.get(operatorId);
            if (!operator) {
                throw new Error('Operator not found');
            }

            return {
                operatorId,
                name: operator.displayName,
                metrics: {
                    averageHandleTime: operator.averageHandleTime,
                    customerSatisfaction: operator.customerSatisfaction,
                    escalationRate: operator.escalationRate,
                    resolutionRate: operator.resolutionRate,
                    malayalamFluency: operator.malayalamFluency,
                    culturalKnowledge: operator.culturalKnowledge
                },
                status: {
                    isOnline: operator.isOnline,
                    currentStatus: operator.currentStatus,
                    currentCallCount: operator.currentCallCount,
                    capacity: operator.maxConcurrentCalls
                }
            };
        }

        // Return analytics for all operators
        return Array.from(this.availableOperators.values()).map(operator => ({
            operatorId: operator.id,
            name: operator.displayName,
            metrics: {
                averageHandleTime: operator.averageHandleTime,
                customerSatisfaction: operator.customerSatisfaction,
                escalationRate: operator.escalationRate,
                resolutionRate: operator.resolutionRate,
                malayalamFluency: operator.malayalamFluency,
                culturalKnowledge: operator.culturalKnowledge
            },
            status: {
                isOnline: operator.isOnline,
                currentStatus: operator.currentStatus,
                currentCallCount: operator.currentCallCount,
                capacity: operator.maxConcurrentCalls
            }
        }));
    }

    // Private helper methods
    private async validateHandoffRequest(request: HandoffRequest): Promise<{ isValid: boolean; reason?: string }> {
        if (!request.sessionId || !request.reason) {
            return { isValid: false, reason: 'Missing required fields' };
        }

        return { isValid: true };
    }

    private calculateEstimatedWaitTime(): number {
        // Calculate based on current queue and operator availability
        const queueLength = this.handoffQueue.length;
        const availableOperators = Array.from(this.availableOperators.values())
            .filter(op => op.isOnline && op.currentStatus !== 'offline').length;

        if (availableOperators === 0) {
            return 300; // 5 minutes default
        }

        const averageHandleTime = Array.from(this.availableOperators.values())
            .reduce((sum, op) => sum + op.averageHandleTime, 0) / this.availableOperators.size;

        return Math.ceil((queueLength * averageHandleTime) / availableOperators);
    }

    private hasEscalationOptions(request: HandoffRequest): boolean {
        return Array.from(this.availableOperators.values())
            .some(op => op.skillLevel === 'expert' || op.skillLevel === 'specialist');
    }

    private hasCulturalSpecialists(request: HandoffRequest): boolean {
        return Array.from(this.availableOperators.values())
            .some(op => op.malayalamFluency > 0.8 && op.culturalKnowledge > 0.8);
    }

    private async notifyOperator(operator: OperatorProfile, handoff: any): Promise<void> {
        // In a real implementation, this would send notifications via WebSocket, email, etc.
        console.log(`📞 Notifying operator ${operator.displayName} about handoff request`);
    }

    private async notifyCallerHandoffSuccess(sessionId: string, operatorId: string): Promise<void> {
        console.log(`✅ Notifying caller about successful handoff to operator ${operatorId}`);
    }

    private async notifyCallerHandoffDelay(sessionId: string): Promise<void> {
        console.log(`⏰ Notifying caller about handoff delay for session ${sessionId}`);
    }

    private async saveHandoffRecord(handoffId: string, handoff: HandoffRequest, status: string, operatorId: string, notes?: string): Promise<void> {
        // Save to database using Prisma
        console.log(`💾 Saving handoff record: ${handoffId} with status: ${status}`);
    }

    private initializeOperatorProfiles(): void {
        // Initialize with sample operator profiles
        const sampleOperators: OperatorProfile[] = [
            {
                id: 'op-001',
                operatorId: 'ML_EXPERT_001',
                displayName: 'രാധിക നായർ (Radhika Nair)',
                languages: ['ml', 'en', 'hi'],
                specialization: ['healthcare', 'government_services', 'cultural_support'],
                skillLevel: 'expert',
                malayalamFluency: 0.98,
                culturalKnowledge: 0.95,
                dialectSupport: ['central_kerala', 'malabar', 'travancore'],
                isOnline: true,
                currentStatus: 'available',
                maxConcurrentCalls: 3,
                currentCallCount: 0,
                averageHandleTime: 420,
                customerSatisfaction: 4.8,
                escalationRate: 0.12,
                resolutionRate: 0.87
            },
            {
                id: 'op-002',
                operatorId: 'EN_ML_002',
                displayName: 'അർജുൻ മേനോൻ (Arjun Menon)',
                languages: ['en', 'ml', 'manglish'],
                specialization: ['technical_support', 'billing', 'general_inquiry'],
                skillLevel: 'senior',
                malayalamFluency: 0.85,
                culturalKnowledge: 0.78,
                dialectSupport: ['central_kerala', 'cochin'],
                isOnline: true,
                currentStatus: 'available',
                maxConcurrentCalls: 4,
                currentCallCount: 1,
                averageHandleTime: 380,
                customerSatisfaction: 4.5,
                escalationRate: 0.18,
                resolutionRate: 0.82
            }
        ];

        sampleOperators.forEach(op => {
            this.availableOperators.set(op.id, op);
        });
    }

    private startHandoffProcessing(): void {
        // Process handoff queue every 5 seconds
        setInterval(() => {
            this.processHandoffQueue();
        }, 5000);
    }

    private async processHandoffQueue(): Promise<void> {
        if (this.handoffQueue.length === 0) return;

        const nextHandoff = this.handoffQueue.shift();
        if (nextHandoff) {
            const result = await this.requestHandoff(nextHandoff);
            if (!result.success) {
                // Put back in queue if still no operators available
                this.handoffQueue.unshift(nextHandoff);
            }
        }
    }
}

// Export singleton instance
export const operatorHandoffService = new OperatorHandoffService();