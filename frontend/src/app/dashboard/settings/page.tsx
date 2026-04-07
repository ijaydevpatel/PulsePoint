"use client";

import React from "react";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { Settings, Shield, Bell, Moon, Cloud, Globe, Lock, User, Terminal, HelpCircle, ChevronRight, Zap, Camera, Upload } from "lucide-react";
import { useTheme } from "@/components/core/ThemeProvider";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { profile, saveProfile } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    fullName: profile?.fullName || "",
    profilePicture: profile?.profilePicture || "",
    age: profile?.age?.toString() || "0",
    gender: profile?.gender || "Male",
    height: profile?.height?.toString() || "0",
    weight: profile?.weight?.toString() || "0",
    bloodGroup: profile?.bloodGroup || "O+",
    allergies: profile?.allergies?.join(", ") || "",
    conditions: profile?.conditions?.join(", ") || "",
    medications: profile?.medications?.join(", ") || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
        setSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const profileData: any = {
      fullName: formData.fullName,
      profilePicture: formData.profilePicture,
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.weight) || 0,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies ? formData.allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
      conditions: formData.conditions ? formData.conditions.split(",").map(s => s.trim()).filter(Boolean) : [],
      medications: formData.medications ? formData.medications.split(",").map(s => s.trim()).filter(Boolean) : [],
    };

    try {
      await apiClient.post('/profile', profileData);
      saveProfile({ ...profileData, email: profile?.email || "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Settings update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const settingsGroups = [
    {
      title: "Core Configuration",
      icon: <Terminal size={12} />,
      items: [
        { label: "Neural Night Mode", desc: "Adaptive AMOLED-safe UI", action: toggleTheme, value: theme === "dark" ? "Neural Night" : "Solar" },
        { label: "Notification Pulse", desc: "Proactive biometric alerts", value: "Enabled" },
        { label: "Sync Frequency", desc: "Real-time biometric polling", value: "Ultra (1ms)" },
      ]
    },
    {
      title: "Security Handshake",
      icon: <Shield size={12} />,
      items: [
        { label: "Encryption Grade", desc: "AES-256 Military standard", value: "Production" },
        { label: "Session Persistence", desc: "Automatic local token cache", value: "7 Days" },
        { label: "Data Sovereignty", desc: "Self-custody biological keys", value: profile ? "Verified" : "Active" },
      ]
    },
    {
      title: "Environmental Cloud",
      icon: <Cloud size={12} />,
      items: [
        { label: "Geospatial OSINT", desc: "Air quality & UV synchronization", value: typeof window !== 'undefined' && 'geolocation' in navigator ? "Active" : "Buffered" },
        { label: "Global Lab Sync", desc: "Curation of neural research", value: "Connected" },
      ]
    }
  ];

  return (
    <FeatureShell 
      title="System Controls" 
      subtitle="Neural Root Configuration" 
      icon={<Settings size={24} />}
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Profile Identity (Header Level) */}
        <div className="lg:col-span-12">
           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[40px] p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                 {/* Picture Upload */}
                 <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 rounded-full border-4 border-border-glass bg-surface-low relative overflow-hidden group-hover:border-primary/40 transition-all duration-300">
                       {formData.profilePicture ? (
                         <img src={formData.profilePicture} alt="Neural Preview" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-text-secondary/20">
                            <User size={48} />
                         </div>
                       )}
                       <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={24} className="text-white mb-1" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                       </label>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white border-4 border-surface-glass shadow-sm scale-100 group-hover:scale-110 transition-transform">
                       <Upload size={18} strokeWidth={3} />
                    </div>
                 </div>

                 <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 mb-6">
                       <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural Identifier</label>
                       <input 
                         name="fullName"
                         value={formData.fullName}
                         onChange={handleChange}
                         className="text-3xl md:text-4xl font-display font-black text-text-primary tracking-tighter bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                         placeholder="Syncing..."
                       />
                       <p className="text-xs font-semibold text-text-secondary opacity-60">Connected clinical signature of {profile?.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                       <button 
                         type="submit" 
                         disabled={loading}
                         className="px-8 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                       >
                         {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Zap size={16} />}
                         {loading ? "Synchronizing..." : "Commit Bio-Changes"}
                       </button>

                       <AnimatePresence>
                          {success && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              exit={{ opacity: 0, x: -10 }}
                              className="px-6 py-4 bg-green-600/10 border border-green-600/20 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            >
                               <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping" />
                               Biological Pulse Finalized
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main: Bio & System Configuration */}
        <div className="lg:col-span-12 flex flex-col gap-8">
           
           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[40px] p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-10">
                 <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <User size={12} />
                 </div>
                 <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Clinical Baseline</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-60">Handshake Age</label>
                    <input name="age" type="number" value={formData.age} onChange={handleChange} className="bg-surface-low border border-border-glass rounded-2xl py-4 px-6 text-sm font-bold text-text-primary focus:border-primary/40 focus:outline-none transition-all" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-60">Identity Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="bg-surface-low border border-border-glass rounded-2xl py-4 px-6 text-sm font-bold text-text-primary focus:border-primary/40 focus:outline-none transition-all">
                       <option>Male</option>
                       <option>Female</option>
                       <option>Other</option>
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-60">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="bg-surface-low border border-border-glass rounded-2xl py-4 px-6 text-sm font-bold text-text-primary focus:border-primary/40 focus:outline-none transition-all">
                       {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-60">Stature (cm)</label>
                    <input name="height" type="number" value={formData.height} onChange={handleChange} className="bg-surface-low border border-border-glass rounded-2xl py-4 px-6 text-sm font-bold text-text-primary focus:border-primary/40 focus:outline-none transition-all" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-60">Mass (kg)</label>
                    <input name="weight" type="number" value={formData.weight} onChange={handleChange} className="bg-surface-low border border-border-glass rounded-2xl py-4 px-6 text-sm font-bold text-text-primary focus:border-primary/40 focus:outline-none transition-all" />
                 </div>
              </div>
           </div>

           <div className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[40px] p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-10">
                 <div className="w-8 h-8 rounded-xl bg-accent-crimson/10 flex items-center justify-center text-accent-crimson">
                    <Zap size={12} />
                 </div>
                 <h3 className="text-[10px] font-black text-accent-crimson uppercase tracking-[0.3em]">Medical Registry</h3>
              </div>

              <div className="flex flex-col gap-8">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-60">Neural Allergies (Comma Separated)</label>
                    <input name="allergies" value={formData.allergies} onChange={handleChange} className="bg-surface-low border border-border-glass rounded-2xl py-4 px-6 text-sm font-bold text-text-primary focus:border-primary/40 focus:outline-none transition-all" placeholder="e.g. Peanuts, Penicillin" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-60">Clinical Conditions</label>
                    <input name="conditions" value={formData.conditions} onChange={handleChange} className="bg-surface-low border border-border-glass rounded-2xl py-4 px-6 text-sm font-bold text-text-primary focus:border-primary/40 focus:outline-none transition-all" placeholder="e.g. Asthma, Hypertension" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-60">Active Medications</label>
                    <input name="medications" value={formData.medications} onChange={handleChange} className="bg-surface-low border border-border-glass rounded-2xl py-4 px-6 text-sm font-bold text-text-primary focus:border-primary/40 focus:outline-none transition-all" placeholder="e.g. Paracetamol" />
                 </div>
              </div>
           </div>

           {/* Core UI Settings Groups */}
           {settingsGroups.map((group, gIdx) => (
             <div key={gIdx} className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[40px] p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                   <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {group.icon}
                   </div>
                   <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{group.title}</h3>
                </div>

                <div className="flex flex-col gap-10">
                   {group.items.map((item, iIdx) => (
                      <div key={iIdx} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 group ${item.action ? 'cursor-pointer' : 'cursor-default'}`} onClick={item.action as any}>
                        <div className="flex flex-col">
                           <span className={`text-sm font-black text-text-primary tracking-tighter mb-1 transition-colors ${item.action ? 'group-hover:text-primary' : ''}`}>
                              {item.label}
                           </span>
                           <span className="text-[10px] font-bold text-text-secondary opacity-60 uppercase tracking-widest leading-relaxed">
                              {item.desc}
                           </span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                             item.value === 'Enabled' || item.value === 'ON' || item.value === 'Connected' || item.value === 'Active' || item.value === 'Verified' || item.value === 'Production'
                               ? 'bg-green-600/10 text-green-600 border-green-600/10'
                               : 'bg-surface-low text-text-secondary border-border-glass'
                           }`}>
                              {item.value}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
         </div>
         
         {/* Physical Bottom Buffer - Ensures clinical breathing space at end of scroll */}
         <div className="lg:col-span-12 h-2 shrink-0 pointer-events-none" />
       </form>
    </FeatureShell>
  );
}
