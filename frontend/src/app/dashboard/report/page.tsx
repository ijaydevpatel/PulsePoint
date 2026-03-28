"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Activity } from "lucide-react";

import { apiClient } from "@/lib/api";

export default function ReportPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to safely render AI values (prevents object-as-child crashes)
  const safeRender = (val: any) => {
    if (!val) return "";
    if (typeof val === "object") return JSON.stringify(val).replace(/["{}]/g, ' ').replace(/[:,]/g, ': ');
    return val;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('reportFile', file);

    try {
      const data = await apiClient.post('/reports/analyze', formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Report upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col pt-4 px-6 pb-6 absolute inset-0">
      <div className="flex flex-col mb-4 mt-2 z-20 shrink-0">
        <h1 className="text-3xl font-sans font-black text-text-primary tracking-tight">Report Analyzer</h1>
        <p className="text-text-secondary mt-1 font-medium">Deep-scan PDF / Dicom data structures.</p>
      </div>

      {!result && !isUploading && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-sm rounded-[32px] p-8 flex flex-col items-center justify-center text-center z-20 hover:border-primary/40 transition-colors border-dashed border-2 cursor-pointer group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf" 
            onChange={handleFileChange} 
          />
           <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
              <FileText size={32} className="text-text-secondary group-hover:text-primary transition-colors" />
           </div>
           <h2 className="text-xl font-bold text-text-primary mb-2">Upload Medical File</h2>
           <p className="text-text-secondary text-sm max-w-md mb-6">Drag and drop imaging results, blood panels, or historical records. The engine extracts constraints instantly.</p>
           <button className="px-6 py-2 bg-surface-low text-text-primary font-bold rounded-xl border border-border-glass shadow-sm hover:bg-surface-container transition-colors flex items-center gap-2"><Download size={16}/> Select File</button>
           {error && <p className="mt-4 text-sm text-accent-crimson font-bold">{error}</p>}
        </div>
      )}

      {isUploading && (
          <div className="flex-1 bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-sm rounded-[32px] p-8 flex flex-col items-center justify-center text-center z-20">
             <Activity size={48} className="text-primary animate-spin mb-4" />
              <h2 className="text-xl font-bold text-text-primary mb-2">Analyzing Morphology...</h2>
              <p className="text-text-secondary text-sm">Vision Intelligence in progress</p>
         </div>
      )}

      {result && !isUploading && (
          <div className="flex-1 bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-md rounded-[32px] p-8 z-20 overflow-y-auto">
             <div className="flex justify-between items-start mb-6 border-b border-surface-container pb-4">
                 <div>
                    <h2 className="text-2xl font-black text-text-primary">{result.documentType}</h2>
                    <p className="text-sm font-bold text-primary mt-1">Analysis Complete</p>
                 </div>
                 <button onClick={() => setResult(null)} className="px-4 py-2 bg-surface-low text-text-primary text-sm font-bold rounded-xl border border-surface-container hover:bg-surface-container transition-colors">Analyze Another</button>
             </div>

              <div className="flex flex-col gap-6">
                 <div className="bg-surface-low border border-border-glass p-6 rounded-[32px] shadow-sm">
                    <h3 className="text-xs font-black uppercase text-text-secondary tracking-widest mb-3">Morphological Analysis</h3>
                    <p className="text-sm font-medium text-text-primary leading-relaxed">
                      {safeRender(result.findings)}
                    </p>
                 </div>
 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`${result.riskLevel === 'High' ? 'bg-accent-crimson/10 border-accent-crimson/30' : 'bg-amber-500/10 border-amber-500/30'} p-5 rounded-[24px] border border-dashed`}>
                       <h3 className={`text-xs font-black uppercase ${result.riskLevel === 'High' ? 'text-accent-crimson' : 'text-amber-500'} tracking-widest mb-3`}>Abnormal Markers</h3>
                       <ul className="space-y-2">
                         {result.abnormalMarkers?.length > 0 ? result.abnormalMarkers.map((marker: string, i: number) => (
                           <li key={i} className="text-sm font-bold text-text-primary flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${result.riskLevel === 'High' ? 'bg-accent-crimson' : 'bg-amber-500'}`} />
                             {marker}
                           </li>
                         )) : <li className="text-sm font-medium text-text-secondary italic">None detected</li>}
                       </ul>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 p-5 rounded-[24px]">
                       <h3 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-3">Health Implications</h3>
                       <p className="text-sm text-text-primary font-medium leading-relaxed">{result.implications}</p>
                    </div>
                 </div>
 
                 <div className="bg-primary/5 border border-primary/20 p-6 rounded-[32px]">
                    <h3 className="text-xs font-black uppercase text-primary tracking-widest mb-4">Neural Recovery Plan & Advice</h3>
                    <div className="text-sm text-text-primary font-medium leading-relaxed whitespace-pre-wrap">
                       {result.advice}
                    </div>
                 </div>
 
                 {result.originalExtractedText && (
                    <div className="mt-2 opacity-40 hover:opacity-100 transition-opacity">
                       <details className="text-[10px] text-text-secondary">
                          <summary className="cursor-pointer font-bold mb-2 uppercase tracking-tighter">Raw Visual Payload</summary>
                          <div className="bg-black/20 p-4 rounded-xl font-mono whitespace-pre-wrap mt-2 border border-white/5 max-h-40 overflow-y-auto">
                             {result.originalExtractedText}
                          </div>
                       </details>
                    </div>
                 )}
              </div>
         </div>
      )}
    </motion.div>
  );
}
