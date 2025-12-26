'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { FiSearch, FiFilter, FiStar, FiCheckCircle, FiAward } from 'react-icons/fi';
import Link from 'next/link';

export default function MentorsPage() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expertise, setExpertise] = useState('');

    useEffect(() => {
        fetchMentors();
    }, [expertise]);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const res = await api.get('/mentors', {
                params: {
                    search,
                    expertise,
                }
            });
            setMentors(res.data);
        } catch (error) {
            console.error('Fetch mentors error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMentors();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Find a Mentor</h1>
                    <p className="text-gray-600 dark:text-gray-400">Connect with industry experts for 1-on-1 mentorship and career guidance.</p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, role, or company..."
                            className="input-field pl-12 h-14"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="flex gap-4">
                        <select
                            className="input-field h-14 min-w-[180px]"
                            value={expertise}
                            onChange={(e) => setExpertise(e.target.value)}
                        >
                            <option value="">All Expertise</option>
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="UI/UX">UI/UX</option>
                            <option value="Mobile">Mobile</option>
                            <option value="Web3">Web3</option>
                            <option value="System Design">System Design</option>
                        </select>

                        <button className="btn-secondary h-14 flex items-center space-x-2">
                            <FiFilter />
                            <span>More Filters</span>
                        </button>
                    </div>
                </div>

                {/* Mentors Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[400px] skeleton rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mentors.map((mentor) => (
                            <motion.div
                                key={mentor._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                className="glassmorphism p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="relative">
                                        <img
                                            src={mentor.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user?.fullName}`}
                                            alt={mentor.user?.fullName}
                                            className="w-20 h-20 rounded-2xl object-cover"
                                        />
                                        {mentor.isVerified && (
                                            <FiCheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-primary-500 bg-white dark:bg-gray-900 rounded-full fill-current" />
                                        )}
                                    </div>
                                    <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                                        <FiStar className="fill-current" />
                                        <span>{mentor.rating || '5.0'}</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {mentor.user?.fullName}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10 line-clamp-2">
                                        {mentor.currentRole} @ <span className="font-semibold text-gray-800 dark:text-gray-200">{mentor.company}</span>
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {mentor.expertise?.slice(0, 3).map((item, idx) => (
                                            <span key={idx} className="tag text-xs">
                                                {item}
                                            </span>
                                        ))}
                                        {mentor.expertise?.length > 3 && (
                                            <span className="text-xs text-gray-500 font-medium">+{mentor.expertise.length - 3} more</span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 line-clamp-2 italic">
                                        {mentor.bio}
                                    </p>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex items-center justify-between mt-auto">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Session Price</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">₹{mentor.sessionPrice} <span className="text-sm font-normal text-gray-500">/ hr</span></p>
                                    </div>
                                    <Link href={`/mentors/${mentor.user._id}`} className="btn-primary py-2 px-6 text-sm">
                                        View Profile
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && mentors.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiSearch className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No mentors found</h3>
                        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
