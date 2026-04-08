"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, ChevronDown, Moon, Sun } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/core/ThemeProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, logout, isAuthenticated, isAuthLoaded, isProfileComplete, displayName, syncStatus } = useUser();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isMapPage = pathname === "/dashboard/map";
  const isAnalyzerPage = pathname === "/dashboard/report";
  
  // SYNC: Profile Completion Protection
  useEffect(() => {
    // Only proceed once authentication and profile sync attempt are fully settled
    if (!isAuthLoaded || !isAuthenticated) return; 
    
    // REDIRECT PROTOCOL: Only push to setup if we are CERTAIN the profile is missing (synced + !complete)
    // We explicitly avoid redirecting if the syncStatus is 'error' (Handshake 401)
    if (syncStatus === 'synced' && !isProfileComplete && pathname !== "/profile-setup" && !profile) {
      console.log("[Identity Sync] Verified uninitialized profile. Redirecting to Setup...");
      router.push("/profile-setup");
    }
  }, [isAuthLoaded, isAuthenticated, isProfileComplete, profile, syncStatus, router, pathname]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Premium Neural Handshake Transition
  if (!isAuthLoaded) {
    return (
      <div className="h-screen w-full bg-background-app flex flex-col items-center justify-center p-6 text-center overflow-hidden uppercase font-black">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 blur-sm" />
        <div className="relative mb-8">
           <div className="w-24 h-24 rounded-[32px] border border-dashed border-primary/20 animate-spin-slow flex items-center justify-center" />
           <div className="absolute inset-0 flex items-center justify-center text-primary/40">
              <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
           </div>
        </div>
        <h2 className="text-xl font-display font-black text-text-primary tracking-tighter uppercase mb-2">Neural Synchronizing</h2>
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-50">Syncing Clerk Identity with Profile</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-transparent text-text-primary flex flex-col lg:flex-row relative overflow-hidden uppercase font-black">
      
      {/* Desktop Sidebar (Only visible on LG+) */}
      <div className="hidden lg:block shrink-0 relative z-[9999]">
        <Sidebar />
      </div>

      {/* Mobile Navigation Header (Only visible on <LG) */}
      <MobileHeader 
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* Mobile Drawer (Hamburger Style) */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* App Shell Core */}
      <main className={`flex-1 flex flex-col relative transition-all duration-300 ${isMapPage ? 'lg:ml-0' : 'lg:ml-[84px]'} w-full min-w-0 overflow-hidden text-left`}>
        
        {/* Floating HUD Layer (Desktop Only) */}
        <header className={`hidden lg:flex fixed top-6 inset-x-8 h-12 items-center justify-between z-[100] shrink-0 pointer-events-none ${isMapPage ? 'pl-20' : 'pl-0'}`}>
          <div className="flex-1" />

          {/* Center Brand Anchor - Independent Pill */}
          <div className="flex-1 flex justify-center items-center">
             <div className="px-6 py-2.5 bg-surface-glass/40 backdrop-blur-3xl rounded-full border border-border-glass/30 shadow-neural pointer-events-auto hover:bg-surface-glass/60 transition-all duration-300">
                <span className="font-display font-black text-xl tracking-tighter text-text-primary">
                   PulsePo<span className="text-primary">!</span>nt
                </span>
             </div>
          </div>

          {/* Utility Box */}
          <div className="flex-1 flex justify-end items-center gap-4">
            
            {/* Theme Toggle - Independent Pill */}
            <button 
              onClick={toggleTheme} 
              className="w-11 h-11 shadow-neural rounded-full transition-all relative border flex items-center justify-center bg-surface-glass/40 border-border-glass/30 backdrop-blur-3xl hover:bg-surface-glass/60 hover:-translate-y-0.5 active:scale-95 pointer-events-auto"
              title={theme === "dark" ? "Activate Solar Mode" : "Activate Neural Night"}
            >
              {theme === "dark" ? <Sun size={18} strokeWidth={2.5} className="text-text-secondary" /> : <Moon size={18} strokeWidth={2.5} className="text-text-secondary" />}
            </button>

            {/* Identity & Session Menu - Independent Pill */}
            <div className="relative pointer-events-auto">
              <button 
                onClick={() => setProfileOpen(!profileOpen)} 
                className={`flex items-center gap-3 px-5 h-11 rounded-full transition-all border shadow-neural backdrop-blur-3xl group ${profileOpen ? 'bg-surface-low border-primary/20' : 'bg-surface-glass/40 border-border-glass/30 hover:bg-surface-glass/60 hover:-translate-y-0.5'}`}
              >
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-text-primary tracking-tight truncate max-w-[120px] uppercase">
                    {displayName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] text-text-secondary uppercase font-black tracking-[0.2em] opacity-40">
                      Clerk Active
                    </span>
                  </div>
                </div>
                <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ${profileOpen ? 'rotate-180 text-primary' : ''}`} strokeWidth={3} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                      className="absolute right-0 top-14 w-56 bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-float rounded-[32px] p-2.5 z-50 flex flex-col gap-1 overflow-hidden"
                    >
                      <button 
                        onClick={() => { router.push('/dashboard/settings'); setProfileOpen(false); }} 
                        className="px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-text-primary hover:bg-white/5 flex items-center gap-3 transition-all hover:translate-x-1 group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Settings size={14} />
                        </div>
                        System Settings
                      </button>
                      <div className="h-px bg-border-glass mx-4 my-1" />
                      <button 
                        onClick={() => { logout(); setProfileOpen(false); }} 
                        className="px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-accent-crimson hover:bg-accent-crimson/10 flex items-center gap-3 transition-all hover:translate-x-1 group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-accent-crimson/10 flex items-center justify-center text-accent-crimson group-hover:scale-110 transition-transform">
                          <LogOut size={14} />
                        </div>
                        Disconnect Clerk
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dash Content Area */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${isMapPage ? 'pt-0 pb-0' : 'pt-24 pb-16'} ${isMapPage || isAnalyzerPage ? 'px-0' : 'px-4 lg:px-8'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
