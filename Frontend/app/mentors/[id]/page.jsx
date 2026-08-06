'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiStar,
    FiCheckCircle,
    FiClock,
    FiBriefcase,
    FiAward,
    FiCalendar,
    FiVideo,
    FiX,
    FiMessageCircle,
    FiGithub,
    FiLinkedin,
    FiGlobe
} from 'react-icons/fi';

export default function MentorProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingNotes, setBookingNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMentorDetails();
    }, [id]);

    const fetchMentorDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/mentors/${id}`);
            setMentor(res.data);
        } catch (error) {
            console.error('Fetch mentor error:', error);
            toast.error('Failed to load mentor profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!selectedSlot) {
            toast.error('Please select a time slot.');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/bookings', {
                mentorId: mentor.user._id,
                availabilityId: selectedSlot._id,
                scheduledDate: selectedSlot.specificDate || new Date(), // Simulating date for recurring slots
                mode: 'Online',
                notes: bookingNotes
            });

            toast.success('Booking request sent successfully!');
            setIsBookingModalOpen(false);
            router.push('/dashboard/student');
        } catch (error) {
            console.error('Booking error:', error);
            toast.error(error.response?.data?.message || 'Failed to book session.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!mentor) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mentor not found</h2>
                <button onClick={() => router.push('/mentors')} className="btn-primary">Back to Mentors</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Info Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-8">
                                <div className="relative shrink-0">
                                    <img
                                        src={mentor.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.user?.fullName}`}
                                        alt={mentor.user?.fullName}
                                        className="w-32 h-32 rounded-3xl object-cover"
                                    />
                                    {mentor.isVerified && (
                                        <div className="absolute -top-3 -right-3 bg-white dark:bg-gray-900 p-1 rounded-full shadow-lg">
                                            <FiCheckCircle className="w-8 h-8 text-primary-500 fill-current" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {mentor.user?.fullName}
                                        </h1>
                                        <div className="flex items-center space-x-2 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full font-bold">
                                            <FiStar className="fill-current" />
                                            <span>{mentor.rating} ({mentor.reviews?.length || 0} reviews)</span>
                                        </div>
                                    </div>

                                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 flex items-center gap-2">
                                        <FiBriefcase />
                                        {mentor.currentRole} at <span className="font-bold text-gray-900 dark:text-white">{mentor.company}</span>
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        {mentor.linkedinProfile && (
                                            <a href={mentor.linkedinProfile} target="_blank" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:text-primary-600 transition-colors">
                                                <FiLinkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                        {mentor.githubProfile && (
                                            <a href={mentor.githubProfile} target="_blank" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:text-primary-600 transition-colors">
                                                <FiGithub className="w-5 h-5" />
                                            </a>
                                        )}
                                        {mentor.portfolioUrl && (
                                            <a href={mentor.portfolioUrl} target="_blank" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:text-primary-600 transition-colors">
                                                <FiGlobe className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* About Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                {mentor.bio}
                            </p>

                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FiAward /> Expertise
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {mentor.expertise?.map((skill, idx) => (
                                        <span key={idx} className="tag px-4 py-2 bg-primary-50 text-primary-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Reviews Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">System Reviews</h2>
                            <div className="space-y-6">
                                {mentor.reviews && mentor.reviews.length > 0 ? (
                                    mentor.reviews.map((review, idx) => (
                                        <div key={idx} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No reviews yet.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Booking Column */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glassmorphism p-8 rounded-3xl border-2 border-primary-500 shadow-xl"
                        >
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">Pricing</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    ₹{mentor.sessionPrice} <span className="text-lg font-normal text-gray-500">/ session</span>
                                </h3>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <FiClock className="text-primary-500" />
                                    <span>60 minute 1:1 session</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <FiVideo className="text-primary-500" />
                                    <span>Video call meeting link generated</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <FiMessageCircle className="text-primary-500" />
                                    <span>Direct chat after booking</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsBookingModalOpen(true)}
                                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
                            >
                                <FiCalendar />
                                Book a Session
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                Payments are securely processed via Stripe.
                            </p>
                        </motion.div>

                        {/* Experience Card */}
                        <div className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Experience</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                                    <FiBriefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mentor.experience}+ Years</p>
                                    <p className="text-sm text-gray-500">Industry Experience</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBookingModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Session</h2>
                                    <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                            Select available time slot
                                        </label>
                                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                                            {mentor.availability && mentor.availability.length > 0 ? (
                                                mentor.availability.map((slot) => (
                                                    <button
                                                        key={slot._id}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${selectedSlot?._id === slot._id
                                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                                : 'border-gray-100 bg-gray-50 hover:border-primary-200'
                                                            }`}
                                                    >
                                                        <span className="text-sm font-bold uppercase">{slot.dayOfWeek || 'Next Slot'}</span>
                                                        <span className="text-xs">{slot.startTime} - {slot.endTime}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="col-span-2 text-center text-gray-500 py-4">No availability slots listed. Please contact the mentor.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Notes for the mentor (Optional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="input-field"
                                            placeholder="What would you like to discuss?..."
                                            value={bookingNotes}
                                            onChange={(e) => setBookingNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-gray-600">Session Amount</span>
                                            <span className="font-bold text-gray-900 dark:text-white">₹{mentor.sessionPrice}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Platform Fee</span>
                                            <span className="font-bold text-green-600">FREE</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleBooking}
                                        disabled={isSubmitting || !selectedSlot}
                                        className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Processing...' : 'Confirm and Send Request'}
                                    </button>

                                    <p className="text-center text-xs text-gray-400">
                                        The mentor will receive a notification and can accept or reject the request.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
