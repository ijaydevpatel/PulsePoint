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
  ChevronRight, 
  Flame, 
} from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function DashboardPage() {
  const { profile, saveProfile, displayName } = useUser();
  const [loadingIntel, setLoadingIntel] = React.useState(false);
  const [neuralPulse, setNeuralPulse] = React.useState<any>(null);
  const hasFetchedIntel = React.useRef(false);

  // Fetch Intelligence and OSINT data on mount
  React.useEffect(() => {
    const fetchIntelligence = async () => {
      if (!profile || hasFetchedIntel.current) return;
      
      hasFetchedIntel.current = true;
      setLoadingIntel(true);
      try {
          if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(async (pos) => {
               const lat = pos.coords.latitude;
               const lon = pos.coords.longitude;
               const data = await apiClient.get(`/dashboard/intel?lat=${lat}&lon=${lon}`);
                if (data && data.intelligence) {
                  saveProfile({ ...profile, intelligence: data.intelligence, osint: data.osint });
                  setNeuralPulse(data.neuralPulse);
                }
              }, async (error) => {
                console.warn("Geolocation denied or failed:", error.message);
                const data = await apiClient.get(`/dashboard/intel`);
                if (data && data.intelligence) {
                  saveProfile({ ...profile, intelligence: data.intelligence });
                  setNeuralPulse(data.neuralPulse);
                }
              }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
           } else {
              const data = await apiClient.get(`/dashboard/intel`);
              if (data && data.intelligence) {
                saveProfile({ ...profile, intelligence: data.intelligence });
                setNeuralPulse(data.neuralPulse);
              }
           }
        } catch (error) {
          console.error("Intelligence Load Error:", error);
        } finally {
          setLoadingIntel(false);
        }
    };
    fetchIntelligence();
  }, [profile, saveProfile]);

  let riskLevel = "Optimal";
  let alertBar = null;

  if (profile) {
    if ((profile.bmi || 0) > 30 || (profile.conditions?.length || 0) > 2) {
      riskLevel = "High Risk";
      alertBar = {
        title: "Clinical Vigilance Required",
        message: "High BMI and multiple underlying conditions detected. Biological stability at risk.",
        action: "Run Diagnostic",
        link: "/dashboard/report"
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

  const healthScore = profile?.healthScore || 72;
  const streak = profile?.streak || 0;
  const intel = profile?.intelligence;
  const osint = profile?.osint;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col gap-6"
    >
      {/* Title Section */}
      <motion.div variants={headerVariants} className="flex flex-col gap-1">
        <div className="flex flex-row items-center justify-between w-full gap-4">
          <h1 className="text-[28px] md:text-3xl lg:text-5xl font-display font-black text-text-primary tracking-tighter leading-tight">
            Welcome back, {displayName?.split(" ")[0] || "User"}.
          </h1>

          {/* Neural Sync HUD Mirror - Relocated to fully Right side */}
          {neuralPulse && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-glass border border-border-glass shadow-sm h-fit"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none mb-1">Neural Sync</span>
                <span className="text-[10px] font-bold text-text-primary leading-none">
                  {neuralPulse.generationTime.toFixed(2)}s | <span className="text-primary">{neuralPulse.model}</span>
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <p className="text-[11px] md:text-sm font-black text-text-secondary mt-1 uppercase tracking-widest opacity-60">
          {profile?.age ? `${profile.age}-year-old ${profile.gender}` : "Session analyzing current biometric markers."} — {riskLevel}
        </p>

        {alertBar && (
           <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 md:p-6 rounded-[32px] bg-accent-crimson/10 border border-accent-crimson/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm backdrop-blur-xl"
           >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-crimson/10 flex items-center justify-center text-accent-crimson shrink-0">
                  <AlertCircle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-[11px] md:text-xs font-black text-text-primary uppercase tracking-widest">{alertBar.title}</h4>
                  <p className="text-[11px] md:text-xs text-text-secondary font-semibold leading-relaxed mt-0.5">{alertBar.message}</p>
                </div>
              </div>
              <Link href={alertBar.link} className="w-full sm:w-auto px-6 h-11 bg-accent-crimson text-white text-[10px] md:text-xs font-black rounded-full shadow-md hover:brightness-110 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 whitespace-nowrap">
                {alertBar.action} <ChevronRight size={14} strokeWidth={3} />
              </Link>
           </motion.div>
        )}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 w-full">
        
        {/* Left Column (Intelligence) */}
        <div className="lg:col-span-7 flex flex-col gap-5 lg:gap-6">
          
          {/* Intelligence Panel */}
          <motion.div 
            variants={cardVariants}
            className="bg-primary/5 rounded-[32px] p-6 md:p-10 border border-primary/10 relative overflow-hidden flex flex-col min-h-[220px] md:min-h-[260px] justify-center group"
          >
             <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity hidden md:block">
               <Brain size={240} />
             </div>
             <div className="relative z-10">
               <h4 className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                 <Brain size={14} strokeWidth={2.5} /> Today's Intelligence
               </h4>
               <p className="text-xl md:text-2xl lg:text-4xl font-display font-black text-text-primary leading-[1.15] mb-5 tracking-tighter">
                 {intel?.dailyTip || "Neural engine syncing..."}
               </p>
               <p className="text-xs md:text-sm lg:text-base text-text-secondary font-semibold leading-relaxed max-w-2xl opacity-80">
                 {intel?.intelligenceBrief || "Fetching clinical context from your digital twin profile."}
               </p>
             </div>
          </motion.div>

          {/* Environmental Pulse */}
          <motion.div 
            variants={cardVariants}
            className="bg-surface-low/30 backdrop-blur-3xl rounded-[32px] p-6 md:p-8 shadow-sm border border-surface-container"
          >
             <h4 className="text-[10px] md:text-xs font-black text-text-secondary uppercase tracking-[0.3em] mb-8 flex items-center gap-2 opacity-60">
               <Wind size={14} strokeWidth={2.5} /> Environmental Pulse
             </h4>
             <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8">
                <div className="flex flex-col items-center">
                   <div className="w-12 h-12 md:w-16 md:h-16 rounded-[24px] bg-accent-orange/10 flex items-center justify-center text-accent-orange mb-3 border border-accent-orange/10 shadow-inner">
                      <Sun size={24} strokeWidth={2.5} />
                   </div>
                   <span className="text-[9px] font-black text-text-secondary uppercase tracking-tight opacity-50">UV INDEX</span>
                   <span className="text-sm md:text-xl font-display font-black text-text-primary mt-1">{osint?.uv || "0"}</span>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-12 h-12 md:w-16 md:h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary mb-3 border border-primary/10 shadow-inner">
                      <Wind size={24} strokeWidth={2.5} />
                   </div>
                   <span className="text-[9px] font-black text-text-secondary uppercase tracking-tight opacity-50">AQI</span>
                   <span className="text-sm md:text-xl font-display font-black text-text-primary mt-1">{osint?.aqi || "24"}</span>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-12 h-12 md:w-16 md:h-16 rounded-[24px] bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3 border border-blue-500/10 shadow-inner">
                      <Droplets size={24} strokeWidth={2.5} />
                   </div>
                   <span className="text-[9px] font-black text-text-secondary uppercase tracking-tight opacity-50">HUMIDITY</span>
                   <span className="text-sm md:text-xl font-display font-black text-text-primary mt-1">{osint?.humidity ? `${Math.round(osint.humidity)}%` : "45%"}</span>
                </div>
             </div>

             {intel?.environmentalAnalysis && (
               <div className="mt-2 p-5 bg-surface-low rounded-[24px] border border-surface-container-high transition-colors hover:border-primary/20 group">
                 <p className="text-[11px] md:text-xs text-text-secondary leading-relaxed font-semibold">
                   <strong className="text-primary tracking-[0.2em] text-[9px] uppercase block mb-2 font-black">AI GEOSPATIAL CONTEXT</strong>
                   <span className="opacity-80">{intel.environmentalAnalysis}</span>
                 </p>
               </div>
             )}
          </motion.div>

        </div>

        {/* Right Column (Metrics & Briefing) */}
        <div className="lg:col-span-5 flex flex-col gap-5 lg:gap-6">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Health Pattern */}
            <motion.div 
              variants={cardVariants}
              className="bg-surface-glass backdrop-blur-3xl rounded-[20px] md:rounded-[28px] p-4 md:p-6 border border-border-glass group relative overflow-hidden flex flex-col justify-center min-h-[100px] md:min-h-[120px]"
            >
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity hidden md:block"><Activity size={48} /></div>
                <h4 className="text-[8px] md:text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">Health Pattern</h4>
                <p className="text-xs md:text-sm lg:text-base font-bold text-text-primary leading-snug">
                  {intel?.digitalTwin.pattern || "Analyzing signatures..."}
                </p>
            </motion.div>

            {/* Risk Trend */}
            <motion.div 
              variants={cardVariants}
              className="bg-surface-glass backdrop-blur-3xl rounded-[20px] md:rounded-[28px] p-4 md:p-6 border border-border-glass group relative overflow-hidden flex flex-col justify-center min-h-[100px] md:min-h-[120px]"
            >
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity hidden md:block"><AlertCircle size={48} /></div>
                <h4 className="text-[8px] md:text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">Risk Trend</h4>
                <p className="text-xs md:text-sm lg:text-base font-bold text-text-primary leading-snug">
                  {intel?.digitalTwin.riskTrend || "Calculated: Stable."}
                </p>
            </motion.div>

            {/* Health Score */}
            <motion.div 
              variants={cardVariants}
              className="bg-primary rounded-[20px] md:rounded-[28px] p-4 md:p-6 shadow-lg border border-primary/30 flex flex-col justify-center text-white relative overflow-hidden"
            >
              <h4 className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Health Score</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-3xl font-black">{healthScore}</span>
                <span className="text-[9px] md:text-xs font-bold text-white/60">/ 100</span>
              </div>
            </motion.div>

            {/* Current Streak */}
            <motion.div 
              variants={cardVariants}
              className="bg-surface-glass backdrop-blur-3xl rounded-[20px] md:rounded-[28px] p-4 md:p-6 shadow-sm border border-border-glass flex flex-col justify-center relative overflow-hidden"
            >
              <h4 className="text-[8px] md:text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Flame size={12} className="text-primary" /> Streak
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-3xl font-black text-primary">{streak}</span>
                <span className="text-[9px] md:text-xs font-bold text-text-secondary ml-1">Days</span>
              </div>
            </motion.div>

          </div>

          {/* 3. Education / Briefing */}
          <motion.div 
            variants={cardVariants}
            className="bg-surface-glass backdrop-blur-3xl rounded-[24px] md:rounded-[32px] p-5 md:p-6 shadow-sm border border-border-glass flex flex-col h-fit"
          >
             <h4 className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Intelligence Briefing</h4>
             <Link href="/dashboard/briefing" className="block p-4 md:p-5 bg-surface-low rounded-2xl border border-surface-container-high transition-all hover:border-primary/30 group cursor-pointer hover:bg-white/5 active:scale-[0.98]">
               <h5 className="text-xs md:text-sm lg:text-base font-bold text-text-primary group-hover:text-primary transition-colors flex items-center justify-between mb-2">
                 {intel?.education.title || "Clinical Concept"}
                  <ChevronRight size={14} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
               </h5>
               <p className="text-[11px] md:text-[13px] text-text-secondary leading-relaxed font-medium">
                 {intel?.education.explanation || "Loading clinical educational context related to your profile."}
               </p>
             </Link>
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
}
