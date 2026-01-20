import {
  ShoppingItem,
  ShoppingFilters,
  ShoppingSortBy,
  ShoppingStats,
  RetailerGroup,
  EventShoppingSummary,
  PurchaseStatus,
  Purchase,
  PurchaseUpdateRequest
} from "@/types/shopping";
import { Event } from "@/types/event";
import { Recommendation, ItemCategory, OutfitItem } from "@/types/recommendation";
import { Timestamp } from "firebase/firestore";

/**
 * Calculate days until an event
 */
function getDaysUntilEvent(eventDate: Timestamp): number {
  const now = new Date();
  const event = eventDate.toDate();
  const diffTime = event.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Extract shopping items from a recommendation (handles both new and legacy formats)
 */
export function extractShoppingItemsFromRecommendation(
  recommendation: Recommendation,
  event: Event
): ShoppingItem[] {
  const items: ShoppingItem[] = [];
  const daysUntilEvent = getDaysUntilEvent(event.dateTime);

  // Check if new format (with alternatives)
  if (recommendation.outfit.items && recommendation.outfit.items.length > 0) {
    // New format: items with alternatives
    for (const categoryItem of recommendation.outfit.items) {
      // If user has selected specific alternatives, only show those
      if (event.selectedOutfit && event.selectedOutfit.recommendationId === recommendation.id) {
        const selectedIndex = event.selectedOutfit.selectedAlternatives[categoryItem.category] || 0;
        const allOptions = [categoryItem.primary, ...categoryItem.alternatives];
        const selectedItem = allOptions[selectedIndex];

        // Skip dress items if in separates mode, skip tops/bottoms if in dress mode
        const skipDress = event.selectedOutfit.mode === 'separates' && categoryItem.category === 'dress';
        const skipSeparates = event.selectedOutfit.mode === 'dress' &&
          (categoryItem.category === 'tops' || categoryItem.category === 'bottoms');

        if (!skipDress && !skipSeparates) {
          items.push({
            item: selectedItem,
            category: categoryItem.category,
            itemIndex: selectedIndex,
            eventId: event.id,
            eventType: event.eventType,
            eventDate: event.dateTime,
            dressCode: event.dressCode,
            recommendationId: recommendation.id,
            purchaseStatus: "unpurchased", // Will be updated from purchases collection
            daysUntilEvent,
            isUrgent: daysUntilEvent <= 7 && daysUntilEvent > 0,
            shippingDeadline: event.shippingDeadline,
          });
        }
      } else {
        // No selection made yet, show all primaries
        items.push({
          item: categoryItem.primary,
          category: categoryItem.category,
          itemIndex: 0,
          eventId: event.id,
          eventType: event.eventType,
          eventDate: event.dateTime,
          dressCode: event.dressCode,
          recommendationId: recommendation.id,
          purchaseStatus: "unpurchased",
          daysUntilEvent,
          isUrgent: daysUntilEvent <= 7 && daysUntilEvent > 0,
          shippingDeadline: event.shippingDeadline,
        });
      }
    }
  } else {
    // Legacy format: fixed outfit structure
    const outfit = recommendation.outfit;

    if (outfit.dress) {
      items.push({
        item: outfit.dress,
        category: "dress",
        itemIndex: 0,
        eventId: event.id,
        eventType: event.eventType,
        eventDate: event.dateTime,
        dressCode: event.dressCode,
        recommendationId: recommendation.id,
        purchaseStatus: "unpurchased",
        daysUntilEvent,
        isUrgent: daysUntilEvent <= 7 && daysUntilEvent > 0,
        shippingDeadline: event.shippingDeadline,
      });
    }

    if (outfit.shoes) {
      items.push({
        item: outfit.shoes,
        category: "shoes",
        itemIndex: 0,
        eventId: event.id,
        eventType: event.eventType,
        eventDate: event.dateTime,
        dressCode: event.dressCode,
        recommendationId: recommendation.id,
        purchaseStatus: "unpurchased",
        daysUntilEvent,
        isUrgent: daysUntilEvent <= 7 && daysUntilEvent > 0,
        shippingDeadline: event.shippingDeadline,
      });
    }

    if (outfit.bag) {
      items.push({
        item: outfit.bag,
        category: "bags",
        itemIndex: 0,
        eventId: event.id,
        eventType: event.eventType,
        eventDate: event.dateTime,
        dressCode: event.dressCode,
        recommendationId: recommendation.id,
        purchaseStatus: "unpurchased",
        daysUntilEvent,
        isUrgent: daysUntilEvent <= 7 && daysUntilEvent > 0,
        shippingDeadline: event.shippingDeadline,
      });
    }

    if (outfit.jewelry?.items) {
      outfit.jewelry.items.forEach((jewelryItem, idx) => {
        items.push({
          item: jewelryItem,
          category: "jewelry",
          itemIndex: idx,
          eventId: event.id,
          eventType: event.eventType,
          eventDate: event.dateTime,
          dressCode: event.dressCode,
          recommendationId: recommendation.id,
          purchaseStatus: "unpurchased",
          daysUntilEvent,
          isUrgent: daysUntilEvent <= 7 && daysUntilEvent > 0,
          shippingDeadline: event.shippingDeadline,
        });
      });
    }

    if (outfit.outerwear) {
      items.push({
        item: outfit.outerwear,
        category: "outerwear",
        itemIndex: 0,
        eventId: event.id,
        eventType: event.eventType,
        eventDate: event.dateTime,
        dressCode: event.dressCode,
        recommendationId: recommendation.id,
        purchaseStatus: "unpurchased",
        daysUntilEvent,
        isUrgent: daysUntilEvent <= 7 && daysUntilEvent > 0,
        shippingDeadline: event.shippingDeadline,
      });
    }
  }

  return items;
}

/**
 * Apply filters to shopping items
 */
export function applyFilters(items: ShoppingItem[], filters: ShoppingFilters): ShoppingItem[] {
  let filtered = [...items];

  if (filters.eventIds && filters.eventIds.length > 0) {
    filtered = filtered.filter(item => filters.eventIds!.includes(item.eventId));
  }

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(item => filters.categories!.includes(item.category));
  }

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(item => filters.status!.includes(item.purchaseStatus));
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(item => (item.item.price || 0) >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(item => (item.item.price || 0) <= filters.maxPrice!);
  }

  if (filters.retailers && filters.retailers.length > 0) {
    filtered = filtered.filter(item =>
      item.item.retailer && filters.retailers!.includes(item.item.retailer)
    );
  }

  if (filters.urgentOnly) {
    filtered = filtered.filter(item => item.isUrgent);
  }

  if (filters.closetItemsOnly) {
    filtered = filtered.filter(item => item.item.isClosetItem);
  }

  if (filters.purchaseItemsOnly) {
    filtered = filtered.filter(item => !item.item.isClosetItem);
  }

  return filtered;
}

