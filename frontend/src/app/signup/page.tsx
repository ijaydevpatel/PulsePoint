"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, KeyRound } from "lucide-react";
import { useSignUp } from "@clerk/nextjs";
import { Logo } from "@/components/core/Logo";
import { VerificationCode } from "@/components/core/VerificationCode";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [localError, setLocalError] = useState("");
  const [showVerify, setShowVerify] = useState(false);

  const isLoading = fetchStatus === "fetching";

  const handleSubmit = async (formData: FormData) => {
    setLocalError("");
    const emailAddress = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signUp.password({ emailAddress, password });

    if (error) {
      console.error("[CLERK AUTH ERROR]", error);
      setLocalError(error.longMessage || error.message || "Registration failed.");
      return;
    }

    // Send email verification code
    if (!error) {
      await signUp.verifications.sendEmailCode();
      setShowVerify(true);
    }
  };

  const handleGoogle = async () => {
    try {
      await signUp?.sso({
        strategy: "oauth_google",
        redirectUrl: "/profile-setup",
        redirectCallbackUrl: "/sso-callback"
      });
    } catch (err: any) {
      setLocalError("Google signup initialization failed.");
    }
  };

  const handleVerify = async (formData: FormData) => {
    setLocalError("");
    const code = formData.get("code") as string;

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/profile-setup");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    } else {
      setLocalError("Verification failed. Please check the code and try again.");
    }
  };

  const displayError =
    localError ||
    errors?.fields?.emailAddress?.message ||
    errors?.fields?.password?.message ||
    errors?.fields?.code?.message;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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
          <h1 className="text-3xl font-sans font-bold text-text-primary tracking-tight mb-2">
            {showVerify ? "Verify Email" : "Create Account"}
          </h1>
          <p className="text-sm font-medium text-text-secondary">
            {showVerify
              ? "Enter the 6-digit code sent to your email"
              : "Register to initialize your dashboard"}
          </p>
        </motion.div>

        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent-crimson/10 border border-accent-crimson/20 text-accent-crimson text-sm font-medium px-4 py-3 rounded-xl mb-4"
          >
            {displayError}
          </motion.div>
        )}

        {!showVerify ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="flex flex-col gap-4">
            <motion.div variants={itemVariants as any} className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="Full Name"
                className="w-full bg-surface-low border border-border-glass rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-secondary/50 shadow-sm"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants as any} className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="Email Address"
                className="w-full bg-surface-low border border-border-glass rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-secondary/50 shadow-sm"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants as any} className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-primary transition-colors" size={18} />
              <input
                id="signup-password"
                name="password"
                type="password"
                placeholder="Secret Key"
                className="w-full bg-surface-low border border-border-glass rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-secondary/50 shadow-sm"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants as any} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-3">
              <button
                id="signup-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all py-4 rounded-xl text-white font-sans font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign Up <ArrowRight size={18} /></>
                )}
              </button>
            </motion.div>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleVerify(new FormData(e.currentTarget)); }} className="flex flex-col gap-4">
            <motion.div variants={itemVariants as any} className="relative group flex justify-center">
              <VerificationCode length={6} />
            </motion.div>

            <motion.div variants={itemVariants as any} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-3">
              <button
                id="signup-verify-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all py-4 rounded-xl text-white font-sans font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify & Continue <ArrowRight size={18} /></>
                )}
              </button>
            </motion.div>

            <button
              type="button"
              onClick={() => signUp.verifications.sendEmailCode()}
              className="text-sm text-text-secondary hover:text-primary transition-colors text-center"
            >
              Resend code
            </button>
          </form>
        )}

        <motion.div variants={itemVariants as any} className="mt-8 pt-8 border-t border-border-glass text-center">
          <p className="text-sm font-medium text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline ml-1">Login</Link>
          </p>
        </motion.div>

        {/* Required by Clerk for bot protection, must remain stably mounted */}
        <div id="clerk-captcha" />
      </motion.div>
    </div>
  );
}
