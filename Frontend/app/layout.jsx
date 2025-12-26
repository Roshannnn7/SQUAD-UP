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
                                style: {
                                    background: 'white',
                                    color: 'black',
                                    border: '1px solid #e5e7eb',
                                },
                            }}
                        />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
