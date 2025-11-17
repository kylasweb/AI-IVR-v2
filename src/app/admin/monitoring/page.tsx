import ManagementLayout from '@/components/layout/management-layout';
import SystemMonitoring from '@/components/admin/system-monitoring';

export default function AdminMonitoringPage() {
    return (
        <ManagementLayout title="System Monitoring" subtitle="Real-time system health and performance">
            <SystemMonitoring />
        </ManagementLayout>
    );
}