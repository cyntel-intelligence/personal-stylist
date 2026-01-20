import type { UserProfile, Event, ClosetItem } from "@/types";
import { sanitizeStringArray, sanitizeUserInput } from "@/lib/validation/schemas";

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

// Complete list of brands available on Fashion Pass clothing rental
export const FASHION_PASS_BRANDS = [
  // A
  "8 Other Reasons",
  "Alias Mae",
  "Amanda Uprichard",
  "AMUR",
  "Araminta James",
  "ASTR The Label",
  // B
  "B-Six",
  "Bananhot",
  "Bardot",
  "BB Dakota",
  "Beach Riot",
  "BILLINI",
  "BlankNYC",
  // C
  "Callahan",
  "Commando",
  // E
  "East N West",
  "Elliatt",
  "Elodie",
  "Être Aimé",
  // F
  "Faithfull The Brand",
  "Favorite Daughter",
  "For Love & Lemons",
  "Frasier Sterling",
  "Free People",
  // G
  "Good American",
  // H
  "Hemant & Nandita",
  "House Of Sunny",
  // J
  "Jeffrey Campbell",
  "Jenny Bird",
  "Jet Set Diaries",
  // K
  "Katie May",
  // L
  "Levi's",
  "Line & Dot",
  "LoveShackFancy",
  "Lucy Paris",
  "Luv Aj",
  // M
  "Majorelle",
  // N
  "NIA",
  "Nonchalant Label",
  // O
  "Olga Berg",
  // P
  "Petit Moments",
  "Privacy Please",
  // R
  "Rebecca Minkoff",
  "Rocco Sand",
  "Rolla's",
  "Rue Sophie",
  // S
  "Saylor",
  "Schutz",
  "Selkie",
  "SHASHI",
  "Show Me Your Mumu",
  "Significant Other",
  "Song of Style",
  "Sovere",
  "Steve Madden",
  "STILLWATER",
  "Stuart Weitzman",
  // T
  "Tony Bianco",
  // V
  "Velvet Torch",
  // W
  "Wildfox",
  // Y
  "Year of Ours",
  "Yumi Kim",
] as const;

export type FashionPassBrand = typeof FASHION_PASS_BRANDS[number];

/**
 * Build a comprehensive prompt for outfit recommendations
 * Sanitizes all user inputs to prevent prompt injection attacks
 */
