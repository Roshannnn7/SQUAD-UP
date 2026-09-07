'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import Link from 'next/link';
import {
    FiTrendingUp, FiZap, FiUsers, FiStar, FiClock,
    FiHash, FiGrid, FiFileText, FiAward, FiArrowRight,
    FiFilter, FiSearch
} from 'react-icons/fi';
import { BsFire } from 'react-icons/bs';

const CATEGORIES = [
    { value: '', label: 'All' },
    { value: 'web', label: 'Web Dev' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'ai_ml', label: 'AI/ML' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'game', label: 'Game Dev' },
    { value: 'iot', label: 'IoT' },
];

const TABS = [
    { id: 'all', label: 'All', icon: FiTrendingUp },
    { id: 'squads', label: 'Squads', icon: FiGrid },
    { id: 'challenges', label: 'Challenges', icon: FiZap },
    { id: 'mentors', label: 'Mentors', icon: FiStar },
    { id: 'hashtags', label: 'Trending Tags', icon: FiHash },
];

function SquadCard({ squad, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/squads/${squad._id}`}>
                <div className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-3xl p-5 transition-all group cursor-pointer">
                    {squad.hackathon?.isHackathon && (
                        <div className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1 text-xs text-orange-400 font-bold w-fit mb-3">
                            <BsFire className="w-3 h-3" /> HACKATHON LIVE
                        </div>
                    )}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xl font-black text-white flex-shrink-0 shadow-lg shadow-violet-600/30">
                            {squad.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold truncate group-hover:text-violet-400 transition-colors">{squad.name}</h3>
                            <p className="text-gray-400 text-xs mt-0.5 truncate">{squad.description}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {(squad.skillsRequired || []).slice(0, 3).map(skill => (
                            <span key={skill} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">{skill}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" />{squad.memberCount || 0} members</span>
                        <span className="capitalize bg-white/5 px-2 py-0.5 rounded-full">{squad.category || 'other'}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function ChallengeCard({ challenge, index }) {
    const timeLeft = (deadline) => {
        const diff = new Date(deadline) - new Date();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(hours / 24);
        return days > 0 ? `${days}d left` : `${hours}h left`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/squads/${challenge.project?._id}/challenges`}>
                <div className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-emerald-500/30 rounded-3xl p-5 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${challenge.difficulty === 'hard' ? 'bg-red-500/20 text-red-400 border-red-500/30' : challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                                    {challenge.difficulty}
                                </span>
                                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                    <FiZap className="w-3 h-3" />+{challenge.xpReward} XP
                                </span>
                            </div>
                            <h3 className="text-white font-bold group-hover:text-emerald-400 transition-colors">{challenge.title}</h3>
                            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{challenge.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                        <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{timeLeft(challenge.deadline)}</span>
                        <span>{challenge.project?.name}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function MentorCard({ mentor, index }) {
    const stars = mentor.averageRating || 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/mentors`}>
                <div className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-amber-500/30 rounded-3xl p-5 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                        <img
                            src={mentor.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user?.fullName}`}
                            alt={mentor.user?.fullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold group-hover:text-amber-400 transition-colors truncate">{mentor.user?.fullName}</h3>
                            <p className="text-gray-400 text-xs truncate">{mentor.user?.headline}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                                <FiStar key={s} className={`w-3.5 h-3.5 ${s <= Math.round(stars) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                            ))}
                        </div>
                        <span className="text-amber-400 font-bold text-sm">{stars.toFixed(1)}</span>
                        <span className="text-gray-500 text-xs">({mentor.reviewCount || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                        {(mentor.expertise || []).slice(0, 3).map(e => (
                            <span key={e} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">{e}</span>
                        ))}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function ExplorePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [category, setCategory] = useState('');

    useEffect(() => {
        fetchExplore();
    }, [category]);

    const fetchExplore = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/explore?${category ? `category=${category}` : ''}`);
            setData(res.data);
        } catch (error) {
            console.error('Explore fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
                {/* Hero */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/30">
                            <BsFire className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-violet-400 uppercase tracking-wider">Trending Now</span>
                    </div>
                    <h1 className="text-5xl font-black text-white mb-3">
                        Explore <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">SquadUp</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">Discover trending squads, active challenges, top mentors, and hot topics — all in one place.</p>
                </div>

                {/* Tabs + Category filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {(activeTab === 'all' || activeTab === 'squads') && (
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="bg-white/5 border border-white/10 text-gray-300 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
                        >
                            {CATEGORIES.map(c => (
                                <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>
                            ))}
                        </select>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : data ? (
                    <div className="space-y-12">
                        {/* Trending Squads */}
                        {(activeTab === 'all' || activeTab === 'squads') && data.trendingSquads?.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <FiGrid className="text-violet-400" /> Trending Squads
                                    </h2>
                                    <Link href="/squads" className="text-violet-400 text-sm flex items-center gap-1 hover:text-violet-300">
                                        View all <FiArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {data.trendingSquads.map((squad, i) => (
                                        <SquadCard key={squad._id} squad={squad} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Active Challenges */}
                        {(activeTab === 'all' || activeTab === 'challenges') && data.activeChalllenges?.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <FiZap className="text-emerald-400" /> Active Challenges
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.activeChalllenges.map((ch, i) => (
                                        <ChallengeCard key={ch._id} challenge={ch} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Featured Mentors */}
                        {(activeTab === 'all' || activeTab === 'mentors') && data.featuredMentors?.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <FiStar className="text-amber-400" /> Top Mentors
                                    </h2>
                                    <Link href="/mentors" className="text-amber-400 text-sm flex items-center gap-1 hover:text-amber-300">
                                        All mentors <FiArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.featuredMentors.map((m, i) => (
                                        <MentorCard key={m._id} mentor={m} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Trending Hashtags */}
                        {(activeTab === 'all' || activeTab === 'hashtags') && data.trendingHashtags?.length > 0 && (
                            <section>
                                <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
                                    <FiHash className="text-pink-400" /> Trending Tags
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {data.trendingHashtags.map((ht, i) => (
                                        <motion.div
                                            key={ht.tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                        >
                                            <Link href={`/feed?hashtag=${ht.tag}`}>
                                                <div className="flex items-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 text-pink-400 px-4 py-2 rounded-full transition-all cursor-pointer">
                                                    <FiHash className="w-3.5 h-3.5" />
                                                    <span className="font-semibold">{ht.tag}</span>
                                                    <span className="text-xs text-pink-500/70 ml-1">{ht.count}</span>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Empty state */}
                        {activeTab !== 'all' && (
                            <div className="text-center py-16">
                                {activeTab === 'squads' && data.trendingSquads?.length === 0 && (
                                    <p className="text-gray-500">No trending squads right now. <Link href="/squads/create" className="text-violet-400">Create one!</Link></p>
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
            </main>
        </div>
    );
}
