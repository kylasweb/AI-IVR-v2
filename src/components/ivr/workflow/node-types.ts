// IVR Workflow Node Type Definitions
import {
    AlertCircle, Bot, Mic, Volume2, GitBranch, Database, Zap, Settings, Mail,
    MessageSquare, Clock, BarChart3, FileText, X, AlertTriangle
} from 'lucide-react';
import { NodeTypeDefinition, NodeCategory } from './types';

/**
 * Comprehensive node type definitions for the IVR workflow builder.
 * Each node type includes icon, styling, category, description, and usage examples.
 */
export const nodeTypes: Record<string, NodeTypeDefinition> = {
    // Input/Trigger Nodes
    trigger: {
        icon: Zap,
        label: 'Call Trigger',
        color: 'bg-green-500',
        category: 'Input',
        description: 'Workflow entry point - triggers on incoming phone calls, scheduled events, or webhook calls',
        usage: 'Place at start of workflow. Configure trigger conditions like phone numbers, time schedules, or event types.',
        examples: ['Incoming call from customer', 'Daily 9AM reminder', 'Emergency hotline activation']
    },
    webhook: {
        icon: Database,
        label: 'Webhook Receiver',
        color: 'bg-green-600',
        category: 'Input',
        description: 'Receives HTTP POST/GET requests from external systems and CRM platforms',
        usage: 'Configure endpoint URL and authentication. Parse incoming JSON data for workflow variables.',
        examples: ['CRM lead notification', 'Payment confirmation', 'Form submission trigger']
    },
    dtmf: {
        icon: MessageSquare,
        label: 'DTMF Input',
        color: 'bg-green-700',
        category: 'Input',
        description: 'Captures dual-tone multi-frequency (keypad) input from callers',
        usage: 'Set timeout duration, valid digits, and minimum/maximum input length. Handle menu selections.',
        examples: ['Press 1 for English, 2 for Malayalam', 'Enter account number', 'Menu selection']
    },

    // AI Processing Nodes
    stt: {
        icon: Mic,
        label: 'Speech to Text',
        color: 'bg-blue-500',
        category: 'AI Processing',
        description: 'Converts audio speech to text with Malayalam and English support using advanced AI models',
        usage: 'Configure language detection, noise reduction, and confidence thresholds. Supports real-time streaming.',
        examples: ['Customer query transcription', 'Voice command processing', 'Meeting audio conversion']
    },
    nlu: {
        icon: Bot,
        label: 'NLU Analysis',
        color: 'bg-purple-500',
        category: 'AI Processing',
        description: 'Natural Language Understanding - extracts intents, entities, and sentiment with cultural awareness',
        usage: 'Train with Malayalam phrases, configure confidence thresholds, map intents to actions.',
        examples: ['Intent: book_appointment', 'Entity: date, time', 'Sentiment: frustrated customer']
    },
    agent: {
        icon: Bot,
        label: 'AI Conversation Agent',
        color: 'bg-indigo-500',
        category: 'AI Processing',
        description: 'Intelligent conversational agent with Kerala cultural awareness and multilingual capabilities',
        usage: 'Configure personality, knowledge base, conversation flow, and cultural context parameters.',
        examples: ['Customer support chat', 'Appointment booking', 'Product recommendation']
    },
    malayalam_cultural: {
        icon: Bot,
        label: 'Cultural Intelligence',
        color: 'bg-indigo-700',
        category: 'AI Processing',
        description: 'Specialized AI for Malayalam cultural context, festivals, traditions, and regional dialects',
        usage: 'Automatically detects cultural references, adjusts responses for festivals, handles regional variations.',
        examples: ['Onam greetings adaptation', 'Regional dialect detection', 'Festival-aware responses']
    },
    amd_detection: {
        icon: AlertCircle,
        label: 'AMD Detection',
        color: 'bg-purple-700',
        category: 'AI Processing',
        description: 'Answering Machine Detection with Malayalam greeting pattern recognition',
        usage: 'Analyzes initial audio for human vs machine patterns. Configurable sensitivity and cultural patterns.',
        examples: ['Outbound call screening', 'Voicemail detection', 'Human verification']
    },
    sentiment_analysis: {
        icon: BarChart3,
        label: 'Sentiment Analysis',
        color: 'bg-purple-600',
        category: 'AI Processing',
        description: 'Real-time emotion and sentiment detection from voice and text with cultural sensitivity',
        usage: 'Configure emotion thresholds, cultural context, and escalation triggers for negative sentiment.',
        examples: ['Angry customer detection', 'Satisfaction scoring', 'Escalation triggers']
    },

    // Data Processing Nodes
    variable: {
        icon: Database,
        label: 'Variable Store',
        color: 'bg-teal-500',
        category: 'Data',
        description: 'Store, retrieve, and manipulate variables during workflow execution with persistence',
        usage: 'Define variable names, types, default values, and persistence scope (session/global/permanent).',
        examples: ['Customer name storage', 'Session preferences', 'Call history tracking']
    },
    data: {
        icon: Database,
        label: 'Database Query',
        color: 'bg-cyan-500',
        category: 'Data',
        description: 'Execute SQL queries against databases with connection pooling and caching',
        usage: 'Configure database connection, write SQL queries, handle results and errors gracefully.',
        examples: ['Customer lookup', 'Inventory check', 'Order status query']
    },
    transform: {
        icon: Database,
        label: 'Data Transform',
        color: 'bg-cyan-600',
        category: 'Data',
        description: 'Transform, filter, and manipulate data using expressions and built-in functions',
        usage: 'Use JavaScript expressions, built-in functions, and data mapping to transform variables.',
        examples: ['Format phone numbers', 'Calculate totals', 'Parse JSON responses']
    },
    cache: {
        icon: Database,
        label: 'Cache Manager',
        color: 'bg-cyan-700',
        category: 'Data',
        description: 'High-performance caching for frequently accessed data with TTL and invalidation',
        usage: 'Set cache keys, expiration times, and invalidation patterns. Improves response times.',
        examples: ['Customer profile cache', 'Product catalog cache', 'API response cache']
    },

    // Logic & Control Flow
    condition: {
        icon: GitBranch,
        label: 'Smart Condition',
        color: 'bg-yellow-500',
        category: 'Logic',
        description: 'Advanced conditional branching with complex expressions, AI-powered decisions, and fuzzy logic',
        usage: 'Write complex conditions using variables, AI confidence scores, and business rules.',
        examples: ['if (confidence > 0.8 && language === "malayalam")', 'Customer tier routing', 'Time-based logic']
    },
    loop: {
        icon: GitBranch,
        label: 'Smart Loop',
        color: 'bg-yellow-600',
        category: 'Logic',
        description: 'Intelligent iteration with break conditions, timeout protection, and performance monitoring',
        usage: 'Configure loop conditions, maximum iterations, timeout values, and break conditions.',
        examples: ['Retry failed API calls', 'Process customer list', 'Multi-attempt verification']
    },
    switch: {
        icon: GitBranch,
        label: 'Multi-Path Switch',
        color: 'bg-amber-500',
        category: 'Logic',
        description: 'Multi-way intelligent routing based on AI predictions, variables, or complex conditions',
        usage: 'Define multiple output paths with conditions. Supports default fallback and priority routing.',
        examples: ['Department routing', 'Language selection', 'Priority level routing']
    },
    parallel: {
        icon: GitBranch,
        label: 'Parallel Processing',
        color: 'bg-yellow-700',
        category: 'Logic',
        description: 'Execute multiple workflow branches simultaneously and synchronize results',
        usage: 'Split workflow into parallel branches, set synchronization points, handle partial failures.',
        examples: ['Multi-API calls', 'Concurrent validations', 'Background processing']
    },

    // External Integrations
    api: {
        icon: Zap,
        label: 'REST API Call',
        color: 'bg-pink-500',
        category: 'External',
        description: 'Advanced HTTP client with retry logic, authentication, and response caching',
        usage: 'Configure endpoints, authentication, headers, retry policies, and response handling.',
        examples: ['CRM integration', 'Payment processing', 'External validation']
    },
    soap: {
        icon: Zap,
        label: 'SOAP Service',
        color: 'bg-pink-600',
        category: 'External',
        description: 'SOAP web service client for legacy system integration with WSDL parsing',
        usage: 'Import WSDL, configure service endpoints, handle complex types and fault responses.',
        examples: ['Legacy banking systems', 'Government portals', 'Enterprise integrations']
    },
    graphql: {
        icon: Zap,
        label: 'GraphQL Query',
        color: 'bg-pink-700',
        category: 'External',
        description: 'GraphQL client with query optimization and subscription support',
        usage: 'Write GraphQL queries, manage variables, handle real-time subscriptions.',
        examples: ['Modern API queries', 'Real-time updates', 'Flexible data fetching']
    },

    // Communication & Output
    tts: {
        icon: Volume2,
        label: 'Neural TTS',
        color: 'bg-orange-500',
        category: 'Output',
        description: 'Neural text-to-speech with natural Malayalam voices, emotion control, and SSML support',
        usage: 'Select voice models, adjust speed/pitch, use SSML for emphasis, configure cultural pronunciation.',
        examples: ['Natural Malayalam speech', 'Emotional responses', 'SSML-enhanced audio']
    },
    sms: {
        icon: MessageSquare,
        label: 'SMS Gateway',
        color: 'bg-orange-600',
        category: 'Output',
        description: 'Multi-carrier SMS with delivery tracking, Unicode support, and template management',
        usage: 'Configure SMS gateways, create templates, handle delivery receipts, support Malayalam text.',
        examples: ['OTP delivery', 'Appointment reminders', 'Marketing messages']
    },
    email: {
        icon: Mail,
        label: 'Email Service',
        color: 'bg-orange-700',
        category: 'Output',
        description: 'Rich email with templates, attachments, tracking, and multilingual content',
        usage: 'Design email templates, manage attachments, track opens/clicks, support Malayalam content.',
        examples: ['Confirmation emails', 'Report delivery', 'Newsletter campaigns']
    },
    whatsapp: {
        icon: MessageSquare,
        label: 'WhatsApp Business',
        color: 'bg-green-400',
        category: 'Output',
        description: 'WhatsApp Business API integration with rich media, templates, and interactive buttons',
        usage: 'Configure business account, create message templates, handle interactive responses.',
        examples: ['Order confirmations', 'Customer support', 'Interactive menus']
    },

    // Analytics & Monitoring
    analytics: {
        icon: BarChart3,
        label: 'Advanced Analytics',
        color: 'bg-gray-500',
        category: 'Analytics',
        description: 'Comprehensive workflow analytics with custom metrics, KPIs, and real-time dashboards',
        usage: 'Define custom events, set up KPI tracking, configure real-time alerts and dashboards.',
        examples: ['Call success rates', 'Customer satisfaction', 'Performance metrics']
    },
    log: {
        icon: FileText,
        label: 'Smart Logging',
        color: 'bg-gray-600',
        category: 'Analytics',
        description: 'Structured logging with levels, filtering, and integration with monitoring systems',
        usage: 'Set log levels, configure structured data, integrate with monitoring tools.',
        examples: ['Debug information', 'Audit trails', 'Error tracking']
    },
    metrics: {
        icon: BarChart3,
        label: 'Custom Metrics',
        color: 'bg-gray-700',
        category: 'Analytics',
        description: 'Custom business metrics collection with aggregation and real-time monitoring',
        usage: 'Define business metrics, set aggregation rules, configure alerting thresholds.',
        examples: ['Revenue tracking', 'Customer metrics', 'Performance KPIs']
    },

    // Security & Compliance
    auth: {
        icon: AlertCircle,
        label: 'Authentication',
        color: 'bg-red-400',
        category: 'Security',
        description: 'Multi-factor authentication with OTP, biometrics, and identity verification',
        usage: 'Configure auth methods, set verification levels, handle failed attempts.',
        examples: ['Phone verification', 'Identity confirmation', 'Access control']
    },
    encryption: {
        icon: AlertCircle,
        label: 'Data Encryption',
        color: 'bg-red-500',
        category: 'Security',
        description: 'End-to-end encryption for sensitive data with key management and compliance',
        usage: 'Configure encryption algorithms, manage keys, ensure compliance requirements.',
        examples: ['PII protection', 'Payment data', 'Medical records']
    },

    // System Control
    delay: {
        icon: Clock,
        label: 'Smart Delay',
        color: 'bg-slate-500',
        category: 'Control',
        description: 'Intelligent delays with jitter, business hours awareness, and dynamic timing',
        usage: 'Set delay duration, add randomization, configure business hours respect.',
        examples: ['Rate limiting', 'Natural pauses', 'Retry delays']
    },
    end: {
        icon: X,
        label: 'Workflow End',
        color: 'bg-red-500',
        category: 'Control',
        description: 'Graceful workflow termination with status codes, cleanup, and final actions',
        usage: 'Set exit status, configure cleanup actions, define success/failure conditions.',
        examples: ['Successful completion', 'Error termination', 'User hangup']
    },
    error_handler: {
        icon: AlertTriangle,
        label: 'Error Handler',
        color: 'bg-red-600',
        category: 'Control',
        description: 'Comprehensive error handling with recovery strategies and notification systems',
        usage: 'Define error types, set recovery actions, configure notification channels.',
        examples: ['API failures', 'Timeout handling', 'System errors']
    },
};

/**
 * Node categories for organizing the node palette
 */
export const nodeCategories: NodeCategory[] = [
    { name: 'Input', color: 'bg-green-500', types: ['trigger', 'webhook', 'dtmf'] },
    { name: 'AI Processing', color: 'bg-purple-500', types: ['stt', 'nlu', 'agent', 'malayalam_cultural', 'amd_detection', 'sentiment_analysis'] },
    { name: 'Data', color: 'bg-cyan-500', types: ['variable', 'data', 'transform', 'cache'] },
    { name: 'Logic', color: 'bg-yellow-500', types: ['condition', 'loop', 'switch', 'parallel'] },
    { name: 'External', color: 'bg-pink-500', types: ['api', 'soap', 'graphql'] },
    { name: 'Output', color: 'bg-orange-500', types: ['tts', 'sms', 'email', 'whatsapp'] },
    { name: 'Analytics', color: 'bg-gray-500', types: ['analytics', 'log', 'metrics'] },
    { name: 'Security', color: 'bg-red-400', types: ['auth', 'encryption'] },
    { name: 'Control', color: 'bg-slate-500', types: ['delay', 'end', 'error_handler'] },
];

export default nodeTypes;
