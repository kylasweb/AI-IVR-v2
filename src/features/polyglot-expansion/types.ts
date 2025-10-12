// Polyglot Language Expansion System
// Types and interfaces for global multi-language support

export interface Language {
    code: string; // ISO 639-1 or 639-3 code
    name: string;
    nativeName: string;
    family: LanguageFamily;
    region: string[];
    speakers: number; // Number of speakers worldwide
    status: LanguageStatus;
    writingSystem: WritingSystem[];
    directionality: 'ltr' | 'rtl' | 'ttb' | 'mixed';
    complexityLevel: LanguageComplexity;
    culturalContext: GlobalCulturalContext;
    dialectVariations: Dialect[];
    metadata: LanguageMetadata;
}

export type LanguageFamily =
    | 'indo_european'
    | 'sino_tibetan'
    | 'niger_congo'
    | 'afro_asiatic'
    | 'trans_new_guinea'
    | 'austronesian'
    | 'tai_kadai'
    | 'dravidian'
    | 'altaic'
    | 'nilo_saharan'
    | 'other';

export type LanguageStatus =
    | 'living'        // Actively spoken
    | 'endangered'    // At risk of disappearing
    | 'dormant'       // No longer actively spoken but revivable
    | 'extinct'       // No longer spoken
    | 'constructed'   // Artificially created
    | 'liturgical';   // Used primarily in religious contexts

export type WritingSystem =
    | 'latin'
    | 'cyrillic'
    | 'arabic'
    | 'devanagari'
    | 'chinese'
    | 'japanese'
    | 'korean'
    | 'thai'
    | 'tamil'
    | 'malayalam'
    | 'bengali'
    | 'gujarati'
    | 'punjabi'
    | 'telugu'
    | 'kannada'
    | 'oriya'
    | 'hebrew'
    | 'greek'
    | 'armenian'
    | 'georgian'
    | 'ethiopic'
    | 'other';

export type LanguageComplexity =
    | 'low'          // Basic grammar, limited expressions
    | 'moderate'     // Standard complexity
    | 'high'         // Complex grammar, rich expressions
    | 'expert';      // Highly complex, specialized knowledge required

export interface Dialect {
    code: string;
    name: string;
    region: string;
    speakers: number;
    variations: DialectVariation[];
    culturalNotes: string[];
}

export interface DialectVariation {
    type: 'phonetic' | 'lexical' | 'grammatical' | 'cultural';
    description: string;
    examples: string[];
    frequency: number; // 0-1 scale
}

export interface LanguageMetadata {
    lastUpdated: Date;
    dataQuality: number; // 0-1 scale
    supportLevel: SupportLevel;
    resources: LanguageResource[];
    contributors: string[];
    testCoverage: number; // 0-1 scale
}

export type SupportLevel =
    | 'native'       // Full native support
    | 'professional' // Professional translation quality
    | 'community'    // Community-contributed
    | 'basic'        // Basic support
    | 'experimental' // Under development
    | 'planned';     // Future support planned

export interface LanguageResource {
    type: 'dictionary' | 'grammar' | 'corpus' | 'cultural_guide' | 'pronunciation' | 'examples';
    source: string;
    quality: number; // 0-1 scale
    size: number;    // Number of entries/items
    lastUpdated: Date;
}

export interface GlobalCulturalContext {
    region: string;
    countries: string[];
    majorCities: string[];
    culturalValues: CulturalValue[];
    socialNorms: SocialNorm[];
    businessEtiquette: BusinessEtiquette;
    communicationStyle: CommunicationStyle;
    timeOrientation: TimeOrientation;
    formalityLevels: FormalityLevel[];
    taboos: Taboo[];
    celebrations: Celebration[];
    religiousContext: ReligiousContext[];
    familyStructure: FamilyStructureInfo;
    economicContext: EconomicContext;
    educationalSystem: EducationalInfo;
    healthcarePractices: HealthcareInfo;
    technologicalAdoption: TechnologyInfo;
}

export interface CulturalValue {
    name: string;
    description: string;
    importance: number; // 0-1 scale
    examples: string[];
    relatedValues: string[];
}

