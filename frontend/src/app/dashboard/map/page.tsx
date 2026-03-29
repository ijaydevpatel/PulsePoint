"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LocateFixed, Activity, Sparkles, Navigation, FlaskConical, Stethoscope, Wifi, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black flex items-center justify-center text-primary/50 font-black uppercase tracking-[0.3em] text-[10px]">Syncing 3D Neural Space...</div>
});

interface Facility {
  id: string | number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  dist?: number;
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<[number, number]>([22.585, 72.815]); 
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedFacility, setFocusedFacility] = useState<Facility | null>(null);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const getBaselineFacilities = useCallback((lat: number, lon: number): Facility[] => {
    if (Math.abs(lat - 22.58) > 0.2) return []; 
    return [
      { id: 'b1', lat: 22.5612, lon: 72.9468, name: "Zydus Hospital Anand", type: "hospital", dist: calculateDistance(lat, lon, 22.5612, 72.9468) },
      { id: 'b2', lat: 22.5658, lon: 72.9351, name: "Civil Hospital Anand", type: "hospital", dist: calculateDistance(lat, lon, 22.5658, 72.9351) },
      { id: 'b3', lat: 22.5589, lon: 72.9405, name: "Apollo Pharmacy", type: "pharmacy", dist: calculateDistance(lat, lon, 22.5589, 72.9405) },
      { id: 'b4', lat: 22.5634, lon: 72.9432, name: "Sardar Patel Hospital", type: "hospital", dist: calculateDistance(lat, lon, 22.5634, 72.9432) },
      { id: 'b5', lat: 22.5621, lon: 72.9510, name: "Shreeji Pathology Lab", type: "laboratory", dist: calculateDistance(lat, lon, 22.5621, 72.9510) },
      { id: 'b6', lat: 22.5567, lon: 72.9389, name: "Nilkanth Pharmacy", type: "pharmacy", dist: calculateDistance(lat, lon, 22.5567, 72.9389) },
      { id: 'b7', lat: 22.5678, lon: 72.9444, name: "Anand Dental Clinic", type: "dentist", dist: calculateDistance(lat, lon, 22.5678, 72.9444) }
    ];
  }, [calculateDistance]);

  const fetchNearbyFacilities = useCallback(async (lat: number, lon: number, rawFilter: string) => {
    setIsSearching(true);
    
    let filter = rawFilter.trim().toLowerCase();
    let queryTags = "hospital|clinic|pharmacy|doctors|pathology|dentist|laboratory|social_facility|optician|medical_supply|chemist";
    
    if (filter === "lab") queryTags = "pathology|laboratory|mri|xray|diagnostic";
    else if (filter === "pharmacy" || filter === "medical") queryTags = "pharmacy|chemist|medical_supply";
    else if (filter === "hospital") queryTags = "hospital|clinic|doctors";

    const baseline = getBaselineFacilities(lat, lon).filter(f => 
       filter.length > 1 ? (f.name.toLowerCase().includes(filter) || f.type.toLowerCase().includes(filter)) : true
    );
    setFacilities(baseline);

    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];
    
    const query = `[out:json][timeout:30];(node["amenity"~"${queryTags}"](around:20000,${lat},${lon});way["amenity"~"${queryTags}"](around:20000,${lat},${lon});node["shop"~"${queryTags}"](around:20000,${lat},${lon});node["healthcare"](around:20000,${lat},${lon});node["name"~"${filter || 'Medical|Health'}",i](around:20000,${lat},${lon}););out center;`;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`);
        if (!response.ok) continue;
        const data = await response.json();
        const mapped: Facility[] = (data.elements || []).map((el: any) => ({
          id: el.id,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          name: el.tags.name || el.tags["name:en"] || el.tags.operator || "Medical Unit",
          type: el.tags.amenity || el.tags.healthcare || el.tags.shop || "medical",
          dist: calculateDistance(lat, lon, (el.lat || el.center?.lat), (el.lon || el.center?.lon))
        }))
        .filter((f: any) => filter.length > 1 ? (f.name.toLowerCase().includes(filter) || f.type.toLowerCase().includes(filter)) : true)
        .sort((a: Facility, b: Facility) => (a.dist || 0) - (b.dist || 0))
        .slice(0, 150);

        setFacilities(prev => {
            const ids = new Set(mapped.map(m => m.id));
            const filteredPrev = prev.filter(p => !ids.has(p.id));
            return [...filteredPrev, ...mapped].sort((a: Facility, b: Facility) => (a.dist || 0) - (b.dist || 0));
        });
        setIsSearching(false);
        return;
      } catch (err) { continue; }
    }
    setIsSearching(false);
  }, [calculateDistance, getBaselineFacilities]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNearbyFacilities(userLocation[0], userLocation[1], searchQuery);
  };

  const handleLocate = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setIsLocating(false);
        fetchNearbyFacilities(latitude, longitude, searchQuery);
      },
      (err) => {
        setIsLocating(false);
        fetchNearbyFacilities(userLocation[0], userLocation[1], searchQuery);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => { handleLocate(); }, []);

  const openGoogleMaps = (f: Facility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col absolute inset-0 bg-black overflow-hidden font-sans">
      
      {/* 3D Active Pill */}
      <div className="absolute top-[88px] right-6 z-[100] flex items-center gap-4 px-6 py-2.5 bg-primary/10 backdrop-blur-3xl rounded-full border border-primary/20 shadow-2xl pointer-events-none group">
         <Zap size={14} className="text-primary animate-pulse" />
         <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Neural 3D Active</span>
         <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest italic tracking-tighter">MAX_DENSITY_discovery</span>
         </div>
      </div>

      <div className="flex-1 flex relative">
        <div className="flex-1 relative z-10 overflow-hidden">
          <MapComponent 
            userLocation={userLocation} 
            facilities={facilities}
            focusedFacility={focusedFacility}
            onMapClick={(lat, lon) => { fetchNearbyFacilities(lat, lon, searchQuery); }}
            onFacilitySelect={(f) => setFocusedFacility(f)}
          />
        </div>

        {/* Intelligence Overlays (Offset for Sidebar Harmony) */}
        <div className="absolute top-6 left-[92px] z-30 pointer-events-none w-80 max-h-[92%] flex flex-col">
          <div className="pointer-events-auto bg-black/60 backdrop-blur-3xl p-6 rounded-[40px] border border-white/10 shadow-3xl mb-4 flex flex-col gap-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                Infinity Grid <Sparkles size={18} className="text-primary" />
              </h1>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mt-1 ml-1 opacity-80 italic italic">Neural Search Optimized</span>
            </div>

            <div className="relative group focus-within:ring-2 ring-primary/30 transition-all rounded-full bg-white/5 border border-white/10 overflow-hidden shadow-inner">
              <form onSubmit={handleGlobalSearch} className="flex items-center px-5">
                 <Search size={16} className="text-primary opacity-50" />
                 <input 
                  type="text" 
                  placeholder="Scan Lab, Pharmacy, Hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent py-4 px-3 text-[11px] font-bold text-text-primary focus:outline-none placeholder:text-white/20"
                 />
              </form>
            </div>
          </div>

          <div className="pointer-events-auto flex-1 bg-black/60 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 shadow-3xl flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                 <h2 className="text-[12px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                   Neural Sector <Activity size={16} className="text-primary" />
                 </h2>
                 <span className="text-[8.5px] font-black text-text-secondary uppercase tracking-[0.2em] mt-2 italic opacity-50 tracking-tighter">Clinical Infrastructure</span>
              </div>
              <Wifi size={14} className={isSearching ? 'text-primary animate-ping' : 'text-green-400'} />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-3 scrollbar-none custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {facilities.length > 0 ? (
                  facilities.map((f) => (
                    <motion.div 
                      key={f.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onClick={() => setFocusedFacility(f)}
                      className={`group bg-white/5 hover:bg-white/10 border p-5 rounded-[32px] cursor-pointer transition-all duration-300 relative overflow-hidden active:scale-95 ${focusedFacility?.id === f.id ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/5'}`}
                    >
                      <div className="flex flex-col relative z-10">
                         <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                               <h3 className="text-[12.5px] font-black text-text-primary leading-tight mb-2 group-hover:text-primary transition-colors">{f.name}</h3>
                               <div className="flex items-center gap-3">
                                  <div className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${f.type.includes('pharm') || f.name.toLowerCase().includes('pharm') ? 'bg-primary/20 text-primary' : (f.type.includes('lab') ? 'bg-purple-500/20 text-purple-500' : 'bg-red-500/20 text-red-500')}`}>
                                     {f.type}
                                  </div>
                                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">{f.dist?.toFixed(1)} km</span>
                               </div>
                            </div>
                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shadow-neural">
                               {f.type.includes('pharm') || f.name.toLowerCase().includes('pharm') ? <FlaskConical size={18} /> : (f.type.includes('lab') ? <Zap size={18} /> : <Stethoscope size={18} />)}
                            </div>
                         </div>
                         
                         <button 
                          onClick={(e) => { e.stopPropagation(); openGoogleMaps(f); }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/20 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-text-secondary transition-all group-hover:border-primary/30 group-hover:text-primary"
                        >
                            Get Directions <ArrowUpRight size={12} />
                         </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20">
                     <Activity size={32} className="animate-pulse mb-4 text-primary" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Analyzing Grid...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            {/* Removed the statusMsg div (the "bar") for professional UI cleanup */}
          </div>
        </div>

        {/* GPS Control (Bottom Right) */}
        <div className="absolute bottom-10 right-10 z-30 pointer-events-none w-80">
            <div className="pointer-events-auto bg-black/50 backdrop-blur-3xl p-6 rounded-[32px] border border-white/10 shadow-3xl w-full">
                <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2 italic">
                   Neural Signal <ShieldCheck size={12} />
                </label>
                <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">{isLocating ? 'Scanning...' : 'Signal Locked'}</span>
                      <span className="text-[8px] font-bold text-white/20 uppercase mt-1 tracking-widest italic opacity-50 tracking-tighter">Anand Grid Master-03</span>
                   </div>
                   <button onClick={handleLocate} disabled={isLocating} className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-neural disabled:opacity-50">
                     <LocateFixed size={20} />
                   </button>
                </div>
            </div>
        </div>

      </div>
    </motion.div>
  );
}
