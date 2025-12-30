'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { signInWithEmailAndPassword, signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../../../lib/firebase';
import api from '../../../lib/axios';
import { useAuth } from '../../../components/auth-provider';
import { useTheme } from '../../../components/theme-provider';
import { FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Try local login first (for admin with email/password)
            try {
                const response = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password,
                });

                // Store token and user data
                login(response.data, response.data.token, response.data.refreshToken);
                toast.success('Logged in successfully!');

                // Redirect based on role
                switch (response.data.role) {
                    case 'student':
                        router.push('/dashboard/student');
                        break;
                    case 'mentor':
                        router.push('/dashboard/mentor');
                        break;
                    case 'admin':
                        router.push('/dashboard/admin');
                        break;
                    default:
                        router.push('/dashboard/student');
                }
                return;
            } catch (localError) {
                // If local login fails, try Firebase
                console.log('Local login failed, trying Firebase...');
            }

            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const firebaseToken = await userCredential.user.getIdToken();

            // Verify with backend
            const response = await api.post('/auth/verify', {
                firebaseToken,
            });

            // Store token and user data
            login(response.data, response.data.token, response.data.refreshToken);

            toast.success('Logged in successfully!');

            // Redirect based on profile completion
            if (!response.data.isProfileComplete) {
                router.push('/onboarding');
            } else {
                switch (response.data.role) {
                    case 'student':
                        router.push('/dashboard/student');
                        break;
                    case 'mentor':
                        router.push('/dashboard/mentor');
                        break;
                    case 'admin':
                        router.push('/dashboard/admin');
                        break;
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseToken = await result.user.getIdToken();

            const response = await api.post('/auth/verify', {
                firebaseToken,
            });

            login(response.data, response.data.token, response.data.refreshToken);
            toast.success('Logged in with Google successfully!');

            if (!response.data.isProfileComplete) {
                router.push('/onboarding');
            } else {
                switch (response.data.role) {
                    case 'student':
                        router.push('/dashboard/student');
                        break;
                    case 'mentor':
                        router.push('/dashboard/mentor');
                        break;
                    case 'admin':
                        router.push('/dashboard/admin');
                        break;
                }
            }
        } catch (error) {
            console.error('Google login error:', error);
            toast.error('Failed to login with Google.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setIsLoading(true);

        try {
            const result = await signInWithPopup(auth, githubProvider);
            const firebaseToken = await result.user.getIdToken();

            const response = await api.post('/auth/verify', {
                firebaseToken,
            });

            login(response.data, response.data.token, response.data.refreshToken);
            toast.success('Logged in with GitHub successfully!');

            if (!response.data.isProfileComplete) {
                router.push('/onboarding');
            } else {
                switch (response.data.role) {
                    case 'student':
                        router.push('/dashboard/student');
                        break;
                    case 'mentor':
                        router.push('/dashboard/mentor');
                        break;
                    case 'admin':
                        router.push('/dashboard/admin');
                        break;
                }
            }
        } catch (error) {
            console.error('GitHub login error:', error);
            toast.error('Failed to login with GitHub.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glassmorphism rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Sign in to continue to SquadUp
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field pl-10 pr-10"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FcGoogle className="w-5 h-5 mr-2" />
                                Google
                            </button>

                            <button
                                onClick={handleGithubLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FiGithub className="w-5 h-5 mr-2" />
                                GitHub
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Don't have an account?{' '}
                            <Link
                                href="/auth/register"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
