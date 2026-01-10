'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { FiInstagram, FiLinkedin, FiGithub, FiExternalLink, FiCode, FiUser, FiCpu } from 'react-icons/fi';
import Image from 'next/image';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <Navbar />

            <main className="relative pt-24 pb-20">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <motion.div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Hero Section */}
                    <motion.div variants={itemVariants} className="text-center mb-20">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                            About <span className="gradient-text">SquadUp</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            SquadUp is a visionary platform designed to bridge the gap between ambitious students and industry experts.
                            We believe in the power of collaboration and mentorship to shape the future of technology.
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                        {[
                            {
                                icon: <FiUsers className="w-8 h-8" />,
                                title: "Collaboration",
                                description: "Form squads and work on real-world projects with like-minded peers."
                            },
                            {
                                icon: <FiCpu className="w-8 h-8" />,
                                title: "Mentorship",
                                description: "Get guidance from verified industry professionals to accelerate your career."
                            },
                            {
                                icon: <FiCode className="w-8 h-8" />,
                                title: "Growth",
                                description: "Build your portfolio, learn new technologies, and stand out in the job market."
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-500 group"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-500/20">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Creator Section */}
                    <motion.div
                        variants={itemVariants}
                        className="relative glassmorphism rounded-[40px] overflow-hidden p-8 md:p-16 border border-gray-100 dark:border-gray-800"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            {/* Avatar/Image */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                                    <Image
                                        src="/assets/roshan-profile.jpg"
                                        alt="Roshan Rathod"
                                        layout="fill"
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h2 className="text-4xl font-black mb-2 text-gray-900 dark:text-white">Roshan Rathod</h2>
                                    <p className="text-primary-600 dark:text-primary-400 font-bold text-lg mb-6 flex items-center justify-center md:justify-start gap-2">
                                        <FiBookOpen className="w-5 h-5" />
                                        BCA Student & Visionary Founder
                                    </p>
                                    <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                        <p>
                                            Hi, I’m <strong>Roshan Rathod</strong>, a passionate web developer and tech enthusiast
                                            who loves building practical, user-friendly digital products. I enjoy turning ideas into
                                            real-world applications using modern web technologies.
                                        </p>
                                        <p>
                                            I’m constantly learning and experimenting with full-stack development, focusing on
                                            creating scalable, secure, and efficient web platforms. From designing clean user
                                            interfaces to implementing backend logic, I believe in building solutions that actually
                                            solve problems.
                                        </p>
                                        <p className="hidden md:block">
                                            My projects reflect my curiosity, creativity, and commitment to improvement.
                                            I’m especially interested in community-driven platforms, automation, and innovative
                                            web solutions that empower users.
                                        </p>
                                        <p className="font-bold gradient-text">🚀 Always learning. Always building.</p>
                                    </div>

                                    {/* Social Links */}
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                        <a
                                            href="https://www.instagram.com/_roshannnn_07?igsh=emN4MG8yM2JudnZ0"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary py-3 px-6 flex items-center gap-2 group"
                                        >
                                            <FiInstagram className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                            Instagram
                                        </a>
                                        <a
                                            href="https://www.linkedin.com/in/roshan-rathod-38736b259?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary py-3 px-6 flex items-center gap-2 group"
                                        >
                                            <FiLinkedin className="w-5 h-5 group-hover:-translate-y-1 transition-transform text-blue-600" />
                                            LinkedIn
                                        </a>
                                        <a
                                            href="https://github.com/Roshannnn7"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary py-3 px-6 flex items-center gap-2 group"
                                        >
                                            <FiGithub className="w-5 h-5 group-hover:rotate-12 transition-transform text-gray-900 dark:text-white" />
                                            GitHub
                                        </a>
                                    </div>
                                </motion.div>
                            </div>

                            {/* QR Code Section */}
                            <motion.div
                                className="w-48 text-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div className="p-3 bg-white rounded-2xl shadow-xl mb-4 border border-gray-100">
                                    <img
                                        src="/assets/insta-qr.jpg"
                                        alt="Instagram QR"
                                        className="w-full h-auto rounded-lg"
                                    />
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Scan to Connect</p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Call to Action */}
                    <motion.div variants={itemVariants} className="mt-32 text-center pb-20">
                        <div className="glassmorphism p-12 rounded-[50px] relative overflow-hidden border border-gray-100 dark:border-gray-800">
                            <div className="relative z-10">
                                <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white italic">"Building the future, together."</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg">
                                    Join thousands of students and mentors who are already part of the SquadUp revolution.
                                </p>
                                <button className="btn-primary py-4 px-10 text-lg shadow-2xl shadow-primary-500/40 hover:scale-105 transition-transform active:scale-95">
                                    Start Your Journey
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}

// Re-using these icons from react-icons/fi
import { FiUsers, FiBookOpen } from 'react-icons/fi';
