'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, 
    FiVideo, 
    FiCalendar, 
    FiMessageSquare, 
    FiGitMerge, 
    FiStar, 
    FiInstagram, 
    FiLinkedin, 
    FiGithub, 
    FiTrendingUp, 
    FiZap, 
    FiMap, 
    FiMic,
    FiCheckCircle,
    FiArrowRight,
    FiBookOpen,
    FiBriefcase,
    FiCode,
    FiTarget,
    FiShield,
    FiLayers
} from 'react-icons/fi';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

const features = [
    {
        icon: <FiUsers className="w-6 h-6 text-violet-500" />,
        title: 'Collaborative Squads',
        description: 'Join or create project squads with students sharing complementary skills. Skill-matching algorithms pair you with ideal teammates.',
        badge: 'Popular',
    },
    {
        icon: <FiTrendingUp className="w-6 h-6 text-emerald-500" />,
        title: 'Ranked XP Leaderboard',
        description: 'Earn XP for every meaningful contribution — shipping code, holding daily standups, and completing challenges.',
        badge: 'Gamified',
    },
    {
        icon: <FiCalendar className="w-6 h-6 text-amber-500" />,
        title: 'Daily Stand-up Bot',
        description: 'Agile daily check-ins for your squad. Track blockers, share updates, and maintain continuous team momentum.',
        badge: 'Agile',
    },
    {
        icon: <FiZap className="w-6 h-6 text-indigo-500" />,
        title: 'Squad Skill Lab',
        description: 'Publish mini-challenges inside your squad. Members submit solutions, vote on peer reviews, and gain XP.',
        badge: 'Interactive',
    },
    {
        icon: <FiCode className="w-6 h-6 text-cyan-500" />,
        title: 'Student Portfolio Builder',
        description: 'Auto-generate a verified, public portfolio showcasing your real squad projects, badges, and code contributions.',
        badge: 'Verified',
    },
    {
        icon: <FiMap className="w-6 h-6 text-pink-500" />,
        title: 'Milestone Roadmap Builder',
        description: 'Visual milestone timelines for your team project. Plan deliverables, track progress, and celebrate completions.',
        badge: 'Roadmaps',
    },
    {
        icon: <FiVideo className="w-6 h-6 text-blue-500" />,
        title: 'Real-Time Video Sync',
        description: 'Instantly launch high-definition video calls with your squad members and mentors without leaving the workspace.',
        badge: null,
    },
    {
        icon: <FiBookOpen className="w-6 h-6 text-purple-500" />,
        title: '1-on-1 Mentor Booking',
        description: 'Schedule dedicated 1-on-1 sessions with experienced industry mentors for code reviews and career guidance.',
        badge: null,
    },
    {
        icon: <FiMic className="w-6 h-6 text-rose-500" />,
        title: 'Voice Notes in Chat',
        description: 'Record and send crisp 60-second voice notes directly inside squad chat channels for rapid async updates.',
        badge: 'Async',
    },
    {
        icon: <FiMessageSquare className="w-6 h-6 text-teal-500" />,
        title: 'Contextual Team Chat',
        description: 'Streamline squad messaging with threaded discussions, file sharing, code snippets, and custom reactions.',
        badge: null,
    },
    {
        icon: <FiGitMerge className="w-6 h-6 text-orange-500" />,
        title: 'GitHub Repository Sync',
        description: 'Connect your squad directly to GitHub repositories for automated issue tracking and pull request notifications.',
        badge: null,
    },
    {
        icon: <FiShield className="w-6 h-6 text-emerald-600" />,
        title: 'Peer Proof & Endorsements',
        description: 'Receive verified skill endorsements from team members and mentors as you complete milestones.',
        badge: null,
    },
];

const testimonials = [
    {
        name: 'Alex Johnson',
        role: 'Computer Science Student',
        university: 'Stanford University',
        content: 'SquadUp helped me transition from isolated tutorial learning to building production-ready projects with real teammates.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    {
        name: 'Sarah Chen',
        role: 'Senior Software Engineer & Mentor',
        university: 'Tech Mentor at SquadUp',
        content: 'Guiding student squads through system design and code architecture has been incredibly rewarding. The booking flow is seamless.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
        name: 'Michael Rodriguez',
        role: 'Project Squad Lead',
        university: 'UC Berkeley',
        content: 'The roadmap builder and standup bot kept our 4-person team accountable. We shipped our capstone project two weeks early!',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    },
];

