'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    FiArrowLeft, FiSettings, FiUsers, FiShield, FiTrash2,
    FiSave, FiEdit3, FiUserX, FiUserCheck, FiActivity,
    FiAlertTriangle, FiGithub, FiLock, FiUnlock,
    FiRefreshCw, FiClock, FiCheckCircle, FiXCircle
} from 'react-icons/fi';

const TABS = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'members', label: 'Members', icon: FiUsers },
    { id: 'requests', label: 'Join Requests', icon: FiUserCheck },
    { id: 'activity', label: 'Activity Log', icon: FiActivity },
    { id: 'danger', label: 'Danger Zone', icon: FiAlertTriangle },
];

const ROLE_BADGES = {
    admin:     { color: 'bg-red-500/20 text-red-400 border-red-500/30',         label: 'Admin' },
    moderator: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',       label: 'Moderator' },
    mentor:    { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Mentor' },
    member:    { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',       label: 'Member' },
};

export default function SquadSettingsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    // General form
    const [form, setForm] = useState({
        name: '', description: '', githubRepo: '',
        maxMembers: 10, isPublic: true, requireJoinApproval: false,
        status: 'planning', category: 'other', skillsRequired: '',
    });
    const [saving, setSaving] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [updatingProgress, setUpdatingProgress] = useState(false);

    // Members
    const [roleChanging, setRoleChanging] = useState(null);
    const [removing, setRemoving] = useState(null);

    // Requests
    const [joinRequests, setJoinRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [processingRequest, setProcessingRequest] = useState(null);

    // Activity
    const [activityLogs, setActivityLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Delete
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => { fetchProject(); }, [id]);

    useEffect(() => {
        if (activeTab === 'requests') fetchJoinRequests();
        if (activeTab === 'activity') fetchActivityLogs();
    }, [activeTab]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${id}`);
            const p = res.data;
            setProject(p);
            setForm({
                name: p.name || '',
                description: p.description || '',
                githubRepo: p.githubRepo || '',
                maxMembers: p.maxMembers || 10,
                isPublic: p.isPublic !== false,
                requireJoinApproval: p.requireJoinApproval || false,
                status: p.status || 'planning',
                category: p.category || 'other',
                skillsRequired: Array.isArray(p.skillsRequired)
                    ? p.skillsRequired.join(', ')
                    : (p.skillsRequired || ''),
            });
            setProgressValue(p.progress || 0);
        } catch (err) {
            toast.error('Failed to load squad details');
            router.push(`/squads/${id}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchJoinRequests = async () => {
        try {
            setLoadingRequests(true);
            const res = await api.get(`/projects/${id}/join-requests`);
            setJoinRequests(res.data);
        } catch (err) {
            toast.error('Failed to load join requests');
        } finally {
            setLoadingRequests(false);
        }
    };

    const fetchActivityLogs = async () => {
        try {
            setLoadingLogs(true);
            const res = await api.get(`/projects/${id}/activity`);
            setActivityLogs(res.data.logs || []);
        } catch (err) {
            toast.error('Failed to load activity logs');
        } finally {
            setLoadingLogs(false);
        }
    };

    const isAdmin = project?.members?.some(
        m => m.user._id === user?._id && m.role === 'admin'
    );
    const isModerator = project?.members?.some(
        m => m.user._id === user?._id && (m.role === 'admin' || m.role === 'moderator')
    );
    const isCreator = project?.creator?._id === user?._id;

    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...form,
                skillsRequired: form.skillsRequired
                    ? form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
                    : [],
            };
            await api.put(`/projects/${id}`, payload);
            toast.success('Squad settings updated!');
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateProgress = async () => {
        try {
            setUpdatingProgress(true);
            await api.put(`/projects/${id}/progress`, { progress: progressValue });
            toast.success('Progress updated!');
        } catch (err) {
            toast.error('Failed to update progress');
        } finally {
            setUpdatingProgress(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            setRoleChanging(userId);
            await api.put(`/projects/${id}/members/${userId}/role`, { role: newRole });
            toast.success('Role updated!');
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change role');
        } finally {
            setRoleChanging(null);
        }
    };

    const handleRemoveMember = async (userId, memberName) => {
        if (!confirm(`Remove ${memberName} from the squad?`)) return;
        try {
            setRemoving(userId);
            await api.delete(`/projects/${id}/members/${userId}`);
            toast.success(`${memberName} removed from squad`);
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove member');
        } finally {
            setRemoving(null);
        }
    };

    const handleJoinRequest = async (requestId, action) => {
        try {
            setProcessingRequest(requestId);
            await api.put(`/projects/${id}/join-requests/${requestId}`, { action });
            toast.success(`Request ${action}d!`);
            fetchJoinRequests();
            fetchProject();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} request`);
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleDeleteSquad = async () => {
        if (deleteConfirmText !== project.name) {
            toast.error('Squad name does not match');
            return;
        }
        try {
            setDeleting(true);
            await api.delete(`/projects/${id}`);
            toast.success('Squad deleted successfully');
            router.push('/squads');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete squad');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Navbar />
                <div className="animate-spin h-12 w-12 border-b-2 border-violet-500 rounded-full" />
            </div>
        );
    }

    if (!isModerator) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                    <FiShield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-6">Only admins and moderators can access squad settings.</p>
                    <Link href={`/squads/${id}`} className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
                        Back to Squad
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/squads/${id}`} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <FiSettings className="text-violet-400" /> Squad Settings
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">{project?.name}</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-56 flex-shrink-0">
                        <nav className="bg-white/5 border border-white/10 rounded-2xl p-2 flex lg:flex-col gap-1">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all w-full text-left ${
                                            active
                                                ? tab.id === 'danger'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-violet-600/20 text-violet-400'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        <span>{tab.label}</span>
                                        {tab.id === 'requests' && joinRequests.length > 0 && (
                                            <span className="ml-auto bg-violet-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                                {joinRequests.length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >

                                {/* ── GENERAL ── */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <form onSubmit={handleSaveGeneral} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                                <FiEdit3 className="text-violet-400" /> General Information
                                            </h2>

                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Squad Name *</label>
                                                <input
                                                    value={form.name}
                                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                                    required
                                                    placeholder="Squad name"
                                                    className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Description *</label>
                                                <textarea
                                                    value={form.description}
                                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                                    required rows={4}
                                                    placeholder="What is this squad about?"
                                                    className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Skills Required</label>
                                                <input
                                                    value={form.skillsRequired}
                                                    onChange={e => setForm({ ...form, skillsRequired: e.target.value })}
                                                    placeholder="React, Node.js, Python (comma-separated)"
                                                    className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">GitHub Repository</label>
                                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 focus-within:border-violet-500/50 rounded-xl px-4 py-3 transition-colors">
                                                    <FiGithub className="text-gray-400 flex-shrink-0" />
                                                    <input
                                                        value={form.githubRepo}
                                                        onChange={e => setForm({ ...form, githubRepo: e.target.value })}
                                                        placeholder="https://github.com/user/repo"
                                                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Max Members</label>
                                                    <input
                                                        type="number"
                                                        value={form.maxMembers}
                                                        onChange={e => setForm({ ...form, maxMembers: parseInt(e.target.value) })}
                                                        min={project?.members?.length || 1} max={50}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Status</label>
                                                    <select
                                                        value={form.status}
                                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                                        className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                                                    >
                                                        <option value="planning">Planning</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="on-hold">On Hold</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Category</label>
                                                <select
                                                    value={form.category}
                                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                                                >
                                                    <option value="other">Other</option>
                                                    <option value="web">Web Development</option>
                                                    <option value="mobile">Mobile Development</option>
                                                    <option value="ai_ml">AI / Machine Learning</option>
                                                    <option value="design">Design</option>
                                                    <option value="devops">DevOps</option>
                                                    <option value="game">Game Development</option>
                                                    <option value="blockchain">Blockchain</option>
                                                </select>
                                            </div>

                                            {/* Toggles */}
                                            <div className="space-y-3">
                                                <div
                                                    onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                                                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/8 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {form.isPublic ? <FiUnlock className="text-green-400" /> : <FiLock className="text-red-400" />}
                                                        <div>
                                                            <p className="font-semibold text-white text-sm">Public Squad</p>
                                                            <p className="text-xs text-gray-400">{form.isPublic ? 'Anyone can discover and join' : 'Hidden from public listing'}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`relative w-11 h-6 rounded-full transition-all ${form.isPublic ? 'bg-green-500' : 'bg-gray-600'}`}>
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isPublic ? 'left-6' : 'left-1'}`} />
                                                    </div>
                                                </div>

                                                <div
                                                    onClick={() => setForm({ ...form, requireJoinApproval: !form.requireJoinApproval })}
                                                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/8 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FiUserCheck className={form.requireJoinApproval ? 'text-violet-400' : 'text-gray-400'} />
                                                        <div>
                                                            <p className="font-semibold text-white text-sm">Require Join Approval</p>
                                                            <p className="text-xs text-gray-400">{form.requireJoinApproval ? 'New members need approval' : 'Anyone can join instantly'}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`relative w-11 h-6 rounded-full transition-all ${form.requireJoinApproval ? 'bg-violet-500' : 'bg-gray-600'}`}>
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.requireJoinApproval ? 'left-6' : 'left-1'}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="submit" disabled={saving}
                                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                                            >
                                                <FiSave className="w-4 h-4" />
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </form>

                                        {/* Progress Update */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-5">
                                                <FiActivity className="text-violet-400" /> Squad Progress
                                            </h2>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-400">Completion</span>
                                                    <span className="text-violet-400 font-bold">{progressValue}%</span>
                                                </div>
                                                <input
                                                    type="range" min={0} max={100} value={progressValue}
                                                    onChange={e => setProgressValue(parseInt(e.target.value))}
                                                    className="w-full accent-violet-500"
                                                />
                                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                                                        style={{ width: `${progressValue}%` }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleUpdateProgress} disabled={updatingProgress}
                                                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                                                >
                                                    <FiRefreshCw className={`w-4 h-4 ${updatingProgress ? 'animate-spin' : ''}`} />
                                                    {updatingProgress ? 'Updating...' : 'Update Progress'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── MEMBERS ── */}
                                {activeTab === 'members' && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                                            <FiUsers className="text-violet-400" /> Members ({project?.members?.length})
                                        </h2>
                                        <div className="space-y-3">
                                            {project?.members?.map(member => {
                                                const isCurrentUser = member.user._id === user?._id;
                                                const memberIsAdmin = member.role === 'admin';
                                                const badge = ROLE_BADGES[member.role] || ROLE_BADGES.member;
                                                return (
                                                    <div key={member._id} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl transition-all">
                                                        <img
                                                            src={member.user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.fullName}`}
                                                            alt={member.user.fullName}
                                                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-bold text-white text-sm">
                                                                    {member.user.fullName}
                                                                    {isCurrentUser && <span className="text-gray-500 font-normal ml-1">(you)</span>}
                                                                </p>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{member.user.email}</p>
                                                        </div>
                                                        {isAdmin && !memberIsAdmin && !isCurrentUser && (
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <select
                                                                    value={member.role}
                                                                    onChange={e => handleRoleChange(member.user._id, e.target.value)}
                                                                    disabled={roleChanging === member.user._id}
                                                                    className="bg-gray-900 border border-white/10 text-white text-xs px-3 py-2 rounded-lg focus:outline-none"
                                                                >
                                                                    <option value="member">Member</option>
                                                                    <option value="moderator">Moderator</option>
                                                                    <option value="mentor">Mentor</option>
                                                                </select>
                                                                <button
                                                                    onClick={() => handleRemoveMember(member.user._id, member.user.fullName)}
                                                                    disabled={removing === member.user._id}
                                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all disabled:opacity-50"
                                                                >
                                                                    {removing === member.user._id ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiUserX className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        )}
                                                        {!isAdmin && isModerator && member.role === 'member' && !isCurrentUser && (
                                                            <button
                                                                onClick={() => handleRemoveMember(member.user._id, member.user.fullName)}
                                                                disabled={removing === member.user._id}
                                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all disabled:opacity-50 flex-shrink-0"
                                                            >
                                                                {removing === member.user._id ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiUserX className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── JOIN REQUESTS ── */}
                                {activeTab === 'requests' && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                                <FiUserCheck className="text-violet-400" /> Join Requests
                                            </h2>
                                            <button onClick={fetchJoinRequests} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                                                <FiRefreshCw className={`w-4 h-4 ${loadingRequests ? 'animate-spin text-violet-400' : 'text-gray-400'}`} />
                                            </button>
                                        </div>
                                        {loadingRequests ? (
                                            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />)}</div>
                                        ) : joinRequests.length === 0 ? (
                                            <div className="text-center py-16">
                                                <FiUserCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-400 font-semibold">No pending join requests</p>
                                                <p className="text-gray-500 text-sm mt-1">New requests will appear here</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {joinRequests.map(req => (
                                                    <div key={req._id} className="p-5 bg-white/5 border border-white/10 rounded-xl">
                                                        <div className="flex items-start gap-4">
                                                            <img
                                                                src={req.user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.fullName}`}
                                                                alt="" className="w-10 h-10 rounded-xl flex-shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-white text-sm">{req.user.fullName}</p>
                                                                <p className="text-xs text-gray-400 mt-0.5">{req.user.email}</p>
                                                                {req.reason && (
                                                                    <p className="text-sm text-gray-300 mt-2 bg-white/5 rounded-lg p-3 italic">"{req.reason}"</p>
                                                                )}
                                                                <p className="text-xs text-gray-500 mt-2">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex gap-2 flex-shrink-0">
                                                                <button
                                                                    onClick={() => handleJoinRequest(req._id, 'approve')}
                                                                    disabled={processingRequest === req._id}
                                                                    className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                                                                >
                                                                    <FiCheckCircle className="w-4 h-4" /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleJoinRequest(req._id, 'reject')}
                                                                    disabled={processingRequest === req._id}
                                                                    className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                                                                >
                                                                    <FiXCircle className="w-4 h-4" /> Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── ACTIVITY LOG ── */}
                                {activeTab === 'activity' && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                                <FiActivity className="text-violet-400" /> Activity Log
                                            </h2>
                                            <button onClick={fetchActivityLogs} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                                                <FiRefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin text-violet-400' : 'text-gray-400'}`} />
                                            </button>
                                        </div>
                                        {loadingLogs ? (
                                            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />)}</div>
                                        ) : activityLogs.length === 0 ? (
                                            <div className="text-center py-16">
                                                <FiActivity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-400 font-semibold">No activity yet</p>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
                                                <div className="space-y-4">
                                                    {activityLogs.map((log) => (
                                                        <div key={log._id} className="flex gap-4 relative">
                                                            <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 z-10">
                                                                <FiActivity className="w-4 h-4 text-violet-400" />
                                                            </div>
                                                            <div className="flex-1 pb-4">
                                                                <p className="text-sm text-gray-200">{log.description}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <FiClock className="w-3 h-3 text-gray-500" />
                                                                    <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── DANGER ZONE ── */}
                                {activeTab === 'danger' && (
                                    <div className="space-y-4">
                                        {!isCreator && isModerator && (
                                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                                                <h2 className="text-lg font-black text-orange-400 flex items-center gap-2 mb-2">
                                                    <FiAlertTriangle /> Leave Squad
                                                </h2>
                                                <p className="text-gray-400 text-sm mb-4">
                                                    You will lose access to all squad resources, chat, and tools.
                                                </p>
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Are you sure you want to leave this squad?')) return;
                                                        try {
                                                            await api.post(`/projects/${id}/leave`);
                                                            toast.success('Left squad successfully');
                                                            router.push('/squads');
                                                        } catch (err) {
                                                            toast.error(err.response?.data?.message || 'Failed to leave squad');
                                                        }
                                                    }}
                                                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-bold px-6 py-3 rounded-xl transition-all"
                                                >
                                                    Leave Squad
                                                </button>
                                            </div>
                                        )}

                                        {isCreator && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                                                <h2 className="text-lg font-black text-red-400 flex items-center gap-2 mb-2">
                                                    <FiTrash2 /> Delete Squad
                                                </h2>
                                                <p className="text-gray-400 text-sm mb-2">
                                                    This action is <strong className="text-red-400">permanent and irreversible</strong>. All squad data will be permanently deleted.
                                                </p>
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-5">
                                                    <p className="text-red-400 text-xs font-bold mb-1">This will permanently delete:</p>
                                                    <ul className="text-xs text-gray-400 space-y-0.5 ml-4 list-disc">
                                                        <li>All squad messages and chat history</li>
                                                        <li>All tasks, milestones, and resources</li>
                                                        <li>All join requests and activity logs</li>
                                                        <li>All squad rules and settings</li>
                                                    </ul>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                                        Type <span className="text-red-400 font-black">"{project?.name}"</span> to confirm
                                                    </label>
                                                    <input
                                                        value={deleteConfirmText}
                                                        onChange={e => setDeleteConfirmText(e.target.value)}
                                                        placeholder={project?.name}
                                                        className="w-full bg-white/5 border border-red-500/30 focus:border-red-500/60 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors"
                                                    />
                                                    <button
                                                        onClick={handleDeleteSquad}
                                                        disabled={deleteConfirmText !== project?.name || deleting}
                                                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:cursor-not-allowed"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                        {deleting ? 'Deleting Squad...' : 'Permanently Delete Squad'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
