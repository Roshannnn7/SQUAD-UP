'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import SquadMatchCard from '@/components/SquadMatchCard';
import {
    FiPlus,
    FiTrendingUp,
    FiClock,
    FiArrowRight,
    FiUsers,
    FiStar,
    FiZap,
    FiAward,
    FiCompass,
    FiLayers,
    FiCalendar,
    FiCheckCircle,
    FiChevronRight,
    FiFolderPlus,
    FiExternalLink
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import Link from 'next/link';

/**
 * Smooth Animated Counter Component
 * Counts smoothly from 0 to target value on load (respects prefers-reduced-motion)
 */
function AnimatedCounter({ value, suffix = '', duration = 650 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const numericTarget = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;

    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplayValue(numericTarget);
            return;
        }

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(easeOutProgress * numericTarget));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(numericTarget);
            }
        };

        const frame = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(frame);
    }, [numericTarget, duration]);

    return (
        <span>
            {displayValue.toLocaleString()}{suffix}
        </span>
    );
}

export default function StudentDashboard() {
    const { user, isInitialized } = useAuth();
    const [projects, setProjects] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [projectsResult, bookingsResult, mentorsResult, unreadResult] = await Promise.allSettled([
                    api.get('/projects/my'),
                    api.get('/bookings?type=upcoming'),
                    api.get('/mentors?limit=3'),
                    api.get('/notifications/unread-count')
                ]);

                if (projectsResult.status === 'fulfilled') setProjects(projectsResult.value.data || []);
                if (bookingsResult.status === 'fulfilled') setBookings(bookingsResult.value.data || []);
                if (mentorsResult.status === 'fulfilled') setMentors((mentorsResult.value.data || []).slice(0, 3));
                if (unreadResult.status === 'fulfilled') setUnreadCount(unreadResult.value.data?.count || 0);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isInitialized && user) {
            fetchDashboardData();
        } else if (isInitialized && !user) {
            setLoading(false);
        }
    }, [isInitialized, user]);

    // Dynamic greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }).format(new Date());

    const stats = [
        {
            label: 'Active Squads',
            numericValue: projects.length,
            suffix: '',
            context: projects.length > 0 ? `${projects.length} Active project${projects.length > 1 ? 's' : ''}` : 'Ready to start',
            icon: <FiLayers className="w-5 h-5" />,
            color: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20',
            borderAccent: 'hover:border-blue-500/40',
            href: '/squads'
        },
        {
            label: 'Upcoming Sessions',
            numericValue: bookings.length,
            suffix: '',
            context: bookings.length > 0 ? 'Scheduled this week' : 'No upcoming calls',
            icon: <FiClock className="w-5 h-5" />,
            color: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20',
            borderAccent: 'hover:border-purple-500/40',
            href: '/bookings'
        },
        {
            label: 'XP Points',
            numericValue: user?.points || 0,
            suffix: ' XP',
            context: `Level ${user?.level || 1} Builder`,
            icon: <FiZap className="w-5 h-5" />,
            color: 'text-violet-600 dark:text-violet-400',
            iconBg: 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20',
            borderAccent: 'hover:border-violet-500/40',
            href: '/leaderboard'
        },
        {
            label: 'Day Streak',
            numericValue: user?.streak?.current || 0,
            suffix: ' Days',
            context: (user?.streak?.current || 0) > 0 ? 'Active commitment 🔥' : 'Start streak today',
            icon: <FiAward className="w-5 h-5" />,
            color: 'text-pink-600 dark:text-pink-400',
            iconBg: 'bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20',
            borderAccent: 'hover:border-pink-400/40',
            href: '/leaderboard'
        },
    ];

    // Animation container variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ambient-glow-wrapper bg-grid-pattern selection:bg-violet-500 selection:text-white transition-colors duration-300">
            <Navbar />

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Welcome Hero Area */}
                    <motion.div
                        variants={itemVariants}
                        className="glass-card rounded-[32px] p-6 sm:p-8 relative overflow-hidden transition-all duration-300"
                    >
                        {/* Decorative subtle background ambient light */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        System Optimal
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        {formattedDate}
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {getGreeting()},{' '}
                                    <span className="gradient-text">
                                        {user?.fullName?.split(' ')[0] || 'Roshan'}
                                    </span>
                                </h1>

                                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
                                    Your projects, squads and mentors — all in one place.
                                    {bookings.length > 0 && (
                                        <span className="text-violet-600 dark:text-violet-400 font-semibold ml-1">
                                            You have {bookings.length} session{bookings.length > 1 ? 's' : ''} scheduled this week.
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Hero Actions */}
                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                                <Link
                                    href="/squads"
                                    className="squad-btn-secondary text-xs sm:text-sm"
                                >
                                    <FiCompass className="mr-2 w-4 h-4 text-violet-500" />
                                    <span>Explore Squads</span>
                                </Link>

                                <Link
                                    href="/squads/create"
                                    className="squad-btn-primary text-xs sm:text-sm group"
                                >
                                    <FiPlus className="mr-2 w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                                    <span>New Project</span>
                                    <FiArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards (4 Cards with Animated Counter) */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
                    >
                        {stats.map((stat, index) => (
                            <Link
                                key={index}
                                href={stat.href}
                                className={`glass-card rounded-[26px] p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover-light dark:hover:shadow-card-hover-dark ${stat.borderAccent} group block`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                                            {stat.label}
                                        </p>
                                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {loading ? (
                                                <span className="inline-block w-16 h-8 squad-skeleton rounded-lg" />
                                            ) : (
                                                <AnimatedCounter value={stat.numericValue} suffix={stat.suffix} />
                                            )}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            {stat.context}
                                        </p>
                                    </div>

                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${stat.iconBg}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </motion.div>

                    {/* Main Layout Grid (2 Columns: Main Content + Sidebar) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Main Content Area (2 Cols on lg) */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Upcoming Session Banner (If Any Exists) */}
                            {bookings.length > 0 && (
                                <motion.div
                                    variants={itemVariants}
                                    className="glass-card rounded-[28px] p-5 sm:p-6 border-l-4 border-l-violet-600 relative overflow-hidden"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                                                <FiCalendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                                        Next Session
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                        {bookings[0].date ? new Date(bookings[0].date).toLocaleDateString() : 'Upcoming'}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                                                    Mentorship with {bookings[0].mentor?.user?.fullName || 'Mentor'}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {bookings[0].topic || 'Strategy & Code Review'} · {bookings[0].timeSlot || 'Scheduled time'}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            href="/bookings"
                                            className="squad-btn-secondary text-xs shrink-0 self-start sm:self-auto"
                                        >
                                            <span>View Session</span>
                                            <FiArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                            {/* My Active Squads Section */}
                            <motion.div variants={itemVariants} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            My Active Squads
                                        </h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                            {projects.length}
                                        </span>
                                    </div>

                                    <Link
                                        href="/squads"
                                        className="text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1.5 group transition-colors"
                                    >
                                        <span>Explore All Squads</span>
                                        <FiArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                                    </Link>
                                </div>

                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-64 squad-skeleton rounded-[28px]" />
                                        ))}
                                    </div>
                                ) : projects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {projects.map((project) => (
                                            <Link
                                                href={`/squads/${project._id}`}
                                                key={project._id}
                                                className="glass-card rounded-[28px] p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-card-hover-light dark:hover:shadow-card-hover-dark hover:border-violet-500/40 dark:hover:border-violet-500/40 group flex flex-col justify-between"
                                            >
                                                <div>
                                                    {/* Card Header */}
                                                    <div className="flex items-start justify-between gap-3 mb-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/10 via-violet-600/10 to-pink-500/10 dark:from-blue-500/20 dark:via-violet-500/20 dark:to-pink-500/20 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform duration-200">
                                                            <FiUsers className="w-5 h-5" />
                                                        </div>

                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                                            {project.status === 'active' || project.status === 'in-progress'
                                                                ? 'In Progress'
                                                                : 'Planning Phase'}
                                                        </span>
                                                    </div>

                                                    {/* Project Details */}
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-1">
                                                        {project.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                                        {project.description || 'Collaborative team project focused on building state-of-the-art software.'}
                                                    </p>

                                                    {/* Tech Stack Pills */}
                                                    {project.skillsRequired && project.skillsRequired.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-5">
                                                            {project.skillsRequired.slice(0, 3).map((tech) => (
                                                                <span
                                                                    key={tech}
                                                                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card Footer: Progress & Team */}
                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                                                            <FiUsers className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>
                                                                {project.members?.length || 0} / {project.maxMembers || 4} Members
                                                            </span>
                                                        </div>
                                                        <span className="font-extrabold text-violet-600 dark:text-violet-400 text-xs">
                                                            {project.progress || 0}% Complete
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar with Gradient */}
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-[1px]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.max(project.progress || 10, 8)}%` }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                            className="h-full bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 rounded-full"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between pt-1">
                                                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                                            Manage sprint & tasks
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform duration-200">
                                                            Continue <FiArrowRight className="w-3.5 h-3.5" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    /* Beautiful Empty State When 0 Squads */
                                    <div className="glass-card rounded-[32px] p-8 sm:p-12 text-center relative overflow-hidden border border-dashed border-slate-300 dark:border-slate-800">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-blue-500/20 via-violet-500/20 to-pink-500/20 p-[2px] flex items-center justify-center shadow-glow-sm">
                                                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center text-violet-600 dark:text-violet-400">
                                                    <HiSparkles className="w-8 h-8 animate-pulse" />
                                                </div>
                                            </div>

                                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                                Your first squad starts here.
                                            </h3>

                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                Find ambitious people, collaborate on real-world projects, and build something exceptional together.
                                            </p>

                                            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                                                <Link
                                                    href="/squads"
                                                    className="squad-btn-primary text-xs sm:text-sm"
                                                >
                                                    <FiCompass className="mr-2 w-4 h-4" />
                                                    <span>Explore Open Squads</span>
                                                </Link>
                                                <Link
                                                    href="/squads/create"
                                                    className="squad-btn-secondary text-xs sm:text-sm"
                                                >
                                                    <FiPlus className="mr-2 w-4 h-4" />
                                                    <span>Create Project</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Sidebar Column (1 Col on lg) */}
                        <div className="space-y-6">
                            {/* AI Squad Recommendation Panel */}
                            <motion.div variants={itemVariants}>
                                <SquadMatchCard />
                            </motion.div>

                            {/* Leaderboard & Rank Teaser */}
                            <motion.div variants={itemVariants}>
                                <Link
                                    href="/leaderboard"
                                    className="block relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800 p-6 sm:p-7 rounded-[28px] text-white shadow-xl shadow-violet-900/20 group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                                >
                                    {/* Watermark Icon */}
                                    <div className="absolute top-2 right-3 text-white/10 group-hover:text-white/20 transition-colors duration-300">
                                        <FiAward className="w-28 h-28 -rotate-12" />
                                    </div>

                                    <div className="relative z-10 space-y-4">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                                                <FiZap className="w-3.5 h-3.5 text-amber-400" />
                                                <span>Your Global Rank</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-4xl sm:text-5xl font-black tracking-tight">
                                                    {(user?.points || 0).toLocaleString()}
                                                </p>
                                                <span className="text-lg font-bold text-white/80">XP</span>
                                            </div>
                                            <p className="text-white/80 text-xs font-semibold mt-1">
                                                Level {user?.level || 1} Builder · {user?.streak?.current || 0} day streak 🔥
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white group-hover:text-white">
                                            <span>View Full Leaderboard</span>
                                            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Top Mentors Spotlight */}
                            <motion.div
                                variants={itemVariants}
                                className="glass-card rounded-[28px] p-6 space-y-5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Top Mentors</h3>
                                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            PRO
                                        </span>
                                    </div>
                                    <Link
                                        href="/mentors"
                                        className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider hover:underline"
                                    >
                                        View All
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {loading ? (
                                        [1, 2, 3].map((i) => (
                                            <div key={i} className="h-14 squad-skeleton rounded-2xl" />
                                        ))
                                    ) : mentors.length > 0 ? (
                                        mentors.map((mentor) => (
                                            <Link
                                                href={`/mentors/${mentor.user?._id || mentor._id}`}
                                                key={mentor._id}
                                                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 transition-all duration-200 group"
                                            >
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={mentor.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user?.fullName || 'Mentor'}`}
                                                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                                                        alt={mentor.user?.fullName || 'Mentor'}
                                                    />
                                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                        {mentor.user?.fullName || 'Senior Mentor'}
                                                    </h4>
                                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                                                        {mentor.expertise?.[0] || 'Software Engineer'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center text-amber-500 font-extrabold text-xs shrink-0">
                                                    <FiStar className="fill-current mr-0.5 w-3 h-3" />
                                                    <span>{mentor.rating > 0 ? Number(mentor.rating).toFixed(1) : 'New'}</span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-xs text-slate-400">
                                            No mentors listed at the moment.
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href="/mentors"
                                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-950/30 dark:hover:text-violet-400 transition-all duration-200 group"
                                >
                                    <span>Browse All Mentors</span>
                                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                                </Link>
                            </motion.div>

                            {/* Quick Launch CTA Banner */}
                            <motion.div
                                variants={itemVariants}
                                className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-pink-600 p-6 rounded-[28px] text-white shadow-xl group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:scale-110 transition-transform duration-300">
                                    <FiFolderPlus className="w-20 h-20" />
                                </div>

                                <h3 className="text-lg font-black mb-1 tracking-tight">
                                    Start your own Squad
                                </h3>
                                <p className="text-white/80 text-xs mb-4 leading-relaxed">
                                    Assemble your dream team, assign roles, and build a project that stands out.
                                </p>

                                <Link
                                    href="/squads/create"
                                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all duration-200 active:scale-98 shadow-md"
                                >
                                    <span>Create Squad Now</span>
                                    <FiArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
