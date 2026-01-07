'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

type NavigationMode = 'default' | 'home' | 'features' | 'services' | 'about' | 'enter';

interface NavBarProps {
    onNavigate: (mode: NavigationMode) => void;
    currentMode: NavigationMode;
    shouldHide?: boolean;
    onLoginClick: () => void;
}

export default function NavBar({ onNavigate, currentMode, shouldHide = false, onLoginClick }: NavBarProps) {
    const navItems: { label: string; mode: NavigationMode }[] = [
        { label: 'Home', mode: 'home' },
        { label: 'Features', mode: 'features' },
        { label: 'Services', mode: 'services' },
        { label: 'About Us', mode: 'about' },
    ];

    const navRef = useRef(null);

    // Track scroll progress
    const { scrollYProgress } = useScroll();

    // Fade in after 10% scroll or show initially with fade-in
    const scrollOpacity = useTransform(scrollYProgress, [0, 0.1], [0.7, 1]);

    return (
        <motion.nav
            ref={navRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: shouldHide ? 0 : 1 }}
            transition={{ duration: shouldHide ? 1.5 : 1.2, delay: shouldHide ? 0 : 0.3 }}
            className="fixed top-0 left-0 w-full z-50 pointer-events-none"
        >
            <div className="grid grid-cols-3 items-center px-6 md:px-12 py-6">
                {/* Logo (Left) */}
                <motion.div
                    className="pointer-events-auto justify-self-start"
                    style={{ opacity: scrollOpacity }}
                >
                    <button
                        onClick={() => onNavigate('home')}
                        className="text-white/70 text-sm md:text-base font-light tracking-[0.3em] hover:text-white transition-colors duration-300"
                    >
                        AETHER
                    </button>
                </motion.div>

                {/* Navigation Links (Center) */}
                <motion.div
                    className="pointer-events-auto justify-self-center hidden md:block"
                    style={{ opacity: scrollOpacity }}
                >
                    <div
                        className="flex p-1 gap-1 rounded-full"
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        {navItems.map((item) => (
                            <div
                                key={item.mode}
                                className="rounded-full overflow-hidden transition-all duration-300"
                                style={{
                                    background: currentMode === item.mode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                    border: currentMode === item.mode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                                }}
                            >
                                <button
                                    onClick={() => onNavigate(item.mode)}
                                    className={`px-5 py-2 text-xs font-light tracking-wider transition-colors duration-300 ${currentMode === item.mode ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Start (Right) */}
                <motion.div
                    className="pointer-events-auto justify-self-end"
                    style={{ opacity: scrollOpacity }}
                >
                    <button
                        onClick={onLoginClick}
                        className="text-xs md:text-sm font-light tracking-wider text-white/70 hover:text-white transition-all duration-300 border border-white/10 px-6 py-2 rounded-full hover:bg-white/5 active:scale-95 bg-white/[0.02]"
                    >
                        Start
                    </button>
                </motion.div>
            </div>
        </motion.nav>
    );
}
