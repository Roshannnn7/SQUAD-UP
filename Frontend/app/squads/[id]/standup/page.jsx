'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { FiArrowLeft, FiSend, FiCalendar, FiCheckCircle, FiAlertCircle, FiUsers, FiClock } from 'react-icons/fi';
import { BsFire } from 'react-icons/bs';

const MOOD_OPTIONS = [
    { value: 'great', emoji: '🚀', label: 'Great!' },
    { value: 'good', emoji: '😊', label: 'Good' },
    { value: 'okay', emoji: '😐', label: 'Okay' },
    { value: 'struggling', emoji: '😰', label: 'Struggling' },
];

const MOOD_COLORS = {
    great: 'border-green-500 bg-green-500/10 text-green-400',
    good: 'border-blue-500 bg-blue-500/10 text-blue-400',
    okay: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    struggling: 'border-red-500 bg-red-500/10 text-red-400',
};

export default function StandupPage({ params }) {
    const { id: projectId } = params;
    const { user } = useAuth();
    const [todayData, setTodayData] = useState(null);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        yesterday: '',
        today: '',
        blockers: '',
        mood: 'good',
    });
    const [view, setView] = useState('today'); // 'today' | 'submit' | 'history'
    const [history, setHistory] = useState({});

    useEffect(() => {
        fetchTodayStandups();
        fetchStreak();
    }, [projectId]);

    const fetchTodayStandups = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/standups/${projectId}/today`);
            setTodayData(res.data);
            if (res.data.myStandUp) {
                setForm({
                    yesterday: res.data.myStandUp.yesterday,
                    today: res.data.myStandUp.today,
                    blockers: res.data.myStandUp.blockers,
                    mood: res.data.myStandUp.mood,
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStreak = async () => {
        try {
            const res = await api.get(`/standups/${projectId}/my-streak`);
            setStreak(res.data.streak);
        } catch (err) {}
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/standups/${projectId}/history?days=14`);
            setHistory(res.data.history);
        } catch (err) {}
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post(`/standups/${projectId}`, form);
            setSuccess(true);
            await fetchTodayStandups();
            await fetchStreak();
            setTimeout(() => {
                setSuccess(false);
                setView('today');
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/squads/${projectId}`}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white">Daily Stand-up 📋</h1>
                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                            <FiCalendar className="w-3 h-3" /> {today}
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <BsFire className="text-orange-400 text-xl" />
                            <p className="text-3xl font-black text-orange-400">{streak}</p>
                        </div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Day Streak</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <p className="text-3xl font-black text-green-400 mb-1">
                            {todayData?.standUps?.length || 0}
                        </p>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Checked In</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <p className="text-3xl font-black text-violet-400 mb-1">
                            {todayData?.completionRate || 0}%
                        </p>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Team Rate</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 p-1 bg-white/5 border border-white/10 rounded-2xl">
                    {[
                        { key: 'today', label: "Today's Updates" },
                        { key: 'submit', label: todayData?.myStandUp ? 'Edit My Check-in' : 'Post Check-in' },
                        { key: 'history', label: 'History' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setView(tab.key);
                                if (tab.key === 'history') fetchHistory();
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                view === tab.key
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Today's Stand-ups View */}
                    {view === 'today' && (
                        <motion.div
                            key="today"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="h-40 bg-white/5 animate-pulse rounded-3xl" />
                                ))
                            ) : todayData?.standUps?.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                                    <p className="text-4xl mb-4">☀️</p>
                                    <p className="text-white font-bold text-xl mb-2">No check-ins yet today</p>
                                    <p className="text-gray-400 mb-6">Be the first to post your daily stand-up!</p>
                                    <button
                                        onClick={() => setView('submit')}
                                        className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
                                    >
                                        Post My Check-in
                                    </button>
                                </div>
                            ) : (
                                todayData.standUps.map((standup, i) => (
                                    <motion.div
                                        key={standup._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white/5 border border-white/10 hover:border-violet-500/20 rounded-3xl p-6 transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-5">
                                            <img
                                                src={standup.user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${standup.user.fullName}`}
                                                alt={standup.user.fullName}
                                                className="w-10 h-10 rounded-xl border border-white/20"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-white text-sm">{standup.user.fullName}</p>
                                                <p className="text-xs text-gray-500">{new Date(standup.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${MOOD_COLORS[standup.mood]}`}>
                                                {MOOD_OPTIONS.find(m => m.value === standup.mood)?.emoji} {standup.mood}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FiCheckCircle className="w-3 h-3" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Yesterday</p>
                                                    <p className="text-sm text-gray-200">{standup.yesterday}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FiClock className="w-3 h-3" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Today</p>
                                                    <p className="text-sm text-gray-200">{standup.today}</p>
                                                </div>
                                            </div>
                                            {standup.blockers && standup.blockers !== 'No blockers' && (
                                                <div className="flex gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <FiAlertCircle className="w-3 h-3" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Blockers</p>
                                                        <p className="text-sm text-red-300">{standup.blockers}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Submit Form */}
                    {view === 'submit' && (
                        <motion.div
                            key="submit"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {success ? (
                                <div className="text-center py-16">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-6xl mb-4"
                                    >🎉</motion.div>
                                    <p className="text-2xl font-black text-white mb-2">Check-in Posted!</p>
                                    <p className="text-gray-400">+10 XP earned · Streak extended 🔥</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            🌅 What did you accomplish yesterday?
                                        </label>
                                        <textarea
                                            value={form.yesterday}
                                            onChange={(e) => setForm({ ...form, yesterday: e.target.value })}
                                            required
                                            rows={3}
                                            placeholder="I finished the login UI component and fixed the auth bug..."
                                            className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            🎯 What will you work on today?
                                        </label>
                                        <textarea
                                            value={form.today}
                                            onChange={(e) => setForm({ ...form, today: e.target.value })}
                                            required
                                            rows={3}
                                            placeholder="I'll work on the dashboard page and connect the API..."
                                            className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            🚧 Any blockers? (optional)
                                        </label>
                                        <textarea
                                            value={form.blockers}
                                            onChange={(e) => setForm({ ...form, blockers: e.target.value })}
                                            rows={2}
                                            placeholder="No blockers / I need help with CORS configuration..."
                                            className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            😄 How are you feeling today?
                                        </label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {MOOD_OPTIONS.map((mood) => (
                                                <button
                                                    key={mood.value}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, mood: mood.value })}
                                                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                                                        form.mood === mood.value
                                                            ? MOOD_COLORS[mood.value]
                                                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <span className="text-2xl">{mood.emoji}</span>
                                                    <span className="text-xs font-semibold">{mood.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-violet-600/30"
                                    >
                                        <FiSend className="w-4 h-4" />
                                        {submitting ? 'Posting...' : todayData?.myStandUp ? 'Update Check-in' : 'Post Check-in (+10 XP)'}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}

                    {/* History View */}
                    {view === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {Object.keys(history).length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    No stand-up history yet.
                                </div>
                            ) : (
                                Object.entries(history)
                                    .sort(([a], [b]) => new Date(b) - new Date(a))
                                    .map(([date, standups]) => (
                                        <div key={date}>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                                <FiCalendar className="w-3 h-3" />
                                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                <span className="bg-white/5 px-2 py-0.5 rounded-full">{standups.length} updates</span>
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {standups.map((su) => (
                                                    <div key={su._id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <img
                                                                src={su.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${su.user?.fullName}`}
                                                                className="w-7 h-7 rounded-lg"
                                                                alt=""
                                                            />
                                                            <span className="text-xs font-semibold text-gray-300">{su.user?.fullName}</span>
                                                            <span className="ml-auto text-xs">{MOOD_OPTIONS.find(m => m.value === su.mood)?.emoji}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 line-clamp-2">{su.today}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
