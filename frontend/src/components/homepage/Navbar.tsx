"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "@/components/core/ThemeProvider";
import { Logo } from "@/components/core/Logo";
import { useLenis } from "lenis/react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const lenis = useLenis();

  // Prevent background scrolling when mobile menu is open (Synchronized with Lenis)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "unset";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "unset";
      lenis?.start();
    };
  }, [isOpen, lenis]);

  return (
    <header className="w-full absolute top-0 left-0 flex items-center justify-between px-6 md:px-16 lg:px-24 py-6 md:py-8 z-[60]">
      <Link href="/" className="outline-none relative z-50">
        <Logo variant="primary" />
      </Link>
      
      <div className="flex items-center gap-3 md:gap-6 relative z-50">
        {/* Unified Theme Toggle - Always Visible */}
        <button 
          onClick={toggleTheme} 
          className="flex w-[40px] h-[40px] md:w-[44px] md:h-[44px] items-center justify-center rounded-full bg-surface-glass border border-border-glass hover:bg-surface-low transition-all shadow-sm group"
        >
          {theme === "dark" 
            ? <Sun size={18} strokeWidth={2.5} className="text-text-secondary group-hover:text-primary transition-colors" /> 
            : <Moon size={18} strokeWidth={2.5} className="text-text-secondary group-hover:text-primary transition-colors" />
          }
        </button>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-4">
            <Link href="/login" className="px-6 py-2 bg-surface-glass border border-border-glass rounded-full text-sm font-bold text-text-primary hover:shadow-soft hover:border-primary/20 transition-all shadow-sm">
              Identity Portal
            </Link>
            <Link href="/signup" className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-md">
              Genome Sync
            </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-[40px] h-[40px] flex items-center justify-center rounded-full bg-surface-glass border border-border-glass text-text-primary z-50"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay - FIXED SCROLLING */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 bg-background-app/90 z-40 flex flex-col items-center justify-center px-6 md:hidden overflow-hidden h-screen"
          >
            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center text-lg font-black text-[#0EA5E9] bg-[#0EA5E9]/10 backdrop-blur-xl border border-[#0EA5E9]/30 rounded-full shadow-lg transition-all active:scale-95"
              >
                Identity Portal
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center text-lg font-black text-[#D92544] bg-[#D92544]/10 backdrop-blur-xl border border-[#D92544]/30 rounded-full shadow-lg transition-all active:scale-95"
              >
                Genome Sync
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
