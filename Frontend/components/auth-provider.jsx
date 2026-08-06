'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
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
            setToken(newAccessToken);
            localStorage.setItem('token', newAccessToken);
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

                        // Verify token with backend (non-blocking)
                        try {
                            const response = await api.get('/auth/me');
                            setUser(response.data);
                        } catch (verifyError) {
                            // If token verification fails, try to refresh
                            if (verifyError.response?.status === 401 && storedRefreshToken) {
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

    const login = (userData, token, refreshToken) => {
        storeLogin(userData, token, refreshToken);
    };

    const logout = () => {
        storeLogout();
    };

    const updateProfile = (updates) => {
        setUser({ ...user, ...updates });
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
