"use client";

import React, { useState } from "react";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { Stethoscope, Plus, X, Search, Activity, HeartPulse, Brain, Zap, AlertTriangle, CheckCircle2, ChevronRight, Loader2, Thermometer, Droplets, Wind, Cloud, HelpCircle, Target } from "lucide-react";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const defaultSymptoms = [
  // Common / General
  { id: "fever", label: "Fever", icon: <Thermometer size={14} /> },
  { id: "cold", label: "Cold", icon: <Activity size={14} /> },
  { id: "cough", label: "Cough", icon: <HeartPulse size={14} /> },
  { id: "fatigue", label: "Fatigue", icon: <Zap size={14} /> },
  { id: "headache", label: "Headache", icon: <Brain size={14} /> },
  { id: "bodyache", label: "Body Ache", icon: <Activity size={14} /> },
  
  // Respiratory
  { id: "sorethroat", label: "Sore Throat", icon: <Cloud size={14} /> },
  { id: "congestion", label: "Congestion", icon: <Droplets size={14} /> },
  { id: "shortbreath", label: "Breathlessness", icon: <Wind size={14} /> },
  { id: "sneezing", label: "Sneezing", icon: <Activity size={14} /> },

  // Digestive
  { id: "gas", label: "Gas", icon: <Activity size={14} /> },
  { id: "acidity", label: "Acidity", icon: <Zap size={14} /> },
  { id: "nausea", label: "Nausea", icon: <Activity size={14} /> },
  { id: "stomachache", label: "Stomach Ache", icon: <Target size={14} /> },
  { id: "diarrhea", label: "Diarrhea", icon: <Activity size={14} /> },
  { id: "constipation", label: "Constipation", icon: <Activity size={14} /> },
  { id: "vomiting", label: "Vomiting", icon: <Activity size={14} /> },

  // Neurological / Pain
  { id: "dizziness", label: "Dizziness", icon: <Zap size={14} /> },
  { id: "jointpain", label: "Joint Pain", icon: <Plus size={14} /> },
  { id: "musclecramp", label: "Muscle Cramp", icon: <Activity size={14} /> },
  { id: "backpain", label: "Back Pain", icon: <Activity size={14} /> },
  
  // Others
  { id: "itching", label: "Itching", icon: <Plus size={14} /> },
  { id: "skinrash", label: "Skin Rash", icon: <Plus size={14} /> },
  { id: "insomnia", label: "Insomnia", icon: <Zap size={14} /> },
];

