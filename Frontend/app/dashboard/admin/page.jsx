'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiUsers,
    FiTrendingUp,
    FiLogOut,
    FiSearch,
    FiFilter,
    FiDownload,
    FiUser,
    FiMail,
    FiCalendar,
    FiUserCheck,
    FiUserX,
    FiTrash2,
    FiRefreshCw,
    FiAlertTriangle,
    FiToggleLeft,
    FiToggleRight,
    FiShield
} from 'react-icons/fi';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isInitialized, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null); // Track which user action is loading

    // Check if user is admin — redirect if not
    useEffect(() => {
        if (isInitialized && user && user.role !== 'admin') {
            toast.error('Admin access required');
            router.push('/dashboard/student');
        }
        if (isInitialized && !user) {
            router.push('/auth/login');
        }
    }, [user, isInitialized, router]);

    // Fetch stats and users with timeout
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            // Fetch stats
            const statsRes = await api.get('/admin/stats', { signal: controller.signal });
            // Handle both old and new response formats
            const statsData = statsRes.data.users ? {
                totalUsers: statsRes.data.users.total,
                totalStudents: statsRes.data.users.students,
                totalMentors: statsRes.data.users.mentors,
                usersThisMonth: statsRes.data.users.monthlyGrowth
            } : statsRes.data;
            setStats(statsData);

            // Fetch users
            const usersRes = await api.get(`/admin/users?page=${page}&limit=10`, { signal: controller.signal });
            setUsers(usersRes.data.users || []);
            setTotalPages(usersRes.data.totalPages || 1);
            setFilteredUsers(usersRes.data.users || []);

            clearTimeout(timeoutId);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
                setError('Request timed out. The server may be starting up — please try again.');
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Authentication failed. Please log in again.');
            } else {
                setError(err.response?.data?.message || 'Failed to load admin data. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user, fetchData]);

    // Filter users by search and role
    useEffect(() => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [searchTerm, roleFilter, users]);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone and will remove all their associated data.')) {
            return;
        }

        try {
            setActionLoading(userId);
            await api.delete(`/admin/users/${userId}`);
            toast.success('User deleted successfully');
            // Refresh users list
            const usersRes = await api.get(`/admin/users?page=${page}&limit=10`);
            setUsers(usersRes.data.users || []);
            setTotalPages(usersRes.data.totalPages || 1);
        } catch (err) {
            console.error('Error deleting user:', err);
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            setActionLoading(userId);
            await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
            toast.success(`User ${action}d successfully`);
            // Update user in local state
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isActive: !currentStatus } : u
            ));
        } catch (err) {
            console.error('Error updating user status:', err);
            toast.error(err.response?.data?.message || `Failed to ${action} user`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const handleDownloadCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Role', 'Created At', 'Profile Status', 'Account Status'];
        const data = users.map(u => [
            u._id,
            u.fullName,
            u.email,
            u.role,
            new Date(u.createdAt).toLocaleDateString(),
            u.isProfileComplete ? 'Complete' : 'Incomplete',
            u.isActive !== false ? 'Active' : 'Suspended'
        ]);

        const csv = [
            headers.join(','),
            ...data.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV downloaded');
    };

    // Wait for auth to initialize
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Initializing...</p>
                </div>
            </div>
        );
    }

    // Not logged in or not admin — don't render admin content
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center space-y-4">
                    <FiShield className="w-12 h-12 text-red-500" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">Admin Access Required</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Welcome, {user.fullName}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        <FiLogOut /> Logout
                    </button>
                </motion.div>

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
                    >
                        <div className="flex items-start gap-4">
                            <FiAlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-red-800 dark:text-red-200 font-semibold mb-1">
                                    Failed to Load Data
                                </h3>
                                <p className="text-red-600 dark:text-red-300 text-sm mb-4">
                                    {error}
                                </p>
                                <button
                                    onClick={fetchData}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                                >
                                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                                    {loading ? 'Retrying...' : 'Retry'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Grid */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                        Total Users
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stats.totalUsers ?? 0}
                                    </p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                    <FiUsers className="text-2xl text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                        Students
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stats.totalStudents ?? 0}
                                    </p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                                    <FiUser className="text-2xl text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                        Mentors
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stats.totalMentors ?? 0}
                                    </p>
                                </div>
                                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                                    <FiUserCheck className="text-2xl text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                        This Month
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stats.usersThisMonth ?? 0}
                                    </p>
                                </div>
                                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                                    <FiTrendingUp className="text-2xl text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Users Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Registered Users
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
                                title="Refresh data"
                            >
                                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={handleDownloadCSV}
                                disabled={users.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                            >
                                <FiDownload /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <FiFilter className="text-gray-400" />
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Students</option>
                                <option value="mentor">Mentors</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <FiUsers className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                {searchTerm || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filter criteria' : 'Users will appear here once they register'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Name
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Email
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Role
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Status
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Joined
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u, idx) => (
                                            <motion.tr
                                                key={u._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={u.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.fullName}`}
                                                            alt={u.fullName}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {u.fullName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                                                    {u.email}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        : u.role === 'mentor'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        }`}>
                                                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {u.isActive !== false ? (
                                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <FiUserCheck /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                            <FiUserX /> Suspended
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1">
                                                        <FiCalendar className="w-4 h-4" />
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {u._id !== user._id && (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                                                                disabled={actionLoading === u._id}
                                                                className={`p-2 rounded-lg transition disabled:opacity-50 ${
                                                                    u.isActive !== false
                                                                        ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                                }`}
                                                                title={u.isActive !== false ? 'Suspend User' : 'Activate User'}
                                                            >
                                                                {u.isActive !== false ? (
                                                                    <FiToggleRight className="w-5 h-5" />
                                                                ) : (
                                                                    <FiToggleLeft className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u._id)}
                                                                disabled={actionLoading === u._id}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                                                                title="Delete User"
                                                            >
                                                                <FiTrash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {page} of {totalPages} • Showing {filteredUsers.length} users
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
