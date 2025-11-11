import ManagementLayout from '@/components/layout/management-layout';
import AdminDashboard from '@/components/admin/admin-dashboard';

export default function AdminPage() {
  return (
    <ManagementLayout title="Administration" subtitle="System Administration & Management">
      <AdminDashboard />
    </ManagementLayout>
  );
}