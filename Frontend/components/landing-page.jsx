'use client';

import { motion } from 'framer-motion';
import { FiUsers, FiVideo, FiCalendar, FiMessageSquare, FiGitMerge, FiStar } from 'react-icons/fi';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

const features = [
    {
        icon: <FiUsers className="w-8 h-8" />,
        title: 'Collaborative Projects',
        description: 'Join or create project squads with students sharing similar interests and skills.',
    },
    {
        icon: <FiVideo className="w-8 h-8" />,
        title: 'Real-time Video Calls',
        description: 'Connect instantly with team members and mentors through high-quality video calls.',
    },
    {
        icon: <FiCalendar className="w-8 h-8" />,
        title: 'Mentor Booking',
        description: 'Book sessions with experienced mentors who can guide your learning journey.',
    },
    {
        icon: <FiMessageSquare className="w-8 h-8" />,
        title: 'Team Chat',
        description: 'Communicate seamlessly with your squad through integrated chat rooms.',
    },
    {
        icon: <FiGitMerge className="w-8 h-8" />,
        title: 'GitHub Integration',
        description: 'Sync your projects with GitHub repositories for efficient collaboration.',
    },
    {
        icon: <FiStar className="w-8 h-8" />,
        title: 'Skill Development',
        description: 'Enhance your skills through practical projects and mentor guidance.',
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
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            A complete platform for collaborative learning and mentorship
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glassmorphism p-8 rounded-2xl"
                            >
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
