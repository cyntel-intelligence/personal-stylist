"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Import step components
import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { StyleDNAStep } from "@/components/onboarding/StyleDNAStep";
import { FlatteryMapStep } from "@/components/onboarding/FlatteryMapStep";
import { ColorPreferencesStep } from "@/components/onboarding/ColorPreferencesStep";

type ProfileData = {
  height: number;
  sizes: {
    tops: string;
    bottoms: number;
    dress: number;
    denim: number;
    bra?: string;
  };
  fitPreference: "fitted" | "relaxed" | "oversized" | "standard";
  comfortLimits: {
    straplessOk: boolean;
    maxHeelHeight: number;
    shapewearTolerance: "never" | "sometimes" | "always";
  };
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
  { title: "Basic Info", description: "Your measurements and preferences" },
  { title: "Style DNA", description: "Your fashion taste and budget" },
  { title: "Flattery Map", description: "What looks best on you" },
  { title: "Color Preferences", description: "Colors that make you shine" },
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
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
          fitPreference: completeProfile.fitPreference || "standard",
        },
        comfortLimits: completeProfile.comfortLimits || {
          straplessOk: true,
          maxHeelHeight: 0,
          shapewearTolerance: "sometimes",
        },
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
      toast.success("Profile completed! 🎉");
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
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-gray-500">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {STEPS[currentStep].title}
        </h2>
        <p className="text-gray-600 mt-1">{STEPS[currentStep].description}</p>
      </div>

      {/* Step Content */}
      <div className="py-6">
        {currentStep === 0 && (
          <BasicInfoStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 1 && (
          <StyleDNAStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 2 && (
          <FlatteryMapStep
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
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
