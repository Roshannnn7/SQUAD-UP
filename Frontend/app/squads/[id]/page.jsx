'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiUsers,
    FiCalendar,
    FiTrendingUp,
    FiGithub,
    FiMessageSquare,
    FiUserPlus,
    FiSettings,
    FiShield,
    FiStar,
    FiClock,
    FiList,
    FiActivity,
} from 'react-icons/fi';
import Link from 'next/link';

export default function SquadDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joinReason, setJoinReason] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        } catch (error) {
            console.error('Error fetching project:', error);
            toast.error('Failed to load squad details');
        } finally {
            setLoading(false);
        }
    };

    const isMember = project?.members?.some(
        (member) => member.user._id === user?._id
    );

    const isAdmin = project?.members?.some(
        (member) => member.user._id === user?._id && member.role === 'admin'
    );

    const isModerator = project?.members?.some(
        (member) => member.user._id === user?._id && member.role === 'moderator'
    );

    const handleJoin = async () => {
        if (!user) {
            toast.error('Please login to join squads');
            router.push('/auth/login');
            return;
        }

        if (project.requireJoinApproval) {
            setShowJoinModal(true);
            return;
        }

        try {
            setJoining(true);
            await api.post(`/projects/${id}/join`);
            toast.success('Successfully joined the squad!');
            fetchProjectDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join squad');
        } finally {
            setJoining(false);
        }
    };

    const handleJoinRequest = async () => {
        if (!joinReason.trim()) {
            toast.error('Please provide a reason for joining');
            return;
        }

        try {
            setJoining(true);
            await api.post(`/projects/${id}/join`, { reason: joinReason });
            toast.success('Join request submitted! Waiting for approval.');
            setShowJoinModal(false);
            setJoinReason('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setJoining(false);
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: { icon: FiShield, color: 'text-red-600 bg-red-100 dark:bg-red-900/30', label: 'Admin' },
            moderator: { icon: FiStar, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', label: 'Moderator' },
            member: { icon: FiUsers, color: 'text-gray-600 bg-gray-100 dark:bg-gray-800', label: 'Member' },
        };
        const badge = badges[role] || badges.member;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="animate-spin h-12 w-12 border-b-2 border-primary-600 rounded-full" />
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Squad not found</h1>
                    <Link href="/squads" className="btn-primary">
                        Back to Squads
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {project.name}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.skillsRequired?.map((skill, idx) => (
                                    <span key={idx} className="tag">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <FiUsers className="w-4 h-4" />
                                    <span>{project.members?.length} / {project.maxMembers} members</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiTrendingUp className="w-4 h-4" />
                                    <span>{project.progress}% complete</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiCalendar className="w-4 h-4" />
                                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {isMember ? (
                                <>
                                    <Link href={`/squads/${id}/chat`} className="btn-primary flex items-center gap-2">
                                        <FiMessageSquare />
                                        Open Chat
                                    </Link>
                                    {(isAdmin || isModerator) && (
                                        <Link href={`/squads/${id}/settings`} className="btn-secondary flex items-center gap-2">
                                            <FiSettings />
                                            Squad Settings
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    disabled={joining || project.members?.length >= project.maxMembers}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiUserPlus />
                                    {joining ? 'Joining...' : project.requireJoinApproval ? 'Request to Join' : 'Join Squad'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <div className="glassmorphism rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiList />
                                About This Squad
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
                                </div>
                                {project.githubRepo && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Repository</h3>
                                        <a
                                            href={project.githubRepo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                        >
                                            <FiGithub />
                                            View on GitHub
                                        </a>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Status</h3>
                                    <span className={`tag ${project.status === 'in-progress' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' :
                                            project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Members */}
                        <div className="glassmorphism rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiUsers />
                                Squad Members ({project.members?.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {project.members?.map((member) => (
                                    <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                                            {member.user.fullName?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {member.user.fullName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getRoleBadge(member.role)}
                                                <span className="text-xs text-gray-500">
                                                    <FiClock className="inline w-3 h-3 mr-1" />
                                                    {new Date(member.joinedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Creator */}
                        <div className="glassmorphism rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Squad Creator</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
                                    {project.creator?.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {project.creator?.fullName}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {project.creator?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="glassmorphism rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiActivity />
                                Quick Stats
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Members</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {project.members?.length} / {project.maxMembers}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{project.progress}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Visibility</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {project.isPublic ? 'Public' : 'Private'}
                                    </span>
                                </div>
                                {project.requireJoinApproval && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Join Approval</span>
                                        <span className="tag bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30">Required</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Join Request Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glassmorphism rounded-2xl p-6 max-w-md w-full"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Request to Join Squad
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            This squad requires approval to join. Please provide a reason why you'd like to join.
                        </p>
                        <textarea
                            value={joinReason}
                            onChange={(e) => setJoinReason(e.target.value)}
                            placeholder="I'm interested in joining because..."
                            className="input-field w-full h-32 mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleJoinRequest}
                                disabled={joining}
                                className="btn-primary flex-1"
                            >
                                {joining ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
