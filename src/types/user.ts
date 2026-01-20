import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;

  profile: PhysicalProfile;
  comfortLimits: ComfortLimits;
  styleDNA: StyleDNA;
  flatteryMap: FlatteryMap;
  colorPreferences: ColorPreferences;
  temperatureProfile: TemperatureProfile;
  shoppingPreferences: ShoppingPreferences;

  // New enhanced profile sections
  lifestyleProfile?: LifestyleProfile;
  fabricPreferences?: FabricPreferences;
  visualStyleQuiz?: VisualStyleQuiz;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboardingCompleted: boolean;
  stripeCustomerId?: string;
}

export interface PhysicalProfile {
  height: number; // in inches
  sizes: {
    tops: string; // "XS", "S", "M", "L", "XL", etc.
    bottoms: number; // 0, 2, 4, 6, 8, etc.
    dress: number; // 0, 2, 4, 6, 8, etc.
    denim: number; // waist size (e.g., 27, 28, 29)
    bra?: string; // "32A", "34B", "36C", etc. (optional)
  };
  // Detailed body measurements (in inches)
  measurements?: {
    bust?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
    shoulderWidth?: number;
  };
  bodyShape?: "hourglass" | "pear" | "apple" | "rectangle" | "inverted-triangle";
  fitPreference: "fitted" | "relaxed" | "oversized" | "standard";
}

export interface ComfortLimits {
  straplessOk: boolean;
  maxHeelHeight: number; // in inches
  shapewearTolerance: "never" | "sometimes" | "always";
}

export interface StyleDNA {
  styleWords: string[]; // max 5: "classic", "edgy", "romantic", etc.
  lovedBrands: string[];
  hatedBrands: string[];
  priceRanges: {
    dresses: { min: number; max: number };
    shoes: { min: number; max: number };
    bags: { min: number; max: number };
    jewelry: { min: number; max: number };
  };
  neverAgainList: string[]; // specific items/styles to avoid
}

export interface FlatteryMap {
  favoriteBodyParts: string[]; // max 2: "shoulders", "legs", "waist", etc.
  minimizeBodyParts: string[]; // max 2: "hips", "bust", "arms", etc.
  necklinePreferences: {
    loved: string[]; // "v-neck", "scoop", "boat", "off-shoulder", etc.
    avoid: string[];
  };
  lengthPreferences: {
    dresses: "mini" | "knee" | "midi" | "maxi" | "any";
    sleeves: "sleeveless" | "cap" | "short" | "3/4" | "long" | "any";
  };
  waistDefinition: "always" | "sometimes" | "never";
}

export interface ColorPreferences {
  complimentColors: string[]; // hex codes or color names
  avoidColors: string[];
  metalPreference: "gold" | "silver" | "rose-gold" | "no-preference";
  patternTolerance: "none" | "subtle" | "bold" | "any";
}

export interface TemperatureProfile {
  runsHot: boolean;
  runsCold: boolean;
  needsLayers: boolean;
}

export interface ShoppingPreferences {
  preferredRetailers: string[];
  avoidReturns: boolean;
  fastShippingOnly: boolean;
}

export interface LifestyleProfile {
  workEnvironment: "corporate" | "business-casual" | "creative" | "remote" | "active" | "varied";
  workDressCode?: string; // Additional notes about work dress code
  socialLifestyle: "frequent-events" | "occasional-outings" | "homebody" | "active-social";
  typicalOccasions: string[]; // "weddings", "galas", "date-nights", "brunches", "travel", etc.
  climate: "hot" | "cold" | "mild" | "seasonal";
  location?: {
    city?: string;
    state?: string;
  };
}

export interface FabricPreferences {
  lovedFabrics: string[]; // "silk", "cotton", "cashmere", "linen", "wool", etc.
  avoidFabrics: string[]; // fabrics they find uncomfortable
  sensitivities: string[]; // "wool-itchy", "polyester-sweaty", etc.
  carePreference: "dry-clean-ok" | "machine-wash-preferred" | "no-preference";
  ecoFriendly: boolean; // prefers sustainable/eco-friendly materials
}

export interface VisualStyleQuiz {
  selectedOutfits: string[]; // IDs of outfits they selected as favorites
  styleProfile: {
    primary: string; // Primary style identified (e.g., "classic-elegant")
    secondary?: string; // Secondary style
    confidence: number; // 0-100 confidence in the assessment
  };
  completedAt?: Date;
}

// Helper type for form data (without Firestore Timestamps)
export type UserProfileFormData = Omit<UserProfile, "createdAt" | "updatedAt"> & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Type for creating a new user (minimal data)
export interface CreateUserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

// Type for onboarding steps
export type OnboardingStep =
  | "body-measurements"
  | "visual-style-quiz"
  | "lifestyle"
  | "style-dna"
  | "flattery-map"
  | "fabric-preferences"
  | "color-preferences";

// Type for profile completion status
export interface ProfileCompletion {
  bodyMeasurements: boolean;
  visualStyleQuiz: boolean;
  lifestyle: boolean;
  styleDNA: boolean;
  flatteryMap: boolean;
  fabricPreferences: boolean;
  colorPreferences: boolean;
  overall: number; // percentage (0-100)
}
