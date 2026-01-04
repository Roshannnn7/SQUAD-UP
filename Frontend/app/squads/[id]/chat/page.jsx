"use client";


import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    setDoc,
    serverTimestamp,
    deleteDoc,
    updateDoc,
    doc,
    where,
    getDocs
} from 'firebase/firestore';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import {
    FiSend,
    FiPlus,
    FiSmile,
    FiPaperclip,
    FiArrowLeft,
    FiUsers,
    FiSettings,
    FiCpu,
    FiMessageCircle,
    FiVideo,
    FiLogOut,
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiCopy,
    FiX,
    FiCheck,
    FiActivity,
    FiMoon,
    FiSun,
    FiImage
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

import { useTheme } from 'next-themes';

export default function ProjectChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { setTheme, theme } = useTheme();

    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState([]);
    const [memberStatus, setMemberStatus] = useState({});
    const [showSettings, setShowSettings] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingUpdateRef = useRef(0);

    const isLeaderVar = project?.creator?._id === user?._id;
    const isMember = project?.members?.some(m => m.user._id === user?._id);

    useEffect(() => {
        fetchProject();

        // Listen to messages
        const q = query(
            collection(db, "squads", id, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data(),
                content: doc.data().text,
                sender: {
                    _id: doc.data().senderId,
                    fullName: doc.data().senderName,
                    profilePhoto: doc.data().senderPhoto
                },
                createdAt: doc.data().createdAt?.toDate()
            }));
            setMessages(msgs);
            setTimeout(scrollToBottom, 100);
        });

        // Listen to typing status
        const typingQuery = query(
            collection(db, "squads", id, "typing"),
            orderBy("timestamp", "desc")
        );

        const unsubscribeTyping = onSnapshot(typingQuery, (snapshot) => {
            const now = Date.now();
            const activeTypers = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(data => {
                    const timestamp = data.timestamp?.toDate()?.getTime();
                    return data.id !== user?._id && timestamp && (now - timestamp < 3000);
                });
            setTypingUsers(activeTypers);
        });

        // Listen to presence
        const presenceQuery = collection(db, "squads", id, "presence");
        const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
            const statusMap = {};
            snapshot.docs.forEach(doc => {
                statusMap[doc.id] = doc.data();
            });
            setMemberStatus(statusMap);
        });

        // Set initial online status and heartbeat
        const updatePresence = async (status) => {
            if (!user?._id) return;
            const userStatusRef = doc(db, "squads", id, "presence", user._id);
            try {
                await setDoc(userStatusRef, {
                    isOnline: status === 'online',
                    lastSeen: serverTimestamp(),
                    userId: user._id,
                    userName: user.fullName || 'Unknown'
                }, { merge: true });
            } catch (err) {
                console.error("Presence update failed", err);
            }
        };

        updatePresence('online');
        const intervalId = setInterval(() => updatePresence('online'), 30000); // Heartbeat every 30s

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                updatePresence('offline');
            } else {
                updatePresence('online');
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', () => updatePresence('offline'));

        return () => {
            unsubscribeMessages();
            unsubscribeTyping();
            unsubscribePresence();
            clearInterval(intervalId);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            updatePresence('offline');
        };
    }, [id, user?._id]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load project details.');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = async (e) => {
        setNewMessage(e.target.value);

        if (!user?._id) return;

        const now = Date.now();
        if (now - lastTypingUpdateRef.current > 2000) {
            lastTypingUpdateRef.current = now;
            try {
                await setDoc(doc(db, "squads", id, "typing", user._id), {
                    name: user.fullName,
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.error("Typing indicator error", error);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await addDoc(
                collection(db, "squads", id, "messages"),
                {
                    text: newMessage,
                    senderId: user?._id,
                    senderName: user?.fullName,
                    senderPhoto: user?.profilePhoto,
                    createdAt: serverTimestamp()
                }
            );
            setNewMessage('');
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send message.');
        }
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading(`Uploading ${file.name}...`);

        try {
            // Create a reference to the file in Firebase Storage
            const fileRef = ref(storage, `squads/${id}/files/${Date.now()}_${file.name}`);

            // Upload the file
            const snapshot = await uploadBytes(fileRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(
                collection(db, "squads", id, "messages"),
                {
                    text: `📎 Attached file: ${file.name}`,
                    fileUrl: downloadURL,
                    fileName: file.name,
                    fileType: file.type,
                    senderId: user?._id,
                    senderName: user?.fullName,
                    senderPhoto: user?.profilePhoto,
                    createdAt: serverTimestamp(),
                    messageType: file.type.startsWith('image/') ? 'image' : 'file'
                }
            );
            toast.success('File uploaded!', { id: toastId });
        } catch (error) {
            console.error('File upload error:', error);
            toast.error('Upload failed.', { id: toastId });
        }
    };

    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showMessageMenu, setShowMessageMenu] = useState(null); // ID of message with open menu

    const handleEditMessage = (msg) => {
        setEditingMessageId(msg._id);
        setEditContent(msg.content);
        setShowMessageMenu(null);
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditContent('');
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await deleteDoc(doc(db, "squads", id, "messages", msgId));
            toast.success('Message deleted');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete message');
        }
        setShowMessageMenu(null);
    };

    const handleCopyMessage = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
        setShowMessageMenu(null);
    };

    const handleSaveEdit = async (msgId) => {
        if (!editContent.trim()) return;
        try {
            await updateDoc(doc(db, "squads", id, "messages", msgId), {
                text: editContent,
                isEdited: true
            });
            setEditingMessageId(null);
            setEditContent('');
            toast.success('Message updated');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update message');
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this squad?')) return;
        try {
            setIsLeaving(true);
            await api.post(`/projects/${id}/leave`);
            toast.success('Left squad successfully.');
            router.push('/squads');
        } catch (error) {
            console.error('Leave error:', error);
            toast.error(error.response?.data?.message || 'Failed to leave squad.');
        } finally {
            setIsLeaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 shadow-xl shadow-primary-500/20"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden selection:bg-primary-500/30">
            <Navbar />

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettings(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl">
                                    <FiSettings className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Chat Settings</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Visual Preference</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 ${theme === 'light' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} font-bold transition-all`}
                                        >
                                            <FiSun className="w-4 h-4" /> Light Mode
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-primary-500 bg-primary-900/20 text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'} font-bold transition-all`}
                                        >
                                            <FiMoon className="w-4 h-4" /> Dark Mode
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2">Currently managed by system preferences</p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Notifications</h4>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                                <FiActivity className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Active Status</p>
                                                <p className="text-xs text-gray-500">Show when you're active</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                                            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="flex-1 max-w-[1600px] mx-auto w-full flex mt-16 overflow-hidden relative">


                {/* Decoration */}
                <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex-1 flex flex-col bg-white/80 dark:bg-gray-800/40 backdrop-blur-xl shadow-2xl overflow-hidden relative border-x border-gray-100/50 dark:border-gray-700/30">

                    {/* Header */}
                    <div className="p-5 border-b border-gray-100/50 dark:border-gray-700/50 flex items-center justify-between z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                        <div className="flex items-center space-x-5">
                            <button
                                onClick={() => router.push(`/squads/${id}`)}
                                className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-90 group"
                            >
                                <FiArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                            </button>
                            <div>
                                <h2 className="font-black text-xl text-gray-900 dark:text-white leading-tight tracking-tight uppercase">
                                    {project?.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <p className="text-[10px] text-green-500 font-black tracking-widest uppercase">
                                        Squad Hub Active
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="flex -space-x-2 overflow-hidden mr-4">
                                {project?.members?.slice(0, 3).map((m, i) => (
                                    <img
                                        key={i}
                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                                        src={m.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.fullName}`}
                                        alt=""
                                    />
                                ))}
                                {project?.members?.length > 3 && (
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 text-[10px] font-bold">
                                        +{project?.members?.length - 3}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => router.push(`/squads/${id}/call`)}
                                className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                                title="Start Squad Sync Video Call"
                            >
                                <FiVideo className="w-5 h-5 group-hover:animate-pulse" />
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-3 bg-primary-600/10 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all transform hover:rotate-90 duration-300"
                            >
                                <FiSettings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
                        {messages.length === 0 && !loading && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                <FiMessageCircle className="w-20 h-20 mb-4" />
                                <p className="font-black uppercase tracking-widest text-sm">Initiate Communication</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const isMe = msg.sender?._id === user?._id;
                            const prevMsg = idx > 0 ? messages[idx - 1] : null;
                            const showAvatar = !isMe && prevMsg?.sender?._id !== msg.sender?._id;
                            const isEditing = editingMessageId === msg._id;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    key={msg._id || idx}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${!showAvatar && !isMe ? 'ml-12' : ''}`}
                                >
                                    {!isMe && showAvatar && (
                                        <img
                                            src={msg.sender?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.fullName}`}
                                            className="w-10 h-10 rounded-2xl mr-3 self-end shadow-sm ring-2 ring-white dark:ring-gray-700"
                                            alt=""
                                        />
                                    )}
                                    <div className={`max-w-[70%] group relative`}>
                                        {!isMe && showAvatar && (
                                            <p className="text-[10px] font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">
                                                {msg.sender?.fullName}
                                            </p>
                                        )}

                                        <div
                                            className={`px-5 py-3.5 rounded-[22px] text-sm shadow-sm transition-all hover:shadow-md ${isMe
                                                ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600/30'
                                                }`}
                                        >
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="bg-white/20 text-white placeholder-white/50 border border-white/30 rounded-lg px-2 py-1 outline-none w-full"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveEdit(msg._id);
                                                            if (e.key === 'Escape') handleCancelEdit();
                                                        }}
                                                    />
                                                    <button onClick={() => handleSaveEdit(msg._id)} className="p-1 hover:bg-white/20 rounded">
                                                        <FiCheck className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="p-1 hover:bg-white/20 rounded">
                                                        <FiX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {msg.messageType === 'image' && msg.fileUrl ? (
                                                        <div className="-mx-2 -mt-2 mb-2">
                                                            <img
                                                                src={msg.fileUrl}
                                                                alt="Attached image"
                                                                className="max-w-[250px] sm:max-w-sm rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                                                                onClick={() => window.open(msg.fileUrl, '_blank')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="leading-relaxed font-medium">
                                                            {msg.content}
                                                            {msg.isEdited && <span className="text-[10px] opacity-60 ml-1 italic">(edited)</span>}
                                                        </p>
                                                    )}
                                                    {msg.messageType === 'file' && msg.fileUrl && (
                                                        <a
                                                            href={msg.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-2 mt-2 text-xs font-bold uppercase tracking-wider ${isMe ? 'text-white/80 hover:text-white' : 'text-primary-500 hover:text-primary-600'}`}
                                                        >
                                                            <FiPaperclip className="w-3 h-3" /> Download Attachment
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Message Options Menu */}
                                        <div className={`absolute top-0 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                                            <button
                                                onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                                                className="p-1 text-gray-400 hover:text-primary-500 rounded-full"
                                            >
                                                <FiMoreVertical className="w-4 h-4" />
                                            </button>
                                            {showMessageMenu === msg._id && (
                                                <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 py-1 z-50 w-32 overflow-hidden">
                                                    <button
                                                        onClick={() => handleCopyMessage(msg.content)}
                                                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                                    >
                                                        <FiCopy className="w-3 h-3" /> Copy
                                                    </button>
                                                    {isMe && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditMessage(msg)}
                                                                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                                            >
                                                                <FiEdit2 className="w-3 h-3" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteMessage(msg._id)}
                                                                className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
                                                            >
                                                                <FiTrash2 className="w-3 h-3" /> Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className={`flex items-center gap-2 mt-1.5 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
                                            </p>
                                            {isMe && <div className="w-1 h-1 bg-primary-400 rounded-full" />}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Typing Indicators */}
                        <AnimatePresence>
                            {typingUsers.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center space-x-3 text-[10px] text-gray-400 ml-1 font-black uppercase tracking-widest"
                                >
                                    <div className="flex space-x-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-full backdrop-blur-sm">
                                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-blue-500">
                                        {typingUsers.length === 1
                                            ? `${typingUsers[0].name} is typing...`
                                            : `${typingUsers.length} elite hackers are typing...`}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-gray-100/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md absolute bottom-0 left-0 right-0">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-4 max-w-4xl mx-auto">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    placeholder="Type a secure message..."
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-[22px] px-6 py-4 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                    value={newMessage}
                                    onChange={handleTyping}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={`p-2 transition-colors ${showEmojiPicker ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'}`}
                                        >
                                            <FiSmile className="w-5 h-5" />
                                        </button>

                                        <AnimatePresence>
                                            {showEmojiPicker && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                    className="absolute bottom-full right-0 mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl z-50 grid grid-cols-4 gap-2"
                                                >
                                                    {['🔥', '🚀', '💻', '⭐', '✅', '❤️', '👍', '🙌'].map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={() => handleEmojiClick(emoji)}
                                                            className="text-2xl hover:scale-125 transition-transform"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleFileClick}
                                        className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                                    >
                                        <FiPaperclip className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-5 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-[22px] hover:shadow-xl hover:shadow-primary-500/30 transition-all active:scale-90 disabled:opacity-30 disabled:grayscale"
                            >
                                <FiSend className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Sidebar (Desktop Only) */}
                <div className="hidden xl:block w-96 bg-transparent p-8 overflow-y-auto">
                    <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-gradient-to-tr from-primary-500/20 to-blue-500/20 rounded-[40px] flex items-center justify-center text-primary-600 mx-auto mb-6 shadow-sm border border-primary-500/10">
                            <FiCpu className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white line-clamp-2 tracking-tight uppercase leading-tight">{project?.name}</h3>
                        <p className="text-xs text-gray-400 mt-3 font-bold uppercase tracking-widest">Squad Leaders: {project?.creator?.fullName}</p>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white/50 dark:bg-gray-800/30 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-700/30 shadow-sm transition-all hover:shadow-md">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Members • {project?.members?.length}</h4>
                            <div className="space-y-4">
                                {project?.members?.map((member) => (
                                    <div key={member.user._id} className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <img
                                                    src={member.user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.fullName}`}
                                                    className="w-9 h-9 rounded-xl object-cover transition-transform group-hover:scale-110"
                                                    alt=""
                                                />
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white dark:border-gray-800 rounded-full ${memberStatus[member.user._id]?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors block">{member.user?.fullName}</span>
                                                <span className="text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-gray-500 to-gray-400 font-bold uppercase tracking-tight">
                                                    {memberStatus[member.user._id]?.isOnline
                                                        ? 'Active now'
                                                        : memberStatus[member.user._id]?.lastSeen
                                                            ? `Seen ${formatDistanceToNow(memberStatus[member.user._id].lastSeen.toDate(), { addSuffix: true })}`
                                                            : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {member.role === 'leader' && <span className="text-[7px] bg-yellow-400/10 text-yellow-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm border border-yellow-400/20">Lead</span>}
                                            {user?._id !== member.user._id && (
                                                <button
                                                    onClick={() => router.push(`/messages/${member.user._id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                                                    title="Message directly"
                                                >
                                                    <FiMessageCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leave Squad Option in Chat Sidebar */}
                        {/* Leave Squad Option in Chat Sidebar */}
                        {!isLeaderVar && (
                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleLeave}
                                    disabled={isLeaving}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm"
                                >
                                    <FiLogOut className="w-4 h-4" />
                                    {isLeaving ? 'Leaving...' : 'Leave Squad'}
                                </button>
                            </div>
                        )}

                        <div className="p-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Description</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic">
                                "{project?.description}"
                            </p>
                        </div>

                        <button
                            onClick={handleLeave}
                            disabled={isLeaving}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/5 text-red-500 rounded-[22px] text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/10 hover:shadow-xl hover:shadow-red-500/20 mt-10"
                        >
                            {isLeaving ? 'Terminating...' : 'Terminate Connection'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
