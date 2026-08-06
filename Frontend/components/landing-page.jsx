'use client';

import { motion } from 'framer-motion';
import { FiUsers, FiVideo, FiCalendar, FiMessageSquare, FiGitMerge, FiStar, FiInstagram, FiLinkedin, FiGithub, FiTrendingUp, FiZap, FiMap, FiMic } from 'react-icons/fi';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

const features = [
    {
        icon: <FiUsers className="w-8 h-8" />,
        title: 'Collaborative Squads',
        description: 'Join or create project squads with students sharing similar skills. AI-powered matching finds your best fit.',
        badge: null,
    },
    {
        icon: <FiTrendingUp className="w-8 h-8" />,
        title: 'Leaderboard & XP System',
        description: 'Earn XP points for every action — coding, standups, challenges. Climb the ranked leaderboard.',
        badge: '🆕 New',
    },
    {
        icon: <span className="w-8 h-8 text-2xl flex items-center">📋</span>,
        title: 'Daily Stand-up Bot',
        description: 'Agile-style daily check-ins for your squad. Track blockers, share progress, build accountability.',
        badge: '🆕 New',
    },
    {
        icon: <span className="w-8 h-8 text-2xl flex items-center">🧪</span>,
        title: 'Squad Skill Lab',
        description: 'Post mini-challenges inside your squad. Members submit solutions, vote on the best, and earn XP.',
        badge: '🆕 New',
    },
    {
        icon: <span className="w-8 h-8 text-2xl flex items-center">📊</span>,
        title: 'Student Portfolio Builder',
        description: 'Get an auto-generated, shareable portfolio page showcasing your projects, badges, and skills.',
        badge: '🆕 New',
    },
    {
        icon: <FiMap className="w-8 h-8" />,
        title: 'Squad Roadmap Builder',
        description: 'Visual milestone timeline for your project. Plan, track, and celebrate progress like a real team.',
        badge: '🆕 New',
    },
    {
        icon: <FiVideo className="w-8 h-8" />,
        title: 'Real-time Video Calls',
        description: 'Connect instantly with team members and mentors through high-quality video calls.',
        badge: null,
    },
    {
        icon: <FiCalendar className="w-8 h-8" />,
        title: 'Mentor Booking',
        description: 'Book sessions with experienced mentors who can guide your learning journey.',
        badge: null,
    },
    {
        icon: <FiMic className="w-8 h-8" />,
        title: 'Voice Notes in Chat',
        description: 'Record and send 60-second voice messages in squad chat for faster async communication.',
        badge: '🆕 New',
    },
    {
        icon: <FiMessageSquare className="w-8 h-8" />,
        title: 'Team Chat',
        description: 'Communicate seamlessly with your squad through integrated chat rooms with reactions and threads.',
        badge: null,
    },
    {
        icon: <FiGitMerge className="w-8 h-8" />,
        title: 'GitHub Integration',
        description: 'Sync your projects with GitHub repositories for efficient collaboration.',
        badge: null,
    },
    {
        icon: <FiZap className="w-8 h-8" />,
        title: 'Skill Development',
        description: 'Enhance your skills through practical projects, mentor guidance, and squad challenges.',
        badge: null,
    },
];

