'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    FiUser, FiCamera, FiCode, FiLink, FiShield, FiLogOut,
    FiSave, FiPlus, FiX, FiGithub, FiLinkedin, FiTwitter,
    FiGlobe, FiEye, FiEyeOff, FiCheck, FiMapPin, FiBriefcase
} from 'react-icons/fi';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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

const SECTIONS = [
    { id: 'profile',  label: 'Profile',       icon: <FiUser /> },
    { id: 'avatar',   label: 'Avatar & Photo', icon: <FiCamera /> },
    { id: 'skills',   label: 'Skills',         icon: <FiCode /> },
    { id: 'links',    label: 'Social Links',   icon: <FiLink /> },
    { id: 'privacy',  label: 'Privacy',        icon: <FiEye /> },
    { id: 'security', label: 'Security',       icon: <FiShield /> },
];

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const [form, setForm] = useState({
        fullName:    '',
        username:    '',
        headline:    '',
        bio:         '',
        college:     '',
        program:     '',
        location:    { city: '', country: '' },
        profilePhoto:'',
        avatarUrl:   '',
        socialLinks: { github: '', linkedin: '', twitter: '', portfolio: '' },
        skills:      [],
        privacy:     { profileVisibility: 'public', showEmail: false, allowConnectionRequests: true },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profiles/me');
                const p = res.data.data;
                setForm({
                    fullName:    p.fullName || '',
                    username:    p.username || '',
                    headline:    p.headline || '',
                    bio:         p.bio || '',
                    college:     p.college || p.roleProfile?.college || p.studentInfo?.college || '',
                    program:     p.program || p.roleProfile?.degree || p.studentInfo?.degree || '',
                    location:    p.location || { city: '', country: '' },
                    profilePhoto:p.profilePhoto || '',
                    avatarUrl:   p.avatarUrl || '',
                    socialLinks: p.socialLinks || { github: '', linkedin: '', twitter: '', portfolio: '' },
                    skills:      p.skills || [],
                    privacy:     p.privacy || { profileVisibility: 'public', showEmail: false, allowConnectionRequests: true },
                });
            } catch {}
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleToggle = (parent, key) => {
        setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: !prev[parent][key] } }));
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        const trimmed = newSkill.trim();
        if (trimmed && !form.skills.includes(trimmed)) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
        }
        setNewSkill('');
    };

    const handleRemoveSkill = (skill) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleAvatarSelect = (url) => {
        setForm(prev => ({ ...prev, avatarUrl: url, profilePhoto: '' }));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);

            const getBase64 = (f) => new Promise((res) => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result);
                reader.readAsDataURL(f);
            });

            let finalUrl = '';

            try {
                const storageRef = ref(storage, `profile-photos/${user._id}_${Date.now()}`);
                const uploadTask = uploadBytesResumable(storageRef, file);
                finalUrl = await new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        null,
                        (err) => reject(err),
                        async () => {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(url);
                        }
                    );
                });
            } catch (fbErr) {
                console.warn('Firebase Storage upload blocked by CORS — using Data URL fallback:', fbErr.message);
                finalUrl = await getBase64(file);
            }

            setForm(prev => ({ ...prev, profilePhoto: finalUrl, avatarUrl: '' }));
            toast.success('Photo ready — click Save to apply.');
            setUploading(false);
        } catch (err) {
            console.error('Photo upload error:', err);
            toast.error('Failed to upload photo');
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await api.put('/auth/profile', {
                fullName:    form.fullName,
                username:    form.username,
                headline:    form.headline,
                bio:         form.bio,
                college:     form.college,
                program:     form.program,
                location:    form.location,
                profilePhoto:form.profilePhoto,
                avatarUrl:   form.avatarUrl,
                socialLinks: form.socialLinks,
            });
            await api.put('/profiles', {
                skills:  form.skills,
                privacy: form.privacy,
            });
            toast.success('Settings saved!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const displayPhoto = form.profilePhoto || form.avatarUrl
        || `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(form.fullName || 'user')}&backgroundColor=b6e3f4`;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 pt-24 pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white">Settings</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your profile, avatar, skills, and privacy.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Nav */}
                    <nav className="lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            {SECTIONS.map(s => (
                                <button key={s.id} onClick={() => setActiveSection(s.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all border-l-2 ${
                                        activeSection === s.id
                                            ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span className="w-4">{s.icon}</span> {s.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Main Panel */}
                    <div className="lg:col-span-3">
                        <motion.div key={activeSection}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
                        >
                            {/* ── Profile Section ──────────────── */}
                            {activeSection === 'profile' && (
                                <>
                                    <SectionHeader icon={<FiUser />} title="Profile Information" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Roshan Rathod" />
                                        <Field label="Username / Handle" name="username" value={form.username} onChange={handleChange} placeholder="roshan-rathod" prefix="@" />
                                        <Field label="College / University" name="college" value={form.college} onChange={handleChange} placeholder="Gulbarga University" />
                                        <Field label="Degree / Program" name="program" value={form.program} onChange={handleChange} placeholder="BCA" />
                                        <Field label="City" name="location.city" value={form.location?.city || ''} onChange={handleChange} placeholder="Bengaluru" />
                                        <Field label="Country" name="location.country" value={form.location?.country || ''} onChange={handleChange} placeholder="India" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-2">Headline</label>
                                        <input name="headline" value={form.headline} onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400"
                                            placeholder="BCA Student & Full-Stack Developer" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-400 mb-2">Bio</label>
                                        <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-400 resize-none"
                                            placeholder="Tell your story…" />
                                        <p className="text-xs text-gray-500 mt-1">{form.bio.length}/500 characters</p>
                                    </div>
                                </>
                            )}

                            {/* ── Avatar Section ──────────────── */}
                            {activeSection === 'avatar' && (
                                <>
                                    <SectionHeader icon={<FiCamera />} title="Avatar & Photo" />
                                    {/* Current preview */}
                                    <div className="flex items-center gap-5 p-4 bg-white/5 rounded-2xl">
                                        <img
                                            src={displayPhoto}
                                            alt="Current avatar"
                                            className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`;
                                            }}
                                        />
                                        <div>
                                            <p className="font-semibold text-white text-sm mb-1">Current Avatar</p>
                                            <p className="text-xs text-gray-400">Select a preset below or upload your own photo.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-400 mb-3">Choose a Preset</p>
                                        <div className="grid grid-cols-6 gap-2">
                                            {CURATED_AVATARS.map((url, i) => (
                                                <button key={i} type="button" onClick={() => handleAvatarSelect(url)}
                                                    className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                                                        (form.avatarUrl === url || form.profilePhoto === url)
                                                            ? 'border-violet-500 shadow-md shadow-violet-500/30 scale-105'
                                                            : 'border-white/10 hover:border-violet-400'
                                                    }`}
                                                    aria-label={`Avatar ${i + 1}`}
                                                >
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    {(form.avatarUrl === url || form.profilePhoto === url) && (
                                                        <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                                                            <FiCheck className="text-violet-300 w-5 h-5 drop-shadow" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-4">
                                        <p className="text-sm font-semibold text-gray-400 mb-3">Upload Custom Photo</p>
                                        <label className="flex items-center gap-3 px-5 py-3.5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-violet-400 text-sm text-gray-400 hover:text-white transition-all w-fit">
                                            {uploading
                                                ? <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent animate-spin rounded-full" />
                                                : <FiCamera className="w-5 h-5 text-violet-400" />
                                            }
                                            {uploading ? 'Uploading…' : 'Choose photo from device'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">JPG, PNG or WebP. Max 5 MB.</p>
                                    </div>
                                </>
                            )}

                            {/* ── Skills Section ──────────────── */}
                            {activeSection === 'skills' && (
                                <>
                                    <SectionHeader icon={<FiCode />} title="Skills & Interests" />
                                    <div className="flex flex-wrap gap-2">
                                        {form.skills.map(skill => (
                                            <span key={skill}
                                                className="flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                {skill}
                                                <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400 transition-colors">
                                                    <FiX className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        {form.skills.length === 0 && <p className="text-xs text-gray-500">No skills added yet.</p>}
                                    </div>
                                    <form onSubmit={handleAddSkill} className="flex gap-2">
                                        <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400"
                                            placeholder="e.g. React, Python, Figma…"
                                        />
                                        <button type="submit"
                                            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-colors">
                                            <FiPlus className="w-4 h-4" /> Add
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* ── Social Links Section ──────── */}
                            {activeSection === 'links' && (
                                <>
                                    <SectionHeader icon={<FiLink />} title="Social Links" />
                                    <div className="space-y-3">
                                        {[
                                            { name: 'socialLinks.github',    label: 'GitHub',    icon: <FiGithub />,   placeholder: 'https://github.com/yourhandle' },
                                            { name: 'socialLinks.linkedin',  label: 'LinkedIn',  icon: <FiLinkedin />, placeholder: 'https://linkedin.com/in/yourhandle' },
                                            { name: 'socialLinks.twitter',   label: 'Twitter',   icon: <FiTwitter />,  placeholder: 'https://twitter.com/yourhandle' },
                                            { name: 'socialLinks.portfolio', label: 'Portfolio', icon: <FiGlobe />,    placeholder: 'https://yourportfolio.dev' },
                                        ].map(field => (
                                            <div key={field.name}>
                                                <label className="block text-xs font-bold text-gray-400 mb-1.5">{field.label}</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 w-5 flex-shrink-0">{field.icon}</span>
                                                    <input name={field.name}
                                                        value={field.name.split('.').reduce((o, k) => o?.[k], form) || ''}
                                                        onChange={handleChange}
                                                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400"
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* ── Privacy Section ──────────── */}
                            {activeSection === 'privacy' && (
                                <>
                                    <SectionHeader icon={<FiEye />} title="Privacy Settings" />
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-400 mb-2">Profile Visibility</label>
                                            <div className="flex gap-2">
                                                {['public', 'connections', 'private'].map(v => (
                                                    <button key={v} type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, privacy: { ...prev.privacy, profileVisibility: v } }))}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                                                            form.privacy?.profileVisibility === v
                                                                ? 'bg-violet-600 text-white'
                                                                : 'bg-white/10 text-gray-400 hover:text-white'
                                                        }`}
                                                    >{v}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <ToggleSetting label="Show email on profile" desc="Lets others see your email address"
                                            checked={form.privacy?.showEmail} onToggle={() => handleToggle('privacy', 'showEmail')} />
                                        <ToggleSetting label="Allow connection requests" desc="Others can send you connection requests"
                                            checked={form.privacy?.allowConnectionRequests} onToggle={() => handleToggle('privacy', 'allowConnectionRequests')} />
                                    </div>
                                </>
                            )}

                            {/* ── Security Section ─────────── */}
                            {activeSection === 'security' && (
                                <>
                                    <SectionHeader icon={<FiShield />} title="Security" />
                                    <div className="space-y-3">
                                        <button onClick={() => router.push('/auth/forgot-password')}
                                            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-semibold transition-all">
                                            <span>Change Password</span>
                                            <span className="text-violet-400 text-xs">Reset via email →</span>
                                        </button>
                                        <button onClick={logout}
                                            className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 rounded-2xl text-sm font-bold text-red-400 hover:text-white transition-all group">
                                            <span className="flex items-center gap-2"><FiLogOut /> Sign Out</span>
                                            <span className="text-xs group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Save Button (hidden on security tab) */}
                            {activeSection !== 'security' && (
                                <div className="pt-2 border-t border-white/10">
                                    <button onClick={handleSave} disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl text-sm font-bold transition-colors">
                                        <FiSave className="w-4 h-4" />
                                        {loading ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SectionHeader({ icon, title }) {
    return (
        <div className="flex items-center gap-3 pb-2 border-b border-white/10">
            <span className="text-violet-400">{icon}</span>
            <h2 className="text-lg font-black text-white">{title}</h2>
        </div>
    );
}

function Field({ label, name, value, onChange, placeholder, prefix }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">{label}</label>
            <div className="flex items-center gap-1.5">
                {prefix && <span className="text-gray-500 text-sm">{prefix}</span>}
                <input name={name} value={value} onChange={onChange}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}

function ToggleSetting({ label, desc, checked, onToggle }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <button onClick={onToggle}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-violet-600' : 'bg-white/20'}`}
                role="switch" aria-checked={checked}
            >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}
