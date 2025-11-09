'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    BarChart3 as Home,
    Phone,
    Bot,
    BarChart3,
    Settings,
    Grid3X3,
    PhoneCall,
    GitBranch as Workflow,
    Mic,
    Play as Camera,
    Globe,
    Activity as TestIcon,
    Users,
    Car,
    Shield,
    Globe as WifiIcon,
    Activity,
    Database,
    FileText,
    Settings as Command,
    FileText as BookOpen,
    Globe as Languages
} from 'lucide-react';

interface MobileNavItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    isActive?: boolean;
}

interface MobileNavSection {
    title: string;
    items: MobileNavItem[];
}

export default function MobileBottomNav() {
    const router = useRouter();
    const pathname = usePathname() || '';
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const quickAccessItems: MobileNavItem[] = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: Home,
            isActive: pathname === '/dashboard'
        },
        {
            title: 'Live Calls',
            url: '/call-management',
            icon: PhoneCall,
            badge: 'Live',
            isActive: pathname.includes('/call-management')
        },
        {
            title: 'AI Agents',
            url: '/ai-agents',
            icon: Bot,
            badge: 'New',
            isActive: pathname.includes('/ai-agent')
        },
        {
            title: 'Analytics',
            url: '/analytics',
            icon: BarChart3,
            isActive: pathname.includes('/analytics')
        }
    ];

    const allNavSections: MobileNavSection[] = [
        {
            title: 'Core Systems',
            items: [
                { title: 'Dashboard', url: '/dashboard', icon: Home, isActive: pathname === '/dashboard' },
                { title: 'IVR Management', url: '/ivr-management', icon: Phone, badge: 'AI', isActive: pathname.includes('/ivr') },
                { title: 'Live Calls', url: '/call-management', icon: PhoneCall, badge: 'Live', isActive: pathname.includes('/call-management') },
                { title: 'Workflow Builder', url: '/workflows', icon: Workflow, isActive: pathname.includes('/workflow') },
                { title: 'AI Agents', url: '/ai-agents', icon: Bot, badge: 'New', isActive: pathname.includes('/ai-agent') }
            ]
        },
        {
            title: 'Voice & AI',
            items: [
                { title: 'Voice Cloning', url: '/voice-cloning', icon: Mic, badge: 'AI', isActive: pathname.includes('/voice-cloning') },
                { title: 'Voice AI Agents', url: '/voice-ai-agents', icon: Bot, badge: 'New', isActive: pathname.includes('/voice-ai-agent') },
                { title: 'Video IVR', url: '/video-ivr', icon: Camera, badge: 'Beta', isActive: pathname.includes('/video') },
                { title: 'Cultural AI', url: '/cultural-ai', icon: Globe, badge: 'ML', isActive: pathname.includes('/cultural') }
            ]
        },
        {
            title: 'Testing & QA',
            items: [
                { title: 'AI Testing Suite', url: '/testing/ai', icon: Activity, badge: 'New', isActive: pathname.includes('/testing/ai') },
                { title: 'Automation Tests', url: '/testing/automation', icon: Bot, isActive: pathname.includes('/testing/automation') },
                { title: 'Voice AI Tests', url: '/testing/voice-ai', icon: Mic, badge: 'Beta', isActive: pathname.includes('/testing/voice-ai') },
                { title: 'Performance Testing', url: '/testing/performance', icon: BarChart3, isActive: pathname.includes('/testing/performance') }
            ]
        },
        {
            title: 'Management',
            items: [
                { title: 'User Management', url: '/admin/users', icon: Users, isActive: pathname.includes('/admin/user') },
                { title: 'Customer Management', url: '/customers', icon: Users, isActive: pathname.includes('/customer') },
                { title: 'Driver Management', url: '/drivers', icon: Car, isActive: pathname.includes('/driver') }
            ]
        },
        {
            title: 'Configuration',
            items: [
                { title: 'Language Settings', url: '/config/languages', icon: Languages, badge: 'New', isActive: pathname.includes('/config/language') },
                { title: 'AI Knowledge Base', url: '/ai-kb', icon: BookOpen, badge: 'AI', isActive: pathname.includes('/ai-kb') },
                { title: 'Command Centre', url: '/command-centre', icon: Command, badge: 'New', isActive: pathname.includes('/command-centre') },
                { title: 'API Gateway', url: '/api-gateway', icon: WifiIcon, badge: 'New', isActive: pathname.includes('/api-gateway') }
            ]
        },
        {
            title: 'Administration',
            items: [
                { title: 'System Settings', url: '/admin/settings', icon: Settings, isActive: pathname.includes('/settings') },
                { title: 'Security & Permissions', url: '/admin/security', icon: Shield, isActive: pathname.includes('/security') },
                { title: 'Database Management', url: '/admin/database', icon: Database, isActive: pathname.includes('/database') }
            ]
        }
    ];

    const handleNavigation = (url: string) => {
        router.push(url);
        setIsMenuOpen(false);
    };

    return (
        <div className="md:hidden">
            {/* Mobile Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
                <div className="flex items-center justify-around">
                    {/* Quick Access Items */}
                    {quickAccessItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.url}
                                onClick={() => handleNavigation(item.url)}
                                className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${item.isActive
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="relative">
                                    <Icon className="h-5 w-5" />
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                                            {item.badge === 'Live' ? '●' : item.badge.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs mt-1 truncate max-w-[50px]">{item.title}</span>
                            </button>
                        );
                    })}

                    {/* Central App Launcher Button */}
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                size="lg"
                                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                            >
                                <Grid3X3 className="h-6 w-6 text-white" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[80vh]">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-3 pb-4 border-b">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">FairGo IMOS</h2>
                                        <p className="text-sm text-gray-600">All Features</p>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 py-4">
                                    <div className="space-y-6">
                                        {allNavSections.map((section, index) => (
                                            <div key={index} className="space-y-3">
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                                    {section.title}
                                                </h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {section.items.map((item) => {
                                                        const Icon = item.icon;
                                                        return (
                                                            <button
                                                                key={item.url}
                                                                onClick={() => handleNavigation(item.url)}
                                                                className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${item.isActive
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                <div className="relative">
                                                                    <Icon className="h-5 w-5" />
                                                                    {item.badge && (
                                                                        <Badge
                                                                            variant={
                                                                                item.badge === 'AI' || item.badge === 'ML'
                                                                                    ? 'default'
                                                                                    : item.badge === 'New'
                                                                                        ? 'secondary'
                                                                                        : item.badge === 'Beta'
                                                                                            ? 'outline'
                                                                                            : 'destructive'
                                                                            }
                                                                            className="absolute -top-2 -right-2 px-1 py-0 text-xs h-4"
                                                                        >
                                                                            {item.badge}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-medium flex-1">
                                                                    {item.title}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Spacer to prevent content from being hidden behind the bottom nav */}
            <div className="h-20"></div>
        </div>
    );
}