'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageSquare, FiShare2, FiMoreVertical, FiCheck, FiSend, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from './auth-provider';

export default function PostCard({ post, onUpdate }) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false); // In real app, check if post.likes contains user.id
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/${post._id}/like`);
            setIsLiked(res.data.data.liked);
            setLikeCount(prev => res.data.data.liked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await api.get(`/posts/${post._id}/comments`);
            setComments(res.data.data);
        } catch (error) {
            console.error('Fetch comments error:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        try {
            setIsSubmitting(true);
            const res = await api.post(`/posts/${post._id}/comments`, {
                content: commentContent
            });
            setComments([res.data.data, ...comments]);
            setCommentContent('');
            toast.success('Comment added!');
        } catch (error) {
            console.error('Comment error:', error);
            toast.error('Failed to add comment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleComments = () => {
        setIsCommentOpen(!isCommentOpen);
        if (!isCommentOpen && comments.length === 0) {
            fetchComments();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6"
        >
            {/* Post Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <img
                        src={post.author.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.fullName}`}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-primary-100 dark:border-primary-900/30"
                        alt=""
                    />
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors cursor-pointer">
                            {post.author.fullName}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <p>{post.author.headline || 'Student'}</p>
                            <span>•</span>
                            <p className="flex items-center gap-1">
                                <FiClock /> {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                    <FiMoreVertical />
                </button>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </p>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mt-4 rounded-2xl overflow-hidden">
                        <img
                            src={post.mediaUrls[0].url}
                            className="w-full h-auto object-cover max-h-96"
                            alt="Post content"
                        />
                    </div>
                )}

                {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {post.hashtags.map(tag => (
                            <span key={tag} className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline cursor-pointer">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Stats */}
            <div className="px-6 py-3 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <FiHeart className="w-3 h-3 text-primary-600" />
                        </div>
                        {likeCount}
                    </span>
                    <span className="hover:underline cursor-pointer" onClick={toggleComments}>
                        {post.commentCount || 0} comments
                    </span>
                </div>
                <div>
                    {post.viewCount || 0} views
                </div>
            </div>

            {/* Post Actions */}
            <div className="px-6 py-2 border-t border-gray-50 dark:border-gray-800/50 flex items-center space-x-1">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl transition-colors font-medium text-sm
                        ${isLiked ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    <FiHeart className={isLiked ? 'fill-current' : ''} />
                    <span>Like</span>
                </button>
                <button
                    onClick={toggleComments}
                    className="flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                    <FiMessageSquare />
                    <span>Comment</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm">
                    <FiShare2 />
                    <span>Share</span>
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {isCommentOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50"
                    >
                        <div className="p-4 space-y-4">
                            {/* Comment Input */}
                            <form onSubmit={handleCommentSubmit} className="flex gap-3">
                                <img
                                    src={user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                                    className="w-10 h-10 rounded-xl"
                                    alt=""
                                />
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-2 px-4 pr-12 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !commentContent.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 disabled:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                                    >
                                        <FiSend />
                                    </button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-4 mt-6">
                                {comments.map(comment => (
                                    <div key={comment._id} className="flex gap-3">
                                        <img
                                            src={comment.author.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.fullName}`}
                                            className="w-8 h-8 rounded-lg"
                                            alt=""
                                        />
                                        <div className="flex-1">
                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h5 className="font-bold text-xs text-gray-900 dark:text-white">
                                                        {comment.author.fullName}
                                                    </h5>
                                                    <span className="text-[10px] text-gray-500">
                                                        {formatDistanceToNow(new Date(comment.createdAt))}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {comment.content}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-1 ml-2 text-[10px] font-bold text-gray-500">
                                                <button className="hover:text-primary-600">Like</button>
                                                <button className="hover:text-primary-600">Reply</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {comments.length === 0 && !isSubmitting && (
                                    <p className="text-center text-xs text-gray-500 py-4">No comments yet. Be the first to comment!</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
