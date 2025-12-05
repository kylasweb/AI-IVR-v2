/**
 * BPO Process Template Definitions
 * Pre-configured workflow templates for Smart Triage, Transactional Resolver, Outbound Campaign
 */

export interface ProcessTemplate {
    id: string;
    name: string;
    description: string;
    category: 'smart_triage' | 'transactional_resolver' | 'outbound_campaign' | 'soft_collection' | 'csat' | 'agent_coaching';
    icon: string;
    color: string;
    nodes: TemplateNode[];
    connections: TemplateConnection[];
    defaultConfig: Record<string, any>;
}

export interface TemplateNode {
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
    config: Record<string, any>;
}

export interface TemplateConnection {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    condition?: string;
}

// Smart Triage Template
export const SMART_TRIAGE_TEMPLATE: ProcessTemplate = {
    id: 'smart_triage_v1',
    name: 'Smart Triage',
    description: 'AI-powered intent classification with sentiment-based routing to appropriate queues',
    category: 'smart_triage',
    icon: 'Brain',
    color: 'from-blue-500 to-indigo-600',
    defaultConfig: {
        greetingScript: "Thank you for calling. How may I assist you today?",
        sentimentThreshold: 0.35,
        intentConfidenceThreshold: 0.7,
    },
    nodes: [
        {
            id: 'trigger_1',
            type: 'trigger',
            label: 'Inbound Call',
            position: { x: 100, y: 100 },
            config: { triggerType: 'inbound_call' },
        },
        {
            id: 'greeting_1',
            type: 'tts',
            label: 'Greeting',
            position: { x: 100, y: 200 },
            config: {
                script: "Thank you for calling. How may I assist you today?",
                voice: 'default',
            },
        },
        {
            id: 'stt_1',
            type: 'stt',
            label: 'Listen',
            position: { x: 100, y: 300 },
            config: {
                language: 'en-US',
                timeout: 10,
                silenceThreshold: 2,
            },
        },
        {
            id: 'nlu_intent',
            type: 'nlu',
            label: 'Intent + Sentiment',
            position: { x: 100, y: 400 },
            config: {
                analysisType: 'intent_sentiment',
                intentCategories: ['billing', 'support', 'sales', 'account', 'general'],
                sentimentEnabled: true,
            },
        },
        {
            id: 'sentiment_check',
            type: 'condition',
            label: 'Sentiment Check',
            position: { x: 100, y: 500 },
            config: {
                conditionType: 'sentiment_threshold',
                threshold: 0.35,
                operator: 'less_than',
            },
        },
        {
            id: 'priority_queue',
            type: 'queue',
            label: 'Priority Queue',
            position: { x: -100, y: 600 },
            config: {
                queueName: 'priority_human',
                priority: 'urgent',
                skillRequired: 'retention',
            },
        },
        {
            id: 'intent_router',
            type: 'condition',
            label: 'Intent Router',
            position: { x: 300, y: 600 },
            config: {
                conditionType: 'intent_match',
                branches: [
                    { intent: 'billing', target: 'billing_ai' },
                    { intent: 'support', target: 'support_ai' },
                    { intent: 'sales', target: 'sales_queue' },
                ],
            },
        },
        {
            id: 'billing_ai',
            type: 'ai_agent',
            label: 'Billing AI',
            position: { x: 100, y: 700 },
            config: { agentType: 'billing_specialist' },
        },
        {
            id: 'support_ai',
            type: 'ai_agent',
            label: 'Support AI',
            position: { x: 300, y: 700 },
            config: { agentType: 'tech_support' },
        },
        {
            id: 'sales_queue',
            type: 'queue',
            label: 'Sales Queue',
            position: { x: 500, y: 700 },
            config: { queueName: 'sales_human' },
        },
    ],
    connections: [
        { id: 'c1', source: 'trigger_1', target: 'greeting_1' },
        { id: 'c2', source: 'greeting_1', target: 'stt_1' },
        { id: 'c3', source: 'stt_1', target: 'nlu_intent' },
        { id: 'c4', source: 'nlu_intent', target: 'sentiment_check' },
        { id: 'c5', source: 'sentiment_check', target: 'priority_queue', condition: 'low_sentiment' },
        { id: 'c6', source: 'sentiment_check', target: 'intent_router', condition: 'normal_sentiment' },
        { id: 'c7', source: 'intent_router', target: 'billing_ai', condition: 'billing' },
        { id: 'c8', source: 'intent_router', target: 'support_ai', condition: 'support' },
        { id: 'c9', source: 'intent_router', target: 'sales_queue', condition: 'sales' },
    ],
};

