"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";
import { Recommendation } from "@/types/recommendation";
import { ShoppingItem, ShoppingFilters, ShoppingSortBy, PurchaseStatus } from "@/types/shopping";
import { eventService, recommendationService } from "@/lib/firebase/firestore";
import {
  extractShoppingItemsFromRecommendation,
  applyFilters,
  sortItems,
  calculateStats,
  getUniqueRetailers,
  openAllLinks,
} from "@/lib/services/shopping";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Heart,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ViewTab = "recommendations" | "in-cart" | "saved" | "favorites";

export default function ShoppingDashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [allItems, setAllItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [activeTab, setActiveTab] = useState<ViewTab>("recommendations");
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());

  // UI state
  const [filters, setFilters] = useState<ShoppingFilters>({});
  const [sortBy, setSortBy] = useState<ShoppingSortBy>("event-date-asc");
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Load data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const userEvents = await eventService.getUserEvents(user.uid);
        const eventsWithRecs = userEvents.filter(
          e => e.recommendationsGenerated && e.recommendationIds.length > 0
        );
        setEvents(eventsWithRecs);

        const allShoppingItems: ShoppingItem[] = [];
        for (const event of eventsWithRecs) {
          const recommendations = await recommendationService.getEventRecommendations(event.id);
          for (const rec of recommendations) {
            const items = extractShoppingItemsFromRecommendation(rec, event);
            allShoppingItems.push(...items);
          }
        }
        setAllItems(allShoppingItems);
      } catch (error) {
        console.error("Error loading shopping data:", error);
        toast.error("Failed to load shopping data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Helper to create unique item key
  const getItemKey = (item: ShoppingItem) =>
    `${item.eventId}-${item.recommendationId}-${item.category}-${item.itemIndex}`;

  // Filter items based on active tab
  const tabFilteredItems = useMemo(() => {
    switch (activeTab) {
      case "in-cart":
        return allItems.filter(item => item.purchaseStatus === "in-cart");
      case "saved":
        return allItems.filter(item => savedItems.has(getItemKey(item)));
      case "favorites":
        return allItems.filter(item => favoritedItems.has(getItemKey(item)));
      case "recommendations":
      default:
        return allItems;
    }
  }, [allItems, activeTab, savedItems, favoritedItems]);

  // Apply filters and sorting
  const filteredAndSortedItems = useMemo(() => {
    let items = applyFilters(tabFilteredItems, filters);
    items = sortItems(items, sortBy);
    return items;
  }, [tabFilteredItems, filters, sortBy]);

  const stats = useMemo(() => calculateStats(allItems), [allItems]);
  const uniqueRetailers = useMemo(() => getUniqueRetailers(allItems), [allItems]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    recommendations: allItems.length,
    inCart: allItems.filter(i => i.purchaseStatus === "in-cart").length,
    saved: savedItems.size,
    favorites: favoritedItems.size,
  }), [allItems, savedItems, favoritedItems]);

  const handleToggleStatus = (item: ShoppingItem, newStatus: PurchaseStatus) => {
    setAllItems(items =>
      items.map(i =>
        i.eventId === item.eventId &&
        i.recommendationId === item.recommendationId &&
        i.category === item.category &&
        i.itemIndex === item.itemIndex
          ? { ...i, purchaseStatus: newStatus }
          : i
      )
    );
    toast.success(`Marked as ${newStatus}`);
  };

  const handleToggleSave = (item: ShoppingItem) => {
    const key = getItemKey(item);
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
        toast.success("Removed from saved");
      } else {
        newSet.add(key);
        toast.success("Saved for later");
      }
      return newSet;
    });
  };

  const handleToggleFavorite = (item: ShoppingItem) => {
    const key = getItemKey(item);
    setFavoritedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
        toast.success("Removed from favorites");
      } else {
        newSet.add(key);
        toast.success("Added to favorites");
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-display text-muted-foreground">Loading your shopping...</div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-cream">
        {/* Navigation Bar */}
        <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="font-serif text-xl tracking-tight">
                <span className="text-blush">Personal</span> Stylist
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/dashboard/shopping" className="text-sm text-blush font-medium">
                  Shopping
                </Link>
                <Link href="/dashboard/closet" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                  Closet
                </Link>
                <Link href="/dashboard/events" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                  Events
                </Link>
                <Button onClick={() => signOut()} variant="ghost" size="sm" className="text-muted-foreground">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-6 py-16 max-w-4xl text-center">
          <div className="w-20 h-20 rounded-full bg-blush flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-10 w-10 text-blush" />
          </div>
          <h1 className="text-4xl font-serif mb-4">Your Shopping</h1>
          <p className="text-muted-foreground font-display mb-8 text-lg">
            Create events and generate recommendations to start shopping
          </p>
          <Button size="lg" onClick={() => router.push("/dashboard/events")} className="btn-luxe bg-gradient-luxe border-0 rounded-full">
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cream">
      {/* Navigation Bar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-serif text-xl tracking-tight">
              <span className="text-blush">Personal</span> Stylist
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/dashboard/shopping" className="text-sm text-blush font-medium">
                Shopping
              </Link>
              <Link href="/dashboard/closet" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                Closet
              </Link>
              <Link href="/dashboard/events" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                Events
              </Link>
              <Button onClick={() => signOut()} variant="ghost" size="sm" className="text-muted-foreground">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-16 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blush font-medium mb-1">
                Curated For You
              </p>
              <h1 className="text-3xl font-serif tracking-tight">Shop Your Style</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 text-muted-foreground hover:text-blush"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ShoppingSortBy)}
                className="px-4 py-2 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              >
                <option value="event-date-asc">Soonest Events</option>
                <option value="event-date-desc">Latest Events</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-8 border-b border-border">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={cn(
                "pb-4 px-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === "recommendations"
                  ? "border-primary text-blush"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Recommendations
                {tabCounts.recommendations > 0 && (
                  <span className="text-xs opacity-60">({tabCounts.recommendations})</span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("in-cart")}
              className={cn(
                "pb-4 px-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === "in-cart"
                  ? "border-primary text-blush"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                In Cart
                {tabCounts.inCart > 0 && (
                  <span className="text-xs opacity-60">({tabCounts.inCart})</span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={cn(
                "pb-4 px-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === "saved"
                  ? "border-primary text-blush"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved
                {tabCounts.saved > 0 && (
                  <span className="text-xs opacity-60">({tabCounts.saved})</span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("favorites")}
              className={cn(
                "pb-4 px-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === "favorites"
                  ? "border-primary text-blush"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favorites
                {tabCounts.favorites > 0 && (
                  <span className="text-xs opacity-60">({tabCounts.favorites})</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-64 flex-shrink-0 sticky top-64 h-fit">
              <div className="space-y-6 bg-card p-5 rounded-xl shadow-luxe border border-border">
                {/* Status Filter - Only show in Recommendations tab */}
                {activeTab === "recommendations" && (
                  <div>
                    <h3 className="font-medium mb-3 text-sm uppercase tracking-wider text-blush">Status</h3>
                    <div className="space-y-2">
                      {[
                        { value: "unpurchased", label: "To Buy", count: stats.unpurchasedCount },
                        { value: "in-cart", label: "In Cart", count: stats.inCartCount },
                        { value: "purchased", label: "Purchased", count: stats.purchasedCount },
                        { value: "skipped", label: "Skipped", count: stats.skippedCount },
                      ].map((status) => (
                        <label key={status.value} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(status.value as PurchaseStatus)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(f => ({
                                  ...f,
                                  status: [...(f.status || []), status.value as PurchaseStatus]
                                }));
                              } else {
                                setFilters(f => ({
                                  ...f,
                                  status: f.status?.filter(s => s !== status.value)
                                }));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-black flex-1">
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-400">{status.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3 text-sm uppercase tracking-wide">Category</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.itemsByCategory).map(([category, count]) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.categories?.includes(category as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(f => ({
                                ...f,
                                categories: [...(f.categories || []), category as any]
                              }));
                            } else {
                              setFilters(f => ({
                                ...f,
                                categories: f.categories?.filter(c => c !== category)
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-black capitalize flex-1">
                          {category}
                        </span>
                        <span className="text-xs text-gray-400">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Retailer Filter */}
                {uniqueRetailers.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 text-sm uppercase tracking-wide">Retailer</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uniqueRetailers.map((retailer) => (
                        <label key={retailer} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.retailers?.includes(retailer)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(f => ({
                                  ...f,
                                  retailers: [...(f.retailers || []), retailer]
                                }));
                              } else {
                                setFilters(f => ({
                                  ...f,
                                  retailers: f.retailers?.filter(r => r !== retailer)
                                }));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-black">
                            {retailer}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-3 text-sm uppercase tracking-wide">Price Range</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice || ""}
                          onChange={(e) => setFilters(f => ({
                            ...f,
                            minPrice: e.target.value ? Number(e.target.value) : undefined
                          }))}
                          className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ""}
                          onChange={(e) => setFilters(f => ({
                            ...f,
                            maxPrice: e.target.value ? Number(e.target.value) : undefined
                          }))}
                          className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {[50, 100, 200, 500].map((max) => (
                        <button
                          key={max}
                          onClick={() => setFilters(f => ({ ...f, minPrice: undefined, maxPrice: max }))}
                          className={cn(
                            "px-2 py-1 text-xs border rounded-full transition-colors",
                            filters.maxPrice === max && !filters.minPrice
                              ? "bg-black text-white border-black"
                              : "border-gray-200 hover:border-gray-400"
                          )}
                        >
                          Under ${max}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h3 className="font-medium mb-3 text-sm uppercase tracking-wide">Quick Filters</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.urgentOnly}
                        onChange={(e) => setFilters(f => ({ ...f, urgentOnly: e.target.checked || undefined }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-black">
                        Urgent (≤7 days)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.purchaseItemsOnly}
                        onChange={(e) => setFilters(f => ({ ...f, purchaseItemsOnly: e.target.checked || undefined }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-black">
                        To Purchase Only
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.closetItemsOnly}
                        onChange={(e) => setFilters(f => ({ ...f, closetItemsOnly: e.target.checked || undefined }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-black">
                        From My Closet Only
                      </span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                {Object.keys(filters).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({})}
                    className="w-full text-sm"
                  >
                    Clear All Filters
                  </Button>
                )}

                {/* Actions */}
                <div className="pt-4 border-t space-y-2">
                  <Button
                    onClick={() => openAllLinks(filteredAndSortedItems.filter(i => i.purchaseStatus === "unpurchased"))}
                    disabled={filteredAndSortedItems.filter(i => i.purchaseStatus === "unpurchased").length === 0}
                    className="w-full rounded-full"
                    size="sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Shop All
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-2">No items in {activeTab.replace("-", " ")}</p>
                {activeTab !== "recommendations" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("recommendations")}
                  >
                    View All Recommendations
                  </Button>
                )}
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                showFilters ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-3 lg:grid-cols-4"
              )}>
                {filteredAndSortedItems.map((item, idx) => (
                  <ProductCard
                    key={`${getItemKey(item)}-${idx}`}
                    item={item}
                    isSaved={savedItems.has(getItemKey(item))}
                    isFavorited={favoritedItems.has(getItemKey(item))}
                    onStatusChange={handleToggleStatus}
                    onToggleSave={handleToggleSave}
                    onToggleFavorite={handleToggleFavorite}
                    onQuickView={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedItem && (
        <QuickViewModal
          item={selectedItem}
          isSaved={savedItems.has(getItemKey(selectedItem))}
          isFavorited={favoritedItems.has(getItemKey(selectedItem))}
          onClose={() => setSelectedItem(null)}
          onStatusChange={handleToggleStatus}
          onToggleSave={handleToggleSave}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({
  item,
  isSaved,
  isFavorited,
  onStatusChange,
  onToggleSave,
  onToggleFavorite,
  onQuickView,
}: {
  item: ShoppingItem;
  isSaved: boolean;
  isFavorited: boolean;
  onStatusChange: (item: ShoppingItem, status: PurchaseStatus) => void;
  onToggleSave: (item: ShoppingItem) => void;
  onToggleFavorite: (item: ShoppingItem) => void;
  onQuickView: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-50 rounded-sm overflow-hidden mb-3">
        {item.item.imageUrl ? (
          <img
            src={item.item.imageUrl}
            alt={item.item.productName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {item.category === 'dress' ? '👗' :
             item.category === 'shoes' ? '👠' :
             item.category === 'bags' ? '👜' :
             item.category === 'jewelry' ? '💎' :
             item.category === 'tops' ? '👚' :
             item.category === 'bottoms' ? '👖' :
             item.category === 'jackets' ? '🧥' : '✨'}
          </div>
        )}

        {/* Status Badge - Top Left */}
        <div className="absolute top-2 left-2">
          {item.purchaseStatus === "purchased" && (
            <Badge className="bg-green-500 text-white border-0 rounded-full">
              <Check className="h-3 w-3" />
            </Badge>
          )}
          {item.purchaseStatus === "in-cart" && (
            <Badge className="bg-blue-500 text-white border-0 rounded-full">
              <ShoppingCart className="h-3 w-3" />
            </Badge>
          )}
          {item.isUrgent && item.purchaseStatus === "unpurchased" && (
            <Badge className="bg-red-500 text-white border-0 rounded-full text-xs">
              {item.daysUntilEvent}d
            </Badge>
          )}
        </div>

        {/* Save/Favorite Icons - Top Right */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item);
            }}
            className={cn(
              "p-1.5 rounded-full transition-all",
              isFavorited
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-700 hover:bg-white"
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(item);
            }}
            className={cn(
              "p-1.5 rounded-full transition-all",
              isSaved
                ? "bg-black text-white"
                : "bg-white/90 text-gray-700 hover:bg-white"
            )}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
        </div>

        {/* Quick Actions - Overlay on Hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-2 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={onQuickView}
            >
              Quick View
            </Button>
            {item.item.productLink && (
              <Button
                size="sm"
                className="rounded-full"
                asChild
              >
                <a href={item.item.productLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Closet Item Badge */}
        {item.item.isClosetItem && (
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-white text-black border-0 text-xs">Your Closet</Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {item.item.retailer && !item.item.isClosetItem && (
          <div className="text-xs uppercase tracking-wide text-gray-500">
            {item.item.retailer}
          </div>
        )}
        <h3 className="text-sm font-light line-clamp-2 hover:underline">
          {item.item.productName}
        </h3>
        <div className="flex items-center justify-between">
          {item.item.price && !item.item.isClosetItem ? (
            <div className="font-medium">${item.item.price}</div>
          ) : (
            <div className="text-sm text-gray-500">From Closet</div>
          )}
        </div>
        <div className="text-xs text-gray-500 capitalize">
          For {item.eventType} • {format(item.eventDate.toDate(), "MMM d")}
        </div>
      </div>

      {/* Quick Status Actions */}
      <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {item.purchaseStatus !== "in-cart" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(item, "in-cart");
            }}
            className="flex-1 py-1 px-2 text-xs border border-gray-200 rounded hover:bg-gray-50"
          >
            <ShoppingCart className="h-3 w-3 inline mr-1" />
            Add to Cart
          </button>
        )}
        {item.purchaseStatus !== "purchased" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(item, "purchased");
            }}
            className="flex-1 py-1 px-2 text-xs border border-gray-200 rounded hover:bg-gray-50"
          >
            <Check className="h-3 w-3 inline mr-1" />
            Purchased
          </button>
        )}
      </div>
    </div>
  );
}

// Quick View Modal Component
function QuickViewModal({
  item,
  isSaved,
  isFavorited,
  onClose,
  onStatusChange,
  onToggleSave,
  onToggleFavorite,
}: {
  item: ShoppingItem;
  isSaved: boolean;
  isFavorited: boolean;
  onClose: () => void;
  onStatusChange: (item: ShoppingItem, status: PurchaseStatus) => void;
  onToggleSave: (item: ShoppingItem) => void;
  onToggleFavorite: (item: ShoppingItem) => void;
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden">
            {item.item.imageUrl ? (
              <img
                src={item.item.imageUrl}
                alt={item.item.productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">
                {item.category === 'dress' ? '👗' :
                 item.category === 'shoes' ? '👠' :
                 item.category === 'bags' ? '👜' :
                 item.category === 'jewelry' ? '💎' :
                 item.category === 'tops' ? '👚' :
                 item.category === 'bottoms' ? '👖' :
                 item.category === 'jackets' ? '🧥' : '✨'}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {item.item.retailer && (
                <div className="text-sm uppercase tracking-wide text-gray-500 mb-2">
                  {item.item.retailer}
                </div>
              )}
              <h2 className="text-2xl font-light mb-2">{item.item.productName}</h2>
              {item.item.price && !item.item.isClosetItem && (
                <div className="text-3xl font-medium">${item.item.price}</div>
              )}
              {item.item.isClosetItem && (
                <Badge className="bg-gray-100 text-gray-800">From Your Closet</Badge>
              )}
            </div>

            {/* Save/Favorite Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleFavorite(item)}
                className={cn("flex-1", isFavorited && "bg-red-50 border-red-500")}
              >
                <Heart className={cn("mr-2 h-4 w-4", isFavorited && "fill-current text-red-500")} />
                {isFavorited ? "Favorited" : "Favorite"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleSave(item)}
                className={cn("flex-1", isSaved && "bg-gray-50 border-gray-900")}
              >
                <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} />
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>

            {item.item.description && (
              <div>
                <h3 className="font-medium mb-2">Why This Works</h3>
                <p className="text-gray-600 text-sm">{item.item.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-2">Event Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="capitalize">{item.eventType} • {item.dressCode}</div>
                <div>{format(item.eventDate.toDate(), "EEEE, MMMM d, yyyy")}</div>
                {item.isUrgent && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Only {item.daysUntilEvent} days away!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {item.item.productLink && !item.item.isClosetItem && (
                <Button
                  size="lg"
                  className="w-full rounded-full"
                  asChild
                >
                  <a href={item.item.productLink} target="_blank" rel="noopener noreferrer">
                    Shop Now at {item.item.retailer}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}

              <div className="flex gap-2">
                {item.purchaseStatus !== "in-cart" && (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      onStatusChange(item, "in-cart");
                      onClose();
                    }}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
                {item.purchaseStatus !== "purchased" && (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      onStatusChange(item, "purchased");
                      onClose();
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark Purchased
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
