"use client";

import React from "react";
import { motion } from "framer-motion";

interface FeatureShellProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}

export function FeatureShell({ title, subtitle, icon, children }: FeatureShellProps) {
  return (
    <div className="p-10 h-full flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-10"
      >
        <div className="p-4 rounded-2xl bg-primary-burgundy/10 text-primary border border-primary/20">
          {icon}
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">{title}</h1>
          <p className="text-sm font-sans text-white/40 uppercase tracking-widest">{subtitle}</p>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1"
      >
        {children ? children : (
            <div className="bg-surface-glass backdrop-blur-3xl h-full rounded-neural border border-border-glass flex flex-col items-center justify-center text-center p-20">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 mb-6 flex items-center justify-center animate-spin-slow">
                    <div className="w-10 h-10 rounded-full bg-primary-burgundy/20" />
                </div>
                <h2 className="text-xl font-display font-bold text-white mb-2">NEURAL INITIALIZATION</h2>
                <p className="text-sm font-sans text-white/40 max-w-sm">
                    This module is currently establishing a secure connection to your biometric sensors. Full functionality arriving in Phase 4.
                </p>
            </div>
        )}
      </motion.div>
    </div>
  );
}