// Transactional Resolver Template
export const TRANSACTIONAL_RESOLVER_TEMPLATE: ProcessTemplate = {
    id: 'transactional_resolver_v1',
    name: 'Transactional Resolver',
    description: 'API-connected automation for order status, account balance with OTP/Voice Biometric auth',
    category: 'transactional_resolver',
    icon: 'Zap',
    color: 'from-emerald-500 to-teal-600',
    defaultConfig: {
        authMethod: 'otp',
        crmEndpoint: '',
        maxRetries: 3,
    },
    nodes: [
        {
            id: 'trigger_1',
            type: 'trigger',
            label: 'Inbound Call',
            position: { x: 100, y: 100 },
            config: { triggerType: 'inbound_call' },
        },
        {
            id: 'greeting_1',
            type: 'tts',
            label: 'Greeting',
            position: { x: 100, y: 200 },
            config: { script: "Welcome. I can help you check your order status or account balance." },
        },
        {
            id: 'collect_intent',
            type: 'stt',
            label: 'Collect Request',
            position: { x: 100, y: 300 },
            config: { language: 'en-US' },
        },
        {
            id: 'intent_check',
            type: 'nlu',
            label: 'Classify Request',
            position: { x: 100, y: 400 },
            config: { intentCategories: ['order_status', 'account_balance', 'other'] },
        },
        {
            id: 'auth_required',
            type: 'condition',
            label: 'Auth Check',
            position: { x: 100, y: 500 },
            config: { conditionType: 'requires_auth', sensitiveData: true },
        },
        {
            id: 'otp_auth',
            type: 'authentication',
            label: 'OTP Verification',
            position: { x: -50, y: 600 },
            config: {
                method: 'otp',
                otpLength: 6,
                expirySeconds: 300,
                deliveryChannel: 'sms',
            },
        },
        {
            id: 'voice_biometric',
            type: 'authentication',
            label: 'Voice Biometric',
            position: { x: 250, y: 600 },
            config: {
                method: 'voice_biometric',
                confidenceThreshold: 0.85,
                fallbackToOTP: true,
            },
        },
        {
            id: 'api_fetch',
            type: 'api',
            label: 'Fetch Data',
            position: { x: 100, y: 700 },
            config: {
                method: 'GET',
                endpoint: '{{crmEndpoint}}/customer/{{customerId}}/data',
                headers: { 'Authorization': 'Bearer {{apiKey}}' },
                timeout: 5000,
                retryOnFail: true,
                fallbackAction: 'transfer_to_agent',
            },
        },
        {
            id: 'speak_result',
            type: 'tts',
            label: 'Speak Result',
            position: { x: 100, y: 800 },
            config: {
                script: "Your {{dataType}} is {{result}}. Is there anything else I can help with?",
                dynamicData: true,
            },
        },
        {
            id: 'api_error_handler',
            type: 'error_handler',
            label: 'API Error',
            position: { x: 300, y: 750 },
            config: {
                errorScript: "I'm having trouble accessing that information. Let me connect you with an agent.",
                action: 'transfer_to_agent',
            },
        },
    ],
    connections: [
        { id: 'c1', source: 'trigger_1', target: 'greeting_1' },
        { id: 'c2', source: 'greeting_1', target: 'collect_intent' },
        { id: 'c3', source: 'collect_intent', target: 'intent_check' },
        { id: 'c4', source: 'intent_check', target: 'auth_required' },
        { id: 'c5', source: 'auth_required', target: 'otp_auth', condition: 'otp_preferred' },
        { id: 'c6', source: 'auth_required', target: 'voice_biometric', condition: 'voice_preferred' },
        { id: 'c7', source: 'otp_auth', target: 'api_fetch', condition: 'auth_success' },
        { id: 'c8', source: 'voice_biometric', target: 'api_fetch', condition: 'auth_success' },
        { id: 'c9', source: 'api_fetch', target: 'speak_result', condition: 'success' },
        { id: 'c10', source: 'api_fetch', target: 'api_error_handler', condition: 'error' },
    ],
};

