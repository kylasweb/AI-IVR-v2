import AgentTemplates from '@/components/ai-agent/agent-templates';
import ManagementLayout from '@/components/layout/management-layout';

export default function AgentTemplatesPage() {
    return (
        <ManagementLayout title="AI Agent Templates" subtitle="Pre-built AI agent configurations and templates">
            <AgentTemplates />
        </ManagementLayout>
    );
}