"use client";

import React, { useState, useEffect } from "react";
import { motion, PanInfo, useAnimation, AnimatePresence } from "framer-motion";
import { Search, Locate, MapPin, Navigation, FlaskConical, Stethoscope, Zap, ArrowUpRight, Search as SearchIcon, Activity } from "lucide-react";

interface Facility {
  id: string | number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  dist?: number;
}

interface MapMobileControlsProps {
  facilities: Facility[];
  onFacilityClick: (f: Facility) => void;
  userLocation: [number, number];
  onLocate: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function MapMobileControls({ 
  facilities, 
  onFacilityClick, 
  userLocation, 
  onLocate, 
  searchQuery, 
  setSearchQuery, 
  isSearching, 
  onSearchSubmit 
}: MapMobileControlsProps) {
  const [sheetState, setSheetState] = useState<"peek" | "expanded">("peek");
  const controls = useAnimation();

  // Handle heights
  const peekHeight = 120; // Handle + Search
  const expandedHeight = "85vh";

  useEffect(() => {
    if (sheetState === "peek") {
      controls.start({ y: `calc(100% - ${peekHeight}px)` });
    } else {
      controls.start({ y: 0 });
    }
  }, [sheetState, controls]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -50) {
      setSheetState("expanded");
    } else if (info.offset.y > 50) {
      setSheetState("peek");
    }
  };

  const openGoogleMaps = (f: Facility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ y: "100%" }}
      className="fixed inset-x-0 bottom-0 h-[85vh] bg-surface-glass backdrop-blur-3xl border-t border-border-glass rounded-t-[40px] z-[200] lg:hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col"
    >
      {/* Swipe Handle Area */}
      <div className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mb-3" />
        
        {/* Rapid Search Bar - Visible in Peek Mode */}
        <div className="w-full px-6 mb-2">
            <div className="relative group flex items-center gap-2">
                <div className="flex-1 relative">
                    <form onSubmit={onSearchSubmit} className="flex items-center px-4 h-12 bg-white/5 border border-white/10 rounded-2xl shadow-inner transition-all focus-within:ring-2 ring-primary/30">
                        <SearchIcon size={16} className="text-primary/50 mr-3" />
                        <input 
                            type="text" 
                            placeholder="Scan Infrastructures..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-[11px] font-black text-text-primary focus:outline-none placeholder:text-white/20 uppercase tracking-widest"
                        />
                        {isSearching && <Activity size={14} className="text-primary animate-pulse ml-2" />}
                    </form>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onLocate(); }}
                    className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-neural active:scale-90 transition-all border border-primary/20"
                >
                    <Locate size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* Expanded Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 pt-4 custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
                <h2 className="text-[14px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                    Neural Sector <Activity size={16} className="text-primary" />
                </h2>
                <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mt-1 italic opacity-50">Infrastructure Density: {facilities.length} nodes</span>
            </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {facilities.length > 0 ? (
                facilities.map((f) => (
                    <motion.div 
                        key={f.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => onFacilityClick(f)}
                        className="bg-white/5 border border-white/10 p-5 rounded-[32px] active:scale-95 transition-all relative overflow-hidden group shadow-sm hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-[13px] font-black text-text-primary leading-tight mb-2 group-hover:text-primary transition-colors pr-8">{f.name}</h3>
                                <div className="flex items-center gap-3">
                                    <div className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${f.type.includes('pharm') || f.name.toLowerCase().includes('pharm') ? 'bg-primary/20 text-primary' : (f.type.includes('lab') ? 'bg-purple-500/20 text-purple-500' : 'bg-red-500/20 text-red-500')}`}>
                                        {f.type}
                                    </div>
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">{f.dist?.toFixed(1)} km</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                {f.type.includes('pharm') || f.name.toLowerCase().includes('pharm') ? <FlaskConical size={18} /> : (f.type.includes('lab') ? <Zap size={18} /> : <Stethoscope size={18} />)}
                            </div>
                        </div>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); openGoogleMaps(f); }}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/20 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-secondary transition-all"
                        >
                            Navigate Destination <ArrowUpRight size={12} />
                        </button>
                    </motion.div>
                ))
            ) : (
                <div className="py-24 flex flex-col items-center justify-center opacity-30">
                    <Activity size={32} className="text-primary animate-pulse mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Analyzing Local Grid...</span>
                </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
