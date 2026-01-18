'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ConnectionButton from '@/components/ConnectionButton';
import PostCard from '@/components/PostCard';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMail, FiMapPin, FiBriefcase, FiBook, FiAward, FiMessageCircle, FiEdit3,
    FiGlobe, FiGithub, FiLinkedin, FiExternalLink, FiSend, FiZap, FiHeart, FiGrid, FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [connectionStatus, setConnectionStatus] = useState('none');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/profiles/${id}`);
                setProfile(res.data.data);

                // Fetch connection status explicitly
                const connRes = await api.get(`/connections/status/${id}`);
                setConnectionStatus(connRes.data.data.status);
            } catch (error) {
                console.error('Fetch profile error:', error);
                toast.error('Failed to load profile');
                if (error.response?.status === 404) router.push('/directory');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfile();
    }, [id, router]);

    const handleSendMessage = () => {
        // Navigate to messages with user ID as dynamic route
        router.push(`/messages/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent animate-spin rounded-full shadow-2xl shadow-primary-500/20" />
                <p className="font-black text-xs uppercase tracking-widest text-primary-600 animate-pulse">Scanning Squad Net...</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 pb-20">
            <Navbar />

            {/* Banner with squad aesthetic */}
            <div className="relative pt-16">
                <div className="h-72 bg-gradient-to-br from-primary-600 via-secondary-600 to-purple-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
                    {/* Floating Particles/Shapes */}
                    <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-bounce" />
                    <div className="absolute bottom-10 left-20 w-48 h-48 bg-primary-400/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto px-4 relative">
                    <div className="-mt-36 glassmorphism rounded-[3rem] p-10 border border-white/20 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-10 text-center md:text-left">
                            {/* Profile Image - Squircle */}
                            <motion.img
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={profile.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`}
                                className="w-44 h-44 rounded-[3rem] object-cover border-8 border-white dark:border-gray-900 shadow-2xl relative z-20 group hover:rotate-6 transition-transform cursor-pointer"
                                alt={profile.fullName}
                            />

                            <div className="flex-1 pb-4 relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                        {profile.fullName}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                                        <span className="px-4 py-1.5 glassmorphism rounded-xl text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest outline outline-1 outline-primary-500/20">
                                            {profile.headline || 'Squad Member'}
                                        </span>
                                        {profile.location && (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <FiMapPin /> {profile.location.city}
                                            </span>
                                        )}
                                        <span className="text-xs font-bold text-gray-400 ml-2">
                                            {profile.connectionCount || 0} Connected Members
                                        </span>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Actions Area */}
                            <div className="flex flex-col sm:flex-row gap-4 pb-4">
                                {(profile.isOwnProfile || user?.role === 'admin') ? (
                                    <button
                                        onClick={() => router.push(`/profile${profile.isOwnProfile ? '' : `?userId=${id}`}`)}
                                        className="btn-primary py-3 px-10 rounded-2xl flex items-center gap-2 font-black shadow-2xl shadow-primary-500/30 group"
                                    >
                                        <FiEdit3 className="group-hover:rotate-12 transition-transform" /> {profile.isOwnProfile ? 'Edit Identity' : 'Admin: Edit User'}
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <ConnectionButton userId={profile._id} initialStatus={connectionStatus} onStatusChange={(newStatus) => setConnectionStatus(newStatus)} />

                                        {/* Direct Message Button - Only if connected */}
                                        {connectionStatus === 'accepted' ? (
                                            <button
                                                onClick={handleSendMessage}
                                                className="btn-secondary py-3 px-8 rounded-2xl flex items-center gap-3 font-black shadow-xl shadow-secondary-500/20 group animate-in fade-in slide-in-from-right-4 duration-500"
                                            >
                                                <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                <span>Personal Message</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => toast.error('You need to be connected to send a personal message!')}
                                                className="p-4 glassmorphism rounded-2xl text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-800"
                                                title="Connect to message"
                                            >
                                                <FiMessageCircle className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Information Sideline */}
                <div className="lg:col-span-1 space-y-10">
                    {/* Vibe / Bio */}
                    <div className="glassmorphism p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors" />
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Bio & Vision</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed italic">
                            "{profile.bio || 'Silence speaks louder than words. This member is currently heads-down building something cool.'}"
                        </p>
                    </div>

                    {/* Links Card */}
                    <div className="glassmorphism p-8 rounded-[2.5rem]">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Digital Identity</h3>
                        <div className="space-y-4">
                            {profile.socialLinks?.github && (
                                <a href={profile.socialLinks.github} target="_blank" className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/20 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all border border-transparent hover:border-primary-500/20">
                                    <div className="flex items-center gap-3 font-black text-sm"><FiGithub /> CODEBASE</div>
                                    <FiExternalLink />
                                </a>
                            )}
                            {profile.socialLinks?.linkedin && (
                                <a href={profile.socialLinks.linkedin} target="_blank" className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/20 rounded-2xl hover:bg-secondary-50 dark:hover:bg-secondary-900/10 transition-all border border-transparent hover:border-secondary-500/20">
                                    <div className="flex items-center gap-3 font-black text-sm"><FiLinkedin /> CAREER</div>
                                    <FiExternalLink />
                                </a>
                            )}
                            {profile.socialLinks?.portfolio && (
                                <a href={profile.socialLinks.portfolio} target="_blank" className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/20 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all border border-transparent hover:border-purple-500/20">
                                    <div className="flex items-center gap-3 font-black text-sm"><FiGlobe /> UNIVERSE</div>
                                    <FiExternalLink />
                                </a>
                            )}
                            {!profile.socialLinks && <p className="text-xs text-center text-gray-400 font-bold py-4">Identity only exists on SQUAD UP</p>}
                        </div>
                    </div>

                    {/* Skills Cloud */}
                    <div className="glassmorphism p-8 rounded-[2.5rem]">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Mastery</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.map(skill => (
                                <button key={skill} className="px-4 py-2 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:text-primary-600 hover:border-primary-500/50 transition-all">
                                    {skill}
                                </button>
                            ))}
                            {!profile.skills?.length && <p className="text-[10px] text-gray-400 font-bold">Still acquiring new powerups.</p>}
                        </div>
                    </div>
                </div>

                {/* Main Activity Area */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Experience Journey */}
                    <div className="glassmorphism p-10 rounded-[3rem] border border-white/20">
                        <h3 className="text-xl font-black mb-10 flex items-center gap-4">
                            <span className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary-500/20"><FiBriefcase /></span>
                            Professional Journey
                        </h3>
                        <div className="space-y-12 relative">
                            {profile.experiences?.length > 0 ? profile.experiences.map((exp, idx) => (
                                <div key={exp._id} className="relative pl-12 group">
                                    {idx !== profile.experiences.length - 1 && <div className="absolute left-[19px] top-10 bottom-[-48px] w-1 bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-200 transition-colors" />}
                                    <div className="absolute left-0 top-1 w-10 h-10 rounded-2xl glassmorphism border-2 border-primary-500 flex items-center justify-center font-black text-primary-600 bg-white group-hover:scale-110 transition-transform">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black">{exp.title}</h4>
                                        <div className="flex items-center gap-3 text-sm font-bold text-primary-600 mt-2">
                                            <span>{exp.company}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                            <span className="text-gray-400 uppercase tracking-tighter">{exp.type}</span>
                                        </div>
                                        <p className="mt-4 text-sm text-gray-500 leading-relaxed font-bold">
                                            {exp.description}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 font-black py-10 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">Fresh talent. No logs added.</p>
                            )}
                        </div>
                    </div>

                    {/* Tabbed Activity Section */}
                    <div className="space-y-8">
                        <div className="flex gap-4 p-1.5 glassmorphism rounded-[2rem] w-fit">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'posts' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-500 hover:bg-white/10'}`}
                            >
                                <FiGrid className="inline mr-2" /> Activity
                            </button>
                            {profile.mutualSquads?.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('mutual')}
                                    className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'mutual' ? 'bg-secondary-600 text-white shadow-lg shadow-secondary-500/30' : 'text-gray-500 hover:bg-white/10'}`}
                                >
                                    <FiUsers className="inline mr-2" /> Mutual Squads ({profile.mutualSquads.length})
                                </button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'posts' && (
                                <motion.div
                                    key="posts"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    {profile.recentPosts?.length > 0 ? (
                                        profile.recentPosts.map(post => (
                                            <PostCard key={post._id} post={{ ...post, author: profile }} />
                                        ))
                                    ) : (
                                        <div className="p-20 glassmorphism rounded-[3rem] text-center border-2 border-dashed border-primary-500/20">
                                            <FiGrid className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                                            <h4 className="text-xl font-black text-gray-300">Quiet for now. Send a wave!</h4>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'mutual' && (
                                <motion.div
                                    key="mutual"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {profile.mutualSquads?.map(squad => (
                                        <div key={squad._id} onClick={() => router.push(`/squads/${squad._id}`)} className="glassmorphism p-6 rounded-[2.5rem] hover:scale-105 transition-transform group cursor-pointer border border-transparent hover:border-secondary-500/30">
                                            <div className="w-12 h-12 bg-secondary-500/10 rounded-2xl flex items-center justify-center text-secondary-600 text-xl mb-4 group-hover:rotate-6 transition-transform">
                                                <FiUsers />
                                            </div>
                                            <h4 className="font-black text-lg">{squad.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{squad.category} • {squad.status}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
