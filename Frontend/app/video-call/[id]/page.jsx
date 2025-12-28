'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import socketService from '@/lib/socket';
import { useAuth } from '@/components/auth-provider';
import api from '@/lib/axios';
import SimplePeer from 'simple-peer';
import {
    FiMic,
    FiMicOff,
    FiVideo,
    FiVideoOff,
    FiPhoneMissed,
    FiMonitor,
    FiX,
    FiMessageSquare,
    FiUser,
    FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function VideoCallPage() {
    const { id: bookingId } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [stream, setStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState('');
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const mediaRecorderRef = useRef();
    const recordedChunksRef = useRef([]);
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get(`/bookings/${bookingId}`);
                setBooking(res.data);
                const otherUserId = user.role === 'student' ? res.data.mentor._id : res.data.student._id;
                setIdToCall(otherUserId);

                const currentStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 1280, height: 720 }, 
                    audio: { echoCancellation: true, noiseSuppression: true } 
                });
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

                socketService.on('call-message', (data) => {
                    setChatMessages(prev => [...prev, data]);
                });

                socketService.on('screen-share-started', () => {
                    toast.success('Screen sharing started');
                });

                socketService.on('screen-share-stopped', () => {
                    toast.info('Screen sharing stopped');
                });
            } catch (err) {
                console.error('Media access error:', err);
                toast.error('Could not access camera/microphone');
            }
        };

        init();

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (screenStream) screenStream.getTracks().forEach(track => track.stop());
            socketService.off('incoming-call');
            socketService.off('call-accepted');
            socketService.off('call-message');
        };
    }, [bookingId, user._id]);

    const callUser = (id) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
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

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            toast.error('Connection error');
        });

        socketService.on('call-accepted', (data) => {
            setCallAccepted(true);
            peer.signal(data.answer);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on('signal', (data) => {
            socketService.emit('call-accepted', { to: caller, answer: data });
        });

        peer.on('stream', (userStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = userStream;
            }
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            toast.error('Connection error');
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always' },
                    audio: false
                });
                setScreenStream(screenStream);
                setIsScreenSharing(true);

                if (myVideo.current) {
                    myVideo.current.srcObject = screenStream;
                }

                socketService.emit('start-screen-share', { roomId: bookingId, to: idToCall });

                screenStream.getTracks()[0].onended = () => {
                    stopScreenShare();
                };
            } else {
                stopScreenShare();
            }
        } catch (err) {
            console.error('Screen share error:', err);
            if (err.name !== 'NotAllowedError') {
                toast.error('Could not start screen sharing');
            }
        }
    };

    const stopScreenShare = () => {
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
        }
        setIsScreenSharing(false);

        if (stream && myVideo.current) {
            myVideo.current.srcObject = stream;
        }

        socketService.emit('stop-screen-share', { roomId: bookingId, to: idToCall });
    };

    const startRecording = () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const videoElement = userVideo.current || myVideo.current;

            if (!videoElement) {
                toast.error('No video to record');
                return;
            }

            const recordingStream = new MediaStream([
                ...stream.getTracks(),
                ...(callAccepted && userVideo.current?.srcObject ? userVideo.current.srcObject.getTracks() : [])
            ]);

            const mediaRecorder = new MediaRecorder(recordingStream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `call-recording-${Date.now()}.webm`;
                a.click();
                recordedChunksRef.current = [];
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            toast.success('Recording started');
        } catch (err) {
            console.error('Recording error:', err);
            toast.error('Could not start recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast.success('Recording saved');
        }
    };

    const sendChatMessage = () => {
        if (!chatInput.trim()) return;

        const message = {
            sender: user._id,
            senderName: user.fullName,
            content: chatInput,
            timestamp: new Date()
        };

        socketService.emit('send-call-message', {
            to: idToCall,
            ...message
        });

        setChatMessages(prev => [...prev, message]);
        setChatInput('');
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (isRecording) stopRecording();
        if (isScreenSharing) stopScreenShare();
        if (connectionRef.current) connectionRef.current.destroy();
        if (stream) stream.getTracks().forEach(track => track.stop());
        router.push('/bookings');
    };

    const toggleMute = () => {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
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
                        {isScreenSharing && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                SCREEN SHARING
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

                    {/* Recording Indicator */}
                    {isRecording && (
                        <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse flex items-center space-x-2">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            <span>Recording</span>
                        </div>
                    )}
                </div>

                {/* Sidebar Info & Controls */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="glassmorphism bg-white/5 border-white/10 p-8 rounded-[40px] flex-1 text-white overflow-y-auto max-h-96">
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
                                <p className="text-xs text-green-500 font-bold uppercase mb-2">Meeting Status</p>
                                <div className="p-4 bg-white/5 rounded-2xl text-xs space-y-2">
                                    <p className="flex justify-between"><span>Status:</span> <span className={callAccepted ? 'text-green-400' : 'text-yellow-400'}>{callAccepted ? 'Connected' : 'Waiting'}</span></p>
                                    <p className="flex justify-between"><span>Recording:</span> <span className={isRecording ? 'text-red-400' : 'text-gray-400'}>{isRecording ? 'On' : 'Off'}</span></p>
                                    <p className="flex justify-between"><span>Screen:</span> <span className={isScreenSharing ? 'text-purple-400' : 'text-gray-400'}>{isScreenSharing ? 'Sharing' : 'Off'}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call Controls */}
                    <div className="flex lg:flex-wrap items-center justify-center gap-3 p-6 bg-white/5 rounded-[40px] border border-white/10">
                        <button
                            onClick={toggleMute}
                            title="Mute/Unmute"
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isMuted ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={toggleVideo}
                            title="Video On/Off"
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isVideoOff ? <FiVideoOff className="w-5 h-5" /> : <FiVideo className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={toggleScreenShare}
                            title="Screen Share"
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isScreenSharing ? 'bg-purple-500/20 text-purple-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <FiMonitor className="w-5 h-5" />
                        </button>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            title={isRecording ? 'Stop Recording' : 'Start Recording'}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/30 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <FiDownload className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            title="Chat"
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${chatOpen ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <FiMessageSquare className="w-5 h-5" />
                        </button>
                        <button
                            onClick={leaveCall}
                            title="End Call"
                            className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/40"
                        >
                            <FiPhoneMissed className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Panel */}
                    {chatOpen && (
                        <div className="glassmorphism bg-white/5 border-white/10 p-4 rounded-[40px] flex flex-col h-64">
                            <h3 className="text-sm font-bold text-white mb-3">Chat</h3>
                            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`px-3 py-2 rounded-lg text-xs ${msg.sender === user._id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                                            <p className="font-bold text-xs mb-1">{msg.senderName}</p>
                                            <p>{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                    placeholder="Type message..."
                                    className="flex-1 px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                                />
                                <button
                                    onClick={sendChatMessage}
                                    className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
