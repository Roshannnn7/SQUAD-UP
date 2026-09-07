'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { FiUsers, FiZap, FiArrowRight, FiTarget, FiGrid } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

function MatchBadge({ score }) {
    const color = score >= 60 ? 'from-emerald-500 to-green-400' : score >= 30 ? 'from-amber-500 to-yellow-400' : 'from-gray-600 to-gray-500';
    return (
        <div className={`bg-gradient-to-r ${color} text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1`}>
            <FiTarget className="w-3 h-3" />
            {score}% Match
        </div>
    );
}

export default function RecommendationsPage() {
    const { user } = useAuth();
    const [squads, setSquads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/explore/recommended-squads');
            setSquads(res.data);
        } catch (error) {
            console.error('Recommendations error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl flex items-center justify-center">
                            <BsStars className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-violet-400 uppercase tracking-wider">Personalized For You</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Recommended Squads</h1>
                    <p className="text-gray-400">Based on your skills ({user?.skills?.slice(0, 3).join(', ') || 'add skills in profile'}) and interests</p>
                </div>

                {/* Profile tips if no skills */}
                {user && (!user.skills?.length && !user.interests?.length) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5 mb-8 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-violet-300 font-bold">Improve your recommendations!</p>
                            <p className="text-gray-400 text-sm mt-1">Add skills and interests to your profile for better squad matches.</p>
                        </div>
                        <Link href="/profile" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all whitespace-nowrap ml-4">
                            Update Profile
                        </Link>
                    </motion.div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-56 bg-white/5 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : squads.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                        <FiGrid className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-xl font-bold text-white mb-2">No recommendations yet</p>
                        <p className="text-gray-400 mb-6">Add skills and interests to your profile to get personalized squad matches.</p>
                        <Link href="/squads" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2">
                            Browse All Squads <FiArrowRight />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {squads.map((squad, i) => (
                            <motion.div
                                key={squad._id}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <Link href={`/squads/${squad._id}`}>
                                    <div className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-3xl p-6 transition-all group cursor-pointer h-full">
                                        {/* Match badge */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-violet-600/30 flex-shrink-0">
                                                {squad.name?.[0]?.toUpperCase()}
                                            </div>
                                            <MatchBadge score={squad.matchScore || 0} />
                                        </div>

                                        <h3 className="text-white font-bold text-lg group-hover:text-violet-400 transition-colors mb-1">{squad.name}</h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{squad.description}</p>

                                        {/* Matched skills */}
                                        {squad.matchedSkills?.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Why it matches</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {squad.matchedSkills.map(skill => (
                                                        <span key={skill} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                                                            <FiZap className="w-2.5 h-2.5" />{skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" />{squad.memberCount} members</span>
                                            <span className="capitalize">{squad.category?.replace('_', '/')}</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
