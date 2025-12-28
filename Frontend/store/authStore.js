import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isLoading: true,

            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            setLoading: (isLoading) => set({ isLoading }),

            login: (userData, token, refreshToken) => {
                set({ user: userData, token, refreshToken });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            },

            logout: () => {
                set({ user: null, token: null, refreshToken: null });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                }
            },

            updateUser: (updates) => {
                set((state) => ({
                    user: { ...state.user, ...updates },
                }));
                if (typeof window !== 'undefined') {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        localStorage.setItem('user', JSON.stringify({ ...user, ...updates }));
                    }
                }
            },

            isAuthenticated: () => {
                return !!get().user && !!get().token;
            },

            isStudent: () => {
                return get().user?.role === 'student';
            },

            isMentor: () => {
                return get().user?.role === 'mentor';
            },

            isAdmin: () => {
                return get().user?.role === 'admin';
            },
        }),
        {
            name: 'auth-storage',
            getStorage: () => (typeof window !== 'undefined' ? localStorage : null),
        }
    )
);
