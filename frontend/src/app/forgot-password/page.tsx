"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate a native recovery handshake
    // In a full implementation, this would call /api/auth/forgot-password
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const containerVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="min-h-screen bg-background-app flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md p-10 md:p-12 rounded-[48px] bg-surface-low/50 backdrop-blur-3xl border border-surface-container shadow-neural relative z-30"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <Link href="/login" className="mb-6 hover:scale-110 transition-transform focus:outline-none">
            <div className="w-16 h-16 bg-primary/10 rounded-[28px] border border-primary/20 flex items-center justify-center text-primary shadow-glow">
               <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
          </Link>
          <h1 className="text-3xl font-display font-black text-text-primary tracking-tighter mb-2 leading-none">
            Recover <span className="text-primary italic">Identity</span>
          </h1>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-50">
            Native Reset Protocol
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <p className="text-xs text-text-secondary font-bold text-center mb-2">
              Enter your neural identifier to initiate the native recovery sequence.
            </p>
            
            <div className="relative group">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70">Identifier</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@pulsepoint.bio"
                  className="w-full bg-surface-low border border-surface-container rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-text-primary focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white shadow-glow hover:brightness-110 active:scale-95 transition-all py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-4 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Request Reset Token</>}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-accent-crimson/10 border border-accent-crimson/20 rounded-full flex items-center justify-center text-accent-crimson">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-lg font-black text-text-primary uppercase tracking-tighter">Manual Recovery Required</h2>
            <p className="text-xs text-text-secondary font-bold">
              The native SMTP bridge is currently under calibration. To finalize your token reset, please contact neural support directly.
            </p>
            <Link href="/login" className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline mt-2">
              Return to Login
            </Link>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-surface-container text-center">
          <Link href="/login" className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={14} /> Back to Identity Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
