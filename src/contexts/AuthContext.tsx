"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { authService } from "@/lib/firebase/auth";
import { userService } from "@/lib/firebase/firestore";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Firestore
  const loadUserProfile = async (uid: string) => {
    try {
      const profile = await userService.getProfile(uid);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserProfile(null);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await loadUserProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
    const user = await authService.signUp(email, password, displayName);

    // Create initial user profile in Firestore
    const profileData: any = {
      uid: user.uid,
      email: user.email!,
      displayName,
      profile: {
        height: 0,
        sizes: {
          tops: "",
          bottoms: 0,
          dress: 0,
          denim: 0,
        },
        fitPreference: "standard",
      },
      comfortLimits: {
        straplessOk: true,
        maxHeelHeight: 0,
        shapewearTolerance: "sometimes",
      },
      styleDNA: {
        styleWords: [],
        lovedBrands: [],
        hatedBrands: [],
        priceRanges: {
          dresses: { min: 0, max: 0 },
          shoes: { min: 0, max: 0 },
          bags: { min: 0, max: 0 },
          jewelry: { min: 0, max: 0 },
        },
        neverAgainList: [],
      },
      flatteryMap: {
        favoriteBodyParts: [],
        minimizeBodyParts: [],
        necklinePreferences: {
          loved: [],
          avoid: [],
        },
        lengthPreferences: {
          dresses: "any",
          sleeves: "any",
        },
        waistDefinition: "sometimes",
      },
      colorPreferences: {
        complimentColors: [],
        avoidColors: [],
        metalPreference: "no-preference",
        patternTolerance: "any",
      },
      temperatureProfile: {
        runsHot: false,
        runsCold: false,
        needsLayers: false,
      },
      shoppingPreferences: {
        preferredRetailers: [],
        avoidReturns: false,
        fastShippingOnly: false,
      },
      onboardingCompleted: false,
    };

    // Only add photoURL if it exists
    if (user.photoURL) {
      profileData.photoURL = user.photoURL;
    }

    await userService.createProfile(user.uid, profileData);

    return user;
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    const user = await authService.signIn(email, password);
    await loadUserProfile(user.uid);
    return user;
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
