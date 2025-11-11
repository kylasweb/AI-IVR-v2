'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'client_admin' | 'fairgo_admin' | 'sysadmin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId?: string;
    isActive: boolean;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    // For demo purposes - role switching
    switchRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize with demo user based on localStorage or default to client_admin
    useEffect(() => {
        const initializeUser = () => {
            try {
                const savedRole = localStorage.getItem('demo-user-role') as UserRole || 'client_admin';

                // Demo users for different roles
                const demoUsers: Record<UserRole, User> = {
                    client_admin: {
                        id: 'client-001',
                        email: 'admin@company.com',
                        name: 'John Smith',
                        role: 'client_admin',
                        tenantId: 'tenant-001',
                        isActive: true
                    },
                    fairgo_admin: {
                        id: 'fairgo-001',
                        email: 'admin@fairgo.ai',
                        name: 'Sarah Johnson',
                        role: 'fairgo_admin',
                        isActive: true
                    },
                    sysadmin: {
                        id: 'sys-001',
                        email: 'sysadmin@fairgo.ai',
                        name: 'Mike Chen',
                        role: 'sysadmin',
                        isActive: true
                    }
                };

                setUser(demoUsers[savedRole]);
            } catch (error) {
                console.error('Error initializing user:', error);
                // Fallback to client admin
                setUser({
                    id: 'client-001',
                    email: 'admin@company.com',
                    name: 'John Smith',
                    role: 'client_admin',
                    tenantId: 'tenant-001',
                    isActive: true
                });
            } finally {
                setIsLoading(false);
            }
        };

        initializeUser();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Demo login - in real app, this would call an API
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simple demo logic - determine role based on email domain
        let role: UserRole = 'client_admin';
        if (email.includes('@fairgo.ai')) {
            role = email.includes('sys') ? 'sysadmin' : 'fairgo_admin';
        }

        const demoUser: User = {
            id: `${role}-001`,
            email,
            name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            role,
            tenantId: role === 'client_admin' ? 'tenant-001' : undefined,
            isActive: true
        };

        setUser(demoUser);
        localStorage.setItem('demo-user-role', role);
        setIsLoading(false);

        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('demo-user-role');
    };

    const switchRole = (role: UserRole) => {
        if (!user) return;

        const demoUsers: Record<UserRole, User> = {
            client_admin: {
                id: 'client-001',
                email: 'admin@company.com',
                name: 'John Smith',
                role: 'client_admin',
                tenantId: 'tenant-001',
                isActive: true
            },
            fairgo_admin: {
                id: 'fairgo-001',
                email: 'admin@fairgo.ai',
                name: 'Sarah Johnson',
                role: 'fairgo_admin',
                isActive: true
            },
            sysadmin: {
                id: 'sys-001',
                email: 'sysadmin@fairgo.ai',
                name: 'Mike Chen',
                role: 'sysadmin',
                isActive: true
            }
        };

        setUser(demoUsers[role]);
        localStorage.setItem('demo-user-role', role);
    };

    // Listen for role switch events
    useEffect(() => {
        const handleRoleSwitch = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { role } = customEvent.detail;
            switchRole(role);
        };

        window.addEventListener('switch-user-role', handleRoleSwitch);

        return () => {
            window.removeEventListener('switch-user-role', handleRoleSwitch);
        };
    }, []);

    const value: UserContextType = {
        user,
        setUser,
        isLoading,
        login,
        logout,
        switchRole
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};