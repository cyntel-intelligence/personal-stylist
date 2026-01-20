"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { ClosetItemCategory, subcategoriesByCategory, ClosetItemUpload } from "@/types/closet";
import { cn } from "@/lib/utils";

type Props = {
  onSubmit: (data: ClosetItemUpload) => void;
  onCancel: () => void;
  loading?: boolean;
};

const categoryOptions: { value: ClosetItemCategory; label: string; icon: string }[] = [
  { value: "dress", label: "Dress", icon: "👗" },
  { value: "shoes", label: "Shoes", icon: "👠" },
  { value: "bag", label: "Bag", icon: "👜" },
  { value: "outerwear", label: "Outerwear", icon: "🧥" },
  { value: "jewelry", label: "Jewelry", icon: "💎" },
];

export function UploadForm({ onSubmit, onCancel, loading }: Props) {
  const [category, setCategory] = useState<ClosetItemCategory>("dress");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [retailer, setRetailer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select an image to upload");
      return;
    }

    const uploadData: any = {
      category,
      file,
    };

    // Only add optional fields if they have values
    if (subcategory) {
      uploadData.subcategory = subcategory;
    }

    if (brand) {
      uploadData.brand = brand;
    }

    if (price) {
      uploadData.price = parseFloat(price);
    }

    if (retailer) {
      uploadData.retailer = retailer;
    }

    onSubmit(uploadData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Upload Photo</h3>
          <p className="text-sm text-gray-600">Take a clear photo of your item</p>
        </div>

        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-1">
                Click to upload
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, or HEIC up to 10MB
              </p>
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-96 object-contain rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Item Category</h3>
          <p className="text-sm text-gray-600">What type of item is this?</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {categoryOptions.map((option) => (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                category === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}
              onClick={() => {
                setCategory(option.value);
                setSubcategory(""); // Reset subcategory when changing category
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Subcategory (Optional)</h3>
          <p className="text-sm text-gray-600">Be more specific about the item type</p>
        </div>

        <Select value={subcategory} onValueChange={setSubcategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategoriesByCategory[category].map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Item Details */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Item Details (Optional)</h3>
          <p className="text-sm text-gray-600">Help us track your wardrobe better</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Zara, Reformation"
            />
          </div>

          <div>
            <Label htmlFor="retailer">Retailer</Label>
            <Input
              id="retailer"
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
              placeholder="e.g., Nordstrom, ASOS"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="price">Price (Optional)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 89.99"
          />
        </div>
      </div>

      {/* AI Analysis Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> After uploading, our AI will automatically analyze the item to
          identify colors, style, patterns, and suitable occasions. This helps generate better
          outfit recommendations.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !file}>
          {loading ? "Uploading..." : "Add to Closet"}
        </Button>
      </div>
    </form>
  );
}
