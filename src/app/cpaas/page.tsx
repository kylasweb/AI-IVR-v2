import ManagementLayout from '@/components/layout/management-layout';

import CPaaSManagement from '@/components/management/cpaas-management';

export default function CPaaSManagementPage() {
    return (
        <ManagementLayout title="CPaaS Management" subtitle="Cloud Platform as a Service integration and management">
            <CPaaSManagement />
        </ManagementLayout>
    );
}