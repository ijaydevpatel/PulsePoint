"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  { num: "01", title: "Ingestion", desc: "Patient symptoms, OCR lab reports, and vital markers are securely aggregated into the PulsePo!nt engine." },
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
    <section ref={containerRef} className="py-12 md:py-16 px-6 md:px-16 w-full relative z-10 bg-background-app overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-8 md:mb-12">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-black tracking-[0.3em] uppercase text-[10px] md:text-xs mb-4 block"
          >
            Clinical Protocol
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-black text-text-primary tracking-tighter"
          >
            How PulsePo<span className="text-primary">!</span>nt Operates.
          </motion.h2>
        </div>

        <div className="relative">
          {/* Vertical Timeline Lines (Dynamic Desktop/Mobile alignment) */}
          
          {/* Desktop Line (Center) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-20 w-[2px] bg-surface-container -translate-x-1/2 rounded-full opacity-50" />
          <motion.div 
            style={{ height: lineHeight }} 
            className="hidden md:block absolute left-1/2 top-0 w-[2px] bg-gradient-to-b from-primary via-primary to-primary/0 -translate-x-1/2 origin-top rounded-full shadow-glow z-0" 
          />

          {/* Mobile Line (Left) */}
          <div className="md:hidden absolute left-[15px] top-0 bottom-10 w-[2px] bg-surface-container rounded-full opacity-30" />
          <motion.div 
            style={{ height: lineHeight }} 
            className="md:hidden absolute left-[15px] top-0 w-[2px] bg-gradient-to-b from-primary via-primary to-primary/0 origin-top rounded-full shadow-glow z-0" 
          />

          <div className="space-y-16 md:space-y-0">
            {steps.map((step, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row items-center justify-between md:mb-40 last:mb-0 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Timeline Interaction Node (The Dot) */}
                
                {/* Desktop Dot (Center) */}
                <div className="hidden md:flex absolute left-1/2 top-10 w-8 h-8 rounded-full bg-background-app border-[2.5px] border-surface-container -translate-x-1/2 z-20 items-center justify-center">
                  <motion.div 
                     initial={{ scale: 0 }}
                     whileInView={{ scale: 1 }}
                     viewport={{ once: true, margin: "-100px" }}
                     transition={{ type: "spring", stiffness: 200, damping: 15 }}
                     className="w-3.5 h-3.5 bg-primary rounded-full shadow-glow"
                  />
                  <div className="absolute inset-0 rounded-full border-[2.5px] border-primary/20 scale-150 animate-pulse-slow" />
                </div>

                {/* Mobile Dot (Left) */}
                <div className="md:hidden absolute left-0 top-10 w-[32px] h-[32px] rounded-full bg-background-app border-[2px] border-surface-container z-20 flex items-center justify-center">
                  <motion.div 
                     initial={{ scale: 0 }}
                     whileInView={{ scale: 1 }}
                     viewport={{ once: true }}
                     className="w-3 h-3 bg-primary rounded-full shadow-glow"
                  />
                </div>
                
                {/* Content Panel */}
                <div className={`w-full md:w-[44%] pl-12 md:pl-0 ${idx % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: idx % 2 === 0 ? 40 : -40, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="bg-surface-low/30 backdrop-blur-3xl p-8 md:p-10 rounded-[32px] border border-surface-container hover:bg-surface-low/50 transition-all group relative overflow-hidden shadow-sm"
                  >
                    <div className="absolute -right-6 -top-12 text-8xl md:text-9xl font-display font-black text-surface-container opacity-20 select-none group-hover:scale-105 group-hover:text-primary/10 transition-all duration-700">
                      {step.num}
                    </div>
                    
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-black text-text-primary mb-3 md:mb-4 relative z-10 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-text-secondary leading-relaxed font-semibold relative z-10 opacity-80">
                      {step.desc}
                    </p>
                  </motion.div>
                </div>

                {/* Empty spacer for grid alignment on desktop */}
                <div className="hidden md:block w-[44%]" />

              </div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
}
