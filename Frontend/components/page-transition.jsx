'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function PageTransition({ children }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                className="w-full min-h-screen relative"
            >
                {/* Premium Top Progress Bar */}
                <motion.div
                    className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-secondary-600 z-[9999] origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
