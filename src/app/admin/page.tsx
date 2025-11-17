import ManagementLayout from '@/components/layout/management-layout';
import AdminOverview from '@/components/admin/admin-overview';

export default function AdminPage() {
  return (
    <ManagementLayout title="Administration" subtitle="System Administration & Management">
      <AdminOverview />
    </ManagementLayout>
  );
}