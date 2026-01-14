"use client";

import { useState } from "react";
import { ClosetItem, ItemCategory } from "@/types/closet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  items: ClosetItem[];
  onDelete?: (itemId: string) => void;
  onToggleFavorite?: (itemId: string) => void;
  loading?: boolean;
};

const categoryIcons: Record<ItemCategory, string> = {
  dress: "👗",
  shoes: "👠",
  bag: "👜",
  outerwear: "🧥",
  jewelry: "💎",
};

export function ClosetGrid({ items, onDelete, onToggleFavorite, loading }: Props) {
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <CardContent className="p-3">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">👗</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No items in your closet yet</h3>
        <p className="text-gray-600">Start adding items to build your digital wardrobe</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="group cursor-pointer hover:shadow-lg transition-all relative overflow-hidden"
            onClick={() => setSelectedItem(item)}
          >
            <div className="aspect-square relative bg-gray-100">
              <img
                src={item.images.thumbnail}
                alt={`${item.category} item`}
                className="w-full h-full object-cover"
              />

              {/* Category Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  {categoryIcons[item.category]} {item.category}
                </Badge>
              </div>

              {/* Favorite Icon */}
              {item.tags.preferToRewear && (
                <div className="absolute top-2 right-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(item.id);
                  }}
                >
                  <Star className={`h-4 w-4 ${item.tags.preferToRewear ? 'fill-yellow-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this item?")) {
                      onDelete?.(item.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-3">
              <div className="font-medium text-sm capitalize mb-1">
                {item.subcategory || item.category}
              </div>
              {item.brand && (
                <div className="text-xs text-gray-600">{item.brand}</div>
              )}
              {item.aiAnalysis.color.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {item.aiAnalysis.color.slice(0, 3).map((color, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {selectedItem.subcategory || selectedItem.category}
                </DialogTitle>
                <DialogDescription>
                  Added {new Date(selectedItem.createdAt.toDate()).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedItem.images.original}
                    alt={`${selectedItem.category} item`}
                    className="w-full rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="capitalize">{selectedItem.category}</span>
                      </div>
                      {selectedItem.subcategory && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span>{selectedItem.subcategory}</span>
                        </div>
                      )}
                      {selectedItem.brand && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Brand:</span>
                          <span>{selectedItem.brand}</span>
                        </div>
                      )}
                      {selectedItem.price && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span>${selectedItem.price.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedItem.retailer && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Retailer:</span>
                          <span>{selectedItem.retailer}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Times Worn:</span>
                        <span>{selectedItem.wornCount}</span>
                      </div>
                    </div>
                  </div>

                  {selectedItem.aiAnalysis.color.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Colors</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.aiAnalysis.color.map((color, idx) => (
                          <Badge key={idx} variant="secondary">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.aiAnalysis.style.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Style</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.aiAnalysis.style.map((style, idx) => (
                          <Badge key={idx} variant="secondary">
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.aiAnalysis.occasion.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Suitable For</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.aiAnalysis.occasion.map((occasion, idx) => (
                          <Badge key={idx} variant="outline">
                            {occasion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        onToggleFavorite?.(selectedItem.id);
                        setSelectedItem(null);
                      }}
                    >
                      <Star className={`mr-2 h-4 w-4 ${selectedItem.tags.preferToRewear ? 'fill-yellow-500' : ''}`} />
                      {selectedItem.tags.preferToRewear ? "Remove from Favorites" : "Add to Favorites"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