// Outbound Campaign Template
export const OUTBOUND_CAMPAIGN_TEMPLATE: ProcessTemplate = {
    id: 'outbound_campaign_v1',
    name: 'Outbound Campaign',
    description: 'Outbound calling with AMD detection and boolean logic for lead qualification',
    category: 'outbound_campaign',
    icon: 'PhoneOutgoing',
    color: 'from-orange-500 to-amber-600',
    defaultConfig: {
        amdEnabled: true,
        maxAttempts: 3,
        callbackDelay: 3600,
    },
    nodes: [
        {
            id: 'trigger_1',
            type: 'trigger',
            label: 'Campaign Start',
            position: { x: 100, y: 100 },
            config: {
                triggerType: 'outbound_campaign',
                scheduleType: 'batch',
            },
        },
        {
            id: 'dial_1',
            type: 'dial',
            label: 'Place Call',
            position: { x: 100, y: 200 },
            config: {
                timeout: 30,
                callerId: '{{campaignCallerId}}',
            },
        },
        {
            id: 'amd_detect',
            type: 'amd',
            label: 'AMD Detection',
            position: { x: 100, y: 300 },
            config: {
                enabled: true,
                detectionTime: 4000,
                beepDetection: true,
                machineAction: 'leave_message',
                humanAction: 'continue',
            },
        },
        {
            id: 'machine_message',
            type: 'tts',
            label: 'Voicemail',
            position: { x: -100, y: 400 },
            config: {
                script: "Hello, this is a message from {{company}}. Please call us back at {{callbackNumber}}.",
                waitForBeep: true,
            },
        },
        {
            id: 'human_greeting',
            type: 'tts',
            label: 'Human Greeting',
            position: { x: 300, y: 400 },
            config: {
                script: "Hello, this is {{agentName}} from {{company}}. Am I speaking with {{customerName}}?",
            },
        },
        {
            id: 'confirm_identity',
            type: 'stt',
            label: 'Confirm Identity',
            position: { x: 300, y: 500 },
            config: { expectYesNo: true },
        },
        {
            id: 'identity_check',
            type: 'condition',
            label: 'Identity Confirmed?',
            position: { x: 300, y: 600 },
            config: { conditionType: 'boolean', field: 'confirmed' },
        },
        {
            id: 'pitch_script',
            type: 'tts',
            label: 'Pitch',
            position: { x: 200, y: 700 },
            config: {
                script: "{{campaignPitch}}",
            },
        },
        {
            id: 'interest_check',
            type: 'stt',
            label: 'Check Interest',
            position: { x: 200, y: 800 },
            config: { expectYesNo: true },
        },
        {
            id: 'interest_router',
            type: 'condition',
            label: 'Interested?',
            position: { x: 200, y: 900 },
            config: { conditionType: 'boolean', field: 'interested' },
        },
        {
            id: 'transfer_sales',
            type: 'queue',
            label: 'Transfer to Sales',
            position: { x: 50, y: 1000 },
            config: { queueName: 'sales_live', warmTransfer: true },
        },
        {
            id: 'log_not_interested',
            type: 'data',
            label: 'Log Result',
            position: { x: 350, y: 1000 },
            config: {
                action: 'update_lead',
                status: 'not_interested',
                scheduleCallback: false,
            },
        },
        {
            id: 'schedule_callback',
            type: 'data',
            label: 'Schedule Callback',
            position: { x: 500, y: 700 },
            config: {
                action: 'schedule_callback',
                delayHours: 24,
            },
        },
    ],
    connections: [
        { id: 'c1', source: 'trigger_1', target: 'dial_1' },
        { id: 'c2', source: 'dial_1', target: 'amd_detect' },
        { id: 'c3', source: 'amd_detect', target: 'machine_message', condition: 'machine' },
        { id: 'c4', source: 'amd_detect', target: 'human_greeting', condition: 'human' },
        { id: 'c5', source: 'human_greeting', target: 'confirm_identity' },
        { id: 'c6', source: 'confirm_identity', target: 'identity_check' },
        { id: 'c7', source: 'identity_check', target: 'pitch_script', condition: 'yes' },
        { id: 'c8', source: 'identity_check', target: 'schedule_callback', condition: 'no' },
        { id: 'c9', source: 'pitch_script', target: 'interest_check' },
        { id: 'c10', source: 'interest_check', target: 'interest_router' },
        { id: 'c11', source: 'interest_router', target: 'transfer_sales', condition: 'yes' },
        { id: 'c12', source: 'interest_router', target: 'log_not_interested', condition: 'no' },
    ],
};

// All templates registry
export const BPO_PROCESS_TEMPLATES: ProcessTemplate[] = [
    SMART_TRIAGE_TEMPLATE,
    TRANSACTIONAL_RESOLVER_TEMPLATE,
    OUTBOUND_CAMPAIGN_TEMPLATE,
];

// Template factory
export function getTemplateById(id: string): ProcessTemplate | undefined {
    return BPO_PROCESS_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): ProcessTemplate[] {
    return BPO_PROCESS_TEMPLATES.filter(t => t.category === category);
}