export interface SocialNorm {
    category: 'greeting' | 'conversation' | 'eating' | 'dress' | 'gesture' | 'hierarchy' | 'privacy';
    description: string;
    importance: 'critical' | 'important' | 'moderate' | 'minor';
    examples: string[];
    violations: string[]; // What to avoid
}

export interface BusinessEtiquette {
    meetingStyle: 'formal' | 'semi_formal' | 'casual';
    hierarchyImportance: number; // 0-1 scale
    punctuality: 'strict' | 'flexible' | 'relaxed';
    negotiationStyle: 'direct' | 'indirect' | 'relationship_based';
    giftGiving: GiftGivingNorms;
    cardExchange: BusinessCardNorms;
    dressCode: DressCodeNorms;
}

export interface GiftGivingNorms {
    appropriate: boolean;
    occasions: string[];
    restrictions: string[];
    etiquette: string[];
}

export interface BusinessCardNorms {
    importance: number; // 0-1 scale
    presentation: string[];
    receiving: string[];
    storage: string[];
}

export interface DressCodeNorms {
    formality: 'very_formal' | 'formal' | 'business_casual' | 'casual';
    restrictions: string[];
    seasonalConsiderations: string[];
}

export interface CommunicationStyle {
    directness: number; // 0-1 scale (0=very indirect, 1=very direct)
    contextLevel: 'high' | 'medium' | 'low'; // High context = implied meaning important
    emotionalExpression: 'expressive' | 'moderate' | 'reserved';
    silenceComfort: number; // 0-1 scale
    interruptionTolerance: number; // 0-1 scale
    volumeLevel: 'quiet' | 'moderate' | 'loud';
    personalSpace: number; // Centimeters
    eyeContact: 'essential' | 'important' | 'moderate' | 'avoided';
    touchBoundaries: TouchBoundary[];
}

export interface TouchBoundary {
    relationship: 'stranger' | 'acquaintance' | 'friend' | 'family' | 'business';
    appropriateTouch: string[];
    inappropriateTouch: string[];
    genderConsiderations: string[];
}

export interface TimeOrientation {
    punctuality: 'strict' | 'flexible' | 'relaxed';
    planningHorizon: 'short_term' | 'medium_term' | 'long_term';
    pastOrientation: number; // 0-1 scale
    presentOrientation: number; // 0-1 scale
    futureOrientation: number; // 0-1 scale
    cyclicalVsLinear: 'cyclical' | 'linear' | 'mixed';
}

export interface FormalityLevel {
    level: 'very_formal' | 'formal' | 'semi_formal' | 'informal' | 'very_informal';
    contexts: string[];
    languageFeatures: string[];
    behaviorExpectations: string[];
    addressingPatterns: string[];
}

export interface Taboo {
    category: 'religious' | 'cultural' | 'political' | 'social' | 'personal';
    description: string;
    severity: 'minor' | 'moderate' | 'major' | 'severe';
    consequences: string[];
    alternatives: string[];
    exceptions: string[];
}

export interface Celebration {
    name: string;
    type: 'religious' | 'national' | 'cultural' | 'seasonal' | 'personal';
    dates: CelebrationDate[];
    duration: string;
    significance: string;
    traditions: string[];
    greetings: string[];
    taboos: string[];
    businessImpact: string;
}

export interface CelebrationDate {
    type: 'fixed' | 'lunar' | 'solar' | 'moveable';
    date?: string; // For fixed dates
    calculation?: string; // For calculated dates
    approximateTime?: string; // For variable dates
}

export interface ReligiousContext {
    religion: string;
    percentage: number; // Percentage of population
    practices: string[];
    holidays: string[];
    dietaryRestrictions: string[];
    workSchedule: string[];
    communicationGuidelines: string[];
}

export interface FamilyStructureInfo {
    typical: 'nuclear' | 'extended' | 'joint' | 'mixed';
    hierarchyImportance: number; // 0-1 scale
    elderRespect: number; // 0-1 scale
    childrenRole: string[];
    genderRoles: GenderRole[];
    decisionMaking: 'patriarchal' | 'matriarchal' | 'egalitarian' | 'consensus';
}

