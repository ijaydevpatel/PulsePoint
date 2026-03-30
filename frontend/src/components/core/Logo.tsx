import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/core/ThemeProvider";

export type LogoVariant = "primary" | "icon" | "small" | "favicon";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({ 
  variant = "primary", 
  className = "", 
  iconClassName = "",
  textClassName = "" 
}: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";
  
  // The new highly-polished, premium "Hexagon Pulse" identity
  const HexagonPulse = ({ isSmall = false }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`relative shrink-0 ${isSmall ? "w-5 h-5" : "w-8 h-8"} ${iconClassName}`}
    >
      {/* Outer Geometric Frame (Tech, Structure, Intelligence) */}
      <path 
        d="M 12 2 L 20.66 7 L 20.66 17 L 12 22 L 3.34 17 L 3.34 7 Z"
        stroke={isDark ? "#FFFFFF" : "#1A1A1A"} 
        strokeWidth={isSmall ? "2" : "1.8"}
      />
      {/* Symmetrical Center Pulse (Biology, Health, Heartbeat) */}
      <path 
        d="M 3.34 12 L 8.5 12 L 10.5 6 L 13.5 18 L 15.5 12 L 20.66 12"
        stroke="#D92544" 
        strokeWidth={isSmall ? "2.5" : "2"}
      />
      {/* Optional subtle core glow for premium depth */}
      {!isSmall && (
        <circle cx="12" cy="12" r="6" fill="#D92544" opacity="0.1" stroke="none" />
      )}
    </svg>
  );

  if (variant === "favicon" || variant === "icon") {
    return (
      <div className={`flex items-center justify-center text-primary ${className}`}>
        <HexagonPulse isSmall={variant === "favicon"} />
      </div>
    );
  }

  const isSmall = variant === "small";

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      {/* Animated Icon Wrapper */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center text-primary relative"
      >
        <HexagonPulse isSmall={isSmall} />
      </motion.div>

      {/* Typography */}
      <div className={`flex items-center tracking-tight ${textClassName}`}>
        <span className={`font-sans font-extrabold text-text-primary ${isSmall ? "text-lg" : "text-2xl"}`}>
          <span className="text-[#D92544]">Pulse</span>Po<span className="text-[#D92544]">!</span>nt
        </span>
      </div>
    </div>
  );
}
