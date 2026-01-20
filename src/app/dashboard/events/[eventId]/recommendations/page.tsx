"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";
import { Recommendation, OutfitItemWithAlternatives, OutfitItem, ItemCategory } from "@/types/recommendation";
import { eventService, recommendationService } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Sparkles, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Helper to get emoji for category
function getCategoryIcon(category: ItemCategory): string {
  const icons: Record<ItemCategory, string> = {
    dress: '👗',
    tops: '👚',
    bottoms: '👖',
    jackets: '🧥',
    shoes: '👠',
    bags: '👜',
    jewelry: '💎',
    accessories: '🎀',
    outerwear: '🧥',
  };
  return icons[category] || '✨';
}

export default function RecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'dress' | 'separates'>('dress');
  const [selectedItems, setSelectedItems] = useState<Partial<Record<ItemCategory, number>>>({});
  const [generating, setGenerating] = useState(false);

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

          // Use the first recommendation (in new format, there should be only 1)
          if (recs.length > 0) {
            setRecommendation(recs[0]);

            // Initialize selected items to all primaries (index 0)
            if (recs[0].outfit.items) {
              const initial: Record<ItemCategory, number> = {} as Record<ItemCategory, number>;
              recs[0].outfit.items.forEach(item => {
                initial[item.category] = 0; // 0 = primary
              });
              setSelectedItems(initial);

              // Set initial mode based on what's available
              if (recs[0].outfit.hasDressOption) {
                setSelectedMode('dress');
              } else if (recs[0].outfit.hasSeparatesOption) {
                setSelectedMode('separates');
              }
            }
          }
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

  // Calculate current total based on selections
  const currentTotal = useMemo(() => {
    if (!recommendation || !recommendation.outfit.items) {
      // Legacy format
      return recommendation?.pricing.totalPrice || 0;
    }

    return recommendation.outfit.items.reduce((sum, categoryItem) => {
      // Skip dress items if in separates mode, skip tops/bottoms if in dress mode
      if (selectedMode === 'dress' && (categoryItem.category === 'tops' || categoryItem.category === 'bottoms')) {
        return sum;
      }
      if (selectedMode === 'separates' && categoryItem.category === 'dress') {
        return sum;
      }

      const selectedIndex = selectedItems[categoryItem.category] || 0;
      const allOptions = [categoryItem.primary, ...categoryItem.alternatives];
      const selectedOption = allOptions[selectedIndex];
      return sum + (selectedOption.price || 0);
    }, 0);
  }, [recommendation, selectedItems, selectedMode]);

  // Handle generating new recommendations
  const handleGenerateNew = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId: user?.uid }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate recommendations');
      }

      toast.success("New recommendations generated!");

      // Reload the page to show new recommendations
      window.location.reload();
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      toast.error(error.message || "Failed to generate new recommendations");
    } finally {
      setGenerating(false);
    }
  };

  // Handle selecting outfit
  const handleSelectOutfit = async () => {
    if (!recommendation || !event) return;

    try {
      const selectedOutfit = {
        recommendationId: recommendation.id,
        mode: selectedMode,
        selectedAlternatives: selectedItems,
        totalPrice: currentTotal,
      };

      await eventService.updateEvent(eventId, {
        selectedRecommendationId: recommendation.id,
        selectedOutfit,
        status: 'outfit-selected',
      });

      toast.success("Outfit selected!");
      router.push(`/dashboard/events/${eventId}`);
    } catch (error) {
      console.error("Error selecting outfit:", error);
      toast.error("Failed to select outfit");
    }
  };

  // Render item category with alternatives
  const renderItemCategory = (categoryItem: OutfitItemWithAlternatives) => {
    const allOptions = [categoryItem.primary, ...categoryItem.alternatives];
    const selectedIndex = selectedItems[categoryItem.category] || 0;

    return (
      <Card key={categoryItem.category} className="shadow-luxe border-border">
        <CardHeader>
          <CardTitle className="capitalize flex items-center gap-2 font-serif text-xl">
            <span className="text-2xl">{getCategoryIcon(categoryItem.category)}</span>
            {categoryItem.category}
          </CardTitle>
          <CardDescription className="font-display">{categoryItem.reason}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => setSelectedItems(prev => ({
                  ...prev,
                  [categoryItem.category]: index,
                }))}
                className={cn(
                  "border rounded-xl p-4 cursor-pointer transition-all duration-300",
                  selectedIndex === index
                    ? "border-primary bg-blush shadow-luxe-lg ring-2 ring-primary"
                    : "border-border hover:shadow-luxe hover:border-primary/50"
                )}
              >
                <div className="text-xs font-medium text-blush uppercase tracking-wider mb-2">
                  {index === 0 ? "✨ Recommended" : `Option ${index + 1}`}
                </div>

                {/* Product Image */}
                <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden bg-gray-100">
                  {option.imageUrl ? (
                    <img
                      src={option.imageUrl}
                      alt={option.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Show placeholder on error
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                        const placeholder = document.createElement('span');
                        placeholder.className = 'text-5xl';
                        placeholder.textContent = getCategoryIcon(categoryItem.category);
                        target.parentElement?.appendChild(placeholder);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">{getCategoryIcon(categoryItem.category)}</span>
                    </div>
                  )}
                </div>

                <div className="font-medium text-sm mb-2">{option.productName}</div>

                {option.reason && (
                  <p className="text-xs text-muted-foreground font-display mb-3 line-clamp-2">{option.reason}</p>
                )}

                {option.isClosetItem ? (
                  <Badge variant="secondary" className="mb-2">From Your Closet</Badge>
                ) : (
                  <div className="space-y-2">
                    {option.retailer && (
                      <Badge variant="outline" className="text-xs">
                        {option.retailer}
                      </Badge>
                    )}
                    {option.price && (
                      <div className="text-lg font-serif text-gradient-luxe">
                        ${option.price}
                      </div>
                    )}
                    {option.productLink && (
                      <Button size="sm" className="w-full btn-luxe bg-gradient-luxe border-0 rounded-full text-white" asChild>
                        <a href={option.productLink} target="_blank" rel="noopener noreferrer">
                          Shop Now
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render legacy format (old 3-outfit carousel style)
  const renderLegacyFormat = () => {
    if (!recommendation) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Legacy Format Detected</CardTitle>
            <CardDescription>
              This recommendation was generated with the old format.
              Generate new recommendations to see the interactive alternatives feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dress */}
            {recommendation.outfit.dress && (
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">👗 Dress</h4>
                  {recommendation.outfit.dress.isClosetItem && (
                    <Badge variant="secondary">From Your Closet</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{recommendation.outfit.dress.productName}</p>
                {!recommendation.outfit.dress.isClosetItem && recommendation.outfit.dress.price && (
                  <div className="flex items-center gap-2 mt-2">
                    {recommendation.outfit.dress.retailer && (
                      <Badge variant="outline" className="text-xs">
                        {recommendation.outfit.dress.retailer}
                      </Badge>
                    )}
                    <span className="text-sm font-medium text-blue-600">
                      ${recommendation.outfit.dress.price}
                    </span>
                    {recommendation.outfit.dress.productLink && (
                      <Button size="sm" variant="outline" asChild className="ml-auto">
                        <a href={recommendation.outfit.dress.productLink} target="_blank" rel="noopener noreferrer">
                          Shop Now
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Other items similarly... */}
            <div className="text-center pt-4">
              <Button onClick={handleGenerateNew} disabled={generating}>
                <RefreshCw className={cn("mr-2 h-4 w-4", generating && "animate-spin")} />
                Generate New Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-display text-muted-foreground">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  if (!event || !recommendation) {
    return (
      <div className="min-h-screen bg-gradient-cream flex items-center justify-center">
        <Card className="max-w-md shadow-luxe border-border">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-blush" />
            </div>
            <h3 className="text-xl font-serif mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground font-display mb-6">
              Generate outfit recommendations to see personalized suggestions here
            </p>
            <Button onClick={() => router.push(`/dashboard/events/${eventId}`)} className="btn-luxe bg-gradient-luxe border-0 rounded-full">
              Back to Event
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if this is the new format with alternatives
  const isNewFormat = recommendation.outfit.items && recommendation.outfit.items.length > 0;

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
              <Link href="/dashboard/closet" className="text-sm text-muted-foreground hover:text-blush transition-colors">
                Closet
              </Link>
              <Link href="/dashboard/events" className="text-sm text-blush font-medium">
                Events
              </Link>
              <Button onClick={() => signOut()} variant="ghost" size="sm" className="text-muted-foreground">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <Button variant="ghost" onClick={() => router.push(`/dashboard/events/${eventId}`)} className="mb-6 text-muted-foreground hover:text-blush">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blush font-medium mb-2">
            Curated For You
          </p>
          <h1 className="text-4xl font-serif flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blush" />
            Your Personalized Outfit
          </h1>
          <p className="text-lg font-display text-muted-foreground mt-2">
            {isNewFormat
              ? "Pick your favorite alternatives for each item category"
              : `Recommendations for your ${event.dressCode} ${event.eventType}`}
          </p>
        </div>

        {!isNewFormat ? (
          renderLegacyFormat()
        ) : (
          <>
            {/* Dress vs Separates Toggle */}
            {recommendation.outfit.hasDressOption && recommendation.outfit.hasSeparatesOption && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-center">Choose Your Style</h3>
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant={selectedMode === 'dress' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setSelectedMode('dress')}
                      className="min-w-[150px]"
                    >
                      👗 Dress
                    </Button>
                    <Button
                      variant={selectedMode === 'separates' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setSelectedMode('separates')}
                      className="min-w-[150px]"
                    >
                      👚 Top & Bottom
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Summary */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Current Total</div>
                    <div className="text-3xl font-bold text-blue-600">${currentTotal}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Price Range</div>
                    <div className="text-lg font-semibold text-gray-700">
                      ${recommendation.pricing.minTotal} - ${recommendation.pricing.maxTotal}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Render categories based on mode */}
            <div className="space-y-6 mb-6">
              {recommendation.outfit.items
                ?.filter(item => {
                  if (selectedMode === 'dress') {
                    return item.category !== 'tops' && item.category !== 'bottoms';
                  } else {
                    return item.category !== 'dress';
                  }
                })
                .map(renderItemCategory)}
            </div>

            {/* AI Reasoning */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI Styling Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Dress Code Fit</h4>
                  <p className="text-sm text-gray-700">{recommendation.aiReasoning.dressCodeFit}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-2">Weather Appropriate</h4>
                  <p className="text-sm text-gray-700">{recommendation.aiReasoning.weatherAppropriate}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-2">Style Match</h4>
                  <p className="text-sm text-gray-700">{recommendation.aiReasoning.styleMatch}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-2">Flattery Notes</h4>
                  <ul className="space-y-1">
                    {recommendation.aiReasoning.flatteryNotes.map((note, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Confidence Score</span>
                  <Badge variant="secondary" className="text-lg">
                    {recommendation.aiReasoning.confidenceScore}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleGenerateNew}
                disabled={generating}
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", generating && "animate-spin")} />
                Generate New Outfit
              </Button>
              <Button size="lg" onClick={handleSelectOutfit}>
                Select This Outfit for Event
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
