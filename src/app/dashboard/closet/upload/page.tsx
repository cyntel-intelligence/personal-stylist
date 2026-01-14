"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UploadForm } from "@/components/closet/UploadForm";
import { ClosetItemUpload } from "@/types/closet";
import { storageService } from "@/lib/firebase/storage";
import { closetService } from "@/lib/firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ClosetUploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ClosetItemUpload) => {
    if (!user) {
      toast.error("You must be logged in to upload items");
      return;
    }

    setLoading(true);
    try {
      // Upload images (original, thumbnail, optimized)
      toast.info("Uploading image...");
      const imageUrls = await storageService.uploadImageVersions(
        data.file,
        user.uid,
        data.category
      );

      // Analyze image with AI
      toast.info("Analyzing image...");
      let aiAnalysis = {
        color: [],
        style: [],
        pattern: "",
        occasion: [],
        season: [],
      };

      try {
        const analysisResponse = await fetch("/api/closet/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: imageUrls.optimized }),
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          aiAnalysis = analysisData.analysis;
          toast.success("Image analyzed!");
        } else {
          console.warn("AI analysis failed, using placeholder");
        }
      } catch (analysisError) {
        console.error("Error calling analysis API:", analysisError);
        // Continue with placeholder data
      }

      // Create closet item in Firestore
      const itemId = await closetService.createItem({
        userId: user.uid,
        category: data.category,
        subcategory: data.subcategory,
        images: {
          original: imageUrls.original,
          thumbnail: imageUrls.thumbnail,
          processed: imageUrls.optimized,
        },
        brand: data.brand,
        price: data.price,
        retailer: data.retailer,
        aiAnalysis,
        tags: {
          refuseToRewear: false,
          preferToRewear: false,
        },
      } as any);

      toast.success("Item added to your closet!");
      router.push("/dashboard/closet");
    } catch (error) {
      console.error("Error uploading item:", error);
      toast.error("Failed to upload item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/closet");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Add Item to Closet</CardTitle>
            <CardDescription>
              Upload a photo and we'll analyze it to help create perfect outfit recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
