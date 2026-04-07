"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Fingerprint } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function LoginPage() {
  const containerVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans uppercase font-black tracking-tight transition-colors duration-500">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm flex flex-col items-center relative z-30"
      >
        <div className="flex flex-col items-center mb-12 text-center">
          <Link href="/" className="mb-10 hover:scale-110 transition-transform focus:outline-none">
            <div className="w-16 h-16 bg-primary/10 rounded-[32px] border border-primary/20 flex items-center justify-center text-primary shadow-glow">
               <Fingerprint size={32} strokeWidth={2.5} />
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tighter mb-4 leading-none text-nowrap">
            Identity Portal
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">
            Secure Clerk Neural Handshake
          </p>
        </div>

        {/* Unified Identity Terminal - Solid HUD Architecture */}
        <SignIn 
          routing="hash"
          signUpUrl="/signup" 
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#e11d48",
              colorBackground: "#0a0a0b", // Solid carbon background to prevent split-theme faults
              colorText: "#ffffff",
              colorTextSecondary: "#a1a1aa",
              colorInputBackground: "rgba(255, 255, 255, 0.03)",
              colorInputText: "#ffffff",
              borderRadius: "16px",
            },
            elements: {
              rootBox: "w-full mx-auto",
              cardBox: "w-full shadow-none",
              card: "bg-[#0a0a0b] border border-white/5 shadow-neural p-8 md:p-10 w-full rounded-[40px] overflow-hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl py-3 transition-all",
              socialButtonsBlockButtonText: "font-bold !text-white",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-white rounded-[20px] py-4 shadow-glow font-black uppercase tracking-widest text-[11px]",
              formFieldInput: "bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20",
              dividerLine: "bg-white/10",
              dividerText: "!text-white/40 uppercase text-[10px] font-black tracking-[0.2em] px-4",
              footer: "bg-[#0a0a0b] !mt-0 !pt-2", // Force background contiguousness
              footerActionText: "!text-white/60 font-bold uppercase tracking-widest text-[10px]",
              footerActionLink: "!text-primary hover:text-primary/80 font-black uppercase text-[10px] ml-2",
              formFieldLabel: "text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-2",
              identityPreviewText: "text-white/60 font-bold",
              identityPreviewEditButton: "text-primary hover:text-primary/80 font-black uppercase text-[10px]"
            }
          }}
        />
      </motion.div>
    </div>
  );
}
