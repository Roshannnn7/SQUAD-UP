'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { FiPhone, FiPhoneOff } from 'react-icons/fi';

export default function IncomingCallNotification({ socket }) {
    const router = useRouter();
    const [incomingCall, setIncomingCall] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('incoming-call', (data) => {
            setIncomingCall(data);
            // Play ringtone (optional)
            playRingtone();
        });

        return () => {
            socket.off('incoming-call');
        };
    }, [socket]);

    const playRingtone = () => {
        // Use Web Audio API or simple beep
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    };

    const acceptCall = async () => {
        try {
            await api.put(`/video-calls/${incomingCall._id}/accept`);
            toast.success('Call accepted');
            router.push(`/video-call?callId=${incomingCall._id}&receiverId=${incomingCall.initiator._id}`);
            setIncomingCall(null);
        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error('Failed to accept call');
        }
    };

    const rejectCall = async () => {
        try {
            await api.put(`/video-calls/${incomingCall._id}/reject`);
            setIncomingCall(null);
            toast.info('Call rejected');
        } catch (error) {
            console.error('Error rejecting call:', error);
            toast.error('Failed to reject call');
        }
    };

    return (
        <AnimatePresence>
            {incomingCall && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                >
                    <motion.div
                        className="bg-gray-900 rounded-2xl p-8 text-center max-w-sm w-full mx-4"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    >
                        {/* Avatar */}
                        <div className="mb-6">
                            <img
                                src={incomingCall.initiator.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + incomingCall.initiator._id}
                                alt={incomingCall.initiator.fullName}
                                className="w-24 h-24 rounded-full mx-auto object-cover"
                            />
                        </div>

                        {/* Caller info */}
                        <h2 className="text-2xl font-bold text-white mb-2">{incomingCall.initiator.fullName}</h2>
                        <p className="text-gray-400 mb-8">is calling you...</p>

                        {/* Action buttons */}
                        <div className="flex items-center justify-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={rejectCall}
                                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition"
                            >
                                <FiPhoneOff size={24} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={acceptCall}
                                className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition"
                            >
                                <FiPhone size={24} />
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
