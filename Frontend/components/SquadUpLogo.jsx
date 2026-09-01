'use client';

import React from 'react';

/**
 * SquadUp Logo Component
 * 
 * Original brand mark representing:
 * - Collaboration (interconnected nodes)
 * - Building & Technology (clean geometric paths)
 * - Students & Mentors converging on projects (tri-node network)
 * - Distinct modern "S" monogram
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - showWordmark: boolean (default: true)
 * - className: string (optional extra CSS classes)
 * - animated: boolean (default: false)
 */
export default function SquadUpLogo({
    size = 'md',
    showWordmark = true,
    className = '',
    animated = false,
}) {
    // Dimension configurations
    const sizeMap = {
        sm: { icon: 26, text: 'text-lg', dot: 4 },
        md: { icon: 36, text: 'text-2xl', dot: 5 },
        lg: { icon: 48, text: 'text-3xl', dot: 6 },
        xl: { icon: 64, text: 'text-4xl', dot: 8 },
    };

    const config = sizeMap[size] || sizeMap.md;
    const iconPx = typeof size === 'number' ? size : config.icon;

    return (
        <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
            {/* SVG Logo Mark */}
            <div
                className={`relative flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    animated ? 'hover:scale-105' : ''
                }`}
                style={{ width: iconPx, height: iconPx }}
            >
                <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
                >
                    <defs>
                        {/* Primary brand gradient: Electric Indigo -> Violet -> Bright Cyan */}
                        <linearGradient id="sqPrimaryGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#4F46E5" />
                            <stop offset="50%" stopColor="#7C3AED" />
                            <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>

                        {/* Accent gradient for connection ribbon */}
                        <linearGradient id="sqAccentGrad" x1="60" y1="4" x2="4" y2="60" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#06B6D4" />
                            <stop offset="60%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>

                        {/* Glow filter */}
                        <filter id="sqGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7C3AED" floodOpacity="0.4" />
                        </filter>
                    </defs>

                    {/* Outer smooth rounded hex/squircle shield container background */}
                    <rect
                        x="3"
                        y="3"
                        width="58"
                        height="58"
                        rx="16"
                        className="fill-slate-900 dark:fill-slate-950"
                    />

                    {/* Subtle inner border */}
                    <rect
                        x="3.5"
                        y="3.5"
                        width="57"
                        height="57"
                        rx="15.5"
                        stroke="url(#sqPrimaryGrad)"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                    />

                    {/* Interconnected "S" Collaboration Flow Paths */}
                    {/* Top Loop: Student -> Central Hub */}
                    <path
                        d="M 44 20 C 44 14 36 12 28 14 C 20 16 18 24 24 28 L 40 36 C 46 40 44 48 36 50 C 28 52 20 50 20 44"
                        stroke="url(#sqPrimaryGrad)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Dynamic Cross-Network Bridge (Represents Mentorship Connection) */}
                    <path
                        d="M 22 23 L 42 41"
                        stroke="url(#sqAccentGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="3 3"
                        opacity="0.75"
                    />

                    {/* Node 1: Student (Top Right) */}
                    <circle cx="44" cy="20" r="4.5" fill="#38BDF8" filter="url(#sqGlow)" />
                    <circle cx="44" cy="20" r="2" fill="#FFFFFF" />

                    {/* Node 2: Central Squad Project (Hub) */}
                    <circle cx="32" cy="32" r="5" fill="#8B5CF6" filter="url(#sqGlow)" />
                    <circle cx="32" cy="32" r="2.5" fill="#FFFFFF" />

                    {/* Node 3: Mentor (Bottom Left) */}
                    <circle cx="20" cy="44" r="4.5" fill="#4F46E5" filter="url(#sqGlow)" />
                    <circle cx="20" cy="44" r="2" fill="#FFFFFF" />
                </svg>
            </div>

            {/* Wordmark */}
            {showWordmark && (
                <div className={`flex items-baseline tracking-tight font-black font-sans leading-none ${config.text}`}>
                    <span className="text-slate-900 dark:text-white transition-colors duration-200">
                        Squad
                    </span>
                    <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent ml-0.5">
                        Up
                    </span>
                </div>
            )}
        </div>
    );
}