/**
 * Sort shopping items
 */
export function sortItems(items: ShoppingItem[], sortBy: ShoppingSortBy): ShoppingItem[] {
  const sorted = [...items];

  switch (sortBy) {
    case "event-date-asc":
      return sorted.sort((a, b) => a.eventDate.toMillis() - b.eventDate.toMillis());

    case "event-date-desc":
      return sorted.sort((a, b) => b.eventDate.toMillis() - a.eventDate.toMillis());

    case "price-asc":
      return sorted.sort((a, b) => (a.item.price || 0) - (b.item.price || 0));

    case "price-desc":
      return sorted.sort((a, b) => (b.item.price || 0) - (a.item.price || 0));

    case "category":
      return sorted.sort((a, b) => a.category.localeCompare(b.category));

    case "retailer":
      return sorted.sort((a, b) =>
        (a.item.retailer || "").localeCompare(b.item.retailer || "")
      );

    case "status":
      return sorted.sort((a, b) => a.purchaseStatus.localeCompare(b.purchaseStatus));

    default:
      return sorted;
  }
}

/**
 * Calculate shopping statistics
 */
export function calculateStats(items: ShoppingItem[]): ShoppingStats {
  const stats: ShoppingStats = {
    totalItems: items.length,
    unpurchasedCount: 0,
    purchasedCount: 0,
    inCartCount: 0,
    skippedCount: 0,
    totalEstimatedCost: 0,
    totalActualCost: 0,
    remainingBudget: 0,
    upcomingEventsCount: 0,
    urgentItemsCount: 0,
    itemsByCategory: {} as Record<ItemCategory, number>,
    itemsByRetailer: {},
    itemsByEvent: {},
  };

  const uniqueEvents = new Set<string>();

  for (const item of items) {
    // Count by status
    switch (item.purchaseStatus) {
      case "unpurchased":
        stats.unpurchasedCount++;
        break;
      case "purchased":
        stats.purchasedCount++;
        break;
      case "in-cart":
        stats.inCartCount++;
        break;
      case "skipped":
        stats.skippedCount++;
        break;
    }

    // Calculate costs
    if (item.purchaseStatus !== "skipped") {
      stats.totalEstimatedCost += item.item.price || 0;
    }

    // Count urgent items
    if (item.isUrgent) {
      stats.urgentItemsCount++;
    }

    // Track unique events
    uniqueEvents.add(item.eventId);

    // Count by category
    stats.itemsByCategory[item.category] = (stats.itemsByCategory[item.category] || 0) + 1;

    // Count by retailer
    if (item.item.retailer) {
      stats.itemsByRetailer[item.item.retailer] = (stats.itemsByRetailer[item.item.retailer] || 0) + 1;
    }

    // Count by event
    stats.itemsByEvent[item.eventId] = (stats.itemsByEvent[item.eventId] || 0) + 1;
  }

  stats.upcomingEventsCount = uniqueEvents.size;
  stats.remainingBudget = stats.totalEstimatedCost - stats.totalActualCost;

  return stats;
}

