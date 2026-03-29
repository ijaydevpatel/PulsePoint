"use client";

import React from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { ArrowLeft, Brain, Activity, ShieldCheck, Pill } from "lucide-react";

export default function BriefingPage() {
  const { profile } = useUser();
  const intel = profile?.intelligence;

  return (
    <div className="w-full h-full flex flex-col pt-4 px-6 pb-12 bg-transparent relative overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <Link 
          href="/dashboard"
          className="p-3 bg-surface-glass border border-border-glass rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Clinical Briefing</h1>
          <p className="text-text-secondary text-sm mt-1 font-medium">
            Deep neural analysis of your biometric and environmental vectors.
          </p>
        </div>
      </div>

      {!intel ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary gap-4">
          <Brain size={48} className="animate-pulse text-primary/50" />
          <p className="text-sm font-bold tracking-widest uppercase">Analyzing intelligent matrices...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Clinical Concept */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-surface-glass backdrop-blur-3xl rounded-[32px] p-8 border border-border-glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain size={120} />
              </div>
              <div className="inline-flex px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/30">
                Primary Insight
              </div>
              <h2 className="text-2xl font-black text-white mb-4 leading-tight">
                {intel.education.title}
              </h2>
              <p className="text-text-secondary text-base md:text-lg leading-relaxed font-medium">
                {intel.education.explanation}
              </p>
            </div>

            {/* Current State Analysis */}
            <div className="bg-surface-glass backdrop-blur-3xl rounded-[32px] p-8 border border-border-glass relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5">
                <Activity size={120} />
              </div>
              <div className="inline-flex px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-blue-500/30">
                System Status
              </div>
              <p className="text-white text-lg md:text-xl leading-relaxed font-medium">
                "{intel.intelligenceBrief}"
              </p>
            </div>
          </div>

          {/* Right Side Micro-Metrics */}
          <div className="flex flex-col gap-6">
            
            <div className="mt-0 p-8 bg-primary/10 rounded-[32px] border border-primary/20 text-left relative overflow-hidden">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Clinical Deep-Dive Guidance</h4>
              <p className="text-white font-medium text-lg leading-relaxed">{intel.digitalTwin.medInsight}</p>
            </div>

            <div className="bg-surface-glass backdrop-blur-3xl rounded-[32px] p-8 border border-border-glass shadow-sm flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-low border border-surface-container-high flex items-center justify-center mb-4">
                 <ShieldCheck className="text-accent-green" size={28} />
              </div>
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Systems Online</h4>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                 Your intelligent neural twin is actively monitoring your biomarkers against local environmental signatures.
              </p>
            </div>
            
          </div>
        </motion.div>
      )}
    </div>
  );
}
