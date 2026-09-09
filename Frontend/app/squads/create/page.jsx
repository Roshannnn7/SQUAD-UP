'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import { FiPlus, FiCpu, FiGithub, FiUsers, FiInfo, FiLayers } from 'react-icons/fi';

export default function CreateSquadPage() {
    const router = useRouter();
    const { isAuthenticated, isInitialized } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        skillsRequired: '',
        githubRepo: '',
        maxMembers: 5,
        isPublic: true,
    });

    // Auth guard: redirect unauthenticated users before rendering the form.
    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            toast.error('Please sign in to create a squad.');
            router.push('/auth/login');
        }
    }, [isAuthenticated, isInitialized, router]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please sign in to create a squad.');
            router.push('/auth/login');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/projects', {
                ...formData,
                skillsRequired: formData.skillsRequired.split(',').map(s => s.trim()).filter(s => s !== ''),
                maxMembers: parseInt(formData.maxMembers),
            });

            toast.success('Squad created successfully!');
            router.push(`/squads/${res.data._id}`);
        } catch (error) {
            // Log structured error info for debugging (never logs secrets)
            const status = error.response?.status;
            const serverMsg = error.response?.data?.message;
            console.error('[CreateSquad] Error:', {
                status,
                message: serverMsg || error.message,
            });

            // Show a clear, user-facing message
            if (status === 401) {
                toast.error('Your session has expired. Please sign in again.');
                router.push('/auth/login');
            } else if (status === 400) {
                toast.error(serverMsg || 'Invalid squad details. Please check your input.');
            } else {
                toast.error(serverMsg || 'Unable to create squad. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Start your Squad</h1>
                    <p className="text-gray-600 dark:text-gray-400">Bring your idea to life by building a team of talented collaborators.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glassmorphism p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <FiInfo className="text-primary-500" /> Project Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., Decentralized Social Network"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <FiLayers className="text-primary-500" /> Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    className="input-field"
                                    placeholder="Describe your project, goals, and the impact you want to create..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <FiCpu className="text-primary-500" /> Skills Required
                                    </label>
                                    <input
                                        type="text"
                                        name="skillsRequired"
                                        value={formData.skillsRequired}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="React, Node.js, Solidity..."
                                        required
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Separate skills with commas</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <FiUsers className="text-primary-500" /> Max Members
                                    </label>
                                    <input
                                        type="number"
                                        name="maxMembers"
                                        min="2"
                                        max="10"
                                        value={formData.maxMembers}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <FiGithub className="text-primary-500" /> GitHub Repository (Optional)
                                </label>
                                <input
                                    type="url"
                                    name="githubRepo"
                                    value={formData.githubRepo}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    name="isPublic"
                                    checked={formData.isPublic}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Allow anyone to discover and join this squad
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-500/20"
                        >
                            {loading ? 'Creating Squad...' : 'Launch Squad'}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
