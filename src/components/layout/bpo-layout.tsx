'use client';

/**
 * BPO Layout
 * Dedicated navigation system for BPO/Contact Center operations
 * Separate from the main AI IVR sidebar
 */

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Headphones,
    Monitor,
    Users,
    BarChart3,
    Star,
    Briefcase,
    Settings,
    ChevronLeft,
    ChevronRight,
    Home,
    UserPlus,
    Phone,
    Activity,
    Target,
    Clock,
    TrendingUp,
    Bell,
    Search,
    User,
    LogOut,
    Menu,
    X,
    Zap,
    Building2,
    FileText
} from 'lucide-react';

interface BPOLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

interface NavItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    isActive?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export default function BPOLayout({ children, title, subtitle }: BPOLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigationSections: NavSection[] = [
        {
            title: 'Operations',
            items: [
                {
                    title: 'Dashboard',
                    url: '/bpo',
                    icon: Home,
                    isActive: pathname === '/bpo'
                },
                {
                    title: 'Agent Desktop',
                    url: '/bpo-desk',
                    icon: Monitor,
                    badge: 'CTI',
                    isActive: pathname === '/bpo-desk'
                },
                {
                    title: 'Live Queue',
                    url: '/bpo/queue',
                    icon: Phone,
                    isActive: pathname === '/bpo/queue'
                }
            ]
        },
        {
            title: 'Management',
            items: [
                {
                    title: 'Workforce',
                    url: '/admin/workforce',
                    icon: Users,
                    badge: 'WFM',
                    isActive: pathname.includes('/admin/workforce')
                },
                {
                    title: 'Quality',
                    url: '/admin/quality',
                    icon: Star,
                    badge: 'QA',
                    isActive: pathname.includes('/admin/quality')
                },
                {
                    title: 'KPI Dashboard',
                    url: '/admin/kpi-dashboard',
                    icon: BarChart3,
                    badge: 'KPI',
                    isActive: pathname.includes('/admin/kpi-dashboard')
                }
            ]
        },
        {
            title: 'CRM',
            items: [
                {
                    title: 'Contacts',
                    url: '/crm',
                    icon: Briefcase,
                    isActive: pathname === '/crm'
                },
                {
                    title: 'Deals',
                    url: '/crm?view=deals',
                    icon: Target,
                    isActive: pathname.includes('/crm') && pathname.includes('deals')
                },
                {
                    title: 'Accounts',
                    url: '/crm?view=accounts',
                    icon: Building2,
                    isActive: pathname.includes('/crm') && pathname.includes('accounts')
                }
            ]
        },
        {
            title: 'Setup',
            items: [
                {
                    title: 'Client Onboarding',
                    url: '/bpo-management/onboarding',
                    icon: UserPlus,
                    isActive: pathname.includes('/onboarding')
                },
                {
                    title: 'Integrations',
                    url: '/bpo/integrations',
                    icon: Zap,
                    isActive: pathname.includes('/integrations')
                },
                {
                    title: 'Reports',
                    url: '/bpo/reports',
                    icon: FileText,
                    isActive: pathname.includes('/reports')
                }
            ]
        }
    ];

    const handleNavigation = (url: string) => {
        router.push(url);
        setMobileMenuOpen(false);
    };

    return (
        <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside
                className={`hidden lg:flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Headphones className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">BPO Center</h2>
                                <p className="text-xs text-gray-400">Contact Operations</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {navigationSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-6">
                            {!sidebarCollapsed && (
                                <div className="px-4 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {section.title}
                                </div>
                            )}
                            <ul className="space-y-1 px-2">
                                {section.items.map((item, itemIndex) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={itemIndex}>
                                            <button
                                                onClick={() => handleNavigation(item.url)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.isActive
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                    }`}
                                                title={sidebarCollapsed ? item.title : undefined}
                                            >
                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                {!sidebarCollapsed && (
                                                    <>
                                                        <span className="flex-1 text-left text-sm">{item.title}</span>
                                                        {item.badge && (
                                                            <span className={`px-1.5 py-0.5 text-xs rounded ${item.isActive ? 'bg-blue-500' : 'bg-gray-600'
                                                                }`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Back to IVR */}
                <div className="p-2 border-t border-gray-700">
                    <button
                        onClick={() => handleNavigation('/')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {!sidebarCollapsed && <span className="text-sm">Back to IVR</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="relative w-72 bg-gray-800 flex flex-col">
                        {/* Close Button */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-4 right-4 p-1.5 hover:bg-gray-700 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Logo */}
                        <div className="h-16 flex items-center px-4 border-b border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Headphones className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">BPO Center</h2>
                                    <p className="text-xs text-gray-400">Contact Operations</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto py-4">
                            {navigationSections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-6">
                                    <div className="px-4 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {section.title}
                                    </div>
                                    <ul className="space-y-1 px-2">
                                        {section.items.map((item, itemIndex) => {
                                            const Icon = item.icon;
                                            return (
                                                <li key={itemIndex}>
                                                    <button
                                                        onClick={() => handleNavigation(item.url)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.isActive
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                            }`}
                                                    >
                                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                                        <span className="flex-1 text-left text-sm">{item.title}</span>
                                                        {item.badge && (
                                                            <span className={`px-1.5 py-0.5 text-xs rounded ${item.isActive ? 'bg-blue-500' : 'bg-gray-600'
                                                                }`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>

                        {/* Back to IVR */}
                        <div className="p-2 border-t border-gray-700">
                            <button
                                onClick={() => handleNavigation('/')}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm">Back to IVR</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden w-8" /> {/* Spacer for mobile menu button */}
                        {title && (
                            <div>
                                <h1 className="text-lg font-semibold">{title}</h1>
                                {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-40"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-gray-700 rounded-lg">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {/* Agent Status */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Available</span>
                        </div>

                        {/* User */}
                        <button className="flex items-center gap-2 p-1.5 hover:bg-gray-700 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-medium">
                                AG
                            </div>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
