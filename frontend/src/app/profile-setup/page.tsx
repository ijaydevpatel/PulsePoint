"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser, UserProfile } from "@/context/UserContext";
import { Activity, ArrowRight, User, ShieldAlert, HeartPulse, ActivitySquare, ShieldPlus } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { saveProfile } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    allergies: "",
    conditions: "",
    medications: "",
    bloodGroup: "A+",
  });

  const [bmi, setBmi] = useState<number | null>(null);

  useEffect(() => {
    if (formData.height && formData.weight) {
      const hMeters = parseFloat(formData.height) / 100;
      const wKg = parseFloat(formData.weight);
      if (hMeters > 0 && wKg > 0) {
        setBmi(parseFloat((wKg / (hMeters * hMeters)).toFixed(1)));
      } else {
        setBmi(null);
      }
    } else {
       setBmi(null);
    }
  }, [formData.height, formData.weight]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const profile: UserProfile = {
      fullName: formData.fullName,
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.weight) || 0,
      bmi: bmi || 0,
      allergies: formData.allergies ? formData.allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
      conditions: formData.conditions ? formData.conditions.split(",").map(s => s.trim()).filter(Boolean) : [],
      medications: formData.medications ? formData.medications.split(",").map(s => s.trim()).filter(Boolean) : [],
      bloodGroup: formData.bloodGroup,
    };

    try {
      await apiClient.post('/profile', {
        fullName: profile.fullName,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies,
        conditions: profile.conditions,
        medications: profile.medications,
      });
      saveProfile(profile);
      router.push("/dashboard");
    } catch (err) {
      console.error('Profile save failed:', err);
      // Still save locally as fallback
      saveProfile(profile);
      router.push("/dashboard");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, staggerChildren: 0.1, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-[100vh] bg-transparent flex items-center justify-center py-16 px-6 relative z-10 w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        variants={containerVariants as any}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl p-10 md:p-12 rounded-[32px] bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-float relative z-30 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent-crimson" />

        <motion.div variants={itemVariants as any} className="flex flex-col items-center mb-10 text-center">
          <Activity size={48} strokeWidth={2.5} className="text-primary mb-4" />
          <h1 className="text-3xl font-sans font-bold text-text-primary tracking-tight mb-2">Initialize Profile</h1>
          <p className="text-sm font-medium text-text-secondary">Complete your neural health record to activate the dashboard system.</p>
        </motion.div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Section: Basic Demographics */}
          <motion.div variants={itemVariants as any} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group flex flex-col gap-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={16} />
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full bg-surface-low border border-border-glass rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-secondary/50 shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Age</label>
                <input required type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Years" min="1" max="120" className="w-full bg-surface-low border border-border-glass rounded-xl py-3 px-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-secondary/50 shadow-sm" />
              </div>
              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-surface-low border border-border-glass rounded-xl py-3 px-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Section: Vitals & Body */}
          <motion.div variants={itemVariants as any} className="grid grid-cols-3 gap-4 p-4 rounded-2xl border border-border-glass bg-surface-low/50">
             <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Height (cm)</label>
                <input required type="number" name="height" value={formData.height} onChange={handleChange} placeholder="175" className="w-full bg-surface-low border border-border-glass rounded-xl py-3 px-3 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-secondary/50 shadow-sm" />
             </div>
             <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Weight (kg)</label>
                <input required type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="70" className="w-full bg-surface-low border border-border-glass rounded-xl py-3 px-3 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-secondary/50 shadow-sm" />
             </div>
             <div className="relative group flex flex-col gap-1 justify-end pb-1">
                <div className="flex flex-col items-center justify-center bg-primary/5 rounded-xl border border-primary/20 py-2.5 px-3">
                   <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Est. BMI</span>
                   <span className="text-lg font-black text-primary leading-none">{bmi !== null ? bmi : "--"}</span>
                </div>
             </div>
          </motion.div>

          {/* Section: Medical History */}
          <motion.div variants={itemVariants as any} className="flex flex-col gap-4">
             <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1 flex items-center gap-1.5"><ShieldAlert size={14} className="text-accent-crimson" /> Allergies (Comma separated)</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Penicillin" className="w-full bg-surface-low border border-border-glass rounded-xl py-3 px-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-secondary/50 shadow-sm" />
             </div>
             <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1 flex items-center gap-1.5"><HeartPulse size={14} className="text-primary" /> Existing Conditions</label>
                <input type="text" name="conditions" value={formData.conditions} onChange={handleChange} placeholder="e.g. Hypertension, Asthma" className="w-full bg-surface-low border border-border-glass rounded-xl py-3 px-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-secondary/50 shadow-sm" />
             </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 relative group flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1 flex items-center gap-1.5"><ActivitySquare size={14} className="text-primary" /> Current Medications</label>
                  <input type="text" name="medications" value={formData.medications} onChange={handleChange} placeholder="e.g. Lisinopril" className="w-full bg-surface-low border border-border-glass rounded-xl py-3 px-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-secondary/50 shadow-sm" />
                </div>
                <div className="relative group flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1 flex items-center gap-1.5"><ShieldPlus size={14} className="text-text-primary" /> Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-surface-low border border-border-glass rounded-xl py-3 px-3 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map(grp => <option key={grp}>{grp}</option>)}
                  </select>
                </div>
             </div>
          </motion.div>

          <motion.div variants={itemVariants as any} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }} className="mt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all py-4 rounded-xl text-white font-sans font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                 Constructing Profile...
                </>
              ) : (
                <>Save Profile & Enter <ArrowRight size={18} /></>
              )}
            </button>
          </motion.div>
        </form>

      </motion.div>
    </div>
  );
}
