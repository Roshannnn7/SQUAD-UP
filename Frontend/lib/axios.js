import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach the stored access token as a Bearer header on every request.
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && token !== 'undefined') {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: on 401, attempt a single token refresh then retry.
//
// IMPORTANT — why we do NOT call window.location.href here:
//   This interceptor runs before auth-provider.jsx finishes its async `initializeAuth`.
//   If we redirect on the very first 401 (e.g. from the Notifications poll that fires at
//   mount time), we wipe valid tokens from localStorage in a race-condition, logging the
//   user out even though their session is still valid.
//   Instead we dispatch a custom DOM event that auth-provider listens to — keeping all
//   logout logic in one place and avoiding the race condition.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Never attempt refresh on the auth endpoints themselves.
        const isAuthEndpoint =
            originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/refresh') ||
            originalRequest?.url?.includes('/auth/verify') ||
            originalRequest?.url?.includes('/auth/register');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                const refreshToken =
                    typeof window !== 'undefined'
                        ? localStorage.getItem('refreshToken')
                        : null;

                if (refreshToken && refreshToken !== 'undefined') {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const newAccessToken = response.data.token;
                    const newRefreshToken = response.data.refreshToken;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', newAccessToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refreshToken', newRefreshToken);
                        }
                    }

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                const msg =
                    refreshError?.response?.data?.message ||
                    refreshError?.message ||
                    'Session expired';
                console.warn('[axios] Token refresh failed:', msg);

                // Signal auth-provider to perform a clean logout.
                // Do NOT mutate localStorage or redirect directly from here.
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auth:session-expired'));
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