const stats = [
    { label: 'Active Squads', value: '500+' },
    { label: 'Mentorship Sessions', value: '1,200+' },
    { label: 'Projects Shipped', value: '850+' },
    { label: 'Student Satisfaction', value: '99%' },
];

export default function LandingPage() {
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState('squads');
    const [roleTab, setRoleTab] = useState('students');

    const getDashboardHref = () => {
        if (!user || !user.role) return '/dashboard';
        return `/dashboard/${user.role}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-violet-500 selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-24 pb-20 overflow-hidden">
                {/* Background Ambient Glows */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-violet-500/20 via-sky-500/15 to-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute -top-32 right-10 w-96 h-96 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 text-sm font-semibold mb-8"
                        >
                            <FiUsers className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            <span>Human-Centered Student & Mentor Network</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8"
                        >
                            Where Students & Mentors <br />
                            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                                Build Real Projects Together
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-3xl mx-auto"
                        >
                            SquadUp connects ambitious student developers, designers, and creators with industry mentors.
                            Form collaborative project squads, track agile milestones, and showcase verified work.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        href="/auth/register"
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02] focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                                        aria-label="Get Started Free"
                                    >
                                        <span>Get Started Free</span>
                                        <FiArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200 focus:ring-2 focus:ring-slate-400"
                                        aria-label="Sign In to account"
                                    >
                                        <span>Sign In</span>
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={getDashboardHref()}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02]"
                                    aria-label="Go to Dashboard"
                                >
                                    <span>Go to Dashboard</span>
                                    <FiArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                        </motion.div>
                    </div>

                    {/* Interactive Feature Preview Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-16 max-w-5xl mx-auto rounded-3xl border border-slate-200/80 dark:border-gray-800 bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                        {/* Preview Header / Tabs */}
                        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-800 bg-slate-100/50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                <span className="ml-2 text-xs font-medium text-slate-500 dark:text-gray-400 hidden sm:inline">squadup.app/workspace</span>
                            </div>

                            <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
                                {[
                                    { id: 'squads', label: 'Squad Match', icon: FiUsers },
                                    { id: 'standup', label: 'Daily Standup', icon: FiCalendar },
                                    { id: 'roadmap', label: 'Roadmap', icon: FiMap },
                                    { id: 'xp', label: 'Leaderboard', icon: FiTrendingUp },
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                activeTab === tab.id
                                                    ? 'bg-violet-600 text-white shadow'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Interactive Tab Body */}
                        <div className="p-6 sm:p-10 min-h-[280px]">
                            {activeTab === 'squads' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <div className="p-5 rounded-2xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/20">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">AI Skill Match</span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">96% Fit</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Full-Stack AI Capstone Squad</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Building Next.js + Node.js platform with real-time vector search.</p>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-xs font-medium border border-slate-200 dark:border-gray-700">React</span>
                                            <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-xs font-medium border border-slate-200 dark:border-gray-700">Node.js</span>
                                            <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-xs font-medium border border-slate-200 dark:border-gray-700">Tailwind</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 pt-3 border-t border-slate-200/60 dark:border-gray-800">
                                            <span>3 / 4 Members Joined</span>
                                            <span className="font-semibold text-violet-600 dark:text-violet-400">Apply to Join &rarr;</span>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Active Squad</span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">In Progress</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Mobile Health Companion</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">React Native app for habit tracking and peer accountability.</p>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-xs font-medium border border-slate-200 dark:border-gray-700">React Native</span>
                                            <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-xs font-medium border border-slate-200 dark:border-gray-700">Firebase</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 pt-3 border-t border-slate-200/60 dark:border-gray-800">
                                            <span>Mentorship Session Scheduled</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">View Squad &rarr;</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'standup' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold shrink-0">
                                            <FiCalendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h5 className="font-bold text-slate-900 dark:text-white">Alex's Daily Check-in</h5>
                                                <span className="text-xs text-slate-400">Today, 9:30 AM</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Completed Auth middleware integration. Working on Socket.io WebRTC handshake today.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                                            <FiCheckCircle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h5 className="font-bold text-slate-900 dark:text-white">Streak Bonus Claimed</h5>
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">+10 XP Earned</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">5-day standup streak active! Keep building momentum with your team.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'roadmap' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-bold text-slate-900 dark:text-white">Project Roadmap Deliverables</h5>
                                        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Phase 2 of 4 Active</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Completed</span>
                                            <h6 className="font-bold text-sm text-slate-900 dark:text-white mt-1">1. System Architecture</h6>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">DB schemas & REST APIs</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50/70 dark:bg-violet-950/40">
                                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">In Progress</span>
                                            <h6 className="font-bold text-sm text-slate-900 dark:text-white mt-1">2. Core UI Component Lab</h6>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Humanized redesign & forms</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 opacity-60">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Upcoming</span>
                                            <h6 className="font-bold text-sm text-slate-900 dark:text-white mt-1">3. Beta Testing & Deploy</h6>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">CI/CD staging pipeline</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'xp' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">1</div>
                                            <div>
                                                <h6 className="font-bold text-sm text-slate-900 dark:text-white">Rohan Rathod</h6>
                                                <p className="text-xs text-slate-500">Lead Full-Stack Developer</p>
                                            </div>
                                        </div>
                                        <span className="font-extrabold text-violet-600 dark:text-violet-400 text-sm">1,450 XP</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-black flex items-center justify-center text-sm">2</div>
                                            <div>
                                                <h6 className="font-bold text-sm text-slate-900 dark:text-white">Alex Johnson</h6>
                                                <p className="text-xs text-slate-500">Frontend Specialist</p>
                                            </div>
                                        </div>
                                        <span className="font-extrabold text-violet-600 dark:text-violet-400 text-sm">1,280 XP</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Impact Metrics Banner */}
            <section className="py-12 bg-white dark:bg-gray-900 border-y border-slate-200/80 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="p-4">
                                <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Role Explorer (Student vs Mentor) */}
            <section className="py-24 bg-slate-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                            Built for Both Sides of Mentorship
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-lg">
                            Whether you are looking to build projects or share your experience, SquadUp gives you tailored tools to succeed.
                        </p>

                        <div className="inline-flex p-1.5 bg-slate-200 dark:bg-gray-900 rounded-2xl mt-8 border border-slate-300/60 dark:border-gray-800">
                            <button
                                onClick={() => setRoleTab('students')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                                    roleTab === 'students'
                                        ? 'bg-violet-600 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <FiBookOpen className="w-4 h-4" />
                                <span>For Students</span>
                            </button>
                            <button
                                onClick={() => setRoleTab('mentors')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                                    roleTab === 'mentors'
                                        ? 'bg-violet-600 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <FiBriefcase className="w-4 h-4" />
                                <span>For Mentors</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {roleTab === 'students' ? (
                            <>
                                <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6">
                                        <FiUsers className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Find Teammates</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        Stop building alone. Connect with peers who possess complementary skills in coding, UI design, and management.
                                    </p>
                                </div>

                                <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                                        <FiCode className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Verified Portfolio</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        Turn your squad contributions into a live public portfolio that highlights real project code, pull requests, and peer ratings.
                                    </p>
                                </div>

                                <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                                        <FiTarget className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">1-on-1 Mentorship</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        Book office hours with experienced software engineers to solve technical blockers, review code, and prep for interviews.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6">
                                        <FiBriefcase className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Give Back to Tech</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        Share your hard-earned software engineering experience with motivated students who are eager to learn.
                                    </p>
                                </div>

                                <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                                        <FiCalendar className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Flexible Scheduling</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        Set custom availability, session rates, and preferred video call topics that match your weekly schedule.
                                    </p>
                                </div>

                                <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                                        <FiShield className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Discover Early Talent</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        Identify top student performers, project leaders, and problem solvers before they hit the general job market.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                            12 Features Built for Collaboration
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-lg">
                            From AI squad matching to daily standup bots — a complete collaboration suite designed for growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
                                className="p-8 rounded-3xl bg-slate-50 dark:bg-gray-950 border border-slate-200/80 dark:border-gray-800 relative hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300 hover:-translate-y-1"
                            >
                                {feature.badge && (
                                    <span className="absolute top-6 right-6 text-xs font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 px-2.5 py-0.5 rounded-full">
                                        {feature.badge}
                                    </span>
                                )}
                                <div className="p-3 w-fit rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-slate-200 dark:border-gray-800 mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-slate-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                            Trusted by Students & Engineers
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-lg">
                            See how SquadUp empowers teams to learn, collaborate, and launch real projects.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col justify-between"
                            >
                                <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed mb-8 italic">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-gray-800">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full border border-slate-200 dark:border-gray-700"
                                    />
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                                            {testimonial.role}
                                        </p>
                                        <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                                            {testimonial.university}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet the Creator Section */}
            <section className="py-24 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-8 md:p-14 rounded-3xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-cyan-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
                            <img
                                src="/assets/roshan-profile.jpg"
                                alt="Roshan Rathod"
                                className="relative w-44 h-44 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl object-cover"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-block px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 text-xs font-bold mb-3">
                                Creator & Lead Developer
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Meet Roshan Rathod</h2>
                            <p className="text-slate-500 dark:text-gray-400 font-semibold text-sm mb-4">BCA Student & Founder of SquadUp</p>
                            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6 max-w-2xl">
                                "SquadUp was born from a simple need: helping fellow computer science students find reliable teammates and guidance. Today, it bridges the gap between learning to code and shipping real-world software together."
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <Link 
                                    href="/about" 
                                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                                >
                                    <span>About Me</span>
                                    <FiArrowRight className="w-4 h-4" />
                                </Link>
                                <div className="flex items-center gap-3">
                                    <a
                                        href="https://www.linkedin.com/in/roshan-rathod-38736b259"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-700 dark:text-slate-300 hover:text-violet-600 transition-colors shadow-sm"
                                        aria-label="Roshan Rathod LinkedIn Profile"
                                    >
                                        <FiLinkedin className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="https://github.com/Roshannnn7"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-700 dark:text-slate-300 hover:text-violet-600 transition-colors shadow-sm"
                                        aria-label="Roshan Rathod GitHub Profile"
                                    >
                                        <FiGithub className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/_roshannnn_07"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-700 dark:text-slate-300 hover:text-violet-600 transition-colors shadow-sm"
                                        aria-label="Roshan Rathod Instagram Profile"
                                    >
                                        <FiInstagram className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                        Ready to Build Your Next Big Project?
                    </h2>
                    <p className="text-violet-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
                        Join hundreds of students and mentors collaborating on active project squads today.
                    </p>
                    {!isAuthenticated ? (
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-extrabold text-lg rounded-xl shadow-xl hover:bg-slate-100 transition-all hover:scale-105"
                            aria-label="Create Free Account"
                        >
                            <span>Create Free Account</span>
                            <FiArrowRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <Link
                            href={getDashboardHref()}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-extrabold text-lg rounded-xl shadow-xl hover:bg-slate-100 transition-all hover:scale-105"
                            aria-label="Go to Dashboard"
                        >
                            <span>Go to Dashboard</span>
                            <FiArrowRight className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-16 border-t border-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        <div>
                            <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent block mb-4">
                                SquadUp
                            </span>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Empowering students and mentors through collaborative projects, agile check-ins, and verified skill growth.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/squads" className="hover:text-white transition-colors">Browse Squads</Link></li>
                                <li><Link href="/mentors" className="hover:text-white transition-colors">Find Mentors</Link></li>
                                <li><Link href="/leaderboard" className="hover:text-white transition-colors">XP Leaderboard</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Support</h4>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Connect</h4>
                            <div className="flex items-center gap-3">
                                <a href="https://github.com/Roshannnn7" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-slate-300 hover:text-white transition-colors" aria-label="GitHub">
                                    <FiGithub className="w-5 h-5" />
                                </a>
                                <a href="https://www.linkedin.com/in/roshan-rathod-38736b259" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-slate-300 hover:text-white transition-colors" aria-label="LinkedIn">
                                    <FiLinkedin className="w-5 h-5" />
                                </a>
                                <a href="https://www.instagram.com/_roshannnn_07" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-slate-300 hover:text-white transition-colors" aria-label="Instagram">
                                    <FiInstagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-900 text-center text-xs text-slate-500">
                        <p>&copy; {new Date().getFullYear()} SquadUp. Built with modern web standards and accessibility.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

