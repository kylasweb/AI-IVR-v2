// Unified TTS Hook for Next.js Frontend
// Connects to FastAPI backend

import { useState, useCallback, useEffect } from 'react';

// Types
export interface TTSOptions {
    text: string;
    voice: string;
    language?: string;
    provider?: 'google_cloud' | 'huggingface' | 'svara';
    speed?: number;  // 0.25 - 4.0
    pitch?: number;  // -20 to 20
    volume?: number; // 0 - 2.0
    format?: 'mp3' | 'wav' | 'ogg' | 'flac';
    ssml?: boolean;
}

export interface TTSResult {
    success: boolean;
    audio: {
        data: string;  // URL or base64
        format: string;
        duration: number;
        size: number;
        sample_rate: number;
    };
    provider: string;
    processing_time: number;
    characters: number;
    cost?: number;
    voice_used: string;
    metadata?: Record<string, any>;
    // Additional fields for voice-cloning compatibility
    audio_url?: string;
    duration?: number;
}

export interface Voice {
    id: string;
    voice_id?: string;  // Alternative ID for some providers
    name: string;
    language: string;
    language_codes: string[];
    gender: 'male' | 'female' | 'neutral';
    provider: string;
    quality: string;
    recommended: boolean;
}

export interface ProviderStatus {
    google_cloud: boolean;
    huggingface: boolean;
    svara: boolean;
    indicf5?: boolean;
}

export interface TTSHookOptions {
    backendUrl?: string;
    onError?: (error: Error) => void;
    onSuccess?: (result: TTSResult) => void;
    autoLoadVoices?: boolean;
}

// Default voices for fallback when API is unavailable
const DEFAULT_VOICES: Voice[] = [
    {
        id: 'en-US-Neural2-J',
        voice_id: 'en-US-Neural2-J',
        name: 'English Male (Neural)',
        language: 'en-US',
        language_codes: ['en-US'],
        gender: 'male',
        provider: 'google_cloud',
        quality: 'premium',
        recommended: true
    },
    {
        id: 'en-US-Neural2-F',
        voice_id: 'en-US-Neural2-F',
        name: 'English Female (Neural)',
        language: 'en-US',
        language_codes: ['en-US'],
        gender: 'female',
        provider: 'google_cloud',
        quality: 'premium',
        recommended: true
    },
    {
        id: 'ml-IN-Standard-A',
        voice_id: 'ml-IN-Standard-A',
        name: 'Malayalam Female',
        language: 'ml-IN',
        language_codes: ['ml-IN'],
        gender: 'female',
        provider: 'google_cloud',
        quality: 'standard',
        recommended: true
    },
    {
        id: 'hi-IN-Neural2-A',
        voice_id: 'hi-IN-Neural2-A',
        name: 'Hindi Female (Neural)',
        language: 'hi-IN',
        language_codes: ['hi-IN'],
        gender: 'female',
        provider: 'google_cloud',
        quality: 'premium',
        recommended: false
    }
];

