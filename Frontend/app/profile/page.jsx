'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiUser, FiMail, FiCamera, FiGithub, FiLinkedin, FiBriefcase, FiSettings,
    FiShield, FiLogOut, FiGlobe, FiMapPin, FiBook, FiPlus, FiTrash2, FiEye, FiZap,
    FiGrid, FiHeart, FiMessageCircle, FiEdit3, FiSave
} from 'react-icons/fi';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('posts');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileData, setProfileData] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        headline: '',
        bio: '',
        location: { city: '', country: '' },
        profilePhoto: '',
        socialLinks: { github: '', linkedin: '', portfolio: '' },
        privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showSkills: true,
            showConnections: true
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profiles/me');
                const p = res.data.data;
                setProfileData(p);
                setFormData({
                    fullName: p.fullName || '',
                    headline: p.headline || '',
                    bio: p.bio || '',
                    location: p.location || { city: '', country: '' },
                    profilePhoto: p.profilePhoto || '',
                    socialLinks: p.socialLinks || { github: '', linkedin: '', portfolio: '' },
                    privacy: p.privacy || {
                        profileVisibility: 'public',
                        showEmail: false,
                        showSkills: true,
                        showConnections: true
                    }
                });
            } catch (error) {
                console.error('Fetch profile error:', error);
            }
        };
        fetchProfile();
    }, []);

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

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        try {
            setUploading(true);
            const storageRef = ref(storage, `profile-photos/${user._id}_${Date.now()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', null,
                (error) => {
                    console.error('Upload error:', error);
                    toast.error('Failed to upload image');
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setFormData(prev => ({ ...prev, profilePhoto: downloadURL }));
                    await api.put('/profiles', { profilePhoto: downloadURL });
                    toast.success('Profile photo updated!');
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
            await api.put('/profiles', formData);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            // Refresh local data
            const res = await api.get('/profiles/me');
            setProfileData(res.data.data);
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                {/* Header Section (Instagram Style) */}
                <div className="flex flex-col md:flex-row items-center md:items-start md:gap-20 mb-12">
                    {/* Left: Avatar */}
                    <div className="relative group mb-8 md:mb-0">
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                            <img
                                src={formData.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-950 shadow-lg"
                                alt=""
                            />
                        </div>
                        <label className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-xl cursor-pointer hover:scale-110 transition-transform">
                            {uploading ? <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent animate-spin rounded-full" /> : <FiCamera />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                            <h1 className="text-3xl font-light text-gray-900 dark:text-white truncate max-w-[300px]">
                                {user?.fullName?.toLowerCase().replace(/\s+/g, '_') || 'username'}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-6 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-sm rounded-lg transition-colors"
                                >
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                                <Link href={`/profile/${user?._id}`} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                                    <FiEye />
                                </Link>
                                <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg" onClick={() => setActiveTab('settings')}>
                                    <FiSettings />
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-center md:justify-start gap-10 mb-6">
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-lg">{profileData?.connectionCount || 0}</span>
                                <span className="text-gray-500 text-sm">connections</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-lg">{profileData?.points || 0}</span>
                                <span className="text-gray-500 text-sm">points</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-lg">{profileData?.experiences?.length || 0}</span>
                                <span className="text-gray-500 text-sm">exp</span>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="space-y-1">
                            {isEditing ? (
                                <div className="space-y-4 max-w-md">
                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-800 py-1 font-bold text-sm focus:outline-none focus:border-primary-500"
                                        placeholder="Display Name"
                                    />
                                    <input
                                        name="headline"
                                        value={formData.headline}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-800 py-1 text-sm focus:outline-none"
                                        placeholder="Headline (Profession)"
                                    />
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-sm focus:outline-none"
                                        placeholder="Bio (What describes you?)"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            name="location.city"
                                            value={formData.location.city}
                                            onChange={handleChange}
                                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-800 py-1 text-xs"
                                            placeholder="City"
                                        />
                                        <input
                                            name="socialLinks.portfolio"
                                            value={formData.socialLinks.portfolio}
                                            onChange={handleChange}
                                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-800 py-1 text-xs text-blue-600"
                                            placeholder="Portfolio URL"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading}
                                        className="w-full py-2 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-bold text-gray-900 dark:text-white">{formData.fullName}</h2>
                                    <p className="text-sm text-gray-500">
                                        {formData.headline || (profileData?.studentInfo ? `${profileData.studentInfo.degree} @ ${profileData.studentInfo.college}` : profileData?.mentorInfo ? `${profileData.mentorInfo.title} @ ${profileData.mentorInfo.organization}` : user?.role)}
                                    </p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line mt-2">{formData.bio}</p>
                                    {formData.socialLinks?.portfolio && (
                                        <a href={formData.socialLinks.portfolio} target="_blank" rel="noreferrer" className="text-blue-900 dark:text-blue-400 font-bold text-sm block hover:underline">
                                            {formData.socialLinks.portfolio.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2">
                                        <FiMapPin /> {formData.location?.city || 'Globe'}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="border-t border-gray-200 dark:border-gray-800">
                    <div className="flex justify-center gap-12 -mt-px relative">
                        {[
                            { id: 'posts', label: 'POSTS', icon: <FiGrid /> },
                            { id: 'experience', label: 'EXPERIENCE', icon: <FiBriefcase /> },
                            { id: 'saved', label: 'SAVED', icon: <FiGrid className="rotate-90" /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 py-4 border-t-2 transition-all text-xs font-bold tracking-widest
                                    ${activeTab === tab.id
                                        ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500'}`}
                            >
                                <span className="text-lg">{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'posts' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-3 gap-1 md:gap-8"
                                >
                                    {profileData?.recentPosts?.length > 0 ? profileData.recentPosts.map((post, idx) => (
                                        <div key={idx} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden relative group cursor-pointer">
                                            <div className="w-full h-full flex items-center justify-center p-4 text-xs text-center text-gray-400 truncate italic">
                                                {post.content.substring(0, 50)}...
                                            </div>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-6">
                                                <span className="flex items-center gap-1.5 font-bold"><FiHeart className="fill-white" /> {post.likeCount}</span>
                                                <span className="flex items-center gap-1.5 font-bold"><FiMessageCircle className="fill-white" /> {post.commentCount}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-3 text-center py-20">
                                            <div className="w-20 h-20 border-2 border-gray-900 dark:border-white rounded-full flex items-center justify-center mx-auto mb-6">
                                                <FiCamera className="text-3xl" />
                                            </div>
                                            <h3 className="text-2xl font-bold">No posts yet</h3>
                                            <p className="text-gray-500 mt-2">When you share posts, they'll appear here.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'experience' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6 max-w-2xl mx-auto"
                                >
                                    {profileData?.experiences?.map((exp, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-primary-600 shadow-sm"><FiBriefcase /></div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                                                <p className="text-sm text-gray-600">{exp.company}</p>
                                                <p className="text-xs text-gray-500 mt-1">{exp.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!profileData?.experiences || profileData.experiences.length === 0) && (
                                        <p className="text-center text-gray-500 py-10">Add your professional experiences to your profile.</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Account Settings Modal could go here or as a separate page */}
            {activeTab === 'settings' && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-8 border border-gray-100 dark:border-gray-800"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FiShield className="text-primary-500" /> Account Settings</h3>
                        <div className="space-y-4">
                            <button onClick={logout} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-all font-bold group">
                                <div className="flex items-center gap-3"><FiLogOut /> <span>Sign Out</span></div>
                                <FiPlus className="rotate-45" />
                            </button>
                            <button onClick={() => setActiveTab('posts')} className="w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-sm">Close</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
