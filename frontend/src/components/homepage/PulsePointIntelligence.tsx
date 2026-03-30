"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/components/core/ThemeProvider";
import { Ubuntu } from "next/font/google";

const ubuntuFont = Ubuntu({ subsets: ["latin"], weight: ["700"] });

export function PulsePointIntelligence() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden transition-colors duration-300"
      // Remove explicit backgroundColor so it inherits the seamless page background
    >
      {/* Background radial gradient for subtle lighting, completely behind everything */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: isDark 
            ? "radial-gradient(circle at top center, rgba(30,10,15,0.4) 0%, transparent 60%)"
            : "radial-gradient(circle at top center, rgba(230,200,205,0.2) 0%, transparent 60%)"
        }}
      />

      {/* --- LAYER 1: Deep Background Text (z-10) --- */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full -mt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 px-5 py-2 rounded-full border text-xs font-bold tracking-widest uppercase"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
            color: isDark ? "#F5F5F7" : "#1A1A1A",
          }}
        >
          Neural Health Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`text-[80px] md:text-[120px] lg:text-[160px] ${ubuntuFont.className} tracking-tighter leading-[0.95] text-text-primary mb-6 drop-shadow-xl`}
        >
          <span className="block z-0 relative">Intelligence</span>
          <span className="block pb-6 z-10 relative flex items-center justify-center">
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-br from-[#D92544] via-[#a31a2f] to-[#8A1B33] pr-4 pb-6">For The</span>
            <span className="inline-block w-[0.1em]" />
            <span 
              className="inline-block italic transform -rotate-[6deg] -translate-y-[0.3em] text-[#0EA5E9] z-20 relative px-4 pb-6"
              style={{ textShadow: `0 0 40px rgba(14,100,200,0.5), 0 6px 24px ${isDark ? "rgba(4,30,80,0.9)" : "rgba(0,0,0,0.5)"}` }}
            >
              Living
            </span>
            <span className="inline-block w-[0.1em]" />
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-br from-[#D92544] via-[#a31a2f] to-[#8A1B33] pr-4 pb-6">Body</span>
          </span>
        </motion.h1>
      </div>

      {/* --- LAYER 2: Massive Centered Anatomy Image (z-20) --- */}
      <div className="absolute inset-0 w-full flex items-end justify-center z-20 pointer-events-none">
        {/* Burgundy glow behind anatomy */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-[#D92544] rounded-full blur-[100px] opacity-20 pointer-events-none" />
        <motion.img
          key={theme}
          src={isDark ? "/anatomy-dark.png" : "/anatomy-light.png"}
          alt="Neural Interface Anatomy"
          initial={{ opacity: 0, scale: 0.95, y: 80 }}
          animate={{ opacity: 1, scale: 1, y: 40 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full max-w-[1500px] h-auto object-contain object-bottom drop-shadow-2xl"
          style={{ opacity: isDark ? 0.9 : 1, maxHeight: "95vh" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* --- LAYER 3: Foreground Interactive HUD Elements (z-30) --- */}
      {/* 3D Designer HUD Layout - Elements floated to the sides to frame the anatomy perfectly */}
      <div className="absolute inset-x-0 bottom-4 md:bottom-8 lg:bottom-12 z-30 flex flex-col md:flex-row items-center md:items-end justify-between px-6 md:px-12 lg:px-24 pointer-events-none gap-6">
        
        {/* Left Neural Data Panel */}
        <motion.div
          initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="w-full md:w-auto max-w-[340px] p-6 rounded-2xl border shadow-2xl backdrop-blur-xl pointer-events-auto relative overflow-hidden"
          style={{
            backgroundColor: isDark ? "rgba(10,10,12,0.4)" : "rgba(255,255,255,0.4)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          }}
        >
          {/* Tech/Medical accent marks */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D92544] to-transparent opacity-80" />
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[#D92544] to-transparent opacity-60" />
          
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 rounded-full bg-[#D92544] animate-pulse shadow-[0_0_10px_#D92544]" />
             <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary">Diagnostic Core</span>
          </div>

          <p className="text-sm md:text-base text-text-primary font-medium leading-relaxed">
            <span className="text-[#D92544] font-bold block mb-1">AI-Powered Subcutaneous Scan</span> Understand your biology like never before with <span className="text-[#D92544]">Pulse</span>Po<span className="text-[#D92544]">!</span>nt's neural ecosystem.
          </p>
        </motion.div>

        {/* Right Interaction Panel */}
        <motion.div
          initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className="flex flex-col gap-4 pointer-events-auto w-full md:w-auto items-center md:items-end"
        >
          <div className="hidden md:flex items-center gap-3 mb-2 mr-2">
             <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary text-right">Primary Actions</span>
             <div className="w-8 h-[1px] bg-border-glass" />
          </div>

          <Link
            href="/signup"
            className="w-full sm:w-auto md:w-[220px] px-8 py-4 bg-[#8A1B33] hover:bg-[#D92544] text-white rounded-xl font-bold font-sans shadow-[0_0_30px_rgba(217,37,68,0.3)] hover:shadow-[0_0_40px_rgba(217,37,68,0.6)] transition-all text-sm tracking-widest uppercase flex items-center justify-between group"
          >
            <span>Start Free</span>
            <span className="font-light text-white/50 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300">→</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto md:w-[220px] px-8 py-4 rounded-xl font-bold font-sans text-sm tracking-widest uppercase transition-all border bg-surface-glass backdrop-blur-md hover:bg-surface-low text-center"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
              color: isDark ? "#F5F5F7" : "#1A1A1A",
            }}
          >
            Sign In
          </Link>
        </motion.div>
      </div>

      {/* --- LAYOUT SPACER (Maintains perfect original flex alignment for the Title) --- */}
      <div className="relative z-0 flex flex-col items-center gap-8 mt-[28vh] md:mt-[35vh] px-4 w-full pointer-events-none opacity-0">
         <div className="h-[150px] w-full" />
      </div>

      {/* Floating Status Badge (Moved to Upper Right to avoid HUD overlap) (z-30) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute top-28 md:top-36 right-4 md:right-8 flex items-center gap-3 px-5 py-3 rounded-full border bg-surface-glass backdrop-blur-md shadow-xl z-30"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffb3c6] shadow-[0_0_10px_rgba(255,179,198,0.8)] animate-pulse" />
        <span className="text-[11px] text-text-primary font-bold tracking-widest uppercase">
          Vital Signs Active
        </span>
      </motion.div>

      {/* Ultimate Natural Fade divider for bottom bleed */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[15vh] pointer-events-none z-40"
        style={{
          background: isDark 
            ? "linear-gradient(to bottom, transparent, #080808 90%)" 
            : "linear-gradient(to bottom, transparent, #FAFAFA 90%)"
        }}
      />
    </section>
  );
}
