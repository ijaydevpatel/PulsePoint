"use client";

import React, { useState, useRef } from "react";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, Info, ChevronRight, FileSearch, Trash2, Microscope } from "lucide-react";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [neuralPulse, setNeuralPulse] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a diagnostic report (PDF/Image) for synchronization.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("reportFile", file);

    try {
      const data = await apiClient.post("/reports/analyze", formData);
      setResult(data);
      setNeuralPulse(data.neuralPulse);
    } catch (err: any) {
      setError(err.message || "Vision core synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setNeuralPulse(null);
    setError("");
  };

  return (
    <FeatureShell 
      title="Report Analyzer" 
      subtitle="Neural Vision Core" 
      icon={<FileSearch size={24} />}
      neuralPulse={neuralPulse}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full min-h-[600px]">
        
        {/* Left: Upload Panel */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-glass backdrop-blur-3xl rounded-[32px] border border-border-glass p-8 shadow-sm flex flex-col gap-8 h-full">
            
            <div className="flex items-center justify-between">
               <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-80 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                 Document Ingestion
               </h3>
            </div>

            {/* Stage Info: Dual-Core Automation */}
            <div className="bg-surface-low rounded-2xl p-4 border border-border-glass flex items-center gap-4">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Microscope size={16} />
               </div>
               <div>
                  <h5 className="text-[10px] font-black text-text-primary uppercase tracking-widest">Dual-Stage Synchronization</h5>
                  <p className="text-[9px] font-bold text-text-secondary opacity-60">Gemini 2.5 (Extraction) → Gemini 3 (Synthesis)</p>
               </div>
            </div>

            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-[300px] border-2 border-dashed border-border-glass rounded-[40px] flex flex-col items-center justify-center text-center p-10 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center mb-6 text-text-secondary/20 group-hover:scale-110 transition-transform">
                  <Upload size={40} />
                </div>
                <h4 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] mb-2 leading-none">Drop Report Here</h4>
                <p className="text-xs font-semibold text-text-secondary/60 max-w-[200px]">PDF, PNG, or JPEG Diagnostic Documents</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            ) : (
              <div className="flex-1 min-h-[300px] bg-surface-low/30 border border-border-glass rounded-[40px] flex flex-col items-center justify-center p-10 relative overflow-hidden">
                 {/* Visual Artifacts */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 blur-sm" />
                
                 <div className="p-6 rounded-[32px] bg-surface-container-lowest border border-border-glass shadow-sm flex flex-col items-center gap-4 relative z-10 w-full max-w-[280px]">
                    <div className="w-16 h-20 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center text-primary relative overflow-hidden">
                       <FileText size={40} />
                       <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
                    </div>
                    <div className="text-center w-full">
                       <p className="text-sm font-black text-text-primary truncate mb-1">{file.name}</p>
                       <p className="text-[10px] font-bold text-text-secondary opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</p>
                    </div>
                    <button 
                      onClick={reset}
                      className="text-[10px] font-black text-accent-crimson uppercase tracking-widest hover:underline"
                    >
                      Remove Document
                    </button>
                 </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-accent-crimson/5 border border-accent-crimson/10 rounded-2xl text-[11px] font-bold text-accent-crimson">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button 
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-[11px] tracking-widest shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <Loader2 size={18} className="animate-spin" />
                   Dual-Stage Extraction & Synthesis In Progress...
                </div>
              ) : (
                <>Run Dual-Core Neural Analysis <Microscope size={18} /></>
              )}
            </button>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="xl:col-span-7 h-full min-h-[500px]">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-surface-low/20 border border-dashed border-border-glass rounded-[40px] flex flex-col items-center justify-center text-center p-12 overflow-hidden"
              >
                <div className="w-24 h-24 rounded-[32px] border border-dashed border-primary/20 rotate-12 flex items-center justify-center mb-8">
                  <div className="-rotate-12 text-primary/20">
                    <FileText size={48} />
                  </div>
                </div>
                <h4 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] mb-2 leading-none">Diagnostic Interface Standby</h4>
                <p className="text-xs font-semibold text-text-secondary/60 max-w-xs">Upload medical documentation to begin morphological extraction and synthesis.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Result Card */}
                <div className="bg-surface-glass backdrop-blur-3xl rounded-[40px] border border-border-glass p-10 shadow-float relative overflow-hidden">
                  
                   {/* Background Glow */}
                   <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
                  
                   <div className="relative z-10 space-y-10">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-green-600/10 flex items-center justify-center text-green-600 shadow-sm border border-green-600/20">
                               <CheckCircle2 size={32} />
                            </div>
                            <div>
                               <h3 className="text-2xl font-display font-black text-text-primary tracking-tight leading-none mb-2">Analysis Synchronized</h3>
                               <p className="text-[10px] font-black text-text-secondary tracking-[0.2em]">{result.documentType}</p>
                            </div>
                         </div>
                         <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${result.riskLevel === 'Low' ? 'bg-green-600/10 text-green-600' : 'bg-accent-crimson text-white'}`}>
                            Risk: {result.riskLevel}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-border-glass" />
                            <span className="text-[10px] font-black text-primary tracking-widest">Morphological Findings</span>
                            <div className="h-px flex-1 bg-border-glass" />
                         </div>
                         <p className="text-sm md:text-base font-semibold text-text-primary leading-relaxed text-center px-4">
                           {result.findings}
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 rounded-[28px] bg-surface-low border border-border-glass">
                            <h5 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                               <div className="w-1 h-1 rounded-full bg-primary" />
                               Markers Detected
                            </h5>
                            <div className="flex flex-wrap gap-2">
                               {result.abnormalMarkers.map((m: string, i: number) => (
                                  <span key={i} className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-[11px] font-black text-primary">
                                     {m}
                                  </span>
                               ))}
                            </div>
                         </div>
                         <div className="p-6 rounded-[28px] bg-surface-low border border-border-glass">
                            <h5 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                               <div className="w-1 h-1 rounded-full bg-primary" />
                               Health Implication
                            </h5>
                            <p className="text-[11px] font-bold text-text-primary leading-relaxed">{result.implications}</p>
                         </div>
                      </div>

                      <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 relative group">
                         <div className="absolute top-4 right-4 text-primary opacity-20 group-hover:opacity-100 transition-opacity">
                            <Info size={16} />
                         </div>
                         <h5 className="text-[10px] font-black text-primary tracking-[0.3em] mb-4">Neural Recovery Plan</h5>
                         <p className="text-xs font-semibold text-text-secondary leading-relaxed whitespace-pre-line">
                            {result.advice}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="bg-surface-glass border border-border-glass rounded-[32px] p-6 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-text-secondary/40">
                         <FileText size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-text-primary uppercase tracking-widest">Document Record Active</p>
                         <p className="text-[8px] font-bold text-text-secondary uppercase tracking-tighter opacity-60">Synchronized with biological cloud profile</p>
                      </div>
                   </div>
                   <button 
                    onClick={reset}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-crimson/5 text-accent-crimson text-[10px] font-black uppercase tracking-widest hover:bg-accent-crimson/10 transition-colors"
                   >
                      <Trash2 size={14} /> Clear Analysis
                   </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FeatureShell>
  );
}
