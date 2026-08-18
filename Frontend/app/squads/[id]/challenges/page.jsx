'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import {
    FiArrowLeft, FiPlus, FiClock, FiZap, FiAward, FiLink,
    FiThumbsUp, FiExternalLink, FiLock, FiUnlock, FiX, FiSend
} from 'react-icons/fi';

const DIFFICULTY_STYLES = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const TYPE_ICONS = {
    coding: '💻', design: '🎨', research: '🔬', presentation: '📊', other: '🌟'
};

const STATUS_STYLES = {
    active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    judging: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
};

function CreateChallengeModal({ projectId, onClose, onCreated }) {
    const [form, setForm] = useState({
        title: '', description: '', type: 'coding', difficulty: 'medium', xpReward: 50,
        deadline: '', tags: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await api.post(`/challenges/${projectId}`, {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                xpReward: parseInt(form.xpReward),
            });
            onCreated(res.data);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white">Create Challenge 🧪</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                        placeholder="Challenge title (e.g. Build a REST API in 2 hours)"
                        className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                        rows={4}
                        placeholder="Describe the challenge requirements, constraints and evaluation criteria..."
                        className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none"
                        >
                            <option value="coding">💻 Coding</option>
                            <option value="design">🎨 Design</option>
                            <option value="research">🔬 Research</option>
                            <option value="presentation">📊 Presentation</option>
                            <option value="other">🌟 Other</option>
                        </select>
                        <select
                            value={form.difficulty}
                            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Deadline</label>
                            <input
                                type="datetime-local"
                                value={form.deadline}
                                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">XP Reward</label>
                            <input
                                type="number"
                                value={form.xpReward}
                                onChange={(e) => setForm({ ...form, xpReward: e.target.value })}
                                min={10} max={500}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none"
                            />
                        </div>
                    </div>
                    <input
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="Tags (comma-separated): React, Node.js, API"
                        className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Creating...' : 'Create Challenge'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

function SubmitModal({ challengeId, onClose, onSubmitted }) {
    const [form, setForm] = useState({ submissionUrl: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await api.post(`/challenges/challenge/${challengeId}/submit`, form);
            onSubmitted(res.data);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white">Submit Solution 🚀</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 block mb-2">GitHub / Demo URL</label>
                        <input
                            value={form.submissionUrl}
                            onChange={(e) => setForm({ ...form, submissionUrl: e.target.value })}
                            required
                            placeholder="https://github.com/you/repo"
                            className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-2">Description (optional)</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            placeholder="Briefly describe your approach..."
                            className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-50"
                    >
                        <FiSend className="inline mr-2" />
                        {submitting ? 'Submitting...' : 'Submit (+20 XP)'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

export default function ChallengesPage({ params }) {
    const { id: projectId } = params;
    const { user } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [submitChallengeId, setSubmitChallengeId] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [submissions, setSubmissions] = useState({});

    useEffect(() => {
        fetchChallenges();
    }, [projectId]);

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/challenges/${projectId}`);
            setChallenges(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (challengeId) => {
        try {
            const res = await api.get(`/challenges/challenge/${challengeId}/submissions`);
            setSubmissions((prev) => ({ ...prev, [challengeId]: res.data }));
        } catch (err) {}
    };

    const handleExpand = (challengeId) => {
        if (expanded === challengeId) {
            setExpanded(null);
        } else {
            setExpanded(challengeId);
            fetchSubmissions(challengeId);
        }
    };

    const handleVote = async (submissionId, challengeId) => {
        try {
            const res = await api.post(`/challenges/submissions/${submissionId}/vote`);
            fetchSubmissions(challengeId);
        } catch (err) {}
    };

    const timeLeft = (deadline) => {
        const diff = new Date(deadline) - new Date();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(hours / 24);
        return days > 0 ? `${days}d left` : `${hours}h left`;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <AnimatePresence>
                {showCreate && (
                    <CreateChallengeModal
                        projectId={projectId}
                        onClose={() => setShowCreate(false)}
                        onCreated={(c) => { setChallenges([c, ...challenges]); }}
                    />
                )}
                {submitChallengeId && (
                    <SubmitModal
                        challengeId={submitChallengeId}
                        onClose={() => setSubmitChallengeId(null)}
                        onSubmitted={() => fetchChallenges()}
                    />
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={`/squads/${projectId}`}
                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                            <FiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-2">
                                <FiZap className="text-emerald-400" /> Skill Lab
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Challenge yourselves and earn XP</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-violet-600/30"
                    >
                        <FiPlus /> New Challenge
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : challenges.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiZap className="w-8 h-8" />
                        </div>
                        <p className="text-xl font-bold text-white mb-2">No challenges yet!</p>
                        <p className="text-gray-400 mb-6">Create the first challenge to level up your squad.</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
                        >
                            Create Challenge
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {challenges.map((ch, i) => (
                            <motion.div
                                key={ch._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/5 border border-white/10 hover:border-violet-500/20 rounded-3xl overflow-hidden transition-all"
                            >
                                {/* Card Header */}
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl flex-shrink-0 mt-1">{TYPE_ICONS[ch.type]}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                <h3 className="font-black text-white text-lg">{ch.title}</h3>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${DIFFICULTY_STYLES[ch.difficulty]}`}>
                                                    {ch.difficulty}
                                                </span>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[ch.status]}`}>
                                                    {ch.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{ch.description}</p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FiClock className="w-3 h-3" />
                                                    {timeLeft(ch.deadline)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiZap className="w-3 h-3 text-yellow-400" />
                                                    <span className="text-yellow-400 font-bold">+{ch.xpReward} XP</span>
                                                </span>
                                                <span>{ch.submissionCount || 0} submissions</span>
                                                <span>by {ch.creator?.fullName}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            {ch.status === 'active' && !ch.hasSubmitted && (
                                                <button
                                                    onClick={() => setSubmitChallengeId(ch._id)}
                                                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
                                                >
                                                    Submit
                                                </button>
                                            )}
                                            {ch.hasSubmitted && (
                                                <span className="bg-green-500/20 text-green-400 font-bold px-4 py-2 rounded-xl text-sm text-center">
                                                    ✓ Submitted
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleExpand(ch._id)}
                                                className="bg-white/5 hover:bg-white/10 text-gray-400 font-bold px-4 py-2 rounded-xl text-sm transition-all"
                                            >
                                                {expanded === ch._id ? 'Hide' : 'View All'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Winner */}
                                    {ch.status === 'completed' && ch.winner && (
                                        <div className="mt-4 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3">
                                            <span className="text-xl">🏆</span>
                                            <span className="text-yellow-400 font-bold text-sm">Winner: {ch.winner?.fullName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Submissions */}
                                <AnimatePresence>
                                    {expanded === ch._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/10 overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <h4 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4">
                                                    Submissions ({submissions[ch._id]?.submissions?.length || 0})
                                                </h4>
                                                {!submissions[ch._id] ? (
                                                    <p className="text-gray-500 text-sm">Loading...</p>
                                                ) : submissions[ch._id]?.submissions?.length === 0 ? (
                                                    <p className="text-gray-500 text-sm">No submissions yet.</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {submissions[ch._id].submissions.map((sub) => (
                                                            <div key={sub._id} className="flex items-center gap-3 bg-white/5 rounded-2xl p-4">
                                                                <img
                                                                    src={sub.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.user?.fullName}`}
                                                                    alt=""
                                                                    className="w-8 h-8 rounded-xl"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white font-semibold text-sm">{sub.user?.fullName}</p>
                                                                    <p className="text-gray-500 text-xs truncate">{sub.description || sub.submissionUrl}</p>
                                                                </div>
                                                                <a
                                                                    href={sub.submissionUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                                                >
                                                                    <FiExternalLink className="w-4 h-4" />
                                                                </a>
                                                                <button
                                                                    onClick={() => handleVote(sub._id, ch._id)}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                                                                        sub.votes?.includes(user?._id)
                                                                            ? 'bg-violet-500/30 text-violet-300'
                                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                                    }`}
                                                                >
                                                                    <FiThumbsUp className="w-3 h-3" />
                                                                    {sub.votes?.length || 0}
                                                                </button>
                                                                {sub.isWinner && <span className="text-xl">🏆</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
