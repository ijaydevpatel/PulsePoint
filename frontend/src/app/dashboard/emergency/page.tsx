"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, MapPin } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function EmergencyPage() {
  const { profile } = useUser();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col pt-4 px-6 pb-6 absolute inset-0">
      <div className="flex flex-col mb-4 mt-2 z-20 shrink-0">
        <h1 className="text-3xl font-sans font-black text-accent-crimson tracking-tight flex items-center gap-3">
          <AlertTriangle strokeWidth={3} /> Emergency Override
        </h1>
        <p className="text-text-secondary mt-1 font-medium">Bypass neural analysis. Transmit immediate SOS packets.</p>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-6 relative z-20">
         <div className="flex-1 bg-surface-glass border border-border-glass shadow-sm rounded-[32px] p-10 flex flex-col items-center justify-center text-center backdrop-blur-xl">
            <button className="w-48 h-48 bg-gradient-to-br from-[#E11D48] to-[#9F1239] hover:from-[#BE123C] hover:to-[#881337] rounded-full shadow-[0_8px_32px_rgba(225,29,72,0.4)] hover:shadow-[0_12px_48px_rgba(225,29,72,0.6)] active:scale-95 transition-all outline-none border-4 border-white flex flex-col items-center justify-center group overflow-hidden relative">
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <Phone size={48} className="text-white mb-2" strokeWidth={2.5} />
               <span className="text-white font-black uppercase tracking-widest text-lg drop-shadow-sm">Transmit</span>
            </button>
            <p className="mt-8 text-sm font-bold text-accent-crimson max-w-sm">Initiating transmit will share your current GPS coordinates and vital parameters ({profile?.allergies?.length ? "Allergies active" : "No known allergies"}) with local infrastructure.</p>
         </div>
      </div>
    </motion.div>
  );
}
