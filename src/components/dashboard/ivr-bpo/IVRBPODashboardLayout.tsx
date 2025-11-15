'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface IVRBPODashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: '📊' },
  { name: 'Calls', href: '/dashboard/calls', icon: '📞' },
  { name: 'Agents', href: '/dashboard/agents', icon: '👥' },
  { name: 'AI', href: '/dashboard/ai', icon: '🤖' },
  { name: 'Queues', href: '/dashboard/queues', icon: '⏳' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
];

export default function IVRBPODashboardLayout({ children }: IVRBPODashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">IVR/BPO Dashboard</h1>
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}