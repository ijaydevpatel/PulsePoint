"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Search, Map as MapIcon, Hospital, Cross, MapPin, Loader2, Navigation, Activity, LocateFixed, Pill, ClipboardPlus, Microscope, Store, RefreshCcw } from "lucide-react";
import { useTheme } from "@/components/core/ThemeProvider";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const userMarker = useRef<any>(null);
  
  // STABILITY: Marker Pooling System (HTML Pills only)
  const markersRef = useRef<Map<string, any>>(new Map());
  const isScanningRef = useRef(false);
  const { theme } = useTheme();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false); 
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [lng] = useState(72.963);
  const [lat] = useState(22.562);
  const [zoom] = useState(14.5);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
  const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  // LOGIC: Filter Infrastructure (Spectrum Memo)
  const filteredInfrastructure = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return infrastructure;
    return infrastructure.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.type.toLowerCase().includes(query)
    );
  }, [infrastructure, searchQuery]);

  // HELPER: COLLISION GUARD (Optimized for Mobile Visibility)
  const checkLabelCollisions = useCallback(() => {
    // STRICT MOBILE FIX: Do not hide labels on mobile view strictly
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    
    const labels = document.querySelectorAll('.node-pill-marker');
    const labelRects: DOMRect[] = [];
    
    requestAnimationFrame(() => {
        labels.forEach((label: any) => {
          if (label.style.display === 'none') {
             label.style.visibility = 'hidden';
             return;
          }

          label.style.visibility = 'visible';
          
          // STRICT MOBILE PROTECTION: Always show labels on mobile to avoid 'missing list' perception
          if (isMobile) {
            label.style.display = 'block';
            return;
          } 

          const rect = label.getBoundingClientRect();
          let isOverlapping = false;
          
          for (const otherRect of labelRects) {
            if (!(rect.right < otherRect.left + 5 || rect.left > otherRect.right - 5 || rect.bottom < otherRect.top + 5 || rect.top > otherRect.bottom - 5)) {
              isOverlapping = true;
              break;
            }
          }

          if (isOverlapping) { 
             label.style.visibility = 'hidden'; 
          } else { 
             labelRects.push(rect); 
          }
        });
    });
  }, []);

  // SYNC: Update Map Visibility based on Filter (The "Duo-Sync" Bridge)
  useEffect(() => {
    if (!map.current) return;
    const mi = map.current;
    
    // 1. UPDATE WEBGL DATA (The Dots)
    if (mi.getSource('clinical-infrastructure')) {
       const features = filteredInfrastructure.map(node => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: node.coords },
          properties: { 
            id: node.id, 
            color: node.hex, 
            name: node.name, 
            type: node.type 
          }
       }));
       
       try {
         mi.getSource('clinical-infrastructure').setData({ type: 'FeatureCollection', features });
       } catch(e) {}
    }

    // 2. UPDATE HTML PILLS (The Labels)
    const query = searchQuery.toLowerCase().trim();
    markersRef.current.forEach((marker, id) => {
       const item = infrastructure.find(node => node.id === id);
       if (item) {
          const match = !query || 
             item.name.toLowerCase().includes(query) || 
             item.type.toLowerCase().includes(query);
          
          const el = marker.getElement();
          if (match) {
             el.style.display = 'block';
             el.style.visibility = 'visible';
          } else {
             el.style.display = 'none';
          }
       }
    });

    checkLabelCollisions();
  }, [filteredInfrastructure, infrastructure, searchQuery, checkLabelCollisions]);

  // HYBRID UI: Premium Rounded Pill Label
  const createClinicalPill = (label: string) => {
    const el = document.createElement('div');
    el.className = 'node-pill-marker';
    el.style.pointerEvents = 'none';
    el.style.whiteSpace = 'nowrap';
    el.style.willChange = 'transform';
    el.innerHTML = `<div class="node-label-pill">${label}</div>`;
    return el;
  };

  const createIdentityMarker = () => {
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.width = '48px';
    el.style.height = '48px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.zIndex = '10001';
    el.style.overflow = 'visible';
    el.innerHTML = `
      <div class="user-dot-pulse"></div>
      <div class="user-dot-core" style="background: #2563eb; border: 2px solid #fff; box-shadow: 0 0 14px #2563eb;"></div>
    `;
    return el;
  };

  const calculateDistance = (p1: [number, number], p2: [number, number]) => {
    const R = 6371;
    const dLat = (p2[1] - p1[1]) * Math.PI / 180;
    const dLon = (p2[0] - p1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const scanClinicalNodes = useCallback(async (mapInstance: any) => {
    if (!mapInstance || isScanningRef.current) return;
    isScanningRef.current = true;
    setIsScanning(true);
    
    try {
      const bounds = mapInstance.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
      
      const query = `
        [out:json][timeout:35];
        (
          node["amenity"~"hospital|clinic|pharmacy|doctors|dentist|healthcare|social_facility|health_post|nursing_home|veterinary|laboratory|blood_bank"](${bbox});
          node["healthcare"~"hospital|clinic|doctor|pharmacy|laboratory|blood_bank|diagnostic|center|physiotherapist|rehab|radiology|medical_center|mri|scanning"](${bbox});
          node["shop"~"medical_supply|chemist|pharmacy|optician|hearing_aid"](${bbox});
          node["office"~"physician|psychiatrist|psychologist|healthcare|laboratory|diagnostic"](${bbox});
          way["amenity"~"hospital|clinic|pharmacy|doctors|dentist|healthcare|social_facility|health_post|nursing_home|laboratory|blood_bank"](${bbox});
          way["healthcare"~"hospital|clinic|doctor|pharmacy|laboratory|blood_bank|diagnostic|center|radiology|mri|scanning"](${bbox});
          way["shop"~"pharmacy|chemist"](${bbox});
        );
        out body center;
      `;
      
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("SAT-SYNC FAULT");
      
      const data = await response.json();
      const lib = await import("maplibre-gl");
      const maplibregl = lib.default || lib;
      
      const currentNodes: any[] = [];
      const features: any[] = [];
      const foundIds = new Set<string>();

      data.elements.forEach((el: any) => {
        const id = `${el.id}`;
        foundIds.add(id);
        const coords: [number, number] = el.type === 'node' ? [el.lon, el.lat] : [el.center.lon, el.center.lat];
        const rawName = el.tags?.name || el.tags?.["name:en"] || "Clinical Node";
        const amString = `${el.tags?.amenity || ""} ${el.tags?.healthcare || ""} ${el.tags?.shop || ""} ${el.tags?.office || ""}`.toLowerCase();

        let nodeHex = "#e11d48"; // Default: Red (Hospitals)
        let tw = "text-primary";
        let icComp = Hospital;
        let fl = "Clinical Node";

        if (amString.match(/pharmacy|chemist|medical_supply|drugstore|medicine|optician|hearing_aid/)) { 
           nodeHex = "#10b981"; tw = "text-green-500 font-black"; icComp = Pill; fl = "Medical Store"; 
        } else if (amString.match(/laboratory|blood_bank|diagnostic|lab|pathology|radiology|center|mri|scanning|scan/)) { 
           nodeHex = "#10b981"; tw = "text-green-500 font-black"; icComp = Microscope; fl = "Diagnostic Lab"; 
        } else if (amString.match(/doctor|dentist|clinic|general|physician|physiothe|physio|rehab|psych/)) { 
           nodeHex = "#a855f7"; tw = "text-purple-500 font-black"; icComp = ClipboardPlus; fl = "Clinical Triage"; 
        }

        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: coords },
          properties: { id, color: nodeHex, name: rawName, type: fl }
        });

        if (!markersRef.current.has(id)) {
           try {
             const pillEl = createClinicalPill(rawName.toUpperCase());
             const marker = new (maplibregl as any).Marker({ element: pillEl, anchor: 'bottom', offset: [0, -12] }).setLngLat(coords).addTo(mapInstance);
             markersRef.current.set(id, marker);
           } catch(e) {}
        }

        const dist = userPos ? calculateDistance(userPos, coords) : "...";
        currentNodes.push({ id, name: rawName, type: fl.toUpperCase(), hex: nodeHex, dist: dist, coords, icon: icComp, color: tw });
      });

      markersRef.current.forEach((marker, id) => {
         if (!foundIds.has(id)) { try { marker.remove(); markersRef.current.delete(id); } catch(e) {} }
      });

      if (mapInstance.getSource('clinical-infrastructure')) {
         mapInstance.getSource('clinical-infrastructure').setData({ type: 'FeatureCollection', features });
      }

      setInfrastructure(currentNodes.slice(0, 500));
      setTimeout(checkLabelCollisions, 800);

    } catch(err) {
      console.warn("Clinical Intelligence Handshake fault...");
    } finally {
      isScanningRef.current = false;
      setIsScanning(false);
    }
  }, [userPos, checkLabelCollisions]);

  const injectClinicalHardware = (mi: any) => {
     if (!mi || mi.getSource('clinical-infrastructure')) return;
     mi.addSource('clinical-infrastructure', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
     
     mi.addLayer({ 
        id: 'clinical-glow', 
        type: 'circle', 
        source: 'clinical-infrastructure', 
        paint: { 
           'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 10, 2, 15, 7, 20, 20], 
           'circle-color': ['get', 'color'], 
           'circle-opacity': 0.3, 
           'circle-blur': 0.85 
        } 
     });

     mi.addLayer({ 
        id: 'clinical-pulses', 
        type: 'circle', 
        source: 'clinical-infrastructure', 
        paint: { 
           'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 10, 1.2, 15, 4.5, 20, 10], 
           'circle-color': ['get', 'color'], 
           'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 13, 0.5, 16, 1.5], 
           'circle-stroke-color': '#000000', 
           'circle-opacity': 1.0 
        } 
     });
  };

  const inject3DArchitecture = (mapInstance: any, isDark: boolean) => {
    if (!mapInstance || !mapInstance.getStyle()) return;
    const style = mapInstance.getStyle();
    const sn = style.sources.carto ? 'carto' : 'openmaptiles';
    style.layers.forEach((layer: any) => { if (layer.id.includes('building') && !layer.id.startsWith('3d-')) { try { mapInstance.setLayoutProperty(layer.id, 'visibility', 'none'); } catch(e) {} } });
    const architecturalLayers = ['building', 'building-part', 'buildings', 'architectural'];
    const sourceObj: any = mapInstance.getSource(sn);
    const availableLayers = sourceObj?.vectorLayerIds || sourceObj?._vectorLayers?.map((l: any) => l.id) || ['building'];
    architecturalLayers.forEach(layerName => {
      if (!availableLayers.includes(layerName)) return;
      const layerId = `3d-${layerName}`;
      if (mapInstance.getLayer(layerId)) { try { mapInstance.removeLayer(layerId); } catch(e) {} }
      try {
          mapInstance.addLayer({ 'id': layerId, 'source': sn, 'source-layer': layerName, 'type': 'fill-extrusion', 'minzoom': 13, 'paint': { 'fill-extrusion-color': isDark ? '#ffffff' : '#000000', 'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.05, ['*', ['coalesce', ['get', 'render_height'], ['get', 'height'], 30], 3]], 'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.05, ['*', ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0], 3]], 'fill-extrusion-opacity': 1.0 } });
      } catch (err) {}
    });
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    const initializeMap = async () => {
      if (!mapContainer.current) return;
      try {
        const lib = await import("maplibre-gl");
        const maplibregl = lib.default || lib;
        const mapInstance = new (maplibregl as any).Map({ container: mapContainer.current, style: theme === 'dark' ? DARK_STYLE : LIGHT_STYLE, center: [lng, lat], zoom: zoom, pitch: 62, bearing: -15, attributionControl: false, antialias: true });
        mapInstance.on('load', () => { if (!mapInstance) return; inject3DArchitecture(mapInstance, theme === 'dark'); injectClinicalHardware(mapInstance); scanClinicalNodes(mapInstance); });
        map.current = mapInstance;
      } catch (err) { console.warn("Neural engine check..."); }
    };
    initializeMap();
    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    const mi = map.current;
    const handleMove = () => { if (mi.getZoom() > 11) { scanClinicalNodes(mi); } checkLabelCollisions(); };
    mi.on('moveend', handleMove);
    return () => { mi.off('moveend', handleMove); };
  }, [scanClinicalNodes, checkLabelCollisions]);

  useEffect(() => {
    if (!map.current) return;
    const mi = map.current;
    try {
      mi.setStyle(theme === 'dark' ? DARK_STYLE : LIGHT_STYLE);
      mi.once('styledata', () => { inject3DArchitecture(mi, theme === 'dark'); injectClinicalHardware(mi); scanClinicalNodes(mi); });
    } catch (e) {}
  }, [theme, scanClinicalNodes]);

  const onSynchronize = () => {
    if (!map.current || isSyncing) return;
    setIsSyncing(true);
    
    const geoOptions = { 
      enableHighAccuracy: true, 
      timeout: 15000, // Increased for mobile reliability
      maximumAge: 0 
    };

    if (typeof window !== "undefined" && navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => { 
           setUserPos([pos.coords.longitude, pos.coords.latitude]); 
           setIsSyncing(false); 
         }, 
         (err) => { 
           console.warn("High Accuracy Pulse Failed, attempting balanced sync...", err);
           // Fallback to balanced accuracy if high fidelity fails or times out
           navigator.geolocation.getCurrentPosition(
             (pos) => {
               setUserPos([pos.coords.longitude, pos.coords.latitude]);
               setIsSyncing(false);
             },
             () => { setIsSyncing(false); },
             { enableHighAccuracy: false, timeout: 10000 }
           );
         }, 
         geoOptions
       );
    } else { setIsSyncing(false); }
  };

  // SYNC: Force-Scan infrastructure when Mobile Drawer opens to ensure list is never empty
  useEffect(() => {
    if (isMobileDrawerOpen && map.current) {
      scanClinicalNodes(map.current);
    }
  }, [isMobileDrawerOpen, scanClinicalNodes]);

  useEffect(() => {
    if (!map.current || !userPos) return;
    const syncIdentityHub = async () => {
       try {
         const lib = await import("maplibre-gl");
         const maplibregl = lib.default || lib;
         if (userMarker.current) { userMarker.current.setLngLat(userPos); } else {
           const el = createIdentityMarker();
           userMarker.current = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(userPos).addTo(map.current);
         }
         map.current.flyTo({ center: userPos, zoom: 16, duration: 2500, pitch: 65 });
         setTimeout(() => { if (map.current) scanClinicalNodes(map.current); }, 2700);
       } catch(e) {}
    };
    syncIdentityHub();
  }, [userPos, scanClinicalNodes]);

  const zoomToNode = (coords: [number, number]) => {
    if (!map.current) return;
    map.current.flyTo({ center: coords, zoom: 17.5, pitch: 65, duration: 2500, essential: true });
    if (window.innerWidth < 768) { setIsMobileDrawerOpen(false); }
  };

  const getDirections = (node: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${node.coords[1]},${node.coords[0]}`;
    window.open(url, "_blank");
  };

  const refreshInfrastructure = () => { if (map.current) { scanClinicalNodes(map.current); } };

  return (
    <div className="h-full w-full relative overflow-hidden bg-background-app uppercase font-black tracking-tight">
      <div ref={mapContainer} className="absolute inset-0 z-0 h-full w-full" />

      {/* HUD STACK */}
      <div className="hidden md:flex absolute top-8 left-[112px] bottom-8 w-[390px] flex-col gap-5 z-10 pointer-events-none">
         <div className="bg-surface-glass/40 backdrop-blur-3xl border border-border-glass/30 rounded-[40px] p-6 shadow-neural pointer-events-auto shrink-0 flex flex-col gap-6">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20"><MapIcon size={20} /></div>
               <div>
                  <h1 className="text-xl font-display font-black text-text-primary tracking-tighter uppercase leading-none">Medical Map</h1>
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-40 mt-1">Saturated Intelligence</p>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[20px] p-1.5 focus-within:border-primary/40 focus-within:bg-white/10 transition-all shadow-inner group">
               <div className="w-9 h-9 rounded-[14px] bg-primary/10 flex items-center justify-center text-primary group-focus-within:scale-95 transition-transform"><Search size={18} /></div>
               <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="FILTER SPECTRUM..." 
                  className="bg-transparent text-[10px] font-black text-text-primary focus:outline-none placeholder:text-text-secondary uppercase tracking-[0.05em] flex-1" 
               />
               {searchQuery && (
                 <button onClick={() => setSearchQuery("")} className="px-3 text-[9px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors">Clear</button>
               )}
            </div>
         </div>

         <div className="bg-surface-glass/40 backdrop-blur-3xl border border-border-glass/30 rounded-[40px] p-8 shadow-neural pointer-events-auto flex-1 min-h-0 flex flex-col">
            <div className="flex flex-col gap-2 mb-8 shrink-0">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-display">Neural Spectrum</h4>
                     <button onClick={refreshInfrastructure} disabled={isScanning} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-90 border border-primary/20 flex items-center justify-center">
                        <RefreshCcw size={12} className={isScanning ? "animate-spin" : ""} />
                     </button>
                  </div>
                  {isScanning && (
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-primary uppercase tracking-widest animate-pulse leading-none">SAT-SYNC MONITORING</span>
                    </div>
                  )}
               </div>
               <p className="text-[11px] font-black text-text-primary tracking-tight leading-none opacity-80 uppercase truncate">
                  {searchQuery ? `Filtering: ${searchQuery}` : "Live Infinity Infrastructure"}
               </p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6">
               <AnimatePresence mode="popLayout">
                  {filteredInfrastructure.length > 0 ? filteredInfrastructure.map((node, i) => (
                    <motion.div 
                       layout 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       key={node.id} 
                       className="flex items-center justify-between group py-2 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-2xl px-2 transition-colors text-left uppercase"
                    >
                        <div onClick={() => zoomToNode(node.coords as [number, number])} className="flex flex-col gap-2 flex-1 cursor-pointer min-w-0 text-left">
                           <span className="text-[12px] font-black text-text-primary tracking-tight leading-tight group-hover:text-primary transition-colors truncate">{node.name}</span>
                           <div className="flex items-center gap-4 text-[9px] font-black text-text-secondary tracking-widest leading-none">
                              <span className={`flex items-center gap-2 ${node.color} truncate`}><node.icon size={11} /> {node.type}</span>
                              <span className="opacity-40">• {node.dist} KM</span>
                           </div>
                        </div>
                        <button onClick={() => getDirections(node)} className="w-11 h-11 rounded-xl bg-white/5 hover:bg-primary/20 flex items-center justify-center text-text-secondary hover:text-primary transition-all pointer-events-auto border border-white/10 shadow-sm shrink-0"><Navigation size={16} /></button>
                    </motion.div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
                       <Search size={40} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">No Infrastructure Matches</span>
                    </div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>

      <div className="flex fixed bottom-[90px] right-4 md:bottom-10 md:right-10 z-[150]">
         <button onClick={onSynchronize} disabled={isSyncing} className="w-14 h-14 bg-surface-glass/80 backdrop-blur-3xl border border-border-glass rounded-full shadow-float flex items-center justify-center text-primary group active:scale-95 transition-all pointer-events-auto shadow-neutral-blue focus:outline-none shadow-neutral">
            {isSyncing ? <Loader2 size={24} className="animate-spin" /> : <LocateFixed size={26} />}
         </button>
      </div>

      <motion.div initial={false} animate={{ height: isMobileDrawerOpen ? '65vh' : '72px' }} className="md:hidden fixed bottom-0 inset-x-0 bg-surface-glass/80 backdrop-blur-3xl border-t border-border-glass rounded-t-[40px] z-50 pointer-events-auto flex flex-col overflow-hidden text-left uppercase">
         <div onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)} className="h-[72px] w-full flex flex-col items-center justify-center shrink-0 cursor-pointer text-center">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mb-2" />
            <div className="flex items-center gap-2"><Activity size={12} className="text-primary animate-pulse" /><span className="text-[10px] font-black text-text-primary uppercase tracking-[0.3em]">Precision Spectrum Scan</span></div>
         </div>
         <div className="flex-1 overflow-hidden px-6 pb-8 flex flex-col gap-8 text-left">
            <div className="flex flex-col gap-4 shrink-0">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest font-display">Neural Spectrum</h4>
                  <button onClick={refreshInfrastructure} disabled={isScanning} className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 active:scale-90 transition-all"><RefreshCcw size={16} className={isScanning ? "animate-spin" : ""} /></button>
               </div>
               <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[16px] p-1 pr-4 pointer-events-auto">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Search size={18} /></div>
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="FILTER SPECTRUM..." className="bg-transparent text-[10px] font-black text-text-primary focus:outline-none w-full uppercase tracking-widest" />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6 pointer-events-auto">
               <AnimatePresence mode="popLayout">
               {filteredInfrastructure.map((node, i) => (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={node.id} className="flex items-center justify-between group py-1">
                     <div onClick={() => zoomToNode(node.coords as [number, number])} className="flex flex-col gap-1 min-w-0 cursor-pointer text-left">
                        <span className="text-[11px] font-black text-text-primary uppercase truncate group-hover:text-primary transition-colors">{node.name}</span>
                        <div className="flex items-center gap-3 text-[8px] font-black text-text-secondary uppercase tracking-wider">
                           <span className={node.color}>{node.type}</span>
                           <span className="opacity-40">• {node.dist} KM</span>
                        </div>
                     </div>
                     <button onClick={() => getDirections(node)} className="p-3.5 rounded-xl bg-white/5 text-text-secondary hover:bg-primary border border-white/10 transition-all active:scale-90"><Navigation size={14} /></button>
                  </motion.div>
               ))}
               </AnimatePresence>
            </div>
         </div>
      </motion.div>

      <style jsx global>{`
         .node-pill-marker { z-index: 10000; }
         .node-label-pill { background: #000; color: #fff; padding: 6px 14px; border-radius: 100px; font-size: 8px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.5); opacity: 1; transition: opacity 0.3s; }
         .user-location-marker { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; z-index: 10001 !important; }
         .user-dot-core { width: 14px; height: 14px; background: #2563eb; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px rgba(37, 99, 235, 0.9); z-index: 10; }
         .user-dot-pulse { position: absolute; width: 36px; height: 36px; background: rgba(37, 99, 235, 0.4); border-radius: 50%; animation: user-heartbeat 2.5s infinite; }
         @keyframes user-heartbeat { 0% { transform: scale(0.7); opacity: 0.9; } 70% { transform: scale(1.6); opacity: 0; } 100% { transform: scale(0.7); opacity: 0; } }
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
