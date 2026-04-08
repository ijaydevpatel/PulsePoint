"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("pulsepo!int-theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // Neural Badge Assassin V2: Text-Node-Searching High-Frequency Purge
    const killBadges = () => {
      const targetText = "Development mode";
      
      const processRoot = (root: Document | ShadowRoot) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent?.includes(targetText)) {
            const parent = node.parentElement;
            if (parent) {
              parent.style.display = 'none';
              parent.style.visibility = 'hidden';
              parent.style.opacity = '0';
              // If it's the striped container, hide it too
              const grandparent = parent.parentElement;
              if (grandparent && (grandparent.classList.contains('cl-internal-1dauv92') || grandparent.innerHTML.includes('ph72j1'))) {
                grandparent.style.display = 'none';
              }
            }
          }
        }
      };

      // Scan main document
      processRoot(document as any);

      // Scan Shadow Roots
      const hosts = document.querySelectorAll('.cl-rootBox');
      hosts.forEach(host => {
        if (host.shadowRoot) processRoot(host.shadowRoot);
      });
    };

    const interval = setInterval(killBadges, 500);
    const timeout = setTimeout(() => clearInterval(interval), 15000); // Stop after 15s to save CPU

    const observer = new MutationObserver(killBadges);
    observer.observe(document.body, { childList: true, subtree: true });
    killBadges();

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("pulsepo!int-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
