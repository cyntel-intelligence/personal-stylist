/**
 * Recommendation Prompt V2
 *
 * This version outputs search criteria instead of fake product URLs.
 * The AI describes what to look for, and we use real product APIs to find matching items.
 */

import type { UserProfile, Event, ClosetItem } from "@/types";
import { sanitizeStringArray, sanitizeUserInput } from "@/lib/validation/schemas";
import { ItemCategory } from "@/types/recommendation";

export interface SearchCriteria {
  category: ItemCategory;
  style: string;
  colors: string[];
  priceRange: { min: number; max: number };
  occasion: string;
  features: string[];
  searchTerms: string[];
  importance: "essential" | "recommended" | "optional";
}

export interface AIRecommendationOutput {
  searchCriteria: {
    category: ItemCategory;
    criteria: SearchCriteria;
    reason: string;
  }[];
  closetItemsToUse: {
    itemId: string;
    category: ItemCategory;
    reason: string;
  }[];
  hasDressOption: boolean;
  hasSeparatesOption: boolean;
  overallReasoning: {
    flatteryNotes: string[];
    dressCodeFit: string;
    styleMatch: string;
    weatherAppropriate: string;
    confidenceScore: number;
  };
}

/**
 * Build prompt for AI to output search criteria (not fake products)
 */
