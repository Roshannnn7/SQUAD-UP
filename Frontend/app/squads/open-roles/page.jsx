'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import Link from 'next/link';
import { FiBriefcase, FiUsers, FiSearch, FiArrowRight, FiGrid, FiZap } from 'react-icons/fi';

const POPULAR_SKILLS = ['React', 'Node.js', 'Python', 'UI/UX', 'Flutter', 'MongoDB', 'Machine Learning', 'Blockchain'];

export default function OpenRolesPage() {
    const [squads, setSquads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [skillFilter, setSkillFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOpenRoles();
    }, [skillFilter]);

    const fetchOpenRoles = async () => {
        try {
            setLoading(true);
            const params = {};
            if (skillFilter) params.skill = skillFilter;
            const res = await api.get('/projects/open-roles', { params });
            setSquads(res.data);
        } catch (error) {
            console.error('Open roles error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSquads = search
        ? squads.filter(s =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.openRoles?.some(r => r.title?.toLowerCase().includes(search.toLowerCase()))
        )
        : squads;

    const totalRoles = squads.reduce((sum, s) => sum + (s.openRoles?.filter(r => r.isOpen)?.length || 0), 0);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center">
                            <FiBriefcase className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Squad Job Board</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Open Roles</h1>
                    <p className="text-gray-400">{totalRoles} open positions across {squads.length} squads looking for collaborators</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search roles or squads..."
                            className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Popular skill filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSkillFilter('')}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${!skillFilter ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        All Skills
                    </button>
                    {POPULAR_SKILLS.map(skill => (
                        <button
                            key={skill}
                            onClick={() => setSkillFilter(prev => prev === skill ? '' : skill)}
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${skillFilter === skill ? 'bg-cyan-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {skill}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-40 bg-white/5 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : filteredSquads.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                        <FiBriefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-xl font-bold text-white mb-2">No open roles found</p>
                        <p className="text-gray-400 mb-6">Try a different skill filter, or be the first to post a role in your squad.</p>
                        <Link href="/squads" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
                            Browse Squads
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSquads.map((squad, si) => (
                            <motion.div
                                key={squad._id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: si * 0.05 }}
                                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
                            >
                                {/* Squad header */}
                                <div className="flex items-center gap-4 p-5 border-b border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-lg font-black text-white flex-shrink-0">
                                        {squad.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold">{squad.name}</h3>
                                        <p className="text-gray-500 text-xs flex items-center gap-1">
                                            <FiUsers className="w-3 h-3" /> {squad.members?.length || 0} members · {squad.category}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/squads/${squad._id}`}
                                        className="flex items-center gap-1.5 text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors"
                                    >
                                        View Squad <FiArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                {/* Open roles */}
                                <div className="divide-y divide-white/5">
                                    {squad.openRoles?.filter(r => r.isOpen).map(role => (
                                        <div key={role._id} className="p-5 flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                                                    <FiBriefcase className="w-4 h-4 text-cyan-400" />
                                                    {role.title}
                                                </h4>
                                                {role.description && (
                                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{role.description}</p>
                                                )}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(role.skills || []).map(skill => (
                                                        <span key={skill} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/squads/${squad._id}`}
                                                className="flex-shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/20"
                                            >
                                                Apply
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
