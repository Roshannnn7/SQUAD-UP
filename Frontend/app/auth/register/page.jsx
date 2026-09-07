'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBookOpen, FiBriefcase } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../lib/firebase';
import api from '../../../lib/axios';
import { useAuth } from '../../../components/auth-provider';
import toast from 'react-hot-toast';
import SquadUpLogo from '../../../components/SquadUpLogo';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            // Step 1: Create Firebase email/password account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Step 2: Register with our backend — send the TYPED name, not Firebase token
            // POST /api/auth/register preserves the manually entered fullName
            const response = await api.post('/auth/register', {
                fullName:    formData.fullName,
                email:       formData.email,
                role:        formData.role,
                firebaseUid: userCredential.user.uid,
            });

            const userData     = response.data.user  || response.data;
            const authToken    = response.data.token || await userCredential.user.getIdToken();
            const refreshToken = response.data.refreshToken || response.data.user?.refreshToken || '';

            login(userData, authToken, refreshToken);
            toast.success('Account created successfully!');
            router.push('/onboarding');
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token  = await result.user.getIdToken();

            // POST /api/auth/verify is the correct Firebase token verification endpoint
            const response = await api.post('/auth/verify', {
                firebaseToken: token,
                role:          formData.role,
            });

            const userData     = response.data.user || response.data;
            const authToken    = response.data.token || token;
            const refreshToken = response.data.refreshToken || response.data.user?.refreshToken || '';

            login(userData, authToken, refreshToken);
            toast.success('Signed in with Google!');

            if (!userData.isProfileComplete) {
                router.push('/onboarding');
            } else {
                router.push(`/dashboard/${userData.role}`);
            }
        } catch (error) {
            console.error('Google sign-up error:', error);
            toast.error('Google sign-up failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center"
            >
                <Link href="/" className="mb-4">
                    <SquadUpLogo size="lg" showWordmark={true} animated={true} />
                </Link>
                <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
                    Create your account
                </h2>
                <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">
                    Start collaborating with students and mentors today
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <div className="glassmorphism py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email address
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
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                I want to join as
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'student' })}
                                    className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${formData.role === 'student'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'}`}
                                >
                                    <FiBookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    <div className="font-medium text-gray-900 dark:text-white">Student</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'mentor' })}
                                    className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${formData.role === 'mentor'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'}`}
                                >
                                    <FiBriefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <div className="font-medium text-gray-900 dark:text-white">Mentor</div>
                                </button>
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
                                    minLength={6}
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field pl-10 pr-10"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Already have an account?{' '}
                            <Link
                                href="/auth/login"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
