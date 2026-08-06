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
    FiPlus, FiCheckCircle, FiCircle, FiClock, FiUser, FiTrash2,
    FiArrowLeft, FiEdit2, FiX, FiFlag, FiCalendar, FiMoreVertical, FiTag
} from 'react-icons/fi';

const PRIORITY_CONFIG = {
    high:   { label: 'High',   color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    dot: 'bg-red-500' },
    medium: { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-500' },
    low:    { label: 'Low',    color: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  dot: 'bg-green-500' },
};

const COLUMNS = [
    { status: 'todo',        label: 'To Do',       icon: '📋', color: 'border-t-gray-400' },
    { status: 'in-progress', label: 'In Progress', icon: '⚡', color: 'border-t-blue-500' },
    { status: 'done',        label: 'Done',        icon: '✅', color: 'border-t-green-500' },
];

function TaskCard({ task, onToggle, onDelete, onEdit, isAdmin }) {
    const [showMenu, setShowMenu] = useState(false);
    const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const isDone = task.status === 'done';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group ${isDone ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onToggle(task._id, task.status)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                    }`}
                >
                    {isDone && <FiCheckCircle className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm leading-snug ${isDone ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                    </p>
                    {task.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        {/* Priority badge */}
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${pri.bg} ${pri.border} ${pri.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                            {pri.label}
                        </span>

                        {/* Due date */}
                        {task.dueDate && (
                            <span className={`flex items-center gap-1 text-[10px] text-gray-400 ${new Date(task.dueDate) < new Date() && !isDone ? 'text-red-500 font-bold' : ''}`}>
                                <FiCalendar className="w-2.5 h-2.5" />
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>

                    {/* Assignees */}
                    {task.assignedTo?.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                            {task.assignedTo.slice(0, 3).map((u, i) => (
                                <img
                                    key={u._id || i}
                                    src={u.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`}
                                    alt={u.fullName}
                                    title={u.fullName}
                                    className="w-5 h-5 rounded-full border border-white dark:border-gray-800 -ml-1 first:ml-0 object-cover"
                                />
                            ))}
                            {task.assignedTo.length > 3 && (
                                <span className="text-[10px] text-gray-400 ml-1">+{task.assignedTo.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Menu */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                        <FiMoreVertical className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-10 min-w-[120px] overflow-hidden"
                                onMouseLeave={() => setShowMenu(false)}
                            >
                                <button onClick={() => { onEdit(task); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                    <FiEdit2 className="w-3 h-3" /> Edit
                                </button>
                                {(isAdmin || task.createdBy?._id === task._currentUserId) && (
                                    <button onClick={() => { onDelete(task._id); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                        <FiTrash2 className="w-3 h-3" /> Delete
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

function TaskModal({ task, members, projectId, onClose, onSaved }) {
    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task?.assignedTo?.map(u => u._id || u) || [],
        labels: task?.labels?.join(', ') || '',
    });
    const [saving, setSaving] = useState(false);

    const toggleAssignee = (userId) => {
        setForm(f => ({
            ...f,
            assignedTo: f.assignedTo.includes(userId)
                ? f.assignedTo.filter(id => id !== userId)
                : [...f.assignedTo, userId],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...form,
                labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
                projectId,
            };

            let res;
            if (task) {
                res = await api.put(`/tasks/${task._id}`, payload);
            } else {
                res = await api.post('/tasks', payload);
            }
            onSaved(res.data, !!task);
            toast.success(task ? 'Task updated!' : 'Task created! 🎯');
            onClose();
        } catch (err) {
            toast.error('Failed to save task');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                        {task ? 'Edit Task' : 'Create New Task'} 🎯
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Task Title *</label>
                        <input
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                            placeholder="e.g. Build login page with Firebase auth"
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-violet-500 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            placeholder="What needs to be done? Add context, links, requirements..."
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white resize-none focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Priority</label>
                            <select
                                value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                            >
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🔴 High</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Due Date</label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Assign to members */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                            Assign To ({form.assignedTo.length} selected)
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {members.map(member => {
                                const u = member.user;
                                const isSelected = form.assignedTo.includes(u._id);
                                return (
                                    <button
                                        key={u._id}
                                        type="button"
                                        onClick={() => toggleAssignee(u._id)}
                                        className={`flex items-center gap-2 p-2 rounded-xl border-2 text-left transition-all ${
                                            isSelected
                                                ? 'border-violet-500 bg-violet-500/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={u.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`}
                                            className="w-7 h-7 rounded-lg"
                                            alt=""
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{u.fullName?.split(' ')[0]}</p>
                                            <p className="text-[10px] text-gray-400 capitalize">{member.role}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Labels</label>
                        <input
                            value={form.labels}
                            onChange={e => setForm({ ...form, labels: e.target.value })}
                            placeholder="frontend, bug, urgent (comma separated)"
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-violet-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                    >
                        {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task 🚀'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

export default function ProjectTasksPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [filter, setFilter] = useState('all'); // all | mine | high

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [projectRes, tasksRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/tasks/project/${id}`),
            ]);
            setProject(projectRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (taskId, currentStatus) => {
        const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
        try {
            const res = await api.put(`/tasks/${taskId}`, { status: nextStatus });
            setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
            if (nextStatus === 'done') toast.success('Task completed! 🎉 +10 XP');
        } catch (err) {
            toast.error('Failed to update task');
        }
    };

    const handleDelete = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t._id !== taskId));
            toast.success('Task deleted');
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    const handleMoveToProgress = async (taskId) => {
        try {
            const res = await api.put(`/tasks/${taskId}`, { status: 'in-progress' });
            setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
        } catch (err) {}
    };

    const handleSaved = (savedTask, isEdit) => {
        if (isEdit) {
            setTasks(prev => prev.map(t => t._id === savedTask._id ? savedTask : t));
        } else {
            setTasks(prev => [savedTask, ...prev]);
        }
    };

    const members = project?.members || [];
    const isAdmin = members.some(m => m.user?._id === user?._id && ['admin', 'moderator'].includes(m.role));

    // Filter tasks
    const getFilteredTasks = (status) => {
        return tasks
            .filter(t => t.status === status)
            .filter(t => {
                if (filter === 'mine') return t.assignedTo?.some(u => (u._id || u) === user?._id);
                if (filter === 'high') return t.priority === 'high';
                return true;
            });
    };

    const stats = {
        total: tasks.length,
        done: tasks.filter(t => t.status === 'done').length,
        mine: tasks.filter(t => t.assignedTo?.some(u => (u._id || u) === user?._id)).length,
        overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <AnimatePresence>
                {(showModal || editTask) && (
                    <TaskModal
                        task={editTask}
                        members={members}
                        projectId={id}
                        onClose={() => { setShowModal(false); setEditTask(null); }}
                        onSaved={handleSaved}
                    />
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-all">
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                                Task Board 📋
                            </h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                {project?.name} · {stats.done}/{stats.total} done
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-violet-600/20"
                    >
                        <FiPlus /> New Task
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-white dark:bg-gray-800' },
                        { label: 'My Tasks', value: stats.mine, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                        { label: 'Completed', value: stats.done, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                        { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-center`}>
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span className="font-bold">Squad Progress</span>
                        <span className="font-bold text-violet-600">{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: 'all', label: 'All Tasks' },
                        { key: 'mine', label: 'My Tasks' },
                        { key: 'high', label: '🔴 High Priority' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                filter === f.key
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Kanban Board */}
                {loading ? (
                    <div className="grid grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="h-24 bg-gray-100 dark:bg-gray-800/50 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {COLUMNS.map(col => {
                            const colTasks = getFilteredTasks(col.status);
                            return (
                                <div key={col.status} className="flex flex-col">
                                    {/* Column Header */}
                                    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border-t-4 ${col.color} border border-gray-100 dark:border-gray-700 flex items-center justify-between`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{col.icon}</span>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{col.label}</span>
                                        </div>
                                        <span className="text-xs font-black bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    {/* Task Cards */}
                                    <div className="flex-1 space-y-3 min-h-[200px]">
                                        <AnimatePresence>
                                            {colTasks.map(task => (
                                                <TaskCard
                                                    key={task._id}
                                                    task={task}
                                                    onToggle={handleToggle}
                                                    onDelete={handleDelete}
                                                    onEdit={(t) => setEditTask(t)}
                                                    isAdmin={isAdmin}
                                                />
                                            ))}
                                        </AnimatePresence>

                                        {colTasks.length === 0 && (
                                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center">
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {col.status === 'todo' ? 'Add tasks to get started' : 'Nothing here yet'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Quick add for todo column */}
                                        {col.status === 'todo' && (
                                            <button
                                                onClick={() => setShowModal(true)}
                                                className="w-full py-2.5 border-2 border-dashed border-violet-200 dark:border-violet-800 text-violet-500 dark:text-violet-400 rounded-2xl text-xs font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all flex items-center justify-center gap-1"
                                            >
                                                <FiPlus className="w-3.5 h-3.5" /> Add task
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Member Workload */}
                {members.length > 0 && !loading && tasks.length > 0 && (
                    <div className="mt-10 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2 text-sm uppercase tracking-widest">
                            👥 Team Workload
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {members.map(member => {
                                const u = member.user;
                                const myTasks = tasks.filter(t => t.assignedTo?.some(a => (a._id || a) === u._id));
                                const done = myTasks.filter(t => t.status === 'done').length;
                                const pct = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0;

                                return (
                                    <div key={u._id} className="text-center">
                                        <img
                                            src={u.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`}
                                            className="w-10 h-10 rounded-2xl mx-auto mb-2 border-2 border-white dark:border-gray-700"
                                            alt=""
                                        />
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{u.fullName?.split(' ')[0]}</p>
                                        <p className="text-[10px] text-gray-400">{myTasks.length} tasks · {pct}% done</p>
                                        <div className="mt-1.5 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
