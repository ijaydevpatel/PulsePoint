"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Activity, AlertTriangle, GitCompare, CheckCircle2 } from "lucide-react";

import { apiClient } from "@/lib/api";

const RiskGauge = ({ percentage, riskLevel }: { percentage: number, riskLevel: string }) => {
  const color = 
    percentage < 30 ? "#3b82f6" : // Sleek Blue (Safe)
    percentage < 70 ? "#8b5cf6" : // Sleek Purple (Caution)
    "#ef4444"; // Crimson (Danger)

  // Calculate Knob position based on 180 degree arc
  // Radius = 110, Center = (150, 140)
  const radius = 110;
  const cx = 150;
  const cy = 140;
  // Theta stretches from PI (left, 0%) to 0 (right, 100%)
  const theta = Math.PI - (percentage / 100) * Math.PI;
  const knobX = cx + radius * Math.cos(theta);
  const knobY = cy - radius * Math.sin(theta);

  // DashArray for progress fill
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-full h-[220px] flex items-center justify-center pt-8 select-none">
      <svg viewBox="0 0 300 160" className="w-[80%] max-w-[300px] drop-shadow-xl overflow-visible">
        <defs>
          <filter id="knobGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Thick Background Track */}
        <path 
          d={`M ${cx - radius},${cy} A ${radius} ${radius} 0 0 1 ${cx + radius},${cy}`} 
          fill="none" 
          stroke="var(--color-surface-container-high)" 
          strokeWidth="20" 
          strokeLinecap="round" 
        />

        {/* Progress Fill (1.5px less thickness) */}
        <motion.path 
          d={`M ${cx - radius},${cy} A ${radius} ${radius} 0 0 1 ${cx + radius},${cy}`} 
          fill="none" 
          stroke={color} 
          strokeWidth="16.5" 
          strokeLinecap="round" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Indicator Knob Ring */}
        <motion.circle 
          initial={{ cx: cx - radius, cy: cy }}
          animate={{ cx: knobX, cy: knobY }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          r="8" 
          fill={color} 
          stroke="var(--color-surface-glass)" 
          strokeWidth="4" 
          filter="url(#knobGlow)"
        />
        
        {/* Subtle inner core of knob */}
        <motion.circle 
          initial={{ cx: cx - radius, cy: cy }}
          animate={{ cx: knobX, cy: knobY }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          r="2.5" 
          fill="white" 
        />
      </svg>
      
      {/* Centered Typography exactly filling the hollow arc */}
      <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center pointer-events-none">
        <motion.span 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-black tracking-tighter leading-none text-text-primary" 
        >
          {percentage}%
        </motion.span>
        <span className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-60 mt-2" style={{ color }}>
          {riskLevel || "Risk Index"}
        </span>
      </div>
    </div>
  );
};

const MEDICINE_PHASES = [
  "Parsing pharmaceutical agents...",
  "Cross-referencing drug database...",
  "Mapping metabolic pathways...",
  "Analyzing enzyme inhibition...",
  "Calculating interaction index...",
  "Generating risk profile...",
];

// Helper to convert LLM hallucinated objects into clean human-readable text
const safeFormatItem = (item: any): string => {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    if (item.name) return `${safeFormatItem(item.name)}${item.role ? ` (${item.role})` : ''}${item.dosage ? ` [${item.dosage}]` : ''}`;
    if (item.description) return item.description;
    if (item.text) return item.text;
    if (item.step) return item.step;
    // Special case for the {step1, description} hallucination
    const keys = Object.keys(item);
    if (keys.length > 0 && typeof item[keys[0]] === 'string') {
      return Object.values(item).filter(v => typeof v === 'string').join(": ");
    }
    return "Clinical Detail";
  }
  return String(item);
};

