'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axios';
import { FiBell, FiX, FiCheck, FiInfo, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();

        // Refresh notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            const unread = await api.get('/notifications/unread-count');
            setUnreadCount(unread.data.count);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark read error:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Mark all read error:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
            if (!notifications.find(n => n._id === id).isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Delete notification error:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <FiCalendar className="text-blue-500" />;
            case 'message': return <FiMessageSquare className="text-purple-500" />;
            case 'project': return <FiCheck className="text-green-500" />;
            case 'connection_request': return <FiUsers className="text-primary-500" />;
            case 'connection_accepted': return <FiCheck className="text-emerald-500" />;
            default: return <FiInfo className="text-gray-500" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs font-bold text-primary-600 hover:text-primary-500">
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex gap-4 ${!notification.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-100 dark:bg-gray-900'}`}>
                                                {getIcon(notification.type)}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className={`text-sm font-bold leading-tight ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <button onClick={() => deleteNotification(notification._id)} className="text-gray-400 hover:text-red-500">
                                                        <FiX className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                    {notification.actionUrl && (
                                                        <Link
                                                            href={notification.actionUrl}
                                                            onClick={() => { markAsRead(notification._id); setIsOpen(false); }}
                                                            className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline"
                                                        >
                                                            View Details
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center opacity-50">
                                        <FiBell className="mx-auto w-10 h-10 mb-2" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/notifications"
                                className="block p-4 text-center text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                                onClick={() => setIsOpen(false)}
                            >
                                View and manage all notifications
                            </Link>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
