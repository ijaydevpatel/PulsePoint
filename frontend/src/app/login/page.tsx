"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Fingerprint } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function LoginPage() {
  const containerVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-background-app flex items-center justify-center p-6 relative overflow-hidden font-sans uppercase font-black tracking-tight">
      {/* Neural Background Orbs */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md p-1 flex flex-col items-center relative z-30"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <Link href="/" className="mb-8 hover:scale-110 transition-transform focus:outline-none">
            <div className="w-16 h-16 bg-primary/10 rounded-[28px] border border-primary/20 flex items-center justify-center text-primary shadow-glow">
               <Fingerprint size={32} strokeWidth={2.5} />
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tighter mb-3 leading-none">
            Identity <span className="text-primary italic">Portal</span>
          </h1>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-50">
            Secure Clerk Identity Handshake
          </p>
        </div>

        {/* Clerk Sign In Hub - Centered & Neural */}
        <div className="w-full bg-surface-low/50 backdrop-blur-3xl rounded-[48px] border border-surface-container shadow-neural overflow-hidden">
           <SignIn 
            routing="hash"
            signUpUrl="/signup" 
            forceRedirectUrl="/dashboard"
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#e11d48",
                colorBackground: "#0a0a0a",
                colorText: "#ffffff",
                colorTextSecondary: "#cbd5e1", // Increased contrast from #94a3b8
                colorInputBackground: "rgba(255, 255, 255, 0.05)",
                colorInputText: "#ffffff",
                borderRadius: "16px",
              },
              elements: {
                rootBox: "w-full mx-auto flex justify-center",
                cardBox: "w-full shadow-none",
                card: "bg-transparent shadow-none border-none p-8 w-full max-w-sm",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 !text-white rounded-2xl py-3 transition-all",
                socialButtonsBlockButtonText: "!text-white font-bold",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-white rounded-[20px] py-4 shadow-glow font-black uppercase tracking-widest text-[11px]",
                formFieldInput: "bg-white/5 border-white/10 text-white rounded-2xl focus:ring-primary/20",
                dividerLine: "bg-white/10",
                dividerText: "text-white/40 uppercase text-[9px] font-black tracking-widest",
                footerActionText: "text-text-secondary font-bold uppercase tracking-widest text-[10px]",
                footerActionLink: "text-primary hover:text-primary/80 font-black uppercase text-[10px] ml-2",
                formFieldLabel: "text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 opacity-70",
                identityPreviewText: "text-white/60 font-bold",
                identityPreviewEditButton: "text-primary hover:text-primary/80 font-black uppercase text-[10px]"
              }
            }}
           />
        </div>
      </motion.div>
    </div>
  );
}
