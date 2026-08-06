'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUserPlus, FiStar, FiCheckCircle } from 'react-icons/fi';

export default function SquadMentorsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invitingId, setInvitingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [projRes, mentorsRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get('/mentors') // Gets all mentors
            ]);
            setProject(projRes.data);
            setMentors(mentorsRes.data.mentors || mentorsRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (mentorId) => {
        try {
            setInvitingId(mentorId);
            await api.post(`/projects/${id}/mentors/invite`, { mentorId });
            toast.success('Mentor successfully invited and added!');
            fetchData(); // Refresh to show them as added
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to invite mentor');
        } finally {
            setInvitingId(null);
        }
    };

    const isMember = project?.members?.some(m => m.user._id === user?._id);
    const isAdmin = project?.members?.some(m => m.user._id === user?._id && ['admin', 'moderator'].includes(m.role));

    if (loading) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>;
    }

    // Filter mentors to separate those already in the squad
    const squadMentorIds = project?.members?.filter(m => m.role === 'mentor').map(m => m.user._id) || [];
    const availableMentors = mentors.filter(m => !squadMentorIds.includes(m.user._id));
    const currentMentors = mentors.filter(m => squadMentorIds.includes(m.user._id));

    if (!isMember) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 text-center">
                <Navbar />
                <h1 className="text-2xl font-bold">You must be a member to view this page.</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => router.back()} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <FiStar className="text-yellow-500" /> Squad Mentorship
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Bring expert guidance directly into your squad's workflow</p>
                    </div>
                </div>

                {currentMentors.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Current Squad Mentors</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentMentors.map(mentor => (
                                <div key={mentor._id} className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-3xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-yellow-500"><FiStar className="w-16 h-16" /></div>
                                    <div className="flex items-center gap-4 mb-4 relative z-10">
                                        <img src={mentor.user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user.fullName}`} className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover" alt="" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{mentor.user.fullName}</h3>
                                            <p className="text-yellow-600 dark:text-yellow-500 text-sm font-semibold">{mentor.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg w-fit">
                                        <FiCheckCircle /> Active Mentor
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Available Mentors to Invite</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableMentors.map(mentor => (
                            <div key={mentor._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 hover:shadow-xl transition-all group flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={mentor.user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user.fullName}`} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{mentor.user.fullName}</h3>
                                        <p className="text-gray-500 text-xs font-semibold">{mentor.title}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 flex-1">{mentor.bio}</p>
                                
                                <div className="flex flex-wrap gap-1 mb-6">
                                    {mentor.expertise.slice(0, 3).map((skill, i) => (
                                        <span key={i} className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">{skill}</span>
                                    ))}
                                    {mentor.expertise.length > 3 && <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">+{mentor.expertise.length - 3}</span>}
                                </div>

                                {isAdmin ? (
                                    <button 
                                        onClick={() => handleInvite(mentor.user._id)}
                                        disabled={invitingId === mentor.user._id}
                                        className="w-full btn-primary bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 py-3 flex items-center justify-center gap-2"
                                    >
                                        <FiUserPlus /> {invitingId === mentor.user._id ? 'Inviting...' : 'Invite to Squad'}
                                    </button>
                                ) : (
                                    <button disabled className="w-full bg-gray-100 dark:bg-gray-800 text-gray-400 py-3 rounded-xl text-sm font-bold">
                                        Only Admins Can Invite
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
