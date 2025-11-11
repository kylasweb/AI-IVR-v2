import ManagementLayout from '@/components/layout/management-layout';
import LiveCallDashboard from '@/components/call-management/live-call-dashboard';

export default function CallManagementPage() {
    return (
        <ManagementLayout title="Call Management" subtitle="Live Call Monitoring & Management">
            <LiveCallDashboard />
        </ManagementLayout>
    );
}