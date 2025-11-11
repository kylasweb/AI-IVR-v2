import React from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import SystemHealthMonitoring from '@/components/monitoring/system-health-monitoring';

export default function MonitoringPage() {
  return (
    <ManagementLayout title="System Monitoring" subtitle="Real-time system health and performance">
      <div className="container mx-auto py-6 px-4">
        <SystemHealthMonitoring />
      </div>
    </ManagementLayout>
  );
}