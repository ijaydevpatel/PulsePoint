import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

function ECGLine() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none scale-[1.3] md:scale-[1.8] right-[-15%] opacity-90">
      <svg width="800" height="400" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="ecgGradient" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8A1B33" stopOpacity="0" />
            <stop offset="20%" stopColor="#8A1B33" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8A1B33" stopOpacity="1" />
            <stop offset="80%" stopColor="#D92544" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D92544" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Main glowing heartbeat path drawing from Right to Left */}
        <motion.path
          d="M800 200 L600 200 L580 200 L550 150 L510 300 L460 50 L410 350 L370 180 L340 200 L100 200 L0 200"
          stroke="url(#ecgGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecgGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
        />
        
        {/* Sharp inner core line */}
        <motion.path
          d="M800 200 L600 200 L580 200 L550 150 L510 300 L460 50 L410 350 L370 180 L340 200 L100 200 L0 200"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 0.05 }}
        />
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center pt-24 pb-16 px-8 md:px-16 lg:px-24 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between w-full h-full relative z-10 gap-16">
        
        {/* Left Column: Typography */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
{/* Client badge removed for minimal aesthetic per final instructions */}

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-sans font-bold text-text-primary tracking-tight leading-[1.1]"
          >
             Your Health Data, Decoded by AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="text-lg md:text-xl text-text-secondary max-w-lg font-medium leading-relaxed"
          >
            PulsePoint helps you track, understand, and act on your bloodwork — 
            with smart AI insights and clean dashboards.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <Link href="/login" className="px-8 py-3.5 bg-surface-glass border border-border-glass rounded-full font-bold text-text-primary shadow-sm hover:shadow-soft hover:border-primary/20 transition-all text-center min-w-[140px]">
              Login
            </Link>
            <Link href="/signup" className="px-8 py-3.5 bg-primary text-white rounded-full font-bold shadow-float hover:shadow-lg hover:-translate-y-0.5 transition-all text-center min-w-[140px]">
              Sign Up
            </Link>
          </motion.div>
        </div>

        {/* Right Column: 2D Composition Container with Flowing ECG & Floating Cards */}
        <div className="w-full md:w-1/2 min-h-[500px] flex items-center justify-center relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="w-full aspect-square max-w-[500px] relative flex items-center justify-center"
          >
            
            {/* Elegant ECG Line flowing from the right replacing abstract orb */}
            <ECGLine />

            {/* Floating Glass Panels simulating the Dribbble video (Kept exactly as requested) */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[-10%] glass px-6 py-4 rounded-3xl shadow-lg border border-border-glass min-w-[180px] z-20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                </div>
                <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Biomarker Analysis</span>
              </div>
              <p className="font-bold text-lg text-text-primary">Real-time</p>
              <p className="text-sm text-text-secondary">data insights</p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[15%] right-[-5%] glass px-6 py-5 rounded-3xl shadow-lg border border-border-glass min-w-[200px] z-20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                </div>
                <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Health Dashboard</span>
              </div>
              <p className="font-bold text-xl text-text-primary">Track</p>
              <p className="text-sm text-text-secondary mt-1">trends with<br/>confidence.</p>
            </motion.div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
