"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Bell, 
  User as UserIcon, 
  ChevronLeft, 
  Save, 
  LogOut,
  Moon,
  Globe,
  Lock,
  Eye,
  Settings as SettingsIcon,
  Activity,
  Download,
  Trash2,
  RefreshCw,
  Palette,
  Languages
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";

type SettingsData = {
  notificationsEnabled: boolean;
  emailAlerts: boolean;
  dataSharing: boolean;
  theme: string;
  language: string;
};

export default function SettingsPage() {
  const { profile, logout, saveProfile } = useUser();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiClient.get('/settings');
      setSettings(data);
    } catch (error) {
      console.error("Settings Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (field: keyof SettingsData, value: any) => {
    if (!settings) return;
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    
    setIsSaving(true);
    try {
      await apiClient.put('/settings', { [field]: value });
    } catch (error) {
      console.error("Settings update failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile,
      settings,
      exportDate: new Date().toISOString(),
      platform: "PulsePo!nt v1.3"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PulsePo!nt_Neural_Archive_${profile?.fullName?.replace(/\s+/g, '_') || 'User'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePurgeData = async () => {
    if (confirm("CRITICAL: This will permanently erase your local neural cache and disconnect your session. Proceed?")) {
      setIsSaving(true);
      try {
        logout();
      } catch (err) {
        console.error("Purge failed:", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } } 
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Activity className="animate-spin text-primary opacity-50" size={32} />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full h-full flex flex-col pt-4 px-6 pb-12 overflow-y-auto hide-scrollbar">
      
      <AnimatePresence mode="wait">
        {!activeTab ? (
          <motion.div key="main-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col mb-8 mt-2 relative z-20">
            <h1 className="text-3xl font-sans font-black text-text-primary tracking-tight">System Preferences</h1>
            <p className="text-text-secondary mt-1 font-medium italic">Configure your Neural Health parameters and integration hooks.</p>
          </motion.div>
        ) : (
          <motion.div key="sub-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-4 mb-8 mt-2 relative z-20">
             <button 
               onClick={() => setActiveTab(null)}
               className="w-10 h-10 rounded-full bg-surface-glass border border-border-glass flex items-center justify-center text-text-primary hover:bg-primary/20 transition-all cursor-pointer"
             >
               <ChevronLeft size={20} />
             </button>
             <div>
               <h1 className="text-2xl font-sans font-black text-text-primary tracking-tight">{activeTab}</h1>
               <p className="text-xs text-text-secondary font-bold uppercase tracking-widest opacity-60">Neural Preference Node</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">
        <AnimatePresence mode="wait">
          {!activeTab ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div onClick={() => setActiveTab("Account & Profile")} className="bg-surface-glass backdrop-blur-3xl p-6 rounded-[32px] border border-border-glass shadow-sm flex flex-col cursor-pointer hover:bg-surface-low hover:shadow-float transition-all group">
                  <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <UserIcon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">Account & Profile</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">Update basic information, bio-metrics, and global platform identities.</p>
               </div>

               <div onClick={() => setActiveTab("General")} className="bg-surface-glass backdrop-blur-3xl p-6 rounded-[32px] border border-border-glass shadow-sm flex flex-col cursor-pointer hover:bg-surface-low hover:shadow-float transition-all group">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <SettingsIcon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">General</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">Customize theme, language, and global application behavior.</p>
               </div>
               
               <div onClick={() => setActiveTab("Notifications")} className="bg-surface-glass backdrop-blur-3xl p-6 rounded-[32px] border border-border-glass shadow-sm flex flex-col cursor-pointer hover:bg-surface-low hover:shadow-float transition-all group">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Bell size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">Notifications</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">Control push, email, and alert frequencies for health warnings.</p>
               </div>
               
               <div onClick={() => setActiveTab("Privacy & Security")} className="bg-surface-glass backdrop-blur-3xl p-6 rounded-[32px] border border-border-glass shadow-sm flex flex-col cursor-pointer hover:bg-surface-low hover:shadow-float transition-all group">
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-1">Privacy & Security</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">Manage your HIPAA data sharing protocols and archive exports.</p>
               </div>
               
               <div onClick={logout} className="bg-surface-glass/40 backdrop-blur-3xl p-6 rounded-[32px] border border-border-glass border-dashed shadow-sm flex flex-col cursor-pointer hover:bg-red-500/5 hover:border-red-500/20 transition-all group lg:mt-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 flex items-center justify-center rounded-2xl">
                      <LogOut size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-500">Disconnect</h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-bold uppercase opacity-50">Secure Logout</p>
                    </div>
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12">
               
               {activeTab === "Account & Profile" && (
                 <div className="bg-surface-glass border border-border-glass rounded-[32px] p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-border-glass">
                       <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-black">
                         {profile?.fullName?.charAt(0)}
                       </div>
                       <div>
                         <h2 className="text-2xl font-black text-text-primary">Surgical Biometric Editor</h2>
                         <p className="text-text-secondary font-medium italic opacity-60">Update your core neural health parameters</p>
                       </div>
                    </div>
                    
                    <form 
                      id="profile-form"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSaving(true);
                        const formData = new FormData(e.currentTarget);
                        const data = {
                          fullName: formData.get('fullName') as string,
                          age: parseInt(formData.get('age') as string) || 0,
                          gender: formData.get('gender') as string,
                          height: parseFloat(formData.get('height') as string) || 0,
                          weight: parseFloat(formData.get('weight') as string) || 0,
                          bloodGroup: formData.get('bloodGroup') as string,
                          allergies: (formData.get('allergies') as string).split(',').map(s => s.trim()).filter(Boolean),
                          conditions: (formData.get('conditions') as string).split(',').map(s => s.trim()).filter(Boolean),
                          medications: (formData.get('medications') as string).split(',').map(s => s.trim()).filter(Boolean),
                        };

                        try {
                          await apiClient.post('/profile', data);
                          const updatedProfile = await apiClient.get('/profile'); 
                          saveProfile(updatedProfile);
                        } catch (err) {
                           console.error("Profile save failed:", err);
                        } finally {
                           setIsSaving(false);
                        }
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                       <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                             <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Full Name</label>
                             <input name="fullName" defaultValue={profile?.fullName} className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Age</label>
                                <input name="age" type="number" defaultValue={profile?.age} className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Gender</label>
                                <select name="gender" defaultValue={profile?.gender} className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none">
                                   <option>Male</option>
                                   <option>Female</option>
                                   <option>Other</option>
                                </select>
                             </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Height (cm)</label>
                                <input name="height" type="number" defaultValue={profile?.height} className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Weight (kg)</label>
                                <input name="weight" type="number" defaultValue={profile?.weight} className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Blood</label>
                                <select name="bloodGroup" defaultValue={profile?.bloodGroup || "O+" } className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none">
                                   {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(grp => <option key={grp}>{grp}</option>)}
                                </select>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Allergies (Comma separated)</label>
                              <input name="allergies" defaultValue={profile?.allergies?.join(', ')} placeholder="e.g. Peanuts, Penicillin" className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Medical Conditions</label>
                              <input name="conditions" defaultValue={profile?.conditions?.join(', ')} placeholder="e.g. Asthma, Hypertension" className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Current Medications</label>
                              <input name="medications" defaultValue={profile?.medications?.join(', ')} placeholder="e.g. Aspirin, Vitamin D" className="bg-surface-low border border-border-glass rounded-xl p-3 text-sm text-text-primary focus:border-primary transition-all outline-none" />
                          </div>
                       </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border-glass flex justify-center">
                       <button 
                         type="submit"
                         form="profile-form"
                         disabled={isSaving}
                         className="w-full max-w-md py-4 bg-primary text-white rounded-2xl font-black shadow-md hover:bg-primary-hover hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                       >
                         {isSaving ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
                         Synchronize Bio-Metrics
                       </button>
                    </div>
                 </div>
               )}

               {activeTab === "General" && (
                 <div className="bg-surface-glass border border-border-glass rounded-[32px] p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-surface-low rounded-2xl border border-border-glass">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Palette size={20}/></div>
                          <div>
                            <p className="font-bold text-text-primary">Interface Theme</p>
                            <p className="text-xs text-text-secondary">Toggle between Neural Dark and Clinical Light</p>
                          </div>
                       </div>
                       <select 
                         value={settings?.theme}
                         onChange={(e) => updateSetting('theme', e.target.value)}
                         className="bg-surface-container border border-border-glass rounded-lg p-2 text-xs text-text-primary outline-none"
                       >
                         <option value="dark">Neural Dark</option>
                         <option value="light">Clinical Light</option>
                       </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-low rounded-2xl border border-border-glass">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Languages size={20}/></div>
                          <div>
                            <p className="font-bold text-text-primary">System Language</p>
                            <p className="text-xs text-text-secondary">Select your preferred clinical terminology locale</p>
                          </div>
                       </div>
                       <select 
                         value={settings?.language}
                         onChange={(e) => updateSetting('language', e.target.value)}
                         className="bg-surface-container border border-border-glass rounded-lg p-2 text-xs text-text-primary outline-none"
                       >
                         <option value="en">English (US)</option>
                         <option value="es">Español</option>
                         <option value="fr">Français</option>
                       </select>
                    </div>
                 </div>
               )}

               {activeTab === "Notifications" && (
                 <div className="bg-surface-glass border border-border-glass rounded-[32px] p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-surface-low rounded-2xl border border-border-glass">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Moon size={20}/></div>
                          <div>
                            <p className="font-bold text-text-primary">Global Alerts</p>
                            <p className="text-xs text-text-secondary">Toggle all real-time sensory notifications</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => updateSetting('notificationsEnabled', !settings?.notificationsEnabled)}
                         className={`w-12 h-6 rounded-full transition-all relative ${settings?.notificationsEnabled ? 'bg-primary' : 'bg-surface-container'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.notificationsEnabled ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-low rounded-2xl border border-border-glass">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><Globe size={20}/></div>
                          <div>
                            <p className="font-bold text-text-primary">Email Summaries</p>
                            <p className="text-xs text-text-secondary">Receive weekly diagnostic intelligence via SMTP</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => updateSetting('emailAlerts', !settings?.emailAlerts)}
                         className={`w-12 h-6 rounded-full transition-all relative ${settings?.emailAlerts ? 'bg-primary' : 'bg-surface-container'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.emailAlerts ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>
                 </div>
               )}

               {activeTab === "Privacy & Security" && (
                 <div className="bg-surface-glass border border-border-glass rounded-[32px] p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between p-4 bg-surface-low rounded-2xl border border-border-glass">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><Eye size={20}/></div>
                          <div>
                            <p className="font-bold text-text-primary">Anonymized Data Sharing</p>
                            <p className="text-xs text-text-secondary">Contribute to global disease trajectory datasets</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => updateSetting('dataSharing', !settings?.dataSharing)}
                         className={`w-12 h-6 rounded-full transition-all relative ${settings?.dataSharing ? 'bg-primary' : 'bg-surface-container'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.dataSharing ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>

                    <div className="flex gap-4">
                       <button 
                         onClick={handleExportData}
                         className="flex-1 p-6 bg-surface-low rounded-3xl border border-border-glass flex flex-col items-center gap-3 hover:bg-surface-container transition-all group"
                       >
                          <Download size={28} className="text-primary group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-black text-text-primary uppercase tracking-widest">Neural Archive</span>
                       </button>
                       <button 
                         onClick={handlePurgeData}
                         className="flex-1 p-6 bg-surface-low rounded-3xl border border-border-glass flex flex-col items-center gap-3 hover:bg-red-500/5 hover:border-red-500/20 transition-all group"
                       >
                          <Trash2 size={28} className="text-red-500 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-black text-red-500 uppercase tracking-widest">Purge Node</span>
                       </button>
                    </div>
                 </div>
               )}

               {isSaving && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-2 text-primary font-bold text-xs mt-4">
                    <Save size={14} className="animate-pulse" /> Saving Preference Delta...
                 </motion.div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
