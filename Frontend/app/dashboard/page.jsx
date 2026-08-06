'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth-provider';

export default function DashboardRedirect() {
    const { user, isInitialized } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isInitialized) {
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Admins don't need onboarding
            if (user.role === 'admin') {
                router.push('/dashboard/admin');
                return;
            }

            // For students and mentors, check if profile is complete
            if (!user.isProfileComplete) {
                router.push('/onboarding');
                return;
            }

            // Redirect based on role if profile is complete
            switch (user.role) {
                case 'student':
                    router.push('/dashboard/student');
                    break;
                case 'mentor':
                    router.push('/dashboard/mentor');
                    break;
                default:
                    router.push('/dashboard/student');
            }
        }
    }, [user, isInitialized, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );
}
