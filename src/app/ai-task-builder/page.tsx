import AITaskBuilder from '@/components/ai-agent/ai-task-builder';
import ManagementLayout from '@/components/layout/management-layout';

export default function AITaskBuilderPage() {
    return (
        <ManagementLayout title="AI Task Builder" subtitle="Visual workflow builder for AI agent tasks">
            <AITaskBuilder />
        </ManagementLayout>
    );
}