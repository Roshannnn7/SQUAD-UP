'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import Link from 'next/link';
import {
    FiGithub, FiLinkedin, FiGlobe, FiTwitter, FiMapPin,
    FiStar, FiUsers, FiAward, FiZap, FiExternalLink, FiShare2
} from 'react-icons/fi';
import { BsFire } from 'react-icons/bs';

const LEVEL_TITLES = {
    1: 'Beginner', 4: 'Intermediate', 7: 'Advanced', 10: 'Expert', 15: 'Master', 20: 'Legend'
};

const getLevelTitle = (level) => {
    const levels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
    for (const l of levels) {
        if (level >= l) return LEVEL_TITLES[l];
    }
    return 'Beginner';
};

const STATUS_COLORS = {
    'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
    'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'planning': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'on-hold': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function PortfolioPage({ params }) {
    const { userId } = params;
    const [profileData, setProfileData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchPortfolio();
    }, [userId]);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const [profileRes, projectsRes] = await Promise.all([
                api.get(`/profiles/${userId}`).catch(() => ({ data: null })),
                api.get(`/projects?creator=${userId}`).catch(() => ({ data: { projects: [] } })),
            ]);
            setProfileData(profileRes.data);
            setProjects(projectsRes.data?.projects || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyPortfolioLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 pt-32 space-y-6">
                    <div className="h-64 bg-white/5 animate-pulse rounded-3xl" />
                    <div className="h-48 bg-white/5 animate-pulse rounded-3xl" />
                    <div className="h-48 bg-white/5 animate-pulse rounded-3xl" />
                </div>
            </div>
        );
    }

    const user = profileData?.user || profileData;
    const studentProfile = profileData?.studentProfile;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            {/* Cover Photo */}
            <div className="relative h-64 w-full mt-16 overflow-hidden">
                {user?.coverPhoto ? (
                    <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />

                {/* Share Button */}
                <button
                    onClick={copyPortfolioLink}
                    className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                >
                    <FiShare2 className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Share Portfolio'}
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 -mt-24 relative">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 mb-6"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                                alt={user?.fullName}
                                className="w-28 h-28 rounded-2xl border-4 border-violet-500 shadow-2xl shadow-violet-500/30 object-cover"
                            />
                            {/* Online status */}
                            {user?.status === 'online' && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-gray-950 rounded-full" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-white">{user?.fullName}</h1>
                                {/* Level badge */}
                                <span className="bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold px-3 py-1 rounded-full">
                                    Lv.{user?.level || 1} · {getLevelTitle(user?.level || 1)}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{user?.headline || 'Student Developer'}</p>

                            {/* Location */}
                            {user?.location?.city && (
                                <p className="text-gray-500 text-xs flex items-center gap-1 mb-4">
                                    <FiMapPin className="w-3 h-3" />
                                    {[user.location.city, user.location.country].filter(Boolean).join(', ')}
                                </p>
                            )}

                            {/* Social Links */}
                            <div className="flex items-center gap-3">
                                {user?.socialLinks?.github && (
                                    <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                        <FiGithub className="w-4 h-4" />
                                    </a>
                                )}
                                {user?.socialLinks?.linkedin && (
                                    <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-all">
                                        <FiLinkedin className="w-4 h-4" />
                                    </a>
                                )}
                                {user?.socialLinks?.twitter && (
                                    <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-xl transition-all">
                                        <FiTwitter className="w-4 h-4" />
                                    </a>
                                )}
                                {user?.socialLinks?.portfolio && (
                                    <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-all">
                                        <FiGlobe className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 md:text-right">
                            <div className="text-center">
                                <p className="text-2xl font-black text-white">{user?.points?.toLocaleString() || 0}</p>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">XP</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <BsFire className="text-orange-400" />
                                    <p className="text-2xl font-black text-orange-400">{user?.streak?.current || 0}</p>
                                </div>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Streak</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-violet-400">{user?.badges?.length || 0}</p>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Badges</p>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {user?.bio && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                        </div>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Skills */}
                        {user?.skills?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-6"
                            >
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill) => (
                                        <span key={skill}
                                            className="bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Badges */}
                        {user?.badges?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-6"
                            >
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FiAward className="text-yellow-400" /> Badges
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {user.badges.map((badge, i) => (
                                        <div key={i} title={badge.name}
                                            className="bg-white/5 rounded-2xl p-3 text-center group hover:scale-110 transition-transform cursor-default">
                                            <div className="text-2xl mb-1">{badge.icon || '🏅'}</div>
                                            <p className="text-[10px] text-gray-400 truncate">{badge.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Education */}
                        {studentProfile?.institution && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-6"
                            >
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Education</h3>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl flex-shrink-0">🎓</div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{studentProfile.institution}</p>
                                        <p className="text-gray-400 text-xs">{studentProfile.course || studentProfile.fieldOfStudy}</p>
                                        <p className="text-gray-500 text-xs">{studentProfile.graduationYear}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column — Projects */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiUsers className="text-violet-400" /> Projects & Squads
                            </h3>

                            {projects.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
                                    <div className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <FiUsers className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-400">No public projects yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {projects.map((project, i) => (
                                        <motion.div
                                            key={project._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            className="bg-white/5 border border-white/10 hover:border-violet-500/30 rounded-3xl p-6 transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <Link href={`/squads/${project._id}`}>
                                                        <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors flex items-center gap-2">
                                                            {project.name}
                                                            <FiExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </h4>
                                                    </Link>
                                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                                                </div>
                                                <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[project.status] || STATUS_COLORS['planning']}`}>
                                                    {project.status}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {project.skillsRequired?.slice(0, 4).map((skill) => (
                                                    <span key={skill} className="bg-white/5 text-gray-400 text-xs px-2 py-1 rounded-lg">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Progress */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Progress</span>
                                                    <span className="text-violet-400 font-bold">{project.progress}%</span>
                                                </div>
                                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* GitHub */}
                                            {project.githubRepo && (
                                                <a href={project.githubRepo} target="_blank" rel="noopener noreferrer"
                                                    className="mt-3 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                                                    <FiGithub className="w-3 h-3" />
                                                    View on GitHub
                                                </a>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
