'use client';

import NavBar from '@/components/NavBar';
import LoginModal from '@/components/LoginModal';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

type NavigationMode = 'default' | 'home' | 'features' | 'services' | 'about' | 'enter';


function NavDot({ index, scrollYProgress }: { index: number; scrollYProgress: any }) {
  const start = index * 0.2;
  const end = (index + 1) * 0.2;

  const opacity = useTransform(
    scrollYProgress,
    [start - 0.15, start, end - 0.05, end],
    [0.2, 1, 1, 0.2]
  );

  const scale = useTransform(
    scrollYProgress,
    [start - 0.15, start, end - 0.05, end],
    [0.8, 1.2, 1.2, 0.8]
  );

  const sectionIds = ['splash', 'home', 'features', 'services', 'about'];

  return (
    <motion.button
      onClick={() => {
        window.scrollTo({
          top: index * window.innerHeight,
          behavior: 'smooth'
        });
      }}
      style={{ opacity, scale }}
      className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-auto cursor-pointer"
      title={sectionIds[index]}
      whileHover={{ scale: 1.5, opacity: 1 }}
    />
  );
}

export default function Home() {
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('default');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  // Sync scroll position with NavBar active state
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Map progress (0-1) to 5 sections (Splash, Home, Features, Services, About)
    if (latest < 0.15) {
      if (navigationMode !== 'default') setNavigationMode('default');
    } else if (latest < 0.35) {
      if (navigationMode !== 'home') setNavigationMode('home');
    } else if (latest < 0.55) {
      if (navigationMode !== 'features') setNavigationMode('features');
    } else if (latest < 0.75) {
      if (navigationMode !== 'services') setNavigationMode('services');
    } else {
      if (navigationMode !== 'about') setNavigationMode('about');
    }
  });

  const handleNavigationMode = (mode: NavigationMode) => {
    setNavigationMode(mode);
    if (mode === 'enter') return;

    // Standard smooth scroll to sections
    const sectionMap: Record<string, number> = {
      home: 1,
      features: 2,
      services: 3,
      about: 4
    };

    const index = sectionMap[mode === 'default' ? 'home' : mode];
    if (typeof index === 'number') {
      window.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-x-hidden">
      {/* STATIC BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 bg-[#050505] pointer-events-none">
        {/* Subtle radial glow for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% -20%, #151515 0%, #050505 70%)'
          }}
        />
        {/* Optional: Subtle Grain Overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      <NavBar
        onNavigate={handleNavigationMode}
        currentMode={navigationMode}
        shouldHide={navigationMode === 'enter'}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      {/* SECTION INDICATOR (RIGHT SIDE) */}
      <div className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-center">
        {[0, 1, 2, 3, 4].map((index) => (
          <NavDot
            key={index}
            index={index}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="relative z-10">

        {/* Section 0: Splash (The Flag) */}
        <section id="splash" className="h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="relative px-8 py-16 md:px-24 md:py-32 rounded-[2rem] text-center max-w-5xl flex flex-col items-center justify-center gap-4"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 0 80px 0 rgba(255, 255, 255, 0.03), inset 0 0 30px 0 rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="text-7xl md:text-[10rem] font-extralight tracking-[0.5em] text-white leading-none mr-[-0.5em]"
            >
              AETHER
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1.5, delay: 1.2 }}
              className="text-xl md:text-3xl font-bold tracking-tight text-white/90"
            >
              Above the Ordinary.
            </motion.p>
          </motion.div>
        </section>

        {/* Section 1: Home (Philosophy) */}
        <section id="home" className="h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative px-8 py-12 md:px-16 md:py-20 rounded-[2rem] text-center max-w-4xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <motion.h1
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.95 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="text-2xl md:text-3xl font-light tracking-tight text-white/90 mb-4"
            >
              A System, Not a Platform.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.7 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              className="text-lg md:text-xl font-light text-white/90 tracking-tight space-y-2 mb-12"
            >
              <p>Built for those who think in systems, not trends.</p>
              <p>Designed for movement before permission.</p>
              <p>Aether does not compete — it separates.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.4 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 1.4 }}
              className="text-[10px] md:text-xs font-normal text-white/40 tracking-[0.4em] uppercase"
            >
              THIS SPACE IS NOT DESIGNED FOR EVERYONE.
            </motion.div>
          </motion.div>
        </section>

        {/* Section 2: Features */}
        <section id="features" className="h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div
              className="relative px-12 py-16 md:px-24 md:py-28 rounded-[2rem] text-center min-w-[320px] md:min-w-[650px] flex flex-col items-center justify-center gap-10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white/90">
                Structural Advantages.
              </h2>

              <div className="flex flex-col gap-6 text-sm md:text-base text-white/60 font-light tracking-wide leading-relaxed">
                <p className="text-white/80">What others call features, we treat as fundamentals.</p>
                <div className="space-y-2">
                  <p>Selective access over mass visibility.</p>
                  <p>Systems that compound quietly.</p>
                  <p>Control without exposure.</p>
                  <p>Intelligence without noise.</p>
                </div>
                <p className="pt-4 text-white/40 italic">Nothing here is accidental.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 3: Services */}
        <section id="services" className="h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div
              className="relative px-12 py-16 md:px-24 md:py-28 rounded-[2rem] text-center min-w-[320px] md:min-w-[650px] flex flex-col items-center justify-center gap-10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white/90">
                Execution Without Exposure.
              </h2>

              <div className="flex flex-col gap-6 text-sm md:text-base text-white/60 font-light tracking-wide leading-relaxed">
                <div className="space-y-2">
                  <p>Quiet systems.</p>
                  <p>Private leverage.</p>
                  <p>Outcomes that do not announce themselves.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 4: About */}
        <section id="about" className="h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div
              className="relative px-12 py-16 md:px-24 md:py-28 rounded-[2rem] text-center min-w-[320px] md:min-w-[650px] flex flex-col items-center justify-center gap-10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white/90">
                About Aether.
              </h2>

              <div className="flex flex-col gap-6 text-sm md:text-base text-white/60 font-light tracking-wide leading-relaxed max-w-lg">
                <div className="space-y-2">
                  <p>Aether is not built for mass appeal.</p>
                  <p>It is shaped for those who recognize leverage, not labels.</p>
                </div>

                <div className="space-y-2">
                  <p>This is not a platform for consumption.</p>
                  <p>It is an environment for alignment.</p>
                </div>

                <p className="pt-4 text-white/40 italic">
                  Most will scroll past. That is intentional.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

      </div>

      {/* ENTER Mode Overlay */}
      <AnimatePresence>
        {navigationMode === 'enter' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center bg-black/50 backdrop-blur-3xl"
          >
            <h1 className="text-5xl md:text-[8rem] font-medium text-white tracking-wider leading-relaxed">
              Remain.
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </main>
  );
}
