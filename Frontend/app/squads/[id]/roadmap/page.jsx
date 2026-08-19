'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import {
    FiArrowLeft, FiPlus, FiFlag, FiCheck, FiClock, FiAlertTriangle,
    FiEdit2, FiTrash2, FiX, FiCalendar
} from 'react-icons/fi';

const STATUS_CONFIG = {
    upcoming: { label: 'Upcoming', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: FiClock },
    'in-progress': { label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: FiFlag },
    completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: FiCheck },
    overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: FiAlertTriangle },
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#f97316'];

function MilestoneModal({ projectId, milestone, onClose, onSave }) {
    const [form, setForm] = useState({
        title: milestone?.title || '',
        description: milestone?.description || '',
        dueDate: milestone?.dueDate ? new Date(milestone.dueDate).toISOString().slice(0, 10) : '',
        color: milestone?.color || '#6366f1',
        status: milestone?.status || 'upcoming',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            let res;
            if (milestone) {
                res = await api.put(`/milestones/${milestone._id}`, form);
            } else {
                res = await api.post(`/milestones/${projectId}`, form);
            }
            onSave(res.data);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
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
                    <h2 className="text-1xl font-black text-white">
                        {milestone ? 'Edit Milestone' : 'Add Milestone'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><FiX /></button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                        placeholder="Milestone title (e.g. MVP Launch)"
                        className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        placeholder="What needs to be done by this milestone?"
                        className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Due Date</label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none"
                            />
                        </div>
                        {milestone && (
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none"
                                >
                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-2">Color</label>
                        <div className="flex gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setForm({ ...form, color: c })}
                                    className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : milestone ? 'Update Milestone' : 'Add Milestone'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

export default function RoadmapPage({ params }) {
    const { id: projectId } = params;
    const { user } = useAuth();
    const [milestones, setMilestones] = useState([]);
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMilestone, setEditMilestone] = useState(null);

    useEffect(() => {
        fetchMilestones();
    }, [projectId]);

    const fetchMilestones = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/milestones/${projectId}`);
            setMilestones(res.data.milestones);
            setProgress(res.data.progress);
            setTotal(res.data.total);
            setCompleted(res.data.completed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (milestoneId) => {
        if (!confirm('Delete this milestone?')) return;
        try {
            await api.delete(`/milestones/${milestoneId}`);
            setMilestones((prev) => prev.filter((m) => m._id !== milestoneId));
        } catch (err) {}
    };

    const handleSave = (saved) => {
        const exists = milestones.find((m) => m._id === saved._id);
        if (exists) {
            setMilestones((prev) => prev.map((m) => (m._id === saved._id ? saved : m)));
        } else {
            setMilestones((prev) => [...prev, saved]);
        }
        fetchMilestones(); // Refresh for accurate progress
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <AnimatePresence>
                {(showModal || editMilestone) && (
                    <MilestoneModal
                        projectId={projectId}
                        milestone={editMilestone}
                        onClose={() => { setShowModal(false); setEditMilestone(null); }}
                        onSave={handleSave}
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
                            <h1 className="text-3xl font-black text-white">Squad Roadmap</h1>
                            <p className="text-gray-400 text-sm mt-1">Visual milestone timeline for your project</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-violet-600/30"
                    >
                        <FiPlus /> Add Milestone
                    </button>
                </div>

                {/* Progress Overview */}
                {total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="font-bold text-white">Overall Progress</p>
                            <p className="text-violet-400 font-black text-xl">{progress}%</p>
                        </div>
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            {Object.entries(
                                milestones.reduce((acc, m) => {
                                    acc[m.status] = (acc[m.status] || 0) + 1;
                                    return acc;
                                }, {})
                            ).map(([status, count]) => {
                                const cfg = STATUS_CONFIG[status];
                                const Icon = cfg?.icon;
                                return (
                                    <div key={status} className={`${cfg?.bg} border ${cfg?.border} rounded-2xl p-3`}>
                                        <p className={`text-2xl font-black ${cfg?.color}`}>{count}</p>
                                        <p className={`text-xs font-bold ${cfg?.color}`}>{cfg?.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Timeline */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-28 bg-white/5 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : milestones.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                        <div className="w-16 h-16 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiMap className="w-8 h-8" />
                        </div>
                        <p className="text-xl font-bold text-white mb-2">No milestones yet</p>
                        <p className="text-gray-400 mb-6">Plan your project journey with milestones</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
                        >
                            Add First Milestone
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-white/10" />

                        <div className="space-y-4">
                            {milestones.map((milestone, i) => {
                                const cfg = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.upcoming;
                                const Icon = cfg.icon;

                                return (
                                    <motion.div
                                        key={milestone._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex gap-6 relative"
                                    >
                                        {/* Timeline dot */}
                                        <div
                                            className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center z-10 border-2 shadow-lg"
                                            style={{
                                                backgroundColor: `${milestone.color}20`,
                                                borderColor: `${milestone.color}50`,
                                                boxShadow: `0 0 20px ${milestone.color}30`,
                                            }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: milestone.color }} />
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 ${cfg.bg} border ${cfg.border} rounded-3xl p-5 group hover:border-opacity-60 transition-all`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center flex-wrap gap-2 mb-2">
                                                        <h3 className="font-black text-white">{milestone.title}</h3>
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.border} border ${cfg.color}`}>
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                    {milestone.description && (
                                                        <p className="text-gray-400 text-sm mb-3">{milestone.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <FiCalendar className="w-3 h-3" />
                                                            Due: {formatDate(milestone.dueDate)}
                                                        </span>
                                                        {milestone.completedAt && (
                                                            <span className="text-green-400">
                                                                ✓ Completed {formatDate(milestone.completedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Edit/Delete */}
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditMilestone(milestone)}
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                                    >
                                                        <FiEdit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(milestone._id)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                                                    >
                                                        <FiTrash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
