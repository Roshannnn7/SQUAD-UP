'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import socketService from '@/lib/socket';
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
                // Direct messages could be based on bookings for now
                const res = await api.get('/bookings');
                // Group by user
                const chats = res.data.map(b => {
                    const otherUser = user.role === 'student' ? b.mentor : b.student;
                    return {
                        id: otherUser._id,
                        name: otherUser.fullName,
                        photo: otherUser.profilePhoto,
                        lastMessage: 'Tap to start conversation',
                        time: new Date(b.createdAt).toLocaleDateString(),
                        unread: 0
                    };
                });
                // Remove duplicates
                const uniqueChats = Array.from(new Map(chats.map(item => [item['id'], item])).values());
                setConversations(uniqueChats);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Sidebar / List area */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
                            <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('direct')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'direct' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
                                >
                                    Direct
                                </button>
                                <button
                                    onClick={() => setActiveTab('squads')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'squads' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
                                >
                                    Squads
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="input-field pl-10 h-12 text-sm"
                            />
                        </div>

                        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 custom-scrollbar">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)
                            ) : activeTab === 'direct' ? (
                                conversations.map(chat => (
                                    <Link
                                        key={chat.id}
                                        href={`/messages/${chat.id}`}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 border border-transparent hover:border-primary-100 transition-all group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <img src={chat.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} className="w-12 h-12 rounded-full border-2 border-white" alt="" />
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{chat.name}</h3>
                                                <p className="text-xs text-gray-500 truncate w-32">{chat.lastMessage}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold mb-1">{chat.time}</p>
                                            {chat.unread > 0 && <span className="inline-block w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full text-center leading-4 font-bold">{chat.unread}</span>}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                squads.map(squad => (
                                    <Link
                                        key={squad._id}
                                        href={`/squads/${squad._id}/chat`}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 border border-transparent hover:border-primary-100 transition-all group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-lg">
                                                {squad.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{squad.name}</h3>
                                                <p className="text-xs text-gray-500">{squad.members?.length} active members</p>
                                            </div>
                                        </div>
                                        <FiChevronRight className="text-gray-300 group-hover:text-primary-500" />
                                    </Link>
                                ))
                            )}

                            {!loading && (activeTab === 'direct' ? conversations.length === 0 : squads.length === 0) && (
                                <div className="text-center py-10 opacity-50">
                                    <FiMessageCircle className="mx-auto w-10 h-10 mb-2" />
                                    <p className="text-sm">No active chats found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Preview / Emptystate */}
                    <div className="hidden lg:flex lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl items-center justify-center p-10">
                        <div className="text-center max-w-xs">
                            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary-500 mx-auto mb-6">
                                <FiSend className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a conversation</h2>
                            <p className="text-gray-500 text-sm">Pick a squad or a direct chat to start collaborating with your team.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
