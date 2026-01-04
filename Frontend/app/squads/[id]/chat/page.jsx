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
    FiCpu,
    FiMessageCircle,
    FiVideo
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 shadow-xl shadow-primary-500/20"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden selection:bg-primary-500/30">
            <Navbar />

            {/* Content Area */}
            <div className="flex-1 max-w-[1600px] mx-auto w-full flex mt-16 overflow-hidden relative">

                {/* Decoration */}
                <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex-1 flex flex-col bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl shadow-2xl overflow-hidden relative border-x border-gray-100/50 dark:border-gray-700/30">

                    {/* Header */}
                    <div className="p-5 border-b border-gray-100/50 dark:border-gray-700/50 flex items-center justify-between z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                        <div className="flex items-center space-x-5">
                            <button
                                onClick={() => router.push(`/squads/${id}`)}
                                className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-90 group"
                            >
                                <FiArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                            </button>
                            <div>
                                <h2 className="font-black text-xl text-gray-900 dark:text-white leading-tight tracking-tight uppercase">
                                    {project?.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <p className="text-[10px] text-green-500 font-black tracking-widest uppercase">
                                        Squad Hub Active
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="flex -space-x-2 overflow-hidden mr-4">
                                {project?.members?.slice(0, 3).map((m, i) => (
                                    <img
                                        key={i}
                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                                        src={m.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.fullName}`}
                                        alt=""
                                    />
                                ))}
                                {project?.members?.length > 3 && (
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 text-[10px] font-bold">
                                        +{project?.members?.length - 3}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => router.push(`/squads/${id}/call`)}
                                className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                                title="Start Squad Sync Video Call"
                            >
                                <FiVideo className="w-5 h-5 group-hover:animate-pulse" />
                            </button>
                            <button className="p-3 bg-primary-600/10 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all">
                                <FiSettings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
                        {messages.length === 0 && !loading && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                <FiMessageCircle className="w-20 h-20 mb-4" />
                                <p className="font-black uppercase tracking-widest text-sm">Initiate Communication</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const isMe = msg.sender?._id === user?._id;
                            const prevMsg = idx > 0 ? messages[idx - 1] : null;
                            const showAvatar = !isMe && prevMsg?.sender?._id !== msg.sender?._id;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    key={msg._id || idx}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${!showAvatar && !isMe ? 'ml-12' : ''}`}
                                >
                                    {!isMe && showAvatar && (
                                        <img
                                            src={msg.sender?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.fullName}`}
                                            className="w-10 h-10 rounded-2xl mr-3 self-end shadow-sm ring-2 ring-white dark:ring-gray-700"
                                            alt=""
                                        />
                                    )}
                                    <div className={`max-w-[70%] group`}>
                                        {!isMe && showAvatar && (
                                            <p className="text-[10px] font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">
                                                {msg.sender?.fullName}
                                            </p>
                                        )}
                                        <div
                                            className={`px-5 py-3.5 rounded-[22px] text-sm shadow-sm transition-all hover:shadow-md ${isMe
                                                ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600/30'
                                                }`}
                                        >
                                            <p className="leading-relaxed font-medium">{msg.content}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 mt-1.5 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
                                            </p>
                                            {isMe && <div className="w-1 h-1 bg-primary-400 rounded-full" />}
                                        </div>
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
                                    className="flex items-center space-x-3 text-[10px] text-gray-400 ml-1 font-black uppercase tracking-widest"
                                >
                                    <div className="flex space-x-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-full backdrop-blur-sm">
                                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-blue-500">
                                        {typingUsers.length === 1
                                            ? `${typingUsers[0].name} is typing...`
                                            : `${typingUsers.length} elite hackers are typing...`}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-gray-100/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md absolute bottom-0 left-0 right-0">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-4 max-w-4xl mx-auto">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    placeholder="Type a secure message..."
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-[22px] px-6 py-4 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                    value={newMessage}
                                    onChange={handleTyping}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                    <button type="button" className="p-2 text-gray-400 hover:text-primary-500 transition-colors"><FiSmile className="w-5 h-5" /></button>
                                    <button type="button" className="p-2 text-gray-400 hover:text-primary-500 transition-colors"><FiPaperclip className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-5 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-[22px] hover:shadow-xl hover:shadow-primary-500/30 transition-all active:scale-90 disabled:opacity-30 disabled:grayscale"
                            >
                                <FiSend className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Sidebar (Desktop Only) */}
                <div className="hidden xl:block w-96 bg-transparent p-8 overflow-y-auto">
                    <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-gradient-to-tr from-primary-500/20 to-blue-500/20 rounded-[40px] flex items-center justify-center text-primary-600 mx-auto mb-6 shadow-sm border border-primary-500/10">
                            <FiCpu className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white line-clamp-2 tracking-tight uppercase leading-tight">{project?.name}</h3>
                        <p className="text-xs text-gray-400 mt-3 font-bold uppercase tracking-widest">Squad Leaders: {project?.creator?.fullName}</p>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white/50 dark:bg-gray-800/30 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-700/30 shadow-sm transition-all hover:shadow-md">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Members • {project?.members?.length}</h4>
                            <div className="space-y-4">
                                {project?.members?.map((member) => (
                                    <div key={member.user._id} className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <img
                                                    src={member.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.fullName}`}
                                                    className="w-9 h-9 rounded-xl object-cover transition-transform group-hover:scale-110"
                                                    alt=""
                                                />
                                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors">{member.user?.fullName}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {member.role === 'leader' && <span className="text-[7px] bg-yellow-400/10 text-yellow-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm border border-yellow-400/20">Lead</span>}
                                            {user?._id !== member.user._id && (
                                                <button
                                                    onClick={() => router.push(`/messages/${member.user._id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                                                    title="Message directly"
                                                >
                                                    <FiMessageCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leave Squad Option in Chat Sidebar */}
                        {!isLeader && (
                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm"
                                >
                                    <FiLogOut className="w-4 h-4" />
                                    {isLeaving ? 'Leaving...' : 'Leave Squad'}
                                </button>
                            </div>
                        )}

                        <div className="p-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Description</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic">
                                "{project?.description}"
                            </p>
                        </div>

                        <button className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/5 text-red-500 rounded-[22px] text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/10 hover:shadow-xl hover:shadow-red-500/20 mt-10">
                            Terminate Connection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
