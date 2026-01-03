'use client';

import Navbar from '@/components/Navbar';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About SquadUp</h1>
                <p className="text-gray-600 dark:text-gray-400">SquadUp is a platform for students to collaborate, learn, and build projects together.</p>
            </main>
        </div>
    );
}