const testimonials = [
    {
        name: 'Alex Johnson',
        role: 'Computer Science Student',
        content: 'SquadUp helped me build my portfolio with real projects and connect with amazing mentors.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    {
        name: 'Sarah Chen',
        role: 'Software Engineer Mentor',
        content: 'A fantastic platform to share knowledge and guide the next generation of developers.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
        name: 'Michael Rodriguez',
        role: 'Project Squad Leader',
        content: 'The collaboration tools made managing our team project smooth and efficient.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    },
];

export default function LandingPage() {
    const { isAuthenticated, user } = useAuth();

    const getDashboardHref = () => {
        if (!user || !user.role) return '/dashboard';
        return `/dashboard/${user.role}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="gradient-text">Collaborate. Learn.</span>
                            <br />
                            <span className="text-gray-900 dark:text-white">Build Together</span>
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
                            SquadUp connects students with mentors and peers to collaborate on real projects,
                            develop skills, and build an impressive portfolio.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!isAuthenticated ? (
                                <>
                                    <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
                                        Get Started Free
                                    </Link>
                                    <Link href="/auth/login" className="btn-secondary text-lg px-8 py-4">
                                        Sign In
                                    </Link>
                                </>
                            ) : (
                                <Link href={getDashboardHref()} className="btn-primary text-lg px-8 py-4">
                                    Go to Dashboard
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            12 Features Built for Students
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            From AI squad matching to daily standups — a complete student collaboration OS
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: (index % 6) * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glassmorphism p-8 rounded-2xl relative overflow-hidden"
                            >
                                {feature.badge && (
                                    <span className="absolute top-4 right-4 text-xs font-bold bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full">
                                        {feature.badge}
                                    </span>
                                )}
                                <div className="text-primary-600 dark:text-primary-400 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Loved by Students & Mentors
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Join thousands who are already building their future
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="glassmorphism p-8 rounded-2xl"
                            >
                                <div className="flex items-center mb-6">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                    "{testimonial.content}"
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-xl text-primary-100 mb-10">
                            Join thousands of students and mentors building the future together
                        </p>

                        {!isAuthenticated ? (
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-bold rounded-lg 
                         hover:bg-gray-100 transition-all duration-300 text-lg"
                            >
                                Create Free Account
                            </Link>
                        ) : (
                            <Link
                                href={getDashboardHref()}
                                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-bold rounded-lg 
                         hover:bg-gray-100 transition-all duration-300 text-lg"
                            >
                                Go to Dashboard
                            </Link>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Meet the Creator Section */}
            <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-12 glassmorphism p-8 md:p-16 rounded-[40px] border border-gray-100 dark:border-gray-800">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                            <img
                                src="/assets/roshan-profile.jpg"
                                alt="Roshan Rathod"
                                className="relative w-48 h-48 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl object-cover"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meet the Creator</h2>
                            <p className="text-primary-600 dark:text-primary-400 font-bold mb-4">Roshan Rathod | BCA Student</p>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                                "SquadUp started as a simple idea to help my fellow students find the right collaborators.
                                Today, it's a mission to empower every aspiring developer with the tools and mentorship they need to succeed."
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
                                <Link href="/about" className="btn-secondary py-3 px-8 flex items-center gap-2 group whitespace-nowrap">
                                    <span>About Me</span>
                                    <FiStar className="group-hover:text-yellow-400 transition-colors" />
                                </Link>
                                <div className="flex items-center gap-4">
                                    <motion.a
                                        href="https://www.instagram.com/_roshannnn_07?igsh=emN4MG8yM2JudnZ0"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 bg-gradient-to-tr from-yellow-400 to-purple-600 text-white rounded-full shadow-lg hover:shadow-purple-500/30 transition-shadow"
                                    >
                                        <FiInstagram className="w-5 h-5" />
                                    </motion.a>
                                    <motion.a
                                        href="https://www.linkedin.com/in/roshan-rathod-38736b259?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.2, rotate: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 bg-[#0077b5] text-white rounded-full shadow-lg hover:shadow-blue-500/30 transition-shadow"
                                    >
                                        <FiLinkedin className="w-5 h-5" />
                                    </motion.a>
                                    <motion.a
                                        href="https://github.com/Roshannnn7"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 bg-[#333] text-white rounded-full shadow-lg hover:shadow-gray-500/30 transition-shadow"
                                    >
                                        <FiGithub className="w-5 h-5" />
                                    </motion.a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold gradient-text mb-4">SquadUp</h3>
                            <p className="text-gray-400">
                                Empowering students through collaboration and mentorship.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
                                <li><Link href="/features" className="text-gray-400 hover:text-white">Features</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Connect</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="text-gray-400 hover:text-white">Twitter</Link></li>
                                <li><Link href="#" className="text-gray-400 hover:text-white">LinkedIn</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} SquadUp. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
