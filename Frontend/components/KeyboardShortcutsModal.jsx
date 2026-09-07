'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCommand } from 'react-icons/fi';

export const SHORTCUTS = [
    { keys: ['Ctrl', 'K'], mac: ['⌘', 'K'], description: 'Open global search', category: 'Navigation' },
    { keys: ['G', 'F'], description: 'Go to Feed', category: 'Navigation' },
    { keys: ['G', 'S'], description: 'Go to Squads', category: 'Navigation' },
    { keys: ['G', 'M'], description: 'Go to Messages', category: 'Navigation' },
    { keys: ['G', 'N'], description: 'Go to Notifications', category: 'Navigation' },
    { keys: ['G', 'P'], description: 'Go to Profile', category: 'Navigation' },
    { keys: ['G', 'L'], description: 'Go to Leaderboard', category: 'Navigation' },
    { keys: ['G', 'E'], description: 'Go to Explore', category: 'Navigation' },
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Help' },
    { keys: ['Esc'], description: 'Close modal / Go back', category: 'General' },
];

function Kbd({ children }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-white/10 border border-white/20 rounded-lg text-xs text-gray-300 font-mono shadow-sm">
            {children}
        </kbd>
    );
}

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
    const categories = [...new Set(SHORTCUTS.map(s => s.category))];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-violet-600/20 border border-violet-500/30 rounded-xl flex items-center justify-center">
                                    <FiCommand className="text-violet-400 w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Keyboard Shortcuts</h2>
                                    <p className="text-gray-500 text-xs">Power user commands</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <FiX className="text-gray-400 w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                            {categories.map(cat => (
                                <div key={cat}>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">{cat}</p>
                                    <div className="space-y-2">
                                        {SHORTCUTS.filter(s => s.category === cat).map((shortcut, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-all"
                                            >
                                                <span className="text-gray-300 text-sm">{shortcut.description}</span>
                                                <div className="flex items-center gap-1">
                                                    {shortcut.keys.map((key, ki) => (
                                                        <span key={ki} className="flex items-center gap-1">
                                                            <Kbd>{key}</Kbd>
                                                            {ki < shortcut.keys.length - 1 && (
                                                                <span className="text-gray-600 text-xs">+</span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-white/5 text-center">
                            <p className="text-gray-600 text-xs">Press <Kbd>?</Kbd> anywhere to toggle this panel</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
