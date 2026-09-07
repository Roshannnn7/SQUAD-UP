'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { FiActivity, FiRefreshCw } from 'react-icons/fi';

const HEALTH_COLORS = {
    Excellent: { ring: 'stroke-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    Good: { ring: 'stroke-green-400', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    Fair: { ring: 'stroke-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    'Needs Attention': { ring: 'stroke-orange-400', text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    Critical: { ring: 'stroke-red-400', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

function RadialProgress({ score }) {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : score >= 20 ? 'Needs Attention' : 'Critical';
    const colors = HEALTH_COLORS[label] || HEALTH_COLORS.Critical;

    return (
        <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} className="stroke-white/10 fill-none" strokeWidth="8" />
                <circle
                    cx="50" cy="50" r={radius}
                    className={`${colors.ring} fill-none transition-all duration-1000 ease-out`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${colors.text}`}>{score}</span>
                <span className="text-gray-500 text-xs">/ 100</span>
            </div>
        </div>
    );
}

function BreakdownBar({ item }) {
    const pct = item.max > 0 ? (item.score / item.max) * 100 : 0;
    return (
        <div>
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-gray-500">{item.score}/{item.max}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
            <p className="text-gray-600 text-xs mt-0.5">{item.value}</p>
        </div>
    );
}

export default function SquadHealthWidget({ squadId }) {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (squadId) fetchHealth();
    }, [squadId]);

    const fetchHealth = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const res = await api.get(`/explore/squad-health/${squadId}`);
            setHealth(res.data);
        } catch (err) {
            console.error('Squad health error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
                <div className="h-4 w-40 bg-white/10 rounded mb-4" />
                <div className="flex gap-6">
                    <div className="w-28 h-28 bg-white/10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-white/10 rounded" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!health) return null;

    const label = health.label || 'Critical';
    const colors = HEALTH_COLORS[label] || HEALTH_COLORS.Critical;

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <FiActivity className="text-violet-400 w-5 h-5" />
                    <h3 className="text-white font-bold text-lg">Squad Health</h3>
                </div>
                <button
                    onClick={() => fetchHealth(true)}
                    disabled={refreshing}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                    title="Refresh"
                >
                    <FiRefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex items-center gap-6 mb-6">
                <RadialProgress score={health.score} />
                <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold mb-2 ${colors.bg} ${colors.text}`}>
                        {label}
                    </div>
                    <p className="text-gray-400 text-sm">Based on team activity, tasks, standups, and events this week</p>
                </div>
            </div>

            <div className="space-y-3">
                {Object.values(health.breakdown || {}).map((item) => (
                    <BreakdownBar key={item.label} item={item} />
                ))}
            </div>
        </div>
    );
}
