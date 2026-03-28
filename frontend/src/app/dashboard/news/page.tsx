"use client";

import React from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";

export default function NewsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col pt-4 px-6 pb-6 absolute inset-0">
      <div className="flex flex-col mb-4 mt-2 z-20 shrink-0">
        <h1 className="text-3xl font-sans font-black text-text-primary tracking-tight">Curated Health Horizons</h1>
        <p className="text-text-secondary mt-1 font-medium">Global AI-curated medical research filtered for your profile.</p>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar z-20 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full">
           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-sm rounded-[32px] p-8 min-h-[250px] group hover:bg-surface-low transition-all cursor-pointer flex flex-col justify-end relative overflow-hidden">
             <div className="absolute top-6 left-6 px-3 py-1 bg-primary text-white text-[10px] uppercase font-black tracking-wider rounded-lg">Breakthrough</div>
             <h3 className="text-xl font-bold text-text-primary mb-2 w-3/4">FDA Approves New Neuro-Stimulant Matrix</h3>
             <p className="text-text-secondary text-sm line-clamp-2">Clinical trials demonstrate a 40% increased reaction to simulated neural node mapping...</p>
           </div>
           
           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-sm rounded-[32px] p-8 min-h-[250px] group hover:bg-surface-low transition-all cursor-pointer flex flex-col justify-end relative overflow-hidden">
             <div className="absolute top-6 left-6 px-3 py-1 bg-surface-container-high text-text-primary text-[10px] uppercase font-black tracking-wider rounded-lg">Dietary Study</div>
             <h3 className="text-xl font-bold text-text-primary mb-2 w-3/4">The Correlation Between Sleep and Core Metabolism</h3>
             <p className="text-text-secondary text-sm line-clamp-2">New long-term data sets suggest an immediate drop-off in baseline metabolism under 6 hours...</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
