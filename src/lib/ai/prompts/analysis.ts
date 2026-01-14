/**
 * Build a prompt for analyzing closet item images
 */
export function buildItemAnalysisPrompt(): string {
  return `Analyze this fashion item image and provide detailed information.

Identify and extract:
1. **Category**: The main category (dress, shoes, bag, outerwear, or jewelry)
2. **Subcategory**: More specific type (e.g., "midi dress", "heels", "clutch", "blazer", "necklace")
3. **Colors**: List all visible colors (primary color first, then accents)
4. **Style Descriptors**: 5-7 adjectives that describe the style (e.g., classic, modern, edgy, romantic, minimalist, glamorous, casual, elegant, bohemian, preppy, vintage, trendy)
5. **Pattern**: Describe any patterns (solid, floral, geometric, striped, polka dot, animal print, abstract, etc.) or "none" if solid
6. **Suitable Occasions**: Which events would this be appropriate for (formal, semi-formal, cocktail, casual, work, date night, weekend, vacation)
7. **Seasonal Appropriateness**: Which seasons is this best for (spring, summer, fall, winter, all-season)
8. **Key Features**: Notable design elements (e.g., "v-neckline", "cap sleeves", "midi length", "pointed toe", "chain strap", "gold hardware")

Return your analysis as valid JSON in this exact format:
{
  "category": "string",
  "subcategory": "string",
  "color": ["color1", "color2", ...],
  "style": ["style1", "style2", ...],
  "pattern": "string",
  "occasion": ["occasion1", "occasion2", ...],
  "season": ["season1", "season2", ...],
  "keyFeatures": ["feature1", "feature2", ...]
}

Be specific and accurate. Focus on what would help match this item with outfits and user preferences.`;
}

/**
 * Build a prompt for analyzing multiple outfit photos for comparison
 */
export function buildOutfitComparisonPrompt(numOutfits: number): string {
  return `You are a professional stylist reviewing ${numOutfits} different outfit options that a client is considering.

For each outfit image provided:
1. Assess the overall fit (does it appear to fit well, or are there issues like pulling, gaping, too tight, too loose?)
2. Evaluate the style coherence (do all pieces work together?)
3. Identify specific issues (neckline gaping, dress too short/long, heels too high, colors clashing, etc.)
4. Note what works well (flattering fit, good color combination, appropriate accessories, etc.)
5. Provide improvement suggestions (hem the dress, try different shoes, add a belt, remove a layer, different jewelry, etc.)

After analyzing all outfits, rank them from best to worst (1 being the best).

Return your analysis as valid JSON:
{
  "outfits": [
    {
      "outfitNumber": 1,
      "rank": number,
      "fitAssessment": "detailed fit analysis",
      "styleNotes": ["note 1", "note 2", ...],
      "issues": ["issue 1", "issue 2", ...],
      "whatWorks": ["positive 1", "positive 2", ...],
      "suggestions": ["suggestion 1", "suggestion 2", ...]
    },
    // ... more outfits
  ],
  "winner": {
    "outfitNumber": number,
    "reasoning": "why this outfit is the best choice",
    "comparativeAnalysis": "how it compares to the others"
  }
}

Be honest and constructive. The goal is to help the client look their best!`;
}

/**
 * Build a prompt for analyzing user photos for virtual try-on
 */
export function buildBodyAnalysisPrompt(): string {
  return `Analyze these photos of the client to understand their body type and measurements for styling purposes.

Based on the images provided (front, side, and back views):
1. Estimate body type/shape (hourglass, pear, apple, rectangle, inverted triangle)
2. Identify key proportions (shoulder width relative to hips, torso length, leg length)
3. Note any specific features that would affect fit (broader shoulders, fuller bust, defined waist, wider hips, etc.)
4. Suggest style recommendations based on body type

Return as JSON:
{
  "bodyType": "string",
  "proportions": {
    "shoulderToHipRatio": "wider/balanced/narrower",
    "torsoLength": "short/average/long",
    "legLength": "short/average/long"
  },
  "features": ["feature1", "feature2", ...],
  "styleRecommendations": ["rec1", "rec2", ...]
}

Be professional and focus on styling guidance, not judgmental assessments.`;
}

/**
 * Build a prompt for suggesting complementary items
 */
export function buildComplementaryItemsPrompt(itemDescription: string, category: string): string {
  return `Given this ${category}: "${itemDescription}"

Suggest complementary items that would pair well with it:
- If it's a dress: suggest shoes, bags, jewelry, and outerwear
- If it's shoes: suggest dress styles and accessories
- If it's a bag: suggest outfit styles that work with it
- If it's jewelry: suggest outfits and occasions

Return as JSON:
{
  "suggestions": {
    "dresses": ["suggestion1", "suggestion2", ...],
    "shoes": ["suggestion1", "suggestion2", ...],
    "bags": ["suggestion1", "suggestion2", ...],
    "jewelry": ["suggestion1", "suggestion2", ...],
    "outerwear": ["suggestion1", "suggestion2", ...]
  },
  "occasions": ["occasion1", "occasion2", ...],
  "stylingTips": ["tip1", "tip2", ...]
}`;
}
