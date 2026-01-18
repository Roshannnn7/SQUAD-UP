'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    setDoc
} from 'firebase/firestore';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiSend,
    FiArrowLeft,
    FiVideo,
    FiMoreVertical,
    FiSmile,
    FiPlus,
    FiPhoneCall,
    FiPaperclip
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
        if (!user?._id || !id) return;

        fetchProfile();

        // Generate a unique conversation ID for two users
        const conversationId = [user._id, id].sort().join('_');

        // Listen to messages
        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data(),
                content: doc.data().text,
                sender: { _id: doc.data().senderId },
                createdAt: doc.data().createdAt?.toDate()
            }));
            setMessages(msgs);
            setTimeout(scrollToBottom, 50);
        });

        return () => unsubscribe();
    }, [id, user?._id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/auth/profile/${id}`).catch(() => ({ data: { fullName: 'User', _id: id } }));
            setOtherUser(res.data);
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
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const conversationId = [user._id, id].sort().join('_');

            // 1. Send to Firebase for real-time
            await addDoc(
                collection(db, "conversations", conversationId, "messages"),
                {
                    text: newMessage,
                    senderId: user?._id,
                    senderName: user?.fullName,
                    createdAt: serverTimestamp()
                }
            );

            // 2. Sync with backend MongoDB so it shows up in Inbox/Conversations list
            await api.post('/messages/private', {
                receiverId: id,
                content: newMessage
            });

            setNewMessage('');
        } catch (error) {
            console.error('Send error:', error);
            toast.error('Failed to send message.');
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 shadow-xl shadow-primary-500/20"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden selection:bg-primary-500/30">
            <Navbar />

            <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col mt-20 mb-6 bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl shadow-2xl rounded-[40px] overflow-hidden relative border border-white/50 dark:border-gray-700/30">

                {/* Header */}
                <div className="p-6 border-b border-gray-100/50 dark:border-gray-700/50 flex items-center justify-between z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                    <div className="flex items-center space-x-5">
                        <button onClick={() => router.push('/messages')} className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all shadow-sm active:scale-90">
                            <FiArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div className="flex items-center space-x-4">
                            <div className="relative group">
                                <img src={otherUser?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.fullName}`} className="w-12 h-12 rounded-[20px] object-cover ring-2 ring-white dark:ring-gray-700 shadow-md group-hover:scale-110 transition-transform" alt="" />
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></span>
                            </div>
                            <div>
                                <h2 className="font-black text-xl text-gray-900 dark:text-white leading-tight uppercase tracking-tight">{otherUser?.fullName}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Active Connection</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="p-4 bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all shadow-sm active:scale-90"><FiPhoneCall className="w-5 h-5" /></button>
                        <button className="p-4 bg-primary-600/10 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><FiVideo className="w-5 h-5" /></button>
                        <button className="p-4 text-gray-400 hover:text-gray-600 rounded-2xl transition-colors"><FiMoreVertical className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar pb-32">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                            <FiSend className="w-20 h-20 mb-6 animate-bounce" />
                            <p className="font-black uppercase tracking-widest text-sm">Send a transmission</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender?._id === user?._id;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    key={msg._id || idx}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] group relative`}>
                                        <div className={`px-5 py-4 rounded-[24px] text-sm shadow-sm transition-all hover:shadow-md ${isMe
                                            ? 'bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-br-none shadow-primary-500/20'
                                            : 'bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600/30'} font-medium leading-relaxed`}>
                                            {msg.content}
                                        </div>
                                        <div className={`flex items-center gap-2 mt-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
                                            </p>
                                            {isMe && <div className="w-1 h-1 bg-primary-400 rounded-full" />}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}

                    <AnimatePresence>
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center space-x-3 text-[10px] text-gray-400 font-black uppercase tracking-widest"
                            >
                                <div className="flex space-x-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-blue-500">{otherUser?.fullName} is typing...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-gray-100/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md absolute bottom-0 left-0 right-0">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-4 max-w-3xl mx-auto">
                        <button type="button" className="p-4 bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:text-primary-500 rounded-2xl transition-all active:scale-95"><FiPlus className="w-6 h-6" /></button>
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                placeholder="Type a secure message..."
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-[22px] px-6 py-4 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                value={newMessage}
                                onChange={handleTyping}
                            />
                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors">
                                <FiSmile className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-[22px] hover:shadow-xl hover:shadow-primary-500/30 shadow-lg transition-all active:scale-90 disabled:opacity-30 disabled:grayscale"
                        >
                            <FiSend className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
