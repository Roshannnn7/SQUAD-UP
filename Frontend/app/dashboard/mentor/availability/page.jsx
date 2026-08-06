'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function AvailabilityPage() {
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        isRecurring: true,
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            // We need a route for mentor's own availability. 
            // mentorController has addAvailability which uses req.user._id.
            // Let's assume there's a route for getting own availability.
            const res = await api.get('/mentors/availability/me');
            setAvailability(res.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/mentors/availability', formData);
            setAvailability([...availability, res.data]);
            toast.success('Slot added!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add slot.');
        }
    };

    const deleteSlot = async (id) => {
        try {
            await api.delete(`/mentors/availability/${id}`);
            setAvailability(availability.filter(a => a._id !== id));
            toast.success('Slot removed');
        } catch (error) {
            toast.error('Failed to remove slot.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <Link href="/dashboard/mentor" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 font-bold text-sm">
                    <FiArrowLeft /> Back to Dashboard
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Add Slot Form */}
                    <div className="md:col-span-1">
                        <div className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Slot</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label">Day</label>
                                    <select
                                        className="input-field"
                                        value={formData.dayOfWeek}
                                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                    >
                                        {days.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Start Time</label>
                                    <input
                                        type="time"
                                        className="input-field"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">End Time</label>
                                    <input
                                        type="time"
                                        className="input-field"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isRecurring}
                                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                    />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recurring Weekly</span>
                                </div>
                                <button type="submit" className="w-full btn-primary py-3 mt-4 flex items-center justify-center gap-2">
                                    <FiPlus /> Add Slot
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Slots List */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                            Current Availability
                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{availability.length} Slots</span>
                        </h2>

                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)
                        ) : availability.length > 0 ? (
                            availability.map((slot) => (
                                <motion.div
                                    key={slot._id}
                                    className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600">
                                            <FiCalendar />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{slot.dayOfWeek}</h4>
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><FiClock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteSlot(slot._id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <FiTrash2 />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-500">No availability slots added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