export default function MedicinePage() {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) { setLoadingPhase(0); return; }
    const interval = setInterval(() => setLoadingPhase(p => (p + 1) % MEDICINE_PHASES.length), 2000);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setHasResult(false);
    setResultData(null);
    try {
      const data = await apiClient.post('/medicine/check', {
        primaryMedicine: med1,
        secondaryMedicine: med2
      });
      // Mocking percentage if not provided by backend for the gauge
      const riskMap: Record<string, number> = { "Low": 15, "Moderate": 45, "High": 82, "Critical": 100 };
      setResultData({
        ...data,
        riskPercentage: riskMap[data.riskLevel] || 0
      });
      setHasResult(true);
    } catch (err: any) {
      setError(err.message || "Compatibility check failed");
      setHasResult(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col pt-4 px-6 pb-6 absolute inset-0">
      <div className="flex flex-col mb-6 mt-2 z-20 shrink-0">
        <h1 className="text-3xl font-sans font-black text-text-primary tracking-tight">Medicine Compatibility Engine</h1>
        <p className="text-text-secondary mt-1 font-medium">Test multi-agent pharmacological interactions against your physiological baseline.</p>
      </div>

      <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 z-20 overflow-y-auto hide-scrollbar">
        
        {/* Input Phase Layout */}
        <div className="flex-1 flex flex-col gap-6">
           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-sm rounded-[32px] p-6 flex flex-col min-h-[400px]">
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2"><GitCompare size={18} className="text-primary"/> Define Agents</h3>
              
              <div className="flex flex-col gap-3 flex-1 lg:mt-6">
                 
                 <div className="relative z-10 flex flex-col bg-surface-low px-5 py-4 rounded-2xl border border-surface-container shadow-sm">
                    <label className="text-xs font-black uppercase text-text-primary tracking-widest mb-2 block">Primary Medicine</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Aspirin, 500mg" 
                      value={med1}
                      onChange={(e) => setMed1(e.target.value)}
                      className="w-full bg-surface-low border border-surface-container-high rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-shadow" 
                    />
                 </div>

                 <div className="relative z-10 flex flex-col bg-surface-low px-5 py-4 rounded-2xl border border-surface-container shadow-sm">
                    <label className="text-xs font-black uppercase text-text-primary tracking-widest mb-2 block">Secondary Medicine</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Warfarin, 5mg" 
                      value={med2}
                      onChange={(e) => setMed2(e.target.value)}
                      className="w-full bg-surface-low border border-surface-container-high rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-shadow" 
                    />
                 </div>
              </div>
           </div>

           <button 
             onClick={handleAnalyze}
             disabled={isAnalyzing || !med1 || !med2}
             className="w-full py-4 bg-primary text-white rounded-[24px] font-black shadow-md hover:bg-primary-hover hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
           >
             {isAnalyzing ? (
               <span className="flex items-center gap-2">
                 <Activity size={20} className="animate-spin" />
                 <AnimatePresence mode="wait">
                   <motion.span key={loadingPhase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                     {MEDICINE_PHASES[loadingPhase]}
                   </motion.span>
                 </AnimatePresence>
               </span>
             ) : "Analyze Collision"}
           </button>
        </div>

        {/* Dynamic Risk Overlay Phase */}
        <div className="flex-1 flex flex-col h-full min-h-[500px]">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-surface-glass border border-red-500/20 shadow-inner rounded-[32px] flex items-center justify-center p-8 text-center flex-col opacity-90 backdrop-blur-xl">
                 <AlertTriangle size={48} className="text-red-500 mb-4" />
                 <h3 className="font-bold text-lg text-text-primary">Collision Engine Fault</h3>
                 <p className="text-sm text-text-secondary max-w-sm mt-2">{error}</p>
                 <button onClick={() => { setError(null); setHasResult(false); }} className="mt-6 px-6 py-2 bg-red-500/10 text-red-500 font-bold rounded-lg hover:bg-red-500/20 transition-colors">Dismiss</button>
              </motion.div>
            ) : !hasResult ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-surface-low border border-surface-container shadow-inner rounded-[32px] flex items-center justify-center p-8 text-center flex-col opacity-70">
                 <Pill size={48} className="text-text-secondary/30 mb-4" />
                 <h3 className="font-bold text-lg text-text-primary">Awaiting Agents</h3>
                 <p className="text-sm text-text-secondary max-w-sm mt-2">Enter two distinct pharmaceutical agents to visualize physiological hazard predictions.</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-md rounded-[32px] flex flex-col overflow-y-auto hide-scrollbar p-6">
                 
                 <div className={`flex flex-col items-center justify-center p-12 ${resultData?.dangerDetected ? 'bg-accent-crimson/5 border-accent-crimson/20' : 'bg-green-600/5 border-green-600/20'} border rounded-[40px] mb-8 relative overflow-visible min-h-[300px]`}>
                    <RiskGauge riskLevel={resultData?.riskLevel || "Low"} percentage={resultData?.riskPercentage || 0} />
                    
                    <div className="flex flex-col items-center text-center mt-6">
                       <h2 className={`text-3xl font-black ${resultData?.dangerDetected ? 'text-accent-crimson' : 'text-green-600'} uppercase tracking-tight`}>
                         {typeof resultData?.riskLevel === 'string' ? resultData.riskLevel : (resultData?.riskLevel ? JSON.stringify(resultData.riskLevel) : 'UNKNOWN')} RISK PROFILE
                       </h2>
                       <p className="text-sm font-bold text-text-primary mt-2 opacity-80 uppercase tracking-widest">
                         {typeof resultData?.compatibilityVerdict === 'string' ? resultData.compatibilityVerdict : (resultData?.compatibilityVerdict ? JSON.stringify(resultData.compatibilityVerdict) : '')}
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-col gap-6">

                      {/* Active Ingredient Causing Risk */}
                     {resultData?.interactionCause && (
                       <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 shadow-sm shadow-amber-500/5">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-500/20 p-2 rounded-xl">
                              <AlertTriangle size={20} className="text-amber-400"/>
                            </div>
                            <div>
                              <h4 className="font-bold text-amber-400 text-base leading-tight">Critical Risk Analysis</h4>
                              <p className="text-amber-400/60 text-xs font-medium uppercase tracking-widest mt-0.5">Primary Risk Ingredients</p>
                            </div>
                         </div>
                         <div className="text-sm text-text-secondary leading-relaxed font-medium bg-black/20 p-4 rounded-2xl border border-white/5">
                           {typeof resultData.interactionCause === 'string' ? resultData.interactionCause : safeFormatItem(resultData.interactionCause)}
                         </div>
                       </div>
                     )}

                     <div className="mt-2">
                       <h4 className="font-bold text-text-primary mb-2 text-sm uppercase tracking-wider">Metabolic Reaction Profile</h4>
                       <div className="text-sm text-text-secondary leading-relaxed bg-surface-low p-4 rounded-xl border border-surface-container">
                         {typeof resultData?.explanation === 'string' ? (
                           <p>{resultData.explanation}</p>
                         ) : Array.isArray(resultData?.explanation) ? (
                           <ul className="list-decimal pl-4 space-y-2">
                             {resultData.explanation.map((step: any, idx: number) => (
                               <li key={idx} className="marker:text-primary/50">
                                 {safeFormatItem(step)}
                               </li>
                             ))}
                           </ul>
                         ) : (
                           <p>{resultData?.explanation ? safeFormatItem(resultData.explanation) : "Awaiting neural explanation."}</p>
                         )}
                       </div>
                     </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-surface-low border border-surface-container rounded-2xl p-4 shadow-sm">
                         <h5 className="text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Primary Components</h5>
                          <span className="text-sm font-bold block mb-2">{med1}</span>
                           <div className="flex flex-wrap gap-1.5">
                             {Array.isArray(resultData?.ingredients1) ? (
                               resultData.ingredients1.map((ing: any, i: number) => (
                                 <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold border border-primary/20">
                                   {safeFormatItem(ing)}
                                 </span>
                               ))
                             ) : (
                               <span className="text-xs text-text-secondary italic">Details unavailable</span>
                             )}
                           </div>
                        </div>
                        <div className="bg-surface-low border border-surface-container rounded-2xl p-4 shadow-sm">
                          <h5 className="text-[10px] uppercase font-black tracking-widest text-text-secondary mb-2">Secondary Components</h5>
                          <span className="text-sm font-bold block mb-2">{med2}</span>
                           <div className="flex flex-wrap gap-1.5">
                             {Array.isArray(resultData?.ingredients2) ? (
                               resultData.ingredients2.map((ing: any, i: number) => (
                                 <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold border border-primary/20">
                                   {safeFormatItem(ing)}
                                 </span>
                               ))
                             ) : (
                               <span className="text-xs text-text-secondary italic">Details unavailable</span>
                             )}
                           </div>
                        </div>
                    </div>

                     <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                        <h4 className="flex items-center gap-2 font-bold text-blue-400 text-sm mb-2"><CheckCircle2 size={16}/> Safer Alternatives & Warnings</h4>
                        <ul className="text-sm font-medium text-text-secondary list-disc pl-4 flex flex-col gap-2">
                           {(Array.isArray(resultData?.safeAlternatives) ? resultData.safeAlternatives : []).map((alt: any, i: number) => (
                             <li key={`alt-${i}`}><strong className="text-text-primary">Alt:</strong> {safeFormatItem(alt)}</li>
                           ))}
                           {(Array.isArray(resultData?.warnings) ? resultData.warnings : []).map((warn: any, i: number) => (
                             <li key={`warn-${i}`} className="text-rose-400"><strong>Warning:</strong> {safeFormatItem(warn)}</li>
                           ))}
                        </ul>
                     </div>
                 </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
