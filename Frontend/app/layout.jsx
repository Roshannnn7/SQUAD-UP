import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../components/auth-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'SquadUp - Collaborative Learning Platform',
    description: 'Connect, collaborate, and learn with mentors and peers',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700',
                                style: {
                                    borderRadius: '16px',
                                    padding: '16px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(12px)',
                                    color: '#1f2937',
                                    border: '1px solid rgba(229, 231, 235, 0.5)',
                                },
                            }}
                        />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
