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
  AlertTriangle, 
  FileText, 
  UserCheck,
  Activity
} from "lucide-react";

// Added all remaining tabs to the Sidebar structure for Phase 7
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

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-[64px] flex flex-col items-center py-4 z-[9999] overflow-visible pointer-events-auto">
      
      {/* Branding Logo */}
      <Link href="/dashboard" className="mb-6 flex flex-col items-center gap-1 text-primary hover:scale-110 transition-transform group shrink-0 pointer-events-auto">
        <div className="w-[44px] h-[44px] rounded-full bg-surface-glass shadow-sm border border-border-glass flex items-center justify-center group-hover:bg-primary transition-colors">
          <Activity size={20} strokeWidth={2.5} className="text-primary group-hover:text-white transition-colors" />
        </div>
      </Link>

      {/* Primary Nav Items Stack */}
      <div className="flex-1 flex flex-col gap-3 w-full items-center pointer-events-auto">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          // Calculate a fixed Y offset for the tooltip based on index to prevent overflow clipping
          return (
             <div key={item.label} className="relative group flex justify-center">
               <Link href={item.href} className="flex justify-center outline-none">
                 {/* Fully Independent Circular Node Design - Matched Exactly to Notification Pill */}
                  {isActive ? (
                    <div className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-surface-low shadow-sm border border-primary/20 relative z-10 shrink-0 transition-all">
                      <item.icon size={18} strokeWidth={2.5} className="text-primary" />
                    </div>
                  ) : (
                    <div className="w-[44px] h-[44px] flex items-center justify-center rounded-full transition-all border shadow-sm bg-surface-glass border-border-glass backdrop-blur-3xl hover:bg-surface-low hover:border-surface-container-high hover:-translate-y-0.5 z-10 shrink-0 duration-300">
                      <item.icon size={18} strokeWidth={2.5} className="text-text-secondary/80 group-hover:text-primary transition-colors" />
                    </div>
                  )}
               </Link>
               
               {/* Fixed absolute Tooltip bypassing standard overflow */}
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
