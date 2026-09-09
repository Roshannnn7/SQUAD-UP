'use client';

import React from 'react';

/**
 * SquadUp Logo Component — Updated brand identity
 *
 * Mark: Bold "S" letterform in brand blue (#4F52E5 → #4348D4),
 *       matching the official SquadUp logo image.
 * Wordmark: "Squad" in dark charcoal + "Up" in brand blue (#4F52E5)
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - showWordmark: boolean (default: true)
 * - className: string (optional extra CSS classes)
 * - animated: boolean (default: false) — subtle scale on hover
 */
export default function SquadUpLogo({
    size = 'md',
    showWordmark = true,
    className = '',
    animated = false,
}) {
    const sizeMap = {
        sm: { iconW: 16, iconH: 20, text: 'text-lg',  gap: 'gap-1.5' },
        md: { iconW: 22, iconH: 28, text: 'text-2xl', gap: 'gap-2'   },
        lg: { iconW: 30, iconH: 37, text: 'text-3xl', gap: 'gap-2.5' },
        xl: { iconW: 40, iconH: 50, text: 'text-4xl', gap: 'gap-3'   },
    };

    const config = sizeMap[size] || sizeMap.md;

    return (
        <div className={`inline-flex items-center ${config.gap} select-none ${className}`}>

            {/* ── S Mark ── */}
            <div
                className={`shrink-0 transition-transform duration-300 ${animated ? 'hover:scale-105' : ''}`}
                style={{ width: config.iconW, height: config.iconH }}
            >
                {/*
                    The S is a single stroked path with thick round caps/joins.
                    Path traces the classic S flow:
                      - Starts upper-right
                      - Curves left across the top half
                      - Crosses diagonally through centre
                      - Curves right across the bottom half
                      - Ends lower-left
                    This faithfully reproduces the chunky, modern S in the logo image.
                */}
                <svg
                    viewBox="0 0 44 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    <defs>
                        <linearGradient id="sqS" x1="8" y1="2" x2="36" y2="54" gradientUnits="userSpaceOnUse">
                            <stop offset="0%"   stopColor="#8185F6" />
                            <stop offset="100%" stopColor="#4348D4" />
                        </linearGradient>
                    </defs>
                    <path
                        d="
                          M 36 10
                          C 36 5, 30 2, 22 2
                          C 13 2, 6 8, 6 16
                          C 6 23, 12 27, 20 30
                          C 28 33, 38 37, 38 46
                          C 38 51, 32 54, 24 54
                          C 15 54, 8 50, 8 44
                        "
                        stroke="url(#sqS)"
                        strokeWidth="13"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>
            </div>

            {/* ── Wordmark ── */}
            {showWordmark && (
                <div className={`flex items-baseline leading-none font-black tracking-tight ${config.text}`}>
                    <span className="text-slate-900 dark:text-white transition-colors duration-200">
                        Squad
                    </span>
                    <span style={{ color: '#4F52E5' }}>
                        Up
                    </span>
                </div>
            )}
        </div>
    );
}
