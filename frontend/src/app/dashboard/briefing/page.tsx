"use client";

import React from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { Brain, ArrowLeft, Activity, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function BriefingPage() {
  const { profile } = useUser();
  const intel = profile?.intelligence;

  return (
    <FeatureShell
      title="Intelligence Briefing"
      subtitle="Deep clinical analysis of your daily health signatures."
      icon={<Brain size={24} strokeWidth={2.5} />}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
        
        {/* Back Link */}
        <Link href="/dashboard" className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity self-start">
           <ArrowLeft size={14} strokeWidth={3} /> Return to Dashboard
        </Link>

        {/* Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 rounded-[40px] p-8 md:p-12 border border-primary/10 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Brain size={300} /></div>
           <div className="relative z-10 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl md:text-5xl font-display font-black text-text-primary tracking-tighter mb-4">
                  {intel?.education.title || "Neural Education Pulse"}
                </h2>
                <p className="text-base md:text-xl text-text-secondary font-semibold leading-relaxed max-w-3xl">
                  {intel?.education.explanation || "Synchronizing clinical context..."}
                </p>
              </div>
              
              <div className="h-px w-full bg-primary/10 my-4" />
              
              <div>
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Neural Synthesis Result</h4>
                <p className="text-sm md:text-lg text-text-primary font-medium leading-relaxed italic opacity-90">
                  "{intel?.intelligenceBrief || "Fetching detailed biometric context..."}"
                </p>
              </div>
           </div>
        </motion.div>

        {/* Detailed Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-glass backdrop-blur-3xl rounded-[32px] p-8 border border-border-glass shadow-sm flex flex-col gap-4"
           >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <Activity size={20} />
              </div>
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Digital Twin Signal</h4>
              <p className="text-sm font-semibold text-text-primary leading-relaxed">
                 <span className="opacity-60 block text-[9px] mb-1">PATTERN</span>
                 {intel?.digitalTwin.pattern || "SteadyState Baseline"}
              </p>
              <p className="text-[11px] font-medium text-text-secondary leading-relaxed border-t border-border-glass pt-4 mt-2">
                 <span className="opacity-60 block text-[9px] mb-1 uppercase">CLINICAL CAUTION</span>
                 {intel?.digitalTwin.medInsight || "Biological baseline remains within normal parameters."}
              </p>
           </motion.div>

           <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-glass backdrop-blur-3xl rounded-[32px] p-8 border border-border-glass shadow-sm flex flex-col gap-4"
           >
              <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange">
                 <ShieldCheck size={20} />
              </div>
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Risk Projection</h4>
              <div className="flex flex-col gap-2">
                 <span className="text-[24px] md:text-[32px] font-display font-black text-text-primary tracking-tighter">
                   {intel?.digitalTwin.riskTrend || "Stable"}
                 </span>
                 <p className="text-[11px] font-medium text-text-secondary leading-relaxed opacity-70">
                   Trajectory analyzed: No critical variance detected in current biometric stream.
                 </p>
              </div>
           </motion.div>

        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-surface-low border border-border-glass"
        >
           <Info size={14} className="text-primary" />
           <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed">
             This briefing is generated using the PulsePoint Qwen-3 Research Engine based on your unique biometric signatures.
           </p>
        </motion.div>

      </div>
    </FeatureShell>
  );
}
