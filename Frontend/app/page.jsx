'use client';

import { useAuth } from '../components/auth-provider';
import LandingPage from '../components/landing-page';

/**
 * Home component - Root landing page
 * This page is accessible to everyone. 
 * Authenticated users will see a "Go to Dashboard" button which redirects them appropriately.
 */
export default function Home() {
    const { isAuthenticated, user } = useAuth();

    return <LandingPage />;
}
