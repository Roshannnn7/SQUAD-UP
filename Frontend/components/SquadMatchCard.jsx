'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import {
    FiUsers,
    FiArrowRight,
    FiZap,
    FiStar,
    FiRefreshCw,
    FiCode,
    FiSmartphone,
    FiGlobe,
    FiCpu,
    FiLayers,
    FiCompass
} from 'react-icons/fi';

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
            const [squadsResult, myProjectsResult] = await Promise.allSettled([
                api.get('/projects?limit=50'),
                api.get('/projects/my'),
            ]);

            const allSquads = squadsResult.status === 'fulfilled' ? (squadsResult.value.data?.projects || []) : [];
            const myProjectsData = myProjectsResult.status === 'fulfilled' ? (myProjectsResult.value.data || []) : [];
            const myProjectIds = new Set(myProjectsData.map((p) => p._id));

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

    const getMatchBadge = (score) => {
        if (!score) return { text: 'Open', color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
        if (score >= 70) return { text: `${score}% MATCH`, color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' };
        if (score >= 40) return { text: `${score}% MATCH`, color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' };
        return { text: `${score}% MATCH`, color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' };
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'web': return <FiGlobe className="w-4 h-4 text-blue-500" />;
            case 'mobile': return <FiSmartphone className="w-4 h-4 text-purple-500" />;
            case 'ai_ml': return <FiCpu className="w-4 h-4 text-pink-500" />;
            case 'blockchain': return <FiLayers className="w-4 h-4 text-indigo-500" />;
            default: return <FiCode className="w-4 h-4 text-violet-500" />;
        }
    };

    return (
        <div className="glass-card rounded-[28px] p-6 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 p-[1.5px] shadow-glow-sm">
                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                            <FiZap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Squad Match</h3>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                AI
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Personalized by your skills</p>
                    </div>
                </div>

                <button
                    onClick={fetchMatches}
                    disabled={loading}
                    className="p-2 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    title="Refresh AI matches"
                    aria-label="Refresh AI squad matches"
                >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-18 squad-skeleton rounded-2xl p-3 flex items-center gap-3" />
                    ))}
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-7 px-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                        <FiCompass className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">No matches found yet</p>
                    <p className="text-[11px] text-slate-400 mb-3">Add skills to your profile to get personalized recommendations!</p>
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                    >
                        Update Skills <FiArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {matches.map((squad, i) => {
                        const badge = getMatchBadge(squad.matchScore);
                        return (
                            <motion.div
                                key={squad._id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <Link
                                    href={`/squads/${squad._id}`}
                                    className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 hover:border-violet-500/40 dark:hover:border-violet-500/40 hover:shadow-md transition-all duration-200"
                                >
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                        {getCategoryIcon(squad.category)}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                {squad.name}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                                                <FiUsers className="w-2.5 h-2.5 text-slate-400" />
                                                {squad.members?.length || 0}/{squad.maxMembers || 4}
                                            </span>
                                            <div className="flex items-center gap-1 overflow-hidden">
                                                {squad.skillsRequired?.slice(0, 2).map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="text-[9px] font-semibold bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md truncate max-w-[70px]"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Match Badge & Action */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold tracking-tight ${badge.color}`}>
                                            {badge.text}
                                        </span>
                                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-200" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            <Link
                href="/squads"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all duration-200 group"
            >
                <span>Explore all opportunities</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
