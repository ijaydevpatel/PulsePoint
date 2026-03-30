"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/core/ThemeProvider";
import { Logo } from "@/components/core/Logo";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="w-full absolute top-0 left-0 flex items-center justify-between px-8 md:px-16 lg:px-24 py-8 z-50">
      <Link href="/" className="outline-none">
        <Logo variant="primary" />
      </Link>
      
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
