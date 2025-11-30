'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import MobileBottomNav from './mobile-bottom-nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    Menu,
    ChevronRight
} from 'lucide-react';
import { useMockData } from '@/hooks/use-mock-data';

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

    // Sidebar state with responsive auto-hide functionality
    const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
    const [isHovered, setIsHovered] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-hide sidebar only on smaller screens
    const startAutoHideTimer = () => {
        // Only auto-hide on screens smaller than lg (1024px)
        if (window.innerWidth < 1024) {
            if (autoHideTimeoutRef.current) {
                clearTimeout(autoHideTimeoutRef.current);
            }
            autoHideTimeoutRef.current = setTimeout(() => {
                if (!isHovered) {
                    setSidebarOpen(false);
                }
            }, 3000);
        }
    };

    // Handle mouse enter/leave for auto-hide
    const handleMouseEnter = () => {
        setIsHovered(true);
        if (autoHideTimeoutRef.current) {
            clearTimeout(autoHideTimeoutRef.current);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        startAutoHideTimer();
    };

    // Toggle sidebar manually
    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
        if (!sidebarOpen) {
            // When opening, start the auto-hide timer
            startAutoHideTimer();
        }
    };

    // Handle clicks outside sidebar to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && sidebarOpen) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (autoHideTimeoutRef.current) {
                clearTimeout(autoHideTimeoutRef.current);
            }
        };
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
                    title: 'Malayalam TTS Demo',
                    url: '/malayalam-tts-demo',
                    icon: Cloud,
                    badge: 'Cloud',
                    isActive: pathname.includes('/malayalam-tts-demo')
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
                }
            ]
        },
        {
            title: 'Administration',
            items: [
                {
                    title: 'User Management',
                    url: '/admin/users',
                    icon: Users,
                    isActive: pathname.includes('/admin/user')
                },
                {
                    title: 'System Settings',
                    url: '/admin/settings',
                    icon: Settings,
                    isActive: pathname.includes('/admin/settings')
                },
                {
                    title: 'System Monitoring',
                    url: '/admin/monitoring',
                    icon: Activity,
                    isActive: pathname.includes('/admin/monitor')
                },
                {
                    title: 'Log Management',
                    url: '/admin/logs',
                    icon: FileText,
                    isActive: pathname.includes('/admin/log')
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
                },
                {
                    title: 'Mock Data Manager',
                    url: '/admin/mock-data',
                    icon: Database,
                    badge: 'Demo',
                    isActive: pathname.includes('/admin/mock-data')
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
                }
            ]
        }
    ];

    const handleNavigation = (url: string) => {
        router.push(url);
        // Close sidebar after navigation on mobile
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex">
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed left-0 top-0 z-40 h-full transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'lg:w-64 w-0'
                    }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="h-full border-r border-gray-200 bg-white shadow-lg flex flex-col">
                    <div className="border-b border-gray-200 p-4 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">AI IVR System</h2>
                                <p className="text-xs text-gray-600">Management Console</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        {navigationSections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="py-2">
                                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {section.title}
                                </div>
                                <div>
                                    {section.items.map((item, itemIndex) => (
                                        <button
                                            key={itemIndex}
                                            onClick={() => handleNavigation(item.url)}
                                            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${item.isActive ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                                                }`}
                                        >
                                            <item.icon className="h-4 w-4 flex-shrink-0" />
                                            <span className="flex-1 text-left text-sm">{item.title}</span>
                                            {item.badge && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 p-4 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-600 truncate">{user.email}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/logout')}
                                className="h-8 w-8 p-0"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating toggle button when sidebar is hidden (only on smaller screens) */}
            {!sidebarOpen && (
                <div className="lg:hidden">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={toggleSidebar}
                                    className="fixed left-4 top-20 z-50 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
                                    size="sm"
                                >
                                    <Menu className="h-4 w-4 text-white" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Open Navigation</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}

            {/* Main content area */}
            <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64 ml-0' : 'lg:ml-64 ml-0'}`}>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-6">
                    <div className="flex flex-1 items-center gap-2">
                        {sidebarOpen && (
                            <Button
                                onClick={toggleSidebar}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 lg:hidden"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
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
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}