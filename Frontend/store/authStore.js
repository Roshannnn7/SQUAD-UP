import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: true,

            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setLoading: (isLoading) => set({ isLoading }),

            login: (userData, token) => {
                set({ user: userData, token });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            },

            logout: () => {
                set({ user: null, token: null });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
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
