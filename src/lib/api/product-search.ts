/**
 * Product Search Service
 * Integrates with real product APIs to fetch actual, in-stock items
 */

import { ItemCategory } from "@/types/recommendation";

export interface ProductSearchResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  category: ItemCategory;
  colors?: string[];
  sizes?: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ProductSearchQuery {
  query: string;
  category?: ItemCategory;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  colors?: string[];
  limit?: number;
}

export interface ProductSearchResponse {
  products: ProductSearchResult[];
  totalResults: number;
  source: string;
}

// Supported API providers
type ApiProvider = "serpapi" | "shopstyle" | "rapidapi";

/**
 * Search for products using Google Shopping via SerpAPI
 * This provides real, current products with valid URLs
 */
async function searchWithSerpApi(query: ProductSearchQuery): Promise<ProductSearchResponse> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_KEY not configured");
  }

  const searchQuery = buildSearchQuery(query);
  const params = new URLSearchParams({
    api_key: apiKey,
    engine: "google_shopping",
    q: searchQuery,
    num: String(query.limit || 10),
    gl: "us",
    hl: "en",
  });

  // Add price filters if specified
  if (query.minPrice || query.maxPrice) {
    const priceFilter = `price:${query.minPrice || 0},${query.maxPrice || 10000}`;
    params.append("tbs", priceFilter);
  }

  const response = await fetch(`https://serpapi.com/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`SerpAPI request failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    products: (data.shopping_results || []).map((item: any) => ({
      id: item.product_id || `serp-${Date.now()}-${Math.random()}`,
      name: item.title,
      brand: extractBrand(item.title, item.source),
      price: parsePrice(item.price),
      originalPrice: item.old_price ? parsePrice(item.old_price) : undefined,
      imageUrl: item.thumbnail,
      productUrl: item.link,
      retailer: item.source,
      category: query.category || "dress",
      inStock: true, // Google Shopping only shows in-stock items
      rating: item.rating,
      reviewCount: item.reviews,
    })),
    totalResults: data.shopping_results?.length || 0,
    source: "serpapi",
  };
}

/**
 * Search for products using ShopStyle Collective API
 * Great for fashion-specific searches with affiliate links
 */
async function searchWithShopStyle(query: ProductSearchQuery): Promise<ProductSearchResponse> {
  const apiKey = process.env.SHOPSTYLE_API_KEY;

  if (!apiKey) {
    throw new Error("SHOPSTYLE_API_KEY not configured");
  }

  const searchQuery = buildSearchQuery(query);
  const params = new URLSearchParams({
    pid: apiKey,
    fts: searchQuery,
    limit: String(query.limit || 10),
    cat: mapCategoryToShopStyle(query.category),
  });

  if (query.minPrice) {
    params.append("priceLo", String(query.minPrice));
  }
  if (query.maxPrice) {
    params.append("priceHi", String(query.maxPrice));
  }

  const response = await fetch(`https://api.shopstyle.com/api/v2/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`ShopStyle API request failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    products: (data.products || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      brand: item.brand?.name || "Unknown",
      price: item.price,
      originalPrice: item.originalPrice,
      imageUrl: item.image?.sizes?.Large?.url || item.image?.sizes?.Medium?.url,
      productUrl: item.clickUrl,
      retailer: item.retailer?.name || "Unknown",
      category: query.category || "dress",
      colors: item.colors?.map((c: any) => c.name),
      sizes: item.sizes?.map((s: any) => s.name),
      inStock: item.inStock !== false,
    })),
    totalResults: data.metadata?.total || 0,
    source: "shopstyle",
  };
}

/**
 * Search using RapidAPI fashion endpoints
 * Fallback option with multiple fashion API providers
 */
async function searchWithRapidApi(query: ProductSearchQuery): Promise<ProductSearchResponse> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY not configured");
  }

  const searchQuery = buildSearchQuery(query);

  // Using ASOS API via RapidAPI as it has good fashion coverage
  const response = await fetch(
    `https://asos2.p.rapidapi.com/products/v2/list?store=US&offset=0&categoryId=4209&limit=${query.limit || 10}&q=${encodeURIComponent(searchQuery)}`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "asos2.p.rapidapi.com",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`RapidAPI request failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    products: (data.products || []).map((item: any) => ({
      id: String(item.id),
      name: item.name,
      brand: item.brandName || "ASOS",
      price: item.price?.current?.value || 0,
      originalPrice: item.price?.previous?.value,
      imageUrl: `https://${item.imageUrl}`,
      productUrl: `https://www.asos.com/us/prd/${item.id}`,
      retailer: "ASOS",
      category: query.category || "dress",
      inStock: item.isInStock !== false,
    })),
    totalResults: data.itemCount || 0,
    source: "rapidapi",
  };
}

/**
 * Main search function - tries multiple providers with fallback
 */
