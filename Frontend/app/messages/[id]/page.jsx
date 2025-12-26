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
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchProfileAndMessages();

        const token = localStorage.getItem('token');
        socketService.connect(token);
        socketService.joinUserRoom(user._id);

        const handleNewMessage = (message) => {
            // Only append if it's from the other user or me to the other user
            if (message.sender._id === id || (message.sender._id === user._id && message.receiver === id)) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
            }
        };

        socketService.on('new-private-message', handleNewMessage);

        return () => {
            socketService.off('new-private-message');
        };
    }, [id]);

    const fetchProfileAndMessages = async () => {
        try {
            setLoading(true);
            // We need a route to get user profile by ID if we don't have one
            // For now, let's assume getMe or some profile route exists
            const [userRes, messagesRes] = await Promise.all([
                api.get(`/auth/profile/${id}`).catch(() => ({ data: { fullName: 'User', _id: id } })), // Fallback
                api.get(`/api/messages/private/${id}`)
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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socketService.sendPrivateMessage({
            receiverId: id,
            senderId: user._id,
            content: newMessage,
            messageType: 'text'
        });

        setNewMessage('');
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <Navbar />

            <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col mt-16 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.push('/messages')} className="p-2 hover:bg-gray-50 rounded-full transition-colors lg:hidden">
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <img src={otherUser?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.fullName}`} className="w-10 h-10 rounded-full" alt="" />
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white leading-tight">{otherUser?.fullName}</h2>
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full"><FiPhoneCall className="w-5 h-5" /></button>
                        <button className="p-3 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200 transition-colors"><FiVideo className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-400"><FiMoreVertical className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender?._id === user?._id;
                        return (
                            <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${isMe ? 'bg-primary-600 text-white rounded-2xl rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none'} p-4 text-sm shadow-sm`}>
                                    {msg.content}
                                    <p className={`text-[10px] mt-2 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                        <button type="button" className="p-2 text-gray-400"><FiPlus className="w-6 h-6" /></button>
                        <input
                            type="text"
                            placeholder="Write a message..."
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary-500"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
                            <FiSend className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
