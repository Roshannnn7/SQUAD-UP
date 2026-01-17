'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const COMMON_EMOJIS = ['👍', '❤️', '🎉', '😊', '🚀', '👏', '🔥', '💯'];

export default function MessageReactions({ messageId, currentUserId }) {
    const [reactions, setReactions] = useState({});
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReactions();
    }, [messageId]);

    const fetchReactions = async () => {
        try {
            const { data } = await axios.get(`/api/message-enhancements/${messageId}/reactions`);
            setReactions(data);
        } catch (error) {
            console.error('Error fetching reactions:', error);
        }
    };

    const handleReaction = async (emoji) => {
        if (loading) return;
        setLoading(true);

        try {
            await axios.post(`/api/message-enhancements/${messageId}/react`, { emoji });
            await fetchReactions();
            setShowPicker(false);
        } catch (error) {
            toast.error('Failed to add reaction');
        } finally {
            setLoading(false);
        }
    };

    const totalReactions = Object.values(reactions).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <div className="relative inline-flex items-center gap-1">
            {/* Display reactions */}
            <div className="flex items-center gap-1">
                {Object.entries(reactions).map(([emoji, users]) => {
                    const hasReacted = users.some(u => u.user._id === currentUserId);

                    return (
                        <motion.button
                            key={emoji}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReaction(emoji)}
                            className={`
                                px-2 py-1 rounded-full text-sm flex items-center gap-1
                                transition-all duration-200
                                ${hasReacted
                                    ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }
                            `}
                        >
                            <span>{emoji}</span>
                            <span className="text-xs font-medium">{users.length}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Add reaction button */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPicker(!showPicker)}
                    className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
                >
                    <span className="text-sm">➕</span>
                </motion.button>

                {/* Emoji Picker */}
                <AnimatePresence>
                    {showPicker && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                        >
                            <div className="grid grid-cols-4 gap-1">
                                {COMMON_EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReaction(emoji)}
                                        disabled={loading}
                                        className="w-10 h-10 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-xl transition-colors disabled:opacity-50"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Click outside to close */}
            {showPicker && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPicker(false)}
                />
            )}
        </div>
    );
}
