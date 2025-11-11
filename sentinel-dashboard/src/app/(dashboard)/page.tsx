'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '../../lib/hooks/use-auth';

export default function DashboardPage() {
    const router = useRouter();
    const { canViewModule } = usePermissions();

    useEffect(() => {
        // Redirect to the first available module based on permissions
        if (canViewModule('war-room')) {
            router.push('/war-room');
        } else if (canViewModule('api-gateway')) {
            router.push('/api-gateway');
        } else if (canViewModule('internal-monitor')) {
            router.push('/internal-monitor');
        } else if (canViewModule('iam-command')) {
            router.push('/iam-command');
        } else if (canViewModule('risk-center')) {
            router.push('/risk-center');
        }
    }, [router, canViewModule]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading Sentinel Command Center...</p>
            </div>
        </div>
    );
}