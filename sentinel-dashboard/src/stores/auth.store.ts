// Authentication store using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, LoginCredentials, MFACredentials } from '../types/user';

interface AuthStore {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    mfaRequired: boolean;
    mfaToken?: string;
    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    verifyMFA: (credentials: MFACredentials) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    setUser: (user: User | null) => void;
    setMFARequired: (required: boolean, token?: string) => void;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    mfaRequired: false,
    mfaToken: undefined,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true });

                try {
                    // TODO: Implement actual API call
                    // const response = await api.post('/auth/login', credentials);

                    // Mock response for development
                    const mockResponse = {
                        accessToken: 'mock_access_token',
                        refreshToken: 'mock_refresh_token',
                        user: {
                            id: '1',
                            email: credentials.email,
                            role: 'SOC_Analyst' as const,
                            mfaStatus: 'enabled' as const,
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        mfaRequired: true,
                    };

                    if (mockResponse.mfaRequired) {
                        set({
                            mfaRequired: true,
                            mfaToken: mockResponse.accessToken, // Temporary token for MFA
                            isLoading: false,
                        });
                    } else {
                        set({
                            user: mockResponse.user,
                            isAuthenticated: true,
                            isLoading: false,
                            mfaRequired: false,
                        });

                        // Store tokens in localStorage
                        localStorage.setItem('accessToken', mockResponse.accessToken);
                        localStorage.setItem('refreshToken', mockResponse.refreshToken);
                    }
                } catch (error) {
                    set({
                        isLoading: false,
                        user: null,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            verifyMFA: async (credentials: MFACredentials) => {
                set({ isLoading: true });

                try {
                    // TODO: Implement actual API call
                    // const response = await api.post('/auth/mfa/verify', {
                    //   mfa_token: credentials.mfaToken,
                    //   code: credentials.code,
                    // });

                    // Mock response for development
                    const mockResponse = {
                        accessToken: 'mock_access_token_verified',
                        refreshToken: 'mock_refresh_token_verified',
                        user: {
                            id: '1',
                            email: 'analyst@imos.com',
                            role: 'SOC_Analyst' as const,
                            mfaStatus: 'enabled' as const,
                            isActive: true,
                            lastLoginAt: new Date(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    };

                    set({
                        user: mockResponse.user,
                        isAuthenticated: true,
                        isLoading: false,
                        mfaRequired: false,
                        mfaToken: undefined,
                    });

                    // Store tokens in localStorage
                    localStorage.setItem('accessToken', mockResponse.accessToken);
                    localStorage.setItem('refreshToken', mockResponse.refreshToken);
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                // Clear tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // Reset state
                set(initialState);
            },

            refreshToken: async () => {
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    // TODO: Implement actual API call
                    // const response = await api.post('/auth/refresh', { refreshToken });

                    // Mock response for development
                    const mockResponse = {
                        accessToken: 'mock_access_token_refreshed',
                        refreshToken: 'mock_refresh_token_refreshed',
                    };

                    localStorage.setItem('accessToken', mockResponse.accessToken);
                    localStorage.setItem('refreshToken', mockResponse.refreshToken);
                } catch (error) {
                    // If refresh fails, logout
                    get().logout();
                    throw error;
                }
            },

            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },

            setUser: (user: User | null) => {
                set({
                    user,
                    isAuthenticated: !!user,
                });
            },

            setMFARequired: (required: boolean, token?: string) => {
                set({
                    mfaRequired: required,
                    mfaToken: token,
                });
            },
        }),
        {
            name: 'sentinel-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                mfaRequired: state.mfaRequired,
            }),
        }
    )
);