'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MentorOfficeHours({ availability = [], onSelectSlot }) {
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    // Group availability slots by day of week
    const groupedSlots = DAY_NAMES.map((name, index) => {
        const slots = (Array.isArray(availability) ? availability : []).filter(
            (slot) => slot && Number(slot.dayOfWeek) === index && slot.isAvailable !== false
        );
        return { dayName: name, dayIndex: index, slots };
    });

    const hasAnySlots = (Array.isArray(availability) ? availability : []).some((s) => s && s.isAvailable !== false);

    const handleSelect = (slot) => {
        if (!slot) return;
        setSelectedSlotId(slot._id || `${slot.dayOfWeek}-${slot.startTime}`);
        if (onSelectSlot) {
            onSelectSlot(slot);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                        <FiClock className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Weekly Office Hours</h3>
                        <p className="text-gray-400 text-xs">Pick a recurring slot that works for you</p>
                    </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    Live Schedule
                </span>
            </div>

            {!hasAnySlots ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                    <FiCalendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No regular office hour slots posted yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {groupedSlots.map(({ dayName, slots }) => (
                        <div
                            key={dayName}
                            className={`p-3.5 rounded-2xl border transition-all ${
                                slots.length > 0
                                    ? 'bg-white/[0.03] border-white/10'
                                    : 'bg-white/[0.01] border-white/5 opacity-50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    {dayName.slice(0, 3)}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium">
                                    {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
                                </span>
                            </div>

                            {slots.length === 0 ? (
                                <p className="text-xs text-gray-600 italic">Unavailable</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {slots.map((slot) => {
                                        const slotKey = slot._id || `${slot.dayOfWeek}-${slot.startTime}`;
                                        const isSelected = selectedSlotId === slotKey;
                                        return (
                                            <button
                                                key={slotKey}
                                                type="button"
                                                onClick={() => handleSelect(slot)}
                                                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                                                    isSelected
                                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                                                        : 'bg-white/5 hover:bg-violet-500/20 text-gray-300 hover:text-white border border-white/5'
                                                }`}
                                            >
                                                <span>
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                                {isSelected && <FiCheckCircle className="w-3.5 h-3.5 text-white" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
