'use client';

import ManagementLayout from '@/components/layout/management-layout';
import DriverManagement from '@/components/management/driver-management';

export default function DriversPage() {
    return (
        <ManagementLayout title="Driver Management" subtitle="Manage driver accounts and assignments">
            <DriverManagement />
        </ManagementLayout>
    );
}