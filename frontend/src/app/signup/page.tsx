"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/components/core/ThemeProvider";

export default function SignupPage() {
  const { theme } = useTheme();

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] as any // Casting to avoid strict Easing type check
      },
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[460px] relative z-30"
      >
        {/* Back Link */}
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors mb-12 ml-4"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Navigate Home
        </Link>

        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center px-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center text-primary shadow-glow mb-6">
            <Activity size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tighter mb-2 leading-none">
            New <span className="text-primary italic">Bio-Link</span>
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">
            Initialize Neural Signature v3.1
          </p>
        </div>

        {/* Clerk Auth Hub - Single Glass Card */}
        <div className="relative group w-full">
          <div className="absolute inset-0 bg-primary/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <SignUp 
              routing="hash"
              signInUrl="/login" 
              forceRedirectUrl="/profile-setup"
              appearance={{
              baseTheme: theme === 'dark' ? dark : undefined,
              variables: {
                colorPrimary: '#8A1B33',
                colorText: theme === 'dark' ? '#FFFFFF' : '#1A1A1A',
                colorTextOnPrimaryBackground: '#FFFFFF',
                colorBackground: 'transparent',
                fontFamily: 'var(--font-inter)',
                borderRadius: '1.5rem',
                colorTextSecondary: theme === 'dark' ? '#FFFFFF' : '#6B6B70',
              },
              elements: {
                rootBox: "w-full mx-auto",
                cardBox: "w-full shadow-none",
                card: "bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-neural rounded-[40px] overflow-hidden p-6 md:p-10 w-full transition-all duration-500 hover:border-primary/30",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                main: "!bg-transparent",
                socialButtonsBlockButton: "bg-foreground/[0.03] dark:bg-white/[0.05] border-foreground/[0.08] dark:border-white/[0.1] hover:bg-foreground/[0.06] dark:hover:bg-white/[0.08] text-foreground rounded-2xl py-3.5 transition-all duration-300",
                socialButtonsBlockButtonText: `font-black uppercase tracking-widest text-[10px] ${theme === 'dark' ? '!text-white' : 'text-text-primary'}`,
                formButtonPrimary: "bg-primary hover:bg-primary-hover text-white rounded-[18px] py-4 shadow-glow font-black uppercase tracking-widest text-[11px] mt-4",
                formFieldInput: `!rounded-2xl focus:ring-primary/20 transition-all border border-foreground/10 ${theme === 'dark' ? '!bg-white/10 !text-white' : '!bg-black/5 !text-black'}`,
                otpCodeFieldInput: `!rounded-xl h-12 w-10 text-center font-black text-lg border border-foreground/10 ${theme === 'dark' ? '!bg-white/10 !text-white' : '!bg-black/5 !text-black'}`,
                dividerLine: "bg-foreground/[0.08] dark:bg-white/[0.1]",
                dividerText: `uppercase text-[9px] font-black tracking-[0.3em] px-4 ${theme === 'dark' ? '!text-white' : 'text-text-secondary'}`,
                footer: "!bg-transparent border-none",
                footerActionText: `font-black uppercase tracking-widest text-[9px] ${theme === 'dark' ? '!text-white/70' : 'text-text-secondary'}`,
                footerActionLink: "!text-primary hover:text-primary-hover font-black uppercase text-[9px] ml-1.5 transition-colors",
                footerAction: "!bg-transparent opacity-80",
                formFieldLabel: `text-[9px] font-black uppercase tracking-[0.2em] mb-2.5 ${theme === 'dark' ? '!text-white' : 'text-text-secondary'}`,
                identityPreviewText: `font-bold ${theme === 'dark' ? '!text-white' : 'text-text-primary'}`,
                identityPreviewEditButton: "text-primary hover:text-primary-hover font-black uppercase text-[9px]",
                formFieldAction: "text-primary hover:text-primary-hover font-black uppercase text-[9px] tracking-wider",
                formFieldSuccessText: "text-[9px] font-bold uppercase tracking-wider !text-emerald-500 mt-1",
                formFieldErrorText: "text-[9px] font-bold uppercase tracking-wider !text-rose-500 mt-1",
                formFieldInfoText: `text-[9px] font-black uppercase tracking-[0.1em] mt-1 ${theme === 'dark' ? '!text-white/60' : '!text-black/60'}`,
                formFieldHintText: `text-[9px] font-black uppercase tracking-[0.1em] mt-1 ${theme === 'dark' ? '!text-white/60' : '!text-black/60'}`,
                badge: "hidden",
                internal_badge: "hidden"
              }
            }}
            />
        </div>
      </motion.div>
    </div>
  );
}
