import ManagementLayout from '@/components/layout/management-layout';
import MockDataManager from '@/components/admin/mock-data-manager';

export default function AdminMockDataPage() {
    return (
        <ManagementLayout title="Mock Data Manager" subtitle="Manage demo data and test scenarios">
            <MockDataManager />
        </ManagementLayout>
    );
}