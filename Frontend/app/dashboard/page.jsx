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
            } else if (!user.isProfileComplete) {
                router.push('/onboarding');
            } else {
                switch (user.role) {
                    case 'student':
                        router.push('/dashboard/student');
                        break;
                    case 'mentor':
                        router.push('/dashboard/mentor');
                        break;
                    case 'admin':
                        router.push('/dashboard/admin');
                        break;
                    default:
                        router.push('/dashboard/student');
                }
            }
        }
    }, [user, isInitialized, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );
}
