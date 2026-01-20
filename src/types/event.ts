import { Timestamp } from "firebase/firestore";

export interface Event {
  id: string;
  userId: string;

  // Event Details
  eventType: EventType;
  dressCode: string;
  customEventType?: string;

  // Location & Timing
  location: {
    city: string;
    state: string;
    venue?: string;
  };
  dateTime: Timestamp;

  // Context
  userRole?: string; // "guest", "mother-of-bride", "attendee", etc.
  activityLevel: "sedentary" | "moderate" | "active";

  // Weather Data (auto-fetched)
  weather?: {
    temperature: number;
    conditions: string; // "sunny", "rainy", etc.
    humidity: number;
    lastFetched: Timestamp;
  };

  // Shipping Constraints
  shippingDeadline?: Timestamp;

  // Requirements
  requirements: {
    mustUseClosetItems: string[]; // closet item IDs
    preferRewear: boolean;
    shopOnlyMode: boolean;
  };

  // Recommendation State
  recommendationsGenerated: boolean;
  recommendationIds: string[]; // references to recommendations collection
  selectedRecommendationId?: string;

  // NEW: Track user's selected alternatives
  selectedOutfit?: {
    recommendationId: string;
    mode: 'dress' | 'separates';
    selectedAlternatives: Record<string, number>;  // category -> index (0=primary, 1=alt1, 2=alt2)
    totalPrice: number;
  };

  // Status
  status: EventStatus;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EventType =
  | "wedding"
  | "formal"
  | "cocktail"
  | "work"
  | "casual"
  | "date"
  | "vacation"
  | "gala"
  | "holiday-party"
  | "graduation"
  | "baby-shower"
  | "bridal-shower"
  | "other";

export type EventStatus =
  | "planning"
  | "generating-recommendations"
  | "recommendations-ready"
  | "outfit-selected"
  | "completed";

// Dress codes
export const dressCodeOptions = [
  "Black Tie",
  "Black Tie Optional",
  "Formal",
  "Semi-Formal",
  "Cocktail",
  "Dressy Casual",
  "Business Professional",
  "Business Casual",
  "Smart Casual",
  "Casual",
  "Beach Formal",
  "Garden Party",
] as const;

export type DressCode = (typeof dressCodeOptions)[number];

// User roles for events
export const eventRoleOptions = [
  "Guest",
  "Plus-One",
  "Bridesmaid",
  "Maid of Honor",
  "Mother of the Bride",
  "Mother of the Groom",
  "Guest Speaker",
  "Presenter",
  "Attendee",
  "Honoree",
] as const;

export type EventRole = (typeof eventRoleOptions)[number];

// Helper type for form data
export type EventFormData = Omit<Event, "id" | "createdAt" | "updatedAt" | "userId"> & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Weather response from API
export interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  feelsLike: number;
  windSpeed: number;
  icon?: string;
}