export default function SymptomsPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [neuralPulse, setNeuralPulse] = useState<any>(null);
  const [error, setError] = useState("");

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 && !customSymptom) {
      setError("Please select or describe at least one clinical marker.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await apiClient.post("/symptoms/analyze", {
        activeSymptoms: selectedSymptoms.map(s => defaultSymptoms.find(ds => ds.id === s)?.label || s),
        customSymptom: customSymptom,
      });
      setResult(data);
      setNeuralPulse(data.neuralPulse);
    } catch (err: any) {
      setError(err.message || "Diagnostic engine synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureShell 
      title="Symptom Analyzer" 
      subtitle="Neural Diagnostic Matrix" 
      icon={<Stethoscope size={24} />}
      neuralPulse={neuralPulse}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
        
        {/* Left: Triage Panel */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-glass backdrop-blur-3xl rounded-[32px] border border-border-glass p-8 shadow-sm flex flex-col gap-8">
            
            <div>
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 opacity-80 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Baseline Markers
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {defaultSymptoms.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSymptom(s.id)}
                    className={`flex items-center gap-1.5 p-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-tight min-w-0 ${
                      selectedSymptoms.includes(s.id)
                        ? "bg-primary text-white border-primary shadow-glow scale-102"
                        : "bg-surface-low/50 border-border-glass text-text-secondary hover:bg-surface-low hover:border-surface-container-high"
                    }`}
                  >
                    <div className={`shrink-0 ${selectedSymptoms.includes(s.id) ? "text-white" : "text-primary opacity-60"}`}>
                      {s.icon}
                    </div>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 opacity-80">
                Biological Observation
              </h3>
              <div className="relative group">
                <textarea 
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Describe your current state in detail..."
                  className="w-full bg-surface-low/50 border border-border-glass rounded-[24px] p-5 text-sm font-bold min-h-[120px] focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-text-primary placeholder:text-text-secondary/30 resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-accent-crimson/5 border border-accent-crimson/10 rounded-2xl text-[11px] font-bold text-accent-crimson animate-shake">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <Loader2 size={18} className="animate-spin" />
                   Synchronizing Neural Engine...
                </div>
              ) : (
                <>Initialize Diagnostic Pass <Activity size={18} /></>
              )}
            </button>
          </div>

          <div className="p-6 rounded-[28px] bg-primary/5 border border-primary/10 flex gap-4">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <HeartPulse size={18} />
             </div>
             <p className="text-[11px] font-semibold text-text-secondary leading-relaxed">
               Neural analyzer compares biological markers against recognized clinical patterns. Results are probabilistic based on demographic synergy.
             </p>
          </div>
        </div>

        {/* Right: Insights Panel */}
        <div className="xl:col-span-7 h-full min-h-[500px]">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-surface-low/20 border border-dashed border-border-glass rounded-[40px] flex flex-col items-center justify-center text-center p-12 overflow-hidden relative"
              >
                {/* Visual Placeholder Content */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border border-dashed border-primary/20 animate-spin-slow" />
                  <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                    <Zap size={40} />
                  </div>
                </div>
                <h4 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] mb-2 leading-none">Diagnostic Interface Standby</h4>
                <p className="text-xs font-semibold text-text-secondary/60 max-w-xs">Awaiting input stream to initialize neurological pattern matching.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Result Summary Card */}
                <div className="bg-surface-glass backdrop-blur-3xl rounded-[40px] border border-border-glass p-10 shadow-float relative overflow-hidden">
                  
                   {/* Background Glow */}
                   <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
                  
                   <div className="relative z-10 flex flex-col gap-8">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                               <CheckCircle2 size={24} />
                            </div>
                            <div>
                               <h3 className="text-xl font-display font-black text-text-primary tracking-tight">Handshake Successful</h3>
                               <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">Neural Diagnostic Summary</p>
                            </div>
                         </div>
                      </div>

                      <div className="p-6 rounded-[28px] bg-surface-low/40 border border-border-glass">
                         <p className="text-sm md:text-base font-semibold text-text-primary leading-relaxed italic">
                           "{result.summaryText}"
                         </p>
                      </div>

                      {/* Probability Matrix */}
                      <div>
                         <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                           Probability Matrix <div className="flex-1 h-px bg-primary/10" />
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.probabilityMatrix.map((item: any, idx: number) => (
                              <div key={idx} className="bg-surface-glass border border-border-glass p-5 rounded-[24px] flex flex-col gap-3 group hover:border-primary/30 transition-colors">
                                 <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-text-primary truncate pr-4">{item.name}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${item.severity === 'High' ? 'bg-accent-crimson text-white' : 'bg-primary/5 text-primary'}`}>
                                       {item.severity}
                                    </span>
                                 </div>
                                 <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1">
                                       <span>Confidence Level</span>
                                       <span>{item.confidence}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                                       <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.confidence}%` }}
                                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (idx * 0.1) }}
                                          className="h-full bg-primary"
                                       />
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-surface-glass backdrop-blur-3xl rounded-[40px] border border-border-glass p-8 shadow-sm">
                   <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                     Recommended Medicines <div className="flex-1 h-px bg-primary/10" />
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Pathway: Allopathy */}
                       <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 text-primary">
                             <Activity size={14} />
                             <span className="text-[11px] font-black uppercase tracking-widest">Allopathy</span>
                          </div>
                         <div className="flex flex-col gap-2">
                            {result.treatmentPathways.allopathy.map((item: string, i: number) => (
                               <div key={i} className="p-3 rounded-xl bg-surface-low border border-border-glass text-[11px] font-bold text-text-primary">
                                  {item}
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Pathway: Home Remedies */}
                       <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 text-green-600">
                             <HeartPulse size={14} />
                             <span className="text-[11px] font-black uppercase tracking-widest">Home Remedies</span>
                          </div>
                         <div className="flex flex-col gap-2">
                            {result.treatmentPathways.homeRemedies.map((item: string, i: number) => (
                               <div key={i} className="p-3 rounded-xl bg-green-600/5 border border-green-600/10 text-[11px] font-bold text-green-700">
                                  {item}
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Pathway: Homeopathic */}
                       <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 text-text-secondary">
                             <Zap size={14} />
                             <span className="text-[11px] font-black uppercase tracking-widest">Homeopathy</span>
                          </div>
                         <div className="flex flex-col gap-2">
                            {result.treatmentPathways.homeopathic.map((item: string, i: number) => (
                               <div key={i} className="p-3 rounded-xl bg-surface-low/30 border border-border-glass text-[11px] font-bold text-text-secondary">
                                  {item}
                               </div>
                            ))}
                         </div>
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
