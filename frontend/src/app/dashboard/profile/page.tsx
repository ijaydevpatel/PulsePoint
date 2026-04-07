"use client";

import React from "react";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { User as UserIcon, Settings, LogOut, Shield, Fingerprint, Activity, Clock, Edit3, Camera, MapPin, Mail, Calendar, Ruler, Weight } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { profile, displayName, logout } = useUser();

  const mockStats = [
    { label: "Neural Sync", value: "98.2%", color: "text-primary", bg: "bg-primary/10" },
    { label: "Data Integrity", value: "Verified", color: "text-green-600", bg: "bg-green-600/10" },
    { label: "Identity Hash", value: "PX9-4A2", color: "text-text-secondary", bg: "bg-surface-low" },
  ];

  return (
    <FeatureShell 
      title="User Identity" 
      subtitle="Biological Profile Record" 
      icon={<Fingerprint size={24} />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
        
        {/* Left: Identity Card */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[40px] p-10 shadow-float relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 blur-sm" />
              
              <div className="relative mb-8 pt-4">
                 <div className="w-32 h-32 rounded-[48px] bg-surface-low border border-border-glass flex items-center justify-center text-primary/20 relative group overflow-hidden">
                    <UserIcon size={64} />
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                       <Camera size={24} />
                    </div>
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-border-glass shadow-neural flex items-center justify-center text-primary">
                    <Shield size={18} />
                 </div>
              </div>

              <h3 className="text-3xl font-display font-black text-text-primary tracking-tighter mb-2">{displayName}</h3>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-60 mb-8">PulsePo!int Verified Identity</p>

              <div className="flex flex-col gap-3 w-full">
                 <button className="w-full py-4 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Edit3 size={14} /> Update Parameters
                 </button>
                 <button 
                  onClick={logout}
                  className="w-full py-4 rounded-2xl border border-border-glass text-[11px] font-black uppercase tracking-widest text-text-secondary hover:text-accent-crimson hover:bg-accent-crimson/5 hover:border-accent-crimson/20 transition-all flex items-center justify-center gap-3"
                 >
                    <LogOut size={14} /> Disconnect Data
                 </button>
              </div>
           </div>

           <div className="p-8 rounded-[40px] bg-surface-glass border border-border-glass flex flex-col gap-6">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Sync Statistics</h4>
              <div className="flex flex-col gap-4">
                 {mockStats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center bg-surface-low/30 border border-border-glass p-4 rounded-2xl">
                       <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">{s.label}</span>
                       <span className={`text-[11px] font-black ${s.color}`}>{s.value}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Biological Data Panel */}
        <div className="xl:col-span-8 flex flex-col gap-6">
           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[40px] p-10 shadow-sm">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                 Biological Parameters Cluster <div className="flex-1 h-px bg-primary/10" />
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { icon: Mail, label: "Neural Identifier", value: profile?.email || "Unknown", detail: "Primary Handshake" },
                   { icon: Calendar, label: "Biological Age", value: `${profile?.age || "--"} Yrs`, detail: "Demographic Sync" },
                   { icon: Activity, label: "Blood Group", value: profile?.bloodGroup || "--", detail: "Rh Signature" },
                   { icon: Ruler, label: "Morphology", value: `${profile?.height || "--"} cm`, detail: "Linear Stature" },
                   { icon: Weight, label: "Biological Load", value: `${profile?.weight || "--"} kg`, detail: "Mass Density" },
                   { icon: Shield, label: "Sync Status", value: "Verified", detail: "Session Active" },
                 ].map((d, i) => (
                   <div key={i} className="bg-surface-low border border-border-glass p-6 rounded-[32px] group hover:border-primary/20 transition-all flex flex-col gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-border-glass shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <d.icon size={18} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60 mb-1">{d.label}</span>
                         <span className="text-base font-black text-text-primary tracking-tight">{d.value}</span>
                         <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest mt-1">{d.detail}</span>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-8 rounded-[32px] bg-primary/5 border border-primary/10 relative overflow-hidden">
                 <div className="absolute -right-10 -bottom-10 opacity-5">
                    <Fingerprint size={160} />
                 </div>
                 <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Neural Data Sovereignty</h4>
                 <p className="text-[11px] font-semibold text-text-secondary leading-relaxed max-w-xl">
                   Your biological identity is cryptographically hashed. PulsePo!int maintains zero-knowledge proof protocols to ensure your data remains your primary property. No external synchronization occurs without direct consent.
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-glass border border-border-glass rounded-[40px] p-8 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-low flex items-center justify-center text-text-secondary">
                       <Clock size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-text-primary uppercase tracking-widest">Last Access Sync</p>
                       <p className="text-[10px] font-bold text-text-secondary opacity-60">Today at 10:42 AM</p>
                    </div>
                 </div>
                 <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View History</button>
              </div>
              <div className="bg-surface-glass border border-border-glass rounded-[40px] p-8 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-low flex items-center justify-center text-text-secondary">
                       <Shield size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-text-primary uppercase tracking-widest">Security Handshake</p>
                       <p className="text-[10px] font-bold text-text-secondary opacity-60">Military-Grade AES256</p>
                    </div>
                 </div>
                 <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Full Audit</button>
              </div>
           </div>
        </div>

      </div>
    </FeatureShell>
  );
}
