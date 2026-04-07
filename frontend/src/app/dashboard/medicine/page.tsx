"use client";

import React, { useState } from "react";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { Pill, Search, ShieldCheck, AlertCircle, Info, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function MedicinePage() {
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [neuralPulse, setNeuralPulse] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!primary || !secondary) {
      setError("Both pharmaceutical agents are required for collision analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await apiClient.post("/medicine/check", {
        primaryMedicine: primary,
        secondaryMedicine: secondary,
      });
      setResult(data);
      setNeuralPulse(data.neuralPulse);
    } catch (err: any) {
      setError(err.message || "Collision engine synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureShell 
      title="Medicine Interaction" 
      subtitle="Neural Collision Matrix" 
      icon={<Pill size={24} />}
      neuralPulse={neuralPulse}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
        
        {/* Left: Input Panel */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-glass backdrop-blur-3xl rounded-[32px] border border-border-glass p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 opacity-80">
              Agent Synchronization
            </h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-text-secondary ml-1">Primary Agent</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  placeholder="e.g. Lisinopril"
                  className="w-full bg-surface-low/50 border border-border-glass rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-text-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-text-secondary ml-1">Secondary Agent</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                  placeholder="e.g. Ibuprofen"
                  className="w-full bg-surface-low/50 border border-border-glass rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-text-primary"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-accent-crimson/5 border border-accent-crimson/10 rounded-2xl text-[11px] font-bold text-accent-crimson animate-shake">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button 
              onClick={handleCheck}
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Run Collision Check <ShieldCheck size={18} /></>
              )}
            </button>
          </div>

          {/* Guidelines Box */}
          <div className="p-6 rounded-[28px] bg-primary/5 border border-primary/10 flex gap-4">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <Info size={18} />
             </div>
             <p className="text-[11px] font-semibold text-text-secondary leading-relaxed">
               Neural matrix identifies potential biochemical interference by analyzing hepatic and renal excretion pathways. 
               Always consult a professional for critical clinical decisions.
             </p>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="xl:col-span-7 h-full min-h-[400px]">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-surface-low/20 border border-dashed border-border-glass rounded-[40px] flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center mb-6 text-text-secondary/20">
                  <Pill size={40} />
                </div>
                <h4 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] mb-2">Awaiting Synchronization</h4>
                <p className="text-xs font-semibold text-text-secondary/60 max-w-xs">Enter two pharmaceutical markers to begin biological interference analysis.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="h-full flex flex-col gap-6"
              >
                {/* Result Card */}
                <div className="bg-surface-glass backdrop-blur-3xl rounded-[40px] border border-border-glass p-10 shadow-float overflow-hidden relative group">
                  
                  {/* Status Banner */}
                  <div className={`absolute top-0 right-0 px-8 py-3 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest text-white ${result.riskLevel === 'Low' ? 'bg-green-600' : 'bg-accent-crimson'}`}>
                    Risk: {result.riskLevel}
                  </div>

                  <div className="flex items-center gap-6 mb-10">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg ${result.dangerDetected ? 'bg-accent-crimson/10 text-accent-crimson' : 'bg-green-600/10 text-green-600'}`}>
                      {result.dangerDetected ? <AlertCircle size={32} /> : <ShieldCheck size={32} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-black text-text-primary tracking-tight leading-none mb-2">
                        {result.compatibilityVerdict}
                      </h3>
                      <p className="text-[10px] font-black text-text-secondary tracking-[0.05em] leading-relaxed max-w-xl">{result.interactionCause}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                         Clinical Rationale
                       </h5>
                       <p className="text-sm font-semibold text-text-secondary leading-relaxed">
                         {result.explanation}
                       </p>
                    </div>
                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                         Clinical Advice
                       </h5>
                       <p className="text-sm font-semibold text-text-secondary leading-relaxed">
                         {result.patientAdvice}
                       </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-[24px] bg-surface-low/50 border border-border-glass">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Molecular Profile</span>
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">{result.metabolicPathway}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-5 rounded-2xl bg-surface-glass border border-border-glass">
                          <div className="text-[9px] font-black mb-2 opacity-40 uppercase tracking-widest">Marker A: Primary Agent</div>
                          <div className="text-sm font-black text-text-primary mb-4">{result.techIngredients1.active}</div>
                          
                          <div className="grid grid-cols-1 gap-3 pt-3 border-t border-border-glass/50">
                             <div>
                                <span className="text-[8px] font-black text-primary uppercase tracking-tighter block mb-0.5">Binders & Excipients</span>
                                <p className="text-[10px] font-semibold text-text-secondary leading-tight">{result.techIngredients1.inactive?.binders || "Standard Matrix"}</p>
                             </div>
                             <div className="flex gap-4">
                                <div className="flex-1">
                                   <span className="text-[8px] font-black text-primary uppercase tracking-tighter block mb-0.5">Coating</span>
                                   <p className="text-[10px] font-semibold text-text-secondary leading-tight">{result.techIngredients1.inactive?.coatings || "None"}</p>
                                </div>
                                <div className="flex-1">
                                   <span className="text-[8px] font-black text-primary uppercase tracking-tighter block mb-0.5">Additives</span>
                                   <p className="text-[10px] font-semibold text-text-secondary leading-tight">{result.techIngredients1.inactive?.additives || "None"}</p>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="p-5 rounded-2xl bg-surface-glass border border-border-glass">
                          <div className="text-[9px] font-black mb-2 opacity-40 uppercase tracking-widest">Marker B: Secondary Agent</div>
                          <div className="text-sm font-black text-text-primary mb-4">{result.techIngredients2.active}</div>
                          
                          <div className="grid grid-cols-1 gap-3 pt-3 border-t border-border-glass/50">
                             <div>
                                <span className="text-[8px] font-black text-primary uppercase tracking-tighter block mb-0.5">Binders & Excipients</span>
                                <p className="text-[10px] font-semibold text-text-secondary leading-tight">{result.techIngredients2.inactive?.binders || "Standard Matrix"}</p>
                             </div>
                             <div className="flex gap-4">
                                <div className="flex-1">
                                   <span className="text-[8px] font-black text-primary uppercase tracking-tighter block mb-0.5">Coating</span>
                                   <p className="text-[10px] font-semibold text-text-secondary leading-tight">{result.techIngredients2.inactive?.coatings || "None"}</p>
                                </div>
                                <div className="flex-1">
                                   <span className="text-[8px] font-black text-primary uppercase tracking-tighter block mb-0.5">Additives</span>
                                   <p className="text-[10px] font-semibold text-text-secondary leading-tight">{result.techIngredients2.inactive?.additives || "None"}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Alternatives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[28px] p-6">
                      <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Safe Synergy Alt</h4>
                      <div className="flex flex-col gap-2">
                        {result.safeAlternatives.map((alt: string) => (
                           <div key={alt} className="flex items-center justify-between p-3 rounded-xl bg-green-600/5 text-green-600 border border-green-600/10 text-[11px] font-bold">
                               {alt}
                           </div>
                        ))}
                      </div>
                   </div>
                   <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[28px] p-6">
                      <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Critical Markers</h4>
                      <div className="flex flex-col gap-2">
                        {result.warnings.map((warn: string) => (
                           <div key={warn} className="flex items-center gap-3 p-3 rounded-xl bg-orange-600/5 text-orange-600 border border-orange-600/10 text-[11px] font-bold">
                              <AlertCircle size={14} />
                              {warn}
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FeatureShell>
  );
}
