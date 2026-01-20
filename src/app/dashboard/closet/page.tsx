"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ClosetItem, ItemCategory } from "@/types/closet";
import { closetService } from "@/lib/firebase/firestore";
import { ClosetGrid } from "@/components/closet/ClosetGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

const categoryOptions: { value: ItemCategory | "all"; label: string; icon: string }[] = [
  { value: "all", label: "All Items", icon: "✨" },
  { value: "dress", label: "Dresses", icon: "👗" },
  { value: "shoes", label: "Shoes", icon: "👠" },
  { value: "bag", label: "Bags", icon: "👜" },
  { value: "outerwear", label: "Outerwear", icon: "🧥" },
  { value: "jewelry", label: "Jewelry", icon: "💎" },
];

export default function ClosetPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | "all">("all");

  useEffect(() => {
    if (!user) return;

    const loadItems = async () => {
      try {
        const closetItems = await closetService.getUserCloset(user.uid);
        setItems(closetItems);
        setFilteredItems(closetItems);
      } catch (error) {
        console.error("Error loading closet:", error);
        toast.error("Failed to load closet items");
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = items;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  }, [items, categoryFilter]);

  const handleDelete = async (itemId: string) => {
    try {
      await closetService.deleteItem(itemId);
      setItems(items.filter((item) => item.id !== itemId));
      toast.success("Item removed from closet");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleToggleFavorite = async (itemId: string) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const newFavoriteStatus = !item.tags.preferToRewear;

      await closetService.updateItem(itemId, {
        tags: {
          ...item.tags,
          preferToRewear: newFavoriteStatus,
        },
      });

      setItems(
        items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                tags: {
                  ...i.tags,
                  preferToRewear: newFavoriteStatus,
                },
              }
            : i
        )
      );

      toast.success(newFavoriteStatus ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update item");
    }
  };

  const handleUpdate = async (itemId: string, data: Partial<ClosetItem>) => {
    try {
      await closetService.updateItem(itemId, data);

      setItems(
        items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                ...data,
              }
            : i
        )
      );

      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const getCategoryCount = (category: ItemCategory | "all"): number => {
    if (category === "all") return items.length;
    return items.filter((item) => item.category === category).length;
  };

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
              <Link href="/dashboard/shopping" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                Shopping
              </Link>
              <Link href="/dashboard/closet" className="text-sm text-blush font-medium">
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

      <div className="container mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blush font-medium mb-2">
              Your Wardrobe
            </p>
            <h1 className="text-4xl md:text-5xl">My Closet</h1>
            <p className="text-lg font-display text-muted-foreground mt-2">
              {items.length} {items.length === 1 ? "piece" : "pieces"} in your collection
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/closet/upload")}
            className="btn-luxe bg-gradient-luxe border-0 rounded-full px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Category Stats */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {categoryOptions.map((category) => {
              const count = getCategoryCount(category.value);
              const isActive = categoryFilter === category.value;
              return (
                <Card
                  key={category.value}
                  className={`cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "shadow-luxe-lg border-primary bg-blush"
                      : "shadow-luxe hover:shadow-luxe-lg border-border"
                  }`}
                  onClick={() => setCategoryFilter(category.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className={`text-2xl font-serif ${isActive ? 'text-gradient-luxe' : ''}`}>{count}</div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{category.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Filter Bar */}
        <Card className="mb-8 shadow-luxe border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-blush" />
                <span className="text-sm font-medium">Filter by category:</span>
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as ItemCategory | "all")}
              >
                <SelectTrigger className="w-48 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon} {option.label} ({getCategoryCount(option.value)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {categoryFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategoryFilter("all")}
                  className="text-blush hover:text-blush/80"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <ClosetGrid
          items={filteredItems}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          onUpdate={handleUpdate}
          loading={loading}
        />

        {/* Empty State for No Results */}
        {!loading && items.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-display text-lg">No items match your filters</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => setCategoryFilter("all")}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Empty Closet State */}
        {!loading && items.length === 0 && (
          <Card className="shadow-luxe border-border">
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-6">👗</div>
              <h3 className="text-2xl font-serif mb-3">Your closet awaits</h3>
              <p className="text-muted-foreground font-display text-lg mb-8 max-w-md mx-auto">
                Start building your digital wardrobe to get personalized styling recommendations
              </p>
              <Button
                onClick={() => router.push("/dashboard/closet/upload")}
                className="btn-luxe bg-gradient-luxe border-0 rounded-full px-8"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Piece
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
