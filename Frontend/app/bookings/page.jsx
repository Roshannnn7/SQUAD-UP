'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiVideo,
    FiAlertCircle,
    FiChevronRight,
    FiExternalLink,
    FiDollarSign
} from 'react-icons/fi';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/bookings', {
                params: {
                    type: activeTab
                }
            });
            setBookings(res.data);
        } catch (error) {
            console.error('Fetch bookings error:', error);
            toast.error('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            toast.success(`Booking ${status}`);
            fetchBookings();
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Failed to update status.');
        }
    };

    const handlePayment = async (bookingId) => {
        try {
            const { data } = await api.post(`/bookings/${bookingId}/payment`);
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                sessionId: data.sessionId, // Note: Backend needs to return sessionId for Stripe Checkout or clientSecret for Elements
            });
            if (error) toast.error(error.message);
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Failed to initiate payment.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Sessions</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your mentorship sessions and bookings.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white dark:bg-gray-800 text-gray-500'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white dark:bg-gray-800 text-gray-500'}`}
                    >
                        Past Sessions
                    </button>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-3xl" />)
                    ) : bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glassmorphism p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center space-x-6">
                                    <img
                                        src={(user.role === 'student' ? booking.mentor?.profilePhoto : booking.student?.profilePhoto) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.role === 'student' ? booking.mentor?.fullName : booking.student?.fullName}`}
                                        className="w-16 h-16 rounded-2xl object-cover"
                                        alt=""
                                    />
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {user.role === 'student' ? booking.mentor?.fullName : booking.student?.fullName}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><FiCalendar className="text-primary-500" /> {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><FiClock className="text-primary-500" /> {booking.startTime} - {booking.endTime}</span>
                                            <span className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">₹{booking.price}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {user.role === 'mentor' && booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                                                className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                                            >
                                                <FiCheckCircle /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                className="px-6 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {booking.status === 'accepted' && (
                                        <>
                                            <Link href={`/video-call/${booking._id}`} className="btn-primary py-2 px-6 text-sm flex items-center gap-2 bg-green-600 hover:bg-green-700 shadow-green-500/20">
                                                <FiVideo /> Start Call
                                            </Link>
                                            {user.role === 'student' && booking.paymentStatus === 'pending' && (
                                                <button
                                                    onClick={() => handlePayment(booking._id)}
                                                    className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-xl text-sm font-bold hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/20"
                                                >
                                                    <FiDollarSign /> Pay Now
                                                </button>
                                            )}
                                        </>
                                    )}

                                    <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:text-primary-600 transition-colors">
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 glassmorphism rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <FiCalendar className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No sessions found</h3>
                            <p className="text-gray-500 text-sm mt-1">You don't have any {activeTab} sessions at the moment.</p>
                            {user.role === 'student' && (
                                <Link href="/mentors" className="btn-primary mt-6 inline-block py-2 px-8">Find a Mentor</Link>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
