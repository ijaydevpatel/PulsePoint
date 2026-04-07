"use client";

import React from "react";
import { motion } from "framer-motion";

interface FeatureShellProps {
  title: string;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
  children?: React.ReactNode;
  noPadding?: boolean;
  neuralPulse?: {
    generationTime: number;
    model: string;
  };
}

export function FeatureShell({ title, subtitle, icon, children, noPadding = false, neuralPulse }: FeatureShellProps) {
  return (
    <div className={`p-4 md:p-8 lg:p-10 ${noPadding ? 'pb-0' : 'pb-3 md:pb-4'} flex flex-col w-full min-w-0`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 mb-8 md:mb-10"
      >
        <div className="p-3 md:p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-black text-text-primary tracking-tighter uppercase truncate">
            {title}
          </h1>
          <div className="text-[10px] md:text-xs font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">
            {subtitle}
          </div>
        </div>

        {/* Neural Sync HUD */}
        {neuralPulse && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-glass border border-border-glass shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none mb-1">Neural Sync</span>
              <span className="text-[10px] font-bold text-text-primary leading-none">
                {neuralPulse.generationTime.toFixed(2)}s | <span className="text-primary">{neuralPulse.model}</span>
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 w-full"
      >
        {children ? children : (
            <div className="bg-surface-low/30 backdrop-blur-3xl h-full rounded-[32px] border border-surface-container flex flex-col items-center justify-center text-center p-8 md:p-16 lg:p-20 shadow-sm">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-dashed border-primary/20 mb-6 flex items-center justify-center animate-spin-slow">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 shadow-glow" />
                </div>
                <h2 className="text-lg md:text-xl font-display font-black text-text-primary mb-2 tracking-tight uppercase">
                  Neural Initialization
                </h2>
                <p className="text-[11px] md:text-sm font-semibold text-text-secondary/60 max-w-sm leading-relaxed">
                  This module is currently establishing a secure connection to your biometric sensors. Full functionality arriving in Phase 4.
                </p>
            </div>
        )}
      </motion.div>
    </div>
  );
}
