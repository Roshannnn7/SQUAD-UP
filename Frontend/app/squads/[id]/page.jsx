"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import api from "@/lib/axios";
import { db, storage } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/components/auth-provider";
import toast from "react-hot-toast";
import {
    FiSend,
    FiSmile,
    FiPaperclip,
    FiArrowLeft,
    FiSettings,
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiCheck,
    FiX,
} from "react-icons/fi";

export default function SquadChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    /* ---------------- FETCH MESSAGES ---------------- */
    useEffect(() => {
        const q = query(
            collection(db, "squads", id, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({
                _id: d.id,
                ...d.data(),
            }));
            setMessages(data);
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        });

        return () => unsub();
    }, [id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    /* ---------------- SEND MESSAGE ---------------- */
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await addDoc(collection(db, "squads", id, "messages"), {
            text: newMessage,
            senderId: user._id,
            senderName: user.fullName,
            createdAt: serverTimestamp(),
        });

        setNewMessage("");
    };

    /* ---------------- FILE UPLOAD ---------------- */
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileRef = ref(
            storage,
            `squads/${id}/${Date.now()}_${file.name}`
        );

        const snap = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snap.ref);

        await addDoc(collection(db, "squads", id, "messages"), {
            text: `📎 ${file.name}`,
            fileUrl: url,
            senderId: user._id,
            senderName: user.fullName,
            createdAt: serverTimestamp(),
        });
    };

    /* ---------------- REACTIONS ---------------- */
    const addReaction = async (msgId, emoji) => {
        await updateDoc(doc(db, "squads", id, "messages", msgId), {
            [`reactions.${user._id}`]: emoji,
        });
    };

    /* ---------------- EDIT / DELETE ---------------- */
    const saveEdit = async (msgId) => {
        await updateDoc(doc(db, "squads", id, "messages", msgId), {
            text: editText,
            isEdited: true,
        });
        setEditingId(null);
    };

    const deleteMessage = async (msgId) => {
        if (!confirm("Delete message?")) return;
        await deleteDoc(doc(db, "squads", id, "messages", msgId));
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user._id;

                    return (
                        <div
                            key={msg._id}
                            className={`group flex ${isMe ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div className="max-w-[70%]">
                                <div
                                    className={`rounded-2xl px-4 py-3 ${isMe
                                        ? "bg-primary-600 text-white"
                                        : "bg-white dark:bg-gray-800"
                                        }`}
                                >
                                    {editingId === msg._id ? (
                                        <div className="flex gap-2">
                                            <input
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="flex-1 px-2 py-1 rounded"
                                            />
                                            <button onClick={() => saveEdit(msg._id)}>
                                                <FiCheck />
                                            </button>
                                            <button onClick={() => setEditingId(null)}>
                                                <FiX />
                                            </button>
                                        </div>
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}

                                    {/* reactions */}
                                    {msg.reactions && (
                                        <div className="flex gap-1 mt-2">
                                            {Object.values(msg.reactions).map((e, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full"
                                                >
                                                    {e}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* reaction picker */}
                                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition">
                                    {["👍", "❤️", "😂", "🔥"].map((e) => (
                                        <button
                                            key={e}
                                            onClick={() => addReaction(msg._id, e)}
                                            className="hover:scale-125 transition"
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>

                                {/* menu */}
                                {isMe && (
                                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                                        <button
                                            onClick={() => {
                                                setEditingId(msg._id);
                                                setEditText(msg.text);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button onClick={() => deleteMessage(msg._id)}>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <form
                onSubmit={sendMessage}
                className="p-4 border-t flex gap-3 bg-white dark:bg-gray-800"
            >
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                    <FiSmile />
                </button>

                {showEmojiPicker && (
                    <div className="absolute bottom-20 bg-white dark:bg-gray-800 p-3 rounded-xl shadow grid grid-cols-5 gap-4">
                        {["😀", "😂", "😍", "🔥", "👍", "🎉", "😎", "🤝", "🚀"].map(
                            (e) => (
                                <button
                                    key={e}
                                    className="text-2xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {
                                        setNewMessage((p) => p + e);
                                        setShowEmojiPicker(false);
                                    }}
                                >
                                    {e}
                                </button>
                            )
                        )}
                    </div>
                )}

                <button type="button" onClick={() => fileInputRef.current.click()}>
                    <FiPaperclip />
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                />

                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700"
                />

                <button type="submit">
                    <FiSend />
                </button>
            </form>
        </div>
    );
}
