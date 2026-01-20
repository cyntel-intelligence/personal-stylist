import { NextRequest, NextResponse } from "next/server";
import { claudeClient, CLAUDE_MODELS } from "@/lib/ai/claude-client";
import { buildItemAnalysisPrompt } from "@/lib/ai/prompts/analysis";
import { verifyAuth, verifyOwnership } from "@/lib/middleware/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/middleware/rateLimit";
import { AnalyzeClosetItemRequestSchema, validateFirebaseStorageUrl } from "@/lib/validation/schemas";
import { trackAPIUsage, AIOperationType, checkCostThreshold } from "@/lib/services/usage-tracking";

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
      validatedData = AnalyzeClosetItemRequestSchema.parse(body);
    } catch (validationError: any) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationError.errors
        },
        { status: 400 }
      );
    }

    const { userId, imageUrl } = validatedData;

    // 3. VERIFY USER OWNS THE RESOURCE
    const ownershipCheck = verifyOwnership(authenticatedUserId, userId);
    if (ownershipCheck.error) return ownershipCheck.error;

    // 4. VALIDATE IMAGE URL (PREVENT SSRF)
    const urlValidation = validateFirebaseStorageUrl(imageUrl);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: "Invalid image URL", message: urlValidation.error },
        { status: 400 }
      );
    }

    // 5. CHECK RATE LIMIT
    const rateLimitResult = await checkRateLimit(
      userId,
      'closet_analysis',
      RATE_LIMITS.AI_CLOSET_ANALYSIS
    );
    if (rateLimitResult.error) return rateLimitResult.error;

    // 6. CHECK COST THRESHOLD
    const costCheck = await checkCostThreshold(userId, 10.0);
    if (costCheck.exceeded) {
      return NextResponse.json(
        {
          error: "Monthly cost limit exceeded",
          message: `You have reached your monthly AI usage limit of $${costCheck.threshold}. Current usage: $${costCheck.currentCost.toFixed(2)}`,
        },
        { status: 402 }
      );
    }

    // 7. CHECK IF API KEY IS CONFIGURED
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("Anthropic API key not configured");
      return NextResponse.json(
        {
          error: "AI service not configured",
          message: "Please add ANTHROPIC_API_KEY to your environment variables"
        },
        { status: 503 }
      );
    }

    // 8. BUILD PROMPT
    const prompt = buildItemAnalysisPrompt();

    // 9. CALL CLAUDE WITH IMAGE (WITH TIMEOUT)
    console.log("Analyzing closet item with Claude Vision...");
    let response: string;
    let tokenUsage = { inputTokens: 0, outputTokens: 0 };

    try {
      const aiCallPromise = claudeClient.sendMessageWithImages(
        prompt,
        [imageUrl],
        CLAUDE_MODELS.SONNET,
        2000
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 60000) // 60 second timeout
      );

      response = await Promise.race([aiCallPromise, timeoutPromise]) as string;

      // Estimate token usage
      tokenUsage = {
        inputTokens: claudeClient.estimateTokens(prompt) + 1000, // Add ~1000 for image
        outputTokens: claudeClient.estimateTokens(response),
      };
    } catch (aiError: any) {
      console.error("Claude API error:", aiError);

      // Track failed API call
      await trackAPIUsage(
        userId,
        AIOperationType.CLOSET_ANALYSIS,
        { inputTokens: 0, outputTokens: 0, model: CLAUDE_MODELS.SONNET },
        false,
        { requestDuration: Date.now() - startTime },
        aiError.message
      );

      return NextResponse.json(
        {
          error: "AI service error",
          message: "Failed to analyze item. Please try again.",
        },
        { status: 500 }
      );
    }

    // 10. PARSE RESPONSE
    let analysis;
    try {
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI analysis:", parseError);
      console.log("Raw response:", response.substring(0, 500));

      // Track failed parsing
      await trackAPIUsage(
        userId,
        AIOperationType.CLOSET_ANALYSIS,
        { ...tokenUsage, model: CLAUDE_MODELS.SONNET },
        false,
        { requestDuration: Date.now() - startTime },
        "Failed to parse AI response"
      );

      return NextResponse.json(
        { error: "Failed to parse AI response", message: "Invalid response format" },
        { status: 500 }
      );
    }

    // 11. TRACK SUCCESSFUL API USAGE
    await trackAPIUsage(
      userId,
      AIOperationType.CLOSET_ANALYSIS,
      { ...tokenUsage, model: CLAUDE_MODELS.SONNET },
      true,
      { requestDuration: Date.now() - startTime }
    );

    return NextResponse.json({
      analysis: {
        category: analysis.category || "dress",
        subcategory: analysis.subcategory || "",
        color: analysis.color || [],
        style: analysis.style || [],
        pattern: analysis.pattern || "",
        occasion: analysis.occasion || [],
        season: analysis.season || [],
        keyFeatures: analysis.keyFeatures || [],
      },
      usage: {
        tokensUsed: tokenUsage.inputTokens + tokenUsage.outputTokens,
        estimatedCost: (tokenUsage.inputTokens / 1_000_000 * 3.0) + (tokenUsage.outputTokens / 1_000_000 * 15.0),
      },
    });

  } catch (error: any) {
    console.error("Error analyzing closet item:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze item",
        message: "An unexpected error occurred. Please try again.",
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message
        }),
      },
      { status: 500 }
    );
  }
}
