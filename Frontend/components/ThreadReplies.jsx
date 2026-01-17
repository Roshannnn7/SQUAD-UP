'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaReply, FaTimes } from 'react-icons/fa';
import MessageReactions from './MessageReactions';

export default function ThreadReplies({ parentMessage, currentUserId, projectId }) {
    const [replies, setReplies] = useState([]);
    const [showThread, setShowThread] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showThread) {
            fetchReplies();
        }
    }, [showThread]);

    const fetchReplies = async () => {
        try {
            const { data } = await axios.get(`/api/message-enhancements/${parentMessage._id}/thread`);
            setReplies(data);
        } catch (error) {
            console.error('Error fetching replies:', error);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || loading) return;

        setLoading(true);
        try {
            await axios.post(`/api/message-enhancements/${parentMessage._id}/reply`, {
                content: replyText,
                messageType: 'text',
            });
            setReplyText('');
            await fetchReplies();
            toast.success('Reply sent!');
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Reply button */}
            <button
                onClick={() => setShowThread(!showThread)}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
                <FaReply />
                <span>{parentMessage.threadReplyCount || 0} replies</span>
            </button>

            {/* Thread modal */}
            <AnimatePresence>
                {showThread && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowThread(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Thread</h3>
                                <button
                                    onClick={() => setShowThread(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Parent message */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-start gap-3">
                                    <img
                                        src={parentMessage.sender.profilePhoto || '/default-avatar.png'}
                                        alt={parentMessage.sender.fullName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{parentMessage.sender.fullName}</p>
                                        <p className="text-sm mt-1">{parentMessage.content}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                {replies.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No replies yet. Be the first to reply!
                                    </p>
                                ) : (
                                    replies.map((reply) => (
                                        <div key={reply._id} className="flex items-start gap-3 group">
                                            <img
                                                src={reply.sender.profilePhoto || '/default-avatar.png'}
                                                alt={reply.sender.fullName}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                                                    <p className="font-medium text-sm">{reply.sender.fullName}</p>
                                                    <p className="text-sm mt-1">{reply.content}</p>
                                                </div>
                                                <div className="mt-1 px-2">
                                                    <MessageReactions
                                                        messageId={reply._id}
                                                        currentUserId={currentUserId}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Reply input */}
                            <form onSubmit={handleSendReply} className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!replyText.trim() || loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
