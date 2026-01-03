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
    FiArrowLeft,
    FiVideo,
    FiMoreVertical,
    FiSmile,
    FiPlus,
    FiPhoneCall
} from 'react-icons/fi';

export default function PrivateChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchProfileAndMessages();

        const token = localStorage.getItem('token');
        socketService.connect(token);
        socketService.joinUserRoom(user?._id);

        const handleNewMessage = (message) => {
            // Only append if it's from the other user or me to the other user
            if (message.sender._id === id || (message.sender._id === user?._id && message.receiver === id)) {
                setMessages((prev) => {
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
                setTimeout(scrollToBottom, 50);
            }
        };

        const handleTypingIndicator = (data) => {
            if (data.userId === id) {
                setIsTyping(data.isTyping);
                setTimeout(scrollToBottom, 50);
            }
        };

        socketService.on('new-private-message', handleNewMessage);
        socketService.on('user-typing-indicator', handleTypingIndicator);

        return () => {
            socketService.off('new-private-message');
            socketService.off('user-typing-indicator');
        };
    }, [id, user?._id]);

    const fetchProfileAndMessages = async () => {
        try {
            setLoading(true);
            const [userRes, messagesRes] = await Promise.all([
                api.get(`/auth/profile/${id}`).catch(() => ({ data: { fullName: 'User', _id: id } })),
                api.get(`/messages/private/${id}`)
            ]);
            setOtherUser(userRes.data);
            setMessages(messagesRes.data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Fetch error:', error);
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
            receiverId: id,
            userId: user?._id,
            userName: user?.fullName
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socketService.emit('user-stop-typing', {
                receiverId: id,
                userId: user?._id
            });
        }, 2000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socketService.emit('user-stop-typing', {
            receiverId: id,
            userId: user?._id
        });

        socketService.sendPrivateMessage({
            receiverId: id,
            senderId: user?._id,
            content: newMessage,
            messageType: 'text'
        });

        setNewMessage('');
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <Navbar />

            <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col mt-16 bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10 bg-white dark:bg-gray-800">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.push('/messages')} className="p-2 hover:bg-gray-50 rounded-full transition-colors lg:hidden">
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img src={otherUser?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.fullName}`} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" alt="" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white leading-tight">{otherUser?.fullName}</h2>
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Now</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><FiPhoneCall className="w-5 h-5" /></button>
                        <button className="p-3 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200 transition-colors shadow-sm"><FiVideo className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><FiMoreVertical className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <FiSend className="w-16 h-16 mb-4" />
                            <p>No messages yet. Send a wave!</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender?._id === user?._id;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={msg._id || idx}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] ${isMe ? 'bg-primary-600 text-white rounded-2xl rounded-br-none shadow-primary-500/10' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none shadow-sm'} p-4 text-sm shadow-sm relative group`}>
                                        {msg.content}
                                        <p className={`text-[9px] mt-2 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}

                    <AnimatePresence>
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center space-x-2 text-[11px] text-gray-400 italic"
                            >
                                <div className="flex space-x-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                                <span>{otherUser?.fullName} is typing...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                        <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><FiPlus className="w-6 h-6" /></button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
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
                            className="p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            <FiSend className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
