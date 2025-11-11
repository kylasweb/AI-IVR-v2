'use client';

import ManagementLayout from '@/components/layout/management-layout';
import WorkflowBuilder from '@/components/ivr/workflow-builder';

export default function WorkflowsPage() {
    return (
        <ManagementLayout title="Workflow Builder" subtitle="Visual IVR Workflow Creation">
            <WorkflowBuilder />
        </ManagementLayout>
    );
}