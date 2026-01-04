'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { FiBook, FiBriefcase, FiCode, FiAward, FiGlobe, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Student Form State
    const [studentForm, setStudentForm] = useState({
        college: '',
        degree: '',
        graduationYear: '',
        bio: '',
        skills: '', // Will be converted to array
        interests: '', // Will be converted to array
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
    });

    // Mentor Form State
    const [mentorForm, setMentorForm] = useState({
        currentRole: '',
        company: '',
        bio: '',
        expertise: '', // Will be converted to array
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
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                college: studentForm.college,
                degree: studentForm.degree,
                year: studentForm.graduationYear,
                semester: '1', // Default or add to form
                skills: studentForm.skills,
                interests: studentForm.interests,
                githubProfile: studentForm.githubUrl,
                linkedinProfile: studentForm.linkedinUrl,
                bio: studentForm.bio,
            };

            await api.put('/auth/complete-student-profile', payload);
            updateProfile({ isProfileComplete: true });
            toast.success('Profile completed successfully!');
            router.push('/dashboard/student');
        } catch (error) {
            console.error('Student profile error:', error);
            toast.error('Failed to complete profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const submitMentorProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                currentRole: mentorForm.currentRole,
                company: mentorForm.company,
                experience: mentorForm.experienceYears,
                expertise: mentorForm.expertise,
                bio: mentorForm.bio,
                sessionPrice: mentorForm.pricePerHour,
                mode: ['video', 'chat'], // Default modes
            };

            await api.put('/auth/complete-mentor-profile', payload);
            updateProfile({ isProfileComplete: true });
            toast.success('Profile completed successfully!');
            router.push('/dashboard/mentor');
        } catch (error) {
            console.error('Mentor profile error:', error);
            toast.error('Failed to complete profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-2">Complete Your Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tell us more about yourself to get started on SquadUp as a {user.role}.
                    </p>
                </div>

                <div className="glassmorphism rounded-2xl p-8 shadow-xl">
                    {user.role === 'student' ? (
                        <form onSubmit={submitStudentProfile} className="space-y-6">
                            {/* ... student form content ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        College / University
                                    </label>
                                    <div className="relative">
                                        <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="college"
                                            value={studentForm.college}
                                            onChange={handleStudentChange}
                                            className="input-field pl-10"
                                            placeholder="Stanford University"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Degree
                                    </label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={studentForm.degree}
                                        onChange={handleStudentChange}
                                        className="input-field"
                                        placeholder="B.S. in Computer Science"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Graduation Year
                                </label>
                                <input
                                    type="number"
                                    name="graduationYear"
                                    value={studentForm.graduationYear}
                                    onChange={handleStudentChange}
                                    className="input-field"
                                    placeholder="2025"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={studentForm.bio}
                                    onChange={handleStudentChange}
                                    rows={4}
                                    className="input-field"
                                    placeholder="Tell us about yourself, your goals, and what you're looking for..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Skills (comma separated)
                                </label>
                                <div className="relative">
                                    <FiCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="skills"
                                        value={studentForm.skills}
                                        onChange={handleStudentChange}
                                        className="input-field pl-10"
                                        placeholder="React, Node.js, Python, Figma"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Interests (comma separated)
                                </label>
                                <input
                                    type="text"
                                    name="interests"
                                    value={studentForm.interests}
                                    onChange={handleStudentChange}
                                    className="input-field"
                                    placeholder="Web Development, AI, Open Source"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        GitHub URL
                                    </label>
                                    <div className="relative">
                                        <FiGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="url"
                                            name="githubUrl"
                                            value={studentForm.githubUrl}
                                            onChange={handleStudentChange}
                                            className="input-field pl-10"
                                            placeholder="https://github.com/username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        LinkedIn URL
                                    </label>
                                    <div className="relative">
                                        <FiLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={studentForm.linkedinUrl}
                                            onChange={handleStudentChange}
                                            className="input-field pl-10"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-4 text-lg font-bold"
                            >
                                {isLoading ? 'Saving...' : 'Complete Student Profile'}
                            </button>
                        </form>
                    ) : user.role === 'mentor' ? (
                        <form onSubmit={submitMentorProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Role
                                    </label>
                                    <div className="relative">
                                        <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="currentRole"
                                            value={mentorForm.currentRole}
                                            onChange={handleMentorChange}
                                            className="input-field pl-10"
                                            placeholder="Senior Software Engineer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={mentorForm.company}
                                        onChange={handleMentorChange}
                                        className="input-field"
                                        placeholder="Google"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={mentorForm.bio}
                                    onChange={handleMentorChange}
                                    rows={4}
                                    className="input-field"
                                    placeholder="Share your professional journey and how you can help students..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Expertise (comma separated)
                                </label>
                                <div className="relative">
                                    <FiAward className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="expertise"
                                        value={mentorForm.expertise}
                                        onChange={handleMentorChange}
                                        className="input-field pl-10"
                                        placeholder="System Design, Web Security, Career Growth"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        name="experienceYears"
                                        value={mentorForm.experienceYears}
                                        onChange={handleMentorChange}
                                        className="input-field"
                                        placeholder="5"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Pricing (₹ per hour)
                                    </label>
                                    <input
                                        type="number"
                                        name="pricePerHour"
                                        value={mentorForm.pricePerHour}
                                        onChange={handleMentorChange}
                                        className="input-field"
                                        placeholder="500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        LinkedIn URL
                                    </label>
                                    <div className="relative">
                                        <FiLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={mentorForm.linkedinUrl}
                                            onChange={handleMentorChange}
                                            className="input-field pl-10"
                                            placeholder="https://linkedin.com/in/username"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Portfolio / Website URL
                                    </label>
                                    <div className="relative">
                                        <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="url"
                                            name="portfolioUrl"
                                            value={mentorForm.portfolioUrl}
                                            onChange={handleMentorChange}
                                            className="input-field pl-10"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-4 text-lg font-bold"
                            >
                                {isLoading ? 'Saving...' : 'Complete Mentor Profile'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Role not recognized. Please sign out and try again.</p>
                            <button onClick={() => window.location.href = '/auth/login'} className="btn-secondary">
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
