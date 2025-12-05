// IVR Management Types
export interface IVRConfig {
    id: string;
    name: string;
    description: string;
    flow_type: string;
    language: string;
    dialect?: string;
    status: string;
    is_active: boolean;
    is_default: boolean;
    is_template: boolean;
    cultural_enabled: boolean;
    malayalam_priority?: boolean;
    created_at: string;
    updated_at: string;
    workflow?: {
        id: string;
        name: string;
        node_count: number;
    };
    usage_stats?: {
        total_calls: number;
        success_rate: number;
        avg_duration: number;
    };
}

export interface IVRTemplate {
    id: string;
    name: string;
    description: string;
    flow_type: string;
    language: string;
    cultural_features: string[];
}

export interface IVRAdvancedSettings {
    max_call_duration: number;
    call_timeout: number;
    retry_attempts: number;
    silence_detection: boolean;
    dtmf_timeout: number;
    speech_recognition: boolean;
    voice_biometrics: boolean;
    call_recording: boolean;
    sentiment_analysis: boolean;
    real_time_analytics: boolean;
    ai_powered_routing: boolean;
    cultural_adaptation: boolean;
    multilingual_support: boolean;
    background_music: boolean;
    hold_music_url: string;
    escalation_rules: {
        max_transfers: number;
        escalation_timeout: number;
        priority_routing: boolean;
    };
    security_settings: {
        pci_compliance: boolean;
        data_encryption: boolean;
        audit_logging: boolean;
        access_control: string;
    };
    integration_settings: {
        crm_integration: boolean;
        crm_provider: string;
        webhook_url: string;
        api_key: string;
        callback_urls: string[];
    };
    ai_configuration: {
        llm_provider: string;
        model_version: string;
        temperature: number;
        max_tokens: number;
        cultural_context: boolean;
        learning_enabled: boolean;
        personalization: boolean;
    };
    voice_settings: {
        voice_provider: string;
        voice_model: string;
        voice_speed: number;
        voice_pitch: number;
        voice_volume: number;
        ssml_support: boolean;
    };
    analytics_config: {
        real_time_dashboard: boolean;
        performance_monitoring: boolean;
        cost_tracking: boolean;
        usage_alerts: boolean;
        custom_metrics: string[];
    };
}

export interface IVRFormData {
    name: string;
    description: string;
    flow_type: string;
    language: string;
    dialect: string;
    is_active: boolean;
    cultural_settings: Record<string, any>;
    flow_data: { nodes: any[]; connections: any[] };
    advanced_settings: IVRAdvancedSettings;
}

export const DEFAULT_ADVANCED_SETTINGS: IVRAdvancedSettings = {
    max_call_duration: 1800,
    call_timeout: 30,
    retry_attempts: 3,
    silence_detection: true,
    dtmf_timeout: 5,
    speech_recognition: true,
    voice_biometrics: false,
    call_recording: true,
    sentiment_analysis: true,
    real_time_analytics: true,
    ai_powered_routing: true,
    cultural_adaptation: true,
    multilingual_support: false,
    background_music: true,
    hold_music_url: '',
    escalation_rules: {
        max_transfers: 3,
        escalation_timeout: 300,
        priority_routing: false
    },
    security_settings: {
        pci_compliance: false,
        data_encryption: true,
        audit_logging: true,
        access_control: 'standard'
    },
    integration_settings: {
        crm_integration: false,
        crm_provider: '',
        webhook_url: '',
        api_key: '',
        callback_urls: []
    },
    ai_configuration: {
        llm_provider: 'openai',
        model_version: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000,
        cultural_context: true,
        learning_enabled: true,
        personalization: true
    },
    voice_settings: {
        voice_provider: 'azure',
        voice_model: 'neural',
        voice_speed: 1.0,
        voice_pitch: 0.0,
        voice_volume: 1.0,
        ssml_support: true
    },
    analytics_config: {
        real_time_dashboard: true,
        performance_monitoring: true,
        cost_tracking: true,
        usage_alerts: true,
        custom_metrics: []
    }
};

export const DEFAULT_FORM_DATA: IVRFormData = {
    name: '',
    description: '',
    flow_type: 'customer_service',
    language: 'ml',
    dialect: 'central_kerala',
    is_active: true,
    cultural_settings: {},
    flow_data: { nodes: [], connections: [] },
    advanced_settings: DEFAULT_ADVANCED_SETTINGS
};
