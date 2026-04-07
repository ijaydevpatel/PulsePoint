"use client";
import { motion } from "framer-motion";

export function DataVisSection() {
  return (
    <section className="py-12 md:py-16 px-6 md:px-16 lg:px-24 w-full relative z-10 bg-surface-low overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Side: Descriptive Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-3 md:mb-4 block">Precision Analytics</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-text-primary tracking-tight leading-tight">
              Visualize your biological truth.
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base sm:text-lg text-text-secondary font-medium leading-relaxed max-w-lg mx-auto lg:mx-0"
          >
             PulsePo!nt transforms immense quantities of unstructured medical data into 
             highly legible, predictive metrics. Spot anomalies before they become critical.
          </motion.p>
          
          <motion.ul 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-3 sm:gap-4 mt-2 lg:mt-4 items-center lg:items-start"
          >
            {['Disease probability graph matrices', 'Longitudinal health metrics preview', 'Deep biomarker insights'].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-text-primary font-semibold text-sm sm:text-base">
                 <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </div>
                 {item}
               </li>
            ))}
          </motion.ul>
        </div>

        {/* Right Side: Floating Panel Previews */}
        <div className="w-full lg:w-1/2 relative min-h-[450px] sm:min-h-[550px] lg:min-h-[600px] flex items-center justify-center perspective-1000 mt-8 lg:mt-0">
          
          {/* Main Large Dashboard Panel */}
          <motion.div 
            initial={{ opacity: 0, rotateY: 20, z: -100 }}
            whileInView={{ opacity: 1, rotateY: -10, z: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute z-10 w-[92%] sm:w-[85%] lg:w-[90%] max-w-[480px] bg-surface-glass backdrop-blur-3xl rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-float border border-border-glass"
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
               <div>
                  <h4 className="text-lg sm:text-xl font-bold text-text-primary">Probability Distribution</h4>
                  <p className="text-[10px] sm:text-sm text-text-secondary">AI Diagnostic Outcomes</p>
               </div>
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-low flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse" />
               </div>
            </div>
            
            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-3">
                 {[
                   { label: "Metabolic Syndrome (Risk)", prob: 82, color: "bg-primary" },
                   { label: "Cardiovascular Anomaly", prob: 45, color: "bg-primary/60" },
                   { label: "Inflammatory Markers", prob: 12, color: "bg-surface-container-high" },
                 ].map((item, idx) => (
                   <div key={idx} className="flex flex-col gap-1.5">
                     <div className="flex justify-between items-center text-[10px] sm:text-xs font-semibold">
                       <span className="text-text-primary">{item.label}</span>
                       <span className="text-text-secondary">{item.prob}%</span>
                     </div>
                     <div className="w-full h-1.5 sm:h-2 rounded-full bg-surface-low overflow-hidden relative">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${item.prob}%` }}
                         transition={{ duration: 1, ease: "easeOut", delay: 0.5 + idx * 0.1 }}
                         className={`absolute top-0 left-0 h-full rounded-full ${item.color}`}
                       />
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="mt-2 sm:mt-4 p-3 sm:p-4 rounded-xl bg-surface-low border border-surface-container flex items-center justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-text-secondary font-bold uppercase tracking-widest block mb-0.5">Diagnostic Confidence</span>
                    <span className="text-xl sm:text-2xl font-black text-text-primary">94.2%</span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-primary/20 flex items-center justify-center relative shrink-0">
                    <motion.svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <motion.path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#8A1B33"
                        strokeWidth="3"
                        strokeDasharray="94.2, 100"
                        initial={{ strokeDasharray: "0, 100" }}
                        whileInView={{ strokeDasharray: "94.2, 100" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                      />
                    </motion.svg>
                    <span className="text-base sm:text-lg font-bold text-primary">!</span>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Secondary Floating Panel (Vital Sync) */}
          <motion.div 
            initial={{ opacity: 0, y: 50, x: 20 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute z-20 top-[6%] right-[2%] sm:right-[5%] bg-surface-glass backdrop-blur-xl rounded-[18px] sm:rounded-[24px] p-4 sm:p-5 shadow-soft border border-border-glass w-[160px] sm:w-[220px]"
          >
             <div className="flex items-center gap-2 sm:gap-3">
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent-warm flex items-center justify-center text-primary font-bold animate-pulse text-xs sm:text-base">♥</div>
               <div>
                  <h5 className="font-bold text-text-primary text-xs sm:text-sm">Vital Sync</h5>
                  <p className="text-[10px] sm:text-xs text-text-secondary">Stable · 68 bpm</p>
               </div>
             </div>
          </motion.div>

          {/* Tertiary Floating Panel (Biomarker) */}
          <motion.div 
            initial={{ opacity: 0, y: -50, x: -20 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute z-30 bottom-[4%] left-[2%] sm:left-[5%] bg-surface-glass backdrop-blur-xl rounded-[18px] sm:rounded-[24px] p-5 sm:p-6 shadow-float border border-border-glass w-[200px] sm:w-[260px]"
          >
             <h5 className="font-bold text-text-primary mb-2 text-xs sm:text-sm">Biomarker Warning</h5>
             <div className="w-full bg-surface-low h-1.5 sm:h-2 rounded-full overflow-hidden">
                <div className="w-[85%] bg-primary h-full rounded-full" />
             </div>
             <p className="text-[10px] sm:text-xs text-primary font-semibold mt-2 text-right">85% Trigger Threshold</p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
