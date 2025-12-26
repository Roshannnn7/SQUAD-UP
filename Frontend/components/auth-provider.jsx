'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const {
        user,
        token,
        setUser,
        setToken,
        setLoading,
        login: storeLogin,
        logout: storeLogout,
    } = useAuthStore();

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Verify token with backend
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                storeLogout();
            } finally {
                setLoading(false);
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, [setUser, setToken, setLoading, storeLogout]);

    const login = (userData, token) => {
        storeLogin(userData, token);
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
        isInitialized,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        updateProfile,
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
