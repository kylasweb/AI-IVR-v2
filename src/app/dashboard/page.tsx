'use client';

import MainDashboard from '@/components/dashboard/main-dashboard';
import ClientAdminDashboard from '@/components/dashboard/client-admin-dashboard';
import FairGoAdminDashboard from '@/components/dashboard/fairgo-admin-dashboard';
import SysAdminDashboard from '@/components/dashboard/sys-admin-dashboard';
import ManagementLayout from '@/components/layout/management-layout';
import { UserProvider, useUser } from '@/hooks/use-user';

function DashboardContent() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case 'client_admin':
      return <ClientAdminDashboard />;
    case 'fairgo_admin':
      return <FairGoAdminDashboard />;
    case 'sysadmin':
      return <SysAdminDashboard />;
    default:
      return <MainDashboard />;
  }
}

export default function DashboardPage() {
  return (
    <UserProvider>
      <ManagementLayout title="Dashboard" subtitle="FairGo IMOS Management Overview">
        <DashboardContent />
      </ManagementLayout>
    </UserProvider>
  );
}