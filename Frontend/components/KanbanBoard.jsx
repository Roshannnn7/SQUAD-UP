'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaClock, FaFlag } from 'react-icons/fa';

const STATUSES = ['todo', 'in-progress', 'done'];
const STATUS_LABELS = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
};
const STATUS_COLORS = {
    'todo': 'bg-gray-100 dark:bg-gray-800',
    'in-progress': 'bg-blue-100 dark:bg-blue-900',
    'done': 'bg-green-100 dark:bg-green-900',
};

export default function KanbanBoard({ projectId, userRole }) {
    const [tasks, setTasks] = useState({ todo: [], 'in-progress': [], done: [] });
    const [loading, setLoading] = useState(true);
    const [showNewTask, setShowNewTask] = useState(null);
    const [newTaskData, setNewTaskData] = useState({ title: '', description: '', priority: 'medium' });

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get(`/api/tasks/project/${projectId}`);

            const grouped = { todo: [], 'in-progress': [], done: [] };
            data.forEach(task => {
                grouped[task.status].push(task);
            });

            setTasks(grouped);
        } catch (error) {
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (status) => {
        if (!newTaskData.title.trim()) {
            toast.error('Task title is required');
            return;
        }

        try {
            await axios.post('/api/tasks', {
                projectId,
                ...newTaskData,
                status,
            });

            setNewTaskData({ title: '', description: '', priority: 'medium' });
            setShowNewTask(null);
            await fetchTasks();
            toast.success('Task created!');
        } catch (error) {
            toast.error('Failed to create task');
        }
    };

    const handleMoveTask = async (taskId, newStatus) => {
        try {
            await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
            await fetchTasks();
        } catch (error) {
            toast.error('Failed to move task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await axios.delete(`/api/tasks/${taskId}`);
            await fetchTasks();
            toast.success('Task deleted');
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'text-green-600 dark:text-green-400',
            medium: 'text-yellow-600 dark:text-yellow-400',
            high: 'text-red-600 dark:text-red-400',
        };
        return colors[priority];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUSES.map(status => (
                <div key={status} className="flex flex-col">
                    {/* Column header */}
                    <div className={`rounded-t-xl px-4 py-3 ${STATUS_COLORS[status]}`}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                {STATUS_LABELS[status]}
                                <span className="text-sm bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                    {tasks[status].length}
                                </span>
                            </h3>
                            <button
                                onClick={() => setShowNewTask(status)}
                                className="p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded transition-colors"
                            >
                                <FaPlus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-b-xl p-4 space-y-3 min-h-[400px]">
                        {/* New task form */}
                        {showNewTask === status && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md space-y-3"
                            >
                                <input
                                    type="text"
                                    placeholder="Task title..."
                                    value={newTaskData.title}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                                <textarea
                                    placeholder="Description (optional)..."
                                    value={newTaskData.description}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="2"
                                />
                                <select
                                    value={newTaskData.priority}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCreateTask(status)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Add Task
                                    </button>
                                    <button
                                        onClick={() => setShowNewTask(null)}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Task cards */}
                        {tasks[status].map(task => (
                            <motion.div
                                key={task._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group cursor-move"
                                draggable
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDeleteTask(task._id)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded transition-colors"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {task.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                        {task.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <FaFlag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                                        <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>

                                    {task.assignedTo && task.assignedTo.length > 0 && (
                                        <div className="flex -space-x-2">
                                            {task.assignedTo.slice(0, 3).map(user => (
                                                <img
                                                    key={user._id}
                                                    src={user.profilePhoto || '/default-avatar.png'}
                                                    alt={user.fullName}
                                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                                                    title={user.fullName}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Move buttons */}
                                <div className="mt-3 flex gap-1">
                                    {status !== 'todo' && (
                                        <button
                                            onClick={() => handleMoveTask(task._id, 'todo')}
                                            className="flex-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            ← To Do
                                        </button>
                                    )}
                                    {status !== 'in-progress' && (
                                        <button
                                            onClick={() => handleMoveTask(task._id, 'in-progress')}
                                            className="flex-1 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                        >
                                            In Progress
                                        </button>
                                    )}
                                    {status !== 'done' && (
                                        <button
                                            onClick={() => handleMoveTask(task._id, 'done')}
                                            className="flex-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                        >
                                            Done ✓
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
