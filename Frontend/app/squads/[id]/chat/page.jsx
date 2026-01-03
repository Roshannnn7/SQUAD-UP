'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import socketService from '@/lib/socket';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiSend,
    FiPlus,
    FiSmile,
    FiPaperclip,
    FiArrowLeft,
    FiUsers,
    FiSettings,
    FiCpu
} from 'react-icons/fi';

export default function ProjectChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchProjectAndMessages();

        // Connect socket
        const token = localStorage.getItem('token');
        socketService.connect(token);
        socketService.joinProjectRoom(id);

        const handleNewMessage = (message) => {
            setMessages((prev) => {
                // Prevent duplicate messages
                if (prev.some(m => m._id === message._id)) return prev;
                return [...prev, message];
            });
            setTimeout(scrollToBottom, 50);
        };

        const handleTypingIndicator = (data) => {
            if (data.userId === user?._id) return;

            setTypingUsers((prev) => {
                if (data.isTyping) {
                    if (prev.find(u => u.id === data.userId)) return prev;
                    return [...prev, { id: data.userId, name: data.userName }];
                } else {
                    return prev.filter(u => u.id !== data.userId);
                }
            });
        };

        socketService.on('new-project-message', handleNewMessage);
        socketService.on('user-typing-indicator', handleTypingIndicator);

        return () => {
            socketService.leaveProjectRoom(id);
            socketService.off('new-project-message');
            socketService.off('user-typing-indicator');
        };
    }, [id, user?._id]);

    const fetchProjectAndMessages = async () => {
        try {
            setLoading(true);
            const [projectRes, messagesRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/messages/project/${id}`)
            ]);
            setProject(projectRes.data);
            setMessages(messagesRes.data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load chat history.');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        socketService.emit('user-typing', {
            roomId: id,
            userId: user?._id,
            userName: user?.fullName
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socketService.emit('user-stop-typing', {
                roomId: id,
                userId: user?._id
            });
        }, 2000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socketService.emit('user-stop-typing', {
            roomId: id,
            userId: user?._id
        });

        socketService.sendProjectMessage({
            projectId: id,
            senderId: user?._id,
            content: newMessage,
            messageType: 'text'
        });

        setNewMessage('');
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full flex mt-16 overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10 bg-white dark:bg-gray-800">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push(`/squads/${id}`)}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white leading-tight">
                                    {project?.name}
                                </h2>
                                <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Squad Hub
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                                <FiUsers className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                                <FiSettings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender?._id === user?._id;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg._id || idx}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isMe && (
                                        <img
                                            src={msg.sender?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.fullName}`}
                                            className="w-8 h-8 rounded-full mr-2 self-end mb-1"
                                            alt=""
                                        />
                                    )}
                                    <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                                        {!isMe && (
                                            <p className="text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">
                                                {msg.sender?.fullName}
                                            </p>
                                        )}
                                        <div
                                            className={`p-3 rounded-2xl text-sm ${isMe
                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Typing Indicators */}
                        <AnimatePresence>
                            {typingUsers.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center space-x-2 text-xs text-gray-400 ml-10 italic"
                                >
                                    <div className="flex space-x-1">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span>
                                        {typingUsers.length === 1
                                            ? `${typingUsers[0].name} is typing...`
                                            : `${typingUsers.length} people are typing...`}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Field */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <FiPlus className="w-5 h-5" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                                    value={newMessage}
                                    onChange={handleTyping}
                                />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FiSmile className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <FiSend className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Sidebar (Desktop Only) */}
                <div className="hidden lg:block w-80 bg-gray-50/50 dark:bg-gray-900/50 border-l border-gray-100 dark:border-gray-800 p-6 overflow-y-auto">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                            <FiCpu className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{project?.name}</h3>
                        <p className="text-sm text-gray-500 mt-2">Squad Leaders: {project?.creator?.fullName}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Members ({project?.members?.length})</h4>
                            <div className="space-y-3">
                                {project?.members?.map((member) => (
                                    <div key={member.user._id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <img
                                                src={member.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.fullName}`}
                                                className="w-8 h-8 rounded-full"
                                                alt=""
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{member.user?.fullName}</span>
                                        </div>
                                        {member.role === 'leader' && <span className="text-[8px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase">Lead</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Description</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {project?.description}
                            </p>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors mt-10">
                            Leave Squad
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
