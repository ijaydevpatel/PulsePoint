"use client";

import React, { useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { ChevronUp, Navigation, MapPin } from "lucide-react";

interface Facility {
  id: string | number;
  lat: number;
  lon: number;
  name: string;
  type: string;
}

interface MapInfraDrawerProps {
  facilities: Facility[];
  onFacilityClick: (f: Facility) => void;
}

export function MapInfraDrawer({ facilities, onFacilityClick }: MapInfraDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50) {
      setIsOpen(true);
      controls.start({ y: 0 });
    } else if (info.offset.y > 50) {
      setIsOpen(false);
      controls.start({ y: "calc(100% - 80px)" });
    } else {
      controls.start({ y: isOpen ? 0 : "calc(100% - 80px)" });
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ y: "calc(100% - 80px)" }}
      className="fixed inset-x-0 bottom-0 h-[70vh] bg-background-app/95 backdrop-blur-2xl border-t border-border-glass rounded-t-[32px] z-[100] lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col pt-2"
    >
      {/* Handle */}
      <div className="w-full flex flex-col items-center py-2 shrink-0">
        <div className="w-12 h-1.5 bg-text-secondary/20 rounded-full mb-1" />
        <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Medical Facilities ({facilities.length})</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 pt-4">
        <div className="space-y-4">
          {facilities.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                onFacilityClick(f);
                setIsOpen(false);
                controls.start({ y: "calc(100% - 80px)" });
              }}
              className="w-full p-4 bg-surface-low/50 border border-border-glass rounded-2xl flex items-center justify-between text-left hover:bg-surface-low transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-primary leading-tight">{f.name}</span>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-0.5">{f.type}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-glass border border-border-glass flex items-center justify-center text-text-secondary">
                <Navigation size={14} />
              </div>
            </button>
          ))}
          {facilities.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-50">
              <MapPin size={48} className="mb-4 text-text-secondary" />
              <p className="text-sm font-bold text-text-secondary">No facilities found in this area</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
