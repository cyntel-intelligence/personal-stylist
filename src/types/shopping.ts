import { Timestamp } from "firebase/firestore";
import { OutfitItem, ItemCategory } from "./recommendation";

// Purchase status tracking
export type PurchaseStatus = "unpurchased" | "in-cart" | "purchased" | "skipped";

// Purchase record
export interface Purchase {
  id: string;
  userId: string;
  eventId: string;
  recommendationId: string;

  // Item details
  itemCategory: ItemCategory;
  itemIndex: number; // 0 = primary, 1+ = alternative index

  // Purchase information
  status: PurchaseStatus;
  purchasedAt?: Timestamp;
  actualPrice?: number; // What they actually paid
  estimatedPrice: number; // What was recommended

  // Shopping details
  retailer: string;
  productLink: string;
  productName: string;

  // Order tracking
  orderNumber?: string;
  trackingNumber?: string;
  expectedDelivery?: Timestamp;
  deliveredAt?: Timestamp;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
}

// Shopping item with event context (for dashboard)
export interface ShoppingItem {
  // Item details
  item: OutfitItem;
  category: ItemCategory;
  itemIndex: number; // Which alternative (0 = primary)

  // Event context
  eventId: string;
  eventType: string;
  eventDate: Timestamp;
  dressCode: string;
  recommendationId: string;

  // Purchase status
  purchaseStatus: PurchaseStatus;
  purchaseId?: string;

  // Priority indicators
  daysUntilEvent: number;
  isUrgent: boolean; // Less than 7 days
  shippingDeadline?: Timestamp;
}

// Filters for shopping dashboard
export interface ShoppingFilters {
  eventIds?: string[]; // Filter by specific events
  categories?: ItemCategory[]; // Filter by item category
  status?: PurchaseStatus[]; // Filter by purchase status
  minPrice?: number;
  maxPrice?: number;
  retailers?: string[];
  urgentOnly?: boolean; // Only show items with upcoming events
  closetItemsOnly?: boolean; // Only items from closet
  purchaseItemsOnly?: boolean; // Only items to purchase
}

// Sort options
export type ShoppingSortBy =
  | "event-date-asc" // Soonest events first
  | "event-date-desc" // Furthest events first
  | "price-asc" // Cheapest first
  | "price-desc" // Most expensive first
  | "category" // Group by category
  | "retailer" // Group by retailer
  | "status"; // Group by purchase status

// Shopping statistics
export interface ShoppingStats {
  totalItems: number;
  unpurchasedCount: number;
  purchasedCount: number;
  inCartCount: number;
  skippedCount: number;

  totalEstimatedCost: number;
  totalActualCost: number;
  remainingBudget: number;

  upcomingEventsCount: number;
  urgentItemsCount: number;

  itemsByCategory: Record<ItemCategory, number>;
  itemsByRetailer: Record<string, number>;
  itemsByEvent: Record<string, number>;
}

// Retailer grouping for batch shopping
export interface RetailerGroup {
  retailer: string;
  items: ShoppingItem[];
  totalEstimatedCost: number;
  unpurchasedCount: number;
  itemCount: number;
}

// Event shopping summary
export interface EventShoppingSummary {
  eventId: string;
  eventType: string;
  eventDate: Timestamp;
  dressCode: string;

  items: ShoppingItem[];
  totalItems: number;
  purchasedItems: number;
  unpurchasedItems: number;

  estimatedTotal: number;
  actualTotal: number;
  budgetRemaining: number;

  isComplete: boolean; // All items purchased or skipped
  daysUntilEvent: number;
  isUrgent: boolean;
}

// Purchase update request
export interface PurchaseUpdateRequest {
  status: PurchaseStatus;
  actualPrice?: number;
  orderNumber?: string;
  trackingNumber?: string;
  expectedDelivery?: Date;
  notes?: string;
}
