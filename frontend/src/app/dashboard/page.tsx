"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { 
  Activity, 
  AlertCircle, 
  Brain, 
  Wind, 
  Sun, 
  Droplets,
  Gauge, 
  ChevronRight, 
  Flame, 
  Stethoscope, 
  Pill, 
  UserCircle 
} from "lucide-react";

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
  const { profile, saveProfile } = useUser();
  const [loadingIntel, setLoadingIntel] = React.useState(false);

  const hasFetchedIntel = React.useRef(false);

  // Fetch Intelligence and OSINT data on mount
  React.useEffect(() => {
    const fetchIntelligence = async () => {
      if (profile && !hasFetchedIntel.current) {
        hasFetchedIntel.current = true;
        setLoadingIntel(true);
        try {
          // Attempt Geolocation for OSINT (Native Browser Prompt)
          if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(async (pos) => {
               const lat = pos.coords.latitude;
               const lon = pos.coords.longitude;
               const data = await apiClient.get(`/dashboard/intel?lat=${lat}&lon=${lon}`);
               if (data && data.intelligence) {
                 saveProfile({
                   ...profile,
                   intelligence: data.intelligence,
                   osint: data.osint
                 });
               }
             }, async (error) => {
               console.warn("Geolocation denied or failed:", error.message);
               // Fallback without location
               const data = await apiClient.get(`/dashboard/intel`);
               if (data && data.intelligence) {
                 saveProfile({ ...profile, intelligence: data.intelligence });
               }
             }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
          } else {
             // Browser doesn't support geolocation
             const data = await apiClient.get(`/dashboard/intel`);
             if (data && data.intelligence) {
               saveProfile({ ...profile, intelligence: data.intelligence });
             }
          }
        } catch (error) {
          console.error("Intelligence Load Error:", error);
        } finally {
          setLoadingIntel(false);
        }
      }
    };
    fetchIntelligence();
  }, [profile, saveProfile]);

  // Dynamic Adaptive Dashboard Logic
  let riskLevel = "Optimal";
  let riskColor = "text-primary bg-primary/10 border-primary/20";
  let alertBar = null;

  if (profile) {
    if ((profile.bmi || 0) > 30 || (profile.conditions?.length || 0) > 2) {
      riskLevel = "High Risk";
      riskColor = "text-accent-crimson bg-accent-crimson/10 border-accent-crimson/20";
      alertBar = {
        title: "Clinical Vigilance Required",
        message: "High BMI and multiple underlying conditions detected. Biological stability at risk.",
        action: "Run Diagnostic",
        link: "/dashboard/analyzer"
      };
    } else if ((profile.bmi || 0) > 25 || (profile.conditions?.length || 0) > 0) {
      riskLevel = "Moderate Alert";
      riskColor = "text-yellow-600 bg-yellow-600/10 border-yellow-600/20";
      alertBar = {
        title: "Metabolic Deviation Detected",
        message: "Moderate biometric variance. Consider synchronizing clinical vitals.",
        action: "Update Vitals",
        link: "/dashboard/settings"
      };
    } else if (profile.bmi === 0) {
      alertBar = {
        title: "Biometric Incompletion",
        message: "Neural twin cannot synchronize without baseline biometrics (Height/Weight).",
        action: "Setup Profile",
        link: "/dashboard/settings"
      };
    }
  }

  // Digital Twin & Gamification Extracted Data
  const healthScore = profile?.healthScore || 72; // Baseline fallback
  const streak = profile?.streak || 0;
  const intel = profile?.intelligence;
  const osint = profile?.osint;

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

        {/* High-Impact Smart Alert Bar */}
        {alertBar && (
           <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-[24px] bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
           >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-crimson/10 flex items-center justify-center text-accent-crimson shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">{alertBar.title}</h4>
                  <p className="text-xs text-text-secondary font-medium">{alertBar.message}</p>
                </div>
              </div>
              <Link href={alertBar.link} className="px-6 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-md hover:bg-primary/90 transition-all uppercase tracking-widest flex items-center gap-2">
                {alertBar.action} <ChevronRight size={14} />
              </Link>
           </motion.div>
        )}
      </motion.div>

      {/* 2. Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 w-full relative z-20">
        
        {/* Intelligence Panels */}
        <div className="lg:col-span-2 flex flex-col gap-6 relative z-20">
          
          {/* 1. Today's Intelligence Panel */}
          <motion.div 
            variants={cardVariants}
            className="bg-primary/5 rounded-[32px] p-6 border border-primary/20 relative overflow-hidden"
          >
             <div className="absolute -right-4 -top-4 opacity-5 shrink-0">
               <Brain size={120} />
             </div>
             <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
               <Brain size={16} /> Today's Intelligence
             </h4>
             <p className="text-2xl font-bold text-text-primary leading-tight mb-2">
               {intel?.dailyTip || "Neural engine synchronizing biometrics..."}
             </p>
             <p className="text-xs text-text-secondary font-medium">
               {intel?.intelligenceBrief || "Fetching clinical context from your digital twin profile."}
             </p>
          </motion.div>

          {/* 2. OSINT Environmental OSINT Panel */}
          <motion.div 
            variants={cardVariants}
            className="bg-surface-glass backdrop-blur-3xl rounded-[32px] p-6 shadow-sm border border-border-glass"
          >
             <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
               <Wind size={14} /> Environmental Pulse
             </h4>
             <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                   <div className="w-10 h-10 rounded-full bg-accent-orange/10 flex items-center justify-center text-accent-orange mb-1">
                      <Sun size={18} />
                   </div>
                   <span className="text-[10px] font-bold text-text-secondary uppercase">UV Index</span>
                   <span className="text-sm font-black text-text-primary">{osint?.uv || "0"}</span>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                      <Wind size={18} />
                   </div>
                   <span className="text-[10px] font-bold text-text-secondary uppercase">AQI</span>
                   <span className="text-sm font-black text-text-primary">{osint?.aqi || "24"}</span>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-1">
                      <Droplets size={18} />
                   </div>
                   <span className="text-[10px] font-bold text-text-secondary uppercase">Humidity</span>
                   <span className="text-sm font-black text-text-primary">{osint?.humidity ? `${Math.round(osint.humidity)}%` : "45%"}</span>
                </div>
             </div>

             {intel?.environmentalAnalysis && (
               <div className="mt-4 p-3 bg-primary/5 rounded-2xl border border-primary/20">
                 <p className="text-xs text-text-secondary leading-relaxed font-medium">
                   <strong className="text-primary tracking-wide text-[10px] uppercase block mb-1">AI Context ({osint?.locationName || "Local"}):</strong>
                   {intel.environmentalAnalysis}
                 </p>
               </div>
             )}
          </motion.div>

        </div>

        {/* Right Side Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 relative z-20">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            
            {/* Health Pattern */}
            <motion.div 
              variants={cardVariants}
              className="bg-surface-glass backdrop-blur-3xl rounded-[28px] p-5 border border-border-glass group relative overflow-hidden flex flex-col justify-center"
            >
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={32} /></div>
                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Health Pattern</h4>
                <p className="text-sm font-bold text-text-primary leading-tight">
                  {intel?.digitalTwin.pattern || "Analyzing signatures..."}
                </p>
            </motion.div>

            {/* Risk Trend */}
            <motion.div 
              variants={cardVariants}
              className="bg-surface-glass backdrop-blur-3xl rounded-[28px] p-5 border border-border-glass group relative overflow-hidden flex flex-col justify-center"
            >
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><AlertCircle size={32} /></div>
                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Risk Trend</h4>
                <p className="text-sm font-bold text-text-primary leading-tight">
                  {intel?.digitalTwin.riskTrend || "Calculated: Stable."}
                </p>
            </motion.div>

            {/* Health Score */}
            <motion.div 
              variants={cardVariants}
              className="bg-primary rounded-[28px] p-5 shadow-lg border border-primary/50 flex flex-col justify-center text-white relative overflow-hidden"
            >
              <h4 className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Health Score</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black">{healthScore}</span>
                <span className="text-[10px] font-bold text-white/60">/ 100</span>
              </div>
            </motion.div>

            {/* Current Streak */}
            <motion.div 
              variants={cardVariants}
              className="bg-surface-glass backdrop-blur-3xl rounded-[28px] p-5 shadow-sm border border-border-glass flex flex-col justify-center relative overflow-hidden"
            >
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-0.5 flex items-center gap-1">
                  <Flame size={12} className="text-primary" /> Streak
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary">{streak}</span>
                <span className="text-[10px] font-bold text-text-secondary">Days</span>
              </div>
            </motion.div>

          </div>

          {/* 3. Education / Briefing */}
          <motion.div 
            variants={cardVariants}
            className="bg-surface-glass backdrop-blur-3xl rounded-[32px] p-6 shadow-sm border border-border-glass flex flex-col"
          >
             <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Intelligence Briefing</h4>
             <Link href="/dashboard/briefing" className="block p-3 bg-surface-low rounded-2xl border border-surface-container-high transition-all hover:border-primary/30 group cursor-pointer hover:bg-white/5">
               <h5 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors flex items-center justify-between">
                 {intel?.education.title || "Clinical Concept"}
                  <ChevronRight size={14} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
               </h5>
               <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                 {intel?.education.explanation || "Loading clinical educational context related to your profile."}
               </p>
             </Link>
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
}
