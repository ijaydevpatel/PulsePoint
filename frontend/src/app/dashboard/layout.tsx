"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, User, LogOut, Settings, ChevronDown, Activity, CheckCircle2, Moon, Sun } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/core/ThemeProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, logout, isAuthenticated } = useUser();
  const router = useRouter();
  
  // Strict Profile Protection & Auth Redirect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (profile && !profile.fullName) {
      router.push("/profile-setup");
    }
  }, [isAuthenticated, profile, router]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Notification States
  const [unreadCount, setUnreadCount] = useState(2);

  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isMapPage = pathname === "/dashboard/map";
  const isAnalyzerPage = pathname === "/dashboard/report";
  const showSidebarBg = !isMapPage && !isAnalyzerPage;

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent text-text-primary flex relative">
      <Sidebar />
      
      {/* App Shell Core - Adaptive Margin for Blending vs Readability */}
      <main className={`flex-1 flex flex-col relative overflow-hidden h-full transition-all duration-300 ${isMapPage ? 'ml-0' : 'ml-[84px]'}`}>
        
        {/* Floating Topbar (Adaptive alignment) */}
        <header className={`h-[64px] pr-6 mt-4 mb-2 flex items-center justify-between z-50 shrink-0 relative ${isMapPage ? 'pl-[84px]' : 'pl-0'}`}>
          
          {/* Left Block Placeholder */}
          <div className="flex-1" />

          {/* Center Brand Anchor */}
          <div className="flex-1 flex justify-center items-center pointer-events-none">
             <div className="px-6 py-2 bg-surface-glass backdrop-blur-sm rounded-full border border-border-glass shadow-sm">
                <span className="font-sans font-black text-xl tracking-tight text-text-primary">
                  PulsePo<span className="text-primary">!</span>nt
                </span>
             </div>
          </div>

          {/* Utility Box */}
          <div className="flex-1 flex justify-end items-center gap-3 h-full">
            
            {/* Soft Notifications Pill */}
            <div className="relative h-full flex items-center z-50 py-1">
              <button 
                onClick={() => {setNotifOpen(!notifOpen); setProfileOpen(false);}} 
                className={`w-[44px] h-[44px] shadow-sm rounded-full transition-all relative cursor-pointer border flex items-center justify-center overflow-visible ${notifOpen ? "bg-surface-low border-primary/20" : "bg-surface-glass border-border-glass backdrop-blur-3xl hover:bg-surface-low hover:border-surface-container-high hover:-translate-y-0.5"}`}
              >
                <Bell size={18} strokeWidth={2.5} className={notifOpen ? "text-primary" : "text-text-secondary/80"} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 z-[100] min-w-[16px] h-[16px] px-1 bg-[#E11D48] rounded-full shadow-md shadow-red-500/40 border-2 border-white flex items-center justify-center text-[9px] font-black text-white pointer-events-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-16 w-[340px] bg-surface-glass backdrop-blur-xl border border-border-glass shadow-float rounded-[24px] p-5 z-50 overflow-hidden">
                    <div className="flex justify-between items-center mb-4 border-b border-surface-container pb-3">
                       <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">Alerts</h4>
                       {unreadCount > 0 && (
                         <button onClick={() => setUnreadCount(0)} className="flex items-center gap-1 text-[10px] uppercase font-black text-primary hover:text-primary-hover transition-colors">
                           <CheckCircle2 size={12} /> Mark all read
                         </button>
                       )}
                    </div>
                    {unreadCount > 0 ? (
                      <div className="flex flex-col gap-2">
                         <div className="p-3 bg-surface-low rounded-2xl text-xs font-medium text-text-primary border border-surface-container hover:bg-surface-container transition-colors cursor-pointer flex gap-3 items-start shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent-crimson mt-0.5 shrink-0 shadow-sm" />
                            <span className="leading-relaxed font-semibold">Profile setup sequence completed successfully. AI baseline is initializing.</span>
                         </div>
                         <div className="p-3 bg-primary/5 text-primary border border-primary/20 rounded-2xl text-xs font-medium leading-relaxed hover:bg-primary/10 transition-colors cursor-pointer flex gap-3 items-start shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary mt-0.5 shrink-0 shadow-sm" />
                            <span className="font-semibold">Neural engine ready for continuous monitoring. Review your biometrics.</span>
                         </div>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center opacity-50">
                        <CheckCircle2 size={32} strokeWidth={2} className="mb-2 text-text-secondary" />
                        <span className="text-sm font-bold text-text-secondary">You're all caught up!</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Pill */}
            <div className="relative h-full flex items-center z-50 py-1">
              <button 
                onClick={toggleTheme} 
                className={`w-[44px] h-[44px] shadow-sm rounded-full transition-all relative cursor-pointer border flex items-center justify-center bg-surface-glass border-border-glass backdrop-blur-3xl hover:bg-surface-low hover:border-surface-container-high hover:-translate-y-0.5`}
              >
                {theme === "dark" ? <Sun size={18} strokeWidth={2.5} className="text-text-secondary/80" /> : <Moon size={18} strokeWidth={2.5} className="text-text-secondary/80" />}
              </button>
            </div>

            {/* Settings Pill */}
            <div className="relative h-full flex items-center z-50 py-1">
              <button onClick={() => router.push('/dashboard/settings')} className={`w-[44px] h-[44px] shadow-sm rounded-full transition-all relative cursor-pointer border flex items-center justify-center bg-surface-glass border-border-glass backdrop-blur-3xl hover:bg-surface-low hover:border-surface-container-high hover:-translate-y-0.5`}>
                <Settings size={18} strokeWidth={2.5} className="text-text-secondary/80 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Profile Extended Blob */}
            <div className="relative h-full flex items-center z-50 py-1">
              <button onClick={() => {setProfileOpen(!profileOpen); setNotifOpen(false);}} className={`flex items-center gap-2 cursor-pointer group p-1 pr-4 h-[44px] rounded-full transition-all border shadow-sm backdrop-blur-3xl ${profileOpen ? 'bg-surface-low border-primary/20' : 'bg-surface-glass border-border-glass hover:bg-surface-low hover:border-surface-container-high hover:-translate-y-0.5'}`}>
                <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center shadow-inner transition-all overflow-hidden border border-surface-container shrink-0 text-text-secondary group-hover:text-primary">
                  {profile?.fullName ? <span className="font-black text-[12px]">{profile.fullName.charAt(0)}</span> : <User size={16} strokeWidth={2.5} />}
                </div>
                <div className="text-left flex flex-col justify-center">
                  <span className="text-xs font-sans font-black text-text-primary group-hover:text-primary transition-colors leading-tight truncate max-w-[100px]">{profile?.fullName || "Active User"}</span>
                  <span className="text-[9px] text-text-secondary uppercase font-bold flex items-center gap-1 mt-0.5 tracking-wider"><div className="w-1 h-1 rounded-full bg-green-500" /> Online</span>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-16 w-56 bg-surface-glass backdrop-blur-xl border border-border-glass shadow-float rounded-[24px] p-2 z-50 flex flex-col overflow-hidden">
                    <button onClick={logout} className="px-4 py-3 rounded-xl text-sm font-bold text-accent-crimson hover:bg-accent-crimson/10 text-left flex items-center gap-3 transition-colors"><LogOut size={16} strokeWidth={2.5}/> Disconnect Data</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Dash Content Area - Conditional padding for Map/Analyzer Page (Strict alignment) */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar pb-16 pt-2 rounded-t-[32px] ${isMapPage || isAnalyzerPage ? 'pl-0 pr-0' : 'pl-6 pr-6'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
