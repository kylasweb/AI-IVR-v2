'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface VoiceStatusBadgeProps {
    status: string;
    variant?: 'default' | 'outline';
    className?: string;
}

/**
 * Reusable status badge for voice-related components.
 * Provides consistent color coding across all voice management pages.
 */
export function VoiceStatusBadge({ status, variant = 'default', className = '' }: VoiceStatusBadgeProps) {
    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'running':
            case 'passed':
            case 'completed':
            case 'operational':
                return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'training':
            case 'pending':
            case 'processing':
            case 'degraded':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'inactive':
            case 'idle':
            case 'paused':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            case 'failed':
            case 'error':
            case 'down':
                return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'quality':
            case 'comprehensive':
                return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            case 'accuracy':
            case 'performance':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'latency':
                return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    return (
        <Badge
            variant={variant}
            className={`${getStatusColor(status)} ${className}`}
        >
            {status}
        </Badge>
    );
}

export default VoiceStatusBadge;
