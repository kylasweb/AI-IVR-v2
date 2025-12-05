// Node Validation Functions
import { WorkflowNodeData } from './types';

/**
 * Validates if a node has all required configuration
 */
export const validateNode = (data: WorkflowNodeData): boolean => {
    // Basic validation - check if required fields are present
    if (!data.type || !data.label) return false;

    // Type-specific validation
    switch (data.type) {
        case 'api':
            return !!(data.config.url && data.config.method);
        case 'condition':
            return !!(data.config.condition);
        case 'agent':
            return !!(data.config.prompt || data.config.model);
        case 'webhook':
            return !!(data.config.endpoint);
        case 'tts':
            return !!(data.config.text || data.config.ssml);
        case 'stt':
            return true; // STT nodes are valid with defaults
        case 'sms':
            return !!(data.config.to && data.config.message);
        case 'email':
            return !!(data.config.to && data.config.subject);
        default:
            return true;
    }
};

/**
 * Checks if a node has potential warnings (not errors but recommendations)
 */
export const checkNodeWarnings = (data: WorkflowNodeData): boolean => {
    // Check for potential issues that aren't errors
    switch (data.type) {
        case 'api':
            return !data.config.timeout || !data.config.retries;
        case 'agent':
            return !data.config.fallback;
        case 'tts':
            return !data.config.voice || !data.config.language;
        case 'stt':
            return !data.config.language;
        case 'condition':
            return !data.config.timeout;
        case 'loop':
            return !data.config.maxIterations || data.config.maxIterations > 100;
        default:
            return false;
    }
};

/**
 * Get validation messages for a node
 */
export const getValidationMessages = (data: WorkflowNodeData): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.type) errors.push('Node type is required');
    if (!data.label) errors.push('Node label is required');

    switch (data.type) {
        case 'api':
            if (!data.config.url) errors.push('API URL is required');
            if (!data.config.method) errors.push('HTTP method is required');
            if (!data.config.timeout) warnings.push('Consider setting a timeout');
            if (!data.config.retries) warnings.push('Consider adding retry logic');
            break;
        case 'condition':
            if (!data.config.condition) errors.push('Condition expression is required');
            break;
        case 'agent':
            if (!data.config.prompt && !data.config.model) errors.push('AI prompt or model is required');
            if (!data.config.fallback) warnings.push('Consider adding a fallback response');
            break;
        case 'tts':
            if (!data.config.voice) warnings.push('Voice is not specified');
            if (!data.config.language) warnings.push('Language is not specified');
            break;
        case 'loop':
            if (!data.config.maxIterations) warnings.push('Max iterations not set');
            if (data.config.maxIterations > 100) warnings.push('Max iterations is very high');
            break;
    }

    return { errors, warnings };
};

export default validateNode;