/**
 * Group items by retailer
 */
export function groupByRetailer(items: ShoppingItem[]): RetailerGroup[] {
  const groups = new Map<string, ShoppingItem[]>();

  for (const item of items) {
    if (item.item.isClosetItem) continue; // Skip closet items

    const retailer = item.item.retailer || "Unknown Retailer";
    if (!groups.has(retailer)) {
      groups.set(retailer, []);
    }
    groups.get(retailer)!.push(item);
  }

  const retailerGroups: RetailerGroup[] = [];

  for (const [retailer, items] of groups.entries()) {
    retailerGroups.push({
      retailer,
      items,
      totalEstimatedCost: items.reduce((sum, item) => sum + (item.item.price || 0), 0),
      unpurchasedCount: items.filter(item => item.purchaseStatus === "unpurchased").length,
      itemCount: items.length,
    });
  }

  // Sort by item count descending
  return retailerGroups.sort((a, b) => b.itemCount - a.itemCount);
}

/**
 * Get event shopping summaries
 */
export function getEventSummaries(
  items: ShoppingItem[],
  events: Event[]
): EventShoppingSummary[] {
  const summaries: EventShoppingSummary[] = [];

  for (const event of events) {
    const eventItems = items.filter(item => item.eventId === event.id);

    if (eventItems.length === 0) continue;

    const purchasedCount = eventItems.filter(item => item.purchaseStatus === "purchased").length;
    const unpurchasedCount = eventItems.filter(item =>
      item.purchaseStatus === "unpurchased" || item.purchaseStatus === "in-cart"
    ).length;

    const estimatedTotal = eventItems
      .filter(item => item.purchaseStatus !== "skipped")
      .reduce((sum, item) => sum + (item.item.price || 0), 0);

    const actualTotal = 0; // Will be calculated from actual purchases

    const daysUntilEvent = getDaysUntilEvent(event.dateTime);

    summaries.push({
      eventId: event.id,
      eventType: event.eventType,
      eventDate: event.dateTime,
      dressCode: event.dressCode,
      items: eventItems,
      totalItems: eventItems.length,
      purchasedItems: purchasedCount,
      unpurchasedItems: unpurchasedCount,
      estimatedTotal,
      actualTotal,
      budgetRemaining: estimatedTotal - actualTotal,
      isComplete: unpurchasedCount === 0,
      daysUntilEvent,
      isUrgent: daysUntilEvent <= 7 && daysUntilEvent > 0,
    });
  }

  // Sort by event date (soonest first)
  return summaries.sort((a, b) => a.eventDate.toMillis() - b.eventDate.toMillis());
}

/**
 * Get unique retailers from items
 */
export function getUniqueRetailers(items: ShoppingItem[]): string[] {
  const retailers = new Set<string>();

  for (const item of items) {
    if (item.item.retailer && !item.item.isClosetItem) {
      retailers.add(item.item.retailer);
    }
  }

  return Array.from(retailers).sort();
}

/**
 * Open all product links in new tabs
 */
export function openAllLinks(items: ShoppingItem[]): void {
  const links = items
    .filter(item => item.item.productLink && item.purchaseStatus === "unpurchased")
    .map(item => item.item.productLink!)
    .filter((link, index, self) => self.indexOf(link) === index); // Remove duplicates

  links.forEach(link => {
    window.open(link, '_blank');
  });
}
