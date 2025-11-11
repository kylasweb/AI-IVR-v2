'use client';

import ManagementLayout from '@/components/layout/management-layout';
import RideManagement from '@/components/management/ride-management';

export default function RidesPage() {
  return (
    <ManagementLayout title="Ride Management" subtitle="Monitor and manage ride requests">
      <RideManagement />
    </ManagementLayout>
  );
}