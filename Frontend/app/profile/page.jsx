'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiUser, FiMail, FiCamera, FiGithub, FiLinkedin, FiBriefcase, FiSettings,
    FiShield, FiLogOut, FiGlobe, FiMapPin, FiBook, FiPlus, FiTrash2, FiEye, FiZap,
    FiGrid, FiHeart, FiMessageCircle, FiEdit3, FiSave, FiUsers, FiCheck, FiX, FiSend
} from 'react-icons/fi';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin h-12 w-12 border-b-2 border-primary-600 rounded-full" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}

function ProfileContent() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('userId');
    const [activeTab, setActiveTab] = useState('posts');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);

    const [formData, setFormData] = useState({
        fullName: '',
        headline: '',
        bio: '',
        location: { city: '', country: '' },
        profilePhoto: '',
        socialLinks: { github: '', linkedin: '', portfolio: '' }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const endpoint = (targetUserId && user?.role === 'admin')
                    ? `/profiles/${targetUserId}`
                    : '/profiles/me';
                const res = await api.get(endpoint);
                const p = res.data.data;
                setProfileData(p);
                setFormData({
                    fullName: p.fullName || '',
                    headline: p.headline || '',
                    bio: p.bio || '',
                    location: p.location || { city: '', country: '' },
                    profilePhoto: p.profilePhoto || '',
                    socialLinks: p.socialLinks || { github: '', linkedin: '', portfolio: '' }
                });
            } catch (error) {
                console.error('Fetch profile error:', error);
            }
        };

        const fetchRequests = async () => {
            try {
                const res = await api.get('/connections/pending?type=received');
                setPendingRequests(res.data.data);
            } catch (error) {
                console.error('Fetch requests error:', error);
            }
        };

        fetchProfile();
        fetchRequests();
    }, []);

    const handleAction = async (requestId, action) => {
        try {
            if (action === 'accept') {
                await api.put(`/connections/accept/${requestId}`);
                toast.success('Connection accepted!');
            } else {
                await api.put(`/connections/reject/${requestId}`);
                toast.success('Connection request rejected.');
            }
            // Update UI
            setPendingRequests(prev => prev.filter(r => r._id !== requestId));
            const freshProfile = await api.get('/profiles/me');
            setProfileData(freshProfile.data.data);
        } catch (error) {
            toast.error('Failed to process request');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const storageRef = ref(storage, `profile-photos/${user._id}_${Date.now()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', null,
                (error) => {
                    toast.error('Upload failed');
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setFormData(prev => ({ ...prev, profilePhoto: downloadURL }));
                    await api.put('/profiles', { profilePhoto: downloadURL });
                    toast.success('Photo updated!');
                    setUploading(false);
                }
            );
        } catch (error) {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const payload = { ...formData };
            if (targetUserId && user?.role === 'admin') {
                payload.targetUserId = targetUserId;
            }
            await api.put('/profiles', payload);
            toast.success('Profile updated!');
            setIsEditing(false);

            const endpoint = (targetUserId && user?.role === 'admin')
                ? `/profiles/${targetUserId}`
                : '/profiles/me';
            const res = await api.get(endpoint);
            setProfileData(res.data.data);
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 pt-28 pb-20">
                {/* Hero Profile Section (SquadUp Style) */}
                <div className="glassmorphism rounded-[3rem] p-10 mb-12 border border-white/20 shadow-2xl overflow-hidden relative">
                    {/* Background Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                        {/* Profile Photo - Squircle Style */}
                        <div className="relative">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-48 h-48 rounded-[3rem] p-1.5 bg-gradient-to-br from-primary-500 via-secondary-500 to-purple-600 shadow-2xl"
                            >
                                <img
                                    src={formData.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                                    className="w-full h-full rounded-[2.8rem] object-cover border-4 border-white dark:border-gray-900"
                                    alt="Avatar"
                                />
                            </motion.div>
                            <label className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl cursor-pointer hover:bg-primary-50 transition-colors border border-gray-100 dark:border-gray-700">
                                {uploading ? <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent animate-spin rounded-full" /> : <FiCamera className="text-primary-600 w-5 h-5" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>

                        {/* Core Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                                <h1 className="text-4xl font-black tracking-tight">{formData.fullName}</h1>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="btn-primary py-2 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-500/20"
                                    >
                                        <FiEdit3 /> {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                    <button className="p-3 glassmorphism rounded-2xl hover:scale-110 transition-transform" onClick={() => setActiveTab('settings')}>
                                        <FiSettings className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mb-4 italic">
                                @{(formData.headline || (profileData?.studentInfo ? `${profileData.studentInfo.degree} @ ${profileData.studentInfo.college}` : user?.role)).toLowerCase().replace(/\s+/g, '')}
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-6">
                                <div className="text-center md:text-left">
                                    <p className="text-3xl font-black text-primary-600">{profileData?.connectionCount || 0}</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Connects</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-3xl font-black text-secondary-600">{profileData?.points || 0}</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Score</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-3xl font-black text-purple-600">{profileData?.experiences?.length || 0}</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Growth</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Bio & Networking */}
                    <div className="lg:col-span-1 space-y-10">
                        {/* Bio Card */}
                        <div className="glassmorphism p-8 rounded-[2.5rem]">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <FiZap className="text-yellow-500" /> Vibe Check
                            </h3>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full glassmorphism rounded-2xl p-4 text-sm focus:outline-none min-h-[120px]"
                                    placeholder="Tell your story..."
                                />
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                    {formData.bio || "This squad member is currently formulating their epic bio..."}
                                </p>
                            )}
                            <div className="mt-6 flex items-center gap-4 text-xs font-bold text-gray-500">
                                <span className="flex items-center gap-1.5"><FiMapPin /> {formData.location?.city || 'Undisclosed'}</span>
                                {isEditing && <button onClick={handleUpdate} className="ml-auto text-primary-600 hover:scale-105 transition-transform flex items-center gap-1"><FiSave /> Save</button>}
                            </div>
                        </div>

                        {/* Networking / Pending Requests */}
                        <div className="glassmorphism p-8 rounded-[2.5rem] border-2 border-primary-500/20">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <FiUsers className="text-primary-500" /> Incoming Squad
                                {pendingRequests.length > 0 && <span className="bg-primary-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{pendingRequests.length}</span>}
                            </h3>
                            <div className="space-y-4">
                                {pendingRequests.map(req => (
                                    <div key={req._id} className="flex items-center gap-4 bg-white/50 dark:bg-gray-900/50 p-3 rounded-2xl border border-white/20">
                                        <img src={req.requester.profilePhoto} className="w-10 h-10 rounded-xl object-cover" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-bold truncate">{req.requester.fullName}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{req.requester.headline}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => handleAction(req._id, 'accept')} className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all"><FiCheck /></button>
                                            <button onClick={() => handleAction(req._id, 'reject')} className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"><FiX /></button>
                                        </div>
                                    </div>
                                ))}
                                {pendingRequests.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No pending connections. Go find your squad!</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right: Posts & Exp */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Tabs */}
                        <div className="flex gap-4 p-1.5 glassmorphism rounded-[2rem] w-fit">
                            {[
                                { id: 'posts', label: 'Feed Activity', icon: <FiGrid /> },
                                { id: 'experience', label: 'Career Journey', icon: <FiBriefcase /> },
                                { id: 'squads', label: 'Mutual Squads', icon: <FiUsers /> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all
                                        ${activeTab === tab.id
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                            : 'text-gray-500 hover:bg-white/10'}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="min-h-[400px]"
                            >
                                {activeTab === 'posts' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {profileData?.recentPosts?.map((post, idx) => (
                                            <div key={idx} className="group glassmorphism rounded-3xl p-4 aspect-square flex flex-col justify-between hover:border-primary-500/50 transition-all">
                                                <p className="text-xs italic text-gray-400 line-clamp-4">{post.content}</p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-[10px] font-bold text-primary-500 flex items-center gap-1"><FiHeart className="fill-primary-500" /> {post.likeCount}</span>
                                                    <span className="text-[10px] font-bold text-secondary-500 flex items-center gap-1"><FiMessageCircle /> {post.commentCount}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!profileData?.recentPosts || profileData.recentPosts.length === 0) && (
                                            <div className="col-span-full py-20 text-center glassmorphism rounded-[2.5rem]">
                                                <FiCamera className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                                <p className="text-gray-400 font-bold">Nothing posted in the feed yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'experience' && (
                                    <div className="space-y-6">
                                        {profileData?.experiences?.map((exp, idx) => (
                                            <div key={idx} className="glassmorphism p-6 rounded-3xl flex items-center gap-6 group hover:translate-x-2 transition-transform">
                                                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 text-2xl"><FiBriefcase /></div>
                                                <div>
                                                    <h4 className="font-black text-lg">{exp.title}</h4>
                                                    <p className="text-sm font-bold text-gray-500">{exp.company}</p>
                                                    <p className="text-[10px] text-primary-600 font-bold uppercase mt-1 tracking-tighter">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'squads' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {profileData?.mutualSquads?.map(squad => (
                                            <Link href={`/squads/${squad._id}`} key={squad._id} className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-white/20 hover:scale-[1.02] transition-all group">
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-500">{squad.name}</h4>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-1">{squad.category} • {squad.status}</p>
                                            </Link>
                                        ))}
                                        {(!profileData?.mutualSquads || profileData.mutualSquads.length === 0) && (
                                            <div className="col-span-full py-10 text-center opacity-40">
                                                <div className="w-16 h-16 bg-secondary-500/10 rounded-full flex items-center justify-center text-secondary-500 mx-auto mb-4 text-2xl"><FiUsers /></div>
                                                <p className="text-sm font-bold">No mutual squads found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Logout / Settings Slide-over */}
            <AnimatePresence>
                {activeTab === 'settings' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4"
                        onClick={() => setActiveTab('posts')}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl space-y-8"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-black flex items-center gap-3"><FiShield className="text-primary-500" /> Security</h3>
                            <button onClick={logout} className="w-full flex items-center justify-between p-5 rounded-[2rem] bg-red-50 dark:bg-red-900/10 text-red-600 transition-all font-black group hover:bg-red-500 hover:text-white">
                                <span className="flex items-center gap-4"><FiLogOut /> Sign Out</span>
                                <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button onClick={() => setActiveTab('posts')} className="w-full py-4 glassmorphism rounded-2xl font-black text-sm uppercase tracking-widest">Keep Vibe Alive</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FiArrowRight(props) {
    return <svg {...props} stroke="currentColor" fill="none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
}
