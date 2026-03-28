"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";

import { apiClient } from "@/lib/api";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am PulsePo!nt's AI Diagnostic Engine. Based on your current profile parameters and the elevated vitals recorded today, how are you feeling?"
    }
  ]);
   const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev: Message[]) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Placeholder for assistant response that we will update via stream
    setMessages((prev: Message[]) => [...prev, { role: 'assistant', content: "" }]);

    try {
      let accumulatedResponse = "";
      await apiClient.stream('/chat/stream', {
        message: userMsg,
        sessionId: sessionId
      }, (chunk) => {
        accumulatedResponse += chunk;
        setMessages((prev: Message[]) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = accumulatedResponse;
          return newMsgs;
        });
      });
      
    } catch (error) {
      setMessages((prev: Message[]) => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the neural core right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col pt-4 px-6 pb-6 absolute inset-0">
      <div className="flex flex-col mb-4 mt-2 relative z-20 shrink-0">
        <h1 className="text-3xl font-sans font-black text-text-primary tracking-tight">AI Doctor</h1>
        <p className="text-text-secondary mt-1 font-medium">Neural language model specialized in diagnostic queries.</p>
      </div>

      <div className="flex-1 bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-sm rounded-[32px] w-full flex flex-col relative z-20 overflow-hidden">
        {/* Chat History Space */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
           {messages.map((msg: Message, idx: number) => (
             <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'self-end flex-row-reverse max-w-[80%]' : 'max-w-[80%]'}`}>
               {msg.role === 'assistant' && (
                 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
                   <MessageSquare size={18} className="text-white" />
                 </div>
               )}
                <div className={`p-4 rounded-2xl shadow-sm border ${
                  msg.role === 'user' 
                   ? 'bg-primary text-white rounded-tr-none border-primary/20 shadow-float' 
                   : 'bg-surface-glass border-border-glass rounded-tl-none text-text-primary backdrop-blur-md'
                }`}>
                 <p className="text-sm leading-relaxed">{msg.content}</p>
               </div>
             </div>
           ))}
           {isLoading && (
             <div className="flex gap-4 max-w-[80%]">
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
                 <MessageSquare size={18} className="text-white" />
               </div>
               <div className="bg-surface-glass p-4 rounded-2xl rounded-tl-none border border-border-glass shadow-sm flex items-center backdrop-blur-md">
                 <div className="flex gap-1">
                   <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></span>
                   <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                   <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                 </div>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>
        
        {/* Input Space */}
        <div className="p-4 border-t border-border-glass bg-surface-glass/80 backdrop-blur-xl">
           <div className="relative">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyPress}
               placeholder="Describe your symptoms or ask a health question..." 
               disabled={isLoading}
               className="w-full bg-surface-glass border border-border-glass rounded-full py-3 pl-6 pr-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner disabled:opacity-50 text-text-primary placeholder:text-text-secondary/50" 
             />
             <button 
               onClick={sendMessage}
               disabled={isLoading || !input.trim()}
               className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
             >
               <Send size={16} />
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
