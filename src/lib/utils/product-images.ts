import { ItemCategory } from "@/types/recommendation";

// Category-specific placeholder images using placehold.co
// These use elegant colors that match the luxe theme
const PLACEHOLDER_COLORS: Record<ItemCategory, { bg: string; text: string }> = {
  dress: { bg: "f8e8ee", text: "9a5467" },      // Soft blush pink
  tops: { bg: "e8f0f8", text: "546a9a" },       // Soft blue
  bottoms: { bg: "f5f0e8", text: "8a7a5a" },    // Soft tan
  jackets: { bg: "e8e8f0", text: "6a6a8a" },    // Soft lavender
  shoes: { bg: "f0e8e8", text: "8a6a6a" },      // Soft rose
  bags: { bg: "e8f0e8", text: "5a7a5a" },       // Soft sage
  jewelry: { bg: "f8f0e8", text: "9a8a5a" },    // Soft gold
  accessories: { bg: "f0f0f0", text: "707070" }, // Neutral gray
  outerwear: { bg: "e8e8e8", text: "606060" },  // Cool gray
};

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  dress: "Dress",
  tops: "Top",
  bottoms: "Bottom",
  jackets: "Jacket",
  shoes: "Shoes",
  bags: "Bag",
  jewelry: "Jewelry",
  accessories: "Accessory",
  outerwear: "Outerwear",
};

const CATEGORY_ICONS: Record<ItemCategory, string> = {
  dress: "👗",
  tops: "👚",
  bottoms: "👖",
  jackets: "🧥",
  shoes: "👠",
  bags: "👜",
  jewelry: "💎",
  accessories: "🎀",
  outerwear: "🧥",
};

/**
 * Generate a placeholder image URL for a product category
 */
export function getPlaceholderImageUrl(
  category: ItemCategory,
  width: number = 300,
  height: number = 400
): string {
  const colors = PLACEHOLDER_COLORS[category] || PLACEHOLDER_COLORS.accessories;
  const label = CATEGORY_LABELS[category] || "Item";
  return `https://placehold.co/${width}x${height}/${colors.bg}/${colors.text}?text=${encodeURIComponent(label)}`;
}

/**
 * Get the emoji icon for a category
 */
export function getCategoryIcon(category: ItemCategory): string {
  return CATEGORY_ICONS[category] || "✨";
}

/**
 * Get the display label for a category
 */
export function getCategoryLabel(category: ItemCategory): string {
  return CATEGORY_LABELS[category] || "Item";
}

/**
 * Validate if an image URL is likely valid
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== "string") return false;
  if (url.trim() === "") return false;

  // Check for common valid URL patterns
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Get the best image URL for a product, with fallback to placeholder
 */
export function getProductImageUrl(
  imageUrl: string | undefined | null,
  category: ItemCategory,
  width: number = 300,
  height: number = 400
): { url: string; isPlaceholder: boolean } {
  if (isValidImageUrl(imageUrl)) {
    return { url: imageUrl!, isPlaceholder: false };
  }
  return { url: getPlaceholderImageUrl(category, width, height), isPlaceholder: true };
}

/**
 * Get placeholder color scheme for a category
 */
export function getCategoryColors(category: ItemCategory): { bg: string; text: string } {
  return PLACEHOLDER_COLORS[category] || PLACEHOLDER_COLORS.accessories;
}
