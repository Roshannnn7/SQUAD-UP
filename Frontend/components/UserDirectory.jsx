'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { FiSearch, FiMapPin, FiBriefcase, FiZap, FiArrowRight, FiFilter, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import ConnectionButton from './ConnectionButton';

export default function UserDirectory() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [skills, setSkills] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const fetchUsers = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pageNum);
            params.append('limit', 12);
            if (query) params.append('query', query);
            if (skills) params.append('skills', skills);
            if (roleFilter) params.append('role', roleFilter);

            const { data } = await api.get(`/profiles/search?${params.toString()}`);
            setUsers(data.data);
            setTotalPages(data.pagination.pages);
            setPage(pageNum);
        } catch (error) {
            console.error('Fetch users error:', error);
            toast.error('Failed to load user directory');
        } finally {
            setLoading(false);
        }
    }, [query, skills, roleFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [query, skills, fetchUsers]);

    const getStatusColor = (status) => {
        const colors = {
            online: 'bg-green-500',
            away: 'bg-amber-500',
            busy: 'bg-red-500',
            offline: 'bg-gray-400',
        };
        return colors[status] || colors.offline;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-6 border border-primary-100 dark:border-primary-900/20"
                    >
                        <FiZap /> <span>Find your Squad</span>
                    </motion.div>
                    <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                        Student <span className="gradient-text">Directory</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                        Connect with ambitious students, find project partners, and grow your professional network in the SQUAD UP community.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="glassmorphism p-4 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl mb-12 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors text-xl" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Find students by name or headline..."
                            className="w-full pl-16 pr-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                        />
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`px-8 py-4 rounded-3xl border transition-all flex items-center justify-center gap-2 font-bold
                            ${isFilterOpen ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        <FiFilter /> <span>Filters</span>
                    </button>
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-12"
                        >
                            <div className="glassmorphism p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Filter by Skills</label>
                                    <input
                                        type="text"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        placeholder="React, Python, Figma..."
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Search Role</label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">All Students</option>
                                        <option value="student">Undergraduate</option>
                                        <option value="mentor">Graduate</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => { setQuery(''); setSkills(''); setRoleFilter(''); }}
                                        className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Users Grid */}
                {loading && page === 1 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="glassmorphism p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 animate-pulse space-y-4">
                                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-3xl mx-auto" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 mx-auto" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 mx-auto" />
                                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {users.map((user) => (
                                <motion.div
                                    key={user._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -8 }}
                                    className="glassmorphism p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:border-primary-500/50 transition-all group shadow-sm hover:shadow-2xl"
                                >
                                    <div className="relative mb-6">
                                        <Link href={`/profile/${user._id}`}>
                                            <div className="relative inline-block cursor-pointer">
                                                <img
                                                    src={user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                                                    className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-white dark:ring-gray-800 group-hover:ring-primary-500/30 transition-all"
                                                    alt={user.fullName}
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white dark:border-gray-800 rounded-full ${getStatusColor(user.status)}`} />
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="text-center mb-6">
                                        <Link href={`/profile/${user._id}`}>
                                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white truncate hover:text-primary-600 transition-colors">
                                                {user.fullName}
                                            </h3>
                                        </Link>
                                        <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-1 truncate uppercase tracking-widest">
                                            {user.headline || (user.studentInfo ? `${user.studentInfo.degree} @ ${user.studentInfo.college}` : user.mentorInfo ? `${user.mentorInfo.title} @ ${user.mentorInfo.organization}` : 'Ambassador')}
                                        </p>

                                        <div className="flex flex-col items-center gap-2 mt-4 text-[10px] text-gray-500 font-bold">
                                            <span className="flex items-center gap-1 uppercase tracking-tighter"><FiMapPin /> {user.location?.city || 'Globe'}</span>
                                            <span className="flex items-center gap-1 uppercase tracking-tighter"><FiBriefcase /> {user.connectionCount || 0} Connections</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-1.5 mb-8 min-h-[50px]">
                                        {user.skills?.slice(0, 3).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-lg"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {user.skills?.length > 3 && (
                                            <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/10 text-primary-600 text-[10px] font-bold rounded-lg">
                                                +{user.skills.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <ConnectionButton userId={user._id} initialStatus="none" />
                                        <Link href={`/profile/${user._id}`} className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-gray-500 hover:text-primary-600 transition-all group/link">
                                            <span>View Profile</span> <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-3 mt-16 font-bold">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => fetchUsers(p)}
                                        className={`w-12 h-12 rounded-2xl border transition-all
                                            ${page === p
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}

                        {users.length === 0 && !loading && (
                            <div className="text-center py-20 glassmorphism rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <FiUser className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No students found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters to find more students.</p>
                                <button onClick={() => { setQuery(''); setSkills(''); setRoleFilter(''); }} className="btn-primary mt-8 py-3 px-8">Refresh Directory</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
