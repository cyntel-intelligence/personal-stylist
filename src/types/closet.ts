import { Timestamp } from "firebase/firestore";

export interface ClosetItem {
  id: string;
  userId: string;

  // Item Details
  category: ItemCategory;
  subcategory?: string; // "necklace", "earrings", "clutch", "heels", etc.

  // Visual Data
  images: {
    original: string; // Firebase Storage URL
    thumbnail: string;
    processed?: string; // background-removed version
  };

  // AI Analysis (generated on upload)
  aiAnalysis: {
    color: string[];
    style: string[];
    pattern?: string;
    occasion: string[]; // "formal", "casual", etc.
    season: string[]; // "summer", "winter", etc.
  };

  // User Metadata
  brand?: string;
  purchaseDate?: Timestamp;
  price?: number;
  retailer?: string;

  // User Tags
  tags: {
    refuseToRewear: boolean;
    preferToRewear: boolean;
    mustUseForEvent?: string; // event ID
  };

  // Usage Tracking
  wornCount: number;
  lastWorn?: Timestamp;
  associatedEvents: string[]; // event IDs

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ItemCategory = "dress" | "shoes" | "bag" | "outerwear" | "jewelry";

// Subcategories by category
export const subcategoriesByCategory: Record<ItemCategory, string[]> = {
  dress: ["Mini Dress", "Midi Dress", "Maxi Dress", "Cocktail Dress", "Formal Gown", "Jumpsuit"],
  shoes: ["Heels", "Flats", "Sandals", "Boots", "Wedges", "Sneakers"],
  bag: ["Clutch", "Crossbody", "Tote", "Evening Bag", "Shoulder Bag"],
  outerwear: ["Blazer", "Coat", "Jacket", "Cardigan", "Shawl", "Cape"],
  jewelry: ["Necklace", "Earrings", "Bracelet", "Ring", "Brooch"],
};

// Style descriptors
export const styleDescriptors = [
  "Classic",
  "Modern",
  "Edgy",
  "Romantic",
  "Bohemian",
  "Minimalist",
  "Glamorous",
  "Preppy",
  "Vintage",
  "Trendy",
  "Elegant",
  "Casual",
] as const;

export type StyleDescriptor = (typeof styleDescriptors)[number];

// Occasions
export const occasions = [
  "Formal",
  "Semi-Formal",
  "Cocktail",
  "Casual",
  "Work",
  "Date Night",
  "Weekend",
  "Vacation",
] as const;

export type Occasion = (typeof occasions)[number];

// Seasons
export const seasons = ["Spring", "Summer", "Fall", "Winter", "All Season"] as const;

export type Season = (typeof seasons)[number];

// Helper type for form upload
export interface ClosetItemUpload {
  category: ItemCategory;
  subcategory?: string;
  brand?: string;
  price?: number;
  retailer?: string;
  file: File;
}

// Filter options for closet view
export interface ClosetFilters {
  categories?: ItemCategory[];
  colors?: string[];
  styles?: string[];
  occasions?: string[];
  seasons?: string[];
  refuseToRewear?: boolean;
  preferToRewear?: boolean;
}

// Closet statistics
export interface ClosetStats {
  totalItems: number;
  byCategory: Record<ItemCategory, number>;
  mostWorn: ClosetItem[];
  leastWorn: ClosetItem[];
  averagePrice: number;
  totalValue: number;
}
