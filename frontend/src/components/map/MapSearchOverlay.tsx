"use client";

import React from "react";
import { Search, MapPin, Locate } from "lucide-react";
import { motion } from "framer-motion";

interface MapSearchOverlayProps {
  onSearch: (query: string) => void;
  onLocateUser: () => void;
}

export function MapSearchOverlay({ onSearch, onLocateUser }: MapSearchOverlayProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-[50] flex flex-col gap-4 lg:hidden pointer-events-none">
      <div className="flex gap-2 pointer-events-auto">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search medical facilities..." 
            className="w-full h-12 pl-12 pr-4 bg-background-app/90 backdrop-blur-xl border border-border-glass rounded-2xl text-sm font-bold shadow-lg focus:outline-none focus:border-primary/50 transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={onLocateUser}
          className="w-12 h-12 bg-background-app/90 backdrop-blur-xl border border-border-glass rounded-2xl flex items-center justify-center text-text-primary shadow-lg active:scale-95 transition-all"
        >
          <Locate size={20} />
        </button>
      </div>
    </div>
  );
}
