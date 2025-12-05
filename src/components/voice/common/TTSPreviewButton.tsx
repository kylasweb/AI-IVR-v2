'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Loader2 } from 'lucide-react';
import { useTTS } from '@/lib/tts/hooks/useTTS';
import { toast } from '@/hooks/use-toast';

interface TTSPreviewButtonProps {
    text: string;
    languageCode?: string;
    speed?: number;
    size?: 'sm' | 'default' | 'lg' | 'icon';
    variant?: 'default' | 'ghost' | 'outline' | 'secondary';
    className?: string;
    label?: string;
    showLabel?: boolean;
}

/**
 * Reusable TTS preview button with play/stop functionality.
 * Uses the enterprise TTS backend for audio synthesis.
 */
export function TTSPreviewButton({
    text,
    languageCode = 'en-US',
    speed = 1.0,
    size = 'sm',
    variant = 'outline',
    className = '',
    label = 'Preview',
    showLabel = true
}: TTSPreviewButtonProps) {
    const {
        synthesize,
        loading: ttsLoading,
        isPlaying,
        play,
        stop,
        error: ttsError
    } = useTTS();

    const [isThisPlaying, setIsThisPlaying] = React.useState(false);

    const handleClick = async () => {
        if (isPlaying && isThisPlaying) {
            stop();
            setIsThisPlaying(false);
            return;
        }

        try {
            const result = await synthesize(text, { languageCode, speed });
            if (result?.audio_url) {
                setIsThisPlaying(true);
                play(result.audio_url);
            }
        } catch (error) {
            toast({
                title: "Preview Failed",
                description: ttsError || "Could not preview voice. Check backend connection.",
                variant: "destructive",
            });
            setIsThisPlaying(false);
        }
    };

    // Reset when playback stops
    React.useEffect(() => {
        if (!isPlaying) {
            setIsThisPlaying(false);
        }
    }, [isPlaying]);

    const renderIcon = () => {
        if (ttsLoading && isThisPlaying) {
            return <Loader2 className="h-3 w-3 animate-spin" />;
        }
        if (isPlaying && isThisPlaying) {
            return <Square className="h-3 w-3" />;
        }
        return <Play className="h-3 w-3" />;
    };

    return (
        <Button
            size={size}
            variant={variant}
            onClick={handleClick}
            disabled={ttsLoading && isThisPlaying}
            className={className}
        >
            {renderIcon()}
            {showLabel && <span className="ml-1">{isPlaying && isThisPlaying ? 'Stop' : label}</span>}
        </Button>
    );
}

export default TTSPreviewButton;
