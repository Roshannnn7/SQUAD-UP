'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { FiBell, FiTrash2, FiCheckCircle, FiInfo, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteOne = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Notification removed');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <FiCalendar className="text-blue-500" />;
            case 'message': return <FiMessageSquare className="text-purple-500" />;
            default: return <FiInfo className="text-primary-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Notifications</h1>
                        <p className="text-gray-600 dark:text-gray-400">Stay updated with your latest platform activities.</p>
                    </div>
                    <button className="text-sm font-bold text-primary-600 hover:text-primary-500 px-4 py-2 bg-primary-50 rounded-xl">
                        Mark all as read
                    </button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                layout
                                className={`p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 flex gap-6 hover:shadow-lg transition-all ${!notification.isRead ? 'ring-2 ring-primary-500/20 shadow-primary-500/5' : ''}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-primary-50 dark:bg-primary-900/20 shadow-sm' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`text-lg font-bold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {notification.title}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            {!notification.isRead && (
                                                <button onClick={() => markRead(notification._id)} className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg" title="Mark as read">
                                                    <FiCheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button onClick={() => deleteOne(notification._id)} className="p-2 text-gray-300 hover:text-red-500 rounded-lg">
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{notification.message}</p>
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full">{format(new Date(notification.createdAt), 'MMM d, p')}</span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 glassmorphism rounded-3xl">
                            <FiBell className="mx-auto w-12 h-12 text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">All caught up!</h3>
                            <p className="text-gray-500">You don't have any notifications at the moment.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
