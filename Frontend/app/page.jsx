'use client';

import { useAuth } from '../components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingPage from '../components/landing-page';

export default function Home() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (!user.isProfileComplete) {
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
                }
            }
        }
    }, [isAuthenticated, user, router]);

    return <LandingPage />;
}
