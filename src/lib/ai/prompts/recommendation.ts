import type { UserProfile, Event, ClosetItem } from "@/types";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  colors: string[];
  sizes: string[];
  style: string[];
}

/**
 * Build a comprehensive prompt for outfit recommendations
 */
export function buildRecommendationPrompt(
  event: Event,
  userProfile: UserProfile,
  closetItems: ClosetItem[],
  availableProducts: Product[]
): string {
  return `You are an expert personal stylist helping a client find the perfect outfit for an upcoming event.

CLIENT PROFILE:
==============
Physical Attributes:
- Height: ${userProfile.profile.height} inches (${Math.floor(userProfile.profile.height / 12)}' ${userProfile.profile.height % 12}")
- Dress Size: ${userProfile.profile.sizes.dress}
- Top Size: ${userProfile.profile.sizes.tops}
- Bottom Size: ${userProfile.profile.sizes.bottoms}
- Fit Preference: ${userProfile.profile.fitPreference}

Style DNA:
- Style Words: ${userProfile.styleDNA.styleWords.join(", ")}
- Loved Brands: ${userProfile.styleDNA.lovedBrands.join(", ") || "None specified"}
- Price Range (Dresses): $${userProfile.styleDNA.priceRanges.dresses.min} - $${userProfile.styleDNA.priceRanges.dresses.max}
- Price Range (Shoes): $${userProfile.styleDNA.priceRanges.shoes.min} - $${userProfile.styleDNA.priceRanges.shoes.max}
- Never Again List: ${userProfile.styleDNA.neverAgainList.join(", ") || "None"}

Flattery Preferences:
- Favorite Features to Show: ${userProfile.flatteryMap.favoriteBodyParts.join(", ")}
- Areas to Minimize: ${userProfile.flatteryMap.minimizeBodyParts.join(", ")}
- Loved Necklines: ${userProfile.flatteryMap.necklinePreferences.loved.join(", ")}
- Avoid Necklines: ${userProfile.flatteryMap.necklinePreferences.avoid.join(", ")}
- Preferred Dress Length: ${userProfile.flatteryMap.lengthPreferences.dresses}
- Sleeve Preference: ${userProfile.flatteryMap.lengthPreferences.sleeves}
- Waist Definition: ${userProfile.flatteryMap.waistDefinition}

Color Preferences:
- Best Colors: ${userProfile.colorPreferences.complimentColors.join(", ")}
- Avoid Colors: ${userProfile.colorPreferences.avoidColors.join(", ")}
- Metal Preference: ${userProfile.colorPreferences.metalPreference}
- Pattern Tolerance: ${userProfile.colorPreferences.patternTolerance}

Comfort Limits:
- Strapless OK: ${userProfile.comfortLimits.straplessOk ? "Yes" : "No"}
- Max Heel Height: ${userProfile.comfortLimits.maxHeelHeight} inches
- Shapewear: ${userProfile.comfortLimits.shapewearTolerance}

Temperature Preferences:
- Runs Hot: ${userProfile.temperatureProfile.runsHot ? "Yes" : "No"}
- Runs Cold: ${userProfile.temperatureProfile.runsCold ? "Yes" : "No"}
- Needs Layers: ${userProfile.temperatureProfile.needsLayers ? "Yes" : "No"}

EVENT DETAILS:
=============
- Type: ${event.eventType} ${event.customEventType ? `(${event.customEventType})` : ""}
- Dress Code: ${event.dressCode}
- Location: ${event.location.city}, ${event.location.state}${event.location.venue ? ` at ${event.location.venue}` : ""}
- Date & Time: ${event.dateTime.toDate().toLocaleDateString()}
- Client's Role: ${event.userRole}
- Activity Level: ${event.activityLevel}
${
  event.weather
    ? `- Weather: ${event.weather.temperature}°F, ${event.weather.conditions}, ${event.weather.humidity}% humidity`
    : ""
}

CLOSET ITEMS AVAILABLE:
======================
${closetItems.length > 0 ? closetItems.map((item, i) => `${i + 1}. ${item.category.toUpperCase()}: ${item.brand || "No brand"}
   Colors: ${item.aiAnalysis.color.join(", ")}
   Style: ${item.aiAnalysis.style.join(", ")}
   Suitable for: ${item.aiAnalysis.occasion.join(", ")}
   ID: ${item.id}`).join("\n\n") : "No closet items available"}

AVAILABLE PRODUCTS TO PURCHASE:
===============================
${availableProducts.slice(0, 20).map((product, i) => `${i + 1}. ${product.category.toUpperCase()}: ${product.name} by ${product.brand}
   Price: $${product.price}
   Colors: ${product.colors.join(", ")}
   Style: ${product.style.join(", ")}
   Retailer: ${product.retailer}
   ID: ${product.id}`).join("\n\n")}

TASK:
=====
Generate 5 complete outfit recommendations that are perfect for this event and client.

For each outfit, provide:
1. **Dress** (from closet or purchase) - Must fit dress code and weather
2. **Shoes** (from closet or purchase) - Consider activity level and heel height limits
3. **Bag** (from closet or purchase) - Should complement the outfit
4. **Jewelry** (1-3 pieces) - Match metal preference and style
5. **Outerwear** (optional) - Only if weather requires it

For EACH item in the outfit:
- If using a closet item, reference it by ID
- If recommending a purchase, reference the product by ID
- Explain WHY this item works for the client

For EACH complete outfit provide:
- **Flattery Notes**: 3-5 specific reasons why this outfit flatters the client's body and preferences
- **Dress Code Fit**: How this outfit meets the dress code requirements
- **Style Match**: How this outfit aligns with the client's style DNA
- **Weather Appropriate**: How this outfit works for the weather conditions
- **Confidence Score**: 0-100 rating of how well this outfit matches all requirements

IMPORTANT RULES:
- Respect all "never again" items and avoided necklines/colors
- Stay within price ranges
- Honor comfort limits (heel height, strapless, etc.)
- Prioritize flattering the favorite features and minimizing the areas to downplay
- Consider the activity level (no 5-inch heels for "active" events!)
- Match the formality of the dress code

Return your response as a JSON array with this structure:
[
  {
    "outfitNumber": 1,
    "dress": {
      "isClosetItem": boolean,
      "itemId": "string (closet ID or product ID)",
      "productName": "string",
      "reason": "string (why this works)"
    },
    "shoes": { /* same structure */ },
    "bag": { /* same structure */ },
    "jewelry": [
      { /* same structure, can be multiple pieces */ }
    ],
    "outerwear": { /* same structure, optional */ },
    "flatteryNotes": ["note 1", "note 2", ...],
    "dressCodeFit": "explanation",
    "styleMatch": "explanation",
    "weatherAppropriate": "explanation",
    "confidenceScore": number
  },
  // ... 4 more outfits
]

Make sure the JSON is valid and parseable!`;
}

/**
 * Build a simplified prompt for quick recommendations (cheaper)
 */
export function buildQuickRecommendationPrompt(
  event: Event,
  userProfile: UserProfile
): string {
  return `As a personal stylist, suggest 3 outfit types perfect for a ${event.dressCode} ${event.eventType}.

Client style: ${userProfile.styleDNA.styleWords.join(", ")}
Favorite features: ${userProfile.flatteryMap.favoriteBodyParts.join(", ")}
Preferred colors: ${userProfile.colorPreferences.complimentColors.join(", ")}
Budget: $${userProfile.styleDNA.priceRanges.dresses.min}-${userProfile.styleDNA.priceRanges.dresses.max}

Provide brief recommendations in JSON format:
[
  {
    "style": "outfit style name",
    "description": "2-3 sentences",
    "keyPieces": ["dress type", "shoe type", "accessories"]
  }
]`;
}
