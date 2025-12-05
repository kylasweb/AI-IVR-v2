// Unified TTS Hook for Next.js Frontend
// Connects to FastAPI backend

import { useState, useCallback } from 'react';

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
}

export interface Voice {
    id: string;
    name: string;
    language: string;
    language_codes: string[];
    gender: 'male' | 'female' | 'neutral';
    provider: string;
    quality: string;
    recommended: boolean;
}

export interface TTSHookOptions {
    backendUrl?: string;
    onError?: (error: Error) => void;
    onSuccess?: (result: TTSResult) => void;
}

export function useTTS(options?: TTSHookOptions) {
    const backendUrl = options?.backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastResult, setLastResult] = useState<TTSResult | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);

    // Synthesize speech
    const synthesize = useCallback(async (ttsOptions: TTSOptions): Promise<TTSResult | null> => {
        setIsLoading(true);
        setError(null);

        try {
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
            setLastResult(result);

            // Create audio element
            if (result.audio.data) {
                const audio = new Audio(result.audio.data);
                setAudioElement(audio);
                setAudioUrl(result.audio.data);

                audio.onended = () => setIsPlaying(false);
                audio.onerror = (e) => {
                    console.error('Audio playback error:', e);
                    setIsPlaying(false);
                };
            }

            options?.onSuccess?.(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            options?.onError?.(error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, options]);

    // List available voices
    const listVoices = useCallback(async (language?: string, provider?: string) => {
        try {
            const params = new URLSearchParams();
            if (language) params.append('language', language);
            if (provider) params.append('provider', provider);

            const response = await fetch(`${backendUrl}/api/v1/tts/voices?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch voices');
            }

            const data = await response.json();
            setAvailableVoices(data.voices);
            return data.voices;
        } catch (err) {
            console.error('Error fetching voices:', err);
            return [];
        }
    }, [backendUrl]);

    // Playback controls
    const play = useCallback(() => {
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
        isPlaying,
        error,
        lastResult,
        audioUrl,
        availableVoices,

        // Methods
        synthesize,
        listVoices,
        play,
        pause,
        stop,
        download,
    };
}