export function buildRecommendationPrompt(
  event: Event,
  userProfile: UserProfile,
  closetItems: ClosetItem[],
  availableProducts: Product[]
): string {
  // Sanitize user-controlled inputs to prevent prompt injection
  const sanitizedStyleWords = sanitizeStringArray(userProfile.styleDNA.styleWords);
  const sanitizedLovedBrands = sanitizeStringArray(userProfile.styleDNA.lovedBrands || []);
  const sanitizedNeverAgain = sanitizeStringArray(userProfile.styleDNA.neverAgainList);

  // New profile data sections
  const measurements = userProfile.profile.measurements;
  const bodyShape = userProfile.profile.bodyShape;
  const visualStyle = userProfile.visualStyleQuiz;
  const lifestyle = userProfile.lifestyleProfile;
  const fabricPrefs = userProfile.fabricPreferences;

  return `You are an expert personal stylist helping a client find the perfect outfit for an upcoming event.

CLIENT PROFILE:
==============
Physical Attributes:
- Height: ${userProfile.profile.height} inches (${Math.floor(userProfile.profile.height / 12)}' ${userProfile.profile.height % 12}")
- Dress Size: ${userProfile.profile.sizes.dress}
- Top Size: ${userProfile.profile.sizes.tops}
- Bottom Size: ${userProfile.profile.sizes.bottoms}
- Denim Waist: ${userProfile.profile.sizes.denim}
${userProfile.profile.sizes.bra ? `- Bra Size: ${userProfile.profile.sizes.bra}` : ""}
- Fit Preference: ${sanitizeUserInput(userProfile.profile.fitPreference)}
${bodyShape ? `- Body Shape: ${bodyShape}` : ""}

${measurements ? `Body Measurements:
${measurements.bust ? `- Bust: ${measurements.bust} inches` : ""}
${measurements.waist ? `- Waist: ${measurements.waist} inches` : ""}
${measurements.hips ? `- Hips: ${measurements.hips} inches` : ""}
${measurements.inseam ? `- Inseam: ${measurements.inseam} inches` : ""}
${measurements.shoulderWidth ? `- Shoulder Width: ${measurements.shoulderWidth} inches` : ""}
` : ""}

${visualStyle ? `Visual Style Profile (from style quiz):
- Primary Style: ${visualStyle.styleProfile.primary}
${visualStyle.styleProfile.secondary ? `- Secondary Style: ${visualStyle.styleProfile.secondary}` : ""}
- Style Confidence: ${visualStyle.styleProfile.confidence}%
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
- Work Environment: ${lifestyle.workEnvironment}${lifestyle.workDressCode ? ` (${sanitizeUserInput(lifestyle.workDressCode)})` : ""}
- Social Style: ${lifestyle.socialLifestyle}
- Typical Occasions: ${sanitizeStringArray(lifestyle.typicalOccasions).join(", ") || "Various"}
- Climate: ${lifestyle.climate}
${lifestyle.location?.city ? `- Location: ${sanitizeUserInput(lifestyle.location.city)}${lifestyle.location.state ? `, ${sanitizeUserInput(lifestyle.location.state)}` : ""}` : ""}
` : ""}

${fabricPrefs ? `Fabric Preferences:
- Loved Fabrics: ${sanitizeStringArray(fabricPrefs.lovedFabrics).join(", ") || "No preference"}
- Avoid Fabrics: ${sanitizeStringArray(fabricPrefs.avoidFabrics).join(", ") || "None"}
- Sensitivities: ${sanitizeStringArray(fabricPrefs.sensitivities).join(", ") || "None"}
- Care Preference: ${fabricPrefs.carePreference}
- Eco-Friendly Priority: ${fabricPrefs.ecoFriendly ? "Yes - prioritize sustainable options" : "No specific preference"}
` : ""}

Flattery Preferences:
- Favorite Features to Show: ${sanitizeStringArray(userProfile.flatteryMap.favoriteBodyParts).join(", ")}
- Areas to Minimize: ${sanitizeStringArray(userProfile.flatteryMap.minimizeBodyParts).join(", ")}
- Loved Necklines: ${sanitizeStringArray(userProfile.flatteryMap.necklinePreferences.loved).join(", ")}
- Avoid Necklines: ${sanitizeStringArray(userProfile.flatteryMap.necklinePreferences.avoid).join(", ")}
- Preferred Dress Length: ${sanitizeUserInput(userProfile.flatteryMap.lengthPreferences.dresses)}
- Sleeve Preference: ${sanitizeUserInput(userProfile.flatteryMap.lengthPreferences.sleeves)}
- Waist Definition: ${sanitizeUserInput(userProfile.flatteryMap.waistDefinition)}

Color Preferences:
- Best Colors: ${sanitizeStringArray(userProfile.colorPreferences.complimentColors).join(", ")}
- Avoid Colors: ${sanitizeStringArray(userProfile.colorPreferences.avoidColors).join(", ")}
- Metal Preference: ${sanitizeUserInput(userProfile.colorPreferences.metalPreference)}
- Pattern Tolerance: ${sanitizeUserInput(userProfile.colorPreferences.patternTolerance)}

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
- Type: ${sanitizeUserInput(event.eventType)} ${event.customEventType ? `(${sanitizeUserInput(event.customEventType)})` : ""}
- Dress Code: ${sanitizeUserInput(event.dressCode)}
- Location: ${sanitizeUserInput(event.location.city)}, ${sanitizeUserInput(event.location.state)}${event.location.venue ? ` at ${sanitizeUserInput(event.location.venue)}` : ""}
- Date & Time: ${event.dateTime.toDate().toLocaleDateString()}
- Client's Role: ${sanitizeUserInput(event.userRole)}
- Activity Level: ${sanitizeUserInput(event.activityLevel)}
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

${event.requirements?.shopOnlyMode ? `
⚠️ SHOP ONLY MODE ACTIVE ⚠️
IMPORTANT: This user is in SHOP ONLY mode. Do NOT use any items from their closet.
All recommendations must be new items to purchase with retailer names, direct product URLs, and prices.
Focus exclusively on providing shopping recommendations.
` : ""}

AVAILABLE PRODUCTS TO PURCHASE:
===============================
${availableProducts.slice(0, 20).map((product, i) => `${i + 1}. ${product.category.toUpperCase()}: ${product.name} by ${product.brand}
   Price: $${product.price}
   Colors: ${product.colors.join(", ")}
   Style: ${product.style.join(", ")}
   Retailer: ${product.retailer}
   ID: ${product.id}`).join("\n\n")}

⭐ PREFERRED BRANDS FOR RECOMMENDATIONS ⭐
==========================================
PRIORITIZE items from these brands whenever possible:

CLOTHING BRANDS:
- AMUR (occasion dresses, elegant pieces)
- Amanda Uprichard (sophisticated blouses, dresses)
- ASTR The Label (trendy dresses, tops, jumpsuits)
- Bardot (feminine dresses, occasion wear)
- BB Dakota (casual to dressy, versatile pieces)
- BlankNYC (denim, leather jackets, edgy pieces)
- Callahan (knitwear, sweaters, basics)
- Commando (bodysuits, layering pieces)
- Elliatt (special occasion dresses, architectural designs)
- Elodie (feminine tops, dresses)
- Être Aimé (romantic dresses, blouses)
- Faithfull The Brand (bohemian dresses, vacation wear)
- Favorite Daughter (elevated basics, denim)
- For Love & Lemons (romantic, lacy dresses, feminine pieces)
- Free People (bohemian, flowy dresses, eclectic style)
- Good American (inclusive sizing, denim, bodysuits)
- Hemant & Nandita (bold prints, vacation dresses)
- House Of Sunny (trendy, statement pieces)
- Jet Set Diaries (boho-chic dresses, vacation wear)
- Katie May (evening gowns, special occasion)
- Levi's (classic denim, jackets)
- Line & Dot (feminine dresses, contemporary style)
- LoveShackFancy (ultra-feminine, floral dresses)
- Lucy Paris (feminine blouses, work-to-weekend pieces)
- Majorelle (vacation dresses, bold prints)
- NIA (sustainable basics, loungewear)
- Nonchalant Label (edgy, modern pieces)
- Privacy Please (trendy dresses, going-out tops)
- Rocco Sand (resort wear, bold prints)
- Rolla's (vintage-inspired denim)
- Rue Sophie (sophisticated separates)
- Saylor (lace dresses, special occasion)
- Selkie (whimsical, romantic dresses)
- Show Me Your Mumu (bohemian dresses, bridesmaid, casual)
- Significant Other (Australian contemporary, elegant pieces)
- Song of Style (influencer-designed, trendy pieces)
- Sovere (minimalist, elevated basics)
- STILLWATER (beachy, relaxed California style)
- Velvet Torch (feminine tops, dresses)
- Wildfox (graphic tees, loungewear, casual)
- Year of Ours (athletic, athleisure)
- Yumi Kim (bold prints, wrap dresses)

SHOES:
- Alias Mae (modern heels, boots)
- BILLINI (trendy heels, sandals)
- Jeffrey Campbell (statement shoes, boots)
- Schutz (elegant heels, sandals)
- Steve Madden (versatile footwear)
- Stuart Weitzman (luxury heels, boots)
- Tony Bianco (Australian heels, trendy styles)

ACCESSORIES & JEWELRY:
- 8 Other Reasons (statement jewelry, hair accessories)
- Araminta James (bags, accessories)
- B-Six (nipple covers, intimates)
- Bananhot (swimwear, resort accessories)
- Beach Riot (swimwear, activewear)
- Frasier Sterling (delicate jewelry, layering pieces)
- Jenny Bird (bold statement jewelry)
- Luv Aj (trendy jewelry, hoops, layered necklaces)
- Olga Berg (evening bags, clutches)
- Petit Moments (dainty jewelry, accessories)
- Rebecca Minkoff (handbags, accessories)
- SHASHI (beaded jewelry, bracelets)

RETAILERS TO USE FOR PRODUCT LINKS:
When recommending items from the above brands, provide direct links to these retailers:
- Brand's official website (e.g., forloveandlemons.com, showmeyourmumu.com)
- Revolve (revolve.com) - carries most of these brands
- Nordstrom (nordstrom.com)
- Shopbop (shopbop.com)
- ASOS (asos.com)
- Dillard's (dillards.com)
- Bloomingdale's (bloomingdales.com)
- Saks Fifth Avenue (saksfifthavenue.com)
- Neiman Marcus (neimanmarcus.com)
- Free People (freepeople.com)
- Anthropologie (anthropologie.com)
- Zara (zara.com)

Always provide direct product URLs to the specific item on one of these retailer sites.

⚠️ CRITICAL: CURRENT ITEMS ONLY ⚠️
===================================
You MUST only recommend items that are:
1. **CURRENT SEASON** - Only recommend items from Fall/Winter 2025, Spring/Summer 2026, or newer collections
2. **CURRENTLY IN STOCK** - Only recommend items that are likely still available for purchase
3. **ACTIVE PRODUCT LINKS** - Use current, valid URLs from the retailers listed above

DO NOT recommend:
- Items from past seasons (Spring 2025 or earlier)
- Discontinued styles or limited edition items that have sold out
- Archive or vintage pieces unless specifically requested
- Items with outdated URLs or product pages that no longer exist
- Clearance items that are likely out of stock
- "Coming soon" or pre-order items unless the event date is far enough out

When in doubt, recommend:
- Core/staple pieces that brands keep in rotation
- Current bestsellers and new arrivals
- Classic silhouettes in current colorways
- Items from the brand's main collection (not limited drops)

TASK:
=====
Generate ONE comprehensive outfit recommendation with multiple alternatives per item category.

ITEM CATEGORIES TO CONSIDER:
- Dress (formal dress or cocktail dress)
- Tops (blouses, shirts, sweaters)
- Bottoms (pants, skirts, shorts)
- Jackets (blazers, cardigans, structured jackets)
- Shoes
- Bags
- Jewelry (necklaces, earrings, bracelets)
- Accessories (scarves, belts, hats)
- Outerwear (coats, wraps, only if weather requires)

CRITICAL REQUIREMENTS:

1. **DRESS vs SEPARATES - You MUST provide BOTH options:**
   - Include 2-3 dress alternatives (different styles/price points)
   - Include 2-3 top alternatives AND 2-3 bottom alternatives
   - User will choose between wearing a dress OR separates (top + bottom)
   - Make sure tops and bottoms coordinate well together

2. **ALTERNATIVES PER CATEGORY:**
   For each item category you include, provide:
   - 1 primary recommendation (your top choice)
   - 1-2 alternatives (different price points or styles)
   - Each alternative should be a viable option on its own

3. **SMART CATEGORY SELECTION:**
   Based on the event type, dress code, and weather:
   - Decide which categories are essential (e.g., shoes always needed)
   - Decide which are optional (e.g., jewelry for casual vs. formal)
   - Include 6-10 total categories
   - Jackets/blazers for work events, outerwear for cold weather only

4. **PRICE DIVERSITY:**
   Within alternatives for each category, vary price points:
   - Primary: Best value/style match
   - Alternative 1: Budget-friendly option
   - Alternative 2: Premium/luxury option

5. **COORDINATION:**
   - Ensure shoes, bags, and accessories work with BOTH dress and separates options
   - Make sure all tops coordinate with all bottoms
   - Consider color coordination across all pieces

For EACH item (primary and alternatives):
- If using a closet item, reference it by ID
- If recommending a purchase:
  * Provide the retailer name (e.g., Nordstrom, ASOS, Bloomingdale's, Revolve, Saks Fifth Avenue)
  * Provide a direct product URL to the specific item (use your knowledge of current 2026 product catalogs)
  * Provide an estimated price
  * Provide a product image URL (use best-effort placeholder or retailer image)
  * Explain WHY this specific item works for the client
- For purchase items, use real retailers and generate best-effort product links to actual products

IMPORTANT RULES:
- **ONLY CURRENT, IN-STOCK ITEMS** - Never recommend sold out, discontinued, or past-season items
- Respect all "never again" items and avoided necklines/colors
- Stay within price ranges for each category
- Honor comfort limits (heel height, strapless, shapewear tolerance)
- Prioritize flattering the favorite features and minimizing the areas to downplay
- Consider the activity level (no 5-inch heels for "active" events!)
- Match the formality of the dress code

BODY-SPECIFIC GUIDANCE:
- **Body Shape**: If provided, use body shape to recommend the most flattering silhouettes:
  * Hourglass: Fitted waists, wrap styles, figure-hugging pieces
  * Pear: A-line skirts, structured shoulders, boat necklines
  * Apple: Empire waists, flowing fabrics, V-necks
  * Rectangle: Peplums, belted styles, ruffles to create curves
  * Inverted Triangle: Flared skirts, detailed bottoms, soft shoulders
- **Measurements**: Use bust/waist/hip measurements to recommend proper fit and proportions
- **Visual Style Quiz**: Weight the primary style heavily in recommendations

FABRIC RULES:
- NEVER recommend avoided fabrics or materials with noted sensitivities
- Prioritize loved fabrics when possible
- If eco-friendly is marked, highlight sustainable brands and materials
- Match fabric weight to climate and season
- Consider care preferences (no dry-clean-only for machine-wash-preferred users)

LIFESTYLE CONTEXT:
- Consider work environment when recommending day-to-night versatility
- Match social style to formality recommendations
- Use climate data to recommend appropriate weights and layers
- Reference typical occasions to ensure outfit versatility

Return your response as JSON with this structure:
{
  "outfitItems": [
    {
      "category": "dress",
      "primary": {
        "isClosetItem": boolean,
        "itemId": "string (closet ID or product ID)",
        "productName": "string",
        "retailer": "string (retailer name, only for purchase items)",
        "productLink": "string (direct product URL, only for purchase items)",
        "price": number (estimated price for purchase items),
        "imageUrl": "string (product image URL)",
        "reason": "string (why this specific item works)"
      },
      "alternatives": [
        { /* Same structure as primary - Alternative dress option 1 */ },
        { /* Same structure as primary - Alternative dress option 2 */ }
      ],
      "categoryReason": "Dress option for elegant cocktail party - provides polished, formal look"
    },
    {
      "category": "tops",
      "primary": { /* Top recommendation */ },
      "alternatives": [ /* 1-2 alternative tops */ ],
      "categoryReason": "Separates option - pairs with bottoms below for versatile styling"
    },
    {
      "category": "bottoms",
      "primary": { /* Bottom recommendation */ },
      "alternatives": [ /* 1-2 alternative bottoms */ ],
      "categoryReason": "Separates option - coordinates with tops above"
    },
    {
      "category": "shoes",
      "primary": { /* Shoe recommendation */ },
      "alternatives": [ /* 1-2 alternative shoes */ ],
      "categoryReason": "Works with both dress and separates options"
    },
    {
      "category": "bags",
      "primary": { /* Bag recommendation */ },
      "alternatives": [ /* 1-2 alternative bags */ ],
      "categoryReason": "Complements the overall outfit aesthetic"
    },
    {
      "category": "jewelry",
      "primary": { /* Jewelry recommendation - can be a set with multiple pieces */ },
      "alternatives": [ /* 1-2 alternative jewelry options */ ],
      "categoryReason": "Adds finishing touches without overwhelming the outfit"
    }
    // ... more categories as appropriate (jackets, accessories, outerwear)
  ],
  "hasDressOption": true,
  "hasSeparatesOption": true,
  "overallReasoning": {
    "flatteryNotes": ["note 1", "note 2", "note 3", "note 4", "note 5"],
    "dressCodeFit": "explanation of how outfit meets dress code",
    "styleMatch": "explanation of how outfit aligns with style DNA",
    "weatherAppropriate": "explanation of weather suitability",
    "confidenceScore": number (0-100)
  }
}

IMPORTANT: For all purchase items (isClosetItem: false), you MUST include:
- retailer: The retailer name (e.g., "Nordstrom", "ASOS", "Bloomingdale's")
- productLink: A direct URL to the specific product page
- price: The estimated price in USD
- imageUrl: A product image URL (use best-effort placeholder or actual image)

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
