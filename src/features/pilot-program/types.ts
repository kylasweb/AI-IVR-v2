// Pilot Client Program Types and Interfaces
// Project Saksham - Pilot Program Implementation

export interface PilotClient {
    id: string;
    name: string;
    type: ClientType;
    contactInfo: ClientContact;
    onboardingDate: Date;
    expectedEndDate: Date;
    status: PilotStatus;
    strategicEngines: AssignedEngine[];
    successMetrics: SuccessMetric[];
    baselineMetrics: BaselineMetrics;
    culturalProfile: ClientCulturalProfile;
    feedbackHistory: FeedbackEntry[];
    performanceData: ClientPerformanceData;
}

export enum ClientType {
    TAXI_OPERATOR = 'taxi_operator',
    RIDE_SHARING = 'ride_sharing',
    LOGISTICS_COMPANY = 'logistics_company',
    DELIVERY_SERVICE = 'delivery_service',
    TRANSPORT_AUTHORITY = 'transport_authority'
}

export enum PilotStatus {
    PENDING_SELECTION = 'pending_selection',
    ONBOARDING = 'onboarding',
    BASELINE_MEASUREMENT = 'baseline_measurement',
    ACTIVE_TESTING = 'active_testing',
    DATA_COLLECTION = 'data_collection',
    EVALUATION = 'evaluation',
    COMPLETED = 'completed',
    TERMINATED = 'terminated'
}

export interface ClientContact {
    primaryContact: ContactPerson;
    technicalContact?: ContactPerson;
    executiveContact?: ContactPerson;
    preferredCommunication: CommunicationMethod[];
}

export interface ContactPerson {
    name: string;
    title: string;
    email: string;
    phone: string;
    language: 'ml' | 'en' | 'manglish';
    timezone: string;
}

export enum CommunicationMethod {
    EMAIL = 'email',
    PHONE = 'phone',
    WHATSAPP = 'whatsapp',
    SLACK = 'slack',
    TEAMS = 'teams',
    IN_PERSON = 'in_person'
}

export interface AssignedEngine {
    engineId: string;
    engineType: string;
    assignedDate: Date;
    configuration: EngineConfiguration;
    expectedOutcomes: string[];
    monitoringLevel: MonitoringLevel;
}

export enum MonitoringLevel {
    BASIC = 'basic',
    DETAILED = 'detailed',
    COMPREHENSIVE = 'comprehensive'
}

export interface EngineConfiguration {
    parameters: Record<string, any>;
    culturalSettings: CulturalConfiguration;
    performanceThresholds: PerformanceThresholds;
    alertSettings: AlertConfiguration;
}

export interface CulturalConfiguration {
    primaryLanguage: 'ml' | 'en' | 'manglish';
    dialectPreference?: string;
    festivalCalendarEnabled: boolean;
    localCustomsIntegration: boolean;
    culturalSensitivityLevel: 'standard' | 'high' | 'maximum';
}

export interface PerformanceThresholds {
    responseTimeMax: number; // milliseconds
    accurracyMin: number; // percentage
    uptimeMin: number; // percentage
    satisfactionMin: number; // percentage
    customThresholds: Record<string, number>;
}

export interface AlertConfiguration {
    thresholdBreaches: boolean;
    performanceDegradation: boolean;
    errorRateSpikes: boolean;
    culturalIncidents: boolean;
    clientFeedbackAlerts: boolean;
    escalationChain: EscalationLevel[];
}

export interface EscalationLevel {
    level: number;
    recipients: string[];
    timeoutMinutes: number;
    actions: string[];
}

export interface SuccessMetric {
    id: string;
    name: string;
    description: string;
    type: MetricType;
    targetValue: number;
    currentValue?: number;
    unit: string;
    measurementFrequency: MeasurementFrequency;
    businessImpact: BusinessImpact;
    calculationMethod: string;
    dataSource: string[];
}

export enum MetricType {
    SATISFACTION_INCREASE = 'satisfaction_increase', // Target: 30%
    WAIT_TIME_REDUCTION = 'wait_time_reduction', // Target: 25%
    RESOLUTION_TIME_IMPROVEMENT = 'resolution_time_improvement',
    COST_REDUCTION = 'cost_reduction',
    EFFICIENCY_GAIN = 'efficiency_gain',
    CUSTOMER_RETENTION = 'customer_retention',
    REVENUE_INCREASE = 'revenue_increase',
    ERROR_REDUCTION = 'error_reduction'
}

