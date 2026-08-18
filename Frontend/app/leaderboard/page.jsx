'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import {
    FiTrendingUp, FiAward, FiZap, FiStar, FiTarget,
    FiUser, FiChevronUp, FiChevronDown, FiMinus
} from 'react-icons/fi';
import { BsFire } from 'react-icons/bs';

const PERIOD_OPTIONS = [
    { label: 'All Time', value: 'alltime' },
    { label: 'This Month', value: 'monthly' },
    { label: 'This Week', value: 'weekly' },
];

const RANK_COLORS = {
    1: { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-600', glow: 'shadow-yellow-500/40' },
    2: { bg: 'from-slate-300 to-slate-400', text: 'text-slate-600', glow: 'shadow-slate-400/40' },
    3: { bg: 'from-amber-600 to-orange-500', text: 'text-amber-700', glow: 'shadow-amber-500/40' },
};

const getLevelTitle = (level) => {
    if (level >= 20) return 'Legend';
    if (level >= 15) return 'Master';
    if (level >= 10) return 'Expert';
    if (level >= 7) return 'Advanced';
    if (level >= 4) return 'Intermediate';
    return 'Beginner';
};

const getLevelColor = (level) => {
    if (level >= 20) return 'text-purple-500';
    if (level >= 15) return 'text-red-500';
    if (level >= 10) return 'text-orange-500';
    if (level >= 7) return 'text-blue-500';
    if (level >= 4) return 'text-green-500';
    return 'text-gray-500';
};

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [period, setPeriod] = useState('alltime');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const [lbRes, rankRes] = await Promise.all([
                api.get(`/leaderboard?period=${period}&limit=50`),
                api.get('/leaderboard/my-rank').catch(() => ({ data: null })),
            ]);
            setLeaderboard(lbRes.data.leaderboard);
            setMyRank(rankRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            {/* Hero Header */}
            <div className="relative overflow-hidden pt-24 pb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-indigo-900/30" />
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 50%)'
                }} />

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 px-4 py-2 rounded-full text-violet-300 text-sm font-semibold mb-6"
                    >
                        <FiTrendingUp className="w-4 h-4" />
                        Live Rankings
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-4"
                    >
                        <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Leaderboard
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg mb-8"
                    >
                        Earn XP by collaborating, completing tasks, and mentoring others
                    </motion.p>

                    {/* My Rank Banner */}
                    {myRank && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-6 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 mb-8"
                        >
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Your Rank</p>
                                <p className="text-3xl font-black text-white">#{myRank.rank}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-widest">XP Points</p>
                                <p className="text-3xl font-black text-violet-400">{myRank.points?.toLocaleString()}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Level</p>
                                <p className="text-3xl font-black text-yellow-400">{myRank.level}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Streak</p>
                                <div className="flex items-center gap-1">
                                    <BsFire className="text-orange-400 text-xl" />
                                    <p className="text-3xl font-black text-orange-400">{myRank.streak?.current || 0}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Period Filter */}
                    <div className="flex gap-2 justify-center">
                        {PERIOD_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                                    period === opt.value
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        {top3.length >= 3 && (
                            <div className="flex items-end justify-center gap-4 mb-12 mt-4">
                                {/* 2nd Place */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative mb-3">
                                        <img
                                            src={top3[1]?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1]?.fullName}`}
                                            alt={top3[1]?.fullName}
                                            className="w-16 h-16 rounded-2xl border-2 border-slate-400 shadow-xl"
                                        />
                                        <div className="absolute -top-3 -right-3 w-7 h-7 bg-slate-400 text-gray-900 rounded-full font-bold flex items-center justify-center text-xs shadow-md">2</div>
                                    </div>
                                    <p className="text-sm font-bold text-white text-center max-w-[80px] truncate">{top3[1]?.fullName?.split(' ')[0]}</p>
                                    <p className="text-xs text-violet-400 font-semibold">{top3[1]?.points?.toLocaleString()} XP</p>
                                    <div className="mt-2 w-24 h-20 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-xl flex items-start justify-center pt-2">
                                        <span className="text-white font-black text-2xl">2</span>
                                    </div>
                                </motion.div>

                                {/* 1st Place */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative mb-3">
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">👑</div>
                                        <img
                                            src={top3[0]?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0]?.fullName}`}
                                            alt={top3[0]?.fullName}
                                            className="w-24 h-24 rounded-2xl border-4 border-yellow-400 shadow-2xl shadow-yellow-500/40"
                                        />
                                        <div className="absolute -top-4 -right-3 w-8 h-8 bg-amber-400 text-gray-900 rounded-full font-bold flex items-center justify-center text-sm shadow-lg shadow-amber-400/50">1</div>
                                    </div>
                                    <p className="text-base font-bold text-white text-center max-w-[100px] truncate">{top3[0]?.fullName?.split(' ')[0]}</p>
                                    <p className="text-sm text-yellow-400 font-bold">{top3[0]?.points?.toLocaleString()} XP</p>
                                    <div className="mt-2 w-28 h-32 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-xl flex items-start justify-center pt-2 shadow-lg shadow-yellow-500/30">
                                        <span className="text-white font-black text-3xl">1</span>
                                    </div>
                                </motion.div>

                                {/* 3rd Place */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative mb-3">
                                        <img
                                            src={top3[2]?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2]?.fullName}`}
                                            alt={top3[2]?.fullName}
                                            className="w-16 h-16 rounded-2xl border-2 border-amber-700 shadow-xl"
                                        />
                                        <div className="absolute -top-3 -right-3 w-7 h-7 bg-amber-700 text-white rounded-full font-bold flex items-center justify-center text-xs shadow-md">3</div>
                                    </div>
                                    <p className="text-sm font-bold text-white text-center max-w-[80px] truncate">{top3[2]?.fullName?.split(' ')[0]}</p>
                                    <p className="text-xs text-amber-400 font-semibold">{top3[2]?.points?.toLocaleString()} XP</p>
                                    <div className="mt-2 w-24 h-14 bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-xl flex items-start justify-center pt-2">
                                        <span className="text-white font-black text-2xl">3</span>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Full Rankings Table */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <div className="col-span-1 text-center">Rank</div>
                                <div className="col-span-5">Student</div>
                                <div className="col-span-2 text-center hidden sm:block">Level</div>
                                <div className="col-span-2 text-center hidden sm:block">Streak</div>
                                <div className="col-span-2 text-right">XP Points</div>
                            </div>

                            <AnimatePresence>
                                {leaderboard.map((entry, index) => {
                                    const isMe = user?._id === entry._id || user?.id === entry._id;
                                    const rankStyle = RANK_COLORS[entry.rank] || {};

                                    return (
                                        <motion.div
                                            key={entry._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 items-center transition-all hover:bg-white/5 ${
                                                isMe ? 'bg-violet-500/10 border-violet-500/20' : ''
                                            }`}
                                        >
                                            {/* Rank */}
                                            <div className="col-span-1 text-center">
                                                {entry.rank <= 3 ? (
                                                    <span className="text-2xl">{rankStyle.icon}</span>
                                                ) : (
                                                    <span className={`text-lg font-black ${isMe ? 'text-violet-400' : 'text-gray-400'}`}>
                                                        #{entry.rank}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Student Info */}
                                            <div className="col-span-5 flex items-center gap-3">
                                                <Link href={`/portfolio/${entry._id}`}>
                                                    <img
                                                        src={entry.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.fullName}`}
                                                        alt={entry.fullName}
                                                        className={`w-10 h-10 rounded-xl border-2 ${isMe ? 'border-violet-500' : 'border-white/10'}`}
                                                    />
                                                </Link>
                                                <div>
                                                    <Link href={`/portfolio/${entry._id}`}>
                                                        <p className={`font-bold text-sm hover:text-violet-400 transition-colors ${isMe ? 'text-violet-300' : 'text-white'}`}>
                                                            {entry.fullName}
                                                            {isMe && <span className="ml-2 text-xs bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">You</span>}
                                                        </p>
                                                    </Link>
                                                    <p className="text-xs text-gray-500">{entry.skills?.join(' · ') || 'Student'}</p>
                                                </div>
                                            </div>

                                            {/* Level */}
                                            <div className="col-span-2 text-center hidden sm:block">
                                                <span className={`text-sm font-bold ${getLevelColor(entry.level)}`}>
                                                    Lv.{entry.level}
                                                </span>
                                                <p className="text-xs text-gray-500">{getLevelTitle(entry.level)}</p>
                                            </div>

                                            {/* Streak */}
                                            <div className="col-span-2 text-center hidden sm:block">
                                                {entry.streak?.current > 0 ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <BsFire className="text-orange-400 text-sm" />
                                                        <span className="text-orange-400 font-bold text-sm">{entry.streak.current}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600 text-sm">—</span>
                                                )}
                                            </div>

                                            {/* XP Points */}
                                            <div className="col-span-2 text-right">
                                                <span className={`text-sm font-black ${entry.rank <= 3 ? 'text-yellow-400' : 'text-white'}`}>
                                                    {entry.points?.toLocaleString() || 0}
                                                </span>
                                                <p className="text-xs text-gray-500">XP</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* XP Guide */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <FiZap className="text-yellow-400" /> How to Earn XP
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { action: 'Daily Login', xp: '+5 XP', icon: '📅' },
                                    { action: 'Daily Standup', xp: '+10 XP', icon: '📋' },
                                    { action: 'Challenge Submit', xp: '+20 XP', icon: '🧪' },
                                    { action: 'Win a Challenge', xp: '+50-100 XP', icon: '🏆' },
                                    { action: 'Join a Squad', xp: '+15 XP', icon: '👥' },
                                    { action: 'Complete a Task', xp: '+10 XP', icon: '✅' },
                                    { action: 'Post on Feed', xp: '+5 XP', icon: '📝' },
                                    { action: 'Book a Mentor', xp: '+25 XP', icon: '🎯' },
                                ].map((item) => (
                                    <div key={item.action} className="bg-white/5 rounded-2xl p-4 text-center">
                                        <div className="text-2xl mb-2">{item.icon}</div>
                                        <p className="text-xs text-gray-400 font-medium">{item.action}</p>
                                        <p className="text-sm font-black text-violet-400 mt-1">{item.xp}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
