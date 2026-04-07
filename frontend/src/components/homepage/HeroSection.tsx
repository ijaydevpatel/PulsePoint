"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/core/ThemeProvider";

function ECGLine({ isDark }: { isDark: boolean }) {
  const primaryColor = isDark ? "#FF4D6D" : "#D92544";
  const secondaryColor = isDark ? "#C9184A" : "#8A1B33";

  return (
    <div 
      className={`absolute inset-0 z-0 flex items-center justify-center pointer-events-none scale-[1.1] sm:scale-[1.3] md:scale-[1.8] right-[-5%] md:right-[-15%] ${isDark ? 'opacity-100' : 'opacity-80'} md:opacity-60`}
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 25%)'
      }}
    >
      <svg width="600" height="300" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
          <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={isDark ? "10" : "8"} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="ecgGradient" gradientUnits="userSpaceOnUse" x1="800" y1="200" x2="0" y2="200">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="30%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M800 200 L600 200 L580 200 L550 150 L510 300 L460 50 L410 350 L370 180 L340 200 L100 200 L0 200"
          stroke="url(#ecgGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecgGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
          style={{ opacity: 1 }}
        />
        
        <motion.path
          d="M800 200 L600 200 L580 200 L550 150 L510 300 L460 50 L410 350 L370 180 L340 200 L100 200 L0 200"
          stroke={isDark ? "#ffffff" : "#ffffff"}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, opacity: isDark ? 0.7 : 0.4 }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 0.05 }}
          style={{ opacity: isDark ? 0.7 : 0.4 }}
        />
      </svg>
    </div>
  );
}

export function HeroSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative w-full min-h-[auto] flex items-center pt-0 md:pt-20 pb-12 md:pb-16 px-6 md:px-16 lg:px-24 overflow-hidden bg-background-app">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between w-full h-full relative z-10 gap-12 md:gap-20">
        
        {/* Left Column: Typography */}
        <div className="w-full md:w-[55%] flex flex-col justify-center gap-6 md:gap-8 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.25em] mb-6 md:mb-8">
              <Sparkles size={14} strokeWidth={2.5} /> Next-Gen Clinical Intelligence
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-display font-black text-text-primary tracking-tighter leading-[0.95]">
              Health Data, <br/>
              <span className="text-primary italic">Decoded</span> by AI.
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-text-secondary max-w-xl mx-auto md:mx-0 font-semibold leading-relaxed opacity-80"
          >
            PulsePo<span className="text-primary">!</span>nt maps your biological signatures into actionable clinical intelligence—powered by the Neural Twin engine.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 md:mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 md:gap-6"
          >
            <Link href="/signup" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-[24px] font-black shadow-glow hover:brightness-110 active:scale-95 transition-all text-center text-sm md:text-base uppercase tracking-widest flex items-center justify-center gap-2">
              Sync Neural Twin <ArrowRight size={18} strokeWidth={3} />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-surface-low/50 backdrop-blur-3xl border border-surface-container rounded-[24px] font-black text-text-primary hover:bg-surface-low transition-all text-center text-sm md:text-base uppercase tracking-widest">
              Identity Portal
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Visual Composition */}
        <div className="w-full md:w-[45%] min-h-[350px] sm:min-h-[500px] flex items-center justify-center relative mt-8 md:mt-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="w-full aspect-square relative flex items-center justify-center"
          >
            
            {/* Elegant ECG Line */}
            <ECGLine isDark={isDark} />

            {/* Floating Glass Panels */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[-5%] md:left-[-15%] bg-surface-low/40 backdrop-blur-3xl p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl border border-surface-container min-w-[180px] md:min-w-[220px] z-20 group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow"></div>
                </div>
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">Biometrics</span>
              </div>
              <p className="font-display font-black text-xl md:text-2xl text-text-primary leading-tight">Neural Sync</p>
              <p className="text-[11px] font-semibold text-text-secondary mt-1 uppercase tracking-widest">Optimized</p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[10%] right-[-5%] md:right-[-10%] bg-surface-low/40 backdrop-blur-3xl p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl border border-surface-container min-w-[200px] md:min-w-[240px] z-20 group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                   <div className="w-2 h-2 bg-primary rounded-full shadow-glow"></div>
                </div>
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">Engine Status</span>
              </div>
              <p className="font-display font-black text-xl md:text-2xl text-text-primary leading-tight">Clinical Pulse</p>
              <p className="text-[11px] font-semibold text-text-secondary mt-1 uppercase tracking-widest leading-relaxed">Active Signal Detected</p>
            </motion.div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
