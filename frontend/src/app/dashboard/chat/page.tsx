"use client";

import React, { useState, useRef, useEffect } from "react";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { MessageSquare, Send, User, Bot, Loader2, Sparkles, Wand2, ShieldCheck, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(["Stress levels?", "HRV trends?", "Serum markers?"]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [neuralPulse, setNeuralPulse] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dynamic Greeting: Fetch on mount
  useEffect(() => {
    fetchGreeting();
  }, []);

  const fetchGreeting = async () => {
    setIsTyping(true);
    try {
      const data = await apiClient.get("/chat/greeting");
      const greetingMessage: Message = {
        id: "initial-" + Date.now(),
        role: "bot",
        content: data.greeting,
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
      setNeuralPulse(data.neuralPulse);
      if (data.suggestions) setSuggestions(data.suggestions);
    } catch (error) {
      setMessages([{
        id: "error-init",
        role: "bot",
        content: "Neural core link established. Ready for clinical query.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  // Viewport Lock: Suppress page scroll for full-spectrum chat experience
  useEffect(() => {
    // Lock the root document
    document.body.style.overflow = "hidden";
    
    // Lock the Dashboard's internal content container
    const mainContent = document.querySelector('main > div.overflow-y-auto');
    if (mainContent instanceof HTMLElement) {
       mainContent.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
      if (mainContent instanceof HTMLElement) {
         mainContent.style.overflow = "auto";
      }
    };
  }, []);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textOverride) setInput("");
    setIsTyping(true);

    try {
      const data = await apiClient.post("/chat/message", { message: messageText });
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.reply,
        timestamp: new Date()
      }]);
      setNeuralPulse(data.neuralPulse);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: "error-" + Date.now(),
        role: "bot",
        content: "Neural core synchronization failed. Re-establishing link...",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    fetchGreeting();
  };

  return (
    <FeatureShell 
      title="Neural Consult" 
      subtitle="AI Clinical Intelligence" 
      icon={<MessageSquare size={24} />}
      neuralPulse={undefined}
    >
      {/* Surgical Viewport Lock: Kill outer scrolls & Theme Chat Scrollbar */}
      <style jsx global>{`
        html, body, main, main > div.overflow-y-auto {
          overflow: hidden !important;
          height: 100% !important;
        }

        /* Medical Scrollbar Theme */
        .chat-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(185, 28, 28, 0.2);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(185, 28, 28, 0.5);
        }
      `}</style>

      <div className="flex flex-col h-[calc(100dvh-280px)] md:h-[calc(100vh-160px)] w-full overflow-hidden relative transition-all duration-500">
        
        {/* Chat Header Utility - Borderless */}
        <div className="px-8 py-4 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-sm" />
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">Handshake Active</span>
           </div>
           <button 
            onClick={clearChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-accent-crimson/10 text-text-secondary hover:text-accent-crimson transition-all text-[11px] font-black uppercase tracking-widest"
           >
              <Trash2 size={14} /> Clear Cache
           </button>
        </div>

        {/* Message Area - Expansive */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto chat-scrollbar px-6 py-8 md:px-10 space-y-6"
        >
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`relative flex flex-col max-w-[85%] md:max-w-[70%] group`}>
                   <div className={`px-5 pt-2.5 pb-1 rounded-[24px] text-[13px] md:text-sm font-semibold leading-normal shadow-sm whitespace-pre-wrap transition-all ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-glow-sm"
                      : "bg-surface-low/80 text-text-primary rounded-tl-none border border-border-glass backdrop-blur-3xl"
                  }`}>
                    {m.content}
                    
                    <div className={`flex items-center gap-1 mt-1 mb-0 opacity-40 group-hover:opacity-100 transition-opacity justify-end`}>
                       <span className="text-[8px] font-black uppercase tracking-[0.1em]">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                       {m.role === "user" && <ShieldCheck size={10} className="text-white" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start items-center"
              >
                <div className="px-5 py-2 rounded-[24px] rounded-tl-none bg-surface-low/40 border border-border-glass flex items-center gap-1.5 backdrop-blur-xl">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                   <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                   <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Dock - Pinned to Bottom with Breathing Space */}
        <div className="px-6 md:px-8 py-3 md:py-4 pb-4 md:pb-12 shrink-0 bg-background-app/40 backdrop-blur-3xl border-t border-border-glass/10">
           <div className="max-w-4xl mx-auto relative group">
              
              {/* Instagram Floating Pill Input */}
              <div className="relative flex items-center gap-3 bg-surface-glass border border-border-glass rounded-[40px] p-2 pl-8 focus-within:border-primary/40 focus-within:ring-8 focus-within:ring-primary/5 transition-all shadow-neural-lg backdrop-blur-3xl">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask your biological diagnostic partner..."
                  className="flex-1 bg-transparent py-3 md:py-4 text-sm font-bold text-text-primary focus:outline-none placeholder:text-text-secondary/40"
                />
                
                <div className="flex items-center gap-2 pr-2">
                   <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-glow hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shrink-0"
                   >
                     <Send size={18} strokeWidth={3} />
                   </button>
                </div>
              </div>
           </div>
        </div>

      </div>
    </FeatureShell>
  );
}
