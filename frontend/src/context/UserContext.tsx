"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
}

interface UserContextType {
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  profile: UserProfile | null;
  login: (token: string, profileCompleted: boolean, userData?: UserProfile) => void;
  logout: () => void;
  saveProfile: (data: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  const sanitizeProfile = (p: any): UserProfile => ({
    ...p,
    allergies: Array.isArray(p.allergies) ? p.allergies : [],
    conditions: Array.isArray(p.conditions) ? p.conditions : [],
    medications: Array.isArray(p.medications) ? p.medications : [],
  });

  useEffect(() => {
    // Load state from strict localStorage keys
    const authStatus = localStorage.getItem("pulsepoint-auth") === "true";
    const savedProfileStr = localStorage.getItem("pulsepoint-profile");

    setIsAuthenticated(authStatus);

    if (savedProfileStr) {
      try {
        const storedProfile = JSON.parse(savedProfileStr);
        setProfile(sanitizeProfile(storedProfile));
        setIsProfileComplete(true);
      } catch (e) {
        setIsProfileComplete(false);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !profile) {
      const fetchProfile = async () => {
        try {
          const data = await apiClient.get("/profile");
          if (data && data.fullName) {
             const sanitized = sanitizeProfile(data);
             setProfile(sanitized);
             setIsProfileComplete(true);
             localStorage.setItem("pulsepoint-profile", JSON.stringify(sanitized));
          }
        } catch (error: any) {
           if (error.status === 404 || error.message?.includes('404')) {
             console.log("Profile Context Not Found (New User) - Handled gracefully.");
           } else {
             console.error("Dashboard Identity Sync Error:", error);
           }
        }
      };
      fetchProfile();
    }
  }, [isAuthenticated, profile]);

  const login = (token: string, profileCompleted: boolean, userData?: UserProfile) => {
    localStorage.setItem("pulsepoint_token", token);
    localStorage.setItem("pulsepoint-auth", "true");
    setIsAuthenticated(true);
    setIsProfileComplete(profileCompleted);
    if (userData) {
      const sanitized = sanitizeProfile(userData);
      setProfile(sanitized);
      localStorage.setItem("pulsepoint-profile", JSON.stringify(sanitized));
    }
  };

  const logout = () => {
    localStorage.removeItem("pulsepoint_token");
    localStorage.removeItem("pulsepoint-auth");
    localStorage.removeItem("pulsepoint-profile");
    setIsAuthenticated(false);
    setIsProfileComplete(false);
    setProfile(null);
  };

  const saveProfile = (data: UserProfile) => {
    const sanitized = sanitizeProfile(data);
    localStorage.setItem("pulsepoint-profile", JSON.stringify(sanitized));
    setProfile(sanitized);
    setIsProfileComplete(true);
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <UserContext.Provider value={{ isAuthenticated, isProfileComplete, profile, login, logout, saveProfile }}>
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
