"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Search, 
  Clock, 
  Filter,
  Activity,
  ExternalLink,
  ChevronRight,
  RefreshCcw
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface NewsArticle {
  id: string;
  title: string;
  snippet: string;
  source: string;
  date: string;
  link: string;
  category: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchNews();
    
    // Auto-Update Synchronization: Polling every 2 minutes for high-density recency
    const interval = setInterval(() => {
      fetchNews(true);
    }, 120000); 

    return () => clearInterval(interval);
  }, [debouncedSearch]);

  const fetchNews = async (isPoll = false) => {
    if (!isPoll) setIsLoading(true);
    try {
      const url = `/news?q=${encodeURIComponent(debouncedSearch)}`;
      const data = await apiClient.get(url);
      setNews(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("News Sync Fault:", error);
    } finally {
      if (!isPoll) setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col pt-4 px-6 pb-6 absolute inset-0 overflow-hidden"
    >
      {/* Visual Density Header */}
      <div className="flex flex-col mb-4 mt-2 z-20 shrink-0">
        <h1 className="text-3xl font-sans font-black text-text-primary tracking-tight flex items-center gap-3">
          <Globe className="text-primary animate-pulse" size={28} />
          Global Health Horizons
        </h1>
        <p className="text-text-secondary mt-1 font-medium italic opacity-80">
          Neural Uplink: Global Combined Intelligence Feed
        </p>
      </div>

      {/* Utility Bar - Squircle Styled */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 z-20 shrink-0 bg-surface-glass/40 backdrop-blur-md p-6 rounded-[32px] border border-border-glass shadow-sm">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-secondary">
               <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                  <Activity size={12} />
                  {debouncedSearch ? "Archives" : "Live 4-Day Window"}
               </div>
               <span className="flex items-center gap-1.5 opacity-60">
                  <Clock size={12} />
                  Scan: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               <button 
                 onClick={() => fetchNews(false)}
                 disabled={isLoading}
                 className="ml-2 p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all active:scale-90 disabled:opacity-50"
                 title="Force Neural Sync"
               >
                  <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
               </button>
            </div>
        </div>

        <div className="flex items-center gap-3 bg-surface-low border border-border-glass rounded-2xl px-5 py-3 w-full md:w-96 shadow-sm focus-within:border-primary transition-all">
          <Search size={18} className="text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search Global Archives..." 
            className="bg-transparent border-none outline-none text-sm text-text-primary w-full font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main High-Density Grid (4 Columns on wide, 1 on mobile) */}
      <div className="flex-1 overflow-y-auto hide-scrollbar z-20 pb-20">
        {isLoading ? (
          <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
             <Activity className="animate-spin text-primary opacity-40" size={48} />
             <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary animate-pulse">Aggregating Global Network...</p>
          </div>
        ) : (
          <>
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                <AnimatePresence>
                  {news.map((article) => (
                    <motion.a
                      key={article.id}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variants={itemVariants}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="group flex flex-col bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[40px] p-8 overflow-hidden shadow-sm hover:shadow-float-heavy transition-all duration-300 min-h-[320px] relative"
                    >
                      {/* Squircle Kinetic Accent */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[8px] uppercase font-black tracking-widest text-primary">
                           {article.category}
                        </span>
                        <div className="p-2 bg-surface-low rounded-xl text-text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                           <ExternalLink size={14} />
                        </div>
                      </div>

                      <h3 className="text-[16px] font-bold text-text-primary mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-4 h-[4.5rem]">
                        {article.title}
                      </h3>
                      
                      <p className="text-text-secondary text-xs line-clamp-4 mb-6 font-medium italic leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                        {article.snippet}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-border-glass pt-4">
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-40">
                            <Clock size={12} />
                            {new Date(article.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                         </div>
                         <span className="text-[9px] font-black uppercase text-primary/60 tracking-wider font-mono">{article.source}</span>
                      </div>
                    </motion.a>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full py-32 flex flex-col items-center justify-center text-center gap-6"
              >
                 <div className="w-20 h-20 bg-surface-glass border border-border-glass rounded-full flex items-center justify-center text-text-secondary opacity-30">
                    <Filter size={32} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-text-primary tracking-tight">Zero Clinical Matches</h3>
                    <p className="text-text-secondary mt-2 max-w-sm mx-auto font-medium text-sm">
                       Try broadening your search or resetting the recency window.
                    </p>
                 </div>
                 <button 
                   onClick={() => setSearchQuery("")}
                   className="px-8 py-3 bg-surface-low border border-border-glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                 >
                    Reset Grid
                 </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
