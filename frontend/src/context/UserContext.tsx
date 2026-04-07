"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { useUser as useClerkUser, useAuth, useClerk } from "@clerk/nextjs";

export interface UserProfile {
  email: string;
  fullName: string;
  profilePicture?: string;
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
  isAuthLoaded: boolean;
  isProfileComplete: boolean;
  profile: UserProfile | null;
  displayName: string;
  token: string | null;
  logout: () => void;
  saveProfile: (data: UserProfile) => void;
  sessionError: string | null;
  clerkUser: any;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded: isClerkLoaded, isSignedIn, user: clerkUser } = useClerkUser();
  const { getToken, signOut } = useAuth();
  
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const sanitizeProfile = (p: any): UserProfile => ({
    ...p,
    email: p.email || "",
    allergies: Array.isArray(p.allergies) ? p.allergies : [],
    conditions: Array.isArray(p.conditions) ? p.conditions : [],
    medications: Array.isArray(p.medications) ? p.medications : [],
    streak: p.streak || 0,
    healthScore: p.healthScore || 0,
    healthInsights: Array.isArray(p.healthInsights) ? p.healthInsights : [],
    intelligence: p.intelligence || null,
    osint: p.osint || null,
  });

  const displayName = profile?.fullName || clerkUser?.fullName || clerkUser?.username || "User";

  // SYNC: Token Provider Bridge
  useEffect(() => {
    if (isSignedIn) {
      apiClient.setTokenProvider(async () => {
        try {
          return await getToken();
        } catch (e) {
          console.error("[Neural Link] Token Handshake Fault:", e);
          return null;
        }
      });
    } else {
      apiClient.setTokenProvider(() => Promise.resolve(null));
    }
  }, [isSignedIn, getToken]);

  const triggerLocationPulse = useCallback(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {}, 
        () => {}, 
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const saveProfile = useCallback((newProfile: UserProfile) => {
    const sanitized = sanitizeProfile(newProfile);
    setProfile(sanitized);
    setIsProfileComplete(true);
  }, []);

  const logout = useCallback(() => {
    signOut();
  }, [signOut]);

  // Fetch Clinical Profile when Clerk identity is ready
  useEffect(() => {
    if (!isClerkLoaded) return;
    
    if (!isSignedIn) {
      setProfile(null);
      setIsProfileComplete(false);
      setIsAuthLoaded(true);
      return;
    }

    const fetchProfile = async () => {
      setIsAuthLoaded(false); 

      // Neural Handshake Timeout
      const timeoutId = setTimeout(() => {
        setIsAuthLoaded(true);
        console.warn("[Neural Handshake] Profile extraction timeout stalling. Bypassing lock.");
      }, 5000);

      try {
        const data = await apiClient.get("/profile");
        if (data && data.fullName) {
          const sanitized = sanitizeProfile(data);
          setProfile(sanitized);
          setIsProfileComplete(true);
          setSessionError(null);
        } else {
          setIsProfileComplete(false);
        }
      } catch (error: any) {
        if (error.status === 401) {
           console.warn("[Neural Handshake] Identity mismatch. Re-authenticating Clerk...");
        } else if (error.status === 404) {
          console.log("[Neural Link] Biological profile not yet initialized.");
          setIsProfileComplete(false);
        } else {
          console.error("[Neural Hub] Extraction error:", error);
        }
      } finally {
        clearTimeout(timeoutId);
        setIsAuthLoaded(true);
        triggerLocationPulse();
      }
    };

    fetchProfile();
  }, [isClerkLoaded, isSignedIn, triggerLocationPulse]);

  const value = useMemo(() => ({
    isAuthenticated: !!isSignedIn,
    isAuthLoaded: isClerkLoaded && isAuthLoaded,
    isProfileComplete,
    profile,
    displayName,
    token: null, // Legacy Token Field
    logout,
    saveProfile,
    sessionError,
    clerkUser
  }), [isSignedIn, isClerkLoaded, isAuthLoaded, isProfileComplete, profile, displayName, logout, saveProfile, sessionError, clerkUser]);

  return (
    <UserContext.Provider value={value}>
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
