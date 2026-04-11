"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutDashboard, Stethoscope, Pill, FileText, MessageSquare, Newspaper, Map as MapIcon, LogOut, Settings, User } from "lucide-react";
import { useUser } from "@/context/UserContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Stethoscope, label: "Symptoms", href: "/dashboard/symptoms" },
  { icon: Pill, label: "Medicines", href: "/dashboard/medicine" },
  { icon: FileText, label: "Analyzer", href: "/dashboard/report" },
  { icon: MessageSquare, label: "AI Doctor", href: "/dashboard/chat" },
  { icon: Newspaper, label: "Health News", href: "/dashboard/news" },
  { icon: MapIcon, label: "Medical Map", href: "/dashboard/map" },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, displayName } = useUser();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Mobile Viewport Height Fix: Same WhatsApp/Telegram approach as chat
  useEffect(() => {
    if (!isOpen) return;
    const panel = sidebarRef.current;
    if (!panel) return;

    const updateHeight = () => {
      const h = window.innerHeight;
      panel.style.height = `${h}px`;
      panel.style.maxHeight = `${h}px`;
    };

    updateHeight();
    const t1 = setTimeout(updateHeight, 50);
    const t2 = setTimeout(updateHeight, 350);

    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    window.visualViewport?.addEventListener('resize', updateHeight);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      window.visualViewport?.removeEventListener('resize', updateHeight);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] lg:hidden"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 w-[300px] bg-background-app z-[201] flex flex-col lg:hidden shadow-2xl overflow-hidden"
            ref={sidebarRef}
          >
            {/* Header */}
            <div className="h-[72px] px-6 flex items-center justify-between border-b border-surface-container shrink-0">
              <span className="font-display font-black text-xl tracking-tighter text-text-primary">
                PulsePo<span className="text-primary">!</span>nt
              </span>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-low border border-surface-container text-text-primary hover:bg-surface-container transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Section */}
            <div className="p-6 bg-surface-low/30 border-b border-surface-container shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container border border-surface-container-high flex items-center justify-center text-text-secondary overflow-hidden shadow-inner p-1">
                  {displayName ? <span className="font-black text-sm">{displayName.charAt(0)}</span> : <User size={22} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-primary leading-tight">{displayName}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Neural Sync</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation - Only this area scrolls if needed */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 hide-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 border ${isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-transparent border-transparent text-text-secondary hover:bg-surface-low hover:text-text-primary'}`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 bg-surface-low/30 border-t border-surface-container shrink-0 space-y-2" style={{ paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))` }}>
              <button
                onClick={() => { onClose(); router.push('/dashboard/settings'); }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-text-secondary hover:bg-surface-low hover:text-text-primary transition-all"
              >
                <Settings size={20} strokeWidth={2} />
                <span className="text-[13px] font-bold tracking-tight">System Settings</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-accent-crimson hover:bg-accent-crimson/10 transition-all"
              >
                <LogOut size={20} strokeWidth={2.5} />
                <span className="text-[13px] font-bold tracking-tight">Disconnect Data</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
