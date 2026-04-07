"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapMobileControls } from "./MapMobileControls";

interface Facility {
  id: string | number;
  lat: number;
  lon: number;
  name: string;
  type: string;
}

interface MapProps {
  userLocation: [number, number];
  facilities: Facility[];
  focusedFacility?: Facility | null;
  onMapClick: (lat: number, lon: number) => void;
  onFacilitySelect?: (f: Facility) => void;
  onLocate: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export default function MapComponent({ 
  userLocation, 
  facilities, 
  focusedFacility, 
  onMapClick, 
  onFacilitySelect,
  onLocate,
  searchQuery,
  setSearchQuery,
  isSearching,
  onSearchSubmit
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const [isReady, setIsReady] = useState(false);

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [] }, // Core Baseline to avoid migration crashes
      center: [userLocation[1], userLocation[0]],
      zoom: 17,
      pitch: 62,
      bearing: -10,
      projection: 'mercator'
    } as any);

    // Deferred style loading to prevent MapLibre 5.x projection migration race conditions
    setTimeout(() => {
      if (map.current) {
        map.current.setStyle("https://tiles.openfreemap.org/styles/dark");
      }
    }, 100);

    map.current.on("load", () => {
      if (!map.current) return;
      
      const checkSource = () => {
        if (!map.current) return;
        const style = map.current.getStyle();
        // Guard: Wait for the actual style to load (the baseline style has 0 sources)
        if (!style || !style.sources || Object.keys(style.sources).length === 0) return;

        const sourceId = Object.keys(style.sources).find(s => s.includes('maptile') || s.includes('free')) || 'openmaptiles';
        
        // Double Check: Avoid duplicate layers on style refresh
        if (map.current.getLayer('3d-buildings')) return;

        try {
          map.current.addLayer({
            'id': '3d-buildings',
            'source': sourceId,
            'source-layer': 'building',
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#111111',
              'fill-extrusion-height': ['*', ['get', 'render_height'], 1.25],
              'fill-extrusion-base': ['get', 'render_min_height'],
              'fill-extrusion-opacity': 0.85
            }
          });
          setIsReady(true);
        } catch (e) {
          console.warn("3D Layer Integration Deferred:", e);
        }
      };

      map.current.on('styledata', checkSource);
      checkSource(); // Initial check

      // Startup Animation
      setTimeout(() => {
        map.current?.easeTo({
          bearing: 20,
          duration: 3500,
          pitch: 65,
          essential: true
        });
      }, 1000);
    });

    map.current.on("click", (e) => {
      setTimeout(() => {
        if (e.defaultPrevented) return;
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      }, 100);
    });

    return () => map.current?.remove();
  }, []);

  // Static User Pulse (Only updates when real location changes)
  useEffect(() => {
    if (!map.current || !isReady) return;
    if (userMarker.current) userMarker.current.remove();

    const el = document.createElement('div');
    el.className = 'w-10 h-10 flex items-center justify-center pointer-events-none';
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="w-4 h-4 bg-sky-400 rounded-full border-2 border-white shadow-[0_0_20px_rgba(56,189,248,1)] z-10"></div>
        <div class="absolute w-12 h-12 bg-sky-400/20 rounded-full animate-ping opacity-40"></div>
      </div>
    `;

    userMarker.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation[1], userLocation[0]])
      .addTo(map.current);
    
    // Fly to user location whenever it updates (e.g. via GPS button)
    map.current.flyTo({ center: [userLocation[1], userLocation[0]], zoom: 17, duration: 2500 });
  }, [userLocation, isReady]);

  // Decoupled Focus Flight (Selection Zoom)
  useEffect(() => {
    if (!map.current || !isReady || !focusedFacility) return;

    map.current.flyTo({
      center: [focusedFacility.lon, focusedFacility.lat],
      zoom: 18,
      pitch: 75,
      duration: 2500,
      essential: true
    });
  }, [focusedFacility, isReady]);

  // Clinical Markers Restoration
  useEffect(() => {
    if (!map.current || !isReady) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    facilities.forEach(f => {
      const el = document.createElement('div');
      const nameLower = f.name.toLowerCase();
      const typeLower = f.type.toLowerCase();

      let color = 'bg-red-500'; 
      if (nameLower.includes('pharm') || typeLower.includes('pharm')) color = 'bg-primary';
      else if (nameLower.includes('lab') || typeLower.includes('pathology') || typeLower.includes('mri')) color = 'bg-purple-500';

      const isActive = focusedFacility?.id === f.id;

      // Removed scale-125 to prevent perspective drift during zoom-out.
      // Selected state is now indicated by a persistent ring and high-z-index.
      el.className = `group flex flex-col items-center justify-end cursor-pointer selection-none transition-all duration-500 ${isActive ? 'z-[100]' : 'z-10'}`;
      el.style.height = '60px';
      el.style.width = '120px';
      
      el.innerHTML = `
        <div class="relative flex flex-col items-center justify-end h-full w-full pb-2">
          <!-- Persistent Label (Floated ABOVE the dot) -->
          <div class="mb-2 bg-black/90 backdrop-blur-md px-2 py-0.5 rounded-full border ${isActive ? 'border-primary text-primary' : 'border-white/10 text-white'} shadow-2xl opacity-100 transition-all duration-300">
            <span class="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">${f.name}</span>
          </div>

          <!-- Primary Dot (Locked to the BASE/ANCHOR) -->
          <div class="relative flex items-center justify-center">
             <div class="w-4 h-4 ${color} rounded-full border-2 ${isActive ? 'border-primary ring-4 ring-primary/30' : 'border-white'} shadow-neural group-hover:scale-125 transition-all duration-300"></div>
             <div class="absolute inset-0 ${color}/20 rounded-full ${isActive ? 'animate-ping' : 'animate-pulse'} blur-[1px]"></div>
          </div>
          
          <!-- Invisible Anchor Point (Terrestrial Base) -->
          <div class="h-0.5 w-0.5 bg-transparent"></div>
        </div>
      `;
      
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onFacilitySelect) onFacilitySelect(f);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([f.lon, f.lat])
        .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div class="px-4 py-2 bg-black/95 text-[10px] font-black uppercase tracking-widest text-white rounded-2xl border border-white/10 shadow-3xl backdrop-blur-3xl">
             <div class="text-primary mb-1">${f.type}</div>
             <div class="text-white/60 text-[8px]">${f.name}</div>
          </div>
        `))
        .addTo(map.current!);
      
      markers.current.push(marker);
    });
  }, [facilities, isReady, focusedFacility]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Mobile-Only Overlays */}
      <MapMobileControls 
        facilities={filteredFacilities} 
        onFacilityClick={(f) => {
          if (onFacilitySelect) onFacilitySelect(f);
        }}
        userLocation={userLocation}
        onLocate={onLocate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        onSearchSubmit={onSearchSubmit}
      />
    </div>
  );
}
