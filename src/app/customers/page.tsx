'use client';

import ManagementLayout from '@/components/layout/management-layout';
import CustomerManagement from '@/components/management/customer-management';

export default function CustomersPage() {
    return (
        <ManagementLayout title="Customer Management" subtitle="Manage customer accounts and profiles">
            <CustomerManagement />
        </ManagementLayout>
    );
}