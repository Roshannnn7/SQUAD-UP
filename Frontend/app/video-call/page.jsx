'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiPhone,
    FiPhoneOff,
    FiMic,
    FiMicOff,
    FiVideo,
    FiVideoOff,
    FiSettings,
    FiShare2,
    FiArrowLeft,
} from 'react-icons/fi';

export default function VideoCall() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);

    const callId = searchParams.get('callId');
    const receiverId = searchParams.get('receiverId');

    const [callActive, setCallActive] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [loading, setLoading] = useState(true);

    // Initialize call
    useEffect(() => {
        const initializeCall = async () => {
            try {
                // Get user media
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: { width: 1280, height: 720 },
                });

                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Create WebRTC peer connection
                const peerConnection = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ],
                });

                peerConnectionRef.current = peerConnection;

                // Add local stream tracks
                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream);
                });

                // Handle remote stream
                peerConnection.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                // Handle ICE candidates
                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        // Send ICE candidate to signaling server
                        sendSignalingMessage({
                            type: 'ice-candidate',
                            candidate: event.candidate,
                            callId,
                        });
                    }
                };

                // Update connection state
                peerConnection.onconnectionstatechange = () => {
                    if (peerConnection.connectionState === 'connected') {
                        setCallActive(true);
                        toast.success('Call connected!');
                    } else if (peerConnection.connectionState === 'failed') {
                        toast.error('Connection failed');
                    }
                };

                setLoading(false);
            } catch (error) {
                console.error('Error accessing media:', error);
                toast.error('Unable to access camera/microphone');
                router.back();
            }
        };

        if (user && callId) {
            initializeCall();
        }
    }, [user, callId, router]);

    // Call duration timer
    useEffect(() => {
        if (!callActive) return;

        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [callActive]);

    const sendSignalingMessage = async (message) => {
        try {
            await api.post(`/video-calls/${callId}/signal`, message);
        } catch (error) {
            console.error('Signaling error:', error);
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setAudioEnabled(!audioEnabled);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setVideoEnabled(!videoEnabled);
        }
    };

    const endCall = async () => {
        try {
            // Stop all tracks
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            peerConnectionRef.current?.close();

            // Notify backend
            await api.put(`/video-calls/${callId}/end`);

            toast.success('Call ended');
            router.back();
        } catch (error) {
            console.error('Error ending call:', error);
            toast.error('Error ending call');
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white">Setting up video call...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Navbar />

            <div className="flex-1 flex gap-4 p-4 bg-black">
                {/* Remote video */}
                <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!callActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-center">
                                <div className="animate-pulse text-white mb-4">Waiting for connection...</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local video (picture-in-picture) */}
                <div className="w-64 bg-gray-800 rounded-lg overflow-hidden relative">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                </div>
            </div>

            {/* Call controls */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="bg-gray-900 border-t border-gray-800 p-6"
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    {/* Duration */}
                    <div className="text-white text-xl font-semibold">
                        {formatDuration(callDuration)}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 transition"
                            title="Back"
                        >
                            <FiArrowLeft size={20} />
                        </button>

                        <button
                            onClick={toggleAudio}
                            className={`p-3 rounded-full transition ${
                                audioEnabled
                                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title={audioEnabled ? 'Mute' : 'Unmute'}
                        >
                            {audioEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`p-3 rounded-full transition ${
                                videoEnabled
                                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title={videoEnabled ? 'Turn off video' : 'Turn on video'}
                        >
                            {videoEnabled ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
                        </button>

                        <button
                            onClick={endCall}
                            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                            title="End call"
                        >
                            <FiPhoneOff size={20} />
                        </button>

                        <button
                            className="p-3 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 transition"
                            title="Share screen"
                        >
                            <FiShare2 size={20} />
                        </button>
                    </div>

                    {/* Spacer */}
                    <div className="w-20" />
                </div>
            </motion.div>
        </div>
    );
}