export interface GenderRole {
    gender: string;
    traditionalRoles: string[];
    modernTrends: string[];
    workplaceConsiderations: string[];
}

export interface EconomicContext {
    developmentLevel: 'developed' | 'developing' | 'least_developed';
    primaryIndustries: string[];
    currencyStability: number; // 0-1 scale
    businessClimate: string[];
    consumerBehavior: string[];
    digitalAdoption: number; // 0-1 scale
}

export interface EducationalInfo {
    literacyRate: number; // 0-1 scale
    systemType: string;
    languagesOfInstruction: string[];
    technicalEducation: string[];
    higherEducation: string[];
}

export interface HealthcareInfo {
    systemType: 'public' | 'private' | 'mixed';
    traditionallMedicine: string[];
    healthBeliefs: string[];
    preventiveCare: string[];
    mentalHealthStigma: number; // 0-1 scale
}

export interface TechnologyInfo {
    internetPenetration: number; // 0-1 scale
    mobileAdoption: number; // 0-1 scale
    preferredPlatforms: string[];
    digitalPayments: number; // 0-1 scale
    techSkillLevel: 'basic' | 'intermediate' | 'advanced';
}

export interface PolyglotTranslationRequest {
    sourceText: string;
    sourceLanguage: string;
    targetLanguage: string;
    domain?: TranslationDomain;
    formality?: 'formal' | 'informal' | 'auto';
    culturalAdaptation?: boolean;
    preserveFormatting?: boolean;
    glossary?: Record<string, string>;
    contextHints?: string[];
    metadata?: Record<string, any>;
}

export type TranslationDomain =
    | 'general'
    | 'business'
    | 'technical'
    | 'medical'
    | 'legal'
    | 'educational'
    | 'marketing'
    | 'customer_service'
    | 'tourism'
    | 'entertainment'
    | 'religious'
    | 'government';

export interface PolyglotTranslationResult {
    translatedText: string;
    confidence: number; // 0-1 scale
    quality: TranslationQuality;
    culturalAdaptations: CulturalAdaptation[];
    alternatives: AlternativeTranslation[];
    warnings: TranslationWarning[];
    metadata: TranslationMetadata;
}

export interface TranslationQuality {
    fluency: number; // 0-1 scale
    accuracy: number; // 0-1 scale
    culturalAppropriate: number; // 0-1 scale
    formality: number; // 0-1 scale
    overall: number; // 0-1 scale
}

export interface CulturalAdaptation {
    type: 'localization' | 'cultural_reference' | 'formality_adjustment' | 'taboo_avoidance';
    original: string;
    adapted: string;
    reasoning: string;
    importance: 'low' | 'medium' | 'high';
}

export interface AlternativeTranslation {
    text: string;
    confidence: number;
    useCase: string;
    culturalNotes?: string;
}

export interface TranslationWarning {
    type: 'cultural_sensitivity' | 'ambiguity' | 'technical_term' | 'proper_noun' | 'idiom';
    message: string;
    suggestion: string;
    severity: 'info' | 'warning' | 'error';
}

export interface TranslationMetadata {
    engine: string;
    model: string;
    processingTime: number;
    tokensUsed: number;
    cost: number;
    cacheHit: boolean;
    qualityChecks: string[];
}

export interface LanguageDetectionResult {
    detectedLanguage: string;
    confidence: number;
    alternatives: LanguageAlternative[];
    script: WritingSystem;
    region?: string;
    dialect?: string;
}

export interface LanguageAlternative {
    language: string;
    confidence: number;
    reasoning: string;
}

export interface PolyglotConfiguration {
    enabledLanguages: string[];
    defaultLanguage: string;
    fallbackLanguage: string;
    autoDetection: boolean;
    culturalAdaptation: boolean;
    qualityThreshold: number;
    cacheEnabled: boolean;
    translationEngines: TranslationEngine[];
    culturalDatabases: CulturalDatabase[];
}

