"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Activity } from "lucide-react";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignupPage() {
  const containerVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans uppercase font-black tracking-tight transition-colors duration-500">
      {/* Neural Background Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[400px] flex flex-col items-center relative z-30"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <Link href="/" className="mb-8 hover:scale-110 transition-transform focus:outline-none">
             <div className="w-16 h-16 bg-primary/10 rounded-[32px] border border-primary/20 flex items-center justify-center text-primary shadow-glow">
                <Activity size={32} strokeWidth={2.5} />
             </div>
          </Link>
          <h1 className="text-4xl md:text-6xl font-display font-black text-foreground tracking-tighter mb-4 leading-none text-nowrap select-none normal-case">
            New <span className="text-primary italic">Bio-Link</span>
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">
            Initialize Clerk Neural Signature
          </p>
        </div>

        {/* Unified Identity Terminal Hub - Transparent Engine */}
        <div className="w-full bg-foreground/[0.03] dark:bg-foreground/[0.05] backdrop-blur-3xl border border-foreground/[0.08] shadow-neural rounded-[48px] overflow-hidden p-2 transition-all duration-500 hover:border-primary/20">
          <SignUp 
            routing="hash"
            signInUrl="/login" 
            forceRedirectUrl="/profile-setup"
            appearance={{
              variables: {
                colorPrimary: "#e11d48",
                colorBackground: "transparent",
                colorText: "var(--foreground)",
                colorTextSecondary: "var(--muted-foreground)",
                colorInputBackground: "transparent",
                colorInputText: "var(--foreground)",
                borderRadius: "16px",
              },
              elements: {
                rootBox: "w-full mx-auto",
                cardBox: "w-full shadow-none",
                card: "!bg-transparent shadow-none border-none p-6 md:p-8 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-foreground/[0.05] border-foreground/[0.1] hover:bg-foreground/[0.08] text-foreground rounded-2xl py-3 transition-all",
                socialButtonsBlockButtonText: "font-bold",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-white rounded-[20px] py-4 shadow-glow font-black uppercase tracking-widest text-[11px]",
                formFieldInput: "bg-foreground/[0.05] border-foreground/[0.1] text-foreground rounded-2xl focus:ring-primary/20",
                dividerLine: "bg-foreground/[0.08]",
                dividerText: "text-foreground/40 uppercase text-[10px] font-black tracking-[0.2em] px-4",
                footer: "!bg-transparent",
                footerActionText: "!text-current opacity-60 font-bold uppercase tracking-widest text-[10px]",
                footerActionLink: "!text-primary hover:text-primary/80 font-black uppercase text-[10px] ml-2",
                formFieldLabel: "text-foreground/80 text-[10px] font-black uppercase tracking-[0.2em] mb-2",
                identityPreviewText: "text-foreground/60 font-bold",
                identityPreviewEditButton: "text-primary hover:text-primary/80 font-black uppercase text-[10px]"
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
