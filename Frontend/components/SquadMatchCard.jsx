'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { FiUsers, FiArrowRight, FiZap, FiStar, FiRefreshCw } from 'react-icons/fi';

/**
 * SquadMatchCard Component
 * Shows AI-matched squad recommendations based on user's skills and interests.
 * Uses server-side skill intersection scoring — no external AI API needed.
 */
export default function SquadMatchCard() {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            // Fetch public squads and score them client-side
            const [squadsRes, myProjectsRes] = await Promise.all([
                api.get('/projects?limit=50'),
                api.get('/projects/my'),
            ]);

            const allSquads = squadsRes.data?.projects || [];
            const myProjectIds = new Set((myProjectsRes.data || []).map((p) => p._id));

            const userSkills = new Set([
                ...(user?.skills || []).map((s) => s.toLowerCase()),
                ...(user?.interests || []).map((s) => s.toLowerCase()),
            ]);

            // Score each squad
            const scored = allSquads
                .filter((sq) => !myProjectIds.has(sq._id)) // Not already a member
                .map((sq) => {
                    const squadSkills = new Set(
                        [...(sq.skillsRequired || []), ...(sq.discoveryTags || [])].map((s) =>
                            s.toLowerCase()
                        )
                    );

                    // Intersection / union (Jaccard-like similarity)
                    const intersection = [...userSkills].filter((s) => squadSkills.has(s)).length;
                    const union = new Set([...userSkills, ...squadSkills]).size;
                    const jaccardScore = union > 0 ? intersection / union : 0;

                    // Bonus factors
                    const hasSpace = sq.members?.length < sq.maxMembers;
                    const isActive = sq.status === 'in-progress' || sq.status === 'planning';
                    const spaceBonus = hasSpace ? 0.1 : 0;
                    const activityBonus = isActive ? 0.05 : 0;

                    const matchScore = Math.min(
                        Math.round((jaccardScore + spaceBonus + activityBonus) * 100),
                        99
                    );

                    return { ...sq, matchScore };
                })
                .filter((sq) => sq.matchScore > 0 || userSkills.size === 0)
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 4);

            // If no skills, show top public squads
            if (scored.length === 0) {
                const topSquads = allSquads
                    .filter((sq) => !myProjectIds.has(sq._id))
                    .slice(0, 4)
                    .map((sq) => ({ ...sq, matchScore: null }));
                setMatches(topSquads);
            } else {
                setMatches(scored);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getMatchColor = (score) => {
        if (!score) return 'text-gray-400';
        if (score >= 70) return 'text-green-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getMatchBg = (score) => {
        if (!score) return 'bg-gray-500/10 border-gray-500/20';
        if (score >= 70) return 'bg-green-500/10 border-green-500/20';
        if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-orange-500/10 border-orange-500/20';
    };

    const CATEGORY_ICONS = {
        web: FiZap, mobile: FiUsers, ai_ml: FiStar, blockchain: FiZap,
        game: FiZap, iot: FiZap, other: FiZap,
    };

    return (
        <div className="bg-white/5 dark:bg-gray-900/70 border border-white/10 dark:border-gray-700/30 rounded-[32px] p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-xl flex items-center justify-center">
                        <FiZap className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Squad Match</h3>
                        <p className="text-[10px] text-gray-400">Based on your skills</p>
                    </div>
                </div>
                <button
                    onClick={fetchMatches}
                    disabled={loading}
                    className="p-1.5 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all disabled:opacity-50"
                    title="Refresh matches"
                >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200/50 dark:bg-white/5 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-6">
                    <FiZap className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">No matches found. Add skills to your profile!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {matches.map((squad, i) => (
                        <motion.div
                            key={squad._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link
                                href={`/squads/${squad._id}`}
                                className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 dark:border-gray-700/30 hover:bg-white/10 dark:hover:bg-white/5 transition-all group"
                            >
                                {/* Category Icon */}
                                <div className="w-10 h-10 bg-violet-500/10 dark:bg-violet-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-lg group-hover:scale-110 transition-transform">
                                    {CATEGORY_ICONS[squad.category] || '🚀'}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white text-xs truncate">{squad.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <FiUsers className="w-2.5 h-2.5" />
                                            {squad.members?.length}/{squad.maxMembers}
                                        </span>
                                        {squad.skillsRequired?.slice(0, 2).map((skill) => (
                                            <span key={skill} className="text-[9px] bg-gray-100 dark:bg-white/5 text-gray-500 px-1.5 py-0.5 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Match Score */}
                                {squad.matchScore !== null ? (
                                    <div className={`flex-shrink-0 px-2.5 py-1 rounded-xl border text-xs font-black ${getMatchBg(squad.matchScore)} ${getMatchColor(squad.matchScore)}`}>
                                        {squad.matchScore}%
                                    </div>
                                ) : (
                                    <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors" />
                                )}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            <Link
                href="/squads"
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-gray-400 hover:text-violet-500 transition-colors"
            >
                Explore all squads <FiArrowRight className="w-3 h-3" />
            </Link>
        </div>
    );
}
