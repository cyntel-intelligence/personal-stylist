import { NextRequest, NextResponse } from "next/server";
import {
  eventAdminService as eventService,
  userAdminService as userService,
  closetAdminService as closetService,
  recommendationAdminService as recommendationService
} from "@/lib/firebase/firestore-admin";
import { claudeClient, CLAUDE_MODELS } from "@/lib/ai/claude-client";
import { buildSearchCriteriaPrompt, parseAIResponse, type AIRecommendationOutput } from "@/lib/ai/prompts/recommendation-v2";
import { searchProductsByCriteria, type ProductSearchResult } from "@/lib/api/product-search";
import { verifyAuth, verifyOwnership } from "@/lib/middleware/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/middleware/rateLimit";
import { GenerateRecommendationRequestSchema } from "@/lib/validation/schemas";
import { trackAPIUsage, AIOperationType, checkCostThreshold } from "@/lib/services/usage-tracking";
import type { OutfitItemWithAlternatives, ItemCategory, OutfitItem } from "@/types/recommendation";

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

// Convert ProductSearchResult to OutfitItem
function productToOutfitItem(product: ProductSearchResult, reason?: string): OutfitItem {
  return {
    isClosetItem: false,
    productName: product.name,
    imageUrl: product.imageUrl,
    price: product.price,
    retailer: product.retailer,
    productLink: product.productUrl,
    reason: reason || `${product.brand} - ${product.name}`,
  };
}

// Convert closet item to OutfitItem
function closetItemToOutfitItem(item: any, reason: string): OutfitItem {
  return {
    isClosetItem: true,
    closetItemId: item.id,
    productName: `${item.brand || ''} ${item.subcategory || item.category}`.trim(),
    imageUrl: item.images?.thumbnail || item.images?.original || '',
    reason,
  };
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

    // Build AI prompt for search criteria (not fake products)
    const prompt = buildSearchCriteriaPrompt(
      event as any,
      userProfile as any,
      availableClosetItems as any
    );

    // 8. CALL CLAUDE API WITH TIMEOUT
    console.log("Calling Claude API for search criteria...");
    let response: string;
    let tokenUsage = { inputTokens: 0, outputTokens: 0 };

    try {
      // Add timeout protection
      const aiCallPromise = claudeClient.sendMessage(
        prompt,
        CLAUDE_MODELS.SONNET,
        4000 // Search criteria needs less tokens than full product descriptions
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 120000) // 120 second timeout
      );

      response = await Promise.race([aiCallPromise, timeoutPromise]) as string;

      // Estimate token usage
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

    // 9. PARSE AI RESPONSE (search criteria)
    const aiOutput = parseAIResponse(response);

    if (!aiOutput) {
      console.error("Failed to parse AI response");
      console.log("Raw response:", response.substring(0, 500));

      await eventService.updateEvent(eventId, { status: "planning" });

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

    // 10. SEARCH FOR REAL PRODUCTS
    console.log("Searching for real products...");
    const outfitItems: OutfitItemWithAlternatives[] = [];

    // First, add closet items recommended by AI
    const closetItemMap = new Map(availableClosetItems.map(item => [item.id, item]));

    for (const closetRec of aiOutput.closetItemsToUse || []) {
      const closetItem = closetItemMap.get(closetRec.itemId);
      if (closetItem) {
        outfitItems.push({
          category: closetRec.category,
          primary: closetItemToOutfitItem(closetItem, closetRec.reason),
          alternatives: [], // Closet items don't have alternatives
          reason: closetRec.reason,
        });
      }
    }

    // Then search for products to purchase
    for (const searchItem of aiOutput.searchCriteria || []) {
      // Skip if we already have this category from closet
      if (outfitItems.some(item => item.category === searchItem.category)) {
        continue;
      }

      try {
        const products = await searchProductsByCriteria(searchItem.criteria);

        if (products.length > 0) {
          // Primary is first result, alternatives are next 1-2
          outfitItems.push({
            category: searchItem.category,
            primary: productToOutfitItem(products[0], searchItem.reason),
            alternatives: products.slice(1, 3).map(p => productToOutfitItem(p)),
            reason: searchItem.reason,
          });
        } else {
          // No products found - create placeholder
          console.warn(`No products found for category ${searchItem.category}`);
          outfitItems.push({
            category: searchItem.category,
            primary: {
              isClosetItem: false,
              productName: `${searchItem.criteria.style} ${searchItem.category}`,
              imageUrl: '',
              price: (searchItem.criteria.priceRange.min + searchItem.criteria.priceRange.max) / 2,
              reason: searchItem.reason + " (No exact match found - try searching manually)",
            },
            alternatives: [],
            reason: searchItem.reason,
          });
        }
      } catch (searchError) {
        console.error(`Error searching for ${searchItem.category}:`, searchError);
        // Continue with other categories
      }
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

    // Save recommendations to Firestore
    const recommendationIds: string[] = [];

    // Calculate pricing from outfit items
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
        hasDressOption: aiOutput.hasDressOption || false,
        hasSeparatesOption: aiOutput.hasSeparatesOption || false,
      },
      aiReasoning: {
        flatteryNotes: aiOutput.overallReasoning?.flatteryNotes || [],
        dressCodeFit: aiOutput.overallReasoning?.dressCodeFit || "",
        styleMatch: aiOutput.overallReasoning?.styleMatch || "",
        weatherAppropriate: aiOutput.overallReasoning?.weatherAppropriate || "",
        confidenceScore: aiOutput.overallReasoning?.confidenceScore || 75,
      },
      pricing: {
        primaryTotal,
        dynamicBreakdown,
        minTotal,
        maxTotal,
      },
      generationMethod: "ai-full",
      version: 3, // Version 3 for real product search
    });

    const recId = await recommendationService.createRecommendation(recData as any);
    recommendationIds.push(recId);

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
