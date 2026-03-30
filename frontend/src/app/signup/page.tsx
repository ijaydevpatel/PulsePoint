"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";
import { Logo } from "@/components/core/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { login } = useUser();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiClient.post('/auth/register', { email, password });
      login(data.token, data.profileCompleted);
      router.push("/profile-setup");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-[90vh] bg-transparent flex items-center justify-center p-6 relative z-10 w-full mb-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        variants={containerVariants as any}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md p-10 rounded-[32px] bg-surface-glass backdrop-blur-3xl border border-border-glass shadow-float relative z-30"
      >
        <motion.div variants={itemVariants as any} className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-6 hover:scale-110 transition-transform outline-none">
            <Logo variant="icon" iconClassName="w-12 h-12" />
          </Link>
          <h1 className="text-3xl font-sans font-bold text-text-primary tracking-tight mb-2">Create Account</h1>
          <p className="text-sm font-medium text-text-secondary">Register to initialize your dashboard</p>
        </motion.div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {error && (
            <div className="bg-accent-crimson/10 border border-accent-crimson/20 text-accent-crimson text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <motion.div variants={itemVariants as any} className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-low border border-border-glass rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-secondary/50 shadow-sm"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants as any} className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-low border border-border-glass rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-secondary/50 shadow-sm"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants as any} className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="password" 
              placeholder="Secret Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-low border border-border-glass rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-secondary/50 shadow-sm"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants as any} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all py-4 rounded-xl text-white font-sans font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign Up <ArrowRight size={18} /></>
              )}
            </button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants as any} className="mt-8 pt-8 border-t border-border-glass text-center">
          <p className="text-sm font-medium text-text-secondary">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline ml-1">Login</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
