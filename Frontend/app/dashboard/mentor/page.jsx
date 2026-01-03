'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import {
    FiUsers,
    FiClock,
    FiStar,
    FiDollarSign,
    FiCalendar,
    FiArrowRight,
    FiVideo,
    FiCheckCircle,
    FiAlertCircle
} from 'react-icons/fi';
import Link from 'next/link';

export default function MentorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        if (!user || (user.role !== 'mentor' && user.role !== 'admin')) return;
        try {
            setLoading(true);
            const [statsRes, bookingsRes] = await Promise.all([
                api.get('/mentors/dashboard/stats'),
                api.get('/bookings?type=upcoming')
            ]);
            setStats(statsRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Fetch dashboard data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Sessions', value: stats?.totalSessions?.toString() || '0', icon: <FiUsers />, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Upcoming', value: stats?.upcomingBookings?.toString() || '0', icon: <FiCalendar />, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Avg Rating', value: stats?.rating?.toString() || '5.0', icon: <FiStar />, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: 'Monthly Revenue', value: `₹${stats?.monthlyEarnings || 0}`, icon: <FiDollarSign />, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Mentor Hub: {user?.fullName?.split(' ')[0]} 🏛️
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Overview of your mentorship performance and upcoming bookings.
                        </p>
                    </motion.div>

                    <div className="mt-6 md:mt-0 flex space-x-4">
                        <Link href="/bookings" className="btn-secondary flex items-center space-x-2">
                            <FiCalendar />
                            <span>Manage Sessions</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary-500/50 transition-colors group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                        {loading ? '...' : stat.value}
                                    </p>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content: Upcoming Sessions */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Sessions</h2>
                            <Link href="/bookings" className="text-sm font-bold text-primary-600 hover:text-primary-500">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                [1, 2].map(i => <div key={i} className="h-24 skeleton rounded-3xl" />)
                            ) : bookings.length > 0 ? (
                                bookings.slice(0, 5).map((session) => (
                                    <div key={session._id} className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={session.student?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.student?.fullName}`}
                                                    className="w-12 h-12 rounded-2xl object-cover shrink-0"
                                                    alt=""
                                                />
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{session.student?.fullName}</h3>
                                                    <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
                                                        <span className="flex items-center space-x-1">
                                                            <FiCalendar className="w-3 h-3 text-primary-500" />
                                                            <span>{new Date(session.scheduledDate).toLocaleDateString()}</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            <FiClock className="w-3 h-3 text-primary-500" />
                                                            <span>{session.startTime} - {session.endTime}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <div className="hidden sm:block text-right mr-4">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Mode</p>
                                                    <p className="text-xs font-bold text-primary-600">{session.mode}</p>
                                                </div>
                                                <Link href={`/video-call/${session._id}`} className="btn-primary py-2 px-4 shadow-lg shadow-primary-500/20 text-xs flex items-center space-x-2">
                                                    <FiVideo />
                                                    <span>Join Call</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-gray-800 border border-dashed rounded-[40px] opacity-50">
                                    <FiAlertCircle className="mx-auto w-10 h-10 mb-4" />
                                    <p className="text-sm font-medium">No upcoming sessions found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Stats Details & Quick Action */}
                    <div className="space-y-10">
                        {/* Weekly Activity */}
                        <div className="glassmorphism p-8 rounded-[40px] border border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Reports</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800">
                                    <p className="text-xs font-bold text-primary-600 mb-1">Session Volume</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Your session volume is up 24% this month. Great job!</p>
                                </div>
                                <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800">
                                    <p className="text-xs font-bold text-green-600 mb-1">Student Satisfaction</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">98% of your students rated sessions as "Extremely Helpful".</p>
                                </div>
                            </div>
                        </div>

                        {/* Availability Promo */}
                        <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-primary-100 dark:border-gray-700 shadow-xl group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
                                <FiClock className="w-20 h-20" />
                            </div>
                            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/10 rounded-2xl flex items-center justify-center text-primary-500 mb-6 group-hover:rotate-12 transition-transform">
                                <FiClock className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Adjust Schedule</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">Update your availability slots to open more opportunities for mentorship.</p>
                            <Link href="/dashboard/mentor/availability" className="flex items-center text-primary-600 font-bold hover:space-x-2 transition-all group">
                                <span>Go to Calendar</span>
                                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
