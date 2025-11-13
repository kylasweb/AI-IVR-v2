import ManagementLayout from '@/components/layout/management-layout';
import MainDashboard from '@/components/dashboard/main-dashboard';

export default function HomePage() {
  return (
    <ManagementLayout title="FairGo IMOS" subtitle="Malayalam AI Communication Platform">
      <MainDashboard />
    </ManagementLayout>
  );
}
