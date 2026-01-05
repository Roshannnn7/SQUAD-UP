"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import api from "@/lib/axios";
import { useAuth } from "@/components/auth-provider";
import toast from "react-hot-toast";
import {
    FiUsers,
    FiCpu,
    FiMessageSquare,
    FiGithub,
    FiArrowLeft,
    FiCalendar,
    FiCheckCircle,
    FiTrello,
    FiVideo,
    FiLogOut,
} from "react-icons/fi";
import Link from "next/link";

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        } catch (error) {
            console.error("Fetch project error:", error);
            toast.error("Failed to load project details.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setIsJoining(true);
            await api.post(`/projects/${id}/join`);
            toast.success("Joined squad successfully!");
            fetchProjectDetails();
        } catch (error) {
            console.error("Join error:", error);
            toast.error(error.response?.data?.message || "Failed to join squad.");
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm("Are you sure you want to leave this squad?")) return;

        try {
            setIsLeaving(true);
            await api.post(`/projects/${id}/leave`);
            toast.success("Left squad successfully.");
            router.push("/squads");
        } catch (error) {
            console.error("Leave error:", error);
            toast.error(error.response?.data?.message || "Failed to leave squad.");
        } finally {
            setIsLeaving(false);
        }
    };

    const isMember =
        project?.members?.some(
            (m) => m.user?._id === currentUser?._id
        ) ?? false;

    const isLeader = project?.creator?._id === currentUser?._id;

    const progress = project?.progress ?? 0;

    /* -------------------- LOADING -------------------- */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    /* -------------------- NOT FOUND -------------------- */
    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Squad not found
                </h2>
                <button
                    onClick={() => router.push("/squads")}
                    className="btn-primary"
                >
                    Back to Squads
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <Link
                    href="/squads"
                    className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors"
                >
                    <FiArrowLeft className="mr-2" />
                    Back to Squads
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* ---------------- MAIN ---------------- */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glassmorphism p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-primary-100 text-primary-600">
                                    <FiCpu className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {project.name}
                                    </h1>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <FiCalendar />
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
                                            {project.status || "active"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-10">
                                {project.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
                                        Skills Needed
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.skillsRequired?.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
                                        GitHub Repository
                                    </h3>
                                    {project.githubRepo ? (
                                        <a
                                            href={project.githubRepo}
                                            target="_blank"
                                            className="flex items-center gap-3 p-4 bg-gray-900 text-white rounded-2xl"
                                        >
                                            <FiGithub className="w-6 h-6" />
                                            <span className="truncate">
                                                {project.githubRepo.replace(
                                                    "https://github.com/",
                                                    ""
                                                )}
                                            </span>
                                        </a>
                                    ) : (
                                        <p className="italic text-gray-500">
                                            No repository linked
                                        </p>
                                    )}
                                </div>
                            </div>

                            {isMember && (
                                <div className="grid grid-cols-3 gap-6 pt-10 border-t">
                                    <Link
                                        href={`/squads/${id}/chat`}
                                        className="card-action bg-primary-50 text-primary-600"
                                    >
                                        <FiMessageSquare className="w-8 h-8" />
                                        Chat
                                    </Link>
                                    <Link
                                        href={`/squads/${id}/tasks`}
                                        className="card-action bg-purple-50 text-purple-600"
                                    >
                                        <FiTrello className="w-8 h-8" />
                                        Tasks
                                    </Link>
                                    <Link
                                        href={`/squads/${id}/call`}
                                        className="card-action bg-green-50 text-green-600"
                                    >
                                        <FiVideo className="w-8 h-8" />
                                        Huddle
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* ---------------- SIDEBAR ---------------- */}
                    <div className="space-y-8">
                        <div className="glassmorphism p-8 rounded-3xl">
                            <h3 className="text-xl font-bold mb-6">
                                Squad Members ({project.members?.length || 0})
                            </h3>

                            <div className="space-y-4 mb-6">
                                {project.members?.map((member) => (
                                    <div
                                        key={member.user?._id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    member.user?.profilePhoto ||
                                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.fullName}`
                                                }
                                                className="w-10 h-10 rounded-full"
                                                alt=""
                                            />
                                            <div>
                                                <p className="font-bold text-sm">
                                                    {member.user?.fullName}
                                                </p>
                                                <p className="text-[10px] uppercase">
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>
                                        {member.role === "leader" && (
                                            <FiCheckCircle className="text-primary-500" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!isMember ? (
                                <button
                                    onClick={handleJoin}
                                    disabled={isJoining}
                                    className="btn-primary w-full"
                                >
                                    {isJoining ? "Joining..." : "Join Squad"}
                                </button>
                            ) : (
                                !isLeader && (
                                    <button
                                        onClick={handleLeave}
                                        disabled={isLeaving}
                                        className="w-full py-3 bg-red-50 text-red-600 rounded-xl"
                                    >
                                        <FiLogOut className="inline mr-2" />
                                        {isLeaving ? "Leaving..." : "Leave Squad"}
                                    </button>
                                )
                            )}
                        </div>

                        <div className="glassmorphism p-8 rounded-3xl">
                            <h3 className="font-bold mb-3">
                                Overall Progress ({progress}%)
                            </h3>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-primary-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