export enum MeasurementFrequency {
    REAL_TIME = 'real_time',
    HOURLY = 'hourly',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

export enum BusinessImpact {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export interface BaselineMetrics {
    measurementPeriod: DateRange;
    customerSatisfaction: number;
    averageWaitTime: number;
    resolutionTime: number;
    callVolume: number;
    successfulResolutions: number;
    customerRetention: number;
    operationalCosts: number;
    culturalIncidents: number;
    languagePreferences: Record<string, number>;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface ClientCulturalProfile {
    primaryRegion: string;
    customerDemographics: DemographicData;
    languageDistribution: Record<string, number>;
    culturalPreferences: CulturalPreference[];
    festivalImpact: FestivalImpactData;
    localCustoms: Record<string, any>;
}

export interface DemographicData {
    ageGroups: Record<string, number>;
    genderDistribution: Record<string, number>;
    educationLevels: Record<string, number>;
    incomeRanges: Record<string, number>;
    techSavviness: Record<string, number>;
}

export interface CulturalPreference {
    category: string;
    preference: string;
    importance: 'low' | 'medium' | 'high';
    frequency: number; // percentage of customers
}

export interface FestivalImpactData {
    majorFestivals: FestivalInfo[];
    callVolumeImpact: Record<string, number>;
    satisfactionImpact: Record<string, number>;
    languagePreferenceChanges: Record<string, Record<string, number>>;
}

export interface FestivalInfo {
    name: string;
    dates: Date[];
    culturalSignificance: 'low' | 'medium' | 'high';
    businessImpact: 'minimal' | 'moderate' | 'significant';
}

export interface FeedbackEntry {
    id: string;
    timestamp: Date;
    source: FeedbackSource;
    type: FeedbackType;
    category: FeedbackCategory;
    rating?: number; // 1-5 scale
    comment: string;
    language: 'ml' | 'en' | 'manglish';
    sentiment: 'positive' | 'neutral' | 'negative';
    actionItems: ActionItem[];
    responseTime?: number;
    resolved: boolean;
    culturalContext?: string;
}

export enum FeedbackSource {
    CLIENT_EXECUTIVE = 'client_executive',
    TECHNICAL_TEAM = 'technical_team',
    END_USER = 'end_user',
    AUTOMATED_MONITORING = 'automated_monitoring',
    SURVEY = 'survey',
    INTERVIEW = 'interview'
}

export enum FeedbackType {
    BUG_REPORT = 'bug_report',
    FEATURE_REQUEST = 'feature_request',
    PERFORMANCE_ISSUE = 'performance_issue',
    CULTURAL_CONCERN = 'cultural_concern',
    SATISFACTION_FEEDBACK = 'satisfaction_feedback',
    SUGGESTION = 'suggestion',
    COMPLAINT = 'complaint',
    PRAISE = 'praise'
}

export enum FeedbackCategory {
    TECHNICAL = 'technical',
    CULTURAL = 'cultural',
    USER_EXPERIENCE = 'user_experience',
    PERFORMANCE = 'performance',
    BUSINESS_VALUE = 'business_value',
    INTEGRATION = 'integration'
}

export interface ActionItem {
    id: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo: string;
    dueDate: Date;
    status: 'open' | 'in_progress' | 'completed' | 'blocked';
    estimatedEffort: number; // hours
}

export interface ClientPerformanceData {
    currentMetrics: CurrentMetrics;
    trends: PerformanceTrend[];
    comparisons: PerformanceComparison;
    predictions: PerformancePrediction[];
    anomalies: PerformanceAnomaly[];
    recommendations: PerformanceRecommendation[];
}

export interface CurrentMetrics {
    timestamp: Date;
    customerSatisfaction: MetricValue;
    waitTimeReduction: MetricValue;
    resolutionTimeImprovement: MetricValue;
    costEfficiency: MetricValue;
    culturalAccuracy: MetricValue;
    systemUptime: MetricValue;
    userAdoption: MetricValue;
}

export interface MetricValue {
    current: number;
    target: number;
    baseline: number;
    unit: string;
    status: 'below_target' | 'on_target' | 'above_target';
    trend: 'improving' | 'stable' | 'declining';
}

export interface PerformanceTrend {
    metricName: string;
    timeframe: DateRange;
    dataPoints: TrendDataPoint[];
    direction: 'upward' | 'downward' | 'stable' | 'volatile';
    significance: 'high' | 'medium' | 'low';
}

export interface TrendDataPoint {
    timestamp: Date;
    value: number;
    context?: string;
}

export interface PerformanceComparison {
    baseline: ComparisonData;
    currentPeriod: ComparisonData;
    improvement: Record<string, number>;
    regressions: Record<string, number>;
    significance: StatisticalSignificance;
}

export interface ComparisonData {
    period: DateRange;
    metrics: Record<string, number>;
    sampleSize: number;
    confidence: number;
}

export interface StatisticalSignificance {
    pValue: number;
    confidenceLevel: number;
    significantMetrics: string[];
    insignificantMetrics: string[];
}

export interface PerformancePrediction {
    metricName: string;
    predictionHorizon: DateRange;
    predictedValue: number;
    confidence: number;
    factors: PredictionFactor[];
    scenarios: PredictionScenario[];
}

export interface PredictionFactor {
    name: string;
    importance: number; // 0-1 scale
    impact: 'positive' | 'negative' | 'neutral';
}

export interface PredictionScenario {
    name: string;
    probability: number;
    outcome: number;
    description: string;
}

export interface PerformanceAnomaly {
    id: string;
    timestamp: Date;
    metricName: string;
    anomalyType: AnomalyType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    potentialCauses: string[];
    impact: string;
    resolved: boolean;
    resolution?: string;
}

export enum AnomalyType {
    SPIKE = 'spike',
    DROP = 'drop',
    PATTERN_BREAK = 'pattern_break',
    SUSTAINED_DEVIATION = 'sustained_deviation',
    CULTURAL_MISMATCH = 'cultural_mismatch'
}

export interface PerformanceRecommendation {
    id: string;
    category: RecommendationCategory;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementationEffort: 'low' | 'medium' | 'high';
    timeline: string;
    dependencies: string[];
    metrics: string[]; // Which metrics this will improve
}

export enum RecommendationCategory {
    CONFIGURATION_OPTIMIZATION = 'configuration_optimization',
    CULTURAL_ENHANCEMENT = 'cultural_enhancement',
    PERFORMANCE_TUNING = 'performance_tuning',
    FEATURE_ADOPTION = 'feature_adoption',
    INTEGRATION_IMPROVEMENT = 'integration_improvement',
    TRAINING_ENHANCEMENT = 'training_enhancement'
}

// Pilot Program Management

export interface PilotProgram {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: ProgramStatus;
    objectives: ProgramObjective[];
    clients: string[]; // Client IDs
    coordinator: ProgramCoordinator;
    budget: ProgramBudget;
    timeline: ProgramMilestone[];
    riskAssessment: RiskAssessment;
    successCriteria: SuccessCriteria;
}

export enum ProgramStatus {
    PLANNING = 'planning',
    CLIENT_SELECTION = 'client_selection',
    ONBOARDING = 'onboarding',
    ACTIVE = 'active',
    DATA_ANALYSIS = 'data_analysis',
    REPORTING = 'reporting',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface ProgramObjective {
    id: string;
    description: string;
    targetMetrics: string[];
    successCriteria: string;
    priority: 'high' | 'medium' | 'low';
}

export interface ProgramCoordinator {
    name: string;
    role: string;
    email: string;
    phone: string;
    responsibilities: string[];
}

export interface ProgramBudget {
    totalBudget: number;
    allocated: Record<string, number>;
    spent: Record<string, number>;
    remaining: number;
    currency: string;
}

export interface ProgramMilestone {
    id: string;
    name: string;
    description: string;
    dueDate: Date;
    status: MilestoneStatus;
    dependencies: string[];
    deliverables: string[];
}

export enum MilestoneStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    DELAYED = 'delayed',
    BLOCKED = 'blocked'
}

export interface RiskAssessment {
    identifiedRisks: Risk[];
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigationStrategies: MitigationStrategy[];
    contingencyPlans: ContingencyPlan[];
}

export interface Risk {
    id: string;
    description: string;
    category: RiskCategory;
    probability: number; // 0-1 scale
    impact: number; // 0-1 scale
    severity: 'low' | 'medium' | 'high' | 'critical';
    owner: string;
}

export enum RiskCategory {
    TECHNICAL = 'technical',
    CULTURAL = 'cultural',
    BUSINESS = 'business',
    TIMELINE = 'timeline',
    BUDGET = 'budget',
    CLIENT_ENGAGEMENT = 'client_engagement'
}

export interface MitigationStrategy {
    riskId: string;
    strategy: string;
    actions: string[];
    owner: string;
    timeline: string;
}

export interface ContingencyPlan {
    trigger: string;
    actions: string[];
    resources: string[];
    timeline: string;
    escalation: string[];
}

export interface SuccessCriteria {
    primary: SuccessCriterion[];
    secondary: SuccessCriterion[];
    minimumAcceptable: SuccessCriterion[];
}

export interface SuccessCriterion {
    metric: string;
    target: number;
    measurement: string;
    timeframe: string;
    weight: number; // Importance weight
}