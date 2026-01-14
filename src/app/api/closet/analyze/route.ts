import { NextRequest, NextResponse } from "next/server";
import { claudeClient, CLAUDE_MODELS } from "@/lib/ai/claude-client";
import { buildItemAnalysisPrompt } from "@/lib/ai/prompts/analysis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("Anthropic API key not configured, returning placeholder analysis");
      return NextResponse.json({
        analysis: {
          category: "dress",
          subcategory: "",
          color: [],
          style: [],
          pattern: "",
          occasion: [],
          season: [],
          keyFeatures: [],
        },
        note: "AI analysis disabled - API key not configured"
      });
    }

    // Build prompt
    const prompt = buildItemAnalysisPrompt();

    // Call Claude with image
    console.log("Analyzing closet item with Claude Vision...");
    const response = await claudeClient.sendMessageWithImages(
      prompt,
      [imageUrl],
      CLAUDE_MODELS.SONNET,
      2000
    );

    // Parse response
    let analysis;
    try {
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI analysis:", parseError);
      console.log("Raw response:", response);

      // Return placeholder on parse error
      return NextResponse.json({
        analysis: {
          category: "dress",
          subcategory: "",
          color: ["unknown"],
          style: ["casual"],
          pattern: "solid",
          occasion: ["casual"],
          season: ["all-season"],
          keyFeatures: [],
        },
        note: "AI analysis failed, using placeholder"
      });
    }

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
      }
    });

  } catch (error) {
    console.error("Error analyzing closet item:", error);

    // Return placeholder instead of erroring
    return NextResponse.json({
      analysis: {
        category: "dress",
        subcategory: "",
        color: [],
        style: [],
        pattern: "",
        occasion: [],
        season: [],
        keyFeatures: [],
      },
      note: "AI analysis failed"
    });
  }
}
