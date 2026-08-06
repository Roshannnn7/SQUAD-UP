'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import CreatePost from '@/components/CreatePost';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiBookmark, FiSearch } from 'react-icons/fi';
import Link from 'next/link';

export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async (pageNum = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/posts/feed?page=${pageNum}&limit=10`);
            const newPosts = res.data.data;
            if (pageNum === 1) {
                setPosts(newPosts);
            } else {
                setPosts([...posts, ...newPosts]);
            }
            setHasMore(newPosts.length === 10);
            setPage(pageNum);
        } catch (error) {
            console.error('Fetch feed error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Sidebar - Profile Summary */}
                    <div className="hidden lg:block lg:w-1/4 space-y-6">
                        <div className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800 text-center overflow-hidden">
                            <div className="h-16 -mx-6 -mt-6 bg-gradient-to-r from-primary-600 to-secondary-600" />
                            <Link href="/profile" className="relative inline-block -mt-10 group">
                                <img
                                    src={user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-gray-900 shadow-lg group-hover:scale-105 transition-transform"
                                    alt=""
                                />
                            </Link>
                            <h2 className="mt-4 font-bold text-gray-900 dark:text-white">{user?.fullName}</h2>
                            <p className="text-xs text-gray-500 mt-1">{user?.headline || 'Add a headline'}</p>

                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-left space-y-4">
                                <Link href="/network" className="flex justify-between items-center text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 -mx-6 px-6 py-2 transition-colors">
                                    <span className="text-gray-500">Connections</span>
                                    <span className="text-primary-600">84</span>
                                </Link>
                                <div className="flex justify-between items-center text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 -mx-6 px-6 py-2 transition-colors cursor-pointer">
                                    <span className="text-gray-500">Post views</span>
                                    <span className="text-primary-600">1.2k</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-left">
                                <Link href="/bookmarks" className="flex items-center space-x-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                    <FiBookmark /> <span>My Items</span>
                                </Link>
                            </div>
                        </div>

                        <div className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Trending Tags</h3>
                            <div className="space-y-3">
                                {['web3', 'ai', 'reactjs', 'career', 'motivation'].map(tag => (
                                    <div key={tag} className="text-xs font-bold text-gray-500 hover:text-primary-600 cursor-pointer flex items-center justify-between">
                                        <span>#{tag}</span>
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px]">124</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle - Feed */}
                    <div className="flex-1 max-w-2xl mx-auto w-full">
                        <CreatePost onPostCreated={handlePostCreated} />

                        <div className="space-y-6">
                            {posts.map(post => (
                                <PostCard key={post._id} post={post} />
                            ))}

                            {loading && (
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="glassmorphism p-6 rounded-3xl animate-pulse space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4" />
                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
                                                </div>
                                            </div>
                                            <div className="h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && hasMore && (
                                <button
                                    onClick={() => fetchPosts(page + 1)}
                                    className="w-full py-4 text-sm font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-2xl transition-all border-2 border-dashed border-primary-100 dark:border-primary-900/30"
                                >
                                    Show More Posts
                                </button>
                            )}

                            {!loading && posts.length === 0 && (
                                <div className="glassmorphism p-12 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                                    <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nothing to show yet</h3>
                                    <p className="text-sm text-gray-500 mt-2">Connect with more people to see their updates in your feed!</p>
                                    <Link href="/directory" className="btn-primary inline-block mt-8 py-3 px-8">Browse Student Directory</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Suggestions */}
                    <div className="hidden xl:block lg:w-1/4 space-y-6">
                        <div className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                                Add to your feed
                                <FiUsers className="text-primary-500" />
                            </h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors cursor-pointer">Student Name</p>
                                                <p className="text-[10px] text-gray-500">Full Stack Developer</p>
                                            </div>
                                        </div>
                                        <button className="p-1 px-3 text-[10px] font-bold border border-primary-600 text-primary-600 rounded-full hover:bg-primary-600 hover:text-white transition-all">
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Link href="/directory" className="flex items-center justify-center space-x-2 text-xs font-bold text-gray-500 hover:text-primary-600 mt-8 group transition-colors">
                                <span>Browse all</span> <FiSearch className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">About SquadUp</h3>
                            <p className="text-[10px] text-gray-500 leading-relaxed capitalize">
                                Help & Support • Privacy Policy • Accessibility • Terms of Service • Guidelines • Language • Career Guidance
                                <br /><br />
                                SquadUp Corporation © 2026
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
