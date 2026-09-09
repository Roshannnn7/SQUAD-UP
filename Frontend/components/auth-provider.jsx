'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const router = useRouter();
    const {
        user,
        token,
        refreshToken,
        setUser,
        setToken,
        setRefreshToken,
        setLoading,
        login: storeLogin,
        logout: storeLogout,
        updateUser: storeUpdateUser,
    } = useAuthStore();

    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState(null);

    // Function to refresh access token
    const refreshAccessToken = async () => {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (!storedRefreshToken) {
                storeLogout();
                return false;
            }

            const response = await api.post('/auth/refresh', {
                refreshToken: storedRefreshToken,
            });

            const newAccessToken = response.data.token;
            const newRefreshToken = response.data.refreshToken;
            setToken(newAccessToken);
            localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) {
                setRefreshToken(newRefreshToken);
                localStorage.setItem('refreshToken', newRefreshToken);
            }
            return true;
        } catch (error) {
            console.warn('Token refresh failed:', error.message);
            storeLogout();
            return false;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedRefreshToken = localStorage.getItem('refreshToken');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    try {
                        setToken(storedToken);
                        setRefreshToken(storedRefreshToken);
                        setUser(JSON.parse(storedUser));

                        // Verify token with backend — with 10s timeout to prevent hanging on cold starts
                        try {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 10000);

                            const response = await api.get('/auth/me', {
                                signal: controller.signal,
                            });
                            clearTimeout(timeoutId);
                            setUser(response.data);
                        } catch (verifyError) {
                            if (verifyError.name === 'AbortError' || verifyError.code === 'ERR_CANCELED') {
                                console.warn('Auth verification timed out — using cached user data');
                            } else if (verifyError.response?.status === 401 && storedRefreshToken) {
                                console.log('Token expired, attempting refresh...');
                                const refreshed = await refreshAccessToken();
                                if (!refreshed) {
                                    console.warn('Token refresh failed, logging out');
                                    storeLogout();
                                }
                            } else {
                                console.warn('Token verification failed, using cached user:', verifyError.message);
                            }
                        }
                    } catch (parseError) {
                        console.error('Failed to parse stored user:', parseError);
                        storeLogout();
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setInitError(error.message);
            } finally {
                setLoading(false);
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, [setUser, setToken, setRefreshToken, setLoading, storeLogout]);

    /**
     * Listen for the `auth:session-expired` event dispatched by the axios interceptor.
     * This is the single authoritative logout path — it clears all auth state and
     * navigates to the login page. The axios interceptor must NOT call
     * window.location.href directly because it fires before this provider initializes,
     * which would wipe valid tokens in a race condition.
     */
    const handleSessionExpired = useCallback(() => {
        console.warn('[auth-provider] Session expired — logging out');
        storeLogout();
        router.push('/auth/login');
    }, [storeLogout, router]);

    useEffect(() => {
        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }, [handleSessionExpired]);

    const login = (userData, token, refreshToken) => {
        storeLogin(userData, token, refreshToken);
    };

    const logout = async () => {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (storedRefreshToken) {
                await api.post('/auth/logout', { refreshToken: storedRefreshToken });
            }
        } catch (err) {
            console.warn('Server logout call failed:', err.message);
        } finally {
            storeLogout();
        }
    };

    const updateProfile = (updates) => {
        storeUpdateUser(updates);
    };

    const value = {
        user,
        token,
        refreshToken,
        isInitialized,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        updateProfile,
        refreshAccessToken,
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
