'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import {
    FiPlus,
    FiSearch,
    FiTrendingUp,
    FiClock,
    FiCheckCircle,
    FiMessageSquare,
    FiArrowRight,
    FiUsers,
    FiStar
} from 'react-icons/fi';
import Link from 'next/link';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [projectsRes, bookingsRes, mentorsRes, unreadRes] = await Promise.all([
                    api.get('/projects/my'),
                    api.get('/bookings?type=upcoming'),
                    api.get('/mentors?limit=3'),
                    api.get('/notifications/unread-count')
                ]);
                setProjects(projectsRes.data);
                setBookings(bookingsRes.data);
                setMentors(mentorsRes.data.slice(0, 3));
                setUnreadCount(unreadRes.data.count);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Active Squads', value: projects.length.toString(), icon: <FiTrendingUp />, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Upcoming Sessions', value: bookings.length.toString(), icon: <FiClock />, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Unread Alerts', value: unreadCount.toString(), icon: <FiMessageSquare />, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Achievements', value: '4', icon: <FiCheckCircle />, color: 'text-green-600', bg: 'bg-green-100' },
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
                            Welcome, {user?.fullName?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            System status: Optimal. You have {bookings.length} sessions scheduled this week.
                        </p>
                    </motion.div>

                    <div className="mt-6 md:mt-0 flex space-x-4">
                        <Link href="/squads/create" className="btn-primary flex items-center space-x-2 shadow-lg shadow-primary-500/20">
                            <FiPlus />
                            <span>New Project</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
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
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content: Recent Projects */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Active Squads</h2>
                            <Link href="/squads" className="text-sm font-bold text-primary-600 hover:text-primary-500 flex items-center gap-1">
                                Explorer <FiArrowRight />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                [1, 2].map(i => <div key={i} className="h-48 skeleton rounded-3xl" />)
                            ) : projects.length > 0 ? (
                                projects.slice(0, 4).map((project) => (
                                    <Link href={`/squads/${project._id}`} key={project._id} className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                                                <FiUsers className="w-6 h-6" />
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                {project.members?.length} / {project.maxMembers}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{project.name}</h3>
                                        <p className="text-xs text-gray-500 mb-6 line-clamp-1">{project.status === 'active' ? 'Development Phase' : 'Planning Phase'}</p>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                                <span>Health</span>
                                                <span className="text-primary-600">{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${project.progress}%` }}
                                                    className="h-full bg-primary-600 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-10 opacity-50 bg-white dark:bg-gray-800 border border-dashed rounded-3xl">
                                    <p className="text-sm font-medium">You haven't joined any squads yet.</p>
                                    <Link href="/squads" className="text-primary-600 font-bold mt-2 inline-block">Explore Squads</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Suggested Mentors & Quick Links */}
                    <div className="space-y-10">
                        {/* Suggested Mentors */}
                        <div className="glassmorphism p-8 rounded-[40px] border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mentors</h2>
                                <Link href="/mentors" className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                                    View All
                                </Link>
                            </div>
                            <div className="space-y-6">
                                {loading ? (
                                    [1, 2].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)
                                ) : mentors.map((mentor) => (
                                    <Link href={`/mentors/${mentor.user?._id}`} key={mentor._id} className="flex items-center space-x-4 group">
                                        <div className="relative">
                                            <img
                                                src={mentor.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user?.fullName}`}
                                                className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm"
                                                alt=""
                                            />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{mentor.user?.fullName}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">{mentor.expertise?.[0]} Specialist</p>
                                        </div>
                                        <div className="text-yellow-500 font-bold text-xs flex items-center">
                                            <FiStar className="fill-current mr-1" />
                                            {mentor.rating}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link href="/mentors" className="w-full mt-8 py-4 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 rounded-2xl text-xs font-bold hover:bg-primary-50 hover:text-primary-600 transition-all flex items-center justify-center gap-2">
                                Find more mentors <FiArrowRight />
                            </Link>
                        </div>

                        {/* Quick CTA */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-[40px] text-white shadow-2xl group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                                <FiPlus className="w-20 h-20" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Start your own Squad?</h3>
                            <p className="text-white/70 text-sm mb-8 leading-relaxed">Assemble your dream team and start building tomorrow's tech today.</p>
                            <Link href="/squads/create" className="w-full inline-flex items-center justify-center space-x-2 py-4 bg-white text-primary-600 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95">
                                <span>Get Started</span>
                                <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
