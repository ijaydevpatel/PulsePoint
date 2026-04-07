"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Stethoscope, 
  Pill, 
  Newspaper, 
  MessageSquare, 
  Map as MapIcon, 
  FileText, 
} from "lucide-react";

import { Logo } from "@/components/core/Logo";
import { useTheme } from "@/components/core/ThemeProvider";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Stethoscope, label: "Symptoms", href: "/dashboard/symptoms" },
  { icon: Pill, label: "Medicines", href: "/dashboard/medicine" },
  { icon: FileText, label: "Analyzer", href: "/dashboard/report" },
  { icon: MessageSquare, label: "AI Doctor", href: "/dashboard/chat" },
  { icon: Newspaper, label: "Health News", href: "/dashboard/news" },
  { icon: MapIcon, label: "Medical Map", href: "/dashboard/map" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isMapTab = pathname === "/dashboard/map";
  const { theme } = useTheme();

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-[64px] flex flex-col items-center py-4 z-[9999] overflow-visible pointer-events-auto">
      
      {/* Branding Logo - Pure Transparent */}
      <Link href="/dashboard" className="mb-6 flex flex-col items-center gap-1 text-primary hover:scale-110 transition-transform group shrink-0 pointer-events-auto">
        <div className={`w-[44px] h-[44px] rounded-full bg-transparent flex items-center justify-center group-hover:bg-primary transition-colors ${isMapTab ? 'drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]' : ''}`}>
          <Logo variant="icon" className="group-hover:text-white transition-colors" />
        </div>
      </Link>

      {/* Primary Nav Items Stack - Pure Transparent Floating Hub */}
      <div className="flex-1 flex flex-col justify-center gap-3 w-full items-center pointer-events-auto relative">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
             <div key={item.label} className="relative group flex justify-center">
               <Link href={item.href} className="flex justify-center outline-none">
                  {isActive ? (
                    <div className={`w-[44px] h-[44px] flex items-center justify-center rounded-full bg-surface-low border border-primary/20 shadow-sm relative z-10 shrink-0 transition-all ${isMapTab ? 'shadow-[0_0_12px_rgba(0,0,0,0.4)] border-primary/60' : ''}`}>
                      <item.icon size={18} strokeWidth={3} className="text-primary" />
                    </div>
                  ) : (
                    <div className={`w-[44px] h-[44px] flex items-center justify-center rounded-full transition-all border border-transparent bg-transparent hover:bg-surface-glass hover:border-border-glass hover:-translate-y-0.5 z-10 shrink-0 duration-300 ${isMapTab ? (theme === 'dark' ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]') : ''}`}>
                      <item.icon 
                        size={18} 
                        strokeWidth={2.5} 
                        className={`${isMapTab ? (theme === 'dark' ? 'text-white' : 'text-black') : 'text-text-secondary/80'} group-hover:text-primary transition-colors font-black`} 
                      />
                    </div>
                  )}
               </Link>
               
               {/* Tooltip */}
               <div className="absolute left-[80px] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--color-tooltip-bg)] text-[var(--color-tooltip-text)] text-[11px] font-sans font-bold uppercase tracking-wider rounded-lg shadow-float opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[200] pointer-events-none">
                 {item.label}
               </div>
             </div>
          );
        })}
      </div>

    </aside>
  );
}
