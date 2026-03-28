"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  { num: "01", title: "Ingestion", desc: "Patient symptoms, OCR lab reports, and vital markers are securely aggregated into the Biotrack engine." },
  { num: "02", title: "Processing", desc: "Advanced ML models and LLMs cross-reference data against the global medical baseline in milliseconds." },
  { num: "03", title: "Synthesis", desc: "Instant clinical insights, conflict warnings, and predictive probability graphs are rendered for action." }
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start center", "end center"] 
  });
  
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-32 px-8 md:px-16 w-full relative z-10 bg-background-app overflow-hidden">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-24">
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">The Pipeline</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-text-primary tracking-tight">How Biotrack Operates.</h2>
        </div>

        <div className="relative pl-8 md:pl-0">
          {/* Vertical Timeline Lines (Visible on Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-12 w-1 bg-surface-container -translate-x-1/2 rounded-full" />
          <motion.div 
            style={{ height: lineHeight }} 
            className="hidden md:block absolute left-1/2 top-0 w-1 bg-gradient-to-b from-primary to-primary-glow -translate-x-1/2 origin-top rounded-full shadow-[0_0_15px_rgba(138,27,51,0.5)]" 
          />

          {steps.map((step, idx) => (
            <div key={idx} className={`relative flex flex-col md:flex-row items-center justify-between mb-24 last:mb-0 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Center Timeline Node */}
              <div className="hidden md:flex absolute left-1/2 w-6 h-6 rounded-full bg-surface-low border-[4px] border-surface-container -translate-x-1/2 z-10 items-center justify-center transition-colors duration-500">
                <motion.div 
                   initial={{ scale: 0 }}
                   whileInView={{ scale: 1 }}
                   viewport={{ once: true, margin: "-200px" }}
                   transition={{ type: "spring" }}
                   className="w-full h-full bg-primary rounded-full absolute inset-0 m-[-4px] border-[4px] border-surface-low shadow-float"
                />
              </div>
              
              {/* Content Panel */}
              <div className={`w-full md:w-[45%] ${idx % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                <motion.div
                  initial={{ opacity: 0, x: idx % 2 === 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                  className="bg-surface-glass backdrop-blur-xl p-10 rounded-[32px] shadow-soft border border-border-glass relative group overflow-hidden"
                >
                  <div className="absolute -right-4 -top-8 text-9xl font-black text-surface-low opacity-50 select-none transition-transform duration-500 group-hover:scale-110">{step.num}</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4 relative z-10">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed font-medium relative z-10">{step.desc}</p>
                </motion.div>
              </div>

            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
