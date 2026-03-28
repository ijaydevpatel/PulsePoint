"use client";

import { SmoothScroll } from "@/components/core/SmoothScroll";
import { Navbar } from "@/components/homepage/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { DataVisSection } from "@/components/homepage/DataVisSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { IntelligenceSection } from "@/components/homepage/IntelligenceSection";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="w-full flex flex-col relative z-10 bg-transparent">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <DataVisSection />
        <HowItWorksSection />
        <IntelligenceSection />
        
        {/* Simple Footer Space */}
        <footer className="w-full py-16 text-center border-t border-border-glass bg-surface-low/50">
           <p className="text-text-secondary text-sm font-sans font-medium italic opacity-70">© 2026 PulsePo!nt. All rights reserved.</p>
        </footer>
      </div>
    </SmoothScroll>
  );
}
