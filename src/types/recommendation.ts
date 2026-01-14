import { Timestamp } from "firebase/firestore";

export interface Recommendation {
  id: string;
  eventId: string;
  userId: string;

  // Complete Outfit
  outfit: CompleteOutfit;

  // AI Reasoning
  aiReasoning: {
    flatteryNotes: string[];
    dressCodeFit: string;
    styleMatch: string;
    weatherAppropriate: string;
    confidenceScore: number; // 0-100
  };

  // Pricing
  pricing: {
    totalPrice: number;
    breakdown: {
      dress: number;
      shoes: number;
      bag: number;
      jewelry: number;
      outerwear?: number;
    };
    hasLowerPriceAlternatives: boolean;
    hasHigherPriceAlternatives: boolean;
  };

  // User Feedback
  userFeedback?: UserFeedback;

  // Metadata
  createdAt: Timestamp;
  generationMethod: "ai-full" | "ai-assisted" | "manual";
  version: number; // for tracking recommendation algorithm versions
}

export interface CompleteOutfit {
  dress: OutfitItem;
  shoes: OutfitItem;
  bag: OutfitItem;
  jewelry: JewelrySet;
  outerwear?: OutfitItem;
}

export interface OutfitItem {
  isClosetItem: boolean;
  closetItemId?: string; // if from user's closet
  productLink?: string; // if purchasing
  retailer?: string;
  price?: number;
  imageUrl: string;
  productName: string;
  shippingEstimate?: string;
  alternativeSizes?: number[];
}

export interface JewelrySet {
  items: OutfitItem[]; // can have multiple pieces (earrings + necklace)
}

export interface UserFeedback {
  reaction: "love" | "like" | "meh" | "no";
  detailedFeedback?: DetailedFeedback;
  outfitScore?: number; // 1-10
  notes?: string;
  timestamp: Timestamp;
}

export interface DetailedFeedback {
  necklineIssue?: boolean;
  colorIssue?: boolean;
  lengthIssue?: boolean;
  sleeveIssue?: boolean;
  fitIssue?: boolean;
  tooSexy?: boolean;
  tooBoring?: boolean;
  tooTrendy?: boolean;
  tooExpensive?: boolean;
  wrongStyle?: boolean;
}

// Helper types for displaying recommendations
export interface RecommendationWithEvent extends Recommendation {
  eventType: string;
  eventDate: Timestamp;
}

// Type for recommendation generation request
export interface GenerateRecommendationRequest {
  eventId: string;
  userId: string;
  forceRegenerate?: boolean;
}

// Type for recommendation filter/sort
export interface RecommendationFilters {
  minConfidenceScore?: number;
  maxPrice?: number;
  minPrice?: number;
  includeClosetItems?: boolean;
  reactions?: ("love" | "like" | "meh" | "no")[];
}

export type RecommendationSortBy = "confidence" | "price-asc" | "price-desc" | "created-at";

// Type for recommendation analytics
export interface RecommendationAnalytics {
  totalRecommendations: number;
  averageConfidenceScore: number;
  feedbackDistribution: Record<"love" | "like" | "meh" | "no", number>;
  mostLovedFeatures: string[];
  mostDislikedFeatures: string[];
  averageOutfitScore: number;
}
