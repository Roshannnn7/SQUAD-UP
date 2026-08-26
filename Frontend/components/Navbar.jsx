'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import Notifications from './Notifications';
import {
    FiHome,
    FiUsers,
    FiBookOpen,
    FiCalendar,
    FiTrendingUp,
    FiUser,
    FiLogOut,
    FiSun,
    FiMoon,
    FiMenu,
    FiX,
    FiZap,
    FiCompass,
    FiChevronDown,
    FiAward,
    FiSettings
} from 'react-icons/fi';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        router.push('/auth/login');
    };

    const getDashboardHref = () => {
        if (!user || !user.role) return '/auth/login';
        return `/dashboard/${user.role}`;
    };

    const navLinks = [
        { name: 'Dashboard', href: getDashboardHref(), icon: <FiHome className="w-4 h-4" /> },
        { name: 'Squads', href: '/squads', icon: <FiUsers className="w-4 h-4" /> },
        { name: 'Mentors', href: '/mentors', icon: <FiBookOpen className="w-4 h-4" /> },
        { name: 'My Sessions', href: '/bookings', icon: <FiCalendar className="w-4 h-4" /> },
        { name: 'Collaborators', href: '/directory', icon: <FiCompass className="w-4 h-4" /> },
        { name: 'Leaderboard', href: '/leaderboard', icon: <FiTrendingUp className="w-4 h-4" /> },
    ];

    const isLinkActive = (href) => {
        if (!pathname) return false;
        if (href.startsWith('/dashboard')) {
            return pathname.startsWith('/dashboard');
        }
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/80 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="group flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-violet-600 to-pink-500 p-[1.5px] shadow-glow-sm transition-transform duration-300 group-hover:scale-105">
                                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                                    <FiZap className="w-5 h-5 text-violet-600 dark:text-violet-400 group-hover:rotate-12 transition-transform duration-300" />
                                </div>
                            </div>
                            <span className="text-xl sm:text-2xl font-black tracking-tight gradient-text">
                                SquadUp
                            </span>
                        </Link>
                        {user?.role && (
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                {user.role}
                            </span>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
                        {navLinks.map((link) => {
                            const active = isLinkActive(link.href);
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                                        active
                                            ? 'text-white bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 shadow-md shadow-violet-500/25'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800/70'
                                    }`}
                                >
                                    <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                                        {link.icon}
                                    </span>
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Controls */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Theme Switcher */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 hover:text-violet-600 dark:hover:text-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                aria-label="Toggle color theme"
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                <motion.div
                                    key={theme}
                                    initial={{ scale: 0.7, rotate: -90, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {theme === 'dark' ? <FiSun className="w-4.5 h-4.5" /> : <FiMoon className="w-4.5 h-4.5" />}
                                </motion.div>
                            </button>
                        )}

                        {/* Notifications */}
                        <Notifications />

                        {/* Profile Dropdown */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 group"
                                    aria-expanded={isProfileOpen}
                                >
                                    <div className="relative w-9 h-9 rounded-xl p-[2px] bg-gradient-to-tr from-blue-600 via-violet-600 to-pink-500 transition-transform duration-300 group-hover:scale-105">
                                        <div className="w-full h-full rounded-[10px] bg-slate-900 overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                                            {user?.profilePhoto ? (
                                                <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user?.fullName?.charAt(0) || 'U'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left hidden xl:block">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                            {user?.fullName?.split(' ')[0] || 'User'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium leading-none">
                                            {(user?.points || 0).toLocaleString()} XP
                                        </p>
                                    </div>
                                    <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsProfileOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
                                            >
                                                {/* User Info Header */}
                                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {user?.fullName || 'User'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {user?.email}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-bold">
                                                            <FiZap className="w-3 h-3" />
                                                            <span>{(user?.points || 0).toLocaleString()} XP</span>
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-slate-400">
                                                            Lv.{user?.level || 1}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-amber-500 ml-auto">
                                                            🔥 {user?.streak?.current || 0}d
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="py-1">
                                                    <Link
                                                        href={`/portfolio/${user?._id || user?.id}`}
                                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <FiUser className="w-4 h-4 text-slate-400" />
                                                        <span>My Portfolio</span>
                                                    </Link>
                                                    <Link
                                                        href="/profile"
                                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <FiSettings className="w-4 h-4 text-slate-400" />
                                                        <span>Profile Settings</span>
                                                    </Link>
                                                    <Link
                                                        href="/leaderboard"
                                                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <FiAward className="w-4 h-4 text-slate-400" />
                                                        <span>Rank & Leaderboard</span>
                                                    </Link>
                                                </div>

                                                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                                    >
                                                        <FiLogOut className="w-4 h-4" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu & Action Buttons */}
                    <div className="flex items-center gap-2 md:hidden">
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                            </button>
                        )}
                        <Notifications />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 pt-3 pb-6 space-y-1.5 max-h-[80vh] overflow-y-auto">
                            {user && (
                                <div className="p-3 mb-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-violet-600 to-pink-500 p-[2px]">
                                            <div className="w-full h-full rounded-[9px] bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                                                {user?.fullName?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {user?.fullName}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {(user?.points || 0).toLocaleString()} XP · Lv.{user?.level || 1}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-white dark:hover:bg-slate-800"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <FiSettings className="w-5 h-5" />
                                    </Link>
                                </div>
                            )}

                            {navLinks.map((link) => {
                                const active = isLinkActive(link.href);
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                            active
                                                ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 text-white shadow-md'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-lg">{link.icon}</span>
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })}

                            {user && (
                                <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                    >
                                        <FiLogOut className="w-5 h-5" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
