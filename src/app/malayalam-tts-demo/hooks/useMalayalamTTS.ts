import { useState, useCallback } from 'react';
import type { EmotionId } from '../constants';

interface TTSResult {
    success: boolean;
    originalText: string;
    transformedText?: string;
    language: string;
    voice: string;
    emotion: string;
    dialect: string;
    duration: number;
    sampleRate: number;
    bitRate: number;
    format: string;
    quality: string;
    ttsEngine: string;
    processingTime: number;
    audioData?: string;
}

export function useMalayalamTTS() {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lastResult, setLastResult] = useState<TTSResult | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const generateSpeech = useCallback(async (
        text: string,
        emotion: EmotionId,
        volume: number,
        selectedVoice: string,
        dialect: string
    ) => {
        if (!text.trim()) return;

        setIsLoading(true);
        try {
            console.log('[Frontend] Calling Google Cloud TTS API...');

            const response = await fetch('/api/speech/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voiceName: selectedVoice,
                    emotion,
                    dialect
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'TTS generation failed');
            }

            const data = await response.json();
            console.log('[Frontend] TTS Success:', data.result.ttsEngine);

            setLastResult(data.result);

            if (data.result.audioData) {
                // Create audio element
                const audio = new Audio(data.result.audioData);
                audio.volume = volume / 100;
                setAudioElement(audio);
                setAudioUrl(data.result.audioData);

                // Event handlers
                audio.onended = () => setIsPlaying(false);
                audio.onerror = (e) => {
                    console.error('[Frontend] Audio playback error:', e);
                    setIsPlaying(false);
                };
            }
        } catch (error) {
            console.error('[Frontend] Error:', error);
            alert(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const playPause = useCallback(() => {
        if (!audioElement) {
            alert('Please generate speech first');
            return;
        }

        if (isPlaying) {
            audioElement.pause();
            setIsPlaying(false);
        } else {
            audioElement.play().catch(e => {
                console.error('[Frontend] Failed to play:', e);
                alert('Failed to play audio. Please try generating speech again.');
            });
            setIsPlaying(true);
        }
    }, [audioElement, isPlaying]);

    const download = useCallback(() => {
        if (!audioUrl || !lastResult) {
            alert('Please generate speech first');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = audioUrl;
            const format = lastResult.format || 'mp3';
            link.download = `malayalam-tts-${Date.now()}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('[Frontend] Download error:', error);
            alert('Failed to download audio');
        }
    }, [audioUrl, lastResult]);

    return {
        isLoading,
        isPlaying,
        lastResult,
        generateSpeech,
        playPause,
        download
    };
}
