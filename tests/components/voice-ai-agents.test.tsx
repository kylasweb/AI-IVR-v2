// Basic unit tests for Voice AI Agents component
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VoiceAIAgentsPage from '@/app/voice-ai-agents/page';

// Mock ManagementLayout
vi.mock('@/components/layout/management-layout', () => ({
    default: function ManagementLayout({ children }: { children: React.ReactNode }) {
        return <div data-testid="management-layout">{children}</div>;
    }
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
}));

describe('VoiceAIAgentsPage', () => {
    it('renders voice AI agents page', () => {
        render(<VoiceAIAgentsPage />);

        expect(screen.getByText('Voice AI Agents')).toBeInTheDocument();
        expect(screen.getByText('Create, train, and manage intelligent voice agents with advanced language capabilities')).toBeInTheDocument();
    });

    it('shows create agent button', () => {
        render(<VoiceAIAgentsPage />);

        const createButton = screen.getByRole('button', { name: /create agent/i });
        expect(createButton).toBeInTheDocument();
    });

    it('displays existing agents', () => {
        render(<VoiceAIAgentsPage />);

        expect(screen.getByText('Malayalam Customer Service Agent')).toBeInTheDocument();
        expect(screen.getByText('English Support Agent')).toBeInTheDocument();
    });

    it('opens create dialog when create button is clicked', () => {
        render(<VoiceAIAgentsPage />);

        const createButton = screen.getByRole('button', { name: /create agent/i });
        fireEvent.click(createButton);

        expect(screen.getByText('Create New Voice AI Agent')).toBeInTheDocument();
    });
});