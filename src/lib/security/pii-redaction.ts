/**
 * PII Redaction Service
 * Detects and redacts sensitive numeric data from text
 * 
 * Supported:
 * - Credit card numbers (Luhn validation)
 * - Social Security Numbers (SSN)
 * - Phone numbers
 * - Bank account numbers
 * - Email addresses
 * 
 * Usage:
 * import { redactPII, detectPII } from '@/lib/security/pii-redaction';
 */

// Redaction markers
const REDACTION_MARKERS = {
    CREDIT_CARD: '[REDACTED-CC]',
    SSN: '[REDACTED-SSN]',
    PHONE: '[REDACTED-PHONE]',
    BANK_ACCOUNT: '[REDACTED-ACCT]',
    EMAIL: '[REDACTED-EMAIL]',
};

// Regex patterns for PII detection
const PII_PATTERNS = {
    // Credit card: 13-19 digits with optional spaces/dashes
    CREDIT_CARD: /\b(?:\d{4}[\s-]?){3}\d{1,7}\b/g,

    // SSN: XXX-XX-XXXX format
    SSN: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,

    // Phone: Various formats including international
    PHONE: /\b(?:\+?1[-\s.]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}\b/g,

    // Bank account: 8-17 digit sequences
    BANK_ACCOUNT: /\b\d{8,17}\b/g,

    // Email addresses
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
};

/**
 * Luhn algorithm for credit card validation
 */
function isValidLuhn(number: string): boolean {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Check if a number sequence looks like a valid SSN
 */
function isValidSSN(ssn: string): boolean {
    const digits = ssn.replace(/\D/g, '');
    if (digits.length !== 9) return false;

    // First 3 digits cannot be 000, 666, or 900-999
    const area = parseInt(digits.substring(0, 3), 10);
    if (area === 0 || area === 666 || area >= 900) return false;

    // Group (4-5) cannot be 00
    const group = parseInt(digits.substring(3, 5), 10);
    if (group === 0) return false;

    // Serial (6-9) cannot be 0000
    const serial = parseInt(digits.substring(5), 10);
    if (serial === 0) return false;

    return true;
}

/**
 * Detect PII in text and return locations
 */
export function detectPII(text: string): Array<{
    type: string;
    value: string;
    startIndex: number;
    endIndex: number;
    isValid: boolean;
}> {
    const detections: Array<{
        type: string;
        value: string;
        startIndex: number;
        endIndex: number;
        isValid: boolean;
    }> = [];

    // Detect credit cards
    let match;
    while ((match = PII_PATTERNS.CREDIT_CARD.exec(text)) !== null) {
        const isValid = isValidLuhn(match[0]);
        if (isValid) {
            detections.push({
                type: 'CREDIT_CARD',
                value: match[0],
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                isValid,
            });
        }
    }
    PII_PATTERNS.CREDIT_CARD.lastIndex = 0; // Reset regex

    // Detect SSNs
    while ((match = PII_PATTERNS.SSN.exec(text)) !== null) {
        const isValid = isValidSSN(match[0]);
        if (isValid) {
            detections.push({
                type: 'SSN',
                value: match[0],
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                isValid,
            });
        }
    }
    PII_PATTERNS.SSN.lastIndex = 0;

    // Detect phone numbers
    while ((match = PII_PATTERNS.PHONE.exec(text)) !== null) {
        detections.push({
            type: 'PHONE',
            value: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            isValid: true,
        });
    }
    PII_PATTERNS.PHONE.lastIndex = 0;

    // Detect email addresses
    while ((match = PII_PATTERNS.EMAIL.exec(text)) !== null) {
        detections.push({
            type: 'EMAIL',
            value: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            isValid: true,
        });
    }
    PII_PATTERNS.EMAIL.lastIndex = 0;

    return detections;
}

/**
 * Redact PII from text
 * @param text - Input text to redact
 * @param options - Redaction options
 * @returns Redacted text
 */
export function redactPII(
    text: string,
    options: {
        redactCreditCards?: boolean;
        redactSSN?: boolean;
        redactPhone?: boolean;
        redactEmail?: boolean;
        redactBankAccount?: boolean;
        maskStyle?: 'full' | 'partial';
    } = {}
): string {
    const {
        redactCreditCards = true,
        redactSSN = true,
        redactPhone = true,
        redactEmail = true,
        redactBankAccount = true,
        maskStyle = 'full',
    } = options;

    let result = text;

    // Redact credit cards
    if (redactCreditCards) {
        result = result.replace(PII_PATTERNS.CREDIT_CARD, (match) => {
            if (isValidLuhn(match)) {
                if (maskStyle === 'partial') {
                    const digits = match.replace(/\D/g, '');
                    return `****-****-****-${digits.slice(-4)}`;
                }
                return REDACTION_MARKERS.CREDIT_CARD;
            }
            return match;
        });
    }

    // Redact SSNs
    if (redactSSN) {
        result = result.replace(PII_PATTERNS.SSN, (match) => {
            if (isValidSSN(match)) {
                if (maskStyle === 'partial') {
                    return `***-**-${match.slice(-4)}`;
                }
                return REDACTION_MARKERS.SSN;
            }
            return match;
        });
    }

    // Redact phone numbers
    if (redactPhone) {
        result = result.replace(PII_PATTERNS.PHONE, (match) => {
            if (maskStyle === 'partial') {
                return `***-***-${match.slice(-4)}`;
            }
            return REDACTION_MARKERS.PHONE;
        });
    }

    // Redact emails
    if (redactEmail) {
        result = result.replace(PII_PATTERNS.EMAIL, (match) => {
            if (maskStyle === 'partial') {
                const [local, domain] = match.split('@');
                return `${local[0]}***@${domain}`;
            }
            return REDACTION_MARKERS.EMAIL;
        });
    }

    // Redact bank account numbers (last, as it's broad)
    if (redactBankAccount) {
        result = result.replace(PII_PATTERNS.BANK_ACCOUNT, (match) => {
            // Skip if already redacted by credit card check
            if (result.includes(REDACTION_MARKERS.CREDIT_CARD)) return match;

            // Only redact if it looks like a bank account (8-17 digits)
            const digits = match.replace(/\D/g, '');
            if (digits.length >= 8 && digits.length <= 17 && !isValidLuhn(match)) {
                if (maskStyle === 'partial') {
                    return `****${digits.slice(-4)}`;
                }
                return REDACTION_MARKERS.BANK_ACCOUNT;
            }
            return match;
        });
    }

    return result;
}

/**
 * Check if text contains PII
 */
export function containsPII(text: string): boolean {
    return detectPII(text).length > 0;
}

/**
 * Get redaction summary
 */
export function getRedactionSummary(text: string): {
    hasPII: boolean;
    counts: Record<string, number>;
    totalRedactions: number;
} {
    const detections = detectPII(text);
    const counts: Record<string, number> = {};

    for (const detection of detections) {
        counts[detection.type] = (counts[detection.type] || 0) + 1;
    }

    return {
        hasPII: detections.length > 0,
        counts,
        totalRedactions: detections.length,
    };
}

export default {
    redactPII,
    detectPII,
    containsPII,
    getRedactionSummary,
    REDACTION_MARKERS,
};
