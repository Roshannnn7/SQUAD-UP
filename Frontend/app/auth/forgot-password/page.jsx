'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email!');
            // Store email in local storage or URL param to pass to reset page
            sessionStorage.setItem('resetEmail', email);
            router.push('/auth/reset-password');
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 relative z-10"
            >
                <div className="text-center">
                    <h1 className="text-4xl font-black gradient-text mb-2">Forgot Password?</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Don't worry! It happens. Please enter the email associated with your account.
                    </p>
                </div>

                <div className="glassmorphism p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 font-bold text-lg relative group overflow-hidden"
                        >
                            <span className="relative z-10">{isLoading ? 'Sending OTP...' : 'Send OTP'}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/auth/login" className="font-medium text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 flex items-center justify-center gap-2 transition-colors">
                            <FiArrowLeft />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
