"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Search, Mic, Activity, AlertTriangle, ShieldCheck, X } from "lucide-react";

const allSymptoms = ["Headache", "Nausea", "Fever", "Fatigue", "Cough", "Chest Pain", "Dizziness", "Shortness of breath", "Muscle ache"];

import { apiClient } from "@/lib/api";

const SYMPTOM_PHASES = [
  "Initializing neural core...",
  "Parsing symptom matrix...",
  "Accessing medical baseline...",
  "Executing deep reasoning...",
  "Cross-referencing clinical data...",
  "Evaluating risk thresholds...",
  "Finalizing diagnostic matrix...",
];

export default function SymptomsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [naturalText, setNaturalText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) { setLoadingPhase(0); return; }
    const interval = setInterval(() => setLoadingPhase(p => (p + 1) % SYMPTOM_PHASES.length), 2000);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const toggleSymptom = (sym: string) => {
    if (selected.includes(sym)) setSelected(selected.filter(s => s !== sym));
    else setSelected([...selected, sym]);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await apiClient.post('/symptoms/analyze', {
        activeSymptoms: selected,
        customSymptom: naturalText
      });
      setResultData(data);
      setHasResult(true);
    } catch (err: any) {
      setError(err.message || "Failed to analyze symptoms");
      setHasResult(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col pt-4 px-6 pb-6 absolute inset-0">
      <div className="flex flex-col mb-6 mt-2 z-20 shrink-0">
        <h1 className="text-3xl font-sans font-black text-text-primary tracking-tight">Symptom Analyzer</h1>
        <p className="text-text-secondary mt-1 font-medium">Map current physiological distress variables to our diagnostic matrix.</p>
      </div>

      <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 z-20 overflow-y-auto hide-scrollbar">
        
        {/* Left Input Area */}
        <div className="flex-1 flex flex-col gap-6">
           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-sm rounded-[32px] p-6 flex flex-col">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><Search size={18} className="text-primary"/> Select Markers</h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input 
                  type="text" 
                  placeholder="Search symptoms..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-glass border border-border-glass rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-text-secondary/50" 
                />
              </div>

              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selected.map(sym => (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={sym} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm">
                      {sym}
                      <button onClick={() => toggleSymptom(sym)} className="hover:text-primary-hover transition-colors"><X size={12} /></button>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                 {allSymptoms.filter(s => s.toLowerCase().includes(search.toLowerCase()) && !selected.includes(s)).map(sym => (
                   <button 
                     key={sym} 
                     onClick={() => toggleSymptom(sym)}
                     className="px-3 py-1.5 bg-surface-glass border border-border-glass hover:border-primary text-text-secondary hover:text-primary text-xs font-bold rounded-lg transition-colors cursor-pointer backdrop-blur-sm"
                   >
                     + {sym}
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-sm rounded-[32px] p-6 flex flex-col">
              <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2"><Mic size={18} className="text-primary"/> Natural Input</h3>
              <p className="text-xs text-text-secondary mb-4">Describe how you're feeling in your own words.</p>
              <textarea 
                rows={4} 
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="Example: I have a headache, body pain, mild fever, and feel weak today."
                className="w-full bg-surface-glass border border-border-glass rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-text-primary placeholder:text-text-secondary/50"
              />
           </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (selected.length === 0 && naturalText.length === 0)}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-md hover:bg-primary-hover hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isAnalyzing ? (
                <span className="flex flex-col items-center">
                  <span className="flex items-center gap-2">
                    <Activity size={18} className="animate-spin" />
                    <AnimatePresence mode="wait">
                      <motion.span key={loadingPhase} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.3 }}>
                        {SYMPTOM_PHASES[loadingPhase]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="text-[10px] opacity-60 mt-1 font-bold uppercase tracking-widest">Harnessing Groq & Gemini Core</span>
                </span>
              ) : "Run Diagnostic Analysis"}
            </button>
        </div>

        {/* Right Restuls Area Placeholder */}
        <div className="flex-1 flex flex-col h-full min-h-[500px]">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-surface-glass border border-red-500/20 shadow-inner rounded-[32px] flex items-center justify-center p-8 text-center flex-col opacity-90 backdrop-blur-xl">
                 <AlertTriangle size={48} className="text-red-500 mb-4" />
                 <h3 className="font-bold text-lg text-text-primary">Neural Analysis Fault</h3>
                 <p className="text-sm text-text-secondary max-w-sm mt-2">{error}</p>
                 <button onClick={() => setError(null)} className="mt-6 px-6 py-2 bg-red-500/10 text-red-500 font-bold rounded-lg hover:bg-red-500/20 transition-colors">Dismiss</button>
              </motion.div>
            ) : !hasResult ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-surface-glass border border-border-glass shadow-inner rounded-[32px] flex items-center justify-center p-8 text-center flex-col opacity-70 backdrop-blur-xl">
                 <Stethoscope size={48} className="text-text-secondary/30 mb-4" />
                 <h3 className="font-bold text-lg text-text-primary">Awaiting Input Vectors</h3>
                 <p className="text-sm text-text-secondary max-w-sm mt-2">Log your parameters on the left to generate predictive probabilities and clinical suggestions.</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full h-full bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-md rounded-[32px] flex flex-col overflow-y-auto hide-scrollbar p-6">
                 
                 <div className="flex justify-between items-center bg-accent-crimson/10 border border-accent-crimson/20 p-4 rounded-2xl mb-6">
                   <div className="flex items-center gap-3">
                     <AlertTriangle className="text-accent-crimson" size={24} />
                     <div>
                       <h4 className="text-sm font-black text-accent-crimson uppercase tracking-wider">Analysis Complete</h4>
                       <p className="text-xs font-bold text-text-primary">Based on provided markers & profile</p>
                     </div>
                   </div>
                 </div>

                 {/* Results List */}
                 <h3 className="font-bold text-lg text-text-primary mb-3">Predicted Correlations</h3>
                 
                 <div className="flex flex-col gap-3 mb-8">
                   {resultData?.probabilityMatrix?.map((item: any, i: number) => (
                      <div key={i} className="bg-surface-glass border border-border-glass rounded-2xl p-4 flex justify-between items-center shadow-sm backdrop-blur-md">
                        <div>
                          <h4 className="font-bold text-text-primary">
                            {typeof item.name === 'string' ? item.name : (item.name?.name || JSON.stringify(item.name))}
                          </h4>
                          <p className={`text-xs mt-1 ${item.severity === 'High' || item.severity === 'Critical' ? 'text-accent-crimson font-bold' : 'text-text-secondary'}`}>
                             Severity: {typeof item.severity === 'string' ? item.severity : JSON.stringify(item.severity)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-primary">{typeof item.confidence === 'number' || typeof item.confidence === 'string' ? item.confidence : 0}%</span>
                          <span className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Confidence</span>
                        </div>
                     </div>
                   ))}
                 </div>

                 {/* Recommendations */}
                 <h3 className="font-bold text-lg text-text-primary mb-3">Actionable Therapeutics</h3>
                 
                 {resultData?.summaryText && (
                    <p className="text-sm text-text-secondary mb-4 bg-surface-glass border border-border-glass p-3 rounded-lg">
                     {resultData.summaryText}
                   </p>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-glass border border-border-glass rounded-2xl p-4 backdrop-blur-sm">
                       <h4 className="text-xs font-black uppercase text-blue-600 tracking-wider mb-2">Allopathy</h4>
                       <ul className="text-sm font-medium text-text-primary list-disc pl-4 flex flex-col gap-1">
                          {resultData?.treatmentPathways?.allopathy?.map((med: any, i: number) => (
                            <li key={i}>{typeof med === 'string' ? med : (med.name ? `${med.name} ${med.role ? `(${med.role})` : ''}` : JSON.stringify(med))}</li>
                          )) || <li className="text-text-secondary/50">None specific</li>}
                       </ul>
                    </div>
                    <div className="bg-surface-glass border border-border-glass rounded-2xl p-4 backdrop-blur-sm">
                       <h4 className="text-xs font-black uppercase text-green-600 tracking-wider mb-2">Immediate Home Care</h4>
                       <ul className="text-sm font-medium text-text-primary list-disc pl-4 flex flex-col gap-1">
                          {resultData?.treatmentPathways?.homeRemedies?.map((rem: any, i: number) => (
                            <li key={i}>{typeof rem === 'string' ? rem : (rem.name ? `${rem.name} ${rem.role ? `(${rem.role})` : ''}` : JSON.stringify(rem))}</li>
                          )) || <li className="text-text-secondary/50">Rest, hydration, and monitoring.</li>}
                       </ul>
                    </div>
                    <div className="bg-surface-glass border border-border-glass rounded-2xl p-4 backdrop-blur-sm">
                       <h4 className="text-xs font-black uppercase text-purple-500 tracking-wider mb-2">Homeopathy</h4>
                       <ul className="text-sm font-medium text-text-primary list-disc pl-4 flex flex-col gap-1">
                          {resultData?.treatmentPathways?.homeopathic?.map((rem: any, i: number) => (
                            <li key={i}>{typeof rem === 'string' ? rem : (rem.name ? `${rem.name} ${rem.role ? `(${rem.role})` : ''}` : JSON.stringify(rem))}</li>
                          )) || <li className="text-text-secondary/50">None specific</li>}
                       </ul>
                    </div>
                 </div>

                 <div className="mt-8 p-3 bg-surface-glass border border-border-glass rounded-xl flex gap-3 text-text-secondary text-xs backdrop-blur-sm">
                    <ShieldCheck size={16} className="shrink-0 text-text-secondary/70" />
                    <p className="italic font-medium leading-relaxed">Disclaimer: This is predictive neural intelligence, not formal medical advice. If your fever exceeds 103°F (39.5°C), visit central infrastructure immediately.</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