export function buildSearchCriteriaPrompt(
  event: Event,
  userProfile: UserProfile,
  closetItems: ClosetItem[]
): string {
  const sanitizedStyleWords = sanitizeStringArray(userProfile.styleDNA.styleWords);
  const sanitizedLovedBrands = sanitizeStringArray(userProfile.styleDNA.lovedBrands || []);
  const sanitizedNeverAgain = sanitizeStringArray(userProfile.styleDNA.neverAgainList);

  const measurements = userProfile.profile.measurements;
  const bodyShape = userProfile.profile.bodyShape;
  const visualStyle = userProfile.visualStyleQuiz;
  const lifestyle = userProfile.lifestyleProfile;
  const fabricPrefs = userProfile.fabricPreferences;

  return `You are an expert personal stylist helping a client find the perfect outfit for an upcoming event.

YOUR TASK: Generate SEARCH CRITERIA for finding real products - NOT product links or URLs.
You will describe what to look for, and our system will search real retailers for matching items.

CLIENT PROFILE:
==============
Physical Attributes:
- Height: ${userProfile.profile.height} inches (${Math.floor(userProfile.profile.height / 12)}' ${userProfile.profile.height % 12}")
- Dress Size: ${userProfile.profile.sizes.dress}
- Top Size: ${userProfile.profile.sizes.tops}
- Bottom Size: ${userProfile.profile.sizes.bottoms}
- Fit Preference: ${sanitizeUserInput(userProfile.profile.fitPreference)}
${bodyShape ? `- Body Shape: ${bodyShape}` : ""}

${measurements ? `Body Measurements:
${measurements.bust ? `- Bust: ${measurements.bust} inches` : ""}
${measurements.waist ? `- Waist: ${measurements.waist} inches` : ""}
${measurements.hips ? `- Hips: ${measurements.hips} inches` : ""}
` : ""}

${visualStyle ? `Visual Style Profile:
- Primary Style: ${visualStyle.styleProfile.primary}
${visualStyle.styleProfile.secondary ? `- Secondary Style: ${visualStyle.styleProfile.secondary}` : ""}
` : ""}

Style DNA:
- Style Words: ${sanitizedStyleWords.join(", ")}
- Loved Brands: ${sanitizedLovedBrands.join(", ") || "None specified"}
- Price Range (Dresses): $${userProfile.styleDNA.priceRanges.dresses.min} - $${userProfile.styleDNA.priceRanges.dresses.max}
- Price Range (Shoes): $${userProfile.styleDNA.priceRanges.shoes.min} - $${userProfile.styleDNA.priceRanges.shoes.max}
- Price Range (Bags): $${userProfile.styleDNA.priceRanges.bags.min} - $${userProfile.styleDNA.priceRanges.bags.max}
- Price Range (Jewelry): $${userProfile.styleDNA.priceRanges.jewelry.min} - $${userProfile.styleDNA.priceRanges.jewelry.max}
- Never Again List: ${sanitizedNeverAgain.join(", ") || "None"}

${lifestyle ? `Lifestyle Profile:
- Work Environment: ${lifestyle.workEnvironment}
- Social Style: ${lifestyle.socialLifestyle}
- Climate: ${lifestyle.climate}
` : ""}

${fabricPrefs ? `Fabric Preferences:
- Loved Fabrics: ${sanitizeStringArray(fabricPrefs.lovedFabrics).join(", ") || "No preference"}
- Avoid Fabrics: ${sanitizeStringArray(fabricPrefs.avoidFabrics).join(", ") || "None"}
- Care Preference: ${fabricPrefs.carePreference}
` : ""}

Flattery Preferences:
- Favorite Features to Show: ${sanitizeStringArray(userProfile.flatteryMap.favoriteBodyParts).join(", ")}
- Areas to Minimize: ${sanitizeStringArray(userProfile.flatteryMap.minimizeBodyParts).join(", ")}
- Loved Necklines: ${sanitizeStringArray(userProfile.flatteryMap.necklinePreferences.loved).join(", ")}
- Avoid Necklines: ${sanitizeStringArray(userProfile.flatteryMap.necklinePreferences.avoid).join(", ")}
- Preferred Dress Length: ${sanitizeUserInput(userProfile.flatteryMap.lengthPreferences.dresses)}
- Waist Definition: ${sanitizeUserInput(userProfile.flatteryMap.waistDefinition)}

Color Preferences:
- Best Colors: ${sanitizeStringArray(userProfile.colorPreferences.complimentColors).join(", ")}
- Avoid Colors: ${sanitizeStringArray(userProfile.colorPreferences.avoidColors).join(", ")}
- Metal Preference: ${sanitizeUserInput(userProfile.colorPreferences.metalPreference)}

Comfort Limits:
- Strapless OK: ${userProfile.comfortLimits.straplessOk ? "Yes" : "No"}
- Max Heel Height: ${userProfile.comfortLimits.maxHeelHeight} inches

EVENT DETAILS:
=============
- Type: ${sanitizeUserInput(event.eventType)} ${event.customEventType ? `(${sanitizeUserInput(event.customEventType)})` : ""}
- Dress Code: ${sanitizeUserInput(event.dressCode)}
- Location: ${sanitizeUserInput(event.location.city)}, ${sanitizeUserInput(event.location.state)}${event.location.venue ? ` at ${sanitizeUserInput(event.location.venue)}` : ""}
- Date & Time: ${event.dateTime.toDate().toLocaleDateString()}
- Client's Role: ${sanitizeUserInput(event.userRole)}
- Activity Level: ${sanitizeUserInput(event.activityLevel)}
${event.weather ? `- Weather: ${event.weather.temperature}°F, ${event.weather.conditions}` : ""}

CLOSET ITEMS AVAILABLE:
======================
${closetItems.length > 0 ? closetItems.map((item, i) => `${i + 1}. ${item.category.toUpperCase()}: ${item.brand || "No brand"}
   Colors: ${item.aiAnalysis.color.join(", ")}
   Style: ${item.aiAnalysis.style.join(", ")}
   Occasions: ${item.aiAnalysis.occasion.join(", ")}
   ID: ${item.id}
   ${item.tags.preferToRewear ? "⭐ FAVORITE - prioritize using this item" : ""}
   ${item.tags.refuseToRewear ? "🚫 DO NOT USE - client refuses to wear" : ""}`).join("\n\n") : "No closet items available"}

${event.requirements?.shopOnlyMode ? `
⚠️ SHOP ONLY MODE: Do NOT use any closet items. All recommendations must be items to purchase.
` : ""}

GENERATE SEARCH CRITERIA:
========================
For each item category needed for this outfit, provide search criteria that will help find the perfect product.

REQUIRED OUTPUT:
1. For items to PURCHASE: Provide detailed search criteria
2. For items from CLOSET: Reference the item ID
3. Include BOTH dress and separates options when appropriate

Return JSON with this exact structure:
{
  "searchCriteria": [
    {
      "category": "dress",
      "criteria": {
        "category": "dress",
        "style": "elegant midi dress with fitted waist",
        "colors": ["black", "navy", "burgundy"],
        "priceRange": { "min": 100, "max": 300 },
        "occasion": "cocktail party",
        "features": ["v-neckline", "midi length", "long sleeves"],
        "searchTerms": ["cocktail dress", "midi formal dress", "evening dress"],
        "importance": "essential"
      },
      "reason": "A sophisticated midi dress that flatters the hourglass figure while meeting cocktail attire requirements"
    },
    {
      "category": "tops",
      "criteria": {
        "category": "tops",
        "style": "elegant silk blouse",
        "colors": ["ivory", "blush", "champagne"],
        "priceRange": { "min": 50, "max": 150 },
        "occasion": "cocktail party",
        "features": ["v-neck", "flowy", "dressy"],
        "searchTerms": ["silk blouse", "dressy top", "evening blouse"],
        "importance": "essential"
      },
      "reason": "Separates option - pairs with tailored pants for a chic alternative to a dress"
    }
  ],
  "closetItemsToUse": [
    {
      "itemId": "abc123",
      "category": "shoes",
      "reason": "These black heels from the closet are perfect for the event and match multiple outfit options"
    }
  ],
  "hasDressOption": true,
  "hasSeparatesOption": true,
  "overallReasoning": {
    "flatteryNotes": [
      "V-necklines elongate the torso and flatter the bust",
      "Midi length showcases great legs while remaining elegant",
      "Fitted waist accentuates the hourglass shape"
    ],
    "dressCodeFit": "Both dress and separates options meet cocktail attire requirements with appropriate elegance",
    "styleMatch": "The sophisticated, feminine aesthetic aligns with the client's romantic and elegant style preferences",
    "weatherAppropriate": "Long sleeves provide warmth for the cooler evening temperature",
    "confidenceScore": 92
  }
}

IMPORTANT RULES:
- Use REAL search terms that would find actual products (not brand-specific)
- Include 2-3 color options ordered by preference
- Respect price ranges from the client's profile
- Include at least 3-4 features per item to ensure good matches
- Mark categories as "essential", "recommended", or "optional"
- Include both dress AND separates (tops + bottoms) when appropriate
- Use closet items when they're a good fit (unless shop-only mode)
- Respect all "never again" items, avoided necklines, and color restrictions

Return ONLY valid JSON, no additional text.`;
}

/**
 * Parse AI response and extract search criteria
 */
export function parseAIResponse(response: string): AIRecommendationOutput | null {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Validate the structure
    if (!parsed.searchCriteria || !Array.isArray(parsed.searchCriteria)) {
      console.error("Invalid AI response: missing searchCriteria array");
      return null;
    }

    return parsed as AIRecommendationOutput;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return null;
  }
}
