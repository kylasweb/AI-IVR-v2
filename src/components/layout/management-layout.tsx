'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { useMockData } from '@/hooks/use-mock-data';
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
    Globe as WifiIcon,
    Search,
    ChevronRight,
    ChevronDown,
    GripVertical
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
    const { mode, toggleMode, isDemoMode } = useMockData();
    const [user] = useState({
        name: 'Admin User',
        email: 'admin@fairgo.com',
        avatar: 'AU'
    });

    // Add back controlled state for sidebar
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'Core Systems': true,
        'Management': true,
        'Voice & AI': true,
        'Testing & QA': false,
        'Configuration': false,
        'Analytics & Monitoring': false,
        'Administration': false
    });

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            // Auto-collapse on mobile
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                    isActive: pathname.includes('/voice-cloning')
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
                    isActive: pathname.includes('/voice-biometric')
                },
                {
                    title: 'Voice Model Management',
                    url: '/voice-model-management',
                    icon: VoiceIcon,
                    badge: 'AI',
                    isActive: pathname.includes('/voice-model')
                },
                {
                    title: 'Voice Data Management',
                    url: '/voice-data-management',
                    icon: Database,
                    isActive: pathname.includes('/voice-data-management')
                },
                {
                    title: 'Voice Command Center',
                    url: '/voice-command-center',
                    icon: CommandIcon,
                    badge: 'New',
                    isActive: pathname.includes('/voice-command-center')
                },
                {
                    title: 'Speech Synthesizer',
                    url: '/speech-synthesizer',
                    icon: VoiceIcon,
                    badge: 'TTS',
                    isActive: pathname.includes('/speech-synthesizer')
                },
                {
                    title: 'Video IVR',
                    url: '/video-ivr',
                    icon: Camera,
                    badge: 'Beta',
                    isActive: pathname.includes('/video-ivr')
                },
                {
                    title: 'Cultural AI',
                    url: '/cultural-ai',
                    icon: Globe,
                    badge: 'ML',
                    isActive: pathname.includes('/cultural-ai')
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
                    title: 'Voice Testing Suite',
                    url: '/voice-testing-suite',
                    icon: Headphones,
                    badge: 'New',
                    isActive: pathname.includes('/voice-testing-suite')
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
                    title: 'AI Task Builder',
                    url: '/ai-task-builder',
                    icon: Zap,
                    badge: 'New',
                    isActive: pathname.includes('/ai-task-builder')
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
                    badge: 'API',
                    isActive: pathname.includes('/api-gateway')
                },
                {
                    title: 'Sentinel Dashboard',
                    url: '/sentinel-dashboard',
                    icon: Shield,
                    badge: 'Security',
                    isActive: pathname.includes('/sentinel-dashboard')
                },
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
                    title: 'Data Foundry Management',
                    url: '/data-foundry-management',
                    icon: Database,
                    badge: 'New',
                    isActive: pathname.includes('/data-foundry')
                },
                {
                    title: 'Voice Data Processing',
                    url: '/voice-data-processing-pipeline',
                    icon: Activity,
                    badge: 'Pipeline',
                    isActive: pathname.includes('/voice-data-processing')
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
                    isActive: pathname.includes('/admin/settings')
                },
                {
                    title: 'Pilot Program',
                    url: '/pilot-program',
                    icon: TestIcon,
                    badge: 'Beta',
                    isActive: pathname.includes('/pilot-program')
                },
                {
                    title: 'Strategic Engines Demo',
                    url: '/strategic-engines-demo',
                    icon: BrainCircuit,
                    badge: 'Demo',
                    isActive: pathname.includes('/strategic-engines-demo')
                },
                {
                    title: 'Verification',
                    url: '/verification',
                    icon: Shield,
                    badge: 'Security',
                    isActive: pathname.includes('/verification')
                },
                {
                    title: 'Integrations',
                    url: '/admin/integrations',
                    icon: Code,
                    isActive: pathname.includes('/admin/integration')
                },
                {
                    title: 'Security & Permissions',
                    url: '/admin/security',
                    icon: Shield,
                    isActive: pathname.includes('/admin/security')
                },
                {
                    title: 'Database Management',
                    url: '/admin/database',
                    icon: Database,
                    isActive: pathname.includes('/admin/database')
                }
            ]
        }
    ];

    // Filtered navigation based on search
    const filteredNavigation = useMemo(() => {
        if (!searchQuery.trim()) return navigationSections;

        return navigationSections.map(section => ({
            ...section,
            items: section.items.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                section.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(section => section.items.length > 0);
    }, [navigationSections, searchQuery]);

    // All navigation items for command palette
    const allNavigationItems = useMemo(() => {
        return navigationSections.flatMap(section =>
            section.items.map(item => ({
                ...item,
                section: section.title
            }))
        );
    }, [navigationSections]);

    const handleNavigation = (url: string) => {
        router.push(url);
    };

    return (
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <div className="min-h-screen w-full bg-gray-50">
                <Sidebar variant="inset" collapsible="icon" className="border-r border-gray-200">
                    <SidebarHeader className="border-b border-gray-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            {!sidebarOpen && (
                                <div>
                                    <h1 className="text-sm font-bold text-gray-900">FairGo IMOS</h1>
                                    <p className="text-xs text-gray-600">Management Portal</p>
                                </div>
                            )}
                        </div>

                        {/* Search Bar */}
                        {sidebarOpen && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-start text-sm text-muted-foreground"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Search navigation...
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search navigation..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                        />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            {allNavigationItems.map((item) => (
                                                <CommandItem
                                                    key={item.url}
                                                    onSelect={() => {
                                                        handleNavigation(item.url);
                                                        setSearchQuery('');
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <item.icon className="h-4 w-4" />
                                                    <div className="flex flex-col">
                                                        <span>{item.title}</span>
                                                        <span className="text-xs text-muted-foreground">{item.section}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <Badge variant="secondary" className="ml-auto text-xs">
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </SidebarHeader>

                    <SidebarContent className="bg-white">
                        <AnimatePresence>
                            {filteredNavigation.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Collapsible
                                        open={openSections[section.title]}
                                        onOpenChange={(open) =>
                                            setOpenSections(prev => ({ ...prev, [section.title]: open }))
                                        }
                                    >
                                        <SidebarGroup>
                                            <CollapsibleTrigger asChild>
                                                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
                                                    {sidebarOpen && <span>{section.title}</span>}
                                                    {sidebarOpen && (openSections[section.title] ? (
                                                        <ChevronDown className="h-3 w-3" />
                                                    ) : (
                                                        <ChevronRight className="h-3 w-3" />
                                                    ))}
                                                </SidebarGroupLabel>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarGroupContent>
                                                    <SidebarMenu>
                                                        <AnimatePresence>
                                                            {section.items.map((item) => {
                                                                const Icon = item.icon;
                                                                return (
                                                                    <motion.div
                                                                        key={item.url}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: -10 }}
                                                                        transition={{ duration: 0.15 }}
                                                                    >
                                                                        <SidebarMenuItem>
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
                                                                                    {sidebarOpen && <span className="flex-1 text-left">{item.title}</span>}
                                                                                    {item.badge && sidebarOpen && (
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
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </AnimatePresence>
                                                    </SidebarMenu>
                                                </SidebarGroupContent>
                                            </CollapsibleContent>
                                        </SidebarGroup>
                                    </Collapsible>
                                </motion.div>
                            ))}
                        </AnimatePresence>
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

                <SidebarInset className="flex-1 overflow-hidden transition-all duration-300 ease-in-out">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-6">
                        <SidebarTrigger className="mr-2 hover:bg-gray-100 transition-colors" />
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
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Demo Mode</span>
                                <Button
                                    onClick={toggleMode}
                                    variant={isDemoMode ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs"
                                >
                                    {isDemoMode ? 'Demo Data' : 'Live Data'}
                                </Button>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                <Activity className="h-3 w-3 mr-1" />
                                {isDemoMode ? 'Demo Active' : 'Live Active'}
                            </Badge>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto bg-gray-50">
                        <div className="p-6 min-h-full">
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