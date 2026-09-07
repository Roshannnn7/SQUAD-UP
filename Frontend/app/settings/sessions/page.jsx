'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import { FiMonitor, FiSmartphone, FiTrash2, FiShield, FiAlertTriangle, FiClock, FiGlobe } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

function parseUserAgent(ua) {
    if (!ua) return { browser: 'Unknown Browser', os: 'Unknown OS', isMobile: false };
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);
    let browser = 'Unknown';
    if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edge|edg/i.test(ua)) browser = 'Edge';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';

    let os = 'Unknown OS';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

    return { browser, os, isMobile };
}

export default function SessionsPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/sessions');
            setSessions(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Sessions error:', error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const revokeSession = async (sessionId) => {
        try {
            setRevoking(sessionId);
            await api.delete(`/auth/sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s._id !== sessionId));
            toast.success('Session revoked');
        } catch (error) {
            toast.error('Failed to revoke session');
        } finally {
            setRevoking(null);
        }
    };

    const revokeAllOthers = async () => {
        try {
            setShowConfirm(false);
            await api.delete('/auth/sessions');
            await fetchSessions();
            toast.success('All other sessions revoked');
        } catch (error) {
            toast.error('Failed to revoke sessions');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                {/* Back link */}
                <Link href="/settings" className="text-gray-500 hover:text-white text-sm mb-6 inline-flex items-center gap-2 transition-colors">
                    ← Back to Settings
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
                        <FiShield className="text-indigo-400 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Active Sessions</h1>
                        <p className="text-gray-400 text-sm">{sessions.length} device{sessions.length !== 1 ? 's' : ''} currently signed in</p>
                    </div>
                </div>

                {sessions.length > 1 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FiAlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0" />
                            <p className="text-red-300 text-sm">Don&apos;t recognise a session? Revoke it immediately.</p>
                        </div>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="text-red-400 hover:text-red-300 text-sm font-bold whitespace-nowrap ml-4 transition-colors"
                        >
                            Revoke All Others
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl">
                        <FiShield className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No active sessions found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {sessions.map((session, i) => {
                                const { browser, os, isMobile } = parseUserAgent(session.userAgent);
                                const isFirst = i === 0;
                                return (
                                    <motion.div
                                        key={session._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`bg-white/5 border rounded-2xl p-5 flex items-center gap-4 ${isFirst ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/10'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isFirst ? 'bg-violet-600/30' : 'bg-white/10'}`}>
                                            {isMobile
                                                ? <FiSmartphone className={`w-5 h-5 ${isFirst ? 'text-violet-400' : 'text-gray-400'}`} />
                                                : <FiMonitor className={`w-5 h-5 ${isFirst ? 'text-violet-400' : 'text-gray-400'}`} />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-semibold text-sm">{browser} on {os}</p>
                                                {isFirst && (
                                                    <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                {session.ip && (
                                                    <span className="flex items-center gap-1">
                                                        <FiGlobe className="w-3 h-3" /> {session.ip}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <FiClock className="w-3 h-3" />
                                                    {session.updatedAt ? formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true }) : 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                        {!isFirst && (
                                            <button
                                                onClick={() => revokeSession(session._id)}
                                                disabled={revoking === session._id}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                                                title="Revoke session"
                                            >
                                                {revoking === session._id
                                                    ? <div className="w-4 h-4 border-2 border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                                                    : <FiTrash2 className="w-4 h-4" />
                                                }
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Confirm Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FiAlertTriangle className="text-red-400 w-6 h-6" />
                            </div>
                            <h3 className="text-white font-black text-xl text-center mb-2">Revoke All Sessions?</h3>
                            <p className="text-gray-400 text-center text-sm mb-6">This will sign you out of all other devices. Your current session will remain active.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowConfirm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl transition-all">
                                    Cancel
                                </button>
                                <button onClick={revokeAllOthers} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-2xl transition-all">
                                    Revoke All
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
