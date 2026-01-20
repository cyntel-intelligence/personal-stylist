import { NextRequest, NextResponse } from "next/server";
import {
  eventAdminService as eventService,
  userAdminService as userService,
  closetAdminService as closetService,
  recommendationAdminService as recommendationService
} from "@/lib/firebase/firestore-admin";
import { claudeClient, CLAUDE_MODELS } from "@/lib/ai/claude-client";
import { buildRecommendationPrompt } from "@/lib/ai/prompts/recommendation";
import { verifyAuth, verifyOwnership } from "@/lib/middleware/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/middleware/rateLimit";
import { GenerateRecommendationRequestSchema } from "@/lib/validation/schemas";
import { trackAPIUsage, AIOperationType, checkCostThreshold } from "@/lib/services/usage-tracking";
import type { OutfitItemWithAlternatives, ItemCategory } from "@/types/recommendation";

// Helper to calculate minimum price from alternatives
function calculateMinPrice(items: OutfitItemWithAlternatives[]): number {
  return items.reduce((sum, item) => {
    const allOptions = [item.primary, ...item.alternatives];
    const minPrice = Math.min(...allOptions.map(opt => opt.price || 0));
    return sum + minPrice;
  }, 0);
}

// Helper to calculate maximum price from alternatives
function calculateMaxPrice(items: OutfitItemWithAlternatives[]): number {
  return items.reduce((sum, item) => {
    const allOptions = [item.primary, ...item.alternatives];
    const maxPrice = Math.max(...allOptions.map(opt => opt.price || 0));
    return sum + maxPrice;
  }, 0);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. AUTHENTICATE USER
    const authResult = await verifyAuth(request);
    if (authResult.error) return authResult.error;
    const authenticatedUserId = authResult.user.uid;

    // 2. PARSE AND VALIDATE REQUEST BODY
    const body = await request.json();

    let validatedData;
    try {
      validatedData = GenerateRecommendationRequestSchema.parse(body);
    } catch (validationError: any) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationError.errors
        },
        { status: 400 }
      );
    }

    const { eventId, userId } = validatedData;

    // 3. VERIFY USER OWNS THE RESOURCE
    const ownershipCheck = verifyOwnership(authenticatedUserId, userId);
    if (ownershipCheck.error) return ownershipCheck.error;

    // 4. CHECK RATE LIMIT
    const rateLimitResult = await checkRateLimit(
      userId,
      'recommendations',
      RATE_LIMITS.AI_RECOMMENDATIONS
    );
    if (rateLimitResult.error) return rateLimitResult.error;

    // 5. CHECK COST THRESHOLD
    const costCheck = await checkCostThreshold(userId, 10.0); // $10/month limit
    if (costCheck.exceeded) {
      return NextResponse.json(
        {
          error: "Monthly cost limit exceeded",
          message: `You have reached your monthly AI usage limit of $${costCheck.threshold}. Current usage: $${costCheck.currentCost.toFixed(2)}`,
          currentCost: costCheck.currentCost,
          threshold: costCheck.threshold,
        },
        { status: 402 } // Payment Required
      );
    }

    // 6. CHECK IF API KEY IS CONFIGURED
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "AI service not configured",
          message: "Please add ANTHROPIC_API_KEY to your environment variables"
        },
        { status: 503 }
      );
    }

    // 7. FETCH DATA
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
    const availableClosetItems = event.requirements.shopOnlyMode
      ? []
      : closetItems.filter(item => {
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

    // 8. CALL CLAUDE API WITH TIMEOUT
    console.log("Calling Claude API for recommendations...");
    let response: string;
    let tokenUsage = { inputTokens: 0, outputTokens: 0 };

    try {
      // Add timeout protection
      const aiCallPromise = claudeClient.sendMessage(
        prompt,
        CLAUDE_MODELS.SONNET,
        6000 // Allow sufficient tokens for 3 complete outfits with shopping links
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 150000) // 150 second timeout
      );

      response = await Promise.race([aiCallPromise, timeoutPromise]) as string;

      // Estimate token usage (will be replaced with actual usage from API response)
      tokenUsage = {
        inputTokens: claudeClient.estimateTokens(prompt),
        outputTokens: claudeClient.estimateTokens(response),
      };
    } catch (aiError: any) {
      console.error("Claude API error:", aiError);

      await eventService.updateEvent(eventId, { status: "planning" });

      // Track failed API call
      await trackAPIUsage(
        userId,
        AIOperationType.OUTFIT_RECOMMENDATION,
        { inputTokens: 0, outputTokens: 0, model: CLAUDE_MODELS.SONNET },
        false,
        { eventId, requestDuration: Date.now() - startTime },
        aiError.message
      );

      return NextResponse.json(
        {
          error: "AI service error",
          message: "Failed to generate recommendations. Please try again.",
        },
        { status: 500 }
      );
    }

    // 9. PARSE RESPONSE
    let aiResponse: any;
    try {
      // Try to extract JSON from markdown code blocks first
      const jsonBlockMatch = response.match(/```json\s*\n?([\s\S]*?)\n?```/);
      let jsonString;

      if (jsonBlockMatch) {
        jsonString = jsonBlockMatch[1].trim();
      } else {
        // If no code block, try to find a JSON array or object
        const arrayMatch = response.match(/\[[\s\S]*\]/);
        const objectMatch = response.match(/\{[\s\S]*\}/);

        if (arrayMatch) {
          jsonString = arrayMatch[0];
        } else if (objectMatch) {
          jsonString = objectMatch[0];
        } else {
          jsonString = response.trim();
        }
      }

      const parsed = JSON.parse(jsonString);

      // Check if this is the new format (single object with outfitItems) or old format (array of 3 outfits)
      if (parsed.outfitItems && Array.isArray(parsed.outfitItems)) {
        // New format
        aiResponse = parsed;
      } else if (Array.isArray(parsed)) {
        // Old format - wrap it for backward compatibility
        aiResponse = { legacyFormat: true, recommendations: parsed };
      } else {
        // Single recommendation object (old format)
        aiResponse = { legacyFormat: true, recommendations: [parsed] };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", response.substring(0, 500));

      await eventService.updateEvent(eventId, {
        status: "planning",
      });

      // Track failed parsing
      await trackAPIUsage(
        userId,
        AIOperationType.OUTFIT_RECOMMENDATION,
        { ...tokenUsage, model: CLAUDE_MODELS.SONNET },
        false,
        { eventId, requestDuration: Date.now() - startTime },
        "Failed to parse AI response"
      );

      return NextResponse.json(
        { error: "Failed to parse AI response", details: "Invalid response format" },
        { status: 500 }
      );
    }

    // Helper to remove undefined values from an object
    const removeUndefined = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(removeUndefined);
      } else if (obj !== null && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = removeUndefined(value);
          }
          return acc;
        }, {} as any);
      }
      return obj;
    };

    // Helper to map item from AI response
    const mapOutfitItem = (item: any) => ({
      isClosetItem: item?.isClosetItem || false,
      closetItemId: item?.itemId,
      productName: item?.productName || item?.description || "Item",
      imageUrl: item?.imageUrl || "",
      price: item?.estimatedPrice || item?.price || 0,
      retailer: item?.retailer,
      productLink: item?.productLink,
      description: item?.reason,
    });

    // Save recommendations to Firestore
    const recommendationIds: string[] = [];

    // Handle new format with alternatives
    if (!aiResponse.legacyFormat && aiResponse.outfitItems) {
      console.log("Processing new format with alternatives");

      // Map outfit items with alternatives
      const outfitItems: OutfitItemWithAlternatives[] = aiResponse.outfitItems.map((item: any) => ({
        category: item.category as ItemCategory,
        primary: mapOutfitItem(item.primary),
        alternatives: (item.alternatives || []).map(mapOutfitItem),
        reason: item.categoryReason || "",
      }));

      // Calculate pricing
      const primaryTotal = outfitItems.reduce((sum, item) => sum + (item.primary.price || 0), 0);
      const dynamicBreakdown: Record<ItemCategory, number> = {} as Record<ItemCategory, number>;
      outfitItems.forEach(item => {
        dynamicBreakdown[item.category] = item.primary.price || 0;
      });

      const minTotal = calculateMinPrice(outfitItems);
      const maxTotal = calculateMaxPrice(outfitItems);

      const recData = removeUndefined({
        eventId,
        userId,
        outfit: {
          items: outfitItems,
          hasDressOption: aiResponse.hasDressOption || false,
          hasSeparatesOption: aiResponse.hasSeparatesOption || false,
        },
        aiReasoning: {
          flatteryNotes: aiResponse.overallReasoning?.flatteryNotes || [],
          dressCodeFit: aiResponse.overallReasoning?.dressCodeFit || "",
          styleMatch: aiResponse.overallReasoning?.styleMatch || "",
          weatherAppropriate: aiResponse.overallReasoning?.weatherAppropriate || "",
          confidenceScore: aiResponse.overallReasoning?.confidenceScore || 75,
        },
        pricing: {
          primaryTotal,
          dynamicBreakdown,
          minTotal,
          maxTotal,
        },
        generationMethod: "ai-full",
        version: 2, // Version 2 for new format
      });

      const recId = await recommendationService.createRecommendation(recData as any);
      recommendationIds.push(recId);
    } else {
      // Handle legacy format (array of 3 recommendations)
      console.log("Processing legacy format (3 separate outfits)");
      const recommendations = aiResponse.recommendations || [];

      for (const rec of recommendations) {
        // Log warnings for purchase items missing shopping data
        if (!rec.dress?.isClosetItem && (!rec.dress?.productLink || !rec.dress?.retailer)) {
          console.warn(`Recommendation ${rec.outfitNumber}: Dress missing productLink or retailer`);
        }
        if (!rec.shoes?.isClosetItem && (!rec.shoes?.productLink || !rec.shoes?.retailer)) {
          console.warn(`Recommendation ${rec.outfitNumber}: Shoes missing productLink or retailer`);
        }
        if (!rec.bag?.isClosetItem && (!rec.bag?.productLink || !rec.bag?.retailer)) {
          console.warn(`Recommendation ${rec.outfitNumber}: Bag missing productLink or retailer`);
        }

        const recData = removeUndefined({
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
              productLink: rec.dress?.productLink,
            },
            shoes: {
              isClosetItem: rec.shoes?.isClosetItem || false,
              closetItemId: rec.shoes?.itemId,
              productName: rec.shoes?.productName || rec.shoes?.description || "Shoes",
              imageUrl: rec.shoes?.imageUrl || "",
              price: rec.shoes?.estimatedPrice || rec.shoes?.price || 0,
              retailer: rec.shoes?.retailer,
              productLink: rec.shoes?.productLink,
            },
            bag: {
              isClosetItem: rec.bag?.isClosetItem || false,
              closetItemId: rec.bag?.itemId,
              productName: rec.bag?.productName || rec.bag?.description || "Bag",
              imageUrl: rec.bag?.imageUrl || "",
              price: rec.bag?.estimatedPrice || rec.bag?.price || 0,
              retailer: rec.bag?.retailer,
              productLink: rec.bag?.productLink,
            },
            jewelry: {
              items: (rec.jewelry || []).map((j: any) => ({
                isClosetItem: false,
                productName: j.description || j.productName || j.type || "Jewelry",
                imageUrl: "",
                price: j.estimatedPrice || j.price || 0,
                retailer: j.retailer,
                productLink: j.productLink,
              })),
            },
            outerwear: rec.outerwear?.needed ? {
              isClosetItem: rec.outerwear.isClosetItem || false,
              closetItemId: rec.outerwear.itemId,
              productName: rec.outerwear.productName || rec.outerwear.description || "Outerwear",
              imageUrl: rec.outerwear.imageUrl || "",
              price: rec.outerwear.estimatedPrice || rec.outerwear.price || 0,
              retailer: rec.outerwear.retailer,
              productLink: rec.outerwear.productLink,
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
          generationMethod: "ai-full",
          version: 1, // Version 1 for legacy format
        });

        const recId = await recommendationService.createRecommendation(recData as any);
        recommendationIds.push(recId);
      }
    }

    // 10. UPDATE EVENT WITH RECOMMENDATIONS
    await eventService.updateEvent(eventId, {
      recommendationsGenerated: true,
      recommendationIds,
      status: "recommendations-ready",
    });

    // 11. TRACK SUCCESSFUL API USAGE
    await trackAPIUsage(
      userId,
      AIOperationType.OUTFIT_RECOMMENDATION,
      { ...tokenUsage, model: CLAUDE_MODELS.SONNET },
      true,
      { eventId, requestDuration: Date.now() - startTime }
    );

    return NextResponse.json({
      success: true,
      recommendationIds,
      count: recommendationIds.length,
      usage: {
        tokensUsed: tokenUsage.inputTokens + tokenUsage.outputTokens,
        estimatedCost: (tokenUsage.inputTokens / 1_000_000 * 3.0) + (tokenUsage.outputTokens / 1_000_000 * 15.0),
      },
    });

  } catch (error: any) {
    console.error("Error generating recommendations:", error);

    // Try to parse eventId from request if available
    let eventId: string | undefined;
    try {
      const body = await request.clone().json();
      eventId = body.eventId;
    } catch {
      // Ignore if we can't parse the body
    }

    // Try to update event status back to planning on error
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
        message: "An unexpected error occurred. Please try again.",
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message
        }),
      },
      { status: 500 }
    );
  }
}
