'use client';

import { useState, useEffect } from 'react';
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
    FiUserX
} from 'react-icons/fi';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Check if user is admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            toast.error('Admin access required');
            router.push('/dashboard/student');
        }
    }, [user, router]);

    // Fetch stats and users
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch stats
                const statsRes = await api.get('/admin/stats');
                // Handle both old and new response formats
                const statsData = statsRes.data.users ? {
                    totalUsers: statsRes.data.users.total,
                    totalStudents: statsRes.data.users.students,
                    totalMentors: statsRes.data.users.mentors,
                    usersThisMonth: statsRes.data.users.monthlyGrowth
                } : statsRes.data;
                setStats(statsData);

                // Fetch users
                const usersRes = await api.get(`/admin/users?page=${page}&limit=10`);
                setUsers(usersRes.data.users || []);
                setTotalPages(usersRes.data.totalPages || 1);
                setFilteredUsers(usersRes.data.users || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user, page]);

    // Filter users by search and role
    useEffect(() => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [searchTerm, roleFilter, users]);

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const handleDownloadCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Role', 'Created At', 'Profile Status'];
        const data = users.map(u => [
            u._id,
            u.fullName,
            u.email,
            u.role,
            new Date(u.createdAt).toLocaleDateString(),
            u.isProfileComplete ? 'Complete' : 'Incomplete'
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
        toast.success('CSV downloaded');
    };

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
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
                                        {stats.totalUsers}
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
                                        {stats.totalStudents}
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
                                        {stats.totalMentors}
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
                                        {stats.usersThisMonth}
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
                        <button
                            onClick={handleDownloadCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            <FiDownload /> Export CSV
                        </button>
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
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No users found
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
                                                Profile Status
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Joined
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
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        u.role === 'admin'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : u.role === 'mentor'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    }`}>
                                                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {u.isProfileComplete ? (
                                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <FiUserCheck /> Complete
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                            <FiUserX /> Incomplete
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1">
                                                        <FiCalendar className="w-4 h-4" />
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </div>
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
