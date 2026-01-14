"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ClosetItem, ItemCategory } from "@/types/closet";
import { closetService } from "@/lib/firebase/firestore";
import { ClosetGrid } from "@/components/closet/ClosetGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import { toast } from "sonner";

const categoryOptions: { value: ItemCategory | "all"; label: string }[] = [
  { value: "all", label: "All Items" },
  { value: "dress", label: "Dresses" },
  { value: "shoes", label: "Shoes" },
  { value: "bag", label: "Bags" },
  { value: "outerwear", label: "Outerwear" },
  { value: "jewelry", label: "Jewelry" },
];

export default function ClosetPage() {
  const router = useRouter();
  const { user } = useAuth();
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

  const getCategoryCount = (category: ItemCategory | "all"): number => {
    if (category === "all") return items.length;
    return items.filter((item) => item.category === category).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Closet</h1>
            <p className="text-gray-600 mt-2">
              {items.length} {items.length === 1 ? "item" : "items"} in your digital wardrobe
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/closet/upload")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filter by:</span>
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as ItemCategory | "all")}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({getCategoryCount(option.value)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {categoryFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategoryFilter("all")}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {categoryOptions.slice(1).map((category) => {
              const count = getCategoryCount(category.value as ItemCategory);
              return (
                <Card
                  key={category.value}
                  className={`cursor-pointer transition-all ${
                    categoryFilter === category.value
                      ? "border-blue-500 bg-blue-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setCategoryFilter(category.value as ItemCategory)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 mt-1">{category.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Items Grid */}
        <ClosetGrid
          items={filteredItems}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          loading={loading}
        />

        {/* Empty State for No Results */}
        {!loading && items.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No items match your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setCategoryFilter("all")}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