export async function searchProducts(
  query: ProductSearchQuery,
  preferredProvider?: ApiProvider
): Promise<ProductSearchResponse> {
  const providers: ApiProvider[] = preferredProvider
    ? [preferredProvider, "serpapi", "shopstyle", "rapidapi"]
    : ["serpapi", "shopstyle", "rapidapi"];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      switch (provider) {
        case "serpapi":
          if (process.env.SERPAPI_KEY) {
            return await searchWithSerpApi(query);
          }
          break;
        case "shopstyle":
          if (process.env.SHOPSTYLE_API_KEY) {
            return await searchWithShopStyle(query);
          }
          break;
        case "rapidapi":
          if (process.env.RAPIDAPI_KEY) {
            return await searchWithRapidApi(query);
          }
          break;
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`Provider ${provider} failed:`, error);
      continue;
    }
  }

  // If all providers fail, return empty results
  console.error("All product search providers failed:", lastError);
  return {
    products: [],
    totalResults: 0,
    source: "none",
  };
}

/**
 * Search for products matching AI-generated criteria
 */
export async function searchProductsByCriteria(criteria: {
  category: ItemCategory;
  style: string;
  colors?: string[];
  priceRange: { min: number; max: number };
  occasion?: string;
  features?: string[];
}): Promise<ProductSearchResult[]> {
  // Build a natural search query from the criteria
  const queryParts: string[] = [];

  // Add style descriptors
  if (criteria.style) {
    queryParts.push(criteria.style);
  }

  // Add colors
  if (criteria.colors && criteria.colors.length > 0) {
    queryParts.push(criteria.colors[0]); // Use primary color
  }

  // Add category-specific terms
  const categoryTerms = getCategorySearchTerms(criteria.category);
  queryParts.push(categoryTerms);

  // Add occasion if specified
  if (criteria.occasion) {
    queryParts.push(criteria.occasion);
  }

  // Add features
  if (criteria.features && criteria.features.length > 0) {
    queryParts.push(...criteria.features.slice(0, 2));
  }

  const query: ProductSearchQuery = {
    query: queryParts.join(" "),
    category: criteria.category,
    minPrice: criteria.priceRange.min,
    maxPrice: criteria.priceRange.max,
    colors: criteria.colors,
    limit: 5, // Get top 5 results per category
  };

  const response = await searchProducts(query);
  return response.products;
}

/**
 * Batch search for multiple categories
 */
export async function searchMultipleCategories(
  searches: Array<{
    category: ItemCategory;
    criteria: {
      style: string;
      colors?: string[];
      priceRange: { min: number; max: number };
      occasion?: string;
      features?: string[];
    };
  }>
): Promise<Record<ItemCategory, ProductSearchResult[]>> {
  const results: Record<string, ProductSearchResult[]> = {};

  // Execute searches in parallel
  await Promise.all(
    searches.map(async ({ category, criteria }) => {
      const products = await searchProductsByCriteria({
        category,
        ...criteria,
      });
      results[category] = products;
    })
  );

  return results as Record<ItemCategory, ProductSearchResult[]>;
}

// Helper functions

function buildSearchQuery(query: ProductSearchQuery): string {
  const parts: string[] = [query.query];

  if (query.brands && query.brands.length > 0) {
    parts.push(query.brands[0]); // Add primary brand
  }

  if (query.colors && query.colors.length > 0) {
    parts.push(query.colors[0]); // Add primary color
  }

  return parts.join(" ");
}

function extractBrand(title: string, retailer: string): string {
  // Common brand patterns in product titles
  const brandPatterns = [
    /^([A-Z][a-z]+ [A-Z][a-z]+)/,  // "Kate Spade" at start
    /^([A-Z]+)/,                     // "ASOS" at start
    /by ([A-Z][a-zA-Z\s]+)/,        // "by Michael Kors"
  ];

  for (const pattern of brandPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return retailer || "Unknown";
}

function parsePrice(priceStr: string | number): number {
  if (typeof priceStr === "number") return priceStr;

  // Remove currency symbols and parse
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

function mapCategoryToShopStyle(category?: ItemCategory): string {
  const mapping: Record<ItemCategory, string> = {
    dress: "dresses",
    tops: "tops",
    bottoms: "bottoms",
    jackets: "jackets",
    shoes: "shoes",
    bags: "bags",
    jewelry: "jewelry",
    accessories: "accessories",
    outerwear: "coats",
  };
  return mapping[category || "dress"] || "womens-clothes";
}

function getCategorySearchTerms(category: ItemCategory): string {
  const terms: Record<ItemCategory, string> = {
    dress: "women's dress",
    tops: "women's top blouse",
    bottoms: "women's pants skirt",
    jackets: "women's blazer jacket",
    shoes: "women's heels shoes",
    bags: "women's handbag purse",
    jewelry: "women's jewelry necklace earrings",
    accessories: "women's accessories",
    outerwear: "women's coat outerwear",
  };
  return terms[category] || "women's clothing";
}
