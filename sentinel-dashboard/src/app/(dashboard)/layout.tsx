'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, usePermissions } from '../../lib/hooks/use-auth';
import { useDefcon } from '../../lib/hooks/use-defcon';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
    Shield,
    AlertTriangle,
    Globe,
    Network,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Activity,
    Zap
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    permission: string;
}

const navigation: NavigationItem[] = [
    { name: 'War Room', href: '/war-room', icon: Globe, permission: 'canViewRealTimeAlerts' },
    { name: 'API Gateway', href: '/api-gateway', icon: Network, permission: 'canViewRealTimeAlerts' },
    { name: 'Internal Monitor', href: '/internal-monitor', icon: Activity, permission: 'canViewRealTimeAlerts' },
    { name: 'IAM Command', href: '/iam-command', icon: Users, permission: 'canViewPrivilegedLogs' },
    { name: 'Risk Center', href: '/risk-center', icon: FileText, permission: 'canViewRealTimeAlerts' },
]; export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { canViewModule } = usePermissions();
    const { currentLevel, getStatusDescription, getStatusColor } = useDefcon();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const filteredNavigation = navigation.filter(item => canViewModule(item.href.replace('/', '')));

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 border-r border-slate-700">
                        <SidebarContent
                            navigation={filteredNavigation}
                            pathname={pathname}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
                <div className="flex flex-col h-full bg-slate-800 border-r border-slate-700">
                    <SidebarContent navigation={filteredNavigation} pathname={pathname} />
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top header */}
                <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 lg:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="lg:hidden text-slate-400 hover:text-white"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>

                            <div className="flex items-center gap-2">
                                <Shield className="h-6 w-6 text-red-500" />
                                <h1 className="text-lg font-semibold text-white">Sentinel Command</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* DEFCON Status */}
                            <Badge className={`${getStatusColor()} border-0`}>
                                <Zap className="h-3 w-3 mr-1" />
                                DEFCON {currentLevel}
                            </Badge>

                            {/* User info and logout */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">{user?.email}</p>
                                    <p className="text-xs text-slate-400">{user?.role}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarContent({
    navigation,
    pathname,
    onNavigate
}: {
    navigation: NavigationItem[];
    pathname: string;
    onNavigate?: () => void;
}) {
    return (
        <>
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-700">
                <Shield className="h-8 w-8 text-red-500" />
                <div>
                    <h2 className="text-lg font-bold text-white">Sentinel</h2>
                    <p className="text-xs text-slate-400">Command Center</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-red-600 text-white'
                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </a>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>IMOS Security System</span>
                </div>
            </div>
        </>
    );
}