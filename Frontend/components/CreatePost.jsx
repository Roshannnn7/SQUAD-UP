'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage, FiVideo, FiPaperclip, FiBriefcase, FiHash, FiGlobe, FiChevronDown } from 'react-icons/fi';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from './auth-provider';

import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function CreatePost({ onPostCreated }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState('');
    const [mediaUrls, setMediaUrls] = useState([]);
    const [visibility, setVisibility] = useState('public');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && mediaUrls.length === 0) return;

        try {
            setIsSubmitting(true);
            const res = await api.post('/posts', {
                content,
                mediaUrls,
                visibility,
                hashtags: content.match(/#[a-z0-9_]+/gi)?.map(tag => tag.slice(1)) || []
            });
            toast.success('Post shared successfully!');
            setContent('');
            setMediaUrls([]);
            setIsOpen(false);
            if (onPostCreated) onPostCreated(res.data.data);
        } catch (error) {
            console.error('Create post error:', error);
            toast.error('Failed to share post.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMediaUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const storageRef = ref(storage, `post-media/${user._id}_${Date.now()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', null,
                (error) => {
                    console.error('Upload error:', error);
                    toast.error('Failed to upload media');
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setMediaUrls([...mediaUrls, { url: downloadURL, type: file.type.startsWith('image/') ? 'image' : 'video' }]);
                    toast.success('Media uploaded!');
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error('Media upload error:', error);
            setUploading(false);
        }
    };

    return (
        <div className="mb-6">
            {/* Trigger Box */}
            <div className="glassmorphism p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center space-x-4">
                    <img
                        src={user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                        className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                        alt=""
                    />
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex-1 text-left px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all font-medium text-sm"
                    >
                        Start a post, share an achievement...
                    </button>
                </div>
                <div className="flex items-center justify-between mt-4 px-2">
                    <label className="flex items-center space-x-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 py-2 px-3 rounded-xl transition-all font-bold text-xs cursor-pointer">
                        <FiImage className="text-xl" /> <span>Photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleMediaUpload} />
                    </label>
                    <label className="flex items-center space-x-2 text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/10 py-2 px-3 rounded-xl transition-all font-bold text-xs cursor-pointer">
                        <FiVideo className="text-xl" /> <span>Video</span>
                        <input type="file" className="hidden" accept="video/*" onChange={handleMediaUpload} />
                    </label>
                    <button onClick={() => setIsOpen(true)} className="flex items-center space-x-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 py-2 px-3 rounded-xl transition-all font-bold text-xs">
                        <FiBriefcase className="text-xl" /> <span>Job</span>
                    </button>
                    <button onClick={() => setIsOpen(true)} className="hidden sm:flex items-center space-x-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 py-2 px-3 rounded-xl transition-all font-bold text-xs">
                        <FiPaperclip className="text-xl" /> <span>Document</span>
                    </button>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl glassmorphism rounded-3xl z-[70] shadow-2xl border border-white/20 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create a post</h3>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <img
                                            src={user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                                            className="w-14 h-14 rounded-2xl object-cover"
                                            alt=""
                                        />
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{user?.fullName}</h4>
                                            <button
                                                type="button"
                                                onClick={() => setVisibility(visibility === 'public' ? 'connections' : 'public')}
                                                className="flex items-center space-x-1 px-3 py-1 rounded-full border border-gray-400 text-gray-500 text-[10px] font-bold mt-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all uppercase tracking-wider"
                                            >
                                                <FiGlobe /> <span>{visibility}</span> <FiChevronDown />
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="What do you want to talk about?"
                                        className="w-full bg-transparent border-none focus:ring-0 text-lg text-gray-700 dark:text-gray-300 min-h-[150px] resize-none pb-4"
                                        autoFocus
                                    />

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {mediaUrls.map((media, idx) => (
                                            <div key={idx} className="relative group">
                                                <img src={media.url} className="w-20 h-20 rounded-xl object-cover border border-gray-200" alt="" />
                                                <button
                                                    type="button"
                                                    onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FiX className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setContent(content + ' #')}
                                        className="text-primary-600 font-bold text-sm flex items-center gap-1 hover:underline"
                                    >
                                        <FiHash /> Add hashtag
                                    </button>
                                </div>

                                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        <label className={`p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {uploading ? <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent animate-spin rounded-full" /> : <FiImage className="w-5 h-5" />}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleMediaUpload} disabled={uploading} />
                                        </label>
                                        <label className={`p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <FiVideo className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="video/*" onChange={handleMediaUpload} disabled={uploading} />
                                        </label>
                                        <button type="button" className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                                            <FiPaperclip className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || uploading || (!content.trim() && mediaUrls.length === 0)}
                                        className="btn-primary py-2 px-8 font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
