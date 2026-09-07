'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

const CELL_SIZE = 11;
const CELL_GAP = 2;
const WEEKS = 52;
const DAYS_PER_WEEK = 7;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

function getColor(count, isDark = true) {
    if (!count) return isDark ? '#161b22' : '#ebedf0';
    if (count >= 8) return '#39d353';
    if (count >= 5) return '#26a641';
    if (count >= 3) return '#006d32';
    if (count >= 1) return '#0e4429';
    return isDark ? '#161b22' : '#ebedf0';
}

function buildGrid(counts) {
    // Build an array of 52 weeks × 7 days starting from (today - 364 days)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (WEEKS * DAYS_PER_WEEK - 1));

    const grid = [];
    let monthLabels = []; // { month, colIndex }

    let d = new Date(startDate);
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
        const week = [];
        for (let day = 0; day < DAYS_PER_WEEK; day++) {
            const key = d.toISOString().slice(0, 10);
            const count = counts[key] || 0;
            const month = d.getMonth();
            if (day === 0 && month !== lastMonth) {
                monthLabels.push({ month, col: w });
                lastMonth = month;
            }
            week.push({ date: key, count, dateObj: new Date(d) });
            d.setDate(d.getDate() + 1);
        }
        grid.push(week);
    }

    return { grid, monthLabels };
}

export default function ContributionHeatmap({ userId }) {
    const [data, setData] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        api.get(`/profiles/${userId}/activity-heatmap`)
            .then(res => setData(res.data))
            .catch(() => setData({ counts: {}, total: 0, currentStreak: 0 }))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
                <div className="h-4 w-48 bg-white/10 rounded mb-4" />
                <div className="h-24 bg-white/10 rounded-2xl" />
            </div>
        );
    }

    if (!data) return null;

    const { grid, monthLabels } = buildGrid(data.counts || {});
    const totalContributions = data.total || 0;
    const currentStreak = data.currentStreak || 0;

    const svgWidth = WEEKS * (CELL_SIZE + CELL_GAP);
    const svgHeight = DAYS_PER_WEEK * (CELL_SIZE + CELL_GAP) + 20; // +20 for day labels

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-white font-bold text-lg">Contribution Activity</h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                        {totalContributions} contributions in the last year
                    </p>
                </div>
                <div className="flex gap-4 text-center">
                    <div>
                        <p className="text-2xl font-black text-violet-400">{currentStreak}</p>
                        <p className="text-xs text-gray-500">Day Streak</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-emerald-400">{totalContributions}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                </div>
            </div>

            {/* Heatmap SVG */}
            <div className="relative overflow-x-auto">
                <svg
                    width={svgWidth + 24}
                    height={svgHeight + 16}
                    style={{ fontFamily: 'monospace' }}
                >
                    {/* Month labels */}
                    {monthLabels.map(({ month, col }) => (
                        <text
                            key={`${month}-${col}`}
                            x={col * (CELL_SIZE + CELL_GAP) + 24}
                            y={10}
                            fontSize={9}
                            fill="#6b7280"
                        >
                            {MONTHS[month]}
                        </text>
                    ))}

                    {/* Day labels */}
                    {DAYS.map((day, i) => day ? (
                        <text
                            key={i}
                            x={2}
                            y={16 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 1}
                            fontSize={9}
                            fill="#6b7280"
                            textAnchor="middle"
                        >
                            {day[0]}
                        </text>
                    ) : null)}

                    {/* Cells */}
                    {grid.map((week, w) =>
                        week.map((cell, d) => (
                            <rect
                                key={cell.date}
                                x={24 + w * (CELL_SIZE + CELL_GAP)}
                                y={16 + d * (CELL_SIZE + CELL_GAP)}
                                width={CELL_SIZE}
                                height={CELL_SIZE}
                                rx={2}
                                fill={getColor(cell.count)}
                                className="cursor-pointer transition-opacity hover:opacity-80"
                                onMouseEnter={(e) => setTooltip({
                                    x: e.clientX,
                                    y: e.clientY,
                                    date: cell.date,
                                    count: cell.count,
                                })}
                                onMouseLeave={() => setTooltip(null)}
                            />
                        ))
                    )}
                </svg>

                {/* Tooltip */}
                {tooltip && (
                    <div
                        className="fixed z-50 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-xl border border-white/10"
                        style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
                    >
                        <strong>{tooltip.count || 'No'}</strong> contribution{tooltip.count !== 1 ? 's' : ''} on {tooltip.date}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-gray-500 text-xs">Less</span>
                {[0, 1, 3, 5, 8].map(v => (
                    <div
                        key={v}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: getColor(v) }}
                    />
                ))}
                <span className="text-gray-500 text-xs">More</span>
            </div>
        </div>
    );
}
