'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
    FiPlus,
    FiCheckCircle,
    FiCircle,
    FiClock,
    FiUser,
    FiTrash2,
    FiArrowLeft,
    FiTrello,
    FiSettings
} from 'react-icons/fi';
import Link from 'next/link';

export default function ProjectTasksPage() {
    const { id } = useParams();
    const router = useRouter();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]); // In a real app, tasks would have their own model
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        status: 'todo'
    });

    useEffect(() => {
        fetchProjectAndTasks();
    }, [id]);

    const fetchProjectAndTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
            // Simulating tasks for now as we don't have a task model yet
            setTasks([
                { id: '1', title: 'Initialize Repository', status: 'completed', priority: 'high', assignee: 'Alex' },
                { id: '2', title: 'Design Landing Page UI', status: 'todo', priority: 'medium', assignee: 'Sarah' },
            ]);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        const task = { ...newTask, id: Date.now().toString(), assignee: user?.fullName?.split(' ')[0] };
        setTasks([...tasks, task]);
        setIsAdding(false);
        setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium', status: 'todo' });
        toast.success('Task assigned!');
    };

    const toggleTask = (taskId) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' } : t));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-xl transition-colors"><FiArrowLeft /></button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <FiTrello className="text-primary-500" /> {project?.name} Tasks
                            </h1>
                            <p className="text-gray-500 text-sm">Organize and track your squad's progress.</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
                        <FiPlus /> New Task
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Summary Cards */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Pipeline Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">To Do</span>
                                    <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'todo').length}</span>
                                </div>
                                <div className="flex items-center justify-between text-primary-600">
                                    <span className="text-sm font-medium">In Progress</span>
                                    <span className="text-xs font-bold bg-primary-50 px-2 py-0.5 rounded-full">0</span>
                                </div>
                                <div className="flex items-center justify-between text-green-600">
                                    <span className="text-sm font-medium">Completed</span>
                                    <span className="text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'completed').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="md:col-span-2 space-y-4">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)
                        ) : tasks.length > 0 ? (
                            tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => toggleTask(task.id)} className={`text-xl ${task.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`}>
                                            {task.status === 'completed' ? <FiCheckCircle /> : <FiCircle />}
                                        </button>
                                        <div>
                                            <h4 className={`font-bold text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{task.priority}</span>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><FiUser /> {task.assignee}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all">
                                        <FiTrash2 />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 glassmorphism rounded-3xl border-2 border-dashed">
                                <p className="text-sm text-gray-500">No tasks assigned yet. Start by creating one!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {isAdding && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl">
                                <h2 className="text-2xl font-bold mb-6">Assign New Task</h2>
                                <form onSubmit={handleAddTask} className="space-y-4">
                                    <div>
                                        <label className="label">Task Title</label>
                                        <input type="text" className="input-field" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="label">Priority</label>
                                        <select className="input-field" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full btn-primary py-4 mt-6">Create Task</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
