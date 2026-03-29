"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useUser } from "@/context/UserContext";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.15
    }
  }
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function DashboardPage() {
  const { profile } = useUser();

  // Dynamic Adaptive Dashboard Logic placeholders
  let riskLevel = "Optimal";
  let riskColor = "text-primary bg-primary/10 border-primary/20";
  let promptState = null;

  if (profile) {
    if ((profile.bmi || 0) > 30 || (profile.conditions?.length || 0) > 2) {
      riskLevel = "High Risk";
      riskColor = "text-accent-crimson bg-accent-crimson/10 border-accent-crimson/20";
      promptState = "Immediate clinical recommendation available based on active symptom markers.";
    } else if ((profile.bmi || 0) > 25 || (profile.conditions?.length || 0) > 0) {
      riskLevel = "Moderate Alert";
      riskColor = "text-yellow-600 bg-yellow-600/10 border-yellow-600/20";
      promptState = "Mild deviations detected. Consider updating vitals.";
    }
    
    if (profile.bmi === 0) {
      promptState = "Profile missing critical biometric data. Please update.";
    }
  }

  // Digital Twin & Gamification Extracted Data
  const healthScore = profile?.healthScore || 0;
  const streak = profile?.streak || 0;
  const latestInsights = profile?.healthInsights?.slice(-2).reverse() || [];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col pt-4 px-6 pb-12 bg-transparent relative"
    >
      {/* 1. Title & Subtitle Hierarchy */}
      <motion.div variants={headerVariants} className="flex flex-col mb-6 relative z-20">
        <h1 className="text-3xl lg:text-4xl font-sans font-bold text-text-primary tracking-tight">
          Welcome back, {profile?.fullName?.split(" ")[0] || "User"}.
        </h1>
        <p className="text-text-secondary mt-1 font-medium">
          {profile?.age ? `${profile.age}-year-old ${profile.gender}` : "Session analyzing current biometric markers."}
        </p>

        {/* Action Row / Dynamic Prompt Area */}
        {promptState && (
           <div className="mt-4 p-3 rounded-xl bg-surface-container border border-surface-container-high text-sm font-semibold text-text-primary flex items-center justify-between shadow-sm">
              <span>{promptState}</span>
              <button className="px-4 py-1.5 bg-surface-low text-text-primary text-xs font-bold rounded-lg border border-surface-container shadow-sm hover:bg-surface-container transition-colors">Action Required</button>
           </div>
        )}
      </motion.div>

      {/* 2. Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 w-full relative z-20">
        
        {/* Main large chart area */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-2 bg-surface-glass backdrop-blur-3xl rounded-[32px] p-8 shadow-sm hover:shadow-float transition-all duration-500 border border-border-glass flex flex-col justify-between overflow-hidden group min-h-[400px]"
        >
          <div className="flex justify-between items-start mb-8 z-20">
            <div>
              <h3 className="text-xl font-bold text-text-primary">Biometric Trajectory</h3>
              <p className="text-sm text-text-secondary mt-1">7-day continuous analysis</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${riskColor}`}>
              {riskLevel}
            </div>
          </div>

          <div className="w-full h-[280px] relative mt-[10px] pb-2">
            {/* Guaranteed SVG anti-crop bounding area */}
            <div className="absolute inset-0 z-10 w-full h-full flex items-end pt-12 pr-6">
              <svg width="100%" height="85%" preserveAspectRatio="none" viewBox="0 -20 1000 360" className="w-full h-full overflow-visible">
                <defs>
                   <linearGradient id="lineGradDash" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={riskLevel === "High Risk" ? "#D92544" : "#8A1B33"} stopOpacity="0.2"/>
                      <stop offset="100%" stopColor={riskLevel === "High Risk" ? "#D92544" : "#8A1B33"} stopOpacity="0"/>
                   </linearGradient>
                </defs>
                <motion.path d="M0 250 Q 80 200 150 150 T 300 120 T 450 180 T 600 90 T 750 150 T 850 80 T 1000 120"
                  stroke={riskLevel === "High Risk" ? "#D92544" : "#8A1B33"} strokeWidth="4" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
                 <motion.path d="M0 250 Q 80 200 150 150 T 300 120 T 450 180 T 600 90 T 750 150 T 850 80 T 1000 120 L 1000 300 L 0 300 Z"
                  fill="url(#lineGradDash)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
                />
              </svg>
            </div>
            
            <div className="w-full flex justify-between text-[10px] text-text-secondary/70 font-bold uppercase tracking-wider px-2 z-20 mt-auto border-t border-surface-container-high/50 pt-2">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span>
            </div>
          </div>
        </motion.div>

        {/* Side panels */}
        <div className="flex flex-col gap-6 relative z-20">
          <motion.div 
            variants={cardVariants}
            className="flex-1 bg-surface-glass backdrop-blur-3xl rounded-[32px] p-8 shadow-sm hover:shadow-float transition-shadow border border-border-glass flex flex-col justify-center overflow-hidden"
          >
             <h4 className="text-lg font-bold text-text-primary mb-4">Patient Parameters</h4>
             <div className="flex flex-col gap-3">
               <div className="flex justify-between items-center bg-surface-low p-3 rounded-xl border border-surface-container-high">
                  <span className="text-xs font-bold text-text-secondary uppercase">Allergies</span>
                  <span className="text-sm font-bold text-text-primary truncate max-w-[120px]">{profile?.allergies?.length ? profile.allergies.join(", ") : "None Tracked"}</span>
               </div>
               <div className="flex justify-between items-center bg-surface-low p-3 rounded-xl border border-surface-container-high">
                  <span className="text-xs font-bold text-text-secondary uppercase">Medications</span>
                  <span className="text-sm font-bold text-text-primary truncate max-w-[120px]">{profile?.medications?.length ? profile.medications.join(", ") : "None Active"}</span>
               </div>
               <div className="flex justify-between items-center bg-surface-low p-3 rounded-xl border border-surface-container-high">
                  <span className="text-xs font-bold text-text-secondary uppercase">Conditions</span>
                  <span className="text-sm font-bold text-text-primary truncate max-w-[120px]">{profile?.conditions?.length ? profile.conditions.join(", ") : "None Reported"}</span>
               </div>
             </div>
          </motion.div>
          
          {/* Digital Twin Insights */}
          {latestInsights.length > 0 && (
            <motion.div 
              variants={cardVariants}
              className="flex-1 bg-surface-glass backdrop-blur-3xl rounded-[32px] p-6 shadow-sm border border-border-glass flex flex-col justify-center overflow-hidden"
            >
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-tight mb-3">Twin Insights</h4>
              <div className="flex flex-col gap-2">
                {latestInsights.map((ins: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-surface-low rounded-xl border border-surface-container-high">
                    <div className={`w-2 h-2 rounded-full ${ins.type === 'Pattern' ? 'bg-primary' : 'bg-accent-orange'}`} />
                    <span className="text-[11px] font-bold text-text-primary leading-tight">{ins.content}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex gap-4">
            <motion.div 
              variants={cardVariants}
              className="flex-1 bg-primary/90 backdrop-blur-3xl rounded-[32px] p-6 shadow-md hover:shadow-float-heavy transition-all border border-primary/50 flex flex-col justify-center text-white relative overflow-hidden h-[180px]"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10 flex items-center justify-between mb-2">
                 <h4 className="text-sm font-bold text-white uppercase tracking-wider">Health Index</h4>
               </div>
               <div className="relative z-10 mt-auto">
                 <span className="text-4xl font-black block mb-1">
                    {healthScore || "N/A"}
                 </span>
                 <span className="text-[10px] font-medium text-white/80">Clinical Accuracy</span>
               </div>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              className="flex-1 bg-surface-glass backdrop-blur-3xl rounded-[32px] p-6 shadow-sm border border-border-glass flex flex-col justify-center relative overflow-hidden h-[180px]"
            >
               <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Streak</h4>
               <div className="mt-auto">
                 <span className="text-4xl font-black block text-primary mb-1">
                    {streak}d
                 </span>
                 <span className="text-[10px] font-bold text-text-secondary">Consecutive Access</span>
               </div>
            </motion.div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
