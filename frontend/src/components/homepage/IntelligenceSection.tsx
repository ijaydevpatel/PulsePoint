"use client";
import React from "react";
import { motion } from "framer-motion";
import { Brain, Activity } from "lucide-react";
import { useTheme } from "@/components/core/ThemeProvider";

export function IntelligenceSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const heartSrc = isDark ? "/assets/Black_heart.png" : "/assets/White_heart.png";

  return (
    <section className="pt-12 md:pt-16 pb-0 w-full relative z-10 bg-background-app overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col-reverse lg:flex-row items-center gap-4 lg:gap-20">
        
        {/* Left: 3D Visual (Replaced with Beating Heart Asset) */}
        <div className="w-full lg:w-1/2 h-[200px] sm:h-[450px] lg:h-[600px] relative flex items-center justify-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="w-full h-full relative flex items-center justify-center"
           >
              {/* Background ambient glow matching medical burgundy */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D92544]/10 to-transparent rounded-full blur-[100px] opacity-30 pointer-events-none" />
              
              <motion.img
                src={heartSrc}
                alt="Biological Heart"
                className="max-w-full h-auto object-contain max-h-[85%] drop-shadow-[0_0_60px_rgba(217,37,68,0.25)] relative z-20"
                animate={{
                  scale: [1, 1.08, 1.03, 1.12, 1, 1], // Double contraction (Lub-Dub)
                  filter: isDark 
                    ? [
                        "drop-shadow(0 0 20px rgba(217,37,68,0.15))", 
                        "drop-shadow(0 0 45px rgba(217,37,68,0.35))", 
                        "drop-shadow(0 0 30px rgba(217,37,68,0.25))", 
                        "drop-shadow(0 0 60px rgba(217,37,68,0.5))", 
                        "drop-shadow(0 0 20px rgba(217,37,68,0.15))",
                        "drop-shadow(0 0 20px rgba(217,37,68,0.15))"
                      ]
                    : [
                        "drop-shadow(0 0 10px rgba(0,0,0,0.05))", 
                        "drop-shadow(0 0 25px rgba(0,0,0,0.12))", 
                        "drop-shadow(0 0 20px rgba(0,0,0,0.1))", 
                        "drop-shadow(0 0 40px rgba(0,0,0,0.18))", 
                        "drop-shadow(0 0 10px rgba(0,0,0,0.05))",
                        "drop-shadow(0 0 10px rgba(0,0,0,0.05))"
                      ]
                }}
                transition={{
                  duration: 1.8, // Slightly longer cycle for a resting heart rate feel
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.08, 0.15, 0.28, 0.45, 1] // Clinical Lub-Dub timing
                }}
              />
           </motion.div>
        </div>

        {/* Right: Typography */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 text-primary font-black tracking-[0.3em] uppercase text-[10px] md:text-xs mb-6 block">
              <Brain size={14} strokeWidth={2.5} /> Neural Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-black text-text-primary tracking-tighter leading-[0.95] mb-8">
              Clinical Insights <br className="hidden lg:block" /> 
              <span className="bg-gradient-to-br from-[#D92544] via-[#a31a2f] to-[#8A1B33] bg-clip-text text-transparent drop-shadow-sm">
                with Biological Context.
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary font-semibold leading-relaxed max-w-xl mb-10 mx-auto lg:mx-0 opacity-80">
              Traditional data tracking ends where PulsePo<span className="text-primary italic">!</span>nt begins. Our neural twin technology maps precise biological markers to detect critical signals within clinical noise.
            </p>
            
            <div className="flex justify-center lg:justify-start gap-4">
               <button className="px-10 py-5 bg-surface-low border border-surface-container rounded-[24px] font-black text-text-primary hover:bg-surface-low/80 active:scale-95 transition-all text-xs md:text-base uppercase tracking-widest flex items-center gap-2">
                  Access Engine <Activity size={18} strokeWidth={3} className="text-primary" />
               </button>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
