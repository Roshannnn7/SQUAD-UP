'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { FiSearch, FiUsers, FiGrid, FiFileText, FiX, FiArrowRight, FiClock } from 'react-icons/fi';

const RECENT_KEY = 'squadup_recent_searches';
const MAX_RECENT = 5;

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function GlobalSearch({ isOpen, onClose }) {
    const router = useRouter();
    const inputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ squads: [], users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState([]);

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setResults({ squads: [], users: [], posts: [] });
            setSelectedIndex(0);
            // Load recent searches
            try {
                const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
                setRecentSearches(stored);
            } catch { }
        }
    }, [isOpen]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults({ squads: [], users: [], posts: [] });
            return;
        }
        performSearch(debouncedQuery);
    }, [debouncedQuery]);

    const performSearch = async (q) => {
        setLoading(true);
        try {
            const [squadsRes, usersRes] = await Promise.allSettled([
                api.get(`/projects?search=${encodeURIComponent(q)}&limit=4`),
                api.get(`/profiles/search?query=${encodeURIComponent(q)}&limit=4`),
            ]);
            setResults({
                squads: squadsRes.status === 'fulfilled' ? (squadsRes.value.data?.projects || []) : [],
                users: usersRes.status === 'fulfilled' ? (usersRes.value.data?.data || []) : [],
                posts: [],
            });
        } catch { }
        setLoading(false);
    };

    const allItems = [
        ...results.squads.map(s => ({ type: 'squad', item: s, href: `/squads/${s._id}` })),
        ...results.users.map(u => ({ type: 'user', item: u, href: `/profile?id=${u._id}` })),
    ];

    const handleSelect = useCallback((href, label) => {
        // Save to recent searches
        try {
            const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
            const updated = [label, ...prev.filter(s => s !== label)].slice(0, MAX_RECENT);
            localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
            setRecentSearches(updated);
        } catch { }
        onClose();
        router.push(href);
    }, [router, onClose]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, allItems.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && allItems[selectedIndex]) {
            const { href, item } = allItems[selectedIndex];
            handleSelect(href, item.name || item.fullName || item.title);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-start justify-center pt-[8vh] px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                        <FiSearch className="text-gray-400 w-5 h-5 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search squads, people, posts..."
                            className="flex-1 bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none"
                            id="global-search-input"
                        />
                        {loading && (
                            <div className="w-4 h-4 border-2 border-violet-500/50 border-t-violet-500 rounded-full animate-spin" />
                        )}
                        <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg text-xs text-gray-400 border border-white/10">
                            ESC
                        </kbd>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-all">
                            <FiX className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {!query && recentSearches.length > 0 && (
                            <div className="p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                    <FiClock className="w-3 h-3" /> Recent Searches
                                </p>
                                <div className="space-y-1">
                                    {recentSearches.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setQuery(s)}
                                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-white/5 rounded-xl text-sm transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {query && allItems.length === 0 && !loading && (
                            <div className="py-12 text-center text-gray-500">
                                <FiSearch className="w-8 h-8 mx-auto mb-3 opacity-40" />
                                <p>No results for <span className="text-white">&ldquo;{query}&rdquo;</span></p>
                            </div>
                        )}

                        {results.squads.length > 0 && (
                            <div className="p-4 border-b border-white/5">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                    <FiGrid className="w-3 h-3" /> Squads
                                </p>
                                <div className="space-y-1">
                                    {results.squads.map((squad, i) => {
                                        const idx = i;
                                        const isSelected = idx === selectedIndex;
                                        return (
                                            <button
                                                key={squad._id}
                                                onClick={() => handleSelect(`/squads/${squad._id}`, squad.name)}
                                                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-violet-600/20 border border-violet-500/30' : 'hover:bg-white/5'}`}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                    {squad.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{squad.name}</p>
                                                    <p className="text-gray-500 text-xs truncate">{squad.description}</p>
                                                </div>
                                                <span className="text-xs text-gray-600 flex-shrink-0">{squad.members?.length || 0} members</span>
                                                <FiArrowRight className="text-gray-600 w-4 h-4 flex-shrink-0" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {results.users.length > 0 && (
                            <div className="p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                    <FiUsers className="w-3 h-3" /> People
                                </p>
                                <div className="space-y-1">
                                    {results.users.map((user, i) => {
                                        const idx = results.squads.length + i;
                                        const isSelected = idx === selectedIndex;
                                        return (
                                            <button
                                                key={user._id}
                                                onClick={() => handleSelect(`/profile?id=${user._id}`, user.fullName)}
                                                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-violet-600/20 border border-violet-500/30' : 'hover:bg-white/5'}`}
                                            >
                                                <img
                                                    src={user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                                                    alt={user.fullName}
                                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{user.fullName}</p>
                                                    <p className="text-gray-500 text-xs truncate">{user.headline || user.role}</p>
                                                </div>
                                                <FiArrowRight className="text-gray-600 w-4 h-4 flex-shrink-0" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex gap-3">
                            <span>↑↓ Navigate</span>
                            <span>↵ Select</span>
                            <span>ESC Close</span>
                        </div>
                        <span>Ctrl+K to open</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