export function useTTS(options?: TTSHookOptions) {
    const backendUrl = options?.backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastResult, setLastResult] = useState<TTSResult | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [availableVoices, setAvailableVoices] = useState<Voice[]>(DEFAULT_VOICES);
    const [selectedVoice, setSelectedVoice] = useState<Voice | null>(DEFAULT_VOICES[0]);
    const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
        google_cloud: true,
        huggingface: false,
        svara: false,
        indicf5: false
    });

    // Auto-load voices on mount
    useEffect(() => {
        if (options?.autoLoadVoices !== false) {
            listVoices().catch(() => {
                // Fallback to default voices is already handled
                console.warn('Using default voices (backend unavailable)');
            });
        }
    }, []);

    // Synthesize speech with frontend fallback
    const synthesize = useCallback(async (
        textOrOptions: string | TTSOptions,
        additionalOptions?: Partial<TTSOptions>
    ): Promise<TTSResult | null> => {
        setIsLoading(true);
        setError(null);

        // Handle both call signatures
        const ttsOptions: TTSOptions = typeof textOrOptions === 'string'
            ? { text: textOrOptions, voice: selectedVoice?.voice_id || 'en-US-Neural2-J', ...additionalOptions }
            : textOrOptions;

        try {
            // Try backend first
            const response = await fetch(`${backendUrl}/api/v1/tts/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: ttsOptions.text,
                    voice: ttsOptions.voice,
                    language: ttsOptions.language || 'en-US',
                    provider: ttsOptions.provider,
                    speed: ttsOptions.speed || 1.0,
                    pitch: ttsOptions.pitch || 0.0,
                    volume: ttsOptions.volume || 1.0,
                    format: ttsOptions.format || 'mp3',
                    ssml: ttsOptions.ssml || false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'TTS synthesis failed');
            }

            const result: TTSResult = await response.json();

            // Normalize audio URL
            result.audio_url = result.audio?.data || result.audio_url;
            result.duration = result.audio?.duration || result.duration;

            setLastResult(result);

            // Create audio element
            if (result.audio?.data || result.audio_url) {
                const audioSrc = result.audio?.data || result.audio_url || '';
                const audio = new Audio(audioSrc);
                setAudioElement(audio);
                setAudioUrl(audioSrc);

                audio.onended = () => setIsPlaying(false);
                audio.onerror = (e) => {
                    console.error('Audio playback error:', e);
                    setIsPlaying(false);
                };
            }

            options?.onSuccess?.(result);
            return result;
        } catch (err) {
            // Try frontend-only synthesis via browser API
            console.warn('Backend TTS failed, trying browser fallback');

            try {
                const result = await synthesizeWithBrowserAPI(ttsOptions.text, ttsOptions);
                return result;
            } catch (fallbackError) {
                const error = err instanceof Error ? err : new Error('TTS synthesis failed');
                setError(error);
                options?.onError?.(error);
                return null;
            }
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, options, selectedVoice]);

    // Browser Speech Synthesis fallback
    const synthesizeWithBrowserAPI = useCallback(async (text: string, opts?: Partial<TTSOptions>): Promise<TTSResult> => {
        return new Promise((resolve, reject) => {
            if (!window.speechSynthesis) {
                reject(new Error('Browser speech synthesis not supported'));
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = opts?.speed || 1.0;
            utterance.pitch = (opts?.pitch || 0) / 10 + 1; // Convert -20,20 to 0,2
            utterance.volume = opts?.volume || 1.0;

            utterance.onend = () => {
                const result: TTSResult = {
                    success: true,
                    audio: {
                        data: '',
                        format: 'browser',
                        duration: text.length * 0.1,
                        size: 0,
                        sample_rate: 22050
                    },
                    provider: 'browser',
                    processing_time: 0,
                    characters: text.length,
                    voice_used: 'browser-default',
                    audio_url: '',
                    duration: text.length * 0.1
                };
                setIsPlaying(false);
                resolve(result);
            };

            utterance.onerror = (e) => {
                setIsPlaying(false);
                reject(new Error(`Speech synthesis error: ${e.error}`));
            };

            setIsPlaying(true);
            window.speechSynthesis.speak(utterance);
        });
    }, []);

    // List available voices
    const listVoices = useCallback(async (language?: string, provider?: string): Promise<Voice[]> => {
        try {
            const params = new URLSearchParams();
            if (language) params.append('language', language);
            if (provider) params.append('provider', provider);

            const response = await fetch(`${backendUrl}/api/v1/tts/voices?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch voices');
            }

            const data = await response.json();
            const voices = data.voices || data.data?.voices || [];

            if (voices.length > 0) {
                setAvailableVoices(voices);
                // Update provider status based on available voices
                const providers = [...new Set(voices.map((v: Voice) => v.provider))];
                setProviderStatus({
                    google_cloud: providers.includes('google_cloud'),
                    huggingface: providers.includes('huggingface'),
                    svara: providers.includes('svara'),
                    indicf5: providers.includes('indicf5')
                });
            }
            return voices;
        } catch (err) {
            console.warn('Error fetching voices, using defaults:', err);
            return DEFAULT_VOICES;
        }
    }, [backendUrl]);

    // Playback controls
    const play = useCallback((urlOrVoid?: string) => {
        // Support both play() and play(url)
        if (urlOrVoid && typeof urlOrVoid === 'string') {
            const audio = new Audio(urlOrVoid);
            audio.onended = () => setIsPlaying(false);
            audio.play().catch(e => {
                console.error('Failed to play audio:', e);
                setError(new Error('Audio playback failed'));
            });
            setAudioElement(audio);
            setAudioUrl(urlOrVoid);
            setIsPlaying(true);
            return;
        }

        if (!audioElement) {
            console.warn('No audio to play');
            return;
        }

        audioElement.play().catch(e => {
            console.error('Failed to play audio:', e);
            setError(new Error('Audio playback failed'));
        });
        setIsPlaying(true);
    }, [audioElement]);

    const pause = useCallback(() => {
        if (!audioElement) return;
        audioElement.pause();
        setIsPlaying(false);
    }, [audioElement]);

    const stop = useCallback(() => {
        if (!audioElement) return;
        audioElement.pause();
        audioElement.currentTime = 0;
        setIsPlaying(false);
    }, [audioElement]);

    // Download audio
    const download = useCallback((filename?: string) => {
        if (!audioUrl || !lastResult) {
            console.warn('No audio to download');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = audioUrl;
            const format = lastResult.audio.format || 'mp3';
            link.download = filename || `tts-${Date.now()}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download error:', err);
            setError(new Error('Failed to download audio'));
        }
    }, [audioUrl, lastResult]);

    return {
        // State
        isLoading,
        loading: isLoading, // Alias for compatibility
        isPlaying,
        error,
        lastResult,
        audioUrl,
        availableVoices,
        voices: availableVoices, // Alias for compatibility
        selectedVoice,
        setSelectedVoice,
        providerStatus,

        // Methods
        synthesize,
        listVoices,
        play,
        pause,
        stop,
        download,
    };
}
