import React from 'react';
import SystemHealthMonitoring from '@/components/monitoring/system-health-monitoring';

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <SystemHealthMonitoring />
      </div>
    </div>
  );
}