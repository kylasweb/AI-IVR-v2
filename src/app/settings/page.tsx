'use client';

import React from 'react';
import SystemSettings from '@/components/admin/system-settings';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">System configuration and preferences</p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-6">
        <SystemSettings />
      </div>
    </div>
  );
}