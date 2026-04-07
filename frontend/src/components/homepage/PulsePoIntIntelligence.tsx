"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/core/ThemeProvider";
import { Ubuntu } from "next/font/google";

const ubuntuFont = Ubuntu({ subsets: ["latin"], weight: ["700"] });

export function PulsePoIntIntelligence() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className="relative w-full min-h-[115vh] md:min-h-[192vh] flex flex-col items-center justify-start pt-32 md:pt-48 pb-16 overflow-hidden transition-colors duration-300"
    >
      {/* Background radial gradient */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: isDark 
            ? "radial-gradient(circle at top center, rgba(30,10,15,0.4) 0%, transparent 60%)"
            : "radial-gradient(circle at top center, rgba(230,200,205,0.2) 0%, transparent 60%)"
        }}
      />

      {/* --- LAYER 1: Deep Background Text (z-10) --- */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 md:mb-6 px-4 md:px-5 py-2 rounded-full border text-[10px] md:text-xs font-bold tracking-widest uppercase"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
            color: isDark ? "#F5F5F7" : "#1A1A1A",
          }}
        >
          Neural Health Intelligence
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`text-5xl sm:text-6xl md:text-[100px] lg:text-[160px] ${ubuntuFont.className} tracking-tighter leading-[0.95] text-text-primary mb-6 drop-shadow-xl flex flex-col items-center`}
        >
          <span 
            className="inline-block italic transform -rotate-[5deg] -translate-y-[0.1em] text-[#0EA5E9] z-20 relative px-4 pb-2 md:pb-6 drop-shadow-[0_0_20px_rgba(14,165,233,0.8)]"
            style={{ textShadow: `0 0 40px rgba(14,165,233,0.5)` }}
          >
            Biological
          </span>
          <span className="block pb-4 md:pb-6 z-10 relative flex items-center justify-center flex-wrap gap-x-2 md:gap-x-0">
            <span className="inline-block bg-clipping-text text-transparent bg-gradient-to-br from-[#D92544] via-[#a31a2f] to-[#8A1B33] md:pr-4" style={{ WebkitBackgroundClip: 'text' }}>Sentience Engine</span>
          </span>
        </motion.h2>
      </div>

      {/* --- LAYER 2: Massive Centered Anatomy Image (STRICT MASTER POSITION) --- */}
      <div className="absolute inset-0 w-full flex items-start justify-center z-[35] md:z-20 pointer-events-none pt-[46vh] md:pt-[82vh]">
        {/* Burgundy glow behind anatomy */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] w-[280px] h-[280px] md:w-[600px] md:h-[600px] bg-[#D92544] rounded-full blur-[60px] md:blur-[100px] opacity-20 pointer-events-none" />
        <motion.img
          key={theme}
          src={isDark ? "/anatomy-dark.png" : "/anatomy-light.png"}
          alt="Neural Interface Anatomy"
          initial={{ opacity: 0, scale: 0.95, y: 80 }}
          animate={{ 
            opacity: 1, 
            scale: typeof window !== "undefined" && window.innerWidth < 768 ? 1.25 : 1.1, 
            y: typeof window !== "undefined" && window.innerWidth < 768 ? -30 : -60 
          }} // Master Decoupling: Position Locked
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full max-w-[1500px] h-auto object-contain object-center drop-shadow-2xl"
          style={{ 
            opacity: isDark ? 0.9 : 1, 
            maxHeight: "160vh",
            maskImage: "linear-gradient(to top, transparent 0%, black 15%, black 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 15%, black 100%)" 
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* --- LAYER 3: Foreground Interactive HUD Elements (Mobile Emerging Alignment) --- */}
      <div className="absolute inset-x-0 top-[80vh] md:top-auto md:bottom-[28%] z-50 flex flex-col md:flex-row items-center md:items-end justify-between px-6 md:px-12 lg:px-24 pointer-events-none gap-6 sm:gap-8 transition-all duration-700">
        
        {/* Left Neural Data Panel */}
        <motion.div
          initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="w-full md:w-auto max-w-[340px] p-5 md:p-6 rounded-2xl border shadow-2xl backdrop-blur-xl pointer-events-auto relative overflow-hidden"
          style={{
            backgroundColor: isDark ? "rgba(10,10,12,0.6)" : "rgba(255,255,255,0.6)", // More opaque for readability
            borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
          }}
        >
          {/* Tech/Medical accent marks */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D92544] to-transparent opacity-80" />
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[#D92544] to-transparent opacity-60" />
          
          <div className="flex items-center gap-3 mb-3 md:mb-4">
             <div className="w-2 h-2 rounded-full bg-[#D92544] animate-pulse shadow-[0_0_10px_#D92544]" />
             <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary">Diagnostic Core</span>
          </div>

          <p className="text-xs md:text-base text-text-primary font-medium leading-relaxed">
            <span className="text-[#D92544] font-bold block mb-1">AI-Powered Subcutaneous Scan</span> Understand your biology like never before with <span className="text-[#D92544]">Pulse</span>Po<span className="text-[#D92544]">!</span>int's neural ecosystem.
          </p>
        </motion.div>
      </div>

      {/* --- LAYOUT SPACER --- */}
      <div className="relative z-0 flex flex-col items-center gap-8 mt-[20vh] md:mt-[35vh] px-4 w-full pointer-events-none opacity-0">
          <div className="h-[100px] md:h-[150px] w-full" />
      </div>

      {/* Floating Status Badge - ARM-PIT ALIGNMENT (Mobile Only) --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute top-[63vh] md:top-auto md:bottom-[25%] right-4 md:right-12 flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full border bg-surface-glass backdrop-blur-md shadow-xl z-50"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }}
      >
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#ffb3c6] shadow-[0_0_10px_rgba(255,179,198,0.8)] animate-pulse" />
        <span className="text-[9px] md:text-[11px] text-text-primary font-bold tracking-widest uppercase">
          Vital Signs Active
        </span>
      </motion.div>

      {/* Ultimate Natural Fade divider (Height Rescued for Mobile Readability) */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[5vh] md:h-[25vh] pointer-events-none z-40"
        style={{
          background: isDark 
            ? "linear-gradient(to bottom, transparent, #080808 90%)" 
            : "linear-gradient(to bottom, transparent, #FAFAFA 90%)"
        }}
      />
    </section>
  );
}
