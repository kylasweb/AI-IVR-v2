'use client';

import React from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import SystemSettings from '@/components/admin/system-settings';

export default function SettingsPage() {
  return (
    <ManagementLayout title="Settings" subtitle="System configuration and preferences">
      <SystemSettings />
    </ManagementLayout>
  );
}