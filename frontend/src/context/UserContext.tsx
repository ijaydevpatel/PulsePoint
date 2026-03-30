"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";

export interface UserProfile {
  fullName: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmi: number;
  allergies: string[];
  conditions: string[];
  medications: string[];
  bloodGroup: string;
  streak: number;
  healthScore: number;
  healthInsights: Array<{
    type: string;
    content: string;
    timestamp: string;
  }>;
  intelligence?: {
    dailyTip: string;
    dailyStatus: string;
    intelligenceBrief: string;
    digitalTwin: {
      pattern: string;
      riskTrend: string;
      medInsight: string;
    };
    education: {
      title: string;
      explanation: string;
    };
    environmentalAnalysis?: string;
  };
  osint?: {
    aqi: number;
    uv: number;
    pressure?: number;
    humidity: number;
    locationName?: string;
    location: { lat: number; lon: number };
  };
}

interface UserContextType {
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  profile: UserProfile | null;
  logout: () => void;
  saveProfile: (data: UserProfile) => void;
  // Legacy compatibility shim — keeps existing pages working
  login: (token: string, profileCompleted: boolean, userData?: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded, getToken, signOut } = useAuth();
  const { user: clerkUser } = useClerkUser();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const sanitizeProfile = (p: any): UserProfile => ({
    ...p,
    allergies: Array.isArray(p.allergies) ? p.allergies : [],
    conditions: Array.isArray(p.conditions) ? p.conditions : [],
    medications: Array.isArray(p.medications) ? p.medications : [],
    streak: p.streak || 0,
    healthScore: p.healthScore || 0,
    healthInsights: Array.isArray(p.healthInsights) ? p.healthInsights : [],
    intelligence: p.intelligence || null,
    osint: p.osint || null,
  });

  // Fetch PulsePoint profile when Clerk user is signed in
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setProfile(null);
      setIsProfileComplete(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (token) {
          localStorage.setItem("pulsepoint_token", token);
        }

        const data = await apiClient.get("/profile");
        if (data && data.fullName) {
          const sanitized = sanitizeProfile(data);
          setProfile(sanitized);
          setIsProfileComplete(true);
          localStorage.setItem("pulsepoint-profile", JSON.stringify(sanitized));
        }
      } catch (error: any) {
        if (error.status === 404 || error.message?.includes("404")) {
          console.log("Profile not found (new user) — handled gracefully.");
        } else {
          console.error("Profile sync error:", error);
        }
      }
    };

    fetchProfile();
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  const logout = async () => {
    localStorage.removeItem("pulsepoint_token");
    localStorage.removeItem("pulsepoint-auth");
    localStorage.removeItem("pulsepoint-profile");
    setProfile(null);
    setIsProfileComplete(false);
    await signOut();
  };

  const saveProfile = (data: UserProfile) => {
    const sanitized = sanitizeProfile(data);
    localStorage.setItem("pulsepoint-profile", JSON.stringify(sanitized));
    setProfile(sanitized);
    setIsProfileComplete(true);
  };

  // Legacy shim — kept for compatibility
  const login = (_token: string, profileCompleted: boolean, userData?: UserProfile) => {
    setIsProfileComplete(profileCompleted);
    if (userData) {
      const sanitized = sanitizeProfile(userData);
      setProfile(sanitized);
      localStorage.setItem("pulsepoint-profile", JSON.stringify(sanitized));
    }
  };

  // IMPORTANT: Do NOT return null during loading — this unmounts the form tree
  // and causes React state (input values) to reset, breaking the form UX.
  // Instead always render children, even while Clerk is initializing.

  return (
    <UserContext.Provider
      value={{
        isAuthenticated: isLoaded ? !!isSignedIn : false,
        isProfileComplete,
        profile,
        logout,
        saveProfile,
        login,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