export interface TranslationEngine {
    id: string;
    name: string;
    type: 'neural' | 'statistical' | 'rule_based' | 'hybrid';
    supportedLanguages: string[];
    strengths: string[];
    limitations: string[];
    cost: number; // Cost per character/token
    speed: number; // Characters per second
    qualityRating: number; // 0-1 scale
    enabled: boolean;
}

export interface CulturalDatabase {
    id: string;
    name: string;
    regions: string[];
    languages: string[];
    dataTypes: string[];
    lastUpdated: Date;
    entries: number;
    quality: number; // 0-1 scale
    enabled: boolean;
}

export interface PolyglotAnalytics {
    totalTranslations: number;
    languagePairs: LanguagePairStats[];
    qualityMetrics: QualityMetrics;
    culturalAdaptations: CulturalAdaptationStats;
    performanceMetrics: PerformanceMetrics;
    userSatisfaction: UserSatisfactionMetrics;
    costAnalysis: CostAnalysis;
    trends: TrendAnalysis;
}

export interface LanguagePairStats {
    sourceLanguage: string;
    targetLanguage: string;
    requestCount: number;
    averageQuality: number;
    averageConfidence: number;
    successRate: number;
    averageLength: number;
}

export interface QualityMetrics {
    averageQuality: number;
    fluencyScore: number;
    accuracyScore: number;
    culturalScore: number;
    distributionByQuality: QualityDistribution[];
}

export interface QualityDistribution {
    range: string; // e.g., "0.8-0.9"
    count: number;
    percentage: number;
}

export interface CulturalAdaptationStats {
    totalAdaptations: number;
    adaptationsByType: Record<string, number>;
    adaptationsByLanguage: Record<string, number>;
    averageAdaptationsPerRequest: number;
    userAcceptanceRate: number;
}

export interface PerformanceMetrics {
    averageProcessingTime: number;
    averageResponseTime: number;
    throughput: number; // Requests per second
    errorRate: number;
    cacheHitRate: number;
    resourceUtilization: ResourceUtilization;
}

export interface ResourceUtilization {
    cpu: number; // 0-1 scale
    memory: number; // 0-1 scale
    storage: number; // 0-1 scale
    network: number; // 0-1 scale
}

export interface UserSatisfactionMetrics {
    averageRating: number; // 0-5 scale
    ratingDistribution: Record<string, number>;
    feedbackCount: number;
    improvementSuggestions: string[];
}

export interface CostAnalysis {
    totalCost: number;
    costPerTranslation: number;
    costByEngine: Record<string, number>;
    costByLanguage: Record<string, number>;
    monthlyTrend: MonthlyCost[];
}

export interface MonthlyCost {
    month: string;
    cost: number;
    volume: number;
    averageCostPerUnit: number;
}

export interface TrendAnalysis {
    popularLanguages: LanguagePopularity[];
    growingLanguages: LanguageGrowth[];
    emergingPairs: LanguagePairTrend[];
    seasonalPatterns: SeasonalPattern[];
}

export interface LanguagePopularity {
    language: string;
    requests: number;
    growth: number; // Percentage change
    rank: number;
}

export interface LanguageGrowth {
    language: string;
    growthRate: number; // Percentage
    timeframe: string;
    drivers: string[];
}

export interface LanguagePairTrend {
    sourceLang: string;
    targetLang: string;
    growth: number;
    volume: number;
    drivers: string[];
}

export interface SeasonalPattern {
    pattern: string;
    languages: string[];
    peakMonths: string[];
    description: string;
}

// Event types for polyglot system
export type PolyglotEvent =
    | { type: 'translation_requested'; request: PolyglotTranslationRequest }
    | { type: 'translation_completed'; result: PolyglotTranslationResult }
    | { type: 'language_detected'; result: LanguageDetectionResult }
    | { type: 'cultural_adaptation_applied'; adaptation: CulturalAdaptation }
    | { type: 'quality_threshold_breached'; quality: number; threshold: number }
    | { type: 'new_language_added'; language: Language }
    | { type: 'cultural_database_updated'; database: CulturalDatabase };

export interface PolyglotEventHandler {
    onEvent(event: PolyglotEvent): void | Promise<void>;
}