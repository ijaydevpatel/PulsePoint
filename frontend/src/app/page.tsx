"use client";

import { SmoothScroll } from "@/components/core/SmoothScroll";
import { Navbar } from "@/components/homepage/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { DataVisSection } from "@/components/homepage/DataVisSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { IntelligenceSection } from "@/components/homepage/IntelligenceSection";
import { PulsePoIntIntelligence } from "@/components/homepage/PulsePoIntIntelligence";

// Seamless gradient bridge between sections — creates a single-page feel
function SectionFade({ from = "transparent", to = "transparent" }: { from?: string; to?: string }) {
  return (
    <div
      className="w-full h-16 pointer-events-none -mt-16 relative z-10"
      style={{
        background: `linear-gradient(to bottom, ${from}, ${to})`,
      }}
    />
  );
}

export default function Home() {
  return (
    <SmoothScroll>
      <div className="w-full flex flex-col relative z-10 bg-transparent">
        <Navbar />

        {/* Section 1: Intelligence Hero */}
        <PulsePoIntIntelligence />

        {/* Section 2: Features */}
        <FeaturesSection />

        {/* Section 3: Data Vis */}
        <DataVisSection />

        {/* Section 4: How It Works */}
        <HowItWorksSection />

        {/* Section 5: AI Intelligence */}
        <IntelligenceSection />

        {/* Section 6: Hero (Last) */}
        <HeroSection />
        
        {/* Footer */}
        <footer className="w-full py-6 text-center bg-surface-low/50">
           <p className="text-text-secondary text-sm font-sans font-medium italic opacity-70">© 2026 <span className="text-[#D92544]">Pulse</span>Po<span className="text-[#D92544]">!</span>int. All rights reserved.</p>
        </footer>
      </div>
    </SmoothScroll>
  );
}
