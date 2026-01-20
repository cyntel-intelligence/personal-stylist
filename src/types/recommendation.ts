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
    // Legacy format (for backward compatibility)
    totalPrice?: number;
    breakdown?: {
      dress?: number;
      shoes?: number;
      bag?: number;
      jewelry?: number;
      outerwear?: number;
    };
    hasLowerPriceAlternatives?: boolean;
    hasHigherPriceAlternatives?: boolean;

    // New format with alternatives
    primaryTotal?: number;  // Pricing for primary recommendations
    dynamicBreakdown?: Record<ItemCategory, number>;  // Dynamic categories
    minTotal?: number;   // Cheapest alternative combination
    maxTotal?: number;   // Most expensive alternative combination
  };

  // User Feedback
  userFeedback?: UserFeedback;

  // Metadata
  createdAt: Timestamp;
  generationMethod: "ai-full" | "ai-assisted" | "manual";
  version: number; // for tracking recommendation algorithm versions
}

// Define all supported item categories
export type ItemCategory =
  | 'dress'
  | 'tops'
  | 'bottoms'
  | 'jackets'
  | 'shoes'
  | 'bags'
  | 'jewelry'
  | 'accessories'
  | 'outerwear';

// Each category can have multiple alternatives
export interface OutfitItemWithAlternatives {
  category: ItemCategory;
  primary: OutfitItem;           // The AI's top recommendation
  alternatives: OutfitItem[];    // 1-2 additional options
  reason: string;                // Why this category is included
}

export interface CompleteOutfit {
  // New flexible structure with alternatives
  items?: OutfitItemWithAlternatives[];  // Dynamic list of item categories

  // Special handling for dress vs separates
  hasDressOption?: boolean;
  hasSeparatesOption?: boolean;   // top + bottom

  // Legacy fixed fields (for backward compatibility)
  dress?: OutfitItem;
  shoes?: OutfitItem;
  bag?: OutfitItem;
  jewelry?: JewelrySet;
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
