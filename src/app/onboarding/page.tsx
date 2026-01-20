"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/lib/firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Import step components
import { BodyMeasurementsStep } from "@/components/onboarding/BodyMeasurementsStep";
import { VisualStyleQuizStep } from "@/components/onboarding/VisualStyleQuizStep";
import { LifestyleStep } from "@/components/onboarding/LifestyleStep";
import { StyleDNAStep } from "@/components/onboarding/StyleDNAStep";
import { FlatteryMapStep } from "@/components/onboarding/FlatteryMapStep";
import { FabricPreferencesStep } from "@/components/onboarding/FabricPreferencesStep";
import { ColorPreferencesStep } from "@/components/onboarding/ColorPreferencesStep";

type ProfileData = {
  // Body Measurements
  height: number;
  sizes: {
    tops: string;
    bottoms: number;
    dress: number;
    denim: number;
    bra?: string;
  };
  measurements?: {
    bust?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
    shoulderWidth?: number;
  };
  bodyShape?: "hourglass" | "pear" | "apple" | "rectangle" | "inverted-triangle";
  fitPreference: "fitted" | "relaxed" | "oversized" | "standard";
  comfortLimits: {
    straplessOk: boolean;
    maxHeelHeight: number;
    shapewearTolerance: "never" | "sometimes" | "always";
  };
  // Visual Style Quiz
  visualStyleQuiz?: {
    selectedOutfits: string[];
    styleProfile: {
      primary: string;
      secondary?: string;
      confidence: number;
    };
  };
  // Lifestyle
  lifestyleProfile?: {
    workEnvironment: "corporate" | "business-casual" | "creative" | "remote" | "active" | "varied";
    workDressCode?: string;
    socialLifestyle: "frequent-events" | "occasional-outings" | "homebody" | "active-social";
    typicalOccasions: string[];
    climate: "hot" | "cold" | "mild" | "seasonal";
    location?: {
      city?: string;
      state?: string;
    };
  };
  // Style DNA
  styleDNA: {
    styleWords: string[];
    lovedBrands: string[];
    hatedBrands: string[];
    priceRanges: {
      dresses: { min: number; max: number };
      shoes: { min: number; max: number };
      bags: { min: number; max: number };
      jewelry: { min: number; max: number };
    };
    neverAgainList: string[];
  };
  // Flattery Map
  flatteryMap: {
    favoriteBodyParts: string[];
    minimizeBodyParts: string[];
    necklinePreferences: {
      loved: string[];
      avoid: string[];
    };
    lengthPreferences: {
      dresses: "mini" | "knee" | "midi" | "maxi" | "any";
      sleeves: "sleeveless" | "cap" | "short" | "3/4" | "long" | "any";
    };
    waistDefinition: "always" | "sometimes" | "never";
  };
  // Fabric Preferences
  fabricPreferences?: {
    lovedFabrics: string[];
    avoidFabrics: string[];
    sensitivities: string[];
    carePreference: "dry-clean-ok" | "machine-wash-preferred" | "no-preference";
    ecoFriendly: boolean;
  };
  // Color Preferences
  colorPreferences: {
    complimentColors: string[];
    avoidColors: string[];
    metalPreference: "gold" | "silver" | "rose-gold" | "no-preference";
    patternTolerance: "none" | "subtle" | "bold" | "any";
  };
  temperatureProfile: {
    runsHot: boolean;
    runsCold: boolean;
    needsLayers: boolean;
  };
};

const STEPS = [
  { title: "Measurements", description: "Your size and fit preferences", icon: "📐" },
  { title: "Style Quiz", description: "Discover your style DNA", icon: "✨" },
  { title: "Lifestyle", description: "How you live and what you do", icon: "🏠" },
  { title: "Style Preferences", description: "Brands and budget", icon: "💎" },
  { title: "Flattery Map", description: "What looks best on you", icon: "🪞" },
  { title: "Fabrics", description: "Materials you love", icon: "🧵" },
  { title: "Colors", description: "Your perfect palette", icon: "🎨" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(false);
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleStepComplete = (stepData: Partial<ProfileData>) => {
    setProfileData({ ...profileData, ...stepData });

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async (finalStepData: Partial<ProfileData>) => {
    if (!user) return;

    setLoading(true);
    try {
      const completeProfile = { ...profileData, ...finalStepData };

      // Save to Firebase
      await userService.updateProfile(user.uid, {
        profile: {
          height: completeProfile.height || 0,
          sizes: completeProfile.sizes || {
            tops: "",
            bottoms: 0,
            dress: 0,
            denim: 0,
          },
          measurements: completeProfile.measurements,
          bodyShape: completeProfile.bodyShape,
          fitPreference: completeProfile.fitPreference || "standard",
        },
        comfortLimits: completeProfile.comfortLimits || {
          straplessOk: true,
          maxHeelHeight: 0,
          shapewearTolerance: "sometimes",
        },
        visualStyleQuiz: completeProfile.visualStyleQuiz,
        lifestyleProfile: completeProfile.lifestyleProfile,
        styleDNA: completeProfile.styleDNA || {
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
        flatteryMap: completeProfile.flatteryMap || {
          favoriteBodyParts: [],
          minimizeBodyParts: [],
          necklinePreferences: { loved: [], avoid: [] },
          lengthPreferences: { dresses: "any", sleeves: "any" },
          waistDefinition: "sometimes",
        },
        fabricPreferences: completeProfile.fabricPreferences,
        colorPreferences: completeProfile.colorPreferences || {
          complimentColors: [],
          avoidColors: [],
          metalPreference: "no-preference",
          patternTolerance: "any",
        },
        temperatureProfile: completeProfile.temperatureProfile || {
          runsHot: false,
          runsCold: false,
          needsLayers: false,
        },
        shoppingPreferences: {
          preferredRetailers: [],
          avoidReturns: false,
          fastShippingOnly: false,
        },
        onboardingCompleted: true,
      } as any);

      await refreshUserProfile();
      toast.success("Welcome! Your style profile is ready.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-display text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="font-display text-blush">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? "text-blush" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  index < currentStep
                    ? "bg-gradient-luxe text-white"
                    : index === currentStep
                    ? "bg-blush border-2 border-primary"
                    : "bg-muted"
                }`}
              >
                {index < currentStep ? "✓" : step.icon}
              </div>
              <span className="text-xs mt-1 hidden md:block font-display">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="py-6">
        {currentStep === 0 && (
          <BodyMeasurementsStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 1 && (
          <VisualStyleQuizStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 2 && (
          <LifestyleStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <StyleDNAStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
          <FlatteryMapStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 5 && (
          <FabricPreferencesStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 6 && (
          <ColorPreferencesStep
            initialData={profileData}
            onComplete={handleComplete}
            onBack={handleBack}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
