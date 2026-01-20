import { NextRequest, NextResponse } from "next/server";
import { userAdminService } from "@/lib/firebase/firestore-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, displayName } = await request.json();

    const profileData: any = {
      uid: userId,
      email,
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

    await userAdminService.createProfile(userId, profileData);

    return NextResponse.json({ success: true, message: "Profile created successfully" });
  } catch (error: any) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
