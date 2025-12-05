/**
 * Malayalam Dialect Transformer
 * Transforms standard Malayalam text into regional dialect variations
 * Based on authentic linguistic patterns from 14 Kerala districts
 */

export type MalayalamDialect = 'standard' | 'travancore' | 'malabar' | 'cochin' | 'thrissur';

interface DialectPattern {
    from: string | RegExp;
    to: string;
}

/**
 * Travancore Dialect (തിരുവിതാംകൂർ)
 * Region: Thiruvananthapuram, Kollam, Kottayam
 * Characteristics: Formal, respectful, full verb endings
 */
const travancorePatterns: DialectPattern[] = [
    // Gratitude & Politeness
    { from: 'നന്ദി', to: 'നന്ദിയുണ്ട്' },
    { from: /സഹായിക്കാം(\s|$)/g, to: 'സഹായിക്കണം$1' },
    { from: /എങ്ങനെ(\s|$)/g, to: 'എങ്ങനെ$1' },
    { from: /വേണമോ(\s|$|\?)/g, to: 'വേണോ$1' },

    // Question forms
    { from: /നോക്കാം(\s|$)/g, to: 'നോക്കട്ടേ$1' },
    { from: /കാത്തിരിക്കുക(\s|$)/g, to: 'നിൽക്കണേ$1' },
    { from: /പരിശോധിക്കാം(\s|$)/g, to: 'പരിശോധിക്കണം$1' },

    // Formal verb endings
    { from: /ചെയ്യാം(\s|$)/g, to: 'ചെയ്യണം$1' },
    { from: /പറയാമോ(\s|$|\?)/g, to: 'പറയാമല്ലോ$1' },
];

/**
 * Malabar Dialect (മലബാർ)
 * Region: Malappuram, Kozhikode, Kannur
 * Characteristics: Casual, friendly, phonetic shifts
 */
const malabarPatterns: DialectPattern[] = [
    // Phonetic variations
    { from: 'വിളിച്ചതിന്', to: 'വിളിച്ചെയ്ന്' },
    { from: 'നന്ദി', to: 'നല്ലത്' },
    { from: /ഞാൻ(\s|$)/g, to: 'ഞായൻ$1' },
    { from: 'എങ്ങനെ', to: 'എങ്ങനെയാ' },
    { from: 'ഒരു', to: 'ഒറു' },

    // Casual forms  
    { from: /സഹായിക്കാം(\s|$|\?)/g, to: 'സഹായിക്കേണ്ടേ$1' },
    { from: /നോക്കാം(\s|$)/g, to: 'നോക്കട്ടാ$1' },
    { from: /കാത്തിരിക്കുക(\s|$)/g, to: 'നിൽക്കാ$1' },
    { from: /വേണമോ(\s|$|\?)/g, to: 'വേണോ$1' },

    // Pronouns
    { from: 'ഇങ്ങളെ', to: 'ഇങ്ങളെ' }, // Keep informal
];

/**
 * Kochi/Cochin Dialect (കൊച്ചി)
 * Region: Ernakulam
 * Characteristics: Modern, English mixing, urban
 */
const kochiPatterns: DialectPattern[] = [
    // English word mixing
    { from: 'കാത്തിരിക്കുക', to: 'wait ചെയ്യ്' },
    { from: /പരിശോധിക്കാം(\s|$)/g, to: 'check ചെയ്യാം$1' },
    { from: /സഹായം(\s)/g, to: 'help$1' },
    { from: 'നിമിഷം', to: 'സെക്കൻഡ്' },

    // Modern direct questions
    { from: 'എങ്ങനെ സഹായിക്കാം', to: 'എന്തു സഹായം വേണം' },
    { from: 'മറ്റേതെങ്കിലും', to: 'വേറെ എന്തെങ്കിലും' },
];

/**
 * Thrissur Dialect (തൃശ്ശൂർ)
 * Region: Thrissur  
 * Characteristics: Dense, steady, traditional, formal
 */
const thrissurPatterns: DialectPattern[] = [
    // Traditional formal forms
    { from: /സഹായിക്കാം(\s|$|\?)/g, to: 'സഹായിക്കട്ടെ$1' },
    { from: /നോക്കാം(\s|$)/g, to: 'നോക്കട്ടെ$1' },
    { from: /പറയാമോ(\s|$|\?)/g, to: 'പറയാമല്ലോ$1' },
    { from: /സുഖമാണോ(\s|$|\?)/g, to: 'സുഖമായിരിക്കുന്നോ$1' },

    // Dense verb forms
    { from: /കാത്തിരിക്കുക(\s|$)/g, to: 'കാത്തിരിക്കണേ$1' },
    { from: /മറ്റേതെങ്കിലും(\s|$)/g, to: 'മറ്റെന്തെങ്കിലും$1' },
];

/**
 * Apply dialect transformation to Malayalam text
 */
export function transformToDialect(text: string, dialect: MalayalamDialect): string {
    if (dialect === 'standard') {
        return text; // No transformation for standard
    }

    let transformed = text;
    let patterns: DialectPattern[] = [];

    // Select pattern set based on dialect
    switch (dialect) {
        case 'travancore':
            patterns = travancorePatterns;
            break;
        case 'malabar':
            patterns = malabarPatterns;
            break;
        case 'cochin':
            patterns = kochiPatterns;
            break;
        case 'thrissur':
            patterns = thrissurPatterns;
            break;
    }

    // Apply transformations
    patterns.forEach(pattern => {
        if (pattern.from instanceof RegExp) {
            transformed = transformed.replace(pattern.from, pattern.to);
        } else {
            transformed = transformed.replace(new RegExp(pattern.from, 'g'), pattern.to);
        }
    });

    return transformed;
}

/**
 * Get dialect-specific voice parameters
 */
export function getDialectVoiceParams(dialect: MalayalamDialect): { speakingRate: number; pitch: number } {
    switch (dialect) {
        case 'travancore':
            return { speakingRate: 0.90, pitch: -0.5 }; // Slower, formal, dignified
        case 'malabar':
            return { speakingRate: 1.12, pitch: 1.5 }; // Faster, lighter, casual
        case 'cochin':
            return { speakingRate: 1.02, pitch: 0.3 }; // Modern, neutral-bright
        case 'thrissur':
            return { speakingRate: 0.88, pitch: -1.0 }; // Slow, deep, measured
        case 'standard':
        default:
            return { speakingRate: 1.0, pitch: 0 }; // Neutral
    }
}

/**
 * Get dialect display name in Malayalam
 */
export function getDialectDisplayName(dialect: MalayalamDialect): string {
    const names: Record<MalayalamDialect, string> = {
        standard: 'സ്റ്റാൻഡേർഡ് (Standard)',
        travancore: 'തിരുവിതാംകൂർ (Travancore)',
        malabar: 'മലബാർ (Malabar)',
        cochin: 'കൊച്ചി (Kochi)',
        thrissur: 'തൃശ്ശൂർ (Thrissur)'
    };
    return names[dialect];
}
