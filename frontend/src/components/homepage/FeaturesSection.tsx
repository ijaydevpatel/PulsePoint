"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  { title: "Symptom Checker", desc: "AI-driven disease forecasting utilizing multi-variant health indicators.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { title: "Medicine Compatibility", desc: "Risk analysis for overlapping chemical prescriptions mitigating adverse reactions.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line></svg> },
  { title: "AI Chat Doctor", desc: "Conversational health assistant powered by ultra-fast Groq LLMs.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> },
  { title: "Health Reports", desc: "Upload PDFs or imagery to instantly extract structured health insights via OCR.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
  { title: "Daily Check-in", desc: "Log qualitative biometrics systematically to track personal trajectories.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
  { title: "Smart Medical Map", desc: "Locate verified local practitioners, hospitals, and pharmacies dynamically.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> },
  { title: "Emergency Mode", desc: "Secure highest-priority system override for imminent critical care situations.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> },
  { title: "Voice Analysis", desc: "Hands-free organic dictation, eliminating keyboard friction during intake.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg> }
];

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section ref={containerRef} className="py-24 px-8 md:px-16 lg:px-24 w-full relative z-10 bg-background-app">
      <div className="max-w-[1400px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center md:text-left"
        >
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Unified Infrastructure</span>
          <h2 className="text-4xl md:text-6xl font-sans font-extrabold text-text-primary tracking-tight">Intelligence at Scale.</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ rotateX: 2, rotateY: -2, y: -5, boxShadow: "0 20px 50px -15px rgba(138, 27, 51, 0.15)" }}
              className="bg-surface-glass backdrop-blur-xl p-8 rounded-[32px] shadow-soft border border-border-glass transition-all cursor-default relative overflow-hidden group"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="text-primary mb-8 bg-primary/5 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 leading-tight">{item.title}</h3>
              <p className="text-text-secondary leading-relaxed text-sm font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
