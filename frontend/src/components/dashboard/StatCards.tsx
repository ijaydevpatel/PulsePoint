"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Thermometer, Pill, Newspaper, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
  { label: "Health Score", value: "94/100", trend: "+2%", icon: Activity, color: "text-green-400" },
  { label: "Symptoms", value: "2 Active", trend: "Stable", icon: Thermometer, color: "text-amber-400" },
  { label: "Medicines", value: "3 Active", trend: "Synced", icon: Pill, color: "text-blue-400" },
  { label: "Updates", value: "5 New", trend: "Live", icon: Newspaper, color: "text-primary" },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-10 py-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass p-6 rounded-neural border-white/5 hover:border-primary/20 transition-all group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <span className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-widest">{stat.trend}</span>
          </div>
          <h3 className="text-sm font-sans font-bold opacity-60 mb-1">{stat.label}</h3>
          <p className="text-2xl font-display font-bold text-white tracking-tight">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
