"use client";

import React from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import AdminOverview from '@/components/admin/admin-overview';
import { useUser } from '@/hooks/use-user';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Guard redirect if not logged in
        if (!isLoading && !user) {
            router.push('/admin/login');
        }
    }, [user, isLoading]);

    if (!user) return null;

    return (
        <ManagementLayout title="Admin Dashboard" subtitle="System Administration Overview">
            <AdminOverview />
        </ManagementLayout>
    );
}
