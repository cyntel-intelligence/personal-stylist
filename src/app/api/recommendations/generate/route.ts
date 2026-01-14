import { NextRequest, NextResponse } from "next/server";
import { eventService, userService, closetService, recommendationService } from "@/lib/firebase/firestore";
import { claudeClient, CLAUDE_MODELS } from "@/lib/ai/claude-client";
import { buildRecommendationPrompt } from "@/lib/ai/prompts/recommendation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId } = body;

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: "Missing eventId or userId" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "AI service not configured",
          message: "Please add ANTHROPIC_API_KEY to your environment variables"
        },
        { status: 503 }
      );
    }

    // Fetch data
    const [event, userProfile, closetItems] = await Promise.all([
      eventService.getEvent(eventId),
      userService.getProfile(userId),
      closetService.getUserCloset(userId),
    ]);

    if (!event || event.userId !== userId) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Update event status
    await eventService.updateEvent(eventId, {
      status: "generating-recommendations",
    });

    // Filter closet items based on preferences
    const availableClosetItems = closetItems.filter(item => {
      // Exclude items user refuses to rewear
      if (item.tags.refuseToRewear) return false;

      // If preferRewear is enabled, prioritize items tagged as preferred
      if (event.requirements.preferRewear && item.tags.preferToRewear) return true;

      // Otherwise include all non-refused items
      return true;
    });

    // Mock product catalog (in Phase 5, this would come from affiliate APIs)
    const mockProducts: any[] = [];

    // Build AI prompt
    const prompt = buildRecommendationPrompt(
      event as any,
      userProfile as any,
      availableClosetItems as any,
      mockProducts
    );

    // Call Claude API
    console.log("Calling Claude API for recommendations...");
    const response = await claudeClient.sendMessage(
      prompt,
      CLAUDE_MODELS.SONNET,
      8000 // Allow longer response for 5 outfits
    );

    // Parse response
    let recommendations;
    try {
      // Remove markdown code blocks if present
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      recommendations = parsed.recommendations || parsed; // Handle both formats
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", response);

      await eventService.updateEvent(eventId, {
        status: "planning",
      });

      return NextResponse.json(
        { error: "Failed to parse AI response", details: response.substring(0, 500) },
        { status: 500 }
      );
    }

    // Save recommendations to Firestore
    const recommendationIds: string[] = [];

    for (const rec of recommendations) {
      const recId = await recommendationService.createRecommendation({
        eventId,
        userId,
        outfit: {
          dress: {
            isClosetItem: rec.dress?.isClosetItem || false,
            closetItemId: rec.dress?.itemId,
            productName: rec.dress?.productName || rec.dress?.description || "Dress",
            imageUrl: rec.dress?.imageUrl || "",
            price: rec.dress?.estimatedPrice || rec.dress?.price || 0,
            retailer: rec.dress?.retailer,
          },
          shoes: {
            isClosetItem: rec.shoes?.isClosetItem || false,
            closetItemId: rec.shoes?.itemId,
            productName: rec.shoes?.productName || rec.shoes?.description || "Shoes",
            imageUrl: rec.shoes?.imageUrl || "",
            price: rec.shoes?.estimatedPrice || rec.shoes?.price || 0,
            retailer: rec.shoes?.retailer,
          },
          bag: {
            isClosetItem: rec.bag?.isClosetItem || false,
            closetItemId: rec.bag?.itemId,
            productName: rec.bag?.productName || rec.bag?.description || "Bag",
            imageUrl: rec.bag?.imageUrl || "",
            price: rec.bag?.estimatedPrice || rec.bag?.price || 0,
            retailer: rec.bag?.retailer,
          },
          jewelry: {
            items: (rec.jewelry || []).map((j: any) => ({
              isClosetItem: false,
              productName: j.description || j.type || "Jewelry",
              imageUrl: "",
              price: j.estimatedPrice || j.price || 0,
            })),
          },
          outerwear: rec.outerwear?.needed ? {
            isClosetItem: rec.outerwear.isClosetItem || false,
            closetItemId: rec.outerwear.itemId,
            productName: rec.outerwear.productName || rec.outerwear.description || "Outerwear",
            imageUrl: rec.outerwear.imageUrl || "",
            price: rec.outerwear.estimatedPrice || rec.outerwear.price || 0,
            retailer: rec.outerwear.retailer,
          } : undefined,
        },
        aiReasoning: {
          flatteryNotes: rec.flatteryNotes || rec.reasoning?.flatteryNotes || [],
          dressCodeFit: rec.dressCodeFit || rec.reasoning?.dressCodeFit || "",
          styleMatch: rec.styleMatch || rec.reasoning?.styleMatch || "",
          weatherAppropriate: rec.weatherAppropriate || rec.reasoning?.weatherAppropriate || "",
          confidenceScore: rec.confidenceScore || rec.reasoning?.confidenceScore || 75,
        },
        pricing: {
          totalPrice: rec.totalEstimatedPrice || 0,
          breakdown: {},
          hasLowerPriceAlternatives: false,
          hasHigherPriceAlternatives: false,
        },
      } as any);

      recommendationIds.push(recId);
    }

    // Update event with recommendations
    await eventService.updateEvent(eventId, {
      recommendationsGenerated: true,
      recommendationIds,
      status: "recommendations-ready",
    });

    return NextResponse.json({
      success: true,
      recommendationIds,
      count: recommendationIds.length,
    });

  } catch (error) {
    console.error("Error generating recommendations:", error);

    // Try to update event status back to planning on error
    const { eventId } = await request.json().catch(() => ({}));
    if (eventId) {
      try {
        await eventService.updateEvent(eventId, { status: "planning" });
      } catch (updateError) {
        console.error("Failed to update event status:", updateError);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
