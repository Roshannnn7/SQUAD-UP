'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
    FiBookOpen,
    FiBriefcase,
    FiCode,
    FiAward,
    FiGlobe,
    FiGithub,
    FiLinkedin,
    FiCheck,
    FiArrowRight,
    FiArrowLeft,
    FiUser,
    FiCheckCircle,
    FiCamera,
    FiUpload
} from 'react-icons/fi';

// Curated avatar set — consistent, gender-neutral, professional
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

export default function OnboardingPage() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Wizard Step State: 1 = Role, 2 = Background, 3 = Skills & Social
    const [step, setStep] = useState(1);
    const [onboardingRole, setOnboardingRole] = useState(user?.role || 'student');
    const [selectedAvatar, setSelectedAvatar] = useState('');

    // Student Form State
    const [studentForm, setStudentForm] = useState({
        college: '',
        degree: '',
        graduationYear: '',
        bio: '',
        skills: '',
        interests: '',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
    });

    // Mentor Form State
    const [mentorForm, setMentorForm] = useState({
        currentRole: '',
        company: '',
        bio: '',
        expertise: '',
        experienceYears: '',
        pricePerHour: '',
        githubUrl: '',
        linkedinUrl: '',
        twitterUrl: '',
        portfolioUrl: '',
    });

    const handleStudentChange = (e) => {
        setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
    };

    const handleMentorChange = (e) => {
        setMentorForm({ ...mentorForm, [e.target.name]: e.target.value });
    };

    const submitStudentProfile = async (e) => {
        e?.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                college:         studentForm.college,
                degree:          studentForm.degree,
                year:            studentForm.graduationYear,
                semester:        '1',
                skills:          studentForm.skills,
                interests:       studentForm.interests,
                githubProfile:   studentForm.githubUrl,
                linkedinProfile: studentForm.linkedinUrl,
                bio:             studentForm.bio,
                // Avatar: send whichever the user chose (upload takes precedence)
                profilePhoto:    selectedAvatar || '',
                avatarUrl:       selectedAvatar || '',
            };

            await api.put('/auth/complete-student-profile', payload);
            updateProfile({ isProfileComplete: true, role: 'student' });
            toast.success('Student profile setup complete!');
            router.push('/dashboard/student');
        } catch (error) {
            console.error('Student profile error:', error);
            const msg = error.response?.data?.message || 'Failed to complete profile. Please check required fields.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const submitMentorProfile = async (e) => {
        e?.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                currentRole: mentorForm.currentRole,
                company: mentorForm.company,
                experience: mentorForm.experienceYears || '1',
                expertise: mentorForm.expertise || 'Software Engineering',
                bio: mentorForm.bio || '',
                sessionPrice: Number(mentorForm.pricePerHour) || 0,
                mode: ['video', 'chat'],
            };

            await api.put('/auth/complete-mentor-profile', payload);
            updateProfile({ isProfileComplete: true, role: 'mentor' });
            toast.success('Mentor profile setup complete!');
            router.push('/dashboard/mentor');
        } catch (error) {
            console.error('Mentor profile error:', error);
            const msg = error.response?.data?.message || 'Failed to complete profile. Please check required fields.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            // Validate step 2 inputs
            if (onboardingRole === 'student' && (!studentForm.college || !studentForm.degree)) {
                toast.error('Please enter your college and degree');
                return;
            }
            if (onboardingRole === 'mentor' && (!mentorForm.currentRole || !mentorForm.company)) {
                toast.error('Please enter your role and company');
                return;
            }
            setStep(3);
        } else if (step === 3) {
            if (onboardingRole === 'student') {
                submitStudentProfile();
            } else {
                submitMentorProfile();
            }
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 selection:bg-violet-500 selection:text-white">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold mb-4">
                        <FiUser className="w-3.5 h-3.5" />
                        <span>Welcome to SquadUp</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-base">
                        Follow these 3 quick steps to set up your account workspace.
                    </p>
                </div>

                {/* Progress Step Indicator */}
                <div className="mb-10 max-w-xl mx-auto">
                    <div className="flex items-center justify-between relative">
                        {/* Line connector */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-gray-800 -translate-y-1/2 z-0" />
                        <div 
                            className="absolute top-1/2 left-0 h-1 bg-violet-600 -translate-y-1/2 z-0 transition-all duration-300" 
                            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                        />

                        {/* Steps */}
                        {[
                            { num: 1, label: 'Select Role' },
                            { num: 2, label: 'Background' },
                            { num: 3, label: 'Skills & Links' },
                        ].map((s) => (
                            <div key={s.num} className="relative z-10 flex flex-col items-center">
                                <button
                                    type="button"
                                    onClick={() => s.num < step && setStep(s.num)}
                                    disabled={s.num > step}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                        step > s.num
                                            ? 'bg-violet-600 text-white shadow-md'
                                            : step === s.num
                                            ? 'bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-900/50'
                                            : 'bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-slate-400'
                                    }`}
                                    aria-label={`Go to step ${s.num}: ${s.label}`}
                                >
                                    {step > s.num ? <FiCheck className="w-5 h-5" /> : s.num}
                                </button>
                                <span className={`text-xs font-semibold mt-2 ${
                                    step >= s.num ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'
                                }`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card Container */}
                <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-xl">
                    <form onSubmit={handleNext}>
                        <AnimatePresence mode="wait">
                            {/* STEP 1: Role Selection */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Select Your Primary Role</h2>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">Choose how you plan to engage on SquadUp</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div
                                            onClick={() => setOnboardingRole('student')}
                                            tabIndex={0}
                                            role="button"
                                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOnboardingRole('student')}
                                            className={`p-6 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                                                onboardingRole === 'student'
                                                    ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 shadow-md scale-[1.02]'
                                                    : 'border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                                                <FiBookOpen className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Student / Developer</h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                                Join capstone squads, work on real projects, build a public portfolio, and get guidance from mentors.
                                            </p>
                                            <div className="flex items-center text-xs font-bold text-violet-600 dark:text-violet-400">
                                                {onboardingRole === 'student' ? (
                                                    <span className="flex items-center gap-1"><FiCheckCircle className="w-4 h-4" /> Selected</span>
                                                ) : (
                                                    <span>Select Student Role &rarr;</span>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setOnboardingRole('mentor')}
                                            tabIndex={0}
                                            role="button"
                                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOnboardingRole('mentor')}
                                            className={`p-6 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                                                onboardingRole === 'mentor'
                                                    ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 shadow-md scale-[1.02]'
                                                    : 'border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                                                <FiBriefcase className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Industry Mentor</h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                                Guide student project squads, offer 1-on-1 video reviews, set custom office hours, and share expertise.
                                            </p>
                                            <div className="flex items-center text-xs font-bold text-violet-600 dark:text-violet-400">
                                                {onboardingRole === 'mentor' ? (
                                                    <span className="flex items-center gap-1"><FiCheckCircle className="w-4 h-4" /> Selected</span>
                                                ) : (
                                                    <span>Select Mentor Role &rarr;</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: Academic or Mentor Background */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                            {onboardingRole === 'student' ? 'Academic Details' : 'Professional Background'}
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">
                                            {onboardingRole === 'student' ? 'Help peers know your education path' : 'Share your professional experience'}
                                        </p>
                                    </div>

                                    {onboardingRole === 'student' ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="college" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        College / University *
                                                    </label>
                                                    <div className="relative">
                                                        <FiBookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            id="college"
                                                            type="text"
                                                            name="college"
                                                            value={studentForm.college}
                                                            onChange={handleStudentChange}
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                            placeholder="Stanford University"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="degree" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        Degree / Major *
                                                    </label>
                                                    <input
                                                        id="degree"
                                                        type="text"
                                                        name="degree"
                                                        value={studentForm.degree}
                                                        onChange={handleStudentChange}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                        placeholder="B.S. in Computer Science"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="graduationYear" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                    Graduation Year
                                                </label>
                                                <input
                                                    id="graduationYear"
                                                    type="number"
                                                    name="graduationYear"
                                                    value={studentForm.graduationYear}
                                                    onChange={handleStudentChange}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                    placeholder="2025"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="studentBio" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                    Short Bio
                                                </label>
                                                <textarea
                                                    id="studentBio"
                                                    name="bio"
                                                    value={studentForm.bio}
                                                    onChange={handleStudentChange}
                                                    rows={3}
                                                    className="w-full p-4 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                    placeholder="Tell teammates about your coding interests and project goals..."
                                                />
                                            </div>

                                            {/* Avatar Selection */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                                    Choose Your Avatar
                                                </label>
                                                <div className="grid grid-cols-6 gap-2 mb-3">
                                                    {CURATED_AVATARS.map((url, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => setSelectedAvatar(url)}
                                                            className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                                                                selectedAvatar === url
                                                                    ? 'border-violet-600 shadow-md shadow-violet-500/30 scale-105'
                                                                    : 'border-slate-200 dark:border-gray-700 hover:border-violet-400'
                                                            }`}
                                                            aria-label={`Avatar option ${i + 1}`}
                                                        >
                                                            <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                                                            {selectedAvatar === url && (
                                                                <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                                                                    <FiCheck className="text-violet-600 w-4 h-4 drop-shadow" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                                    You can upload a custom photo from your profile settings after setup.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="currentRole" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        Current Role *
                                                    </label>
                                                    <div className="relative">
                                                        <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            id="currentRole"
                                                            type="text"
                                                            name="currentRole"
                                                            value={mentorForm.currentRole}
                                                            onChange={handleMentorChange}
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                            placeholder="Senior Software Engineer"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="company" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        Company / Organization *
                                                    </label>
                                                    <input
                                                        id="company"
                                                        type="text"
                                                        name="company"
                                                        value={mentorForm.company}
                                                        onChange={handleMentorChange}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                        placeholder="Google"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="experienceYears" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        Years of Experience
                                                    </label>
                                                    <input
                                                        id="experienceYears"
                                                        type="number"
                                                        name="experienceYears"
                                                        value={mentorForm.experienceYears}
                                                        onChange={handleMentorChange}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                        placeholder="5"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="pricePerHour" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        Session Rate (₹ per hour)
                                                    </label>
                                                    <input
                                                        id="pricePerHour"
                                                        type="number"
                                                        name="pricePerHour"
                                                        value={mentorForm.pricePerHour}
                                                        onChange={handleMentorChange}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                        placeholder="500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="mentorBio" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                    Mentor Bio
                                                </label>
                                                <textarea
                                                    id="mentorBio"
                                                    name="bio"
                                                    value={mentorForm.bio}
                                                    onChange={handleMentorChange}
                                                    rows={3}
                                                    className="w-full p-4 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                    placeholder="Describe your background and how you can guide student squads..."
                                                />
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 3: Skills & Links */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Skills & Online Links</h2>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">Connect your technical skills and profiles</p>
                                    </div>

                                    {onboardingRole === 'student' ? (
                                        <>
                                            <div>
                                                <label htmlFor="skills" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                    Primary Skills (comma separated)
                                                </label>
                                                <div className="relative">
                                                    <FiCode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        id="skills"
                                                        type="text"
                                                        name="skills"
                                                        value={studentForm.skills}
                                                        onChange={handleStudentChange}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                        placeholder="React, Node.js, Python, Figma"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="interests" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                    Interests / Domains (comma separated)
                                                </label>
                                                <input
                                                    id="interests"
                                                    type="text"
                                                    name="interests"
                                                    value={studentForm.interests}
                                                    onChange={handleStudentChange}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                    placeholder="Web Development, AI, Open Source"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="studentGithub" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        GitHub Profile URL
                                                    </label>
                                                    <div className="relative">
                                                        <FiGithub className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            id="studentGithub"
                                                            type="url"
                                                            name="githubUrl"
                                                            value={studentForm.githubUrl}
                                                            onChange={handleStudentChange}
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                            placeholder="https://github.com/username"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="studentLinkedin" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        LinkedIn Profile URL
                                                    </label>
                                                    <div className="relative">
                                                        <FiLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            id="studentLinkedin"
                                                            type="url"
                                                            name="linkedinUrl"
                                                            value={studentForm.linkedinUrl}
                                                            onChange={handleStudentChange}
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                            placeholder="https://linkedin.com/in/username"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label htmlFor="expertise" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                    Areas of Expertise (comma separated)
                                                </label>
                                                <div className="relative">
                                                    <FiAward className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        id="expertise"
                                                        type="text"
                                                        name="expertise"
                                                        value={mentorForm.expertise}
                                                        onChange={handleMentorChange}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                        placeholder="System Design, Web Security, React"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="mentorLinkedin" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        LinkedIn Profile URL *
                                                    </label>
                                                    <div className="relative">
                                                        <FiLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            id="mentorLinkedin"
                                                            type="url"
                                                            name="linkedinUrl"
                                                            value={mentorForm.linkedinUrl}
                                                            onChange={handleMentorChange}
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                            placeholder="https://linkedin.com/in/username"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="mentorWebsite" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        Portfolio / Website URL
                                                    </label>
                                                    <div className="relative">
                                                        <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            id="mentorWebsite"
                                                            type="url"
                                                            name="portfolioUrl"
                                                            value={mentorForm.portfolioUrl}
                                                            onChange={handleMentorChange}
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                            placeholder="https://yourwebsite.com"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Guided Controls */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-gray-800">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <FiArrowLeft className="w-4 h-4" />
                                    <span>Back</span>
                                </button>
                            ) : <div />}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                <span>{isLoading ? 'Saving...' : step === 3 ? 'Complete Profile' : 'Next Step'}</span>
                                {step < 3 && <FiArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

