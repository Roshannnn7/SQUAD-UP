'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import { FiGift, FiCopy, FiShare2, FiZap, FiUsers, FiCheckCircle } from 'react-icons/fi';

export default function ReferralPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/referral/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Referral stats error:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateCode = async () => {
        try {
            setGenerating(true);
            const res = await api.post('/auth/referral/generate');
            await fetchStats();
            toast.success('Referral code generated!');
        } catch (err) {
            toast.error('Failed to generate code');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const shareOnWhatsApp = () => {
        if (!stats?.shareUrl) return;
        const msg = encodeURIComponent(`Join me on SquadUp — the ultimate student collaboration platform! Use my referral link to get started: ${stats.shareUrl}`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    };

    const shareOnTwitter = () => {
        if (!stats?.shareUrl) return;
        const text = encodeURIComponent(`Building amazing projects with @SquadUp 🚀 Join me and get 25 bonus XP with my referral: ${stats.shareUrl}`);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    const BENEFITS = [
        { icon: '🎯', title: 'You earn', desc: '+50 XP for each successful referral' },
        { icon: '🎁', title: 'They earn', desc: '+25 XP when they join with your link' },
        { icon: '🏆', title: 'Unlock badges', desc: 'Special badges at 5, 10, 25 referrals' },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-gradient-to-br from-violet-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-600/40"
                    >
                        <FiGift className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white mb-3">Invite & Earn</h1>
                    <p className="text-gray-400">Share SquadUp with friends. You both earn XP when they join.</p>
                </div>

                {/* Stats */}
                {!loading && stats && (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-5 text-center"
                        >
                            <p className="text-4xl font-black text-violet-400">{stats.referralCount || 0}</p>
                            <p className="text-gray-400 text-sm mt-1 flex items-center justify-center gap-1"><FiUsers className="w-3.5 h-3.5" /> Friends Joined</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-5 text-center"
                        >
                            <p className="text-4xl font-black text-emerald-400">+{stats.referralXpEarned || 0}</p>
                            <p className="text-gray-400 text-sm mt-1 flex items-center justify-center gap-1"><FiZap className="w-3.5 h-3.5" /> XP Earned</p>
                        </motion.div>
                    </div>
                )}

                {/* Referral code box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6"
                >
                    <h2 className="text-white font-bold mb-4">Your Referral Link</h2>

                    {loading ? (
                        <div className="h-12 bg-white/10 animate-pulse rounded-2xl" />
                    ) : stats?.referralCode ? (
                        <div className="space-y-3">
                            {/* Code display */}
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                <code className="text-violet-400 font-mono font-black text-lg flex-1">{stats.referralCode}</code>
                                <button
                                    onClick={() => copyToClipboard(stats.referralCode)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                                    title="Copy code"
                                >
                                    {copied ? <FiCheckCircle className="text-emerald-400 w-4 h-4" /> : <FiCopy className="text-gray-400 w-4 h-4" />}
                                </button>
                            </div>

                            {/* Link display */}
                            {stats.shareUrl && (
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                    <span className="text-gray-400 text-sm truncate flex-1">{stats.shareUrl}</span>
                                    <button
                                        onClick={() => copyToClipboard(stats.shareUrl)}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-all flex-shrink-0"
                                    >
                                        <FiCopy className="text-gray-400 w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Share buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={shareOnWhatsApp}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    <FiShare2 className="w-4 h-4" /> WhatsApp
                                </button>
                                <button
                                    onClick={shareOnTwitter}
                                    className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    <FiShare2 className="w-4 h-4" /> Twitter
                                </button>
                                <button
                                    onClick={() => copyToClipboard(stats.shareUrl || stats.referralCode)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    <FiCopy className="w-4 h-4" /> Copy
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400 text-sm mb-4">You don&apos;t have a referral code yet.</p>
                            <button
                                onClick={generateCode}
                                disabled={generating}
                                className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold px-6 py-3 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-violet-600/30"
                            >
                                {generating ? 'Generating...' : 'Generate My Code'}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Benefits */}
                <div className="space-y-3">
                    {BENEFITS.map((b, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.08 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                        >
                            <span className="text-3xl flex-shrink-0">{b.icon}</span>
                            <div>
                                <p className="text-white font-bold text-sm">{b.title}</p>
                                <p className="text-gray-400 text-sm">{b.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
