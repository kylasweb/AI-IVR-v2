'use client';

import ManagementLayout from '@/components/layout/management-layout';
import IVRManagement from '@/components/ivr/ivr-management';

export default function IVRManagementPage() {
    return (
        <ManagementLayout title="IVR Management" subtitle="Manage Interactive Voice Response configurations and intelligent workflows">
            <IVRManagement />
        </ManagementLayout>
    );
}