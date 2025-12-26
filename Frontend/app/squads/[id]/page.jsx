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
    FiCpu,
    FiTrendingUp,
    FiMessageSquare,
    FiPlus,
    FiGithub,
    FiArrowLeft,
    FiCalendar,
    FiCheckCircle,
    FiTrello,
    FiVideo
} from 'react-icons/fi';
import Link from 'next/link';

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        } catch (error) {
            console.error('Fetch project error:', error);
            toast.error('Failed to load project details.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setIsJoining(true);
            await api.post(`/projects/${id}/join`);
            toast.success('Joined project successfully!');
            fetchProjectDetails();
        } catch (error) {
            console.error('Join error:', error);
            toast.error(error.response?.data?.message || 'Failed to join project.');
        } finally {
            setIsJoining(false);
        }
    };

    const isMember = project?.members?.some(m => m.user._id === currentUser?._id);
    const isLeader = project?.creator?._id === currentUser?._id;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project not found</h2>
                <button onClick={() => router.push('/squads')} className="btn-primary">Back to Squads</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <Link href="/squads" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors">
                    <FiArrowLeft className="mr-2" />
                    Back to Explorers
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-4 rounded-2xl bg-primary-100 text-primary-600">
                                        <FiCpu className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{project.name}</h1>
                                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><FiCalendar /> Started {new Date(project.createdAt).toLocaleDateString()}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-10">
                                {project.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Skills Needed</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.skillsRequired?.map((skill, idx) => (
                                            <span key={idx} className="tag px-4 py-2 bg-gray-100 text-gray-700">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">GitHub Repository</h3>
                                    {project.githubRepo ? (
                                        <a href={project.githubRepo} target="_blank" className="flex items-center space-x-3 p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-colors">
                                            <FiGithub className="w-6 h-6" />
                                            <span className="font-medium truncate">{project.githubRepo.replace('https://github.com/', '')}</span>
                                        </a>
                                    ) : (
                                        <p className="text-gray-500 italic p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">No repository linked yet.</p>
                                    )}
                                </div>
                            </div>

                            {isMember && (
                                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
                                    <Link href={`/squads/${id}/chat`} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                                        <FiMessageSquare className="w-8 h-8 mb-2" />
                                        <span className="font-bold">Team Chat</span>
                                    </Link>
                                    <Link href={`/squads/${id}/tasks`} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                                        <FiTrello className="w-8 h-8 mb-2" />
                                        <span className="font-bold">Tasks</span>
                                    </Link>
                                    <Link href={`/squads/${id}/call`} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                        <FiVideo className="w-8 h-8 mb-2" />
                                        <span className="font-bold">Huddle</span>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Squad Members</h3>
                                <span className="text-sm font-bold text-primary-600">{project.members?.length} / {project.maxMembers}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {project.members?.map((member, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={member.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.fullName}`}
                                                alt={member.user?.fullName}
                                                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{member.user?.fullName}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">{member.role}</p>
                                            </div>
                                        </div>
                                        {member.role === 'leader' && <FiCheckCircle className="text-primary-500 w-4 h-4 fill-current" />}
                                    </div>
                                ))}
                            </div>

                            {!isMember ? (
                                <button
                                    onClick={handleJoin}
                                    disabled={isJoining || project.members?.length >= project.maxMembers}
                                    className="w-full btn-primary py-4 font-bold disabled:opacity-50"
                                >
                                    {isJoining ? 'Joining...' : project.members?.length >= project.maxMembers ? 'Squad Full' : 'Join Squad'}
                                </button>
                            ) : (
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl text-green-700 font-bold">
                                    You are a member!
                                </div>
                            )}
                        </motion.div>

                        {/* Progress Card */}
                        <div className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white">Overall Progress</h3>
                                <span className="text-primary-600 font-bold">{project.progress}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    className="h-full bg-primary-600 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
