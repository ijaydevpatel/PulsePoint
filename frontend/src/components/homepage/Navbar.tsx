"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/core/ThemeProvider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="w-full flex items-center justify-between px-8 md:px-16 lg:px-24 py-8 z-50 relative">
      <div className="flex items-center gap-[2px]">
        <span className="text-2xl font-sans font-extrabold text-primary tracking-tight">Pulse</span>
        <span className="text-2xl font-sans font-bold text-text-primary tracking-tight">Po!nt</span>
      </div>
      
      <nav className="hidden md:flex items-center gap-10">
        {/* Navigation items removed for clean minimal header */}
      </nav>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme} 
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-surface-glass border border-border-glass hover:bg-surface-low transition-all shadow-sm"
        >
          {theme === "dark" ? <Sun size={18} strokeWidth={2.5} className="text-text-secondary" /> : <Moon size={18} strokeWidth={2.5} className="text-text-secondary" />}
        </button>

        <div className="flex gap-4">
            <Link href="/login" className="px-6 py-2 bg-surface-glass border border-border-glass rounded-full text-sm font-bold text-text-primary hover:shadow-soft hover:border-primary/20 transition-all shadow-sm">
              Login
            </Link>
            <Link href="/signup" className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-md">
              Sign Up
            </Link>
          </div>
      </div>
    </header>
  );
}
