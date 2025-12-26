'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { FiSearch, FiPlus, FiUsers, FiCpu, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

export default function SquadsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [skills, setSkills] = useState('');

    useEffect(() => {
        fetchProjects();
    }, [skills]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/projects', {
                params: {
                    search,
                    skills,
                }
            });
            setProjects(res.data.projects || []);
        } catch (error) {
            console.error('Fetch projects error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProjects();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Explore Squads</h1>
                        <p className="text-gray-600 dark:text-gray-400">Join existing project teams or start your own squad to build something amazing.</p>
                    </div>
                    <Link href="/squads/create" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                        <FiPlus />
                        Create New Squad
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by project name or description..."
                            className="input-field pl-12 h-14"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="flex gap-4">
                        <select
                            className="input-field h-14 min-w-[180px]"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        >
                            <option value="">All Skills</option>
                            <option value="React">React</option>
                            <option value="Node.js">Node.js</option>
                            <option value="Python">Python</option>
                            <option value="UI/UX">UI/UX</option>
                            <option value="Machine Learning">ML/AI</option>
                            <option value="Blockchain">Blockchain</option>
                        </select>
                    </div>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[350px] skeleton rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                className="glassmorphism p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600`}>
                                        <FiCpu className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
                                        <FiUsers className="w-4 h-4" />
                                        <span>{project.members?.length} / {project.maxMembers}</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.skillsRequired?.slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="tag text-[10px] py-1">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                {project.creator?.fullName?.charAt(0)}
                                            </div>
                                            <span className="text-gray-500">by <span className="text-gray-900 dark:text-white font-medium">{project.creator?.fullName?.split(' ')[0]}</span></span>
                                        </div>
                                        <div className="flex items-center space-x-1 text-primary-600">
                                            <FiTrendingUp className="w-3 h-3" />
                                            <span className="font-bold">{project.progress}%</span>
                                        </div>
                                    </div>

                                    <Link href={`/squads/${project._id}`} className="w-full btn-secondary py-2 text-sm flex items-center justify-center gap-2">
                                        View Details
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && projects.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiUsers className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No squads found</h3>
                        <p className="text-gray-600 dark:text-gray-400">Be the first to create a squad for this domain!</p>
                        <Link href="/squads/create" className="btn-primary mt-6 inline-block">
                            Start a Squad
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
