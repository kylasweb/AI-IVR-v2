'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import MobileBottomNav from './mobile-bottom-nav';
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Phone,
    Users,
    Bot,
    BarChart3,
    Settings,
    Shield,
    FileText,
    PhoneCall,
    GitBranch as Workflow,
    Car,
    Mic,
    Play as Camera,
    Brain as BrainCircuit,
    Globe,
    Activity,
    Database,
    Settings as Code,
    Mic as Headphones,
    MessageSquare,
    Zap as Cloud,
    Clock as Calendar,
    Car as Truck,
    User as UserCog,
    X as LogOut,
    User,
    ChevronDown as ChevronUp,
    BarChart3 as Home,
    Activity as TestIcon,
    Zap,
    Bot as RobotIcon,
    Volume2 as VoiceIcon,
    Globe as LangIcon,
    FileText as BookIcon,
    Settings as CommandIcon,
    Globe as WifiIcon
} from 'lucide-react';

interface ManagementLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

interface NavigationItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    isActive?: boolean;
}

export default function ManagementLayout({ children, title, subtitle }: ManagementLayoutProps) {
    const router = useRouter();
    const pathname = usePathname() || '';
    const [user] = useState({
        name: 'Admin User',
        email: 'admin@fairgo.com',
        avatar: 'AU'
    });

    const navigationSections: NavigationSection[] = [
        {
            title: 'Core Systems',
            items: [
                {
                    title: 'Dashboard',
                    url: '/dashboard',
                    icon: Home,
                    isActive: pathname === '/dashboard'
                },
                {
                    title: 'IVR Management',
                    url: '/ivr-management',
                    icon: Phone,
                    badge: 'AI',
                    isActive: pathname.includes('/ivr')
                },
                {
                    title: 'Live Calls',
                    url: '/call-management',
                    icon: PhoneCall,
                    badge: 'Live',
                    isActive: pathname.includes('/call-management')
                },
                {
                    title: 'Workflow Builder',
                    url: '/workflows',
                    icon: Workflow,
                    isActive: pathname.includes('/workflow')
                },
                {
                    title: 'AI Agents',
                    url: '/ai-agents',
                    icon: Bot,
                    badge: 'New',
                    isActive: pathname.includes('/ai-agent')
                }
            ]
        },
        {
            title: 'Management',
            items: [
                {
                    title: 'User Management',
                    url: '/admin/users',
                    icon: Users,
                    isActive: pathname.includes('/admin/user')
                },
                {
                    title: 'Customer Management',
                    url: '/customers',
                    icon: UserCog,
                    isActive: pathname.includes('/customer')
                },
                {
                    title: 'Driver Management',
                    url: '/drivers',
                    icon: Car,
                    isActive: pathname.includes('/driver')
                },
                {
                    title: 'Ride Management',
                    url: '/rides',
                    icon: Truck,
                    isActive: pathname.includes('/ride')
                },
                {
                    title: 'CPaaS Management',
                    url: '/cpaas',
                    icon: Cloud,
                    badge: 'New',
                    isActive: pathname.includes('/cpaas')
                }
            ]
        },
        {
            title: 'Voice & AI',
            items: [
                {
                    title: 'Voice Cloning',
                    url: '/voice-cloning',
                    icon: Mic,
                    badge: 'AI',
                    isActive: pathname.includes('/voice')
                },
                {
                    title: 'Voice AI Agents',
                    url: '/voice-ai-agents',
                    icon: RobotIcon,
                    badge: 'New',
                    isActive: pathname.includes('/voice-ai-agent')
                },
                {
                    title: 'Voice Biometrics',
                    url: '/voice-biometrics',
                    icon: Headphones,
                    isActive: pathname.includes('/biometric')
                },
                {
                    title: 'Video IVR',
                    url: '/video-ivr',
                    icon: Camera,
                    badge: 'Beta',
                    isActive: pathname.includes('/video')
                },
                {
                    title: 'Cultural AI',
                    url: '/cultural-ai',
                    icon: Globe,
                    badge: 'ML',
                    isActive: pathname.includes('/cultural')
                }
            ]
        },
        {
            title: 'Testing & QA',
            items: [
                {
                    title: 'AI Testing Suite',
                    url: '/testing/ai',
                    icon: TestIcon,
                    badge: 'New',
                    isActive: pathname.includes('/testing/ai')
                },
                {
                    title: 'Automation Tests',
                    url: '/testing/automation',
                    icon: Bot,
                    isActive: pathname.includes('/testing/automation')
                },
                {
                    title: 'Voice AI Agent Tests',
                    url: '/testing/voice-ai',
                    icon: VoiceIcon,
                    badge: 'Beta',
                    isActive: pathname.includes('/testing/voice-ai')
                },
                {
                    title: 'Performance Testing',
                    url: '/testing/performance',
                    icon: Activity,
                    isActive: pathname.includes('/testing/performance')
                }
            ]
        },
        {
            title: 'Configuration',
            items: [
                {
                    title: 'Language Settings',
                    url: '/config/languages',
                    icon: LangIcon,
                    badge: 'New',
                    isActive: pathname.includes('/config/language')
                },
                {
                    title: 'AI Knowledge Base',
                    url: '/ai-kb',
                    icon: BookIcon,
                    badge: 'AI',
                    isActive: pathname.includes('/ai-kb')
                },
                {
                    title: 'Command Centre',
                    url: '/command-centre',
                    icon: CommandIcon,
                    badge: 'New',
                    isActive: pathname.includes('/command-centre')
                },
                {
                    title: 'API Gateway',
                    url: '/api-gateway',
                    icon: WifiIcon,
                    badge: 'New',
                    isActive: pathname.includes('/api-gateway')
                }
            ]
        },
        {
            title: 'Analytics & Monitoring',
            items: [
                {
                    title: 'Analytics Dashboard',
                    url: '/analytics',
                    icon: BarChart3,
                    isActive: pathname.includes('/analytics')
                },
                {
                    title: 'Log Management',
                    url: '/admin/logs',
                    icon: FileText,
                    isActive: pathname.includes('/log')
                },
                {
                    title: 'System Monitoring',
                    url: '/monitoring',
                    icon: Activity,
                    isActive: pathname.includes('/monitor')
                }
            ]
        },
        {
            title: 'Administration',
            items: [
                {
                    title: 'System Settings',
                    url: '/admin/settings',
                    icon: Settings,
                    isActive: pathname.includes('/settings')
                },
                {
                    title: 'Integrations',
                    url: '/admin/integrations',
                    icon: Code,
                    isActive: pathname.includes('/integration')
                },
                {
                    title: 'Security & Permissions',
                    url: '/admin/security',
                    icon: Shield,
                    isActive: pathname.includes('/security')
                },
                {
                    title: 'Database Management',
                    url: '/admin/database',
                    icon: Database,
                    isActive: pathname.includes('/database')
                }
            ]
        }
    ];

    const handleNavigation = (url: string) => {
        router.push(url);
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gray-50">
                <Sidebar variant="inset" className="border-r border-gray-200">
                    <SidebarHeader className="border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-2 px-4 py-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-gray-900">FairGo IMOS</h1>
                                <p className="text-xs text-gray-600">Management Portal</p>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="bg-white">
                        {navigationSections.map((section, index) => (
                            <SidebarGroup key={index}>
                                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                                    {section.title}
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <SidebarMenuItem key={item.url}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        className={`w-full justify-start px-4 py-2 text-sm transition-colors ${item.isActive
                                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={() => handleNavigation(item.url)}
                                                            className="flex items-center gap-3 w-full"
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                            <span className="flex-1 text-left">{item.title}</span>
                                                            {item.badge && (
                                                                <Badge
                                                                    variant={
                                                                        item.badge === 'AI' || item.badge === 'ML'
                                                                            ? 'default'
                                                                            : item.badge === 'New'
                                                                                ? 'secondary'
                                                                                : 'outline'
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    {item.badge}
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))}
                    </SidebarContent>

                    <SidebarFooter className="border-t border-gray-200 bg-white">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton
                                            size="lg"
                                            className="data-[state=open]:bg-gray-50"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                                                    {user.avatar}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-semibold">{user.name}</span>
                                                <span className="truncate text-xs text-gray-600">{user.email}</span>
                                            </div>
                                            <ChevronUp className="ml-auto size-4" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                        side="right"
                                        align="end"
                                        sideOffset={4}
                                    >
                                        <DropdownMenuLabel className="p-0 font-normal">
                                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                                <Avatar className="h-8 w-8 rounded-lg">
                                                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-lg">
                                                        {user.avatar}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="grid flex-1 text-left text-sm leading-tight">
                                                    <span className="truncate font-semibold">{user.name}</span>
                                                    <span className="truncate text-xs text-gray-600">{user.email}</span>
                                                </div>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                                            <User className="h-4 w-4 mr-2" />
                                            Profile Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleNavigation('/admin/settings')}>
                                            <Settings className="h-4 w-4 mr-2" />
                                            System Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push('/logout')}>
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex-1">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-6">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex flex-1 items-center gap-2">
                            {title && (
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                                    {subtitle && (
                                        <p className="text-sm text-gray-600">{subtitle}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                <Activity className="h-3 w-3 mr-1" />
                                System Online
                            </Badge>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto">
                        <div className="p-6">
                            {children}
                        </div>
                    </main>
                </SidebarInset>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav />
            </div>
        </SidebarProvider>
    );
}