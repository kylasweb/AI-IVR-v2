'use client';

import ManagementLayout from '@/components/layout/management-layout';
import IVRManagement from '@/components/ivr/ivr-management';

export default function IVRManagementPage() {
    return (
        <ManagementLayout title="IVR Management" subtitle="Interactive Voice Response System">
            <IVRManagement />
        </ManagementLayout>
    );
}