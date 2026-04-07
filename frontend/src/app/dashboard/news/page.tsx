"use client";

import React from "react";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { Newspaper, ExternalLink, Clock, TrendingUp, Sparkles, BookOpen, Globe, ArrowUpRight, ChevronRight, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

const mockNews = [
  {
    category: "Neural Research",
    title: "Neuroplasticity breakthrough in circadian synchronization",
    source: "Clinical Neural Journal",
    time: "2h ago",
    trend: "+42%",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400"
  },
  {
    category: "Metabolic Health",
    title: "The impact of intermittent fasting on mitochondrial efficiency",
    source: "Bio-Optimization Lab",
    time: "4h ago",
    trend: "+12%",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400"
  },
  {
    category: "Longevity",
    title: "NAD+ supplementation and the 100-year human baseline",
    source: "Longevity Intelligence",
    time: "8h ago",
    trend: "+88%",
    image: "https://images.unsplash.com/photo-1576086213369-97a306dca664?auto=format&fit=crop&q=80&w=400"
  }
];

export default function NewsPage() {
  const [news, setNews] = React.useState<any[]>([]);
  const [briefing, setBriefing] = React.useState<string>("");
  const [neuralPulse, setNeuralPulse] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await apiClient.get("/news");
        setNews(data.news || []);
        setBriefing(data.neuralBriefing || "");
        setNeuralPulse(data.neuralPulse);
      } catch (err) {
        console.error("News sync failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // 5-minute Clinical Sync
    return () => clearInterval(interval);
  }, []);

  return (
    <FeatureShell 
      title="Health Intelligence" 
      subtitle={
        <div className="flex items-center gap-2">
          <span>Neural News Stream</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
             <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Live Intelligence</span>
          </div>
        </div>
      }
      icon={<Newspaper size={24} />}
      neuralPulse={neuralPulse}
    >
      <div className="flex flex-col gap-8 h-full">
        
        {/* Main Feed - High Density 4-Grid */}
        <div className="flex flex-col gap-6">
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[240px] bg-surface-low/30 rounded-[40px] animate-pulse" />
                ))
              ) : (
                news.map((n, idx) => (
                  <motion.div 
                    key={n.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-surface-glass backdrop-blur-3xl border border-border-glass rounded-[40px] overflow-hidden group shadow-sm flex flex-col h-full hover:border-primary/20 transition-all"
                  >
                    <div className="p-8 flex flex-col flex-1 gap-6">
                       <div className="flex-1">
                          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest text-primary mb-6">
                             {n.category}
                          </div>
                          <h3 className="text-lg font-display font-black text-text-primary tracking-tight line-clamp-3 leading-tight mb-4 group-hover:text-primary transition-colors">
                             {n.title}
                          </h3>
                          <p className="text-[11px] font-medium text-text-secondary leading-relaxed line-clamp-3 mb-6 opacity-70 group-hover:opacity-100 transition-opacity">
                             {n.snippet}
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">
                             <div className="flex items-center gap-2">
                                <Globe size={12} />
                                {n.source}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">
                             <Clock size={12} />
                             {new Date(n.date).toLocaleDateString()}
                          </div>
                          <a 
                             href={n.link} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="p-3 rounded-xl bg-surface-low border border-border-glass text-primary hover:bg-primary hover:text-white hover:border-primary transition-all group/btn"
                           >
                             <ExternalLink size={14} className="group-hover/btn:rotate-12 transition-transform" />
                          </a>
                       </div>
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </div>
    </FeatureShell>
  );
}
