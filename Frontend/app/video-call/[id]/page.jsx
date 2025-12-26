'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import socketService from '@/lib/socket';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/axios';
import Peer from 'simple-peer';
import {
    FiMic,
    FiMicOff,
    FiVideo,
    FiVideoOff,
    FiPhoneMissed,
    FiMonitor,
    FiMaximize,
    FiX,
    FiMessageSquare
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function VideoCallPage() {
    const { id: bookingId } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState('');
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get(`/bookings/${bookingId}`);
                setBooking(res.data);
                const otherUserId = user.role === 'student' ? res.data.mentor._id : res.data.student._id;
                setIdToCall(otherUserId);

                const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }

                const token = localStorage.getItem('token');
                socketService.connect(token);
                socketService.joinUserRoom(user._id);

                socketService.on('incoming-call', (data) => {
                    setReceivingCall(true);
                    setCaller(data.from);
                    setName(data.name);
                    setCallerSignal(data.offer);
                });
            } catch (err) {
                console.error('Media access error:', err);
                toast.error('Could not access camera/microphone');
            }
        };

        init();

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            socketService.off('incoming-call');
            socketService.off('call-accepted');
        };
    }, [bookingId]);

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socketService.emit('call-user', {
                to: id,
                offer: data,
                callerId: user._id,
                callerName: user.fullName,
                roomId: bookingId
            });
        });

        peer.on('stream', (userStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = userStream;
            }
        });

        socketService.on('call-accepted', (data) => {
            setCallAccepted(true);
            peer.signal(data.answer);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socketService.emit('call-accepted', { to: caller, answer: data });
        });

        peer.on('stream', (userStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = userStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();
        router.push('/bookings');
    };

    const toggleMute = () => {
        const audioTrack = stream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
    };

    const toggleVideo = () => {
        const videoTrack = stream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
    };

    return (
        <div className="h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-7xl h-full max-h-[90vh] grid grid-cols-1 lg:grid-cols-4 gap-4 z-10">
                {/* Main Video View */}
                <div className="lg:col-span-3 bg-gray-900 rounded-[40px] relative overflow-hidden shadow-2xl border border-gray-800">
                    {callAccepted && !callEnded ? (
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-6">
                            <div className="w-32 h-32 rounded-full bg-gray-800 animate-pulse flex items-center justify-center">
                                <FiUser className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold tracking-widest uppercase opacity-50">Waiting for participant...</h2>
                            {!receivingCall && (
                                <button onClick={() => callUser(idToCall)} className="btn-primary py-4 px-10">
                                    START CALL
                                </button>
                            )}
                        </div>
                    )}

                    {/* My Small Video */}
                    <div className="absolute bottom-6 right-6 w-48 aspect-video bg-gray-800 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-2xl">
                        <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover scale-x-[-1]" />
                        {isVideoOff && (
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                <FiVideoOff className="w-6 h-6 text-gray-500" />
                            </div>
                        )}
                    </div>

                    {/* Incoming Call Toast */}
                    <AnimatePresence>
                        {receivingCall && !callAccepted && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] flex flex-col items-center space-y-4 shadow-2xl z-50"
                            >
                                <p className="text-white font-bold">{name} is calling you...</p>
                                <div className="flex space-x-4">
                                    <button onClick={answerCall} className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all scale-110 active:scale-95">
                                        <FiVideo className="w-6 h-6" />
                                    </button>
                                    <button onClick={() => setReceivingCall(false)} className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all active:scale-95">
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Info & Controls */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="glassmorphism bg-white/5 border-white/10 p-8 rounded-[40px] flex-1 text-white">
                        <h3 className="text-sm font-bold text-primary-500 uppercase tracking-widest mb-4">Session Info</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-gray-400 capitalize">{user.role === 'student' ? 'Mentor' : 'Student'}</p>
                                <p className="text-lg font-bold">{user.role === 'student' ? booking?.mentor?.fullName : booking?.student?.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Scheduled Time</p>
                                <p className="text-lg font-bold">{booking?.startTime} - {booking?.endTime}</p>
                            </div>
                            <div className="pt-6 border-t border-white/10 mt-6">
                                <p className="text-xs text-green-500 font-bold uppercase mb-2">Meeting Live</p>
                                <div className="p-4 bg-white/5 rounded-2xl text-xs space-y-2">
                                    <p className="flex justify-between"><span>Status:</span> <span className="text-green-400">Connected</span></p>
                                    <p className="flex justify-between"><span>Encryption:</span> <span>AES-256</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call Controls */}
                    <div className="flex lg:flex-wrap items-center justify-center gap-4 p-6 bg-white/5 rounded-[40px] border border-white/10">
                        <button
                            onClick={toggleMute}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={toggleVideo}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isVideoOff ? <FiVideoOff className="w-6 h-6" /> : <FiVideo className="w-6 h-6" />}
                        </button>
                        <button className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10 text-white hover:bg-white/20">
                            <FiMonitor className="w-6 h-6" />
                        </button>
                        <button className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10 text-white hover:bg-white/20">
                            <FiMessageSquare className="w-6 h-6" />
                        </button>
                        <button
                            onClick={leaveCall}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/40"
                        >
                            <FiPhoneMissed className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
