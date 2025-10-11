import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Agents - Malayalam AI IVR Platform',
    description: 'Create and manage intelligent AI agents with Malayalam language support and cultural awareness',
    keywords: ['AI Agents', 'Malayalam', 'IVR', 'Chatbot', 'Kerala', 'Artificial Intelligence'],
};

export default function AIAgentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}