'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { FiPhone, FiVideo } from 'react-icons/fi';

export default function VideoCallInitiator({ receiverId, receiverName, bookingId, squadId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const initiateCall = async () => {
        try {
            setLoading(true);

            const response = await api.post('/video-calls/initiate', {
                receiverId,
                callType: 'one-on-one',
                bookingId,
                squadId,
            });

            toast.success('Calling ' + receiverName);
            router.push(`/video-call?callId=${response.data._id}&receiverId=${receiverId}`);
        } catch (error) {
            console.error('Error initiating call:', error);
            toast.error('Failed to initiate call');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initiateCall}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
            <FiPhone size={18} />
            {loading ? 'Calling...' : 'Start Video Call'}
        </motion.button>
    );
}
