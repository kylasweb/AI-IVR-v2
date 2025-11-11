import MainDashboard from '@/components/dashboard/main-dashboard';
import ManagementLayout from '@/components/layout/management-layout';

export default function DashboardPage() {
  return (
    <ManagementLayout title="Dashboard" subtitle="FairGo IMOS Management Overview">
      <MainDashboard />
    </ManagementLayout>
  );
}