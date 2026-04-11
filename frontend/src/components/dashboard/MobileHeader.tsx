"use client";

import React from "react";
import { Menu, Bell, Moon, Sun } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/components/core/ThemeProvider";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-[64px] px-4 flex items-center justify-between z-[100] bg-background-app/80 backdrop-blur-md border-b border-border-glass fixed top-0 left-0 right-0 lg:hidden shrink-0">
      <button 
        onClick={onMenuClick}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-glass border border-border-glass text-text-primary shadow-sm active:scale-95 transition-transform"
      >
        <Menu size={20} strokeWidth={2.5} />
      </button>

      <div className="flex items-center gap-2 pointer-events-none">
        <span className="font-sans font-black text-lg tracking-tight text-text-primary">
          PulsePo<span className="text-primary">!</span>nt
        </span>
      </div>

      {/* Theme Toggle for Mobile */}
      <button 
        onClick={toggleTheme}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-glass border border-border-glass text-text-primary shadow-sm active:scale-95 transition-transform pointer-events-auto"
      >
        {theme === "dark" ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
      </button>
    </header>
  );
}
