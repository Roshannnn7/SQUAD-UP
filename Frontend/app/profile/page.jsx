'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiUser,
    FiMail,
    FiCamera,
    FiGithub,
    FiLinkedin,
    FiBriefcase,
    FiSettings,
    FiShield,
    FiLogOut
} from 'react-icons/fi';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        profilePhoto: user?.profilePhoto || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put('/auth/profile', {
                fullName: formData.fullName,
                profilePhoto: formData.profilePhoto
            });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="md:w-1/3 space-y-6">
                        <div className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                            <div className="relative inline-block mb-6">
                                <img
                                    src={formData.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fullName}`}
                                    className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                                    alt=""
                                />
                                <button className="absolute -bottom-2 -right-2 p-3 bg-primary-600 text-white rounded-2xl shadow-lg hover:bg-primary-700 transition-colors">
                                    <FiCamera />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.fullName}</h2>
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-widest mt-1">{user?.role}</p>

                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                <button className="w-full flex items-center space-x-3 p-4 rounded-2xl bg-primary-50 text-primary-600 font-bold text-sm">
                                    <FiUser /> <span>Personal Info</span>
                                </button>
                                <button className="w-full flex items-center space-x-3 p-4 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-sm transition-colors">
                                    <FiShield /> <span>Account Security</span>
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center space-x-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-sm transition-colors"
                                >
                                    <FiLogOut /> <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glassmorphism p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <FiSettings className="text-primary-500" /> Account Settings
                                </h3>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                        <div className="relative">
                                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="input-field pl-12"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                        <div className="relative">
                                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="input-field pl-12 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed opacity-70"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Profile Photo URL</label>
                                    <input
                                        type="text"
                                        name="profilePhoto"
                                        value={formData.profilePhoto}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary py-4 px-10 font-bold shadow-lg shadow-primary-500/20"
                                    >
                                        {loading ? 'Saving Changes...' : 'Update Profile'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Role Specific Stats / Info could go here */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-sm font-bold text-gray-500 mb-4">Platform Identity</h4>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                                        <FiShield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{user?.role} Account</p>
                                        <p className="text-xs text-gray-500">Verified Member</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                <h4 className="text-sm font-bold text-gray-500 mb-4">Integrations</h4>
                                <div className="flex space-x-3">
                                    <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:text-primary-600 transition-colors">
                                        <FiGithub className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:text-primary-600 transition-colors">
                                        <FiLinkedin className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
