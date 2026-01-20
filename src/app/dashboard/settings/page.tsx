"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Import onboarding step components
import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { StyleDNAStep } from "@/components/onboarding/StyleDNAStep";
import { FlatteryMapStep } from "@/components/onboarding/FlatteryMapStep";
import { ColorPreferencesStep } from "@/components/onboarding/ColorPreferencesStep";

export default function SettingsPage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>({});

  useEffect(() => {
    if (userProfile) {
      // Load existing profile data
      setProfileData({
        height: userProfile.profile?.height || 0,
        sizes: userProfile.profile?.sizes || {
          tops: "",
          bottoms: 0,
          dress: 0,
          denim: 0,
        },
        fitPreference: userProfile.profile?.fitPreference || "standard",
        comfortLimits: userProfile.comfortLimits || {
          straplessOk: true,
          maxHeelHeight: 0,
          shapewearTolerance: "sometimes",
        },
        styleDNA: userProfile.styleDNA || {
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
        flatteryMap: userProfile.flatteryMap || {
          favoriteBodyParts: [],
          minimizeBodyParts: [],
          necklinePreferences: { loved: [], avoid: [] },
          lengthPreferences: { dresses: "any", sleeves: "any" },
          waistDefinition: "sometimes",
        },
        colorPreferences: userProfile.colorPreferences || {
          complimentColors: [],
          avoidColors: [],
          metalPreference: "no-preference",
          patternTolerance: "any",
        },
        temperatureProfile: userProfile.temperatureProfile || {
          runsHot: false,
          runsCold: false,
          needsLayers: false,
        },
      });
    }
  }, [userProfile]);

  const handleSave = async (sectionData: any, sectionName: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedProfile = { ...profileData, ...sectionData };
      setProfileData(updatedProfile);

      // Save to Firebase
      await userService.updateProfile(user.uid, {
        profile: {
          height: updatedProfile.height || 0,
          sizes: updatedProfile.sizes || {
            tops: "",
            bottoms: 0,
            dress: 0,
            denim: 0,
          },
          fitPreference: updatedProfile.fitPreference || "standard",
        },
        comfortLimits: updatedProfile.comfortLimits || {
          straplessOk: true,
          maxHeelHeight: 0,
          shapewearTolerance: "sometimes",
        },
        styleDNA: updatedProfile.styleDNA || {
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
        flatteryMap: updatedProfile.flatteryMap || {
          favoriteBodyParts: [],
          minimizeBodyParts: [],
          necklinePreferences: { loved: [], avoid: [] },
          lengthPreferences: { dresses: "any", sleeves: "any" },
          waistDefinition: "sometimes",
        },
        colorPreferences: updatedProfile.colorPreferences || {
          complimentColors: [],
          avoidColors: [],
          metalPreference: "no-preference",
          patternTolerance: "any",
        },
        temperatureProfile: updatedProfile.temperatureProfile || {
          runsHot: false,
          runsCold: false,
          needsLayers: false,
        },
        shoppingPreferences: userProfile?.shoppingPreferences || {
          preferredRetailers: [],
          avoidReturns: false,
          fastShippingOnly: false,
        },
      } as any);

      await refreshUserProfile();
      toast.success(`${sectionName} updated successfully!`);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Update your style preferences and measurements</p>
        </div>

        {/* Settings Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="style">Style DNA</TabsTrigger>
                <TabsTrigger value="flattery">Flattery Map</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <BasicInfoStep
                  initialData={profileData}
                  onComplete={(data) => handleSave(data, "Basic Info")}
                  onBack={() => {}}
                />
              </TabsContent>

              <TabsContent value="style" className="mt-6">
                <StyleDNAStep
                  initialData={profileData}
                  onComplete={(data) => handleSave(data, "Style DNA")}
                  onBack={() => {}}
                />
              </TabsContent>

              <TabsContent value="flattery" className="mt-6">
                <FlatteryMapStep
                  initialData={profileData}
                  onComplete={(data) => handleSave(data, "Flattery Map")}
                  onBack={() => {}}
                />
              </TabsContent>

              <TabsContent value="colors" className="mt-6">
                <ColorPreferencesStep
                  initialData={profileData}
                  onComplete={(data) => handleSave(data, "Color Preferences")}
                  onBack={() => {}}
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Display Name</p>
              <p className="font-medium">{userProfile?.displayName || user?.displayName}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
