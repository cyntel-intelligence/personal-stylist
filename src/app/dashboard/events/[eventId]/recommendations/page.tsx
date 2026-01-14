"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";
import { Recommendation } from "@/types/recommendation";
import { eventService, recommendationService } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Heart, ThumbsUp, Meh, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function RecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!user || !eventId) return;

    const loadData = async () => {
      try {
        const [eventData, recs] = await Promise.all([
          eventService.getEvent(eventId),
          recommendationService.getEventRecommendations(eventId),
        ]);

        if (eventData && eventData.userId === user.uid) {
          setEvent(eventData);
          setRecommendations(recs);
        } else {
          toast.error("Event not found");
          router.push("/dashboard/events");
        }
      } catch (error) {
        console.error("Error loading recommendations:", error);
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, eventId, router]);

  const handleFeedback = async (recommendationId: string, reaction: "love" | "like" | "meh" | "no") => {
    try {
      await recommendationService.saveFeedback(recommendationId, {
        reaction,
        timestamp: new Date(),
      });

      setRecommendations(recs =>
        recs.map(rec =>
          rec.id === recommendationId
            ? { ...rec, userFeedback: { ...rec.userFeedback, reaction } as any }
            : rec
        )
      );

      toast.success("Feedback saved!");
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Failed to save feedback");
    }
  };

  const handleSelectOutfit = async (recommendationId: string) => {
    if (!event) return;

    try {
      await eventService.updateEvent(eventId, {
        selectedRecommendationId: recommendationId,
        status: "outfit-selected",
      });

      toast.success("Outfit selected!");
      router.push(`/dashboard/events/${eventId}`);
    } catch (error) {
      console.error("Error selecting outfit:", error);
      toast.error("Failed to select outfit");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  if (!event || recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              Generate outfit recommendations to see personalized suggestions here
            </p>
            <Button onClick={() => router.push(`/dashboard/events/${eventId}`)}>
              Back to Event
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentRec = recommendations[selectedIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <Button variant="ghost" onClick={() => router.push(`/dashboard/events/${eventId}`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Outfit Recommendations
          </h1>
          <p className="text-gray-600 mt-2">
            {recommendations.length} personalized outfits for your {event.dressCode} {event.eventType}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
            disabled={selectedIndex === 0}
          >
            ← Previous
          </Button>

          <div className="flex-1 flex gap-2 justify-center">
            {recommendations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === selectedIndex ? "bg-blue-600 w-8" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setSelectedIndex(Math.min(recommendations.length - 1, selectedIndex + 1))}
            disabled={selectedIndex === recommendations.length - 1}
          >
            Next →
          </Button>
        </div>

        {/* Outfit Display */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Main Outfit Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Outfit {selectedIndex + 1}</CardTitle>
                  <CardDescription>
                    AI Confidence: {currentRec.aiReasoning.confidenceScore}%
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg">
                  ${currentRec.pricing.totalPrice}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dress */}
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">👗 Dress</h4>
                  {currentRec.outfit.dress.isClosetItem && (
                    <Badge variant="secondary">From Your Closet</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{currentRec.outfit.dress.productName}</p>
                {!currentRec.outfit.dress.isClosetItem && currentRec.outfit.dress.price && (
                  <p className="text-sm font-medium text-blue-600 mt-2">
                    ${currentRec.outfit.dress.price}
                  </p>
                )}
              </div>

              {/* Shoes */}
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">👠 Shoes</h4>
                  {currentRec.outfit.shoes.isClosetItem && (
                    <Badge variant="secondary">From Your Closet</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{currentRec.outfit.shoes.productName}</p>
                {!currentRec.outfit.shoes.isClosetItem && currentRec.outfit.shoes.price && (
                  <p className="text-sm font-medium text-blue-600 mt-2">
                    ${currentRec.outfit.shoes.price}
                  </p>
                )}
              </div>

              {/* Bag */}
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">👜 Bag</h4>
                  {currentRec.outfit.bag.isClosetItem && (
                    <Badge variant="secondary">From Your Closet</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{currentRec.outfit.bag.productName}</p>
                {!currentRec.outfit.bag.isClosetItem && currentRec.outfit.bag.price && (
                  <p className="text-sm font-medium text-blue-600 mt-2">
                    ${currentRec.outfit.bag.price}
                  </p>
                )}
              </div>

              {/* Jewelry */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">💎 Jewelry</h4>
                <div className="space-y-2">
                  {currentRec.outfit.jewelry.items.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{item.productName}</span>
                      {item.price && (
                        <span className="text-blue-600 ml-2">${item.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Outerwear (if needed) */}
              {currentRec.outfit.outerwear && (
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">🧥 Outerwear</h4>
                    {currentRec.outfit.outerwear.isClosetItem && (
                      <Badge variant="secondary">From Your Closet</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{currentRec.outfit.outerwear.productName}</p>
                  {!currentRec.outfit.outerwear.isClosetItem && currentRec.outfit.outerwear.price && (
                    <p className="text-sm font-medium text-blue-600 mt-2">
                      ${currentRec.outfit.outerwear.price}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reasoning Card */}
          <Card>
            <CardHeader>
              <CardTitle>Why This Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Dress Code</h4>
                <p className="text-sm text-gray-700">{currentRec.aiReasoning.dressCodeFit}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-2">Weather</h4>
                <p className="text-sm text-gray-700">{currentRec.aiReasoning.weatherAppropriate}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-2">Your Style</h4>
                <p className="text-sm text-gray-700">{currentRec.aiReasoning.styleMatch}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-2">Flattery Notes</h4>
                <ul className="space-y-1">
                  {currentRec.aiReasoning.flatteryNotes.map((note, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Buttons */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-center">How do you feel about this outfit?</h3>
            <div className="flex justify-center gap-4">
              <Button
                variant={currentRec.userFeedback?.reaction === "love" ? "default" : "outline"}
                size="lg"
                onClick={() => handleFeedback(currentRec.id, "love")}
              >
                <Heart className="mr-2 h-5 w-5" />
                Love It
              </Button>
              <Button
                variant={currentRec.userFeedback?.reaction === "like" ? "default" : "outline"}
                size="lg"
                onClick={() => handleFeedback(currentRec.id, "like")}
              >
                <ThumbsUp className="mr-2 h-5 w-5" />
                Like It
              </Button>
              <Button
                variant={currentRec.userFeedback?.reaction === "meh" ? "default" : "outline"}
                size="lg"
                onClick={() => handleFeedback(currentRec.id, "meh")}
              >
                <Meh className="mr-2 h-5 w-5" />
                Meh
              </Button>
              <Button
                variant={currentRec.userFeedback?.reaction === "no" ? "destructive" : "outline"}
                size="lg"
                onClick={() => handleFeedback(currentRec.id, "no")}
              >
                <X className="mr-2 h-5 w-5" />
                Not For Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Select Outfit Button */}
        <div className="flex justify-center">
          <Button size="lg" onClick={() => handleSelectOutfit(currentRec.id)}>
            Select This Outfit for Event
          </Button>
        </div>
      </div>
    </div>
  );
}
