'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSearch, FaUserPlus, FaGithub, FaLinkedin, FaTrophy } from 'react-icons/fa';

export default function UserDirectory() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search) {
                fetchUsers();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (roleFilter) params.role = roleFilter;
            if (search) params.search = search;

            const { data } = await axios.get('/api/user-enhancements/directory', { params });
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            online: 'bg-green-500',
            away: 'bg-yellow-500',
            busy: 'bg-red-500',
            offline: 'bg-gray-400',
        };
        return colors[status] || colors.offline;
    };

    const getRoleColor = (role) => {
        const colors = {
            student: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            mentor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        };
        return colors[role] || colors.student;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    User Directory
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Connect with students and mentors in the SquadUp community
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or bio..."
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Roles</option>
                        <option value="student">Students</option>
                        <option value="mentor">Mentors</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {/* Users Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                            >
                                {/* Profile Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="relative">
                                        <img
                                            src={user.profilePhoto || '/default-avatar.png'}
                                            alt={user.fullName}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                        {/* Status indicator */}
                                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(user.status)}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate">{user.fullName}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Bio */}
                                {user.bio && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                        {user.bio}
                                    </p>
                                )}

                                {/* Custom Status */}
                                {user.customStatus && (
                                    <div className="mb-4 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                            "{user.customStatus}"
                                        </p>
                                    </div>
                                )}

                                {/* Skills */}
                                {user.skills && user.skills.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.skills.slice(0, 4).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {user.skills.length > 4 && (
                                                <span className="px-2 py-1 text-xs text-gray-500">
                                                    +{user.skills.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Social Links & Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex gap-2">
                                        {user.socialLinks?.github && (
                                            <a
                                                href={user.socialLinks.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            >
                                                <FaGithub className="w-4 h-4" />
                                            </a>
                                        )}
                                        {user.socialLinks?.linkedin && (
                                            <a
                                                href={user.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            >
                                                <FaLinkedin className="w-4 h-4 text-blue-600" />
                                            </a>
                                        )}
                                    </div>

                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <FaUserPlus />
                                        Connect
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {users.length === 0 && !loading && (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                No users found
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
