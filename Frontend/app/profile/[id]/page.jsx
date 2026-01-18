'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ConnectionButton from '@/components/ConnectionButton';
import PostCard from '@/components/PostCard';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiBriefcase, FiBook, FiAward, FiMessageCircle, FiEdit3, FiGlobe, FiGithub, FiLinkedin, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/profiles/${id}`);
                setProfile(res.data.data);
            } catch (error) {
                console.error('Fetch profile error:', error);
                toast.error(error.response?.data?.message || 'Failed to load profile');
                if (error.response?.status === 404) router.push('/directory');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfile();
    }, [id]);

    const handleSendMessage = () => {
        router.push(`/messages?userId=${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <Navbar />

            {/* Header / Banner Area */}
            <div className="relative pt-16">
                <div className="h-64 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 w-full" />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-24 mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            <motion.img
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={profile.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`}
                                className="w-40 h-40 rounded-3xl object-cover border-8 border-white dark:border-gray-900 shadow-2xl relative z-10"
                                alt=""
                            />
                            <div className="pb-4 z-10">
                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl font-extrabold text-gray-900 dark:text-white"
                                >
                                    {profile.fullName}
                                </motion.h1>
                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">{profile.headline || 'Student'}</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500 font-medium">
                                    {profile.location && (
                                        <span className="flex items-center gap-1"><FiMapPin /> {profile.location.city}, {profile.location.country}</span>
                                    )}
                                    <span className="flex items-center gap-1"><FiBriefcase /> {profile.roleProfile?.college || 'Student'}</span>
                                    <button className="text-primary-600 hover:underline font-bold">{profile.connectionCount || 0} connections</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 pb-4 z-10">
                            {profile.isOwnProfile ? (
                                <button onClick={() => router.push('/profile')} className="btn-primary py-3 px-8 flex items-center gap-2 font-bold shadow-lg shadow-primary-500/20">
                                    <FiEdit3 /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <ConnectionButton userId={profile._id} initialStatus={profile.connectionStatus} />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold group"
                                    >
                                        <FiMessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Bio / About */}
                        <div className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-50 dark:border-gray-800 pb-4">About</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                                {profile.bio || 'This student hasn\'t added a bio yet.'}
                            </p>
                        </div>

                        {/* Social / Contact */}
                        <div className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-50 dark:border-gray-800 pb-4">Contact & Links</h3>
                            <div className="space-y-4">
                                {profile.email && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <FiMail className="text-primary-500" /> <span>{profile.email}</span>
                                    </div>
                                )}
                                {profile.socialLinks?.github && (
                                    <a href={profile.socialLinks.github} target="_blank" className="flex items-center justify-between group p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <FiGithub /> GitHub
                                        </div>
                                        <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                )}
                                {profile.socialLinks?.linkedin && (
                                    <a href={profile.socialLinks.linkedin} target="_blank" className="flex items-center justify-between group p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <FiLinkedin /> LinkedIn
                                        </div>
                                        <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                )}
                                {profile.socialLinks?.portfolio && (
                                    <a href={profile.socialLinks.portfolio} target="_blank" className="flex items-center justify-between group p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <FiGlobe /> Portfolio
                                        </div>
                                        <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                )}
                                {!profile.socialLinks && (
                                    <p className="text-xs text-gray-500 text-center italic">No social links added</p>
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-50 dark:border-gray-800 pb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map(skill => (
                                    <span key={skill} className="bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-xs font-bold border border-primary-100 dark:border-primary-800">
                                        {skill}
                                    </span>
                                ))}
                                {!profile.skills?.length && <p className="text-xs text-gray-500 italic">No skills listed</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Work, Education, Posts */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Experience Section */}
                        <div className="glassmorphism p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <FiBriefcase className="text-primary-500" /> Experience
                            </h3>
                            <div className="space-y-8 relative">
                                {profile.experiences?.length > 0 ? profile.experiences.map((exp, idx) => (
                                    <div key={exp._id} className="relative pl-8 group">
                                        {/* Timeline Line */}
                                        {idx !== profile.experiences.length - 1 && (
                                            <div className="absolute left-0 top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
                                        )}
                                        {/* Dot */}
                                        <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-50 dark:ring-primary-900/20 group-hover:scale-125 transition-transform" />

                                        <div>
                                            <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{exp.title}</h4>
                                            <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-bold mt-1">
                                                <span>{exp.company}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-500 font-medium">{exp.type}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                            </p>
                                            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {exp.description}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 italic">No professional experience added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="glassmorphism p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <FiBook className="text-secondary-500" /> Education
                            </h3>
                            <div className="space-y-8">
                                {profile.education?.length > 0 ? profile.education.map(edu => (
                                    <div key={edu._id} className="flex gap-6">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700 flex-shrink-0">
                                            <FiAward className="w-8 h-8 text-secondary-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{edu.school}</h4>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">{edu.degree}, {edu.field}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Current' : new Date(edu.endDate).getFullYear()}
                                            </p>
                                            {edu.grade && <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">Grade: {edu.grade}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 italic">Educational background hasn't been listed yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Posts Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-2 px-2">
                                Recent Activity
                            </h3>
                            {profile.recentPosts?.length > 0 ? profile.recentPosts.map(post => (
                                <PostCard key={post._id} post={{ ...post, author: profile }} />
                            )) : (
                                <div className="glassmorphism p-12 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                                    <p className="text-sm text-gray-500 italic">No recent posts to display.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
