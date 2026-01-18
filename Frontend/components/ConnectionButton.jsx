'use client';

import { useState, useEffect } from 'react';
import { FiUserPlus, FiUserCheck, FiUserX, FiLoader, FiClock } from 'react-icons/fi';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ConnectionButton({ userId, initialStatus = 'none', onStatusChange }) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [isRequester, setIsRequester] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get(`/connections/status/${userId}`);
                setStatus(res.data.data.status);
                setIsRequester(res.data.data.isRequester);
            } catch (error) {
                console.error('Check connection status error:', error);
            }
        };
        if (userId) checkStatus();
    }, [userId]);

    const handleConnect = async () => {
        try {
            setLoading(true);
            await api.post('/connections/request', { recipientId: userId });
            setStatus('pending');
            setIsRequester(true);
            toast.success('Connection request sent!');
            if (onStatusChange) onStatusChange('pending');
        } catch (error) {
            console.error('Connect error:', error);
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!window.confirm('Are you sure you want to remove this connection?')) return;
        try {
            setLoading(true);
            // Search for the connection object first to get ID
            const res = await api.get(`/connections/status/${userId}`);
            const connectionId = res.data.data.connection?._id;
            if (connectionId) {
                await api.delete(`/connections/${connectionId}`);
                setStatus('none');
                toast.success('Connection removed');
                if (onStatusChange) onStatusChange('none');
            }
        } catch (error) {
            console.error('Remove connection error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <button disabled className="p-2 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center space-x-2 animate-pulse">
                <FiLoader className="animate-spin" /> <span>Loading...</span>
            </button>
        );
    }

    if (status === 'accepted') {
        return (
            <button
                onClick={handleRemove}
                className="p-2 px-6 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 flex items-center space-x-2 hover:bg-emerald-100 transition-colors font-bold text-sm"
            >
                <FiUserCheck /> <span>Connected</span>
            </button>
        );
    }

    if (status === 'pending') {
        return (
            <button
                onClick={isRequester ? handleRemove : undefined}
                className="p-2 px-6 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-800 flex items-center space-x-2 hover:bg-amber-100 transition-colors font-bold text-sm"
            >
                <FiClock /> <span>{isRequester ? 'Pending Approval' : 'Review Request'}</span>
            </button>
        );
    }

    if (status === 'rejected') {
        return (
            <button disabled className="p-2 px-6 rounded-2xl bg-red-50 text-red-600 border border-red-100 opacity-50 flex items-center space-x-2 font-bold text-sm">
                <FiUserX /> <span>Not Connected</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleConnect}
            className="btn-primary py-2 px-6 rounded-2xl flex items-center space-x-2 font-bold text-sm"
        >
            <FiUserPlus /> <span>Connect</span>
        </button>
    );
}
