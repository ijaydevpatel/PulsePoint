"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Activity } from "lucide-react";
import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  const containerVariants: any = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1, scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-background-app flex items-center justify-center p-6 relative overflow-hidden font-sans uppercase font-black tracking-tight">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl p-1 flex flex-col items-center relative z-30"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <Link href="/" className="mb-8 hover:scale-110 transition-transform focus:outline-none">
             <div className="w-16 h-16 bg-primary/10 rounded-[28px] border border-primary/20 flex items-center justify-center text-primary shadow-glow">
                <Activity size={32} strokeWidth={2.5} />
             </div>
          </Link>
          <h1 className="text-4xl md:text-6xl font-display font-black text-text-primary tracking-tighter mb-4 leading-none lowercase">
            New <span className="text-primary italic">Bio-Link</span>
          </h1>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-60">
            Initialize Clerk Neural Signature
          </p>
        </div>

        {/* Clerk Sign Up Hub */}
        <div className="w-full bg-surface-low/50 backdrop-blur-3xl rounded-[48px] border border-surface-container shadow-neural overflow-hidden">
           <SignUp 
            routing="hash"
            signInUrl="/login" 
            forceRedirectUrl="/profile-setup"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none p-10 md:p-14",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl py-3 transition-all",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-white rounded-[20px] py-4 shadow-glow font-black uppercase tracking-widest",
                formFieldInput: "bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20",
                footerAction: "hidden",
                dividerLine: "bg-white/10",
                dividerText: "text-white/40 uppercase text-[9px] font-black tracking-widest",
                formFieldLabel: "text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 opacity-70",
                identityPreviewText: "text-white/60 font-bold",
                identityPreviewEditButton: "text-primary hover:text-primary/80 font-black uppercase text-[10px]"
              }
            }}
           />
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
            Already Linked?{" "}
            <Link href="/login" className="text-primary font-black ml-2 hover:underline">Access Portal</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
