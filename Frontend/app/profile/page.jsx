'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiUser, FiMail, FiCamera, FiGithub, FiLinkedin, FiBriefcase, FiSettings,
    FiShield, FiLogOut, FiGlobe, FiMapPin, FiBook, FiPlus, FiTrash2, FiEye,
    FiGrid, FiHeart, FiMessageCircle, FiEdit3, FiSave, FiUsers, FiCheck, FiX,
    FiAward, FiZap, FiCode, FiTrendingUp, FiTwitter, FiLink, FiBookOpen,
    FiArrowRight, FiInstagram, FiActivity
} from 'react-icons/fi';
import { BsFire } from 'react-icons/bs';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter, useSearchParams } from 'next/navigation';
import ContributionHeatmap from '@/components/ContributionHeatmap';

const CURATED_AVATARS = [
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=alpha&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=beta&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=gamma&backgroundColor=d1f4d0',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=delta&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=epsilon&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=zeta&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=eta&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=theta&backgroundColor=d1f4d0',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=iota&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=kappa&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=lambda&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=mu&backgroundColor=c0aede',
];

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin h-12 w-12 border-b-2 border-violet-500 rounded-full" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}

function ProfileContent() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('journey');
    const [isEditing, setIsEditing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        headline: '',
        bio: '',
        college: '',
        program: '',
        location: { city: '', country: '' },
        profilePhoto: '',
        avatarUrl: '',
        socialLinks: { github: '', linkedin: '', twitter: '', portfolio: '' },
        skills: [],
        privacy: { profileVisibility: 'public', showEmail: false },
    });

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profiles/me');
            const p = res.data.data;
            setProfileData(p);
            setFormData({
                fullName:     p.fullName || '',
                username:     p.username || '',
                headline:     p.headline || '',
                bio:          p.bio || '',
                college:      p.college || p.roleProfile?.college || p.studentInfo?.college || '',
                program:      p.program || (p.roleProfile?.degree && p.roleProfile?.year
                    ? `${p.roleProfile.degree} (Year ${p.roleProfile.year})`
                    : p.roleProfile?.degree || p.studentInfo?.degree || ''),
                location:     p.location || { city: '', country: '' },
                profilePhoto: p.profilePhoto || '',
                avatarUrl:    p.avatarUrl || '',
                socialLinks:  p.socialLinks || { github: '', linkedin: '', twitter: '', portfolio: '' },
                skills:       p.skills || [],
                privacy:      p.privacy || { profileVisibility: 'public', showEmail: false },
            });
        } catch (error) {
            console.error('Fetch profile error:', error);
        }
    };

    useEffect(() => {
        fetchProfile();
        const fetchRequests = async () => {
            try {
                const res = await api.get('/connections/pending?type=received');
                setPendingRequests(res.data.data || []);
            } catch {}
        };
        fetchRequests();
    }, []);

    const handleAction = async (requestId, action) => {
        try {
            if (action === 'accept') {
                await api.put(`/connections/accept/${requestId}`);
                toast.success('Connection accepted!');
            } else {
                await api.put(`/connections/reject/${requestId}`);
                toast.success('Request rejected.');
            }
            setPendingRequests(prev => prev.filter(r => r._id !== requestId));
            fetchProfile();
        } catch {
            toast.error('Failed to process request');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        const trimmed = newSkill.trim();
        if (trimmed && !formData.skills.includes(trimmed)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
        }
        setNewSkill('');
    };

    const handleRemoveSkill = (skill) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            let finalPhotoUrl = '';

            try {
                const formData = new FormData();
                formData.append('file', file);
                const { data } = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                finalPhotoUrl = data.url;
            } catch (uploadErr) {
                console.warn('Backend upload error — using Data URL fallback:', uploadErr.message);
                const reader = new FileReader();
                finalPhotoUrl = await new Promise((res) => {
                    reader.onloadend = () => res(reader.result);
                    reader.readAsDataURL(file);
                });
            }

            setFormData(prev => ({ ...prev, profilePhoto: finalPhotoUrl, avatarUrl: '' }));
            await api.put('/auth/profile', { profilePhoto: finalPhotoUrl, avatarUrl: '' });
            toast.success('Photo updated!');
            setUploading(false);
            fetchProfile();
        } catch (err) {
            console.error('Image upload error:', err);
            toast.error('Failed to update photo');
            setUploading(false);
        }
    };

    const handleAvatarSelect = (url) => {
        setFormData(prev => ({ ...prev, avatarUrl: url, profilePhoto: '' }));
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            await api.put('/auth/profile', {
                fullName:    formData.fullName,
                username:    formData.username,
                headline:    formData.headline,
                bio:         formData.bio,
                college:     formData.college,
                program:     formData.program,
                location:    formData.location,
                profilePhoto: formData.profilePhoto,
                avatarUrl:   formData.avatarUrl,
                socialLinks: formData.socialLinks,
            });
            // Also update via profiles endpoint for skills
            await api.put('/profiles', { skills: formData.skills });
            toast.success('Profile updated!');
            setIsEditing(false);
            setShowSettings(false);
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const displayPhoto = formData.profilePhoto || formData.avatarUrl
        || `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(formData.fullName || 'user')}&backgroundColor=b6e3f4`;

    const squadsCount  = profileData?.roleProfile?.projects?.length || 0;
    const projectCount = (profileData?.experiences || []).filter(e => e.type === 'project').length;

    const TABS = [
        { id: 'journey',   label: 'Career Journey',   icon: <FiBriefcase className="w-3.5 h-3.5" /> },
        { id: 'education', label: 'Education',         icon: <FiBookOpen className="w-3.5 h-3.5" /> },
        { id: 'squads',    label: 'Squads',            icon: <FiUsers className="w-3.5 h-3.5" /> },
        { id: 'badges',    label: 'Badges',            icon: <FiAward className="w-3.5 h-3.5" /> },
        { id: 'activity',  label: 'Activity',           icon: <FiActivity className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 pt-24 pb-20 space-y-6">

                {/* ── Hero Card ─────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden"
                >
                    {/* Cover gradient */}
                    <div className="h-32 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent" />
                    </div>

                    <div className="px-6 pb-6 -mt-16 relative">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                            {/* Avatar */}
                            <div className="relative w-fit">
                                <div className="w-28 h-28 rounded-2xl border-4 border-gray-950 overflow-hidden bg-violet-900 shadow-2xl">
                                    <img
                                        src={displayPhoto}
                                        alt={formData.fullName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.fullName || 'User')}`;
                                        }}
                                    />
                                </div>
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-600 hover:bg-violet-500 rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                                    title="Change photo"
                                >
                                    {uploading
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                        : <FiCamera className="w-3.5 h-3.5 text-white" />
                                    }
                                    <input id="photo-upload" ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>

                            {/* Name & Handle */}
                            <div className="flex-1 pb-1">
                                {isEditing ? (
                                    <div className="flex flex-col gap-2 mb-3">
                                        <input name="fullName" value={formData.fullName} onChange={handleChange}
                                            className="text-2xl font-black bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-violet-400 w-full max-w-sm"
                                            placeholder="Full Name"
                                        />
                                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                                            <span>@</span>
                                            <input name="username" value={formData.username} onChange={handleChange}
                                                className="bg-white/10 border border-white/20 rounded-lg px-2 py-0.5 text-violet-400 focus:outline-none focus:border-violet-400 w-36 text-sm"
                                                placeholder="handle"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <h1 className="text-2xl font-black text-white leading-tight">{formData.fullName || 'Your Name'}</h1>
                                        <p className="text-violet-400 text-sm font-semibold">
                                            @{formData.username || formData.fullName?.toLowerCase().replace(/\s+/g, '-') || 'handle'}
                                        </p>
                                    </div>
                                )}

                                {/* College & Program badge */}
                                {(formData.college || formData.program) && !isEditing && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                                        <FiBookOpen className="w-3 h-3 text-violet-400" />
                                        <span>
                                            {formData.program && <span className="text-gray-300 font-semibold">{formData.program}</span>}
                                            {formData.college && formData.program && <span className="text-gray-500"> at </span>}
                                            {formData.college && <span>{formData.college}</span>}
                                        </span>
                                    </div>
                                )}
                                {isEditing && (
                                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <input name="college" value={formData.college} onChange={handleChange}
                                            className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-400 flex-1"
                                            placeholder="College / University"
                                        />
                                        <input name="program" value={formData.program} onChange={handleChange}
                                            className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-400 flex-1"
                                            placeholder="Degree / Program"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 pb-1">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleUpdate}
                                            disabled={loading}
                                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            <FiSave className="w-4 h-4" />
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(false); fetchProfile(); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            <FiX className="w-4 h-4" /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            <FiEdit3 className="w-4 h-4" /> Edit Profile
                                        </button>
                                        <button
                                            onClick={() => setShowSettings(true)}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                                            title="Settings"
                                        >
                                            <FiSettings className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/10">
                            {[
                                { label: 'XP', value: (profileData?.points || 0).toLocaleString(), color: 'text-violet-400', icon: <FiZap className="w-3 h-3" /> },
                                { label: 'Streak', value: profileData?.streak?.current || 0, color: 'text-orange-400', icon: <BsFire className="w-3 h-3" /> },
                                { label: 'Badges', value: profileData?.badges?.length || 0, color: 'text-yellow-400', icon: <FiAward className="w-3 h-3" /> },
                                { label: 'Squads', value: squadsCount, color: 'text-cyan-400', icon: <FiUsers className="w-3 h-3" /> },
                                { label: 'Connects', value: profileData?.connectionCount || 0, color: 'text-green-400', icon: <FiTrendingUp className="w-3 h-3" /> },
                            ].map(stat => (
                                <div key={stat.label} className="text-center">
                                    <div className={`flex items-center justify-center gap-1 ${stat.color} mb-0.5`}>
                                        {stat.icon}
                                        <span className="text-xl font-black">{stat.value}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── Main Grid ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column */}
                    <div className="space-y-5">

                        {/* Bio Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiUser className="w-3.5 h-3.5 text-violet-400" /> About
                            </h3>
                            {isEditing ? (
                                <>
                                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-violet-400 resize-none"
                                        placeholder="Tell your story…"
                                    />
                                    <input name="headline" value={formData.headline} onChange={handleChange}
                                        className="w-full mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400"
                                        placeholder="Headline (e.g. BCA Student & Full-Stack Developer)"
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                        {formData.bio || 'No bio yet. Click Edit Profile to add one.'}
                                    </p>
                                    {formData.headline && (
                                        <p className="text-violet-400 text-xs font-semibold mt-3 italic">{formData.headline}</p>
                                    )}
                                </>
                            )}
                            {formData.location?.city && !isEditing && (
                                <p className="text-gray-500 text-xs flex items-center gap-1 mt-4">
                                    <FiMapPin className="w-3 h-3" />
                                    {[formData.location.city, formData.location.country].filter(Boolean).join(', ')}
                                </p>
                            )}
                        </motion.div>

                        {/* Skills Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiCode className="w-3.5 h-3.5 text-violet-400" /> Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map(skill => (
                                    <span key={skill} className="flex items-center gap-1 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                                        {skill}
                                        {isEditing && (
                                            <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400 transition-colors ml-0.5">
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {formData.skills.length === 0 && !isEditing && (
                                    <p className="text-gray-500 text-xs">No skills added yet.</p>
                                )}
                            </div>
                            {isEditing && (
                                <form onSubmit={handleAddSkill} className="flex gap-2 mt-3">
                                    <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-400"
                                        placeholder="Add a skill…"
                                    />
                                    <button type="submit" className="p-1.5 bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors">
                                        <FiPlus className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        {/* Social Links Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiLink className="w-3.5 h-3.5 text-violet-400" /> Links
                            </h3>
                            {isEditing ? (
                                <div className="space-y-2">
                                    {[
                                        { name: 'socialLinks.github',    placeholder: 'GitHub URL',    icon: <FiGithub /> },
                                        { name: 'socialLinks.linkedin',  placeholder: 'LinkedIn URL',  icon: <FiLinkedin /> },
                                        { name: 'socialLinks.twitter',   placeholder: 'Twitter URL',   icon: <FiTwitter /> },
                                        { name: 'socialLinks.portfolio', placeholder: 'Portfolio URL', icon: <FiGlobe /> },
                                    ].map(field => (
                                        <div key={field.name} className="flex items-center gap-2">
                                            <span className="text-gray-500 w-4">{field.icon}</span>
                                            <input name={field.name}
                                                value={field.name.split('.').reduce((o, k) => o?.[k], formData) || ''}
                                                onChange={handleChange}
                                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-400"
                                                placeholder={field.placeholder}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 flex-wrap">
                                    {formData.socialLinks?.github && (
                                        <a href={formData.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="GitHub">
                                            <FiGithub className="w-4 h-4" />
                                        </a>
                                    )}
                                    {formData.socialLinks?.linkedin && (
                                        <a href={formData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-all" title="LinkedIn">
                                            <FiLinkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                    {formData.socialLinks?.twitter && (
                                        <a href={formData.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                            className="p-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-xl transition-all" title="Twitter">
                                            <FiTwitter className="w-4 h-4" />
                                        </a>
                                    )}
                                    {formData.socialLinks?.portfolio && (
                                        <a href={formData.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-all" title="Portfolio">
                                            <FiGlobe className="w-4 h-4" />
                                        </a>
                                    )}
                                    {!Object.values(formData.socialLinks || {}).some(Boolean) && (
                                        <p className="text-gray-500 text-xs">No links added yet.</p>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* Pending Connection Requests */}
                        {pendingRequests.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                                className="bg-white/5 border border-violet-500/20 rounded-3xl p-6"
                            >
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FiUsers className="w-3.5 h-3.5 text-violet-400" />
                                    Requests
                                    <span className="bg-violet-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-auto">{pendingRequests.length}</span>
                                </h3>
                                <div className="space-y-3">
                                    {pendingRequests.map(req => (
                                        <div key={req._id} className="flex items-center gap-3 bg-white/5 rounded-2xl p-3">
                                            <img src={req.requester?.profilePhoto || `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${req.requester?.fullName}`}
                                                className="w-9 h-9 rounded-xl object-cover" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{req.requester?.fullName}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{req.requester?.headline}</p>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleAction(req._id, 'accept')}
                                                    className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all">
                                                    <FiCheck className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleAction(req._id, 'reject')}
                                                    className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                                                    <FiX className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column — Tabs */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Portfolio Link */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl">
                                {TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                            {user && (
                                <Link href={`/portfolio/${user._id}`}
                                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                                    <FiGlobe className="w-3.5 h-3.5" /> Portfolio
                                </Link>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab}
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.2 }}
                                className="min-h-[350px]"
                            >
                                {/* Career Journey */}
                                {activeTab === 'journey' && (
                                    <div className="space-y-4">
                                        {(profileData?.experiences || []).length === 0 ? (
                                            <EmptyState icon={<FiBriefcase />} title="No experiences yet"
                                                desc="Add internships, freelance work, or projects from your settings." />
                                        ) : (
                                            profileData.experiences.map((exp, i) => (
                                                <div key={i} className="bg-white/5 border border-white/10 hover:border-violet-500/30 rounded-2xl p-5 transition-all flex gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                                                        <FiBriefcase className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white">{exp.title}</h4>
                                                        <p className="text-sm text-gray-400">{exp.company}</p>
                                                        {exp.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{exp.description}</p>}
                                                        <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mt-2">
                                                            {exp.startDate ? new Date(exp.startDate).getFullYear() : ''}{exp.isCurrent ? ' – Present' : exp.endDate ? ` – ${new Date(exp.endDate).getFullYear()}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Education */}
                                {activeTab === 'education' && (
                                    <div className="space-y-4">
                                        {/* From StudentProfile (primary) */}
                                        {(formData.college || formData.program) && (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                                    <FiBookOpen className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{formData.college}</h4>
                                                    <p className="text-sm text-gray-400">{formData.program}</p>
                                                    {profileData?.roleProfile?.year && (
                                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-2">
                                                            Year {profileData.roleProfile.year}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {/* Additional UserEducation entries */}
                                        {(profileData?.education || []).map((edu, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                                    <FiBook className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{edu.school}</h4>
                                                    <p className="text-sm text-gray-400">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-2">
                                                        {edu.startDate && new Date(edu.startDate).getFullYear()} – {edu.isCurrent ? 'Present' : edu.endDate && new Date(edu.endDate).getFullYear()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {!formData.college && (profileData?.education || []).length === 0 && (
                                            <EmptyState icon={<FiBookOpen />} title="No education added"
                                                desc="Your college and degree will appear after completing your profile." />
                                        )}
                                    </div>
                                )}

                                {/* Squads */}
                                {activeTab === 'squads' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(profileData?.mutualSquads || []).length === 0 ? (
                                            <div className="col-span-full">
                                                <EmptyState icon={<FiUsers />} title="No squads yet"
                                                    desc="Join a squad to collaborate with fellow students on real projects." />
                                            </div>
                                        ) : (
                                            profileData.mutualSquads.map(squad => (
                                                <Link key={squad._id} href={`/squads/${squad._id}`}
                                                    className="bg-white/5 border border-white/10 hover:border-violet-500/30 rounded-2xl p-4 transition-all group">
                                                    <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors">{squad.name}</h4>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mt-1">{squad.category} · {squad.status}</p>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Badges */}
                                {activeTab === 'badges' && (
                                    <div>
                                        {(profileData?.badges || []).length === 0 ? (
                                            <EmptyState icon={<FiAward />} title="No badges yet"
                                                desc="Complete challenges and hit milestones to earn your first badge." />
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                                {profileData.badges.map((badge, i) => (
                                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:scale-105 transition-transform"
                                                        title={badge.name}>
                                                        <div className="flex justify-center mb-2">
                                                            <FiAward className="w-7 h-7 text-yellow-400" />
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 truncate">{badge.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Activity Tab — Contribution Heatmap */}
                                {activeTab === 'activity' && (
                                    <div className="space-y-5">
                                        <ContributionHeatmap userId={user?._id} />

                                        {/* Quick actions */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Link href="/profile/resume"
                                                className="bg-white/5 hover:bg-violet-600/10 border border-white/10 hover:border-violet-500/30 rounded-3xl p-5 transition-all group"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-9 h-9 bg-violet-600/20 rounded-xl flex items-center justify-center">
                                                        <FiZap className="text-violet-400 w-4 h-4" />
                                                    </div>
                                                    <span className="text-white font-bold">Build CV</span>
                                                </div>
                                                <p className="text-gray-400 text-xs">Auto-generate a polished PDF resume from your profile</p>
                                            </Link>
                                            <Link href="/profile/referral"
                                                className="bg-white/5 hover:bg-pink-600/10 border border-white/10 hover:border-pink-500/30 rounded-3xl p-5 transition-all group"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-9 h-9 bg-pink-600/20 rounded-xl flex items-center justify-center">
                                                        <FiAward className="text-pink-400 w-4 h-4" />
                                                    </div>
                                                    <span className="text-white font-bold">Invite & Earn</span>
                                                </div>
                                                <p className="text-gray-400 text-xs">Invite friends and earn XP for each successful referral</p>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* ── Settings Modal ──────────────────────────────── */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-[100] flex items-end sm:items-center justify-center backdrop-blur-sm p-4"
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                            className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <FiSettings className="text-violet-400" /> Settings
                                </h3>
                                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Avatar picker */}
                            <div>
                                <p className="text-sm font-bold text-gray-400 mb-3">Choose Avatar</p>
                                <div className="grid grid-cols-6 gap-2 mb-3">
                                    {CURATED_AVATARS.map((url, i) => (
                                        <button key={i} type="button" onClick={() => handleAvatarSelect(url)}
                                            className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                                                (formData.avatarUrl === url || formData.profilePhoto === url)
                                                    ? 'border-violet-500 scale-105'
                                                    : 'border-white/10 hover:border-violet-400'
                                            }`}
                                            aria-label={`Avatar ${i + 1}`}
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-violet-400 text-sm text-gray-400 hover:text-white transition-colors">
                                    <FiCamera className="w-4 h-4" />
                                    Upload custom photo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>

                            <div className="border-t border-white/10" />

                            {/* Security */}
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-gray-400 flex items-center gap-2"><FiShield className="text-violet-400" /> Security</p>
                                <button onClick={logout}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold group">
                                    <span className="flex items-center gap-3"><FiLogOut /> Sign Out</span>
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            <button onClick={handleUpdate} disabled={loading}
                                className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-2xl font-bold text-sm transition-colors">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EmptyState({ icon, title, desc }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">
                {icon}
            </div>
            <p className="text-white font-semibold text-sm mb-1">{title}</p>
            <p className="text-gray-500 text-xs">{desc}</p>
        </div>
    );
}
