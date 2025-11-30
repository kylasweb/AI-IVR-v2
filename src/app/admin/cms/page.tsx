"use client";

import React from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import Link from 'next/link';

export default function AdminCMSIndex() {
    return (
        <ManagementLayout title="CMS" subtitle="Content Management System">
            <div className="p-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Content Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/admin/cms/app-settings" className="p-4 border rounded hover:bg-gray-50">App Settings</Link>
                        <Link href="/admin/cms/site-content" className="p-4 border rounded hover:bg-gray-50">Site Content</Link>
                        <Link href="/admin/mock-data" className="p-4 border rounded hover:bg-gray-50">Mock Data</Link>
                    </div>
                </div>
            </div>
        </ManagementLayout>
    );
}
