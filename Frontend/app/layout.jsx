"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../components/auth-provider";
import PageTransition from "../components/page-transition";
import GlobalSearch from "../components/GlobalSearch";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

function KeyboardShortcutProvider({ children }) {
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const [gPressed, setGPressed] = useState(false);

    const handleKeyDown = useCallback((e) => {
        const tag = document.activeElement?.tagName?.toLowerCase();
        const isInput = ['input', 'textarea', 'select'].includes(tag) || document.activeElement?.isContentEditable;

        // Ctrl+K or Cmd+K — global search (works even in inputs)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setSearchOpen(prev => !prev);
            return;
        }

        if (isInput) return; // Skip the rest when typing in a field

        // ? — keyboard shortcuts modal
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault();
            setShortcutsOpen(prev => !prev);
            return;
        }

        // Escape — close modals
        if (e.key === 'Escape') {
            setSearchOpen(false);
            setShortcutsOpen(false);
            return;
        }

        // G + letter navigation shortcuts
        if (e.key === 'g' || e.key === 'G') {
            setGPressed(true);
            setTimeout(() => setGPressed(false), 1500);
            return;
        }

        if (gPressed) {
            const navMap = {
                'f': '/feed',
                'F': '/feed',
                's': '/squads',
                'S': '/squads',
                'm': '/messages',
                'M': '/messages',
                'n': '/notifications',
                'N': '/notifications',
                'p': '/profile',
                'P': '/profile',
                'l': '/leaderboard',
                'L': '/leaderboard',
                'e': '/explore',
                'E': '/explore',
            };
            if (navMap[e.key]) {
                e.preventDefault();
                setGPressed(false);
                router.push(navMap[e.key]);
            }
        }
    }, [router, gPressed]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            {children}
            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        </>
    );
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="alternate icon" href="/favicon.ico" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#7c3aed" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <title>SquadUp — Student Collaboration &amp; Mentorship Platform</title>
                <meta name="description" content="Find collaborators, form project squads, connect with verified industry mentors, and ship real projects together." />
            </head>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                >
                    <AuthProvider>
                        <KeyboardShortcutProvider>
                            <PageTransition>
                                {children}
                            </PageTransition>
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    className:
                                        "dark:bg-gray-800 dark:text-white dark:border-gray-700",
                                    style: {
                                        borderRadius: "16px",
                                        padding: "16px",
                                        boxShadow:
                                            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                                        background: "rgba(255, 255, 255, 0.8)",
                                        backdropFilter: "blur(12px)",
                                        color: "#1f2937",
                                        border: "1px solid rgba(229, 231, 235, 0.5)",
                                    },
                                }}
                            />
                        </KeyboardShortcutProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
