'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import {
    FiSearch,
    FiMessageCircle,
    FiUsers,
    FiUser,
    FiChevronRight,
    FiSend
} from 'react-icons/fi';
import Link from 'next/link';

export default function MessagesPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'squads'
    const [conversations, setConversations] = useState([]);
    const [squads, setSquads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'squads') {
                const res = await api.get('/projects/my');
                setSquads(res.data);
            } else {
                // Real conversation fetching
                const res = await api.get('/messages/conversations');
                const chats = res.data.map(item => ({
                    id: item.user._id,
                    name: item.user.fullName,
                    photo: item.user.profilePhoto,
                    lastMessage: item.lastMessage,
                    time: new Date(item.createdAt).toLocaleDateString(),
                    unread: item.unreadCount || 0
                }));
                setConversations(chats);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            // Fallback for demo if needed
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f172a] selection:bg-primary-500/30">
            <Navbar />

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">

                    {/* Left Sidebar: Conversation List */}
                    <div className="lg:col-span-4 flex flex-col space-y-6 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
                                Inbox
                            </h1>
                            <div className="flex p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                                <button
                                    onClick={() => setActiveTab('direct')}
                                    className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === 'direct' ? 'bg-white dark:bg-gray-700 shadow-xl text-primary-600 dark:text-primary-400 scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Direct
                                </button>
                                <button
                                    onClick={() => setActiveTab('squads')}
                                    className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === 'squads' ? 'bg-white dark:bg-gray-700 shadow-xl text-primary-600 dark:text-primary-400 scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Squads
                                </button>
                            </div>
                        </div>

                        <div className="relative group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-inner"
                            />
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-6">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-24 bg-gray-100/50 dark:bg-gray-800/50 animate-pulse rounded-3xl border border-gray-200/50 dark:border-gray-700/50" />
                                ))
                            ) : activeTab === 'direct' ? (
                                conversations.map(chat => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={chat.id}
                                    >
                                        <Link
                                            href={`/messages/${chat.id}`}
                                            className="flex items-center justify-between p-5 bg-white dark:bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-100/50 dark:border-gray-700/30 hover:border-primary-500/50 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <img src={chat.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} className="w-14 h-14 rounded-[22px] object-cover ring-2 ring-white dark:ring-gray-700 shadow-md transition-transform group-hover:scale-105" alt="" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight">{chat.name}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-40 font-medium">{chat.lastMessage}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <p className="text-[10px] text-gray-400 font-black uppercase">{chat.time}</p>
                                                {chat.unread > 0 && (
                                                    <span className="flex items-center justify-center min-w-[20px] h-5 bg-primary-600 text-white text-[10px] rounded-full px-1.5 font-black shadow-lg shadow-primary-500/30">
                                                        {chat.unread}
                                                    </span>
                                                )}
                                                <FiChevronRight className="text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                squads.map(squad => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={squad._id}
                                    >
                                        <Link
                                            href={`/squads/${squad._id}/chat`}
                                            className="flex items-center justify-between p-5 bg-white dark:bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-100/50 dark:border-gray-700/30 hover:border-primary-500/50 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-blue-600 rounded-[22px] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform">
                                                    {squad.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{squad.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <FiUsers className="w-3 h-3 text-gray-400" />
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{squad.members?.length} collaborators</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                                                <FiChevronRight className="text-gray-300 group-hover:text-primary-600" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            )}

                            {!loading && (activeTab === 'direct' ? conversations.length === 0 : squads.length === 0) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16 px-6"
                                >
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200/50 dark:border-gray-700/50 ring-8 ring-gray-100/50 dark:ring-gray-800/30">
                                        <FiMessageCircle className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Silence is Golden?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No active {activeTab} conversations found in your hub.</p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right Area: Empty State / Chat Preview */}
                    <div className="hidden lg:flex lg:col-span-8 bg-white/70 dark:bg-gray-800/30 backdrop-blur-xl rounded-[40px] border border-white/50 dark:border-gray-700/50 shadow-2xl items-center justify-center p-12 overflow-hidden relative">
                        {/* Decorative background for empty state */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 border border-primary-500/10 rounded-full blur-3xl animate-[pulse_8s_infinite]" />
                        </div>

                        <div className="text-center max-w-sm relative z-10">
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="w-28 h-28 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-[35px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-primary-500/40 relative"
                            >
                                <FiSend className="w-12 h-12" />
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                </div>
                            </motion.div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight uppercase">Ready for Sync?</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-10 font-medium">
                                Select a collaborator or squad from the list to start building the future. Your messages are secured and synced in real-time.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                    <div className="text-xs font-black text-primary-500 mb-1 uppercase">Direct Chat</div>
                                    <div className="text-[10px] text-gray-400">1v1 Secure Channels</div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                    <div className="text-xs font-black text-blue-500 mb-1 uppercase">Squad Sync</div>
                                    <div className="text-[10px] text-gray-400">Group Collaboration</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
