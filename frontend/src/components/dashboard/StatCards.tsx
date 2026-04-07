"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Thermometer, Pill, Newspaper } from "lucide-react";

const stats = [
  { label: "Health Score", value: "94/100", trend: "+2%", icon: Activity, color: "text-green-500" },
  { label: "Symptoms", value: "2 Active", trend: "Stable", icon: Thermometer, color: "text-amber-500" },
  { label: "Medicines", value: "3 Active", trend: "Synced", icon: Pill, color: "text-blue-500" },
  { label: "Updates", value: "5 New", trend: "Live", icon: Newspaper, color: "text-primary" },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="bg-surface-low/20 backdrop-blur-xl p-5 md:p-6 rounded-[24px] border border-surface-container hover:border-primary/20 transition-all group flex flex-col justify-between min-h-[140px] shadow-sm active:scale-[0.98]"
        >
          <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-xl bg-surface-low border border-surface-container-high transition-colors group-hover:bg-primary/5 ${stat.color}`}>
              <stat.icon size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity">
              {stat.trend}
            </span>
          </div>
          
          <div className="mt-4">
            <h3 className="text-[10px] md:text-xs font-black text-text-secondary uppercase tracking-widest mb-1 opacity-70">
              {stat.label}
            </h3>
            <p className="text-xl md:text-2xl font-display font-black text-text-primary tracking-tighter">
              {stat.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
